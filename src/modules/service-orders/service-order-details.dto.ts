import { ServiceOrder } from "./service-order.entity";
import { serviceOrdersTable } from "@/db/schema";

export class ServiceOrderDetailsDTO {
    private serviceOrder: ServiceOrder;
    private maintenance_type: "PREVENTIVE" | "CORRECTIVE";
    private hour_meter: number;
    private description: string;

    constructor(dados: typeof serviceOrdersTable.$inferSelect) {
        this.serviceOrder = ServiceOrder.fromDB(dados)!;
        this.maintenance_type = dados.maintenance_type;
        this.hour_meter = Number(dados.hour_meter);
        this.description = dados.description;
    }

    getAllInformation() {
        return {
            id: this.serviceOrder.id,
            equipment_id: this.serviceOrder.equipment_id,
            maintenance_type: this.maintenance_type,
            hour_meter: this.hour_meter,
            description: this.description,
            status: this.serviceOrder.status,
            parts_cost: this.serviceOrder.parts_cost,
            labor_cost: this.serviceOrder.labor_cost,
            total_cost: this.serviceOrder.getTotalCost(),
            created_at: this.serviceOrder.created_at,
            updated_at: this.serviceOrder.updated_at
        };
    }
}
