import { EquipamentoStatusEnum } from "./EquipamentoStatusEnum";

export class Equipamento {
    private id: number | null;
    private identificacao: string;
    private horimetroAtual: number;
    private status: EquipamentoStatusEnum;

    constructor(id: number | null , identificacao: string, horimetroAtual: number, status: EquipamentoStatusEnum){

        // verifica se os dados recebidos são válidos antes de criar o equipamento
        if (!Object.values(EquipamentoStatusEnum).includes(status)) {
            throw new Error("Status do equipamento inválido.");
        }
        if (typeof identificacao !== "string" || identificacao.trim().length === 0 || identificacao.length > 100) {
            throw new Error("A identificação do equipamento é inválida.");
        }
         if (!Number.isFinite(horimetroAtual) || horimetroAtual < 0) {
            throw new Error("O horímetro não pode ser negativo ou inválido.");
        }

        this.id = id;
        this.identificacao = identificacao;
        this.horimetroAtual = horimetroAtual;
        this.status = status;
        
    }

    getId(): number{

    // impede retornar o id de um equipamento que ainda não foi salvo no banco
       if (this.id === null) {
        throw new Error("Equipamento ainda não foi salvo.");
        }

        return this.id;
    }

    getIdentificacao(): string {
        return this.identificacao;
    }

    getHorimetroAtual(): number {
        return this.horimetroAtual;
    }

    getStatus(): EquipamentoStatusEnum {
        return this.status;
    }

    getTodasInformacoes() {
        // retorna todas as informações do equipamento em um objeto para serem enviadas ao front
        return {
            id: this.id,
            identificacao: this.identificacao,
            horimetroAtual: this.horimetroAtual,
            status: this.status
        };
    }

    atualizarHorimetro(novoHorimetro: number): void {

        // verifica se o novo horímetro é válido e impede que ele seja menor que o atual
        if (!Number.isFinite(novoHorimetro) || novoHorimetro < 0) {
            throw new Error("O horímetro não pode ser negativo ou inválido.");
        }

        if (novoHorimetro < this.horimetroAtual) {
            throw new Error("O horímetro não pode ser menor que o anterior.");
        }

        this.horimetroAtual = novoHorimetro;
    }
    
    alterarIdentificacao(novaIdentificacao: string): void {
        
        // verifica se a nova identificação é válida e diferente da identificação atual
         if (typeof novaIdentificacao !== "string" || novaIdentificacao.trim().length === 0 || novaIdentificacao.length > 100) {
            throw new Error("A identificação do equipamento é inválida.");
        }

        if (this.identificacao === novaIdentificacao) {
                    throw new Error("O equipamento já possui essa Identificação.");
                }
        this.identificacao = novaIdentificacao;
     }
    

    alterarStatus(novoStatus: EquipamentoStatusEnum): void {
       
        // verifica se o novo status é válido e diferente do status atual
        if (!Object.values(EquipamentoStatusEnum).includes(novoStatus)) {
            throw new Error("Status do equipamento inválido.");
        }

        if (this.status === novoStatus) {
            throw new Error("O equipamento já possui esse status.");
        }

        this.status = novoStatus;
    }
}