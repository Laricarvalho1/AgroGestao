// O que cada perfil pode fazer nas telas de Frota, Ordens de Serviço e Contratos.
// Baseado no documento de requisitos (RF-073 a RF-076, RF-072, RF-092 e mapa de telas 3.3.1.2).
//
// O perfil vem de PERFIL_ATUAL (components/menus.ts), que hoje é fixo ("administrador").
// TODO: Quando o login passar a informar o perfil real: ajustar usePermissoes() aqui.

import { PERFIL_ATUAL, type Perfil } from "@/components/menus";

export function permissoesDo(perfil: Perfil) {
  const admin = perfil === "administrador";
  const gerenteOuAdmin = admin || perfil === "gerente";

  return {
    verFrota: gerenteOuAdmin, // Operador não tem Frota no menu
    gerenciarFrota: gerenteOuAdmin, // cadastrar, editar e excluir equipamentos
    gerenciarOrdens: gerenteOuAdmin, // abrir, editar, excluir e encerrar OS
    verCustosOrdens: gerenteOuAdmin, // Operador vê a OS, mas não os valores
    verContratos: admin, // Contratos/Vendas: só Administrador
  };
}

export function usePermissoes() {
  return permissoesDo(PERFIL_ATUAL);
}
