import { isUUID } from "@/lib/uuid";
export class SalesContract {

    private id: string | null;
    private buyer: string;
    private total_amount: number;
    private harvest_id: string;
    private status: "PENDING" | "CONFIRMED" | "CANCELLED";
    private property_id: string;
    private quantity: number;
    private unit_price: number;
    private unit: string;
    private contract_date: string;
    private payment_terms: string;
    private tax_id: string | null;
    private contact: string | null;
    private cancellation_reason: string | null;

    constructor (
        id: string | null,
        buyer: string,
        quantity: number,
        unit_price: number,
        unit: string,
        contract_date: string,
        harvest_id: string,
        property_id: string,
        payment_terms: string,
        tax_id: string | null = null,
        contact: string | null = null,
        status: "PENDING" | "CONFIRMED" | "CANCELLED" = "PENDING",
        cancellation_reason: string | null = null
    ){


        // verifica se o comprador foi informado corretamente
        if (typeof buyer !== "string" || buyer.trim().length === 0 || buyer.length > 150) {
            throw new Error("O comprador é inválido.");
        }

        // verifica se a quantity é maior que zero
        if (!Number.isFinite(quantity) || quantity <= 0) {
            throw new Error("A quantity deve ser maior que zero.");
        }

        // verifica se o preço é maior que zero
        if (!Number.isFinite(unit_price) || unit_price <= 0) {
            throw new Error("O preço unitário deve ser maior que zero.");
        }

        if (typeof unit !== "string" || unit.trim().length === 0 || unit.length > 20) {
            throw new Error("A unidade de medida é inválida.");
        }

        // verifica se a data está no formato correto
        if (typeof contract_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(contract_date)) {
            throw new Error("A data do contrato é inválida.");
        }

        const data = new Date(contract_date + "T00:00:00Z");

        // verifica se a data realmente existe
        if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== contract_date) {
            throw new Error("A data do contrato é inválida.");
        }

        if (!isUUID(harvest_id)) {
            throw new Error("O ID da safra é inválido.");
        }

        if (!isUUID(property_id)) {
            throw new Error("O ID da propriedade é inválido.");
        }

        if (typeof payment_terms !== "string" || payment_terms.trim().length === 0 || payment_terms.length > 100) {
            throw new Error("A condição de pagamento é inválida.");
        }

        // cpf/cnpj e contact são opcionais, mas precisam ser válidos se forem informados
        if (tax_id !== null && (typeof tax_id !== "string" || tax_id.trim().length === 0 || tax_id.length > 18)) {
            throw new Error("O CPF/CNPJ é inválido.");
        }

        if (contact !== null && (typeof contact !== "string" || contact.trim().length === 0 || contact.length > 150)) {
            throw new Error("O contact é inválido.");
        }

        if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
            throw new Error("Status do contrato inválido.");
        }

        if (cancellation_reason !== null &&
            (typeof cancellation_reason !== "string" || cancellation_reason.trim().length === 0)) {
            throw new Error("A justificativa do cancelamento é inválida.");
        }

        // não permite criar um contrato cancelado sem justificativa
        if (status === "CANCELLED" && cancellation_reason === null) {
            throw new Error("Contrato cancelado deve possuir justificativa.");
        }

        // calcula o valor total da venda, deixando com duas casas decimais
        const valorCalculado = Number((quantity * unit_price).toFixed(2));

        if (!Number.isFinite(valorCalculado) || valorCalculado <= 0 || valorCalculado > 99999999.99) {
            throw new Error("O valor total do contrato é inválido.");
        }

        // atribui os dados validados ao contrato
        this.id = id;
        this.buyer = buyer;
        this.quantity = quantity;
        this.unit_price = unit_price;
        this.total_amount = valorCalculado;
        this.harvest_id = harvest_id;
        this.property_id = property_id;
        this.unit = unit;
        this.contract_date = contract_date;
        this.payment_terms = payment_terms;
        this.tax_id = tax_id;
        this.contact = contact;
        this.status = status;
        this.cancellation_reason = cancellation_reason;
    }

    getId(): string {

        // impede retornar o id de um contrato que ainda não foi salvo no banco
        if (this.id === null) {
            throw new Error("Contrato ainda não foi salvo.");
        }

        return this.id;
    }

    getBuyer(): string {
        return this.buyer;
    }

    getTotalAmount(): number {
        return this.total_amount;
    }

    getHarvestId(): string {
        return this.harvest_id;
    }

    getStatus(): "PENDING" | "CONFIRMED" | "CANCELLED" {
        return this.status;
    }

    getPropertyId(): string {
        return this.property_id;
    }

    getQuantity(): number {
        return this.quantity;
    }

    getUnitPrice(): number {
        return this.unit_price;
    }

    getUnit(): string {
        return this.unit;
    }

    getContractDate(): string {
        return this.contract_date;
    }

    getPaymentTerms(): string {
        return this.payment_terms;
    }

    getTaxId(): string | null {
        return this.tax_id;
    }

    getContact(): string | null {
        return this.contact;
    }

    getCancellationReason(): string | null {
        return this.cancellation_reason;
    }


    // retorna todas as informações do contrato
    getAllInformation() {
        return {
            id: this.id,
            buyer: this.buyer,
            quantity: this.quantity,
            unit_price: this.unit_price,
            total_amount: this.total_amount,
            unit: this.unit,
            contract_date: this.contract_date,
            harvest_id: this.harvest_id,
            property_id: this.property_id,
            payment_terms: this.payment_terms,
            tax_id: this.tax_id,
            contact: this.contact,
            status: this.status,
            cancellation_reason: this.cancellation_reason
            };
    }

    confirmContract(): void {
        // só permite confirmar contracts pendentes
        if (this.status !== "PENDING") {
            throw new Error("Contrato não pode ser confirmado.");
        }

        this.status = "CONFIRMED";
    }

    cancelContract(reason: string): void {

        // impede cancel um contrato que já foi cancelado
        if (this.status === "CANCELLED") {
            throw new Error("O contrato já está cancelado.");
        }

        if (typeof reason !== "string" || reason.trim().length === 0) {
            throw new Error("A justificativa do cancelamento é obrigatória.");
        }

        this.cancellation_reason = reason;
        this.status = "CANCELLED";
    }

    updateData(dados: {
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
    }): void {

        // só permite update contracts que ainda estão pendentes
        if (this.status !== "PENDING") {
            throw new Error("Não é possível atualizar um contrato confirmado ou cancelado.");
        }

        // cria um contrato temporário com os novos dados para validar tudo novamente
        // os campos não informados continuam com os valores anteriores
        const contratoAtualizado = new SalesContract(
            this.id,
            dados.buyer ?? this.buyer,
            dados.quantity ?? this.quantity,
            dados.unit_price ?? this.unit_price,
            dados.unit ?? this.unit,
            dados.contract_date ?? this.contract_date,
            dados.harvest_id ?? this.harvest_id,
            dados.property_id ?? this.property_id,
            dados.payment_terms ?? this.payment_terms,
            dados.tax_id === undefined ? this.tax_id : dados.tax_id,
            dados.contact === undefined ? this.contact : dados.contact
        );

        // passa os dados já validados para o contrato original
        this.buyer = contratoAtualizado.getBuyer();
        this.quantity = contratoAtualizado.getQuantity();
        this.unit_price = contratoAtualizado.getUnitPrice();
        this.total_amount = contratoAtualizado.getTotalAmount();
        this.unit = contratoAtualizado.getUnit();
        this.contract_date = contratoAtualizado.getContractDate();
        this.harvest_id = contratoAtualizado.getHarvestId();
        this.property_id = contratoAtualizado.getPropertyId();
        this.payment_terms = contratoAtualizado.getPaymentTerms();
        this.tax_id = contratoAtualizado.getTaxId();
        this.contact = contratoAtualizado.getContact();
    }

}