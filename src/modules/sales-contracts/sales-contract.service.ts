import { SalesContract } from "./sales-contract.entity";
import { SalesContractRepository } from "./sales-contract.repository";


export class SalesContractService{

    private salesContractRepository = new SalesContractRepository()

    async getAll(){
        const salesContract = await this.salesContractRepository.getAll()
        return salesContract;
    }

    async getById(id : string) {
        const salesContract = await this.salesContractRepository.getById(id)

        if(!salesContract){
            throw new Error("Contrato de Venda não encontrado.");
        }

        return salesContract;
    }

    async getWithFilters(filtros: {
        buyer?: string,
        harvest_id?: string,
        property_id?: string,
        status?: "PENDING" | "CONFIRMED" | "CANCELLED",
        start_date?: string,
        end_date?: string}) {

        // passa os filtros para o repository buscar somente os contracts que correspondem
        const contracts = await this.salesContractRepository.getWithFilters(filtros);

        return contracts;
    }

    async cancelContract(id: string, reason: string) {

        const salesContract = await this.getById(id);

        // impede cancel contratos confirmados sem antes verificar a parte financeira
        if (salesContract.getStatus() === "CONFIRMED") {
            throw new Error("O cancelamento de contratos confirmados depende da verificação financeira.");
        }

        salesContract.cancelContract(reason);

        return await this.salesContractRepository.cancelContract(salesContract);
    }

    async save(dados : {
        buyer: string,
        quantity: number,
        unit_price: number,
        unit: string,
        contract_date: string,
        harvest_id: string,
        property_id: string,
        payment_terms: string,
        tax_id?: string | null,
        contact?: string | null,
        }){

        const salesContract = new SalesContract(null, dados.buyer,
            dados.quantity,
            dados.unit_price,
            dados.unit,
            dados.contract_date,
            dados.harvest_id,
            dados.property_id,
            dados.payment_terms,
            dados.tax_id ?? null,
            dados.contact ?? null)

        // busca os dados da safra vinculada ao contrato para fazer as verificações
        const safra = await this.salesContractRepository.getHarvestData(salesContract.getHarvestId());

        if (!safra) {
            throw new Error("Safra não encontrada.");
        }

        if (!await this.salesContractRepository.getProperty(salesContract.getPropertyId())) {
            throw new Error("Propriedade não encontrada.");
        }

        // Verifica se a situação da safra permite a venda
        // deixa o status em maiusculo e sem acento para facilitar as comparações
        const statusSafra = safra.status.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (["CANCELADA", "CANCELED", "CANCELLED"].includes(statusSafra)) {
            throw new Error("Não é permitido vender produção de uma safra cancelada.");
        }

        if (["CONCLUIDA", "ARQUIVADA", "COMPLETED", "ARCHIVED"].includes(statusSafra)) {
            throw new Error("A safra está encerrada e bloqueada para operações financeiras.");
        }

        return this.salesContractRepository.save(salesContract);

    }


    async update(dados: {
        id: string,
        buyer?: string,
        quantity?: number,
        unit_price?: number,
        unit?: string,
        contract_date?: string,
        harvest_id?: string,
        property_id?: string,
        payment_terms?: string,
        tax_id?: string | null,
        contact?: string | null
    }){

        const salesContract = await this.getById(dados.id);

        // não deixa alterar um contrato que já foi confirmado ou cancelado
        if (salesContract.getStatus() !== "PENDING") {
            throw new Error("Não é possível atualizar um contrato confirmado ou cancelado.");
        }

        // se algum desses campos não foi informado, usa o valor que já estava no contrato
        const harvest_id = dados.harvest_id ?? salesContract.getHarvestId();
        const property_id = dados.property_id ?? salesContract.getPropertyId();

        // verifica novamente os dados da safra antes de atualizar o contrato
        const safra = await this.salesContractRepository.getHarvestData(harvest_id);

        if (!safra) {
            throw new Error("Safra não encontrada.");
        }

        if (!await this.salesContractRepository.getProperty(property_id)) {
            throw new Error("Propriedade não encontrada.");
        }

        const statusSafra = safra.status.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Ajustar os valores conforme os status reais da Dupla 1
        if (["CANCELADA", "CANCELED", "CANCELLED"].includes(statusSafra)) {
            throw new Error("Não é permitido vender produção de uma safra cancelada.");
        }

        if (["CONCLUIDA", "ARQUIVADA", "COMPLETED", "ARCHIVED"].includes(statusSafra)) {
            throw new Error("A safra está bloqueada para operações financeiras.");
        }

        // só altera os dados do objeto depois que todas as verificações passaram
        salesContract.updateData(dados);

        return await this.salesContractRepository.update(salesContract);
    }

    async remove(id: string) {

        const salesContract = await this.getById(id);

        // impede excluir contratos que já foram confirmados ou cancelados
        if (salesContract.getStatus() !== "PENDING") {
            throw new Error("Não é possível excluir um contrato confirmado ou cancelado.");
        }

        const excluido = await this.salesContractRepository.remove(id);

        if (!excluido) {
            throw new Error("Contrato não encontrado ou não está pendente.");
        }
}
    
}