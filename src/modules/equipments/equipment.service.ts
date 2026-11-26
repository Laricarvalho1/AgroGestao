import { EquipmentRepository } from "./equipment.repository";
import { EquipmentStatusEnum } from "./equipment-status.enum";
import { Equipment } from "./equipment.entity";


export class EquipmentService {

    private equipamentoRepository = new EquipmentRepository();

    async getAll() {
        const equipments = await this.equipamentoRepository.getAll();

        return equipments;
    }

    async getById(id : string){
        const equipment = await this.equipamentoRepository.getById(id);

        if(!equipment){
            throw new Error("Equipamento não encontrado.");
        }

        return equipment;
    }

    async create(dados: {
        identification: string;
        current_hour_meter: number;
        brand: string;
        model: string;
        manufacture_year: number;
        category: string;
        maintenance_interval: number;
        property_id: string;}){

        // cria uma instância do equipamento sem id, validando os atributos antes de salvar no banco
        const equipment = new Equipment(
            null,
            dados.identification,
            dados.current_hour_meter,
            EquipmentStatusEnum.AVAILABLE,
            dados.brand,
            dados.model,
            dados.manufacture_year,
            dados.category,
            dados.maintenance_interval,
            dados.property_id
        );
        // verifica se a identificação já existe nessa propriedade
        const equipamentoExistente = await this.equipamentoRepository.getByIdentification(equipment.getIdentification(), equipment.getPropertyId());

        if (equipamentoExistente) {
            throw new Error("Já existe um equipamento com essa identificação na propriedade.");
        }

        return await this.equipamentoRepository.save(equipment);
    }

    async update(id: string, dados: {
        identification?: string;
        current_hour_meter?: number;
        brand?: string;
        model?: string;
        manufacture_year?: number;
        category?: string;
        maintenance_interval?: number;}){
        
        // controla se algum atributo do equipamento foi realmente alterado
        let houveAlteracao = false;
       
        // busca o equipamento no banco e recebe uma instância da classe para realizar as alterações
        const equipment = await this.getById(id)

        // verifica quais atributos foram enviados e utiliza os métodos da classe para alterá-los
        if (dados.identification !== undefined && dados.identification !== equipment.getIdentification()){

            equipment.changeIdentification(dados.identification);

            const equipamentoExistente = await this.equipamentoRepository.getByIdentification(equipment.getIdentification(),equipment.getPropertyId());

            if (equipamentoExistente && equipamentoExistente.getId() !== equipment.getId()) {
                throw new Error("Já existe um equipamento com essa identificação na propriedade.");
            }

            houveAlteracao = true;
        }

        if (dados.current_hour_meter !== undefined && dados.current_hour_meter !== equipment.getCurrentHourMeter()){

            equipment.updateHourMeter(dados.current_hour_meter);
            houveAlteracao = true;
        }

        if (dados.brand !== undefined && dados.brand !== equipment.getBrand()) {

            equipment.changeBrand(dados.brand);
            houveAlteracao = true;
        }

        if (dados.model !== undefined && dados.model !== equipment.getModel()) {

            equipment.changeModel(dados.model);
            houveAlteracao = true;
        }

        if (dados.manufacture_year !== undefined && dados.manufacture_year !== equipment.getManufactureYear()) {

            equipment.changeManufactureYear(dados.manufacture_year);
            houveAlteracao = true;
        }

        if (dados.category !== undefined && dados.category !== equipment.getCategory()) {

            equipment.changeCategory(dados.category);
            houveAlteracao = true;
        }

        if (dados.maintenance_interval !== undefined && dados.maintenance_interval !== equipment.getMaintenanceInterval()) {

            equipment.changeMaintenanceInterval(dados.maintenance_interval);
            houveAlteracao = true;
        }
        
        // evita update o banco caso nenhuma informação do equipamento tenha sido modificada
        if (!houveAlteracao) {
            return equipment;
        }

        return await this.equipamentoRepository.update(equipment);
        
    }

    async remove(id : string){

        // verifica se o equipamento existe antes de solicitar sua exclusão no banco
        await this.getById(id);
        await this.equipamentoRepository.remove(id);
    }
}