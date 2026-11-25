"use client";
import { FiAlertTriangle, FiPlus, FiSliders, FiTrash2, FiLock, FiDollarSign, FiLayers, FiEye, FiEdit2, FiDownload, FiCheckCircle, FiClock } from "react-icons/fi";
import { LiaChevronUpSolid } from "react-icons/lia";
import { useState } from "react";

type StatusDoInsumo = "Normal" | "Reposição Necessária Baixo" | "Bloqueado";

interface Insumo {
    nome_do_insumo: string;
    lote: string;
    categoria: string;
    saldo: number;
    unidade: string;
    custo_medio: number;
    valor_total: number;
    status: StatusDoInsumo;
    id: number;
}

    // array ficticia de insumos para teste
   const insumos: Insumo[] = [
    {
        nome_do_insumo: "Insumo A",
        lote: "LT-001",
        categoria: "Fertilizantes",
        saldo: 150,
        unidade: "kg",
        custo_medio: 12.50,
        valor_total: 1875,
        status: "Regular",
        id: 1
    },
    {
        nome_do_insumo: "Insumo B",
        lote: "LT-002",
        categoria: "Sementes",
        saldo: 10,
        unidade: "kg",
        custo_medio: 25.00,
        valor_total: 250,
        status: "Estoque baixo",
        id: 2
    },
    {
        nome_do_insumo: "Insumo C",
        lote: "LT-003",
        categoria: "Defensivos",
        saldo: 80,
        unidade: "L",
        custo_medio: 45.00,
        valor_total: 3600,
        status: "Regular",
        id: 3
    },
];

//TODO - Botoes com cores dinamicas ao click
//Os dados são ilustrativos, ainda não tem API ou regras de negócio.
export default function EstoqueDeInsumos() {
    const [busca, setBusca] = useState("");
    const[categoria, setCategoria] = useState("Todos");

    const filtrados = insumos.filter(insumo =>
        insumo.nome_do_insumo.toLowerCase().includes(busca.toLowerCase()) && (categoria === "Todos" || insumo.categoria === categoria)
    );

    const[modal_aberto, setAberto] = useState(false);

    return (
        <main className="min-h-screen min-w-0 bg-[#f8f7f6] px-4 py-6 text-[#202820] sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
                {/*Cabeçalho */}
                <header className="flex flex-col gap-4 border-b border-[#bdc7b9] pb-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#667362]">Operações agrícolas / Módulo de suprimentos RD-002</p>
                        <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Estoque de Insumos e Almoxarifado</h1>
                        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#536052]">Gerenciamento físico, rastreabilidade de defensivos, sementes e conciliação ponderada unitária (UC04 / RF-058 a RF-071).</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[#bdc7b9] bg-white px-3 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-100"><FiSliders /> Ajuste de Inventário</button>
                        <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-orange-700 bg-white px-3 py-2.5 text-sm font-medium text-orange-800 hover:bg-orange-50"><FiTrash2 /> Registrar Perda/Descarte</button>
                        <button type="button" onClick={() => setAberto(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-darker-primary"><FiPlus /> Novo Insumo</button>
                        
                         {modal_aberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="rounded-xl bg-white p-6">
                        <h2>Novo insumo</h2>

                        <button onClick={() => setAberto(false)}>
                            Fechar
                        </button>
                    </div>
                </div>
            )}

                    </div>
                </header>

                {/*Alertas — exemplos ficticios */}
                <section aria-label="Alertas de estoque" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <article className="flex gap-3 rounded-r-lg border border-amber-200 border-l-4 border-l-amber-500 bg-amber-50 p-4 shadow-sm">
                        <FiAlertTriangle className="mt-1 shrink-0 text-xl text-orange-700" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <h2 className="font-semibold text-orange-800">Alerta de Reposição Crítica (RF-067)</h2>
                                <span className="rounded-full bg-amber-200 px-2.5 py-1 text-xs font-medium text-orange-900">Estoque mínimo atingido</span>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-amber-950">O Insumo B atingiu o limite de estoque. Saldo atual: <strong>120 L</strong> (mínimo: 150 L). Déficit de reposição: <strong>30 L</strong>.</p>
                            <p className="mt-3 text-xs text-amber-800">Almoxarifado central • Reposição necessária</p>
                        </div>
                    </article>
                    <article className="flex gap-3 rounded-r-lg border border-red-200 border-l-4 border-l-red-600 bg-red-50 p-4 shadow-sm">
                        <FiLock className="mt-1 shrink-0 text-xl text-red-700" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <h2 className="font-semibold text-red-800">Bloqueio e validade (RF-068)</h2>
                                <span className="rounded-full bg-red-700 px-2.5 py-1 text-xs font-semibold text-white">Lote bloqueado</span>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-red-900">O lote #L88392 do Insumo A está vencido e não pode ser utilizado em novas operações.</p>
                            <p className="mt-3 text-xs text-red-800">Consulte os detalhes do lote para verificar o registro.</p>
                        </div>
                    </article>
                </section>

                {/*Indicadores — tarefa futura: extrair um componente com props */}
                <section aria-label="Indicadores" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <article className="rounded-lg border border-[#bdc7b9] border-t-4 border-t-primary bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-2 text-sm"><span>Valor Total em Estoque</span><FiDollarSign className="shrink-0 text-lg text-primary" /></div>
                        <p className="mt-2 text-2xl font-bold">R$ 77.588,00</p>
                        <p className="mt-1 text-xs text-[#667362]">Valor ilustrativo do catálogo</p>
                    </article>
                    <article className="rounded-lg border border-[#bdc7b9] border-t-4 border-t-primary bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-2 text-sm"><span>Itens Monitorados Ativos</span><FiLayers className="shrink-0 text-lg text-primary" /></div>
                        <p className="mt-2 text-2xl font-bold">3 itens</p>
                        <p className="mt-1 text-xs text-[#667362]">Insumos no catálogo</p>
                    </article>
                    <article className="rounded-lg border border-[#bdc7b9] border-t-4 border-t-amber-500 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-2 text-sm"><span>Déficit de Reposição</span><FiAlertTriangle className="shrink-0 text-lg text-orange-700" /></div>
                        <p className="mt-2 text-2xl font-bold text-orange-700">01 insumo</p>
                        <p className="mt-1 text-xs text-[#667362]">Abaixo do estoque mínimo</p>
                    </article>
                    <article className="rounded-lg border border-[#bdc7b9] border-t-4 border-t-red-600 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-2 text-sm"><span>Lotes bloqueados</span><FiLock className="shrink-0 text-lg text-red-700" /></div>
                        <p className="mt-2 text-2xl font-bold text-red-700">01 lote</p>
                        <p className="mt-1 text-xs text-red-700">Bloqueio por validade</p>
                    </article>
                </section>

                {/*filtros e tabela */}
                <section className="overflow-hidden rounded-lg border border-[#bdc7b9] bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-[#bdc7b9] bg-[#f8f7f6] p-4">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="mr-1 font-medium">Filtrar por categoria:</span>
                            <button type="button"  onClick={() => setCategoria("Todos")} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white">Todos (3)</button>
                            <button type="button"  onClick={() => setCategoria("Defensivos")} className="rounded-full border border-[#bdc7b9] bg-white px-3 py-1.5 text-xs font-medium">Defensivos</button>
                            <button type="button"  onClick={() => setCategoria("Fertilizantes")} className="rounded-full border border-[#bdc7b9] bg-white px-3 py-1.5 text-xs font-medium">Fertilizantes</button>
                            <button type="button"  onClick={() => setCategoria("Sementes")} className="rounded-full border border-[#bdc7b9] bg-white px-3 py-1.5 text-xs font-medium">Sementes</button>
                            <button type="button"  onClick={() => setCategoria("Adjuvantes")} className="rounded-full border border-[#bdc7b9] bg-white px-3 py-1.5 text-xs font-medium">Adjuvantes</button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            
                            <input aria-label="Buscar insumo" placeholder="Buscar por nome ou lote..." className="min-w-0 flex-1 rounded-lg border border-[#bdc7b9] bg-white px-3 py-2 text-sm outline-none focus:border-primary sm:max-w-xs" value={busca} onChange={x => setBusca(x.target.value)}/>

                            <label htmlFor="status" className="text-sm">Status:</label>
                            <select id="status" className="rounded-lg border border-[#bdc7b9] bg-white px-3 py-2 text-sm">
                                <option>Todos os status</option><option>Normal</option><option>Reposição necessária</option><option>Bloqueado</option>
                            </select>
                            <button type="button" aria-label="Exportar catálogo" className="rounded-lg border border-[#bdc7b9] bg-white p-2"><FiDownload /></button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                            <thead className="border-b border-[#bdc7b9] bg-[#f2f1ef] text-xs font-semibold text-[#60645e]">
                                <tr>
                                    <th scope="col" className="px-4 py-4">Descrição do Insumo</th>
                                    <th scope="col" className="px-3 py-4">Categoria</th>
                                    <th scope="col" className="px-3 py-4 text-right">Saldo Atual</th>
                                    <th scope="col" className="px-3 py-4">Unid.</th>
                                    <th scope="col" className="px-3 py-4 text-right">Custo Médio (R$)</th>
                                    <th scope="col" className="px-3 py-4 text-right">Valor Total em Estoque</th>
                                    <th scope="col" className="px-3 py-4 text-center">Status</th>
                                    <th scope="col" className="px-3 py-4 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#bdc7b9]">
                                {filtrados.map(insumo => (
                                <tr key={insumo.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <p className="font-semibold">{insumo.nome_do_insumo}</p>
                                        <p className="text-xs text-gray-500">{insumo.lote}</p>
                                    </td>
                                    <td className="px-4 py-3">{insumo.categoria}</td>
                                    <td className="px-4 py-3">
                                        {insumo.saldo} {insumo.unidade}
                                    </td>
                                    <td className="px-4 py-3">{insumo.custo_medio}</td>
                                    <td className="px-4 py-3 font-semibold">
                                        {insumo.valor_total}
                                    </td>
                                    <td className="px-4 py-3">{insumo.status}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#bdc7b9] p-4 text-xs text-[#667362]">
                        <p>Exibindo <strong>3 de 3</strong> insumos cadastrados</p>
                        <div className="flex gap-2"><button type="button" disabled className="rounded border px-3 py-1.5 opacity-50">Anterior</button><span className="rounded bg-primary px-3 py-1.5 font-semibold text-white">1</span><button type="button" disabled className="rounded border px-3 py-1.5 opacity-50">Próximo</button></div>
                    </footer>
                </section>

                {/*Formulário: apenas apresentação, sem envio ou alteração de estoque */}
                <section className="rounded-lg border border-[#bdc7b9] bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#bdc7b9] pb-4">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-bold"><FiClock className="text-primary" /> Ajuste e Conciliação Rápida de Inventário Físico</h2>
                            <p className="mt-1 text-xs text-[#667362]">RF-065 / RF-066 — <strong className="text-red-700">Não é permitido saldo final negativo.</strong></p>
                        </div>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">Auditoria contábil</span>
                    </div>
                    <div className="mt-4 grid grid-cols-1 items-end gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <label className="flex flex-col gap-1 text-sm font-medium">Insumo *<select className="rounded-lg border border-[#bdc7b9] bg-white px-3 py-2.5 text-sm"><option>Selecione o insumo...</option><option>Insumo A</option><option>Insumo B</option><option>Insumo C</option></select></label>
                        <div className="flex flex-col gap-1 text-sm font-medium">Tipo de ajuste *<div className="flex gap-2"><button type="button" className="rounded-lg border border-primary bg-green-100 px-2 py-2.5 text-xs font-medium text-primary">+ Entrada física</button><button type="button" className="rounded-lg border border-[#bdc7b9] px-2 py-2.5 text-xs">− Baixa / ajuste</button></div></div>
                        <label className="flex flex-col gap-1 text-sm font-medium">Quantidade a ajustar *<input type="number" min="0" placeholder="0,00" className="rounded-lg border border-[#bdc7b9] px-3 py-2.5 text-sm" /></label>
                        <button type="button" className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white"><FiCheckCircle /> Confirmar ajuste</button>
                        <label className="flex flex-col gap-1 text-sm font-medium md:col-span-2 xl:col-span-4">Justificativa obrigatória *<textarea rows={2} placeholder="Descreva a divergência encontrada no inventário..." className="rounded-lg border border-[#bdc7b9] px-3 py-2.5 text-sm" /></label>
                    </div>
                </section>
            </div>
        </main>
    );
}
