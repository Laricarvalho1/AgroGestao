import { NextRequest, NextResponse } from "next/server";
import { EquipamentoController } from "@/modules/equipamento/EquipamentoController";

const controller = new EquipamentoController();

type Contexto = {
    params: Promise<{ id: string }>
};

// busca o equipamento pelo ID
export async function GET(req: NextRequest, contexto: Contexto) {

    const { id } = await contexto.params;
    const equipamentoId = Number(id);

    if (!Number.isInteger(equipamentoId) || equipamentoId <= 0) {
        return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
    }

    return controller.buscarPorId(equipamentoId);
}

// atualiza o equipamento
export async function PATCH(req: NextRequest, contexto: Contexto) {

    const { id } = await contexto.params;
    const equipamentoId = Number(id);

    if (!Number.isInteger(equipamentoId) || equipamentoId <= 0) {
        return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
    }

    return controller.atualizar(equipamentoId, req);
}

// exclui o equipamento
export async function DELETE(req: NextRequest, contexto: Contexto) {

    const { id } = await contexto.params;
    const equipamentoId = Number(id);

    if (!Number.isInteger(equipamentoId) || equipamentoId <= 0) {
        return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
    }

    return controller.excluir(equipamentoId);
}