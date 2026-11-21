import { NextRequest, NextResponse } from "next/server";
import { ContratoVendaService } from "./contratoVendaService";

export class ContratoVendaController {

    private contratoVendaService = new ContratoVendaService();

    async buscarTodos(req: NextRequest) {

        try {
            const filtros = req.nextUrl.searchParams;
            const status = filtros.get("status");

            // verifica se o status passado no filtro é válido
            if (status !== null &&
                status !== "PENDENTE" &&
                status !== "CONFIRMADO" &&
                status !== "CANCELADO") {
                return NextResponse.json({ erro: "Status inválido." }, { status: 400 });
            }

            // converte os ids recebidos pela url para number
            const safraId = filtros.has("safraId")
                ? Number(filtros.get("safraId")) : undefined;

            const propriedadeId = filtros.has("propriedadeId")
                ? Number(filtros.get("propriedadeId")) : undefined;

            if (safraId !== undefined &&
                (!Number.isInteger(safraId) || safraId <= 0)) {
                return NextResponse.json({ erro: "ID da safra inválido." }, { status: 400 });
            }

            if (propriedadeId !== undefined &&
                (!Number.isInteger(propriedadeId) || propriedadeId <= 0)) {
                return NextResponse.json({ erro: "ID da propriedade inválido." }, { status: 400 });
            }

            const dataInicio = filtros.get("dataInicio") ?? undefined;
            const dataFim = filtros.get("dataFim") ?? undefined;

            // verifica o formato das datas recebidas nos filtros
            for (const data of [dataInicio, dataFim]) {
                if (data !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
                    return NextResponse.json({ erro: "Data inválida." }, { status: 400 });
                }
            }

            // impede buscar contratos em um período onde a data inicial é maior que a final
            if (dataInicio !== undefined &&
                dataFim !== undefined &&
                dataInicio > dataFim) {
                return NextResponse.json({ erro: "Período inválido." }, { status: 400 });
            }

            // passa os filtros informados para o service buscar os contratos
            const contratos = await this.contratoVendaService.buscarComFiltros({
                comprador: filtros.get("comprador") ?? undefined,
                safraId,
                propriedadeId,
                dataInicio,
                dataFim,
                status: status ?? undefined
            });

            return NextResponse.json(
                contratos.map(contrato => contrato.getTodasInformacoes())
            );

        } catch (erro) {console.error(erro); return NextResponse.json(
                { erro: "Não foi possível consultar contratos." },
                { status: 500 }
            );
        }
    }

    async buscarId(id: number) {

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
        }

        try {
            const contrato = await this.contratoVendaService.buscarId(id);

            return NextResponse.json(contrato.getTodasInformacoes());

        } catch (erro) {
            if (erro instanceof Error &&
                erro.message === "Contrato de Venda não encontrado.") {
                return NextResponse.json({ erro: erro.message }, { status: 404 });
            }

            console.error(erro);

            return NextResponse.json(
                { erro: "Não foi possível buscar contrato." },
                { status: 500 }
            );
        }
    }

    async salvar(req: NextRequest) {

        try {
            const dados = await req.json();

            const contrato = await this.contratoVendaService.salvar(dados);

            return NextResponse.json(
                contrato.getTodasInformacoes(),
                { status: 201 }
            );

        } catch (erro) {
           if (erro instanceof Error) {
                return NextResponse.json({ erro: erro.message },{ status: 400 });
            }

            return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
        }
    }

    async atualizar(id: number, req: NextRequest) {

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
        }

        try {
            const dados = await req.json();

            // impede que os dados recebidos sejam null, array ou outro tipo inválido
            if (dados === null || typeof dados !== "object" || Array.isArray(dados)) {
                return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
            }

            // coloca o id da url junto dos dados que serão atualizados
            const contrato = await this.contratoVendaService.atualizar({
                ...dados,
                id
            });

            return NextResponse.json(contrato.getTodasInformacoes());

        } catch (erro) {
            if (erro instanceof Error) {
                return NextResponse.json({ erro: erro.message },{ status: 400 });
            }

            return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
        }
    }

    async cancelarContrato(id: number, req: NextRequest) {

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
        }

        try {
            const dados = await req.json();

            const contrato = await this.contratoVendaService.cancelarContrato(
                id,
                dados.justificativa
            );

            return NextResponse.json(contrato.getTodasInformacoes());

        } catch (erro) {
            if (erro instanceof Error) {
                return NextResponse.json({ erro: erro.message },{ status: 400 });
            }

            return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
        }
    }
}