import { NextRequest, NextResponse } from "next/server";
import { OrdemServicoService } from "./ordemServicoService";

export class OrdemServicoController {

    private ordemServicoService = new OrdemServicoService();

    async buscarTodos() {
        try {
            const ordensServico = await this.ordemServicoService.buscarTodos();

            return NextResponse.json(
                ordensServico.map(ordemServico => ordemServico.getTodasInformacoes())
            );

        } catch (erro) {
            console.error(erro);
            return NextResponse.json({ erro: "Erro ao buscar ordens de serviço." }, { status: 500 });
        }
    }

    async buscarPorId(id: number) {

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
        }

        try {
            const ordemServico = await this.ordemServicoService.buscarId(id);

            return NextResponse.json(ordemServico.getTodasInformacoes());

        } catch (erro) {

            if (erro instanceof Error && erro.message === "Ordem de serviço não encontrada.") {
                return NextResponse.json({ erro: erro.message }, { status: 404 });
            }

            console.error(erro);
            return NextResponse.json({ erro: "Erro ao buscar ordem de serviço." }, { status: 500 });
        }
    }

    async salvar(req: NextRequest) {

        try {
            const dados = await req.json();

            // verifica se os dados enviados pelo front estão no formato correto antes de chamar o service
            if (dados === null || typeof dados !== "object" || Array.isArray(dados)) {
                return NextResponse.json({ erro: "Dados da ordem de serviço inválidos." }, { status: 400 });
            }

            const ordemServico = await this.ordemServicoService.salvar(dados);

            return NextResponse.json(ordemServico.getTodasInformacoes(), { status: 201 });

        } catch (erro) {

            // verifica se ocorreu algum erro na escrita do JSON enviado pelo front
            if (erro instanceof SyntaxError) {
                return NextResponse.json({ erro: "JSON malformado." }, { status: 400 });
            }

            // retorna 400 quando algum dado da ordem de serviço é inválido
            if (erro instanceof Error && [
                "O id do equipamento é inválido.",
                "O id do equipamento é inválido",
                "Tipo de manutenção inválido.",
                "tipo de manuteção inválida.",
                "Horímetro inválido.",
                "Descrição inválida.",
                "Descrição iválida.",
                "A data de abertura é inválida.",
                "Status da ordem de serviço inválido.",
                "Uma nova ordem de serviço deve estar aberta.",
                "O horímetro não pode ser menor que o anterior."
            ].includes(erro.message)) {
                return NextResponse.json({ erro: erro.message }, { status: 400 });
            }

            if (erro instanceof Error && erro.message === "Equipamento não encontrado.") {
                return NextResponse.json({ erro: erro.message }, { status: 404 });
            }

            // impede abrir outra OS se o equipamento já estiver indisponível ou com uma OS aberta
            if (erro instanceof Error && [
                "Equipamento não encontrado.",
                "O equipamento já possui uma ordem de serviço aberta.",
                "O equipamento está indisponível."
            ].includes(erro.message)) {
                return NextResponse.json({ erro: erro.message }, { status: 409 });
            }

            console.error(erro);
            return NextResponse.json({ erro: "Erro ao salvar ordem de serviço." }, { status: 500 });
        }
    }

    async atualizar(id: number, req: NextRequest) {

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
        }

        try {
            const dados = await req.json();

            // verifica se os dados recebidos são válidos antes de atualizar
            if (dados === null || typeof dados !== "object" || Array.isArray(dados)) {
                return NextResponse.json({ erro: "Dados da ordem de serviço inválidos." }, { status: 400 });
            }

            const ordemServicoAtualizada = await this.ordemServicoService.atualizar(id, dados);

            return NextResponse.json(ordemServicoAtualizada.getTodasInformacoes());

        } catch (erro) {

            if (erro instanceof SyntaxError) {
                return NextResponse.json({ erro: "JSON malformado." }, { status: 400 });
            }

            if (erro instanceof Error && erro.message === "Ordem de serviço não encontrada.") {
                return NextResponse.json({ erro: erro.message }, { status: 404 });
            }

            // não permite alterar uma OS que já foi encerrada
            if (erro instanceof Error && [
                "Não é possível alterar uma ordem de serviço encerrada.",
                "Ordem de serviço não encontrada ou já encerrada."
            ].includes(erro.message)) {
                return NextResponse.json({ erro: erro.message }, { status: 409 });
            }

            if (erro instanceof Error && [
                "Tipo de manutenção inválido.",
                "tipo de manuteção inválida.",
                "Descrição inválida.",
                "Descrição iválida."
            ].includes(erro.message)) {
                return NextResponse.json({ erro: erro.message }, { status: 400 });
            }

            console.error(erro);
            return NextResponse.json({ erro: "Erro ao atualizar ordem de serviço." }, { status: 500 });
        }
    }

    async buscarAbertaPorEquipamento(equipamentoId: number) {

        if (!Number.isInteger(equipamentoId) || equipamentoId <= 0) {
            return NextResponse.json({ erro: "ID de equipamento inválido." }, { status: 400 });
        }

        try {
            // busca a OS aberta vinculada ao equipamento informado
            const ordemServicoAberta = await this.ordemServicoService.buscarAbertaPorEquipamento(equipamentoId);

            return NextResponse.json(ordemServicoAberta.getTodasInformacoes());

        } catch (erro) {

            if (erro instanceof Error &&
                erro.message === "Ordem de serviço aberta não encontrada para o equipamento especificado.") {
                return NextResponse.json({ erro: erro.message }, { status: 404 });
            }

            console.error(erro);
            return NextResponse.json({ erro: "Erro ao buscar ordem de serviço aberta para o equipamento." },{ status: 500 }
            );
        }
    }
}