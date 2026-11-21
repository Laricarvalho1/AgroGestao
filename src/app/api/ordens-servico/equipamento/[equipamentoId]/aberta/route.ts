import { NextRequest } from "next/server";
import { OrdemServicoController } from "@/modules/ordemServico/ordemServicoController";

const controller = new OrdemServicoController();

type Contexto = {
    params: Promise<{ equipamentoId: string }>
};

// busca a ordem de serviço aberta de um equipamento
export async function GET(req: NextRequest, contexto: Contexto) {

    const { equipamentoId } = await contexto.params;

    return controller.buscarAbertaPorEquipamento(Number(equipamentoId));
}