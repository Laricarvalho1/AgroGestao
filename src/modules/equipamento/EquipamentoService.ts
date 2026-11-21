import { EquipamentoRepository } from "./EquipamentoRepository";
import { EquipamentoStatusEnum } from "./EquipamentoStatusEnum";
import { Equipamento } from "./Equipamento";


export class EquipamentoService {

    private equipamentoRepository = new EquipamentoRepository();

    async buscarTodos() {
        const equipamentos = await this.equipamentoRepository.buscarTodos();

        return equipamentos;
    }

    async buscarPorId(id : number){
        const equipamento = await this.equipamentoRepository.buscarPorId(id);

        if(!equipamento){
            throw new Error("Equipamento não encontrado.");
        }

        return equipamento;
    }

    async criar(dados: {
        identificacao: string;
        horimetroAtual: number;
        marca: string;
        modelo: string;
        anoFabricacao: number;
        categoria: string;
        intervaloManutencao: number;
        propriedadeId: number;}){

        // cria uma instância do equipamento sem id, validando os atributos antes de salvar no banco
        const equipamento = new Equipamento(
            null,
            dados.identificacao,
            dados.horimetroAtual,
            EquipamentoStatusEnum.DISPONIVEL,
            dados.marca,
            dados.modelo,
            dados.anoFabricacao,
            dados.categoria,
            dados.intervaloManutencao,
            dados.propriedadeId
        );
        // verifica se a identificação já existe nessa propriedade
        const equipamentoExistente = await this.equipamentoRepository.buscarPorIdentificacao(equipamento.getIdentificacao(), equipamento.getPropriedadeId());

        if (equipamentoExistente) {
            throw new Error("Já existe um equipamento com essa identificação na propriedade.");
        }

        return await this.equipamentoRepository.salvar(equipamento);
    }

    async atualizar(id: number, dados: {
        identificacao?: string;
        horimetroAtual?: number;
        marca?: string;
        modelo?: string;
        anoFabricacao?: number;
        categoria?: string;
        intervaloManutencao?: number;}){
        
        // controla se algum atributo do equipamento foi realmente alterado
        let houveAlteracao = false;
       
        // busca o equipamento no banco e recebe uma instância da classe para realizar as alterações
        const equipamento = await this.buscarPorId(id)

        // verifica quais atributos foram enviados e utiliza os métodos da classe para alterá-los
        if (dados.identificacao !== undefined && dados.identificacao !== equipamento.getIdentificacao()){

            equipamento.alterarIdentificacao(dados.identificacao);

            const equipamentoExistente = await this.equipamentoRepository.buscarPorIdentificacao(equipamento.getIdentificacao(),equipamento.getPropriedadeId());

            if (equipamentoExistente && equipamentoExistente.getId() !== equipamento.getId()) {
                throw new Error("Já existe um equipamento com essa identificação na propriedade.");
            }

            houveAlteracao = true;
        }

        if (dados.horimetroAtual !== undefined && dados.horimetroAtual !== equipamento.getHorimetroAtual()){

            equipamento.atualizarHorimetro(dados.horimetroAtual);
            houveAlteracao = true;
        }

        if (dados.marca !== undefined && dados.marca !== equipamento.getMarca()) {

            equipamento.alterarMarca(dados.marca);
            houveAlteracao = true;
        }

        if (dados.modelo !== undefined && dados.modelo !== equipamento.getModelo()) {

            equipamento.alterarModelo(dados.modelo);
            houveAlteracao = true;
        }

        if (dados.anoFabricacao !== undefined && dados.anoFabricacao !== equipamento.getAnoFabricacao()) {

            equipamento.alterarAnoFabricacao(dados.anoFabricacao);
            houveAlteracao = true;
        }

        if (dados.categoria !== undefined && dados.categoria !== equipamento.getCategoria()) {

            equipamento.alterarCategoria(dados.categoria);
            houveAlteracao = true;
        }

        if (dados.intervaloManutencao !== undefined && dados.intervaloManutencao !== equipamento.getIntervaloManutencao()) {

            equipamento.alterarIntervaloManutencao(dados.intervaloManutencao);
            houveAlteracao = true;
        }
        
        // evita atualizar o banco caso nenhuma informação do equipamento tenha sido modificada
        if (!houveAlteracao) {
            return equipamento;
        }

        return await this.equipamentoRepository.atualizar(equipamento);
        
    }

    async excluir(id : number){

        // verifica se o equipamento existe antes de solicitar sua exclusão no banco
        await this.buscarPorId(id);
        await this.equipamentoRepository.excluir(id);
    }
}