import { EquipamentoStatusEnum } from "./EquipamentoStatusEnum";

export class Equipamento {
    private id: number | null;
    private identificacao: string;
    private horimetroAtual: number;
    private status: EquipamentoStatusEnum;
    private marca: string;
    private modelo: string;
    private anoFabricacao: number;
    private categoria: string;
    private intervaloManutencao: number;
    private propriedadeId: number;

    constructor(id: number | null,
        identificacao: string,
        horimetroAtual: number,
        status: EquipamentoStatusEnum,
        marca: string,
        modelo: string,
        anoFabricacao: number,
        categoria: string,
        intervaloManutencao: number,
        propriedadeId: number){

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

          if (typeof marca !== "string" || marca.trim().length === 0 || marca.length > 100) {
            throw new Error("A marca do equipamento é inválida.");
        }

        if (typeof modelo !== "string" || modelo.trim().length === 0 || modelo.length > 100) {
            throw new Error("O modelo do equipamento é inválido.");
        }

        if (!Number.isInteger(anoFabricacao) || anoFabricacao <= 0) {
            throw new Error("O ano de fabricação é inválido.");
        }

        if (typeof categoria !== "string" || categoria.trim().length === 0 || categoria.length > 100) {
            throw new Error("A categoria do equipamento é inválida.");
        }

        if (!Number.isFinite(intervaloManutencao) || intervaloManutencao <= 0) {
            throw new Error("O intervalo de manutenção é inválido.");
        }

        if (!Number.isInteger(propriedadeId) || propriedadeId <= 0) {
            throw new Error("O ID da propriedade é inválido.");
        }

        this.id = id;
        this.identificacao = identificacao;
        this.horimetroAtual = horimetroAtual;
        this.status = status;
        this.marca = marca;
        this.modelo = modelo;
        this.anoFabricacao = anoFabricacao;
        this.categoria = categoria;
        this.intervaloManutencao = intervaloManutencao;
        this.propriedadeId = propriedadeId;
        
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
    getMarca(): string {
    return this.marca;
    }

    getModelo(): string {
        return this.modelo;
    }

    getAnoFabricacao(): number {
        return this.anoFabricacao;
    }

    getCategoria(): string {
        return this.categoria;
    }

    getIntervaloManutencao(): number {
        return this.intervaloManutencao;
    }

    getPropriedadeId(): number {
        return this.propriedadeId;
    }

    getTodasInformacoes() {
        // retorna todas as informações do equipamento em um objeto para serem enviadas ao front
        return {
            id: this.id,
            identificacao: this.identificacao,
            horimetroAtual: this.horimetroAtual,
            status: this.status,
            marca: this.marca,
            modelo: this.modelo,
            anoFabricacao: this.anoFabricacao,
            categoria: this.categoria,
            intervaloManutencao: this.intervaloManutencao,
            propriedadeId: this.propriedadeId
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

    alterarMarca(novaMarca: string): void {
        // os métodos abaixo validam o novo valor antes de alterar os dados do equipamento
        if (typeof novaMarca !== "string" || novaMarca.trim().length === 0 || novaMarca.length > 100) {
            throw new Error("A marca do equipamento é inválida.");
        }

        if (this.marca === novaMarca) {
            throw new Error("O equipamento já possui essa marca.");
        }

        this.marca = novaMarca;
    }

    alterarModelo(novoModelo: string): void {

        if (typeof novoModelo !== "string" || novoModelo.trim().length === 0 || novoModelo.length > 100) {
            throw new Error("O modelo do equipamento é inválido.");
        }

        if (this.modelo === novoModelo) {
            throw new Error("O equipamento já possui esse modelo.");
        }

        this.modelo = novoModelo;
    }

    alterarAnoFabricacao(novoAno: number): void {

        if (!Number.isInteger(novoAno) || novoAno <= 0) {
            throw new Error("O ano de fabricação é inválido.");
        }

        if (this.anoFabricacao === novoAno) {
            throw new Error("O equipamento já possui esse ano de fabricação.");
        }

        this.anoFabricacao = novoAno;
    }

    alterarCategoria(novaCategoria: string): void {

        if (typeof novaCategoria !== "string" || novaCategoria.trim().length === 0 || novaCategoria.length > 100) {
            throw new Error("A categoria do equipamento é inválida.");
        }

        if (this.categoria === novaCategoria) {
            throw new Error("O equipamento já possui essa categoria.");
        }

        this.categoria = novaCategoria;
    }

    alterarIntervaloManutencao(novoIntervalo: number): void {

        if (!Number.isFinite(novoIntervalo) || novoIntervalo <= 0) {
            throw new Error("O intervalo de manutenção é inválido.");
        }

        if (this.intervaloManutencao === novoIntervalo) {
            throw new Error("O equipamento já possui esse intervalo de manutenção.");
        }

        this.intervaloManutencao = novoIntervalo;
    }
}