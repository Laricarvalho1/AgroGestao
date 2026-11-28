import { isUUID } from "@/lib/uuid";
import { EquipmentStatusEnum } from "./equipment-status.enum";

export class Equipment {
    private id: string | null;
    private identification: string;
    private current_hour_meter: number;
    private status: EquipmentStatusEnum;
    private brand: string;
    private model: string;
    private manufacture_year: number;
    private category: string;
    private maintenance_interval: number;
    private property_id: string;

    constructor(id: string | null,
        identification: string,
        current_hour_meter: number,
        status: EquipmentStatusEnum,
        brand: string,
        model: string,
        manufacture_year: number,
        category: string,
        maintenance_interval: number,
        property_id: string){

        // verifica se os dados recebidos são válidos antes de create o equipamento
        if (!Object.values(EquipmentStatusEnum).includes(status)) {
            throw new Error("Status do equipamento inválido.");
        }

        if (typeof identification !== "string" || identification.trim().length === 0 || identification.length > 100) {
            throw new Error("A identificação do equipamento é inválida.");
        }

         if (!Number.isFinite(current_hour_meter) || current_hour_meter < 0) {
            throw new Error("O horímetro não pode ser negativo ou inválido.");
        }

          if (typeof brand !== "string" || brand.trim().length === 0 || brand.length > 100) {
            throw new Error("A marca do equipamento é inválida.");
        }

        if (typeof model !== "string" || model.trim().length === 0 || model.length > 100) {
            throw new Error("O modelo do equipamento é inválido.");
        }

        if (!Number.isInteger(manufacture_year) || manufacture_year <= 0) {
            throw new Error("O ano de fabricação é inválido.");
        }

        if (typeof category !== "string" || category.trim().length === 0 || category.length > 100) {
            throw new Error("A categoria do equipamento é inválida.");
        }

        if (!Number.isFinite(maintenance_interval) || maintenance_interval <= 0) {
            throw new Error("O intervalo de manutenção é inválido.");
        }

        if (!isUUID(property_id)) {
            throw new Error("O ID da propriedade é inválido.");
        }

        this.id = id;
        this.identification = identification;
        this.current_hour_meter = current_hour_meter;
        this.status = status;
        this.brand = brand;
        this.model = model;
        this.manufacture_year = manufacture_year;
        this.category = category;
        this.maintenance_interval = maintenance_interval;
        this.property_id = property_id;
        
    }

    getId(): string{

    // impede retornar o id de um equipamento que ainda não foi salvo no banco
       if (this.id === null) {
        throw new Error("Equipment ainda não foi salvo.");
        }

        return this.id;
    }

    getIdentification(): string {
        return this.identification;
    }

    getCurrentHourMeter(): number {
        return this.current_hour_meter;
    }

    getStatus(): EquipmentStatusEnum {
        return this.status;
    }
    
    getBrand(): string {
        return this.brand;
    }

    getModel(): string {
        return this.model;
    }

    getManufactureYear(): number {
        return this.manufacture_year;
    }

    getCategory(): string {
        return this.category;
    }

    getMaintenanceInterval(): number {
        return this.maintenance_interval;
    }

    getPropertyId(): string {
        return this.property_id;
    }

    getAllInformation() {
        // retorna todas as informações do equipamento em um objeto para serem enviadas ao front
        return {
            id: this.id,
            identification: this.identification,
            current_hour_meter: this.current_hour_meter,
            status: this.status,
            brand: this.brand,
            model: this.model,
            manufacture_year: this.manufacture_year,
            category: this.category,
            maintenance_interval: this.maintenance_interval,
            property_id: this.property_id
        };
    }

    updateHourMeter(newHourMeter: number): void {

        // verifica se o novo horímetro é válido e impede que ele seja menor que o atual
        if (!Number.isFinite(newHourMeter) || newHourMeter < 0) {
            throw new Error("O horímetro não pode ser negativo ou inválido.");
        }

        if (newHourMeter < this.current_hour_meter) {
            throw new Error("O horímetro não pode ser menor que o anterior.");
        }

        this.current_hour_meter = newHourMeter;
    }
    
    changeIdentification(newIdentification: string): void {
        
        // verifica se a nova identificação é válida e diferente da identificação atual
         if (typeof newIdentification !== "string" || newIdentification.trim().length === 0 || newIdentification.length > 100) {
            throw new Error("A identificação do equipamento é inválida.");
        }

        if (this.identification === newIdentification) {
                    throw new Error("O equipamento já possui essa Identificação.");
                }
        this.identification = newIdentification;
     }
    

    changeStatus(newStatus: EquipmentStatusEnum): void {
       
        // verifica se o novo status é válido e diferente do status atual
        if (!Object.values(EquipmentStatusEnum).includes(newStatus)) {
            throw new Error("Status do equipamento inválido.");
        }

        if (this.status === newStatus) {
            throw new Error("O equipamento já possui esse status.");
        }

        this.status = newStatus;
    }

    changeBrand(newBrand: string): void {
        // os métodos abaixo validam o novo valor antes de alterar os dados do equipamento
        if (typeof newBrand !== "string" || newBrand.trim().length === 0 || newBrand.length > 100) {
            throw new Error("A marca do equipamento é inválida.");
        }

        if (this.brand === newBrand) {
            throw new Error("O equipamento já possui essa brand.");
        }

        this.brand = newBrand;
    }

    changeModel(newModel: string): void {

        if (typeof newModel !== "string" || newModel.trim().length === 0 || newModel.length > 100) {
            throw new Error("O modelo do equipamento é inválido.");
        }

        if (this.model === newModel) {
            throw new Error("O equipamento já possui esse model.");
        }

        this.model = newModel;
    }

    changeManufactureYear(newYear: number): void {

        if (!Number.isInteger(newYear) || newYear <= 0) {
            throw new Error("O ano de fabricação é inválido.");
        }

        if (this.manufacture_year === newYear) {
            throw new Error("O equipamento já possui esse ano de fabricação.");
        }

        this.manufacture_year = newYear;
    }

    changeCategory(newCategory: string): void {

        if (typeof newCategory !== "string" || newCategory.trim().length === 0 || newCategory.length > 100) {
            throw new Error("A categoria do equipamento é inválida.");
        }

        if (this.category === newCategory) {
            throw new Error("O equipamento já possui essa category.");
        }

        this.category = newCategory;
    }

    changeMaintenanceInterval(newInterval: number): void {

        if (!Number.isFinite(newInterval) || newInterval <= 0) {
            throw new Error("O intervalo de manutenção é inválido.");
        }

        if (this.maintenance_interval === newInterval) {
            throw new Error("O equipamento já possui esse intervalo de manutenção.");
        }

        this.maintenance_interval = newInterval;
    }
}