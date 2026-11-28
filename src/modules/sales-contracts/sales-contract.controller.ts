import { isUUID } from "@/lib/uuid";
import { NextRequest, NextResponse } from "next/server";
import { SalesContractService } from "./sales-contract.service";

export class SalesContractController {

    private salesContractService = new SalesContractService();

    async getAll(req: NextRequest) {

        try {
            const filtros = req.nextUrl.searchParams;
            const status = filtros.get("status");

            // verifica se o status passado no filtro é válido
            if (status !== null &&
                status !== "PENDING" &&
                status !== "CONFIRMED" &&
                status !== "CANCELLED") {
                return NextResponse.json({ erro: "Status inválido." }, { status: 400 });
            }

            // recebe os UUIDs dos filtros sem converter para number
            const harvest_id = filtros.has("harvest_id")
                ? filtros.get("harvest_id")! : undefined;

            const property_id = filtros.has("property_id")
                ? filtros.get("property_id")! : undefined;

            if (harvest_id !== undefined &&
                (!isUUID(harvest_id))) {
                return NextResponse.json({ erro: "ID da safra inválido." }, { status: 400 });
            }

            if (property_id !== undefined &&
                (!isUUID(property_id))) {
                return NextResponse.json({ erro: "ID da propriedade inválido." }, { status: 400 });
            }

            const start_date = filtros.get("start_date") ?? undefined;
            const end_date = filtros.get("end_date") ?? undefined;

            // verifica o formato das datas recebidas nos filtros
            for (const data of [start_date, end_date]) {
                if (data !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
                    return NextResponse.json({ erro: "Data inválida." }, { status: 400 });
                }
            }

            // impede buscar contracts em um período onde a data inicial é maior que a final
            if (start_date !== undefined &&
                end_date !== undefined &&
                start_date > end_date) {
                return NextResponse.json({ erro: "Período inválido." }, { status: 400 });
            }

            // passa os filtros informados para o service buscar os contracts
            const contracts = await this.salesContractService.getWithFilters({
                buyer: filtros.get("buyer") ?? undefined,
                harvest_id,
                property_id,
                start_date,
                end_date,
                status: status ?? undefined
            });

            return NextResponse.json(
                contracts.map(contract => contract.getAllInformation())
            );

        } catch (erro) {console.error(erro); return NextResponse.json(
                { erro: "Não foi possível consultar contracts." },
                { status: 500 }
            );
        }
    }

    async getById(id: string) {

        if (!isUUID(id)) {
            return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
        }

        try {
            const contract = await this.salesContractService.getById(id);

            return NextResponse.json(contract.getAllInformation());

        } catch (erro) {
            if (erro instanceof Error &&
                erro.message === "Contrato de Venda não encontrado.") {
                return NextResponse.json({ erro: erro.message }, { status: 404 });
            }

            console.error(erro);

            return NextResponse.json(
                { erro: "Não foi possível buscar contract." },
                { status: 500 }
            );
        }
    }

    async save(req: NextRequest) {

        try {
            const dados = await req.json();

            const contract = await this.salesContractService.save(dados);

            return NextResponse.json(
                contract.getAllInformation(),
                { status: 201 }
            );

        } catch (erro) {
           if (erro instanceof Error) {
                return NextResponse.json({ erro: erro.message },{ status: 400 });
            }

            return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
        }
    }

    async update(id: string, req: NextRequest) {

        if (!isUUID(id)) {
            return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
        }

        try {
            const dados = await req.json();

            // impede que os dados recebidos sejam null, array ou outro tipo inválido
            if (dados === null || typeof dados !== "object" || Array.isArray(dados)) {
                return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
            }

            // coloca o id da url junto dos dados que serão atualizados
            const contract = await this.salesContractService.update({
                ...dados,
                id
            });

            return NextResponse.json(contract.getAllInformation());

        } catch (erro) {
            if (erro instanceof Error) {
                return NextResponse.json({ erro: erro.message },{ status: 400 });
            }

            return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
        }
    }

    async cancelContract(id: string, req: NextRequest) {

        if (!isUUID(id)) {
            return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
        }

        try {
            const dados = await req.json();

            const contract = await this.salesContractService.cancelContract(
                id,
                dados.reason
            );

            return NextResponse.json(contract.getAllInformation());

        } catch (erro) {
            if (erro instanceof Error) {
                return NextResponse.json({ erro: erro.message },{ status: 400 });
            }

            return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
        }
    }

        async remove(id: string) {

        if (!isUUID(id)) {
            return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
        }

        try {
            await this.salesContractService.remove(id);

            return new NextResponse(null, { status: 204 });

        } catch (erro) {

            if (erro instanceof Error && erro.message === "Contrato de Venda não encontrado.") {
                return NextResponse.json({ erro: erro.message }, { status: 404 });
            }

            if (erro instanceof Error && [
                "Não é possível excluir um contrato confirmado ou cancelado.",
                "Contrato não encontrado ou não está pendente."
            ].includes(erro.message)) {
                return NextResponse.json({ erro: erro.message }, { status: 409 });
            }

            console.error(erro);

            return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
        }
    }
}