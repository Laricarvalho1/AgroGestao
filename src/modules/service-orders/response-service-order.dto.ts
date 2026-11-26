import { ServiceOrder, ServiceOrderStatus } from "./service-order.entity";

export class ResponseServiceOrderDTO {
  id: string;
  equipment_id: string;
  parts_cost: number;
  labor_cost: number;
  total_cost: number;
  status: ServiceOrderStatus;
  created_at: Date;
  updated_at: Date;

  private constructor(os: ServiceOrder) {
    this.id = os.id;
    this.equipment_id = os.equipment_id;
    this.parts_cost = os.parts_cost;
    this.labor_cost = os.labor_cost;
    this.total_cost = os.getTotalCost();
    this.status = os.status;
    this.created_at = os.created_at;
    this.updated_at = os.updated_at;
  }

  static fromServiceOrder(os: ServiceOrder): ResponseServiceOrderDTO {
    return new ResponseServiceOrderDTO(os);
  }
}