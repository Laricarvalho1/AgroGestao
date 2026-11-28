import { isUUID } from "@/lib/uuid";
import { NextRequest, NextResponse } from "next/server";
import { EquipmentController } from "@/modules/equipments/equipment.controller";

const controller = new EquipmentController();

type Contexto = {
    params: Promise<{ id: string }>
};

// busca o equipment pelo ID
export async function GET(req: NextRequest, contexto: Contexto) {

    const { id } = await contexto.params;
    const equipamentoId = id;

    if (!isUUID(equipamentoId)) {
        return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
    }

    return controller.getById(equipamentoId);
}

// atualiza o equipment
export async function PATCH(req: NextRequest, contexto: Contexto) {

    const { id } = await contexto.params;
    const equipamentoId = id;

    if (!isUUID(equipamentoId)) {
        return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
    }

    return controller.update(equipamentoId, req);
}

// exclui o equipment
export async function DELETE(req: NextRequest, contexto: Contexto) {

    const { id } = await contexto.params;
    const equipamentoId = id;

    if (!isUUID(equipamentoId)) {
        return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
    }

    return controller.remove(equipamentoId);
}