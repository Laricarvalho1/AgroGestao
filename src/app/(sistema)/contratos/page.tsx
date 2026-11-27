"use client";

// Contratos de Venda (visão do Administrador)
//   GET    /api/sales-contracts                -> lista
//   POST   /api/sales-contracts                -> cria       (FormContrato)
//   PATCH  /api/sales-contracts/{id}           -> edita      (FormContrato, só Pendente)
//   POST   /api/sales-contracts/{id}/confirm   -> confirma   (ENDPOINT NOVO, ainda não existe)
//   POST   /api/sales-contracts/{id}/cancel    -> cancela    { reason }
//   DELETE /api/sales-contracts/{id}           -> exclui (só Pendente)
//   GET    /api/sales-contracts/balance?harvest_id=...  -> saldo da safra 

import { useState } from "react";
import { FiCheck, FiEdit2, FiPlus, FiTrash2, FiXCircle } from "react-icons/fi";
import Aviso from "@/components/ui/Aviso";
import Botao from "@/components/ui/Botao";
import CartaoIndicador from "@/components/ui/CartaoIndicador";
import Confirmar from "@/components/ui/Confirmar";
import SemAcesso from "@/components/ui/SemAcesso";
import Selo from "@/components/ui/Selo";
import { formatarData, formatarMoeda, formatarNumero, formatarPrecoUnitario, idCurto } from "@/lib/formatar";
import { requisitar } from "@/lib/http";
import { usePermissoes } from "@/lib/permissoes";
import {
  opcoesPropriedades,
  opcoesSafras,
  rotuloDe,
  URL_PROPRIEDADES,
  URL_SAFRAS,
  type Propriedade,
  type Safra,
} from "@/lib/referencias";
import { useLista } from "@/lib/useLista";
import FormContrato from "./FormContrato";
import { SITUACAO_CONTRATO, type Contrato, type StatusContrato } from "./tipos";

type MensagemAviso = { tipo: "sucesso" | "erro"; texto: string };
type Acao =
  | { tipo: "form"; contrato: Contrato | null }
  | { tipo: "confirmar" | "cancelar" | "excluir"; contrato: Contrato };

export default function PaginaContratos() {
  const permissoes = usePermissoes();

  if (!permissoes.verContratos) return <SemAcesso tela="Contratos e Vendas" />;
  return <ListaContratos />;
}

function ListaContratos() {
  const contratos = useLista<Contrato>("/api/sales-contracts");
  const propriedades = useLista<Propriedade>(URL_PROPRIEDADES);
  const safras = useLista<Safra>(URL_SAFRAS);

  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState<"TODOS" | StatusContrato>("TODOS");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [aviso, setAviso] = useState<MensagemAviso | null>(null);
  const [acao, setAcao] = useState<Acao | null>(null);

  const opcoesDePropriedades = opcoesPropriedades(propriedades.dados);
  const opcoesDeSafras = opcoesSafras(safras.dados);

  // ---------- filtros ----------
  const periodoInvalido = de !== "" && ate !== "" && de > ate;
  const termo = busca.trim().toLowerCase();

  const filtrados = contratos.dados
    .filter(
      (c) =>
        (situacao === "TODOS" || c.status === situacao) &&
        c.buyer.toLowerCase().includes(termo) &&
        (!de || c.contract_date >= de) &&
        (!ate || c.contract_date <= ate),
    )
    .sort((a, b) => b.contract_date.localeCompare(a.contract_date)); 

  // ---------- indicadores ----------
  const sucessoNaLista = !contratos.carregando && !contratos.erro;
  const contar = (status: StatusContrato) => contratos.dados.filter((c) => c.status === status).length;
  const valorConfirmado = contratos.dados
    .filter((c) => c.status === "CONFIRMED")
    .reduce((soma, c) => soma + c.total_amount, 0);

  // ---------- ações ----------
  function nomeDoContrato(c: Contrato): string {
    return `#${idCurto(c.id)} (${c.buyer})`;
  }

  function finalizar(mensagem: string) {
    setAcao(null);
    setAviso({ tipo: "sucesso", texto: mensagem });
    contratos.recarregar();
  }

  async function confirmar(c: Contrato) {
    await requisitar(`/api/sales-contracts/${c.id}/confirm`, { metodo: "POST" });
    finalizar(`Contrato ${nomeDoContrato(c)} confirmado.`);
  }

  async function cancelar(c: Contrato, motivo: string) {
    await requisitar(`/api/sales-contracts/${c.id}/cancel`, { metodo: "POST", corpo: { reason: motivo } });
    finalizar(`Contrato ${nomeDoContrato(c)} cancelado.`);
  }

  async function excluir(c: Contrato) {
    await requisitar(`/api/sales-contracts/${c.id}`, { metodo: "DELETE" });
    finalizar(`Contrato ${nomeDoContrato(c)} excluído.`);
  }
  
  function acoes(c: Contrato) {
    if (c.status === "CANCELLED") return null;

    return (
      <div className="flex flex-wrap gap-2">
        {c.status === "PENDING" && (
          <>
            <Botao variante="primario" onClick={() => setAcao({ tipo: "confirmar", contrato: c })}>
              <FiCheck aria-hidden="true" /> Confirmar
            </Botao>
            <Botao onClick={() => setAcao({ tipo: "form", contrato: c })} aria-label={`Editar contrato ${nomeDoContrato(c)}`}>
              <FiEdit2 aria-hidden="true" /> Editar
            </Botao>
          </>
        )}
        <Botao variante="perigo" onClick={() => setAcao({ tipo: "cancelar", contrato: c })} aria-label={`Cancelar contrato ${nomeDoContrato(c)}`}>
          <FiXCircle aria-hidden="true" /> Cancelar
        </Botao>
        {c.status === "PENDING" && (
          <Botao variante="perigo" onClick={() => setAcao({ tipo: "excluir", contrato: c })} aria-label={`Excluir contrato ${nomeDoContrato(c)}`}>
            <FiTrash2 aria-hidden="true" /> Excluir
          </Botao>
        )}
      </div>
    );
  }
  
  function origem(c: Contrato): string {
    return [rotuloDe(opcoesDeSafras, c.harvest_id), rotuloDe(opcoesDePropriedades, c.property_id)].filter(Boolean).join(" · ");
  }

  return (
    <div className="mx-auto flex min-w-0 max-w-[1440px] flex-col gap-6">
      <header className="flex flex-col gap-4 border-b border-[#bdc7b9] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#536052]">Comercial / Vendas da produção</p>
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Contratos e Vendas</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#536052]">
            Registre os contratos de venda da produção colhida e acompanhe a situação de cada um.
          </p>
        </div>
        <Botao variante="primario" onClick={() => setAcao({ tipo: "form", contrato: null })}>
          <FiPlus aria-hidden="true" /> Novo contrato
        </Botao>
      </header>

      {aviso && (
        <Aviso tipo={aviso.tipo} aoFechar={() => setAviso(null)}>
          {aviso.texto}
        </Aviso>
      )}

      <section aria-label="Indicadores" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CartaoIndicador titulo="Pendentes" valor={sucessoNaLista ? String(contar("PENDING")) : "—"} detalhe="Aguardando confirmação" tom="amarelo" />
        <CartaoIndicador titulo="Confirmados" valor={sucessoNaLista ? String(contar("CONFIRMED")) : "—"} />
        <CartaoIndicador titulo="Valor confirmado" valor={sucessoNaLista ? formatarMoeda(valorConfirmado) : "—"} detalhe="Soma dos contratos confirmados" />
      </section>

      <section className="overflow-hidden rounded-lg border border-[#bdc7b9] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#bdc7b9] bg-[#f8f7f6] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <input
              aria-label="Buscar por comprador"
              placeholder="Buscar por comprador..."
              className="min-h-11 min-w-0 flex-1 rounded-lg border border-[#bdc7b9] bg-white px-3 py-2 text-base outline-none focus:border-primary sm:max-w-xs"
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
                onChange={(e) => setSituacao(e.target.value as "TODOS" | StatusContrato)}
                className="min-h-11 rounded-lg border border-[#bdc7b9] bg-white px-3 py-2 text-base"
              >
                <option value="TODOS">Todos</option>
                <option value="PENDING">Pendentes</option>
                <option value="CONFIRMED">Confirmados</option>
                <option value="CANCELLED">Cancelados</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="filtro-de" className="text-sm">
                De:
              </label>
              <input
                id="filtro-de"
                type="date"
                value={de}
                onChange={(e) => setDe(e.target.value)}
                className="min-h-11 rounded-lg border border-[#bdc7b9] bg-white px-3 py-2 text-base"
              />
              <label htmlFor="filtro-ate" className="text-sm">
                até:
              </label>
              <input
                id="filtro-ate"
                type="date"
                value={ate}
                onChange={(e) => setAte(e.target.value)}
                className="min-h-11 rounded-lg border border-[#bdc7b9] bg-white px-3 py-2 text-base"
              />
            </div>
          </div>
          {periodoInvalido && <p className="text-sm text-red-700">A data inicial não pode ser maior que a data final.</p>}
        </div>

        {contratos.carregando && <p className="p-6 text-sm text-[#536052]">Carregando contratos...</p>}

        {contratos.erro && (
          <div className="flex flex-col items-start gap-3 p-4">
            <Aviso tipo="erro">{contratos.erro}</Aviso>
            <Botao onClick={contratos.recarregar}>Tentar novamente</Botao>
          </div>
        )}

        {sucessoNaLista && filtrados.length === 0 && (
          <p className="p-6 text-sm text-[#536052]">
            {contratos.dados.length === 0 ? "Nenhum contrato registrado ainda." : "Nenhum contrato encontrado para os filtros."}
          </p>
        )}

        {sucessoNaLista && filtrados.length > 0 && (
          <>
            {/* Computador e tablet: tabela */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f8f7f6] text-xs uppercase tracking-wide text-[#536052]">
                  <tr>
                    <th scope="col" className="px-4 py-3">Contrato</th>
                    <th scope="col" className="px-4 py-3">Data</th>
                    <th scope="col" className="px-4 py-3">Comprador</th>
                    <th scope="col" className="px-4 py-3 text-right">Quantidade</th>
                    <th scope="col" className="px-4 py-3 text-right">Preço unitário</th>
                    <th scope="col" className="px-4 py-3 text-right">Valor total</th>
                    <th scope="col" className="px-4 py-3">Situação</th>
                    <th scope="col" className="px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((c) => (
                    <tr key={c.id} className="border-t border-[#e3e8e0] align-top">
                      <td className="px-4 py-3 font-semibold">#{idCurto(c.id)}</td>
                      <td className="px-4 py-3">{formatarData(c.contract_date)}</td>
                      <td className="px-4 py-3">
                        {c.buyer}
                        {origem(c) && <span className="block text-xs text-[#536052]">{origem(c)}</span>}
                        <span className="block text-xs text-[#536052]">Pagamento: {c.payment_terms}</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatarNumero(c.quantity, 3)} {c.unit}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatarPrecoUnitario(c.unit_price)}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatarMoeda(c.total_amount)}</td>
                      <td className="px-4 py-3">
                        <Selo {...SITUACAO_CONTRATO[c.status]} />
                        {c.status === "CANCELLED" && c.cancellation_reason && (
                          <span className="mt-1 block max-w-48 text-xs break-words text-[#536052]">Motivo: {c.cancellation_reason}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{acoes(c)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Celular: cartões */}
            <ul className="flex flex-col gap-3 p-4 md:hidden">
              {filtrados.map((c) => {
                const botoes = acoes(c);
                return (
                  <li key={c.id} className="rounded-lg border border-[#bdc7b9] bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-base font-semibold break-words">{c.buyer}</p>
                        <p className="text-sm text-[#536052]">
                          #{idCurto(c.id)} · {formatarData(c.contract_date)}
                        </p>
                      </div>
                      <Selo {...SITUACAO_CONTRATO[c.status]} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <dt className="text-xs text-[#536052]">Quantidade</dt>
                        <dd>
                          {formatarNumero(c.quantity, 3)} {c.unit}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#536052]">Preço unitário</dt>
                        <dd>{formatarPrecoUnitario(c.unit_price)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#536052]">Valor total</dt>
                        <dd className="font-semibold">{formatarMoeda(c.total_amount)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#536052]">Pagamento</dt>
                        <dd>{c.payment_terms}</dd>
                      </div>
                    </dl>
                    {c.status === "CANCELLED" && c.cancellation_reason && (
                      <p className="mt-3 text-sm break-words text-[#536052]">Motivo do cancelamento: {c.cancellation_reason}</p>
                    )}
                    {botoes && <div className="mt-4">{botoes}</div>}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      {acao?.tipo === "form" && (
        <FormContrato
          contrato={acao.contrato}
          propriedades={opcoesDePropriedades}
          carregandoPropriedades={propriedades.carregando}
          safras={opcoesDeSafras}
          carregandoSafras={safras.carregando}
          aoCancelar={() => setAcao(null)}
          aoSalvar={finalizar}
        />
      )}

      {acao?.tipo === "confirmar" && (
        <Confirmar
          titulo="Confirmar contrato"
          mensagem={`Confirmar o contrato ${nomeDoContrato(acao.contrato)}, de ${formatarNumero(acao.contrato.quantity, 3)} ${acao.contrato.unit} no valor de ${formatarMoeda(acao.contrato.total_amount)}? A quantidade será abatida do saldo da safra e o contrato não poderá mais ser editado.`}
          textoConfirmar="Confirmar contrato"
          aoConfirmar={() => confirmar(acao.contrato)}
          aoCancelar={() => setAcao(null)}
        />
      )}

      {acao?.tipo === "cancelar" && (
        <Confirmar
          titulo="Cancelar contrato"
          mensagem={`Cancelar o contrato ${nomeDoContrato(acao.contrato)}? Ele continuará disponível para consulta como Cancelado.`}
          textoConfirmar="Cancelar contrato"
          perigo
          rotuloMotivo="Justificativa do cancelamento"
          aoConfirmar={(motivo) => cancelar(acao.contrato, motivo)}
          aoCancelar={() => setAcao(null)}
        />
      )}

      {acao?.tipo === "excluir" && (
        <Confirmar
          titulo="Excluir contrato"
          mensagem={`Deseja excluir o contrato pendente ${nomeDoContrato(acao.contrato)}? Esta ação não pode ser desfeita.`}
          textoConfirmar="Excluir"
          perigo
          aoConfirmar={() => excluir(acao.contrato)}
          aoCancelar={() => setAcao(null)}
        />
      )}
    </div>
  );
}
