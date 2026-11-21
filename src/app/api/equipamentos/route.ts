import { NextRequest } from "next/server";
import { EquipamentoController } from "@/modules/equipamento/EquipamentoController";

const controller = new EquipamentoController();

// busca todos os equipamentos
export async function GET() {
    return controller.buscarTodos();
}

// cadastra um novo equipamento
export async function POST(req: NextRequest) {
    return controller.criar(req);
}