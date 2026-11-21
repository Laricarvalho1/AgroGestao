import { NextRequest } from "next/server";
import { OrdemServicoController } from "@/modules/ordemServico/ordemServicoController";

const controller = new OrdemServicoController();

// busca todas as ordens de serviço
export async function GET() {
    return controller.buscarTodos();
}

// cadastra uma nova ordem de serviço
export async function POST(req: NextRequest) {
    return controller.salvar(req);
}