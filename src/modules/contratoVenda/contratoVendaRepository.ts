import { ContratoVenda } from "./contratoVenda";
import { db } from "@/db/db";
import { contratoVendaTable } from "@/db/schema";
import { eq ,and} from "drizzle-orm";
import { culturaTable } from "@/db/schema";
import { safraTable } from "@/db/schema";
import { talhaoTable } from "@/db/schema";
import { propriedadeTable } from "@/db/schema";



export class ContratoVendaRepository{

        // transforma os dados que vieram do banco em um objeto ContratoVenda
        private transformarEmEntidade(dados: typeof contratoVendaTable.$inferSelect): ContratoVenda {
            return new ContratoVenda(
                dados.id,
                dados.comprador,
                Number(dados.quantidade),
                Number(dados.precoUnitario),
                dados.unidadeMedida,
                dados.dataContrato,
                dados.safraId,
                dados.propriedadeId,
                dados.condicaoPagamento,
                dados.cpfCnpj,
                dados.contato,
                dados.status,
                dados.justificativaCancelamento
        )};

        async buscarId (id : number){

                const [dados] = await db.select().from(contratoVendaTable).where(eq(contratoVendaTable.id , id)).limit(1)

                if (!dados) {
                        return null;
                }

                return this.transformarEmEntidade(dados);
        }

        async buscarTodos() {
                const dados = await db.select().from(contratoVendaTable);

                return dados.map(dados => this.transformarEmEntidade(dados))
        }

        async salvar(contratoVenda : ContratoVenda){
                // converte os valores numericos para string pq o numeric do drizzle trabalha com string
                const [dados] = await db.insert(contratoVendaTable).values({
                       comprador: contratoVenda.getComprador(),
                       valorTotal : String(contratoVenda.getValorTotal()),
                       quantidade: String(contratoVenda.getQuantidade()),
                       precoUnitario : String(contratoVenda.getPrecoUnitario()),
                       unidadeMedida : contratoVenda.getUnidadeMedida(),
                       dataContrato : contratoVenda.getDataContrato(),
                       safraId : contratoVenda.getSafraId(),
                       propriedadeId : contratoVenda.getPropriedadeId(),
                       condicaoPagamento : contratoVenda.getCondicaoPagamento(),
                       cpfCnpj : contratoVenda.getCpfCnpj(),
                       contato : contratoVenda.getContato(),
                       status : contratoVenda.getStatus(),
                       justificativaCancelamento: contratoVenda.getJustificativaCancelamento()
                }).returning();

                return this.transformarEmEntidade(dados)
        }

        async buscarComFiltros(filtros: {
                comprador?: string,
                safraId?: number,
                propriedadeId?: number,
                status?: "PENDENTE" | "CONFIRMADO" | "CANCELADO",
                dataInicio?: string,
                dataFim?: string}) {

                const contratos = await this.buscarTodos();

                // filtra os contratos de acordo com os dados informados, se não tiver o filtro ele ignora
                return contratos.filter(contrato => {

                        // compara o nome do comprador sem diferenciar maiusculas e minusculas
                        if (filtros.comprador !== undefined && !contrato.getComprador().toLowerCase().includes(filtros.comprador.toLowerCase())) {
                                return false;
                        }

                        if (filtros.safraId !== undefined && contrato.getSafraId() !== filtros.safraId) {
                                return false;
                        }

                        if (filtros.propriedadeId !== undefined && contrato.getPropriedadeId() !== filtros.propriedadeId) {
                                return false;
                        }

                        if (filtros.status !== undefined && contrato.getStatus() !== filtros.status) {
                                return false;           
                        }

                        // verifica se o contrato está dentro do periodo informado
                        if (filtros.dataInicio !== undefined && contrato.getDataContrato() < filtros.dataInicio) {
                                return false;
                        }

                        if (filtros.dataFim !== undefined && contrato.getDataContrato() > filtros.dataFim) {
                                return false;
                        }

                        return true;
                });
        }

        async atualizar(contratoVenda : ContratoVenda){
                const [dados] = await db.update(contratoVendaTable).set({
                       comprador: contratoVenda.getComprador(),
                       valorTotal : String(contratoVenda.getValorTotal()),
                       quantidade: String(contratoVenda.getQuantidade()),
                       precoUnitario : String(contratoVenda.getPrecoUnitario()),
                       unidadeMedida : contratoVenda.getUnidadeMedida(),
                       dataContrato : contratoVenda.getDataContrato(),
                       safraId : contratoVenda.getSafraId(),
                       propriedadeId : contratoVenda.getPropriedadeId(),
                       condicaoPagamento : contratoVenda.getCondicaoPagamento(),
                       cpfCnpj : contratoVenda.getCpfCnpj(),
                       contato : contratoVenda.getContato(),
                // só atualiza o contrato se ele ainda estiver pendente
                }).where(and(eq(contratoVendaTable.id, contratoVenda.getId()), eq(contratoVendaTable.status, "PENDENTE"))).returning();

                if (!dados) {
                        throw new Error("Contrato não encontrado ou não está pendente.");
                }

                return this.transformarEmEntidade(dados)
        }

        async buscarDadosSafra(safraId: number) {

                // junta as tabelas pra buscar o status da safra, a propriedade e a unidade de medida da cultura
                const [dados] = await db.select({status: safraTable.status, propriedadeId: talhaoTable.propriedadeId, unidadeMedida: culturaTable.unidadeMedida})
                .from(safraTable)
                .innerJoin(talhaoTable, eq(safraTable.talhaoId, talhaoTable.id))
                .innerJoin(culturaTable, eq(safraTable.culturaId, culturaTable.id))
                .innerJoin(propriedadeTable, eq(talhaoTable.propriedadeId, propriedadeTable.id))
                .where(eq(safraTable.id, safraId))
                .limit(1);

                if (!dados) {
                        return null;
                }

                return dados;

        }

        async cancelarContrato(contratoVenda: ContratoVenda) {

                // só permite cancelar no banco se o contrato estiver pendente
                const [dados] = await db.update(contratoVendaTable).set({
                        status: contratoVenda.getStatus(),
                        justificativaCancelamento: contratoVenda.getJustificativaCancelamento()})
                        .where(and(eq(contratoVendaTable.id, contratoVenda.getId()),eq(contratoVendaTable.status, "PENDENTE"))).returning();

                if (!dados) {
                        throw new Error("Contrato não encontrado ou não está pendente.");
                }

                return this.transformarEmEntidade(dados);
        }
}