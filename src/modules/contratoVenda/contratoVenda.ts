export class ContratoVenda {

    private id: number | null;
    private comprador: string;
    private valorTotal: number;
    private safraId: number;
    private status: "PENDENTE" | "CONFIRMADO" | "CANCELADO";
    private propriedadeId: number;
    private quantidade: number;
    private precoUnitario: number;
    private unidadeMedida: string;
    private dataContrato: string;
    private condicaoPagamento: string;
    private cpfCnpj: string | null;
    private contato: string | null;
    private justificativaCancelamento: string | null;

    constructor (
        id: number | null,
        comprador: string,
        quantidade: number,
        precoUnitario: number,
        unidadeMedida: string,
        dataContrato: string,
        safraId: number,
        propriedadeId: number,
        condicaoPagamento: string,
        cpfCnpj: string | null = null,
        contato: string | null = null,
        status: "PENDENTE" | "CONFIRMADO" | "CANCELADO" = "PENDENTE",
        justificativaCancelamento: string | null = null
    ){


        // verifica se o comprador foi informado corretamente
        if (typeof comprador !== "string" || comprador.trim().length === 0 || comprador.length > 150) {
            throw new Error("O comprador é inválido.");
        }

        // verifica se a quantidade é maior que zero
        if (!Number.isFinite(quantidade) || quantidade <= 0) {
            throw new Error("A quantidade deve ser maior que zero.");
        }

        // verifica se o preço é maior que zero
        if (!Number.isFinite(precoUnitario) || precoUnitario <= 0) {
            throw new Error("O preço unitário deve ser maior que zero.");
        }

        if (typeof unidadeMedida !== "string" || unidadeMedida.trim().length === 0 || unidadeMedida.length > 20) {
            throw new Error("A unidade de medida é inválida.");
        }

        // verifica se a data está no formato correto
        if (typeof dataContrato !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dataContrato)) {
            throw new Error("A data do contrato é inválida.");
        }

        const data = new Date(dataContrato + "T00:00:00Z");

        // verifica se a data realmente existe
        if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== dataContrato) {
            throw new Error("A data do contrato é inválida.");
        }

        if (!Number.isInteger(safraId) || safraId <= 0) {
            throw new Error("O ID da safra é inválido.");
        }

        if (!Number.isInteger(propriedadeId) || propriedadeId <= 0) {
            throw new Error("O ID da propriedade é inválido.");
        }

        if (typeof condicaoPagamento !== "string" || condicaoPagamento.trim().length === 0 || condicaoPagamento.length > 100) {
            throw new Error("A condição de pagamento é inválida.");
        }

        // cpf/cnpj e contato são opcionais, mas precisam ser válidos se forem informados
        if (cpfCnpj !== null && (typeof cpfCnpj !== "string" || cpfCnpj.trim().length === 0 || cpfCnpj.length > 18)) {
            throw new Error("O CPF/CNPJ é inválido.");
        }

        if (contato !== null && (typeof contato !== "string" || contato.trim().length === 0 || contato.length > 150)) {
            throw new Error("O contato é inválido.");
        }

        if (!["PENDENTE", "CONFIRMADO", "CANCELADO"].includes(status)) {
            throw new Error("Status do contrato inválido.");
        }

        if (justificativaCancelamento !== null &&
            (typeof justificativaCancelamento !== "string" || justificativaCancelamento.trim().length === 0)) {
            throw new Error("A justificativa do cancelamento é inválida.");
        }

        // não permite criar um contrato cancelado sem justificativa
        if (status === "CANCELADO" && justificativaCancelamento === null) {
            throw new Error("Contrato cancelado deve possuir justificativa.");
        }

        // calcula o valor total da venda, deixando com duas casas decimais
        const valorCalculado = Number((quantidade * precoUnitario).toFixed(2));

        if (!Number.isFinite(valorCalculado) || valorCalculado <= 0 || valorCalculado > 99999999.99) {
            throw new Error("O valor total do contrato é inválido.");
        }

        // atribui os dados validados ao contrato
        this.id = id;
        this.comprador = comprador;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
        this.valorTotal = valorCalculado;
        this.safraId = safraId;
        this.propriedadeId = propriedadeId;
        this.unidadeMedida = unidadeMedida;
        this.dataContrato = dataContrato;
        this.condicaoPagamento = condicaoPagamento;
        this.cpfCnpj = cpfCnpj;
        this.contato = contato;
        this.status = status;
        this.justificativaCancelamento = justificativaCancelamento;
    }

    getId(): number {

        // impede retornar o id de um contrato que ainda não foi salvo no banco
        if (this.id === null) {
            throw new Error("Contrato ainda não foi salvo.");
        }

        return this.id;
    }

    getComprador(): string {
        return this.comprador;
    }

    getValorTotal(): number {
        return this.valorTotal;
    }

    getSafraId(): number {
        return this.safraId;
    }

    getStatus(): "PENDENTE" | "CONFIRMADO" | "CANCELADO" {
        return this.status;
    }

    getPropriedadeId(): number {
        return this.propriedadeId;
    }

    getQuantidade(): number {
        return this.quantidade;
    }

    getPrecoUnitario(): number {
        return this.precoUnitario;
    }

    getUnidadeMedida(): string {
        return this.unidadeMedida;
    }

    getDataContrato(): string {
        return this.dataContrato;
    }

    getCondicaoPagamento(): string {
        return this.condicaoPagamento;
    }

    getCpfCnpj(): string | null {
        return this.cpfCnpj;
    }

    getContato(): string | null {
        return this.contato;
    }

    getJustificativaCancelamento(): string | null {
        return this.justificativaCancelamento;
    }


    // retorna todas as informações do contrato
    getTodasInformacoes() {
    return {
        id: this.id,
        comprador: this.comprador,
        quantidade: this.quantidade,
        precoUnitario: this.precoUnitario,
        valorTotal: this.valorTotal,
        unidadeMedida: this.unidadeMedida,
        dataContrato: this.dataContrato,
        safraId: this.safraId,
        propriedadeId: this.propriedadeId,
        condicaoPagamento: this.condicaoPagamento,
        cpfCnpj: this.cpfCnpj,
        contato: this.contato,
        status: this.status,
        justificativaCancelamento: this.justificativaCancelamento
        };
    }

    confirmarContrato(): void {
        // só permite confirmar contratos pendentes
        if (this.status !== "PENDENTE") {
            throw new Error("Contrato não pode ser confirmado.");
        }

        this.status = "CONFIRMADO";
    }

    cancelarContrato(justificativa: string): void {

        // impede cancelar um contrato que já foi cancelado
        if (this.status === "CANCELADO") {
            throw new Error("O contrato já está cancelado.");
        }

        if (typeof justificativa !== "string" || justificativa.trim().length === 0) {
            throw new Error("A justificativa do cancelamento é obrigatória.");
        }

        this.justificativaCancelamento = justificativa;
        this.status = "CANCELADO";
    }

    atualizarDados(dados: {
        comprador?: string,
        quantidade?: number,
        precoUnitario?: number,
        unidadeMedida?: string,
        dataContrato?: string,
        safraId?: number,
        propriedadeId?: number,
        condicaoPagamento?: string,
        cpfCnpj?: string | null,
        contato?: string | null
    }): void {

        // só permite atualizar contratos que ainda estão pendentes
        if (this.status !== "PENDENTE") {
            throw new Error("Não é possível atualizar um contrato confirmado ou cancelado.");
        }

        // cria um contrato temporário com os novos dados para validar tudo novamente
        // os campos não informados continuam com os valores anteriores
        const contratoAtualizado = new ContratoVenda(
            this.id,
            dados.comprador ?? this.comprador,
            dados.quantidade ?? this.quantidade,
            dados.precoUnitario ?? this.precoUnitario,
            dados.unidadeMedida ?? this.unidadeMedida,
            dados.dataContrato ?? this.dataContrato,
            dados.safraId ?? this.safraId,
            dados.propriedadeId ?? this.propriedadeId,
            dados.condicaoPagamento ?? this.condicaoPagamento,
            dados.cpfCnpj === undefined ? this.cpfCnpj : dados.cpfCnpj,
            dados.contato === undefined ? this.contato : dados.contato
        );

        // passa os dados já validados para o contrato original
        this.comprador = contratoAtualizado.getComprador();
        this.quantidade = contratoAtualizado.getQuantidade();
        this.precoUnitario = contratoAtualizado.getPrecoUnitario();
        this.valorTotal = contratoAtualizado.getValorTotal();
        this.unidadeMedida = contratoAtualizado.getUnidadeMedida();
        this.dataContrato = contratoAtualizado.getDataContrato();
        this.safraId = contratoAtualizado.getSafraId();
        this.propriedadeId = contratoAtualizado.getPropriedadeId();
        this.condicaoPagamento = contratoAtualizado.getCondicaoPagamento();
        this.cpfCnpj = contratoAtualizado.getCpfCnpj();
        this.contato = contratoAtualizado.getContato();
    }

}