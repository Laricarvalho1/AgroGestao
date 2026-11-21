import { OrdemServicoRepository } from "./ordemServicoRepository";
import { OrdemServico } from "./ordemServico";

export class OrdemServicoService {

    private ordemServicoRepository = new OrdemServicoRepository();

    async buscarTodos() {

        const ordensServico = await this.ordemServicoRepository.buscarTodos();

        return ordensServico;
    }

    async buscarId(id: number) {
        const ordemServico = await this.ordemServicoRepository.buscarId(id);

        if (!ordemServico) {
            throw new Error("Ordem de serviço não encontrada.");
        }

        return ordemServico;
    }

    async salvar(dados: {
        equipamentoId: number;
        tipoManutencao: "PREVENTIVA" | "CORRETIVA";
        horimetro: number;
        descricao: string;
    }) {
        // cria a OS com a data atual e o status aberta
        const ordemServico = new OrdemServico(
            null,
            dados.equipamentoId,
            dados.tipoManutencao,
            dados.horimetro,
            dados.descricao,
            new Date(),
            "ABERTA"
        );

        // o repository verifica o equipamento e salva a OS no banco
        return this.ordemServicoRepository.salvar(ordemServico);
    }

    async atualizar(id: number, dados: {
        tipoManutencao?: "PREVENTIVA" | "CORRETIVA";
        descricao?: string;
    }) {
        const ordemServico = await this.buscarId(id);

        // só altera os campos que foram informados e que são diferentes dos atuais
        if (dados.tipoManutencao !== undefined && dados.tipoManutencao !== ordemServico.getTipoManutencao()) {
            ordemServico.alterarTipoManutencao(dados.tipoManutencao);
        }

        if (dados.descricao !== undefined && dados.descricao !== ordemServico.getDescricao()) {
            ordemServico.alterarDescricao(dados.descricao);
        }

        return this.ordemServicoRepository.atualizar(ordemServico);
    }

    async buscarAbertaPorEquipamento(equipamentoId: number) {
        const ordemServico = await this.ordemServicoRepository.buscarAbertaPorEquipamento(equipamentoId);

        // se não tiver nenhuma OS aberta para esse equipamento, retorna um erro
        if (!ordemServico) {
            throw new Error("Ordem de serviço aberta não encontrada para o equipamento especificado.");
        }

        return ordemServico;
    }
}