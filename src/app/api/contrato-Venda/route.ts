import { NextRequest } from "next/server";
import { ContratoVendaController } from "@/modules/contratoVenda/contratoVendaController";

const controller = new ContratoVendaController();

export async function GET(req: NextRequest) {
    return controller.buscarTodos(req);
}

export async function POST(req: NextRequest) {
    return controller.salvar(req);
}