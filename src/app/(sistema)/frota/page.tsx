"use client";

// Frota e Maquinário
//   GET    /api/equipments        -> lista
//   POST   /api/equipments        -> cadastra   (FormEquipamento)
//   PATCH  /api/equipments/{id}   -> edita      (FormEquipamento)
//   DELETE /api/equipments/{id}   -> exclui
// O status (Disponível/Indisponível) é controlado pelas Ordens de Serviço, não é editado aqui.

import { useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import Aviso from "@/components/ui/Aviso";
import Botao from "@/components/ui/Botao";
import CartaoIndicador from "@/components/ui/CartaoIndicador";
import Confirmar from "@/components/ui/Confirmar";
import SemAcesso from "@/components/ui/SemAcesso";
import Selo from "@/components/ui/Selo";
import { formatarNumero } from "@/lib/formatar";
import { requisitar } from "@/lib/http";
import { usePermissoes } from "@/lib/permissoes";
import { opcoesPropriedades, URL_PROPRIEDADES, type Propriedade } from "@/lib/referencias";
import { useLista } from "@/lib/useLista";
import FormEquipamento from "./FormEquipamento";
import { SITUACAO_EQUIPAMENTO, type Equipamento, type StatusEquipamento } from "./tipos";

type MensagemAviso = { tipo: "sucesso" | "erro"; texto: string };

export default function PaginaFrota() {
  const permissoes = usePermissoes();

  if (!permissoes.verFrota) return <SemAcesso tela="Frota e Maquinário" />;
  return <ListaFrota podeGerenciar={permissoes.gerenciarFrota} />;
}

function ListaFrota({ podeGerenciar }: { podeGerenciar: boolean }) {
  const equipamentos = useLista<Equipamento>("/api/equipments");
  const propriedades = useLista<Propriedade>(URL_PROPRIEDADES);

  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState<"TODOS" | StatusEquipamento>("TODOS");
  const [aviso, setAviso] = useState<MensagemAviso | null>(null);
  const [formulario, setFormulario] = useState<{ equipamento: Equipamento | null } | null>(null);
  const [excluindo, setExcluindo] = useState<Equipamento | null>(null);

  const termo = busca.trim().toLowerCase();
  const filtrados = equipamentos.dados
    .filter(
      (e) =>
        (situacao === "TODOS" || e.status === situacao) &&
        [e.identification, e.brand, e.model, e.category].some((texto) => texto.toLowerCase().includes(termo)),
    )
    .sort((a, b) => a.identification.localeCompare(b.identification));

  const total = equipamentos.dados.length;
  const disponiveis = equipamentos.dados.filter((e) => e.status === "AVAILABLE").length;
  const sucessoNaLista = !equipamentos.carregando && !equipamentos.erro; // só mostra números se a lista carregou

  function depoisDeSalvar(mensagem: string) {
    setFormulario(null);
    setAviso({ tipo: "sucesso", texto: mensagem });
    equipamentos.recarregar();
  }

  async function excluir(equipamento: Equipamento) {
    await requisitar(`/api/equipments/${equipamento.id}`, { metodo: "DELETE" });
    setExcluindo(null);
    setAviso({ tipo: "sucesso", texto: `Equipamento ${equipamento.identification} excluído.` });
    equipamentos.recarregar();
  }

  // Botões de cada equipamento (usados na tabela e nos cartões)
  function acoes(equipamento: Equipamento) {
    return (
      <div className="flex flex-wrap gap-2">
        <Botao onClick={() => setFormulario({ equipamento })} aria-label={`Editar ${equipamento.identification}`}>
          <FiEdit2 aria-hidden="true" /> Editar
        </Botao>
        <Botao
          variante="perigo"
          onClick={() => setExcluindo(equipamento)}
          aria-label={`Excluir ${equipamento.identification}`}
        >
          <FiTrash2 aria-hidden="true" /> Excluir
        </Botao>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-w-0 max-w-[1440px] flex-col gap-6">
      <header className="flex flex-col gap-4 border-b border-[#bdc7b9] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#536052]">
            Operações agrícolas / Equipamentos
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Frota e Maquinário</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#536052]">
            Cadastre e acompanhe as máquinas, tratores e implementos da propriedade.
          </p>
        </div>
        {podeGerenciar && (
          <Botao variante="primario" onClick={() => setFormulario({ equipamento: null })}>
            <FiPlus aria-hidden="true" /> Novo equipamento
          </Botao>
        )}
      </header>

      {aviso && (
        <Aviso tipo={aviso.tipo} aoFechar={() => setAviso(null)}>
          {aviso.texto}
        </Aviso>
      )}

      <section aria-label="Indicadores" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CartaoIndicador titulo="Equipamentos cadastrados" valor={sucessoNaLista ? String(total) : "—"} />
        <CartaoIndicador titulo="Disponíveis" valor={sucessoNaLista ? String(disponiveis) : "—"} detalhe="Prontos para uso" />
        <CartaoIndicador
          titulo="Em manutenção"
          valor={sucessoNaLista ? String(total - disponiveis) : "—"}
          detalhe="Com ordem de serviço aberta"
          tom="amarelo"
        />
      </section>

      <section className="overflow-hidden rounded-lg border border-[#bdc7b9] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#bdc7b9] bg-[#f8f7f6] p-4 sm:flex-row sm:items-center">
          <input
            aria-label="Buscar equipamento"
            placeholder="Buscar por identificação, marca, modelo ou categoria..."
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
              onChange={(e) => setSituacao(e.target.value as "TODOS" | StatusEquipamento)}
              className="min-h-11 rounded-lg border border-[#bdc7b9] bg-white px-3 py-2 text-base"
            >
              <option value="TODOS">Todas</option>
              <option value="AVAILABLE">Disponível</option>
              <option value="UNAVAILABLE">Indisponível</option>
            </select>
          </div>
        </div>

        {equipamentos.carregando && <p className="p-6 text-sm text-[#536052]">Carregando equipamentos...</p>}

        {equipamentos.erro && (
          <div className="flex flex-col items-start gap-3 p-4">
            <Aviso tipo="erro">{equipamentos.erro}</Aviso>
            <Botao onClick={equipamentos.recarregar}>Tentar novamente</Botao>
          </div>
        )}

        {sucessoNaLista && filtrados.length === 0 && (
          <p className="p-6 text-sm text-[#536052]">
            {total === 0 ? "Nenhum equipamento cadastrado ainda." : "Nenhum equipamento encontrado para os filtros."}
          </p>
        )}

        {sucessoNaLista && filtrados.length > 0 && (
          <>
            {/* Computador e tablet: tabela */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f8f7f6] text-xs uppercase tracking-wide text-[#536052]">
                  <tr>
                    <th scope="col" className="px-4 py-3">Identificação</th>
                    <th scope="col" className="px-4 py-3">Equipamento</th>
                    <th scope="col" className="px-4 py-3 text-right">Horímetro</th>
                    <th scope="col" className="px-4 py-3 text-right">Manutenção a cada</th>
                    <th scope="col" className="px-4 py-3">Situação</th>
                    {podeGerenciar && <th scope="col" className="px-4 py-3">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((e) => (
                    <tr key={e.id} className="border-t border-[#e3e8e0] align-top">
                      <td className="px-4 py-3 font-semibold">{e.identification}</td>
                      <td className="px-4 py-3">
                        {e.brand} {e.model}
                        <span className="block text-xs text-[#536052]">
                          {e.category} · {e.manufacture_year}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatarNumero(e.current_hour_meter)} h</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatarNumero(e.maintenance_interval)} h</td>
                      <td className="px-4 py-3">
                        <Selo {...SITUACAO_EQUIPAMENTO[e.status]} />
                      </td>
                      {podeGerenciar && (
                        <td className="px-4 py-3">
                          {acoes(e)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Celular: cartões */}
            <ul className="flex flex-col gap-3 p-4 md:hidden">
              {filtrados.map((e) => (
                <li key={e.id} className="rounded-lg border border-[#bdc7b9] bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-base font-semibold">{e.identification}</p>
                      <p className="text-sm text-[#536052]">
                        {e.brand} {e.model}
                      </p>
                    </div>
                    <Selo {...SITUACAO_EQUIPAMENTO[e.status]} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-[#536052]">Categoria</dt>
                      <dd>{e.category}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#536052]">Ano</dt>
                      <dd>{e.manufacture_year}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#536052]">Horímetro</dt>
                      <dd>{formatarNumero(e.current_hour_meter)} h</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#536052]">Manutenção a cada</dt>
                      <dd>{formatarNumero(e.maintenance_interval)} h</dd>
                    </div>
                  </dl>
                  {podeGerenciar && (
                    <div className="mt-4">
                      {acoes(e)}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {formulario && (
        <FormEquipamento
          equipamento={formulario.equipamento}
          propriedades={opcoesPropriedades(propriedades.dados)}
          carregandoPropriedades={propriedades.carregando}
          aoCancelar={() => setFormulario(null)}
          aoSalvar={depoisDeSalvar}
        />
      )}

      {excluindo && (
        <Confirmar
          titulo="Excluir equipamento"
          mensagem={`Deseja excluir o equipamento ${excluindo.identification} (${excluindo.brand} ${excluindo.model})? Esta ação não pode ser desfeita. Equipamentos com ordens de serviço não podem ser excluídos.`}
          textoConfirmar="Excluir"
          perigo
          aoConfirmar={() => excluir(excluindo)}
          aoCancelar={() => setExcluindo(null)}
        />
      )}
    </div>
  );
}
