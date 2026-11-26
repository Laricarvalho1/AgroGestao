// Itens do Menu de cada perfil

import type { IconType } from "react-icons";
import {
  MdAgriculture,
  MdBarChart,
  MdBuild,
  MdDashboard,
  MdGrass,
  MdHandshake,
  MdHome,
  MdInventory,
  MdMap,
  MdAttachMoney,
  MdShoppingCart,
} from "react-icons/md";

export type Perfil = "administrador" | "gerente" | "operador";

export type ItemMenu = {
  rotulo: string; // texto que aparece no menu
  href: string; // endereço da página
  icone: IconType; // ícone do react-icons
};

export const MENUS: Record<Perfil, ItemMenu[]> = {
  // Os 9 itens do Administrador (card QA-01)
  administrador: [
    { rotulo: "Dashboard", href: "/dashboard", icone: MdDashboard },
    { rotulo: "Propriedades e Talhões", href: "/propriedades", icone: MdMap },
    { rotulo: "Safras", href: "/safras", icone: MdGrass },
    { rotulo: "Insumos/Estoque", href: "/estoque", icone: MdInventory },
    { rotulo: "Frota", href: "/frota", icone: MdAgriculture },
    { rotulo: "Ordens de Serviço", href: "/ordens-servico", icone: MdBuild },
    { rotulo: "Fornecedores/Compras", href: "/compras", icone: MdShoppingCart },
    { rotulo: "Contratos/Vendas", href: "/contratos", icone: MdHandshake },
    { rotulo: "Financeiro", href: "/financeiro", icone: MdAttachMoney },
    { rotulo: "DRE Operacional", href: "/dre", icone: MdBarChart },
  ],
  // Não definido nos documentos: confirmar com o grupo
  gerente: [
    { rotulo: "Início", href: "/gerente", icone: MdHome },
    { rotulo: "Estoque", href: "/estoque", icone: MdInventory },
    { rotulo: "Safras", href: "/safras", icone: MdGrass },
    { rotulo: "Frota", href: "/frota", icone: MdAgriculture },
  ],
  // Os 4 itens do Operador (card QA-03)
  operador: [
    { rotulo: "Início", href: "/operador", icone: MdHome },
    { rotulo: "Insumos", href: "/manejo", icone: MdInventory },
    { rotulo: "Ordens de Serviço", href: "/ordens-servico", icone: MdBuild },
    { rotulo: "Colheita", href: "/colheita", icone: MdAgriculture },
  ],
};

// TODO: trocar pelo perfil do usuário logado quando o login guardar essa informação
export const PERFIL_ATUAL: Perfil = "administrador";

// Diz se o item do menu deve aparecer "aceso" na página atual
export function estaAtivo(href: string, caminhoAtual: string) {
  return caminhoAtual === href || caminhoAtual.startsWith(href + "/");
}
