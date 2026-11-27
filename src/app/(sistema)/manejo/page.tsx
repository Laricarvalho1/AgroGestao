"use client";
import { useState } from "react";
import { FiAlertTriangle, FiCalendar, FiCheckCircle, FiClipboard, FiFileText, FiInfo, FiLock, FiPackage, FiXCircle } from "react-icons/fi";

interface Safra {
    id: number,
    nome: string,
    status: "Ativa" | "Encerrada"
}

interface Talhao {
    id: number,
    safraId: number,
    nome: string,
    area: number
}

interface Insumo {
    id: number,
    nome: string,
    saldo: number,
    unidade: string
}

interface Lote {
    id: number,
    insumoId: number,
    numero: string,
    validade: string,
    saldo: number
}

interface Equipamento {
    id: number,
    nome: string,
    horimetro: number
}



interface Manejado {
    safra: string,
    talhao: string,
    atividade: string,
    insumo: string,
    lote: string,
    quantidade: string,
    data: string,
    equipamento: string,
    horimetro: string,
    observacoes: string
}


//array de dados ficticios para teste
const safras: Safra[] = [
  { id: 1, nome: "Soja 2026", status: "Ativa" },
  { id: 2, nome: "Milho 2026", status: "Ativa" },
  { id: 3, nome: "Soja 2025", status: "Encerrada" },
];

const talhoes: Talhao[] = [
  { id: 1, safraId: 1, nome: "Talhão A", area: 25 },
  { id: 2, safraId: 1, nome: "Talhão B", area: 30 },
  { id: 3, safraId: 2, nome: "Talhão C", area: 15 },
  { id: 4, safraId: 3, nome: "Talhão D", area: 20 },
];

const insumos: Insumo[] = [
  { id: 1, nome: "Ureia", saldo: 500, unidade: "kg" },
  { id: 2, nome: "NPK 10-10-10", saldo: 300, unidade: "kg" },
  { id: 3, nome: "Adubo líquido", saldo: 100, unidade: "L" },
];

const lotes: Lote[] = [
  { id: 1, insumoId: 1, numero: "LT001", validade: "2027-06-30", saldo: 300 },
  { id: 2, insumoId: 1, numero: "LT002", validade: "2026-10-15", saldo: 200 },
  { id: 3, insumoId: 2, numero: "LT003", validade: "2027-08-20", saldo: 300 },
  { id: 4, insumoId: 3, numero: "LT004", validade: "2027-03-10", saldo: 100 },
];

const equipamentos: Equipamento[] = [
  { id: 1, nome: "Trator John Deere", horimetro: 1250 },
  { id: 2, nome: "Pulverizador", horimetro: 850 },
  { id: 3, nome: "Trator Massey Ferguson", horimetro: 2100 },
];


// personalizar os cards do painel Validação do Manejo
type StatusValidacao = "pendente" | "valido" | "invalido";

interface ValidacaoProps {
    titulo: string;
    mensagem: string;
    status: StatusValidacao;
}

function CardValidacao({ titulo, mensagem, status }: ValidacaoProps) {

    const estilos = {
        pendente: "bg-[#f3f2f0] border-transparent text-[#667362]",
        valido: "bg-green-50 border-green-200 text-green-800",
        invalido: "bg-red-50 border-red-200 text-red-900"
    };

    const Icone = status === "valido"
        ? FiCheckCircle
        : status === "invalido"
            ? FiXCircle
            : FiInfo;

    return (
        <li className={`flex gap-2 rounded-lg border p-3 ${estilos[status]}`}>
            <Icone className="mt-1 shrink-0" />

            <div>
                <p className="font-semibold">{titulo}</p>
                <p className="mt-1 text-xs">{mensagem}</p>
            </div>
        </li>
    );
}


export default function Manejo() {
    const campo = "w-full min-w-0 rounded-lg border border-[#c0c8bc] bg-[#f8f7f6] px-3 py-3 text-base font-normal text-[#222722] outline-none focus:border-primary focus:ring-2 focus:ring-green-100 md:text-sm";

    const[manejo, setManejo] = useState<Manejado>({
        safra: "",
        talhao: "",
        atividade: "",
        insumo: "",
        lote: "",
        quantidade: "",
        data: "",
        equipamento: "",
        horimetro: "",
        observacoes: ""
    });

    const talhoesFiltrados = talhoes.filter(talhao => talhao.safraId === Number(manejo.safra));
    const lotesFiltrados = lotes.filter(lote => lote.insumoId === Number(manejo.insumo))

    const safraSelecionada = safras.find(safra => safra.id === Number(manejo.safra));
    const talhaoSeleciona = talhoes.find(talhao => talhao.id === Number(manejo.talhao));
    const insumoSelecionado = insumos.find(insumo => insumo.id === Number(manejo.insumo));
    const loteSelecionado = lotes.find(lote => lote.id === Number(manejo.lote));
    const equipamentoSelecionado = equipamentos.find(equipamento => equipamento.id === Number(manejo.equipamento));

    //validacoes
    const safraEncerrada = safraSelecionada?.status === "Encerrada";
    const horimetroInferior = equipamentoSelecionado !== undefined && manejo.horimetro !== "" && Number(manejo.horimetro) < equipamentoSelecionado.horimetro;
    const quantidadeInvalida = Number(manejo.quantidade) <= 0 || Number.isNaN(Number(manejo.quantidade));
    const saldoInsuficiente = loteSelecionado !== undefined && Number(manejo.quantidade) > loteSelecionado.saldo;
    const loteVencido = loteSelecionado !== undefined && manejo.data !== "" && loteSelecionado.validade < manejo.data;
    const formularioIncompleto = Object.entries(manejo).some(([campo, valor]) => campo !== "observacoes" && valor === "");
    const possui_dados_invalidos = safraEncerrada || horimetroInferior || quantidadeInvalida || saldoInsuficiente || loteVencido
    const manejoInvalido = possui_dados_invalidos || formularioIncompleto

    //booleanos para barra de conformidade
    const safraTalhaoValido = safraSelecionada && talhaoSeleciona && !safraEncerrada;
    const loteValido = loteSelecionado && (manejo.data !== "") && !loteVencido;
    const estoqueValido = insumoSelecionado && loteSelecionado && !quantidadeInvalida && !saldoInsuficiente;
    const equipamentoValido = equipamentoSelecionado != undefined;
    const horimetroValido = equipamentoSelecionado && (manejo.horimetro !== "") && !isNaN(Number(manejo.horimetro)) && !horimetroInferior;

    const conformidade = [safraTalhaoValido,loteValido,estoqueValido,equipamentoValido,horimetroValido];
    const numeros_de_validos = conformidade.filter(Boolean).length;
    const porcentagem_conformidade = (numeros_de_validos / 5) * 100;


    function registrarManejo(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (manejoInvalido) {
            alert("Verifique os campos do formulário.");
            return;
        }

        console.log("Dados do manejo:", manejo);
    }


    return (
        
        <div className="min-w-0 text-[#222522]">
            <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
                <header className="pb-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="mb-2 text-xs text-[#667362]">Operação de Campo <span className="mx-1">›</span> Gestão de Insumos <span className="mx-1">›</span> <strong className="text-primary">Manejo &amp; Aplicação (UC05 / UC06)</strong></p>
                            <h1 className="text-2xl font-bold tracking-tight text-[#171917] sm:text-3xl">Apontamento de Manejo e Aplicação de Insumos</h1>
                            <p className="mt-1 text-sm leading-relaxed text-[#536052]">Controle de registros, alocação de maquinário e baixa de insumos no estoque.</p>
                        </div>
                        <span className="self-center inline-flex max-w-full items-center gap-2 rounded-lg border border-[#bdc7b9] bg-[#efeeeb] px-3 py-2 text-xs font-semibold"><FiCheckCircle className="shrink-0 text-primary" /> Protocolo: RF-013 / RF-021</span>
                    </div>
                </header>

                {/* Mensagens de alerta e erros*/}
                <section aria-label="Exemplos visuais de alertas" className="flex flex-col gap-3">
                    {safraEncerrada && (
                        <div className="flex items-start gap-3 rounded-r-lg border border-red-200 border-l-4 border-l-red-600 bg-[#fdeceb] p-4">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-700 text-white">
                                <FiLock />
                            </span>
                            <div className="flex-1 text-red-900">
                                <span className="rounded-full bg-red-700 px-2 py-1 text-[10px] font-bold text-white">
                                    RF-021: SAFRA ENCERRADA
                                </span>
                                <h2 className="mt-2 text-sm font-bold">Safra encerrada</h2>
                                <p className="mt-1.5 text-sm leading-relaxed">
                                    Não é permitido registrar aplicações nesta safra.
                                </p>
                            </div>
                        </div>
                    )}

                    {horimetroInferior && (
                        <div className="flex items-start gap-3 rounded-r-lg border border-red-200 border-l-4 border-l-red-600 bg-[#fdeceb] p-4">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-700 text-white">
                                <FiLock />
                            </span>
                            <div className="flex-1 text-red-900">
                                <span className="rounded-full bg-red-700 px-2 py-1 text-[10px] font-bold text-white">
                                    RF-029: HORÍMETRO INVÁLIDO
                                </span>
                                <h2 className="mt-2 text-sm font-bold">Leitura inválida</h2>
                                <p className="mt-1.5 text-sm leading-relaxed">
                                    O horímetro informado é inferior à última leitura.
                                </p>
                            </div>
                        </div>
                    )}

                    {quantidadeInvalida && (
                        <div className="flex items-start gap-3 rounded-r-lg border border-orange-200 border-l-4 border-l-orange-700 bg-[#fce9e0] p-4">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-800 text-white">
                                <FiAlertTriangle />
                            </span>
                            <div className="flex-1 text-orange-950">
                                <span className="rounded-full bg-orange-800 px-2 py-1 text-[10px] font-bold text-white">
                                    RF-014: QUANTIDADE INVÁLIDA
                                </span>
                                <h2 className="mt-2 text-sm font-bold">Quantidade inválida</h2>
                                <p className="mt-1.5 text-sm leading-relaxed">
                                    Informe uma quantidade maior que zero.
                                </p>
                            </div>
                        </div>
                    )}

                    {saldoInsuficiente && (
                        <div className="flex items-start gap-3 rounded-r-lg border border-orange-200 border-l-4 border-l-orange-700 bg-[#fce9e0] p-4">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-800 text-white">
                                <FiAlertTriangle />
                            </span>
                            <div className="flex-1 text-orange-950">
                                <span className="rounded-full bg-orange-800 px-2 py-1 text-[10px] font-bold text-white">
                                    FE01 / RF-017: ESTOQUE CRÍTICO
                                </span>
                                <h2 className="mt-2 text-sm font-bold">Saldo insuficiente no almoxarifado</h2>
                                <p className="mt-1.5 text-sm leading-relaxed">
                                    A quantidade informada excede o saldo disponível.
                                </p>
                            </div>
                        </div>
                    )}

                    {loteVencido && (
                        <div className="flex items-start gap-3 rounded-r-lg border border-red-200 border-l-4 border-l-red-600 bg-[#fdeceb] p-4">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-700 text-white">
                                <FiLock />
                            </span>
                            <div className="flex-1 text-red-900">
                                <span className="rounded-full bg-red-700 px-2 py-1 text-[10px] font-bold text-white">
                                    RN02 / RF-020: LOTE VENCIDO
                                </span>
                                <h2 className="mt-2 text-sm font-bold">Lote vencido — aplicação bloqueada</h2>
                                <p className="mt-1.5 text-sm leading-relaxed">
                                    O sistema não permite registrar o consumo de lote vencido.
                                </p>
                            </div>
                            <FiInfo className="mt-1 shrink-0 text-red-700" />
                        </div>
                    )}

                    {formularioIncompleto && (
                        <div className="flex items-start gap-3 rounded-r-lg border border-orange-200 border-l-4 border-l-orange-700 bg-[#fce9e0] p-4">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-800 text-white">
                                <FiAlertTriangle />
                            </span>
                            <div className="flex-1 text-orange-950">
                                <span className="rounded-full bg-orange-800 px-2 py-1 text-[10px] font-bold text-white">
                                    CAMPOS PENDENTES
                                </span>
                            <h2 className="mt-2 text-sm font-bold">Formulário incompleto</h2>
                            <p className="mt-1.5 text-sm leading-relaxed">
                                Preencha todos os campos obrigatórios.
                            </p>
                            </div>
                        </div>
                        )}
                </section>

                <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2.1fr)_minmax(260px,1fr)]">
                    {/* aqui comeca o form */}
                    <form id="form-manejo" onSubmit={registrarManejo} className="flex min-w-0 flex-col gap-5">
                        <section className="rounded-xl border border-[#bdc7b9] bg-white p-4 shadow-sm sm:p-5">
                            <div className="mb-4 flex items-start gap-3 border-b border-[#dce4da] pb-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 font-bold text-primary">1</span>
                                <div className="flex-1"><h2 className="font-bold">Seleção de Safra e Talhão Ativo (RF-013)</h2><p className="mt-1 text-xs text-[#667362]">Identificação do talhão, cultura e ciclo produtivo.</p></div><span className="hidden shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-primary sm:inline">Obrigatório</span>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">Safra vigente *
                                    <select name="safra" value={manejo.safra} onChange={x => setManejo({ ...manejo, safra: x.target.value, talhao: "" })} className={campo} required >
                                        <option value="" disabled>Selecione a safra...</option>
                                        {safras.map(safra => 
                                            <option key={safra.id} value={safra.id}>
                                                {safra.nome}
                                            </option>
                                         )}
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">Talhão georreferenciado *
                                    <select name="talhao" value={manejo.talhao} onChange={x => setManejo({...manejo, talhao: x.target.value})}    className={campo} required >
                                        <option value="" disabled>Selecione o talhão...</option>
                                        {talhoesFiltrados.map(talhao =>
                                        (<option key={talhao.id} value={talhao.id}>
                                            {talhao.nome}
                                        </option>)
                                       )}
                                    </select>
                                </label>
                                <div className="grid grid-cols-2 gap-2 rounded-lg border border-[#dce4da] bg-[#f4f3f1] p-3 text-sm"><div><p className="text-[10px] uppercase text-[#667362]">Área total do talhão</p><p className="font-bold">{talhaoSeleciona?.area ?? "—"} ha</p></div><div><p className="text-[10px] uppercase text-[#667362]">Status da safra</p><p className="font-bold text-primary">{safraSelecionada?.status ?? "—"}</p></div></div>
                                <label className="flex flex-col gap-1.5 text-sm font-semibold">Finalidade do manejo *
                                    <select name="atividade" value={manejo.atividade} onChange={x => setManejo({...manejo, atividade: x.target.value})} className={campo} required >
                                        <option value="" disabled>Selecione a atividade...</option>
                                        <option value="monitoramento">Monitoramento</option>
                                        <option value="plantio">Plantio</option>
                                        <option value="manejo">Manejo geral</option>
                                    </select>
                                </label>
                            </div>
                        </section>

                        {/* Insumo a Aplicar e Rastreabilidade */}
                        <section className="rounded-xl border border-[#bdc7b9] bg-white p-4 shadow-sm sm:p-5">
                            <div className="mb-4 flex items-start gap-3 border-b border-[#dce4da] pb-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 font-bold text-primary">2</span>
                                <div className="flex-1"><h2 className="font-bold">Insumo a Aplicar e Rastreabilidade (RF-014)</h2><p className="mt-1 text-xs text-[#667362]">Estoque, almoxarifado e bloqueio de validade.</p></div>
                                <span className="hidden shrink-0 items-center gap-1 rounded-full bg-[#efeeeb] px-2.5 py-1 text-[10px] font-semibold text-[#536052] sm:flex"><FiPackage /> Almoxarifado</span>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2"><span className="flex flex-wrap justify-between gap-1">Produto / Insumo * <span className="text-xs font-normal text-[#667362]">Saldo atual: —</span></span>
                                    <select name="insumo" value={manejo.insumo} onChange={x => setManejo({...manejo, insumo: x.target.value, lote: ""})} className={campo} required >
                                        <option value="" disabled>Selecione o insumo...</option>
                                        {insumos.map(insumo =>
                                            <option key={insumo.id} value={insumo.id}>
                                                {insumo.nome}
                                            </option>
                                        )}
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1.5 text-sm font-semibold">Lote * (quando aplicável)
                                    <select name="lote" value={manejo.lote} onChange={x => setManejo({...manejo, lote: x.target.value})} className={campo} >
                                        <option value="" disabled>Selecione o lote...</option>
                                        {lotesFiltrados.map(lote =>
                                            <option key={lote.id} value={lote.id}>
                                                {lote.numero}
                                            </option>
                                        )}
                                    </select>
                                </label>
                                <div className="flex flex-col gap-1.5 text-sm font-semibold">Depósito de origem
                                    <p className="rounded-lg border border-[#bdc7b9] bg-[#f4f5f3] px-3 py-3 text-[#667362]">—</p>
                                </div>
                                <p className="text-xs text-[#667362] sm:col-span-2">Validade do lote: {loteSelecionado?.validade ?? "—"}</p>
                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#dce4da] bg-[#f4f5f3] p-3 sm:col-span-2">
                                    <p className="text-sm font-semibold">Saldo disponível no almoxarifado</p><span className="text-lg font-bold text-primary">{insumoSelecionado?.saldo ?? "—"}</span>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#bdc7b9] bg-white p-4 shadow-sm sm:p-5">
                            <div className="mb-4 flex items-start gap-3 border-b border-[#dce4da] pb-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 font-bold text-primary">3</span>
                                <div className="flex-1"><h2 className="font-bold">Quantidade Consumida (RF-014)</h2><p className="mt-1 text-xs text-[#667362]">Registro da quantidade total utilizada.</p></div><span className="hidden shrink-0 rounded bg-[#efeeeb] px-2 py-1 text-[10px] font-semibold text-primary sm:inline">Consulta de saldo</span>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <label className="flex flex-col gap-1.5 text-sm font-semibold">Quantidade total consumida *
                                    <input name="quantidade"  value={manejo.quantidade} onChange={x => setManejo({...manejo, quantidade: x.target.value})} type="number" min="0" step="any" className={campo} required placeholder="Informe a quantidade" />
                                </label>
                                <div className="flex flex-col gap-1.5 text-sm font-semibold">Unidade de medida<p className="rounded-lg border border-[#bdc7b9] bg-[#f4f5f3] px-3 py-3 font-normal text-[#667362]">{insumoSelecionado?.unidade ?? "—"}</p></div>
                                <div className="flex flex-col gap-1.5 text-sm font-semibold">Área registrada<p className="rounded-lg border border-[#bdc7b9] bg-[#f4f5f3] px-3 py-3 font-normal text-[#667362]">{talhaoSeleciona?.area ?? "—"}</p></div>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#dce4da] bg-[#efeeeb] p-4 text-sm"><div className="flex items-center gap-3"><span className="rounded bg-white p-2 text-lg font-bold text-primary">Σ</span><div><p className="font-semibold">Resumo da quantidade registrada</p><p className="mt-1 text-xs text-[#667362]">Aguardando preenchimento.</p></div></div><div className="text-right"><p className="text-[10px] font-bold uppercase text-[#667362]">Disponibilidade</p><p className="text-lg font-bold text-[#667362]">—</p></div></div>
                        </section>

                        <section className="rounded-xl border border-[#bdc7b9] border-t-4 border-t-primary bg-white p-4 shadow-sm sm:p-5">
                            <div className="mb-4 flex items-start gap-3 border-b border-[#dce4da] pb-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 font-bold text-primary">4</span>
                                <div className="flex-1"><h2 className="font-bold">Data da Aplicação e Equipamento Utilizado (RF-015)</h2><p className="mt-1 text-xs text-[#667362]">Alocação de maquinário, data e leitura de horímetro.</p></div><span className="hidden rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-primary sm:inline">RF-028/029</span>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                            <label className="flex flex-col gap-1.5 text-sm font-semibold"><span className="flex items-center gap-2"><FiCalendar /> Data de execução *</span>
                                <input name="data"value={manejo.data} onChange={x => setManejo({...manejo, data: x.target.value})} type="date" required className={campo} />
                            </label>
                            <label className="flex flex-col gap-1.5 text-sm font-semibold">Equipamento utilizado *
                                <select name="equipamento" value={manejo.equipamento} onChange={x => setManejo({...manejo, equipamento: x.target.value})} required className={campo} >
                                    <option value="" disabled>Selecione o equipamento...</option>
                                    {equipamentos.map(equipamento =>
                                        <option key={equipamento.id} value={equipamento.id}>
                                            {equipamento.nome}
                                        </option>
                                    )}
                                </select>
                            </label>
                            </div>
                            <div className="my-4 grid grid-cols-2 gap-3 rounded-lg border border-[#dce4da] bg-[#f4f5f3] p-3">
                                <div><p className="text-xs text-[#667362]">Último registro</p><p className="mt-1 text-xl font-bold"><span className="text-sm font-normal">{equipamentoSelecionado?.horimetro ?? "—"} h</span></p></div>
                                <div className="border-l border-[#bdc7b9] pl-3"><p className="text-xs text-[#667362]">Regra RF-029</p><p className="mt-1 flex items-center gap-1 text-sm font-semibold text-primary"><FiCheckCircle className="shrink-0" /> Não decrescente</p></div>
                            </div>
                            <label className="flex flex-col gap-1.5 text-sm font-semibold">Horímetro atual *
                                <div className="relative"><input name="horimetro" value={manejo.horimetro} onChange={x => setManejo({...manejo, horimetro: x.target.value})} type="number" min="0" step="0.1" required placeholder="Ex.: 1429,2" className={`${campo} pr-10 text-lg font-bold`} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#667362]">h</span></div>
                            </label>
                            <p className="mt-2 flex items-start gap-2 text-xs text-[#667362]"><FiInfo className="shrink-0" /> A leitura informada não pode ser inferior à última registrada.</p>
                        </section>

                        {/* Painel de conformidade, verifica se o form esta preenchido por completo ou parcial */}
                        <div aria-live="polite" />
                    </form>

                    <aside className="min-w-0 flex flex-col gap-4">
                        <section className="rounded-xl border border-[#bdc7b9] bg-white p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-2 border-b border-[#bdc7b9] pb-3"><h2 className="flex items-center gap-2 font-bold"><FiCheckCircle className="shrink-0 text-primary" /> Validação do Manejo</h2><span className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${formularioIncompleto ? "bg-yellow-100 text-yellow-700" : possui_dados_invalidos ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700" }`}>Status: {formularioIncompleto ? "Pendentes" : possui_dados_invalidos ? "Inválido" : "Válido" }</span></div>
                            <ul className="mt-3 space-y-2 text-sm">

                                <CardValidacao
                                    titulo="Talhão e Safra"
                                    status={
                                        !safraSelecionada || !talhaoSeleciona
                                            ? "pendente"
                                            : safraEncerrada
                                                ? "invalido"
                                                : "valido"
                                    }
                                    mensagem={
                                        !safraSelecionada || !talhaoSeleciona
                                            ? "Aguardando preenchimento."
                                            : safraEncerrada
                                                ? "Safra inválida."
                                                : "Safra ativa."
                                    }
                                />

                                <CardValidacao
                                    titulo="Validade do Lote (RN02)"
                                    status={
                                        !loteSelecionado || manejo.data === ""
                                            ? "pendente"
                                            : loteVencido
                                                ? "invalido"
                                                : "valido"
                                    }
                                    mensagem={
                                        !loteSelecionado || manejo.data === ""
                                            ? "Aguardando preenchimento."
                                            : loteVencido
                                                ? "Lote inválido."
                                                : "Lote ativo."
                                    }
                                />

                                <CardValidacao
                                    titulo="Capacidade do Almoxarifado (FE01)"
                                    status={
                                        !insumoSelecionado || !loteSelecionado || manejo.quantidade === ""
                                            ? "pendente"
                                            : quantidadeInvalida || saldoInsuficiente
                                                ? "invalido"
                                                : "valido"
                                    }
                                    mensagem={
                                        !insumoSelecionado || !loteSelecionado || manejo.quantidade === ""
                                            ? "Aguardando preenchimento."
                                            : quantidadeInvalida || saldoInsuficiente
                                                ? "Quantidade inválida ou saldo insuficiente."
                                                : "Saldo suficiente."
                                    }
                                />

                                <CardValidacao
                                    titulo="Equipamento (RF-015)"
                                    status={
                                        !equipamentoSelecionado
                                            ? "pendente"
                                            : "valido"
                                    }
                                    mensagem={
                                        !equipamentoSelecionado
                                            ? "Aguardando preenchimento."
                                            : "Equipamento selecionado."
                                    }
                                />

                                <CardValidacao
                                    titulo="Horímetro (RF-029)"
                                    status={
                                        !equipamentoSelecionado || manejo.horimetro === ""
                                            ? "pendente"
                                            : horimetroInferior
                                                ? "invalido"
                                                : "valido"
                                    }
                                    mensagem={
                                        !equipamentoSelecionado || manejo.horimetro === ""
                                            ? "Aguardando leitura."
                                            : horimetroInferior
                                                ? "Horímetro inválido."
                                                : "Leitura válida."
                                    }
                                />

                            </ul>
                            <div className="mt-4 border-t border-[#bdc7b9] pt-3">
                                <div className="mb-2 flex flex-wrap justify-between gap-1 text-[10px] font-semibold uppercase text-[#667362]">
                                    <span>Conformidade do registro</span><span>{porcentagem_conformidade}%</span>
                                </div>
                            <div className="h-2 rounded-full bg-[#e9e8e5]">
                                <div
                                    className="h-full rounded-full bg-green-600"
                                    style={{ width: `${porcentagem_conformidade}%` }}
                                />
                                
                            </div>
                            </div>
                        </section>
                        <section className="rounded-xl border border-[#bdc7b9] bg-white p-4 shadow-sm">
                            <h2 className="flex items-center gap-2 font-bold"><FiFileText className="text-primary" /> Receituário Agronômico</h2>
                            <dl className="mt-3 divide-y divide-[#dce4da] text-xs"><div className="flex justify-between gap-2 py-3"><dt className="text-[#667362]">Número da ART</dt><dd className="font-bold">—</dd></div><div className="flex justify-between gap-2 py-3"><dt className="text-[#667362]">Responsável técnico</dt><dd className="font-bold">—</dd></div><div className="flex justify-between gap-2 py-3"><dt className="text-[#667362]">CREA</dt><dd className="font-bold">—</dd></div></dl>
                            <p className="mt-2 rounded-lg bg-[#f4f5f3] p-3 text-xs text-[#667362]">Documento informativo. Dados oficiais dependem de integração autorizada.</p>
                        </section>
                        <section className="rounded-xl border border-[#bdc7b9] bg-[#f2f1ef] p-4 shadow-sm">
                            <label className="flex flex-col gap-2 text-sm font-semibold">
                                <span className="flex items-center gap-2">
                                    <FiClipboard /> Observações do operador
                                </span>

                                <textarea
                                    form="form-manejo"
                                    value={manejo.observacoes} onChange={(x) =>setManejo({ ...manejo, observacoes: x.target.value })}
                                     name="observacoes"
                                    rows={4}
                                    className={`${campo} bg-white`}
                                    placeholder="Informações adicionais do registro..."
                                    />
                            </label>
                        </section>
                    </aside>
                    <div className="flex flex-col gap-3 rounded-xl border border-[#bdc7b9] bg-white p-4 shadow-sm sm:flex-row sm:items-center xl:col-start-1">
                        <p className="flex flex-1 items-center gap-2 text-xs text-[#667362]"><FiLock className="shrink-0 text-primary" /> Ao confirmar, a movimentação será registrada para auditoria após validação.</p>
                        <button form="form-manejo" type="button" className="rounded-lg bg-[#efeeeb] px-5 py-3 text-base font-semibold md:text-sm">Cancelar</button>
                        <button disabled={manejoInvalido} form="form-manejo" type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-base font-semibold text-white hover:bg-darker-primary md:text-sm"><FiClipboard className="shrink-0" /> Confirmar e Dar Baixa no Estoque</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
