import { isUUID } from "@/lib/uuid";

export type ServiceOrderStatus = "OPEN" | "IN_MAINTENANCE" | "COMPLETED";

export interface ServiceOrderDatabaseRow {
  id: string;
  equipment_id: string;
  maintenance_type: "PREVENTIVE" | "CORRECTIVE";
  hour_meter: string;
  description: string;
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

  private maintenance_type: "PREVENTIVE" | "CORRECTIVE";
  private hour_meter: number;
  private description: string;

  constructor(data: ServiceOrderDatabaseRow) {

    // verifica se os dados recebidos são válidos
    if (!isUUID(data.equipment_id)) {
      throw new Error("O id do equipamento é inválido.");
    }

    if (data.maintenance_type !== "PREVENTIVE" && data.maintenance_type !== "CORRECTIVE") {
      throw new Error("Tipo de manutenção inválido.");
    }

    const horimetro = Number(data.hour_meter);

    if (!Number.isFinite(horimetro) || horimetro < 0) {
      throw new Error("Horímetro inválido.");
    }

    if (typeof data.description !== "string" || data.description.trim().length === 0 || data.description.length > 200) {
      throw new Error("Descrição inválida.");
    }

    if (!(data.created_at instanceof Date) || Number.isNaN(data.created_at.getTime())) {
      throw new Error("A data de abertura é inválida.");
    }

    if (data.status !== "OPEN" && data.status !== "IN_MAINTENANCE" && data.status !== "COMPLETED") {
      throw new Error("Status da ordem de serviço inválido.");
    }

    this.id = data.id;
    this.equipment_id = data.equipment_id;
    this.parts_cost = Number(data.parts_cost);
    this.labor_cost = Number(data.labor_cost);
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;

    this.maintenance_type = data.maintenance_type;
    this.hour_meter = horimetro;
    this.description = data.description;
  }

  static fromDB(row: ServiceOrderDatabaseRow | undefined): ServiceOrder | null {
    if (!row) return null;
    return new ServiceOrder(row);
  }

  getMaintenanceType(): "PREVENTIVE" | "CORRECTIVE" {
    return this.maintenance_type;
  }

  getHourMeter(): number {
    return this.hour_meter;
  }

  getDescription(): string {
    return this.description;
  }

  getAllInformation() {
    return {
      id: this.id,
      equipment_id: this.equipment_id,
      maintenance_type: this.maintenance_type,
      hour_meter: this.hour_meter,
      description: this.description,
      status: this.status,
      parts_cost: this.parts_cost,
      labor_cost: this.labor_cost,
      total_cost: this.getTotalCost(),
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  changeDescription(novaDescricao: string) {

    // impede alterar uma ordem de serviço encerrada
    if (this.status === "COMPLETED") {
      throw new Error("Não é possível alterar uma ordem de serviço encerrada.");
    }

    if (typeof novaDescricao !== "string" || novaDescricao.trim().length === 0 || novaDescricao.length > 200) {
      throw new Error("Descrição inválida.");
    }

    this.description = novaDescricao;
  }

  changeMaintenanceType(novoTipo: "PREVENTIVE" | "CORRECTIVE") {

    // impede alterar o tipo de manutenção depois que a OS foi encerrada
    if (this.status === "COMPLETED") {
      throw new Error("Não é possível alterar uma ordem de serviço encerrada.");
    }

    if (novoTipo !== "PREVENTIVE" && novoTipo !== "CORRECTIVE") {
      throw new Error("Tipo de manutenção inválido.");
    }

    this.maintenance_type = novoTipo;
  }

  getTotalCost(): number {
    return Number((this.parts_cost + this.labor_cost).toFixed(2));
  }
}