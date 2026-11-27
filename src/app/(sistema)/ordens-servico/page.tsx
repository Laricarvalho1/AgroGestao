"use client";

// Ordens de Serviço (manutenção das máquinas)
//   GET    /api/service-orders             -> lista
//   POST   /api/service-orders             -> abre OS         (FormOS)
//   PATCH  /api/service-orders/{id}        -> edita OS        (FormOS)
//   PATCH  /api/service-orders/{id}/close  -> encerra OS      (FormEncerrarOS)
//   DELETE /api/service-orders/{id}        -> exclui OS aberta e sem custos
//   GET    /api/equipments                 -> nome das máquinas e máquinas disponíveis
//
// Visões por perfil:
//   Gerente/Administrador: abre, edita, encerra e exclui, e vê os custos.
//   Operador: só consulta (sem botões de ação e sem valores).

import { useState } from "react";
import { FiCheckSquare, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import Aviso from "@/components/ui/Aviso";
import Botao from "@/components/ui/Botao";
import CartaoIndicador from "@/components/ui/CartaoIndicador";
import Confirmar from "@/components/ui/Confirmar";
import Selo from "@/components/ui/Selo";
import { formatarData, formatarMoeda, formatarNumero } from "@/lib/formatar";
import { requisitar } from "@/lib/http";
import { usePermissoes } from "@/lib/permissoes";
import { opcoesSafras, URL_SAFRAS, type Safra } from "@/lib/referencias";
import { useLista } from "@/lib/useLista";
import type { Equipamento } from "../frota/tipos";
import FormEncerrarOS from "./FormEncerrarOS";
import FormOS from "./FormOS";
import { podeExcluir, ROTULO_TIPO, SITUACAO_ORDEM, type OrdemServico, type StatusOrdem } from "./tipos";

type MensagemAviso = { tipo: "sucesso" | "erro"; texto: string };
type Acao =
  | { tipo: "form"; ordem: OrdemServico | null }
  | { tipo: "encerrar"; ordem: OrdemServico }
  | { tipo: "excluir"; ordem: OrdemServico };

export default function PaginaOrdensServico() {
  const permissoes = usePermissoes();
  const podeGerenciar = permissoes.gerenciarOrdens;
  const verCustos = permissoes.verCustosOrdens;

  const ordens = useLista<OrdemServico>("/api/service-orders");
  const equipamentos = useLista<Equipamento>("/api/equipments");
  const safras = useLista<Safra>(URL_SAFRAS);

  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState<"TODAS" | StatusOrdem>("TODAS");
  const [aviso, setAviso] = useState<MensagemAviso | null>(null);
  const [acao, setAcao] = useState<Acao | null>(null);

  // ---------- dados da tela ----------
  function nomeDoEquipamento(id: string): string {
    const e = equipamentos.dados.find((item) => item.id === id);
    if (e) return e.identification;
    return equipamentos.carregando ? "..." : "Equipamento não encontrado";
  }

  function detalheDoEquipamento(id: string): string {
    const e = equipamentos.dados.find((item) => item.id === id);
    return e ? `${e.brand} ${e.model}` : "";
  }

  const termo = busca.trim().toLowerCase();
  const filtradas = ordens.dados
    .filter(
      (o) =>
        (situacao === "TODAS" || o.status === situacao) &&
        (nomeDoEquipamento(o.equipment_id).toLowerCase().includes(termo) || o.description.toLowerCase().includes(termo)),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at)); 

  const sucessoNaLista = !ordens.carregando && !ordens.erro;
  const contar = (status: StatusOrdem) => String(ordens.dados.filter((o) => o.status === status).length);

  function recarregarTudo() {
    ordens.recarregar();
    equipamentos.recarregar(); 
  }

  function depoisDeSalvar(mensagem: string) {
    setAcao(null);
    setAviso({ tipo: "sucesso", texto: mensagem });
    recarregarTudo();
  }

  async function excluir(ordem: OrdemServico) {
    await requisitar(`/api/service-orders/${ordem.id}`, { metodo: "DELETE" });
    depoisDeSalvar(`Ordem de serviço de ${nomeDoEquipamento(ordem.equipment_id)} excluída.`);
  }

  // Botões de cada OS (usados na tabela e nos cartões)
  function acoes(ordem: OrdemServico) {
    if (!podeGerenciar || ordem.status === "COMPLETED") return null;

    return (
      <div className="flex flex-wrap gap-2">
        <Botao variante="primario" onClick={() => setAcao({ tipo: "encerrar", ordem })}>
          <FiCheckSquare aria-hidden="true" /> Encerrar
        </Botao>
        <Botao onClick={() => setAcao({ tipo: "form", ordem })} aria-label={`Editar OS de ${nomeDoEquipamento(ordem.equipment_id)}`}>
          <FiEdit2 aria-hidden="true" /> Editar
        </Botao>
        {podeExcluir(ordem) && (
          <Botao
            variante="perigo"
            onClick={() => setAcao({ tipo: "excluir", ordem })}
            aria-label={`Excluir OS de ${nomeDoEquipamento(ordem.equipment_id)}`}
          >
            <FiTrash2 aria-hidden="true" /> Excluir
          </Botao>
        )}
      </div>
    );
  }

  const mostrarColunaAcoes = podeGerenciar;

  return (
    <div className="mx-auto flex min-w-0 max-w-[1440px] flex-col gap-6">
      <header className="flex flex-col gap-4 border-b border-[#bdc7b9] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#536052]">
            Operações agrícolas / Manutenção
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Ordens de Serviço</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#536052]">
            {podeGerenciar
              ? "Abra, acompanhe e encerre as manutenções preventivas e corretivas das máquinas."
              : "Acompanhe as manutenções em andamento nas máquinas."}
          </p>
        </div>
        {podeGerenciar && (
          <Botao variante="primario" onClick={() => setAcao({ tipo: "form", ordem: null })}>
            <FiPlus aria-hidden="true" /> Abrir OS
          </Botao>
        )}
      </header>

      {aviso && (
        <Aviso tipo={aviso.tipo} aoFechar={() => setAviso(null)}>
          {aviso.texto}
        </Aviso>
      )}

      <section aria-label="Indicadores" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CartaoIndicador titulo="Abertas" valor={sucessoNaLista ? contar("OPEN") : "—"} tom="amarelo" />
        <CartaoIndicador titulo="Em manutenção" valor={sucessoNaLista ? contar("IN_MAINTENANCE") : "—"} tom="amarelo" />
        <CartaoIndicador titulo="Concluídas" valor={sucessoNaLista ? contar("COMPLETED") : "—"} />
      </section>

      <section className="overflow-hidden rounded-lg border border-[#bdc7b9] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#bdc7b9] bg-[#f8f7f6] p-4 sm:flex-row sm:items-center">
          <input
            aria-label="Buscar ordem de serviço"
            placeholder="Buscar por equipamento ou descrição..."
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-[#bdc7b9] bg-white px-3 py-2 text-base outline-none focus:border-primary sm:max-w-md"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <label htmlFor="filtro-situacao" className="text-sm">
              Situação:
            </label>
            <select
              id="filtro-situacao"
              value={situacao}
              onChange={(e) => setSituacao(e.target.value as "TODAS" | StatusOrdem)}
              className="min-h-11 rounded-lg border border-[#bdc7b9] bg-white px-3 py-2 text-base"
            >
              <option value="TODAS">Todas</option>
              <option value="OPEN">Aberta</option>
              <option value="IN_MAINTENANCE">Em manutenção</option>
              <option value="COMPLETED">Concluída</option>
            </select>
          </div>
        </div>

        {ordens.carregando && <p className="p-6 text-sm text-[#536052]">Carregando ordens de serviço...</p>}

        {ordens.erro && (
          <div className="flex flex-col items-start gap-3 p-4">
            <Aviso tipo="erro">{ordens.erro}</Aviso>
            <Botao onClick={ordens.recarregar}>Tentar novamente</Botao>
          </div>
        )}

        {sucessoNaLista && filtradas.length === 0 && (
          <p className="p-6 text-sm text-[#536052]">
            {ordens.dados.length === 0 ? "Nenhuma ordem de serviço registrada ainda." : "Nenhuma ordem encontrada para os filtros."}
          </p>
        )}

        {sucessoNaLista && filtradas.length > 0 && (
          <>
            {/* Computador e tablet: tabela */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f8f7f6] text-xs uppercase tracking-wide text-[#536052]">
                  <tr>
                    <th scope="col" className="px-4 py-3">Equipamento</th>
                    <th scope="col" className="px-4 py-3">Tipo</th>
                    <th scope="col" className="px-4 py-3">Descrição</th>
                    <th scope="col" className="px-4 py-3 text-right">Horímetro</th>
                    <th scope="col" className="px-4 py-3">Abertura</th>
                    <th scope="col" className="px-4 py-3">Situação</th>
                    {verCustos && <th scope="col" className="px-4 py-3 text-right">Custo total</th>}
                    {mostrarColunaAcoes && <th scope="col" className="px-4 py-3">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((o) => (
                    <tr key={o.id} className="border-t border-[#e3e8e0] align-top">
                      <td className="px-4 py-3 font-semibold">
                        {nomeDoEquipamento(o.equipment_id)}
                        <span className="block text-xs font-normal text-[#536052]">{detalheDoEquipamento(o.equipment_id)}</span>
                      </td>
                      <td className="px-4 py-3">{ROTULO_TIPO[o.maintenance_type]}</td>
                      <td className="max-w-xs px-4 py-3 break-words">{o.description}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatarNumero(o.hour_meter)} h</td>
                      <td className="px-4 py-3">{formatarData(o.created_at)}</td>
                      <td className="px-4 py-3">
                        <Selo {...SITUACAO_ORDEM[o.status]} />
                      </td>
                      {verCustos && (
                        <td className="px-4 py-3 text-right tabular-nums">
                          {o.status === "COMPLETED" ? formatarMoeda(o.total_cost) : "—"}
                        </td>
                      )}
                      {mostrarColunaAcoes && <td className="px-4 py-3">{acoes(o)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {}
            <ul className="flex flex-col gap-3 p-4 md:hidden">
              {filtradas.map((o) => {
                const botoes = acoes(o);
                return (
                <li key={o.id} className="rounded-lg border border-[#bdc7b9] bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-base font-semibold">{nomeDoEquipamento(o.equipment_id)}</p>
                      <p className="text-sm text-[#536052]">{detalheDoEquipamento(o.equipment_id)}</p>
                    </div>
                    <Selo {...SITUACAO_ORDEM[o.status]} />
                  </div>
                  <p className="mt-3 text-base break-words">{o.description}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-[#536052]">Tipo</dt>
                      <dd>{ROTULO_TIPO[o.maintenance_type]}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#536052]">Abertura</dt>
                      <dd>{formatarData(o.created_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#536052]">Horímetro</dt>
                      <dd>{formatarNumero(o.hour_meter)} h</dd>
                    </div>
                    {verCustos && o.status === "COMPLETED" && (
                      <div>
                        <dt className="text-xs text-[#536052]">Custo total</dt>
                        <dd>{formatarMoeda(o.total_cost)}</dd>
                      </div>
                    )}
                  </dl>
                  {botoes && <div className="mt-4">{botoes}</div>}
                </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      {acao?.tipo === "form" && (
        <FormOS ordem={acao.ordem} equipamentos={equipamentos.dados} aoCancelar={() => setAcao(null)} aoSalvar={depoisDeSalvar} />
      )}

      {acao?.tipo === "encerrar" && (
        <FormEncerrarOS
          ordem={acao.ordem}
          nomeEquipamento={nomeDoEquipamento(acao.ordem.equipment_id)}
          safras={opcoesSafras(safras.dados)}
          carregandoSafras={safras.carregando}
          aoCancelar={() => setAcao(null)}
          aoSalvar={depoisDeSalvar}
        />
      )}

      {acao?.tipo === "excluir" && (
        <Confirmar
          titulo="Excluir ordem de serviço"
          mensagem={`Deseja excluir a ordem de serviço de ${nomeDoEquipamento(acao.ordem.equipment_id)} (${acao.ordem.description})? O equipamento volta a ficar disponível. Esta ação não pode ser desfeita.`}
          textoConfirmar="Excluir"
          perigo
          aoConfirmar={() => excluir(acao.ordem)}
          aoCancelar={() => setAcao(null)}
        />
      )}
    </div>
  );
}
