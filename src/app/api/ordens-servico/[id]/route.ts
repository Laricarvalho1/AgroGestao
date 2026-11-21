import { NextRequest } from "next/server";
import { OrdemServicoController } from "@/modules/ordemServico/ordemServicoController";

const controller = new OrdemServicoController();

type Contexto = {
    params: Promise<{ id: string }>
};

// busca uma ordem de serviço pelo ID
export async function GET(req: NextRequest, contexto: Contexto) {

    const { id } = await contexto.params;

    return controller.buscarPorId(Number(id));
}

// atualiza uma ordem de serviço
export async function PATCH(req: NextRequest, contexto: Contexto) {

    const { id } = await contexto.params;

    return controller.atualizar(Number(id), req);
}