import { ContratoVenda } from "./contratoVenda";
import { ContratoVendaRepository } from "./contratoVendaRepository";


export class ContratoVendaService{

    private contratoVendaRepository = new ContratoVendaRepository()

    async buscarTodos(){
        const contratoVenda = await this.contratoVendaRepository.buscarTodos()
        return contratoVenda;
    }

    async buscarId(id : number) {
        const contratoVenda = await this.contratoVendaRepository.buscarId(id)

        if(!contratoVenda){
            throw new Error("Contrato de Venda não encontrado.");
        }

        return contratoVenda;
    }

    async buscarComFiltros(filtros: {
        comprador?: string,
        safraId?: number,
        propriedadeId?: number,
        status?: "PENDENTE" | "CONFIRMADO" | "CANCELADO",
        dataInicio?: string,
        dataFim?: string}) {

        // passa os filtros para o repository buscar somente os contratos que correspondem
        const contratos = await this.contratoVendaRepository.buscarComFiltros(filtros);

        return contratos;
    }

    async cancelarContrato(id: number, justificativa: string) {

        const contratoVenda = await this.buscarId(id);

        // impede cancelar contratos confirmados sem antes verificar a parte financeira
        if (contratoVenda.getStatus() === "CONFIRMADO") {
            throw new Error("O cancelamento de contratos confirmados depende da verificação financeira.");
        }

        contratoVenda.cancelarContrato(justificativa);

        return await this.contratoVendaRepository.cancelarContrato(contratoVenda);
    }

    async salvar(dados : {
        comprador: string,
        quantidade: number,
        precoUnitario: number,
        unidadeMedida: string,
        dataContrato: string,
        safraId: number,
        propriedadeId: number,
        condicaoPagamento: string,
        cpfCnpj?: string | null,
        contato?: string | null,
        }){

        const contratoVenda = new ContratoVenda(null, dados.comprador,
            dados.quantidade,
            dados.precoUnitario,
            dados.unidadeMedida,
            dados.dataContrato,
            dados.safraId,
            dados.propriedadeId,
            dados.condicaoPagamento,
            dados.cpfCnpj ?? null,
            dados.contato ?? null)

        // busca os dados da safra vinculada ao contrato para fazer as verificações
        const safra = await this.contratoVendaRepository.buscarDadosSafra(contratoVenda.getSafraId());

        if (!safra) {
            throw new Error("Safra não encontrada.");
        }

        // Verifica se a safra pertence à propriedade informada
        if (safra.propriedadeId !== contratoVenda.getPropriedadeId()) {
            throw new Error("A safra não pertence à propriedade informada.");
        }

        // Verifica se a unidade de medida corresponde à cultura da safra
        if (safra.unidadeMedida !== contratoVenda.getUnidadeMedida()) {
            throw new Error("Unidade de medida incompatível com a cultura da safra.");
        }

        // Verifica se a situação da safra permite a venda
        // deixa o status em maiusculo e sem acento para facilitar as comparações
        const statusSafra = safra.status.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (statusSafra === "CANCELADA") {
            throw new Error("Não é permitido vender produção de uma safra cancelada.");
        }

        if (statusSafra === "CONCLUIDA" || statusSafra === "ARQUIVADA") {
            throw new Error("A safra está encerrada e bloqueada para operações financeiras.");
        }

        return this.contratoVendaRepository.salvar(contratoVenda);

    }


    async atualizar(dados: {
        id: number,
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
    }){

        const contratoVenda = await this.buscarId(dados.id);

        // não deixa alterar um contrato que já foi confirmado ou cancelado
        if (contratoVenda.getStatus() !== "PENDENTE") {
            throw new Error("Não é possível atualizar um contrato confirmado ou cancelado.");
        }

        // se algum desses campos não foi informado, usa o valor que já estava no contrato
        const safraId = dados.safraId ?? contratoVenda.getSafraId();
        const propriedadeId = dados.propriedadeId ?? contratoVenda.getPropriedadeId();
        const unidadeMedida = dados.unidadeMedida ?? contratoVenda.getUnidadeMedida();

        // verifica novamente os dados da safra antes de atualizar o contrato
        const safra = await this.contratoVendaRepository.buscarDadosSafra(safraId);

        if (!safra) {
            throw new Error("Safra não encontrada.");
        }

        if (safra.propriedadeId !== propriedadeId) {
            throw new Error("A safra não pertence à propriedade informada.");
        }

        if (safra.unidadeMedida !== unidadeMedida) {
            throw new Error("Unidade de medida incompatível com a cultura da safra.");
        }

        const statusSafra = safra.status.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Ajustar os valores conforme os status reais da Dupla 1
        if (statusSafra === "CANCELADA") {
            throw new Error("Não é permitido vender produção de uma safra cancelada.");
        }

        if (statusSafra === "CONCLUIDA" || statusSafra === "ARQUIVADA") {
            throw new Error("A safra está bloqueada para operações financeiras.");
        }

        // só altera os dados do objeto depois que todas as verificações passaram
        contratoVenda.atualizarDados(dados);

        return await this.contratoVendaRepository.atualizar(contratoVenda);
    }
    
}