import {OrdemServico} from "./ordemServico";
import {db} from "@/db/db";
import { ordemServicoTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Equipamento } from "../equipamento/Equipamento";
import { EquipamentoStatusEnum } from "../equipamento/EquipamentoStatusEnum";
import { equipamentoTable } from "@/db/schema";


export class OrdemServicoRepository{

    // transforma os dados recebidos do banco em um objeto OrdemServico
    private transformarEmEntidade(dados: typeof ordemServicoTable.$inferSelect): OrdemServico {
        return new OrdemServico(
            dados.id,
            dados.equipamentoId,
            dados.tipoManutencao as "PREVENTIVA" | "CORRETIVA",
            Number(dados.horimetro),
            dados.descricao,
            new Date(dados.dataAbertura),
            dados.status as "ABERTA" | "ENCERRADA"
        );
    }


    async buscarId (id : number){
        const [dados] = await db.select().from(ordemServicoTable).where(eq(ordemServicoTable.id , id)).limit(1)

        if (!dados) {
            return null;
        }
        return this.transformarEmEntidade(dados);
    }

    async buscarTodos() {
        const dados = await db.select().from(ordemServicoTable);

        return dados.map((dados) => this.transformarEmEntidade(dados));
    }

    async salvar(ordemServico: OrdemServico) {

         if (ordemServico.getStatus() !== "ABERTA") {
            throw new Error("Uma nova ordem de serviço deve estar aberta.");
        }

        // usa uma transação para garantir que a OS e o equipamento sejam atualizados juntos
        // se alguma operação der erro, as alterações são desfeitas
        return await db.transaction(async (tx) => {

            // busca o equipamento e bloqueia o registro durante a transação
            const [dadosEquipamento] = await tx.select().from(equipamentoTable)
                .where(eq(equipamentoTable.id, ordemServico.getEquipamentoId()))
                .for("update");

            if (!dadosEquipamento) {
                throw new Error("Equipamento não encontrado.");
            }

            // verifica se o equipamento já possui uma OS aberta
            const [ordemAberta] = await tx.select().from(ordemServicoTable)
                .where(and(
                    eq(ordemServicoTable.equipamentoId, ordemServico.getEquipamentoId()),
                    eq(ordemServicoTable.status, "ABERTA")
                ))
                .limit(1);

            if (ordemAberta) {
                throw new Error("O equipamento já possui uma ordem de serviço aberta.");
            }

            // transforma os dados do banco em um objeto Equipamento
            const equipamento = new Equipamento(
                dadosEquipamento.id,
                dadosEquipamento.identificacao,
                Number(dadosEquipamento.horimetroAtual),
                dadosEquipamento.status as EquipamentoStatusEnum,
                dadosEquipamento.marca,
                dadosEquipamento.modelo,
                dadosEquipamento.anoFabricacao,
                dadosEquipamento.categoria,
                Number(dadosEquipamento.intervaloManutencao),
                dadosEquipamento.propriedadeId
            );

            // impede abrir uma OS se o equipamento estiver indisponível
            if (equipamento.getStatus() !== EquipamentoStatusEnum.DISPONIVEL) {
                throw new Error("O equipamento está indisponível.");
            }

            // utiliza seus métodos da Entity Equipamento
            equipamento.atualizarHorimetro(ordemServico.getHorimetro());
            equipamento.alterarStatus(EquipamentoStatusEnum.INDISPONIVEL);

            // salva a ordem de serviço
            const [dados] = await tx.insert(ordemServicoTable).values({
                equipamentoId: ordemServico.getEquipamentoId(),
                tipoManutencao: ordemServico.getTipoManutencao(),
                horimetro: String(ordemServico.getHorimetro()),
                descricao: ordemServico.getDescricao(),
                dataAbertura: ordemServico.getDataAbertura(),
                status: ordemServico.getStatus()
            }).returning();

            // atualiza o equipamento no banco
            await tx.update(equipamentoTable).set({
                horimetroAtual: String(equipamento.getHorimetroAtual()),
                status: equipamento.getStatus()}).where(eq(equipamentoTable.id, equipamento.getId()));

            return this.transformarEmEntidade(dados);
        });
    }

    async atualizar(ordemServico : OrdemServico){

        // só permite atualizar os dados de uma OS que ainda estiver aberta
        const [dados] = await db.update(ordemServicoTable).set({
            descricao: ordemServico.getDescricao(),
            tipoManutencao: ordemServico.getTipoManutencao()
        }).where(and(
            eq(ordemServicoTable.id, ordemServico.getId()),
            eq(ordemServicoTable.status, "ABERTA")
        )).returning();

        if (!dados) {
            throw new Error("Ordem de serviço não encontrada ou já encerrada.");
        }

        return this.transformarEmEntidade(dados);
    }

    async buscarAbertaPorEquipamento(equipamentoId: number) {

        // busca somente a OS que estiver aberta para o equipamento informado
        const [dados] = await db.select().from(ordemServicoTable).where(and(
                eq(ordemServicoTable.equipamentoId, equipamentoId),
                eq(ordemServicoTable.status, "ABERTA")
            )).limit(1);

        if (!dados) {
            return null;
        }

        return this.transformarEmEntidade(dados);
    }
}