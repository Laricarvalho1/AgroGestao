import { isUUID } from "@/lib/uuid";
import { ServiceOrderRepository } from "./service-order.repository";

export class ServiceOrderService {

    private serviceOrderRepository = new ServiceOrderRepository();

    private validateMaintenanceType(tipo: unknown): asserts tipo is "PREVENTIVE" | "CORRECTIVE" {
        if (tipo !== "PREVENTIVE" && tipo !== "CORRECTIVE") {
            throw new Error("Tipo de manutenção inválido.");
        }
    }

    private validateDescription(descricao: unknown): asserts descricao is string {
        if (typeof descricao !== "string" || descricao.trim().length === 0 || descricao.length > 200) {
            throw new Error("Descrição inválida.");
        }
    }

    async getAll() {
        return await this.serviceOrderRepository.getAll();
    }

    async getById(id: string) {
        const ordemServico = await this.serviceOrderRepository.getById(id);

        if (!ordemServico) {
            throw new Error("Ordem de serviço não encontrada.");
        }

        return ordemServico;
    }

    async save(dados: {
        equipment_id: string;
        maintenance_type: "PREVENTIVE" | "CORRECTIVE";
        hour_meter: number;
        description: string;
    }) {

        if (!isUUID(dados.equipment_id)) {
            throw new Error("O id do equipamento é inválido.");
        }

        this.validateMaintenanceType(dados.maintenance_type);
        this.validateDescription(dados.description);

        if (typeof dados.hour_meter !== "number" || !Number.isFinite(dados.hour_meter) || dados.hour_meter < 0) {
            throw new Error("Horímetro inválido.");
        }

        // o repository verifica o equipamento e salva a OS com seus efeitos na máquina
        return await this.serviceOrderRepository.save(dados);
    }

    async update(id: string, dados: {
        maintenance_type?: "PREVENTIVE" | "CORRECTIVE";
        description?: string;
    }) {

        if (dados.maintenance_type !== undefined) {
            this.validateMaintenanceType(dados.maintenance_type);
        }

        if (dados.description !== undefined) {
            this.validateDescription(dados.description);
        }

        return await this.serviceOrderRepository.update(id, dados);
    }

    async getOpenByEquipment(equipment_id: string) {
        const ordemServico = await this.serviceOrderRepository.getOpenByEquipment(equipment_id);

        if (!ordemServico) {
            throw new Error("Ordem de serviço aberta não encontrada para o equipamento especificado.");
        }

        return ordemServico;
    }

    async remove(id: string) {
        await this.serviceOrderRepository.remove(id);
    }

    
}
