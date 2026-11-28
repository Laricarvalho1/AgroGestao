import { isUUID } from "@/lib/uuid";
import { NextRequest, NextResponse } from "next/server";
import { ServiceOrderService } from "./service-order.service";

export class ServiceOrderController {

    private serviceOrderService = new ServiceOrderService();

    async getAll() {
        try {
            const ordens = await this.serviceOrderService.getAll();
            return NextResponse.json(ordens.map(ordem => ordem.getAllInformation()));
        } catch (erro) {
            console.error(erro);
            return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
        }
    }

    async getById(id: string) {
        if (!isUUID(id)) {
            return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
        }

        try {
            const ordem = await this.serviceOrderService.getById(id);
            return NextResponse.json(ordem.getAllInformation());
        } catch (erro) {
            if (erro instanceof Error && erro.message === "Ordem de serviço não encontrada.") {
                return NextResponse.json({ erro: erro.message }, { status: 404 });
            }

            console.error(erro);
            return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
        }
    }

    async save(req: NextRequest) {
        try {
            const dados = await req.json();

            if (dados === null || typeof dados !== "object" || Array.isArray(dados)) {
                return NextResponse.json({ erro: "Dados da ordem de serviço inválidos." }, { status: 400 });
            }

            const ordem = await this.serviceOrderService.save(dados);
            return NextResponse.json(ordem.getAllInformation(), { status: 201 });
        } catch (erro) {
            if (erro instanceof SyntaxError) {
                return NextResponse.json({ erro: "JSON malformado." }, { status: 400 });
            }

            if (erro instanceof Error && [
                "O id do equipamento é inválido.",
                "Tipo de manutenção inválido.",
                "Descrição inválida.",
                "Horímetro inválido.",
                "O horímetro não pode ser menor que o anterior."
            ].includes(erro.message)) {
                return NextResponse.json({ erro: erro.message }, { status: 400 });
            }

            if (erro instanceof Error && erro.message === "Equipamento não encontrado.") {
                return NextResponse.json({ erro: erro.message }, { status: 404 });
            }

            if (erro instanceof Error && [
                "O equipamento já possui uma ordem de serviço aberta.",
                "O equipamento está indisponível."
            ].includes(erro.message)) {
                return NextResponse.json({ erro: erro.message }, { status: 409 });
            }

            console.error(erro);
            return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
        }
    }

    async update(id: string, req: NextRequest) {
        if (!isUUID(id)) {
            return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
        }

        try {
            const dados = await req.json();

            if (dados === null || typeof dados !== "object" || Array.isArray(dados)) {
                return NextResponse.json({ erro: "Dados da ordem de serviço inválidos." }, { status: 400 });
            }

            const ordem = await this.serviceOrderService.update(id, dados);
            return NextResponse.json(ordem.getAllInformation());
        } catch (erro) {
            if (erro instanceof SyntaxError) {
                return NextResponse.json({ erro: "JSON malformado." }, { status: 400 });
            }

            if (erro instanceof Error && ["Tipo de manutenção inválido.", "Descrição inválida."].includes(erro.message)) {
                return NextResponse.json({ erro: erro.message }, { status: 400 });
            }

            if (erro instanceof Error && erro.message === "Ordem de serviço não encontrada.") {
                return NextResponse.json({ erro: erro.message }, { status: 404 });
            }

            if (erro instanceof Error && erro.message === "Não é possível alterar uma ordem de serviço encerrada.") {
                return NextResponse.json({ erro: erro.message }, { status: 409 });
            }

            console.error(erro);
            return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
        }
    }

    async getOpenByEquipment(equipment_id: string) {
        if (!isUUID(equipment_id)) {
            return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
        }

        try {
            const ordem = await this.serviceOrderService.getOpenByEquipment(equipment_id);
            return NextResponse.json(ordem.getAllInformation());
        } catch (erro) {
            if (erro instanceof Error && erro.message === "Ordem de serviço aberta não encontrada para o equipamento especificado.") {
                return NextResponse.json({ erro: erro.message }, { status: 404 });
            }

            console.error(erro);
            return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
        }
    }
    async remove(id: string) {

        if (!isUUID(id)) {
            return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
        }

        try {
            await this.serviceOrderService.remove(id);

            return new NextResponse(null, { status: 204 });

        } catch (erro) {

            if (erro instanceof Error && erro.message === "Ordem de serviço não encontrada.") {
                return NextResponse.json({ erro: erro.message }, { status: 404 });
            }

            if (erro instanceof Error &&
                erro.message === "Não é possível excluir uma ordem de serviço em manutenção ou encerrada.") {
                return NextResponse.json({ erro: erro.message }, { status: 409 });
            }

            console.error(erro);

            return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
        }
    }
}
