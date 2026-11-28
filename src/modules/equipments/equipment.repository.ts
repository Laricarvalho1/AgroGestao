import { Equipment } from "./equipment.entity";
import { EquipmentStatusEnum } from "./equipment-status.enum";
import { db } from "@/db/db";
import { equipmentsTable } from "@/db/schema";
import { eq, and, lte} from "drizzle-orm";

export class EquipmentRepository {

    // transforma as informacoes do Drizzle em uma instancia da classe equipment, afim de permitir a alteração de informações dele
    private toEntity(dados: typeof equipmentsTable.$inferSelect): Equipment { 
        return new Equipment(
            dados.id,
            dados.identification,
            Number(dados.current_hour_meter),
            dados.status === "AVAILABLE" ? EquipmentStatusEnum.AVAILABLE : EquipmentStatusEnum.UNAVAILABLE,
            dados.brand,
            dados.model,
            dados.manufacture_year,
            dados.category,
            Number(dados.maintenance_interval),
            dados.property_id
        );
    }
    
    async getById(id : string){ // busca no banco o equipamento utilizando o id
       const [dados] = await db.select().from(equipmentsTable).where(eq(equipmentsTable.id, id)).limit(1);

        if (!dados) {
            return null;
        }

         return this.toEntity(dados);
    }
    
    async getAll() { //envia todos os equipments registrados em forma de objeto para o service 
        const equipments =  await db.select().from(equipmentsTable)

        // transforma cada registro encontrado no banco em uma instância da classe equipment
        return equipments.map(equipment => this.toEntity(equipment));
    }

    async getByIdentification(identification: string, property_id: string) {

        const [dados] = await db.select().from(equipmentsTable).where(and(
                eq(equipmentsTable.identification, identification),
                eq(equipmentsTable.property_id, property_id)
            )).limit(1);

        if (!dados) {
            return null;
        }

        return this.toEntity(dados);
    }

    async save(equipment : Equipment){ //cria o equipamento com seus atributos
        
        const [dados] = await db.insert(equipmentsTable).values({
            identification: equipment.getIdentification(),
            current_hour_meter: String(equipment.getCurrentHourMeter()),
            status: equipment.getStatus() === EquipmentStatusEnum.AVAILABLE ? "AVAILABLE" : "UNAVAILABLE",
            brand: equipment.getBrand(),
            model: equipment.getModel(),
            manufacture_year: equipment.getManufactureYear(),
            category: equipment.getCategory(),
            maintenance_interval: String(equipment.getMaintenanceInterval()),
            property_id: equipment.getPropertyId()
        })

        // retorna os dados do equipamento cadastrado, incluindo o id gerado pelo banco
        .returning();

         return this.toEntity(dados);
    }

    //recebe um objeto equipamento, copia ele para o const dados enviar pro banco de dados e retorna o objeto dados atualizado de volta
    async update(equipment : Equipment){
       
        // identifica qual equipment será atualizado utilizando o seu id e define o que será atualizado
        const [dados] = await db.update(equipmentsTable).set({
            identification: equipment.getIdentification(),
            current_hour_meter: String(equipment.getCurrentHourMeter()),
            brand: equipment.getBrand(),
            model: equipment.getModel(),
            manufacture_year: equipment.getManufactureYear(),
            category: equipment.getCategory(),
            maintenance_interval: String(equipment.getMaintenanceInterval()),
            updated_at: new Date()
        })  
        // impede sobrescrever um horímetro que já aumentou em outra operação
        .where(and(
            eq(equipmentsTable.id, equipment.getId()),
            lte(equipmentsTable.current_hour_meter, String(equipment.getCurrentHourMeter()))
        ))
        .returning();

        if (!dados) {
             const [atual] = await db.select().from(equipmentsTable)
                 .where(eq(equipmentsTable.id, equipment.getId())).limit(1);

             if (!atual) {
                 throw new Error("Equipamento não encontrado.");
             }

             throw new Error("O horímetro não pode ser menor que o anterior.");
        }

         return this.toEntity(dados);
    }

    async remove(id: string){
            
        await db.delete(equipmentsTable).where(eq(equipmentsTable.id, id))

    }
}