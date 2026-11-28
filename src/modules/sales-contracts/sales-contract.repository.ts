import { SalesContract } from "./sales-contract.entity";
import { db } from "@/db/db";
import { salesContractsTable } from "@/db/schema";
import { eq ,and} from "drizzle-orm";
import { harvestsTable, propertiesTable } from "@/db/schema";



export class SalesContractRepository{

        // transforma os dados que vieram do banco em um objeto SalesContract
        private toEntity(dados: typeof salesContractsTable.$inferSelect): SalesContract {
            return new SalesContract(
                dados.id,
                dados.buyer,
                Number(dados.quantity),
                Number(dados.unit_price),
                dados.unit,
                dados.contract_date,
                dados.harvest_id,
                dados.property_id,
                dados.payment_terms,
                dados.tax_id,
                dados.contact,
                dados.status,
                dados.cancellation_reason
        )};

        async getById (id : string){

                const [dados] = await db.select().from(salesContractsTable).where(eq(salesContractsTable.id , id)).limit(1)

                if (!dados) {
                        return null;
                }

                return this.toEntity(dados);
        }

        async getAll() {
                const dados = await db.select().from(salesContractsTable);

                return dados.map(dados => this.toEntity(dados))
        }

        async save(salesContract : SalesContract){
                // converte os valores numericos para string pq o numeric do drizzle trabalha com string
                const [dados] = await db.insert(salesContractsTable).values({
                       buyer: salesContract.getBuyer(),
                       total_amount : String(salesContract.getTotalAmount()),
                       quantity: String(salesContract.getQuantity()),
                       unit_price : String(salesContract.getUnitPrice()),
                       unit : salesContract.getUnit(),
                       contract_date : salesContract.getContractDate(),
                       harvest_id : salesContract.getHarvestId(),
                       property_id : salesContract.getPropertyId(),
                       payment_terms : salesContract.getPaymentTerms(),
                       tax_id : salesContract.getTaxId(),
                       contact : salesContract.getContact(),
                       status : salesContract.getStatus(),
                       cancellation_reason: salesContract.getCancellationReason()
                }).returning();

                return this.toEntity(dados)
        }

        async getWithFilters(filtros: {
                buyer?: string,
                harvest_id?: string,
                property_id?: string,
                status?: "PENDING" | "CONFIRMED" | "CANCELLED",
                start_date?: string,
                end_date?: string}) {

                const contracts = await this.getAll();

                // filtra os contracts de acordo com os dados informados, se não tiver o filtro ele ignora
                return contracts.filter(contract => {

                        // compara o nome do comprador sem diferenciar maiusculas e minusculas
                        if (filtros.buyer !== undefined && !contract.getBuyer().toLowerCase().includes(filtros.buyer.toLowerCase())) {
                                return false;
                        }

                        if (filtros.harvest_id !== undefined && contract.getHarvestId() !== filtros.harvest_id) {
                                return false;
                        }

                        if (filtros.property_id !== undefined && contract.getPropertyId() !== filtros.property_id) {
                                return false;
                        }

                        if (filtros.status !== undefined && contract.getStatus() !== filtros.status) {
                                return false;           
                        }

                        // verifica se o contrato está dentro do periodo informado
                        if (filtros.start_date !== undefined && contract.getContractDate() < filtros.start_date) {
                                return false;
                        }

                        if (filtros.end_date !== undefined && contract.getContractDate() > filtros.end_date) {
                                return false;
                        }

                        return true;
                });
        }

        async update(salesContract : SalesContract){
                const [dados] = await db.update(salesContractsTable).set({
                       buyer: salesContract.getBuyer(),
                       total_amount : String(salesContract.getTotalAmount()),
                       quantity: String(salesContract.getQuantity()),
                       unit_price : String(salesContract.getUnitPrice()),
                       unit : salesContract.getUnit(),
                       contract_date : salesContract.getContractDate(),
                       harvest_id : salesContract.getHarvestId(),
                       property_id : salesContract.getPropertyId(),
                       payment_terms : salesContract.getPaymentTerms(),
                       tax_id : salesContract.getTaxId(),
                       contact : salesContract.getContact(),
                // só atualiza o contrato se ele ainda estiver pendente
                }).where(and(eq(salesContractsTable.id, salesContract.getId()), eq(salesContractsTable.status, "PENDING"))).returning();

                if (!dados) {
                        throw new Error("Contrato não encontrado ou não está pendente.");
                }

                return this.toEntity(dados)
        }

        async getHarvestData(harvest_id: string) {
                // Enquanto não há plotsTable/cropsTable, só é possível confirmar que a safra existe e consultar seu status.
                const [safra] = await db.select({ status: harvestsTable.status })
                        .from(harvestsTable)
                        .where(eq(harvestsTable.id, harvest_id))
                        .limit(1);
                return safra ?? null;
        }

        async getProperty(property_id: string) {
                const [propriedade] = await db.select({ id: propertiesTable.id })
                        .from(propertiesTable)
                        .where(eq(propertiesTable.id, property_id))
                        .limit(1);
                return propriedade !== undefined;
        }

        async cancelContract(salesContract: SalesContract) {

                // só permite cancel no banco se o contrato estiver pendente
                const [dados] = await db.update(salesContractsTable).set({
                        status: salesContract.getStatus(),
                        cancellation_reason: salesContract.getCancellationReason()})
                        .where(and(eq(salesContractsTable.id, salesContract.getId()),eq(salesContractsTable.status, "PENDING"))).returning();

                if (!dados) {
                        throw new Error("Contrato não encontrado ou não está pendente.");
                }

                return this.toEntity(dados);
        }

        async remove(id: string) {

                // só exclui o contrato caso ainda esteja pendente
                const [excluido] = await db.delete(salesContractsTable)
                        .where(and(
                        eq(salesContractsTable.id, id),
                        eq(salesContractsTable.status, "PENDING")
                        )).returning({ id: salesContractsTable.id });

                return excluido !== undefined;
        }


}