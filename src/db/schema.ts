import { pgEnum, pgTable, timestamp, uuid, varchar, serial, numeric, integer, date, text, uniqueIndex } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const role = pgEnum("user_role_enum", [
  "ADMIN",
  "FIELD_MANAGER",
  "OPERATOR",
]);

export const userTable = pgTable("users", {
  id: uuid().$defaultFn(v7).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password_hash: varchar({ length: 255 }).notNull(),
  role: role().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const equipamentoTable = pgTable("tb_equipamentos",{
  id : serial("id").primaryKey(),
  identificacao : varchar("identificacao", {length : 100}).notNull(),
  horimetroAtual : numeric("horimetro_atual",{precision : 10, scale : 2}).notNull(),
  status : varchar("status", {length: 30, enum : ["DISPONIVEL", "INDISPONIVEL"]}).notNull(),
  marca: varchar("marca", { length: 100 }).notNull(),
  modelo: varchar("modelo", { length: 100 }).notNull(),
  anoFabricacao: integer("ano_fabricacao").notNull(),
  categoria: varchar("categoria", { length: 100 }).notNull(),
  intervaloManutencao: numeric("intervalo_manutencao", {precision: 10,scale: 2}).notNull(),
  propriedadeId: integer("propriedade_id").notNull().references(() => propriedadeTable.id),});

export const contratoVendaTable = pgTable("contrato_Venda", {
  id : serial("id").primaryKey(),
  comprador : varchar("comprador", {length : 150}).notNull(),
  valorTotal : numeric("valor_total", {precision : 10, scale : 2}).notNull(),
  safraId : integer("safra_id").notNull(),
  status : varchar("status",{length : 20, enum : ["PENDENTE", "CONFIRMADO", "CANCELADO"]}).notNull().default("PENDENTE"),
  propriedadeId: integer("propriedade_id").notNull(),
  quantidade: numeric("quantidade", {precision: 14, scale: 3}).notNull(),
  precoUnitario: numeric("preco_unitario", { precision: 14, scale: 4}).notNull(),
  unidadeMedida: varchar("unidade_medida", { length: 20}).notNull(),
  dataContrato: date("data_contrato", {mode: "string"}).notNull(),
  condicaoPagamento: varchar("condicao_pagamento", {length: 100}).notNull(),
  cpfCnpj: varchar("cpf_cnpj", {length: 18}),
  contato: varchar("contato", {length: 150}),
  justificativaCancelamento: text("justificativa_cancelamento")
})

export const ordemServicoTable = pgTable("tb_ordens_servico", {
  id: serial("id").primaryKey(),
  equipamentoId: integer("equipamento_id").notNull().references(() => equipamentoTable.id),
  tipoManutencao: varchar("tipo_manutencao", { length: 20, enum: ["PREVENTIVA", "CORRETIVA"] }).notNull(),
  horimetro: numeric("horimetro", { precision: 10, scale: 2 }).notNull(),
  descricao: text("descricao").notNull(),
  status: varchar("status", { length: 20, enum: ["ABERTA", "ENCERRADA"] }).notNull().default("ABERTA"),
  dataAbertura: timestamp("data_abertura").notNull().defaultNow(),
});
