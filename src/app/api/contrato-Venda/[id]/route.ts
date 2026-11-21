import { NextRequest } from "next/server";
import { ContratoVendaController } from "@/modules/contratoVenda/contratoVendaController";

const controller = new ContratoVendaController();

type Contexto = {
    params: Promise<{ id: string }>
};

export async function GET(req: NextRequest, contexto: Contexto) {
    const { id } = await contexto.params;

    return controller.buscarId(Number(id));
}

export async function PATCH(req: NextRequest, contexto: Contexto) {
    const { id } = await contexto.params;

    return controller.atualizar(Number(id), req);
}