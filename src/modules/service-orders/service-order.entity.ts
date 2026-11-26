export type ServiceOrderStatus = "OPEN" | "IN_MAINTENANCE" | "COMPLETED";

export interface ServiceOrderDatabaseRow {
  id: string;
  equipment_id: string;
  parts_cost: string;
  labor_cost: string;
  status: ServiceOrderStatus;
  created_at: Date;
  updated_at: Date;
}

export class ServiceOrder {
  readonly id: string;
  readonly equipment_id: string;
  readonly parts_cost: number;
  readonly labor_cost: number;
  readonly status: ServiceOrderStatus;
  readonly created_at: Date;
  readonly updated_at: Date;

  constructor(data: ServiceOrderDatabaseRow) {
    this.id = data.id;
    this.equipment_id = data.equipment_id;
    this.parts_cost = Number(data.parts_cost);
    this.labor_cost = Number(data.labor_cost);
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static fromDB(row: ServiceOrderDatabaseRow | undefined): ServiceOrder | null {
    if (!row) return null;
    return new ServiceOrder(row);
  }

  getTotalCost(): number {
    return Number((this.parts_cost + this.labor_cost).toFixed(2));
  }
}