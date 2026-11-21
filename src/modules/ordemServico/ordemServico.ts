export class OrdemServico{
    private id : number | null;
    private equipamentoId : number;
    private tipoManutencao : "PREVENTIVA" | "CORRETIVA";
    private horimetro : number;
    private descricao : string;
    private status : "ABERTA" | "ENCERRADA";
    private dataAbertura : Date;




    constructor(
        id : number | null,
        equipamentoId : number,
        tipoManutencao : "PREVENTIVA" | "CORRETIVA",
        horimetro : number,
        descricao : string,
        dataAbertura : Date,
        status : "ABERTA" | "ENCERRADA" = "ABERTA",
    ){
        // verifica se os dados recebidos são válidos antes de criar a ordem de serviço
        if(!Number.isInteger(equipamentoId) || equipamentoId <= 0){
            throw new Error("O id do equipamento é inválido")
        }

        if(!["PREVENTIVA" , "CORRETIVA"].includes(tipoManutencao)){
            throw new Error("tipo de manuteção inválida.");
        }

        // o horímetro não pode ser negativo ou inválido
        if (!Number.isFinite(horimetro) || horimetro < 0) {
            throw new Error("Horímetro inválido.");
        }

        if (typeof descricao !== "string" || descricao.trim().length === 0 || descricao.length > 200){
            throw new Error("Descrição iválida.");
        }

        // verifica se a data recebida realmente é válida
         if (!(dataAbertura instanceof Date) || Number.isNaN(dataAbertura.getTime())) {
            throw new Error("A data de abertura é inválida.");
        }

        if (!["ABERTA", "ENCERRADA"].includes(status)) {
            throw new Error("Status da ordem de serviço inválido.");
        }

        this.id = id;
        this.equipamentoId = equipamentoId;
        this.tipoManutencao = tipoManutencao;
        this.horimetro = horimetro;
        this.descricao = descricao;
        this.dataAbertura = dataAbertura;
        this.status = status;
    }


    getId() : number {

        // impede retornar o id de uma ordem de serviço que ainda não foi salva no banco
        if(this.id === null){
            throw new Error("A ordem de serviço não possui ID.");
        }

        return this.id;
    }

    getEquipamentoId() : number{
        return this.equipamentoId;
    }

    getTipoManutencao() : "PREVENTIVA" | "CORRETIVA"{
        return this.tipoManutencao;
    }

    getHorimetro() : number{
        return this.horimetro;
    }

    getDescricao() : string{
        return this.descricao;
    }

    getStatus() : "ABERTA" | "ENCERRADA"{
        return this.status;
    }

    getDataAbertura() : Date{
        return this.dataAbertura;
    }

    getTodasInformacoes(){
        // retorna as informações da ordem de serviço para serem enviadas ao front
        return {
            id : this.id,
            equipamentoId : this.equipamentoId,
            tipoManutencao : this.tipoManutencao,
            horimetro : this.horimetro,
            descricao : this.descricao,
            status : this.status,
            dataAbertura : this.dataAbertura.toISOString()
        }
    }

    alterarDescricao(novaDescricao : string){

        // impede alterar a descrição de uma ordem de serviço que já foi encerrada
        if (this.status === "ENCERRADA") {
            throw new Error("Não é possível alterar uma ordem de serviço encerrada.");
        }

        if (typeof novaDescricao !== "string" || novaDescricao.trim().length === 0 || novaDescricao.length > 200) {
            throw new Error("Descrição iválida.");
        }

        this.descricao = novaDescricao;
    }

    alterarTipoManutencao(novoTipoManutencao : "PREVENTIVA" | "CORRETIVA"){

        // não permite alterar o tipo de manutenção depois que a ordem foi encerrada
        if (this.status === "ENCERRADA") {
            throw new Error("Não é possível alterar uma ordem de serviço encerrada.");
        }

        if(!["PREVENTIVA" , "CORRETIVA"].includes(novoTipoManutencao)){
            throw new Error("tipo de manuteção inválida.");
        } 

         this.tipoManutencao = novoTipoManutencao;
    }
}