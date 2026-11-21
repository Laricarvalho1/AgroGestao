import { NextRequest } from "next/server";
import { ContratoVendaController } from "@/modules/contratoVenda/contratoVendaController";

const controller = new ContratoVendaController();

type Contexto = {
    params: Promise<{ id: string }>
};

export async function POST(req: NextRequest, contexto: Contexto) {
    const { id } = await contexto.params;

    return controller.cancelarContrato(Number(id), req);
}