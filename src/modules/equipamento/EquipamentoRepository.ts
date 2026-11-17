import { Equipamento } from "./Equipamento";
import { EquipamentoStatusEnum } from "./EquipamentoStatusEnum";
import { db } from "@/db/db";
import { equipamentoTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export class EquipamentoRepository {

    private transformarEmEntidade(dados: typeof equipamentoTable.$inferSelect): Equipamento { // transforma as informacoes do Drizzle em uma instancia da classe equipamento, afim de permitir a alteração de informações dele
        return new Equipamento(
            dados.id,
            dados.identificacao,
            Number(dados.horimetroAtual),
            dados.status as EquipamentoStatusEnum
        );
    }
    
    async buscarPorId(id : number){ // busca no banco o equipamento utilizando o id
       const [dados] = await db.select().from(equipamentoTable).where(eq(equipamentoTable.id, id)).limit(1);

        if (!dados) {
            return null;
        }

         return this.transformarEmEntidade(dados);
    }
    
    async buscarTodos() { //envia todos os equipamentos registrados em forma de objeto para o service 
        const equipamentos =  await db.select().from(equipamentoTable)

        // transforma cada registro encontrado no banco em uma instância da classe equipamento
         return equipamentos.map(equipamento =>
            this.transformarEmEntidade(equipamento)
        );
    }

    async salvar(equipamento : Equipamento){ //cria o equipamento com seus atributos
        
        const [dados] = await db.insert(equipamentoTable).values({
            identificacao: equipamento.getIdentificacao(),
            horimetroAtual: String(equipamento.getHorimetroAtual()),
            status: equipamento.getStatus()
        })

        // retorna os dados do equipamento cadastrado, incluindo o id gerado pelo banco
        .returning();

         return this.transformarEmEntidade(dados);
    }

    async atualizar(equipamento : Equipamento){//recebe um objeto equipamento, copia ele para o const dados enviar pro banco de dados e retorna o objeto dados atualizado de volta
       
         // identifica qual equipamento será atualizado utilizando o seu id e define o que será atualizado
        const [dados] = await db.update(equipamentoTable).set({
            identificacao: equipamento.getIdentificacao(),
            horimetroAtual: String(equipamento.getHorimetroAtual()),
            status: equipamento.getStatus()
        })  
        .where(eq(equipamentoTable.id, equipamento.getId()))
        .returning();


         return this.transformarEmEntidade(dados);
    }

    async excluir(id: number){
            
        await db.delete(equipamentoTable).where(eq(equipamentoTable.id, id))

    }
}