    import { db } from "@/db/db";
    import { serviceOrdersTable, equipmentsTable } from "@/db/schema";
    import { eq, and, inArray } from "drizzle-orm";
    import { Equipment } from "../equipments/equipment.entity";
    import { EquipmentStatusEnum } from "../equipments/equipment-status.enum";
    import { ServiceOrderDetailsDTO } from "./service-order-details.dto";
    import { ServiceOrder } from "./service-order.entity";

    export class ServiceOrderRepository {

        private toDTO(dados: typeof serviceOrdersTable.$inferSelect) {
            return new ServiceOrderDetailsDTO(dados);
        }

        async getAll() {
            const dados = await db.select().from(serviceOrdersTable);

            return dados.map(dados => this.toDTO(dados));
        }

        async getById(id: string) {
            const [dados] = await db.select().from(serviceOrdersTable)
                .where(eq(serviceOrdersTable.id, id)).limit(1);

            return dados ? this.toDTO(dados) : null;
        }

        async getOpenByEquipment(equipment_id: string) {
            const [dados] = await db.select().from(serviceOrdersTable)
                .where(and(
                    eq(serviceOrdersTable.equipment_id, equipment_id),
                    inArray(serviceOrdersTable.status, ["OPEN", "IN_MAINTENANCE"])
                )).limit(1);

            return dados ? this.toDTO(dados) : null;
        }

        async save(dados: {
            equipment_id: string;
            maintenance_type: "PREVENTIVE" | "CORRECTIVE";
            hour_meter: number;
            description: string;
        }) {

            // salva OS e indisponibiliza o equipamento na mesma transação
            return await db.transaction(async (tx) => {

                // bloqueia o equipamento para impedir duas aberturas simultâneas
                const [equipamento] = await tx.select().from(equipmentsTable)
                    .where(eq(equipmentsTable.id, dados.equipment_id)).for("update");

                if (!equipamento) {
                    throw new Error("Equipamento não encontrado.");
                }

                const [aberta] = await tx.select().from(serviceOrdersTable)
                    .where(and(
                        eq(serviceOrdersTable.equipment_id, dados.equipment_id),
                        inArray(serviceOrdersTable.status, ["OPEN", "IN_MAINTENANCE"])
                    )).limit(1);

                if (aberta) {
                    throw new Error("O equipamento já possui uma ordem de serviço aberta.");
                }

                if (equipamento.status !== "AVAILABLE") {
                    throw new Error("O equipamento está indisponível.");
                }

                const equipamentoEntidade = new Equipment(
                    equipamento.id,
                    equipamento.identification,
                    Number(equipamento.current_hour_meter),
                    EquipmentStatusEnum.AVAILABLE,
                    equipamento.brand,
                    equipamento.model,
                    equipamento.manufacture_year,
                    equipamento.category,
                    Number(equipamento.maintenance_interval),
                    equipamento.property_id
                );

                equipamentoEntidade.updateHourMeter(dados.hour_meter);
                equipamentoEntidade.changeStatus(EquipmentStatusEnum.UNAVAILABLE);

                const [ordemSalva] = await tx.insert(serviceOrdersTable).values({
                    equipment_id: dados.equipment_id,
                    maintenance_type: dados.maintenance_type,
                    hour_meter: String(dados.hour_meter),
                    description: dados.description,
                    status: "OPEN"
                }).returning();

                await tx.update(equipmentsTable).set({
                    status: equipamentoEntidade.getStatus(),
                    current_hour_meter: String(equipamentoEntidade.getCurrentHourMeter()),
                    updated_at: new Date()
                }).where(eq(equipmentsTable.id, dados.equipment_id));

                return this.toDTO(ordemSalva);
            });
        }

        async update(id: string, dados: {
            maintenance_type?: "PREVENTIVE" | "CORRECTIVE";
            description?: string;
        }) {

            // impede edições de OS concluídas mesmo se outra requisição alterou o status
            return await db.transaction(async (tx) => {

                const [atual] = await tx.select().from(serviceOrdersTable)
                    .where(eq(serviceOrdersTable.id, id)).for("update");

                if (!atual) {
                    throw new Error("Ordem de serviço não encontrada.");
                }

                const ordemServico = ServiceOrder.fromDB(atual)!;

                // utiliza os métodos da entidade para validar e alterar os dados
                if (dados.maintenance_type !== undefined) {
                    ordemServico.changeMaintenanceType(dados.maintenance_type);
                }

                if (dados.description !== undefined) {
                    ordemServico.changeDescription(dados.description);
                }

                const [atualizada] = await tx.update(serviceOrdersTable).set({
                    maintenance_type: ordemServico.getMaintenanceType(),
                    description: ordemServico.getDescription(),
                    updated_at: new Date()
                }).where(eq(serviceOrdersTable.id, id)).returning();

                return this.toDTO(atualizada);
            });
        }

        async remove(id: string) {

            return await db.transaction(async (tx) => {

                const [ordem] = await tx.select({
                    equipment_id: serviceOrdersTable.equipment_id}).from(serviceOrdersTable)
                    .where(eq(serviceOrdersTable.id, id)).limit(1);

                if (!ordem) {
                    throw new Error("Ordem de serviço não encontrada.");
                }

                // bloqueia o equipamento enquanto a OS é excluída
                const [equipamento] = await tx.select().from(equipmentsTable)
                    .where(eq(equipmentsTable.id, ordem.equipment_id)).for("update");

                if (!equipamento) {
                    throw new Error("Equipamento não encontrado.");
                }

                const [atual] = await tx.select().from(serviceOrdersTable)
                    .where(eq(serviceOrdersTable.id, id)).for("update");

                if (!atual) {
                    throw new Error("Ordem de serviço não encontrada.");
                }

                // impede excluir OS encerrada, em manutenção ou com custos registrados
                if (atual.status !== "OPEN" ||Number(atual.parts_cost) !== 0 ||Number(atual.labor_cost) !== 0) {

                    throw new Error("Não é possível excluir uma ordem de serviço em manutenção ou encerrada.");
                }

                await tx.delete(serviceOrdersTable).where(eq(serviceOrdersTable.id, id));

                // verifica se existe outra OS ativa para o equipamento
                const [outraAberta] = await tx.select({id: serviceOrdersTable.id}).from(serviceOrdersTable)
                    .where(and(
                        eq(serviceOrdersTable.equipment_id, atual.equipment_id),
                        inArray(serviceOrdersTable.status, ["OPEN", "IN_MAINTENANCE"]))).limit(1);

                // libera o equipamento se não existir outra OS ativa
                if (!outraAberta) {
                    await tx.update(equipmentsTable).set({
                        status: "AVAILABLE",
                        updated_at: new Date()
                    }).where(eq(equipmentsTable.id, atual.equipment_id));
                }
            });
        }
    }
