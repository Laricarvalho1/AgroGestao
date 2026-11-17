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

    async criar(dados : {identificacao: string; horimetroAtual: number; status:  EquipamentoStatusEnum;}){

        // cria uma instância do equipamento sem id, validando os atributos antes de salvar no banco
        const equipamento = new Equipamento(null,dados.identificacao,dados.horimetroAtual,dados.status);

        return await this.equipamentoRepository.salvar(equipamento);
    }

    async atualizar(id : number, dados : {identificacao?: string; horimetroAtual?: number; status?: EquipamentoStatusEnum;}){
        
        // controla se algum atributo do equipamento foi realmente alterado
        let houveAlteracao = false;
       
        // busca o equipamento no banco e recebe uma instância da classe para realizar as alterações
        const equipamento = await this.buscarPorId(id)

        // verifica quais atributos foram enviados e utiliza os métodos da classe para alterá-los
        if (dados.identificacao !== undefined && dados.identificacao !== equipamento.getIdentificacao()){

            equipamento.alterarIdentificacao(dados.identificacao);
            houveAlteracao = true;

        }
        if (dados.horimetroAtual !== undefined && dados.horimetroAtual !== equipamento.getHorimetroAtual()){

            equipamento.atualizarHorimetro(dados.horimetroAtual);
            houveAlteracao = true;;
            
        }
        if (dados.status !== undefined && dados.status !== equipamento.getStatus()){

            equipamento.alterarStatus(dados.status);
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