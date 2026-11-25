"use client";
import { FiAlertTriangle, FiPlus, FiSliders, FiTrash2, FiLock, FiDollarSign, FiLayers, FiEye, FiEdit2, FiDownload, FiCheckCircle, FiClock } from "react-icons/fi";
import { LiaChevronUpSolid } from "react-icons/lia";
import { useState } from "react";
import { FaBullseye } from "react-icons/fa";

type StatusDoInsumo = "Normal" | "Reposição Necessária" | "Bloqueado";

interface Insumo {
    nome_do_insumo: string;
    lote: string;
    categoria: string;
    saldo: number;
    unidade: string;
    custo_medio: number;
    valor_total: number;
    status: StatusDoInsumo;
    estoque_min: number;
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
        status: "Normal",
        estoque_min: 100,
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
        status: "Reposição Necessária",
        estoque_min: 50,
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
        status: "Normal",
        estoque_min: 30,
        id: 3
    },
];

//TODO - Botoes com cores dinamicas ao click
//Os dados são ilustrativos, ainda não tem API ou regras de negócio.
export default function EstoqueDeInsumos() {
    const [busca, setBusca] = useState("");
    const[categoria, setCategoria] = useState("Todos");
    const[status, setStatus] = useState("Todos os status")

    //array com novos insumos registrados
    const[lista_insumos, setInsumo] = useState<Insumo[]>(insumos);

    const filtrados = lista_insumos.filter(insumo =>
        insumo.nome_do_insumo.toLowerCase().includes(busca.toLowerCase()) &&
         (categoria === "Todos" || insumo.categoria === categoria) &&
         (status === "Todos os status" || insumo.status === status )
    );

    const[modal_aberto, setAberto] = useState(false);
    
    const[perda_modal,setPerdaAberto] = useState(false);

    const[perda, setPerda] = useState({
        nome_do_insumo: "",
        lote: "",
        quantidade: "",
        data: "",
        motivo: ""
    })

    const[form_modal, setFormulario] = useState({
        nome_do_insumo: "",
        categoria: "",
        unidade: "",
        estoque_min: ""
    });

    const[form_ajuste, setFormAjuste] = useState({
        idInsumo: 0,
        tipo_ajuste: "entrada",
        quantidade_ajuste: 0,
        justificativa: ""
    });

    const[editando, setEdit] = useState<number | null>(null);

 


    function limparFormulario() {
        setFormulario({
            nome_do_insumo: "",
            categoria: "",
            unidade: "",
            estoque_min: ""
        });
        setAberto(false);
        setEdit(null);
}

    //funcao que cadastra novos insumos
    function cadastrarInsumo(x: React.FormEvent<HTMLFormElement>) {
        x.preventDefault();
        if (form_modal.nome_do_insumo.trim() === "") {
            return;
        }

        const novoInsumo: Insumo = {
            id: Date.now(),
            ...form_modal,
            estoque_min: Number(form_modal.estoque_min),

            lote: "",
            saldo: 0,
            custo_medio: 0,
            valor_total: 0,
            status: "Normal"
        };
        if(editando === null) {
            setInsumo(antigos => [...antigos, novoInsumo]);
        } else {
            setInsumo(antigos => antigos.map(
                insumo => insumo.id == editando ? {...insumo,...form_modal} :insumo
            ));
        }
        
        limparFormulario();
    }

    function limpaModalPerda() {
        setPerda({nome_do_insumo: "",
            lote: "",
            quantidade: 0,
            data: "",
            motivo: ""})
            setPerdaAberto(false);
    }

    function registrarPerda(x: React.FormEvent<HTMLFormElement>) {
        x.preventDefault();
        const encontrado = lista_insumos.find(x => x.nome_do_insumo.toLowerCase() === perda.nome_do_insumo.toLowerCase())

        if(!encontrado) {
            alert("Selecione um insumo válido.");
            return;
        }

        let novoSaldo = encontrado.saldo;
        novoSaldo -= perda.quantidade;

        if(perda.quantidade > 0 && perda.motivo != "" && novoSaldo >= 0) {
            setInsumo(antigos => antigos.map(insumo => insumo.id === encontrado.id ? {...insumo,saldo: novoSaldo, valor_total: insumo.custo_medio * novoSaldo} : insumo))
            limpaModalPerda();

        } else {
            alert("Insira valores válidos.");
        }

       

    }

    function ajustarInventario() {
        const encontrado = lista_insumos.find(x => x.id === form_ajuste.idInsumo)

        if (!encontrado) {
        alert("Selecione um insumo válido.");
        return;
        }

        let novoSaldo = encontrado?.saldo;

        if(form_ajuste.tipo_ajuste == "entrada") {
            novoSaldo += form_ajuste.quantidade_ajuste;
        } else {
            novoSaldo -= form_ajuste.quantidade_ajuste;
        }

        if(form_ajuste.quantidade_ajuste >= 0 && form_ajuste.justificativa != "" && novoSaldo >= 0) {
        setInsumo(antigos => antigos.map(insumo => insumo.id === form_ajuste.idInsumo ? {...insumo, saldo: novoSaldo, valor_total: insumo.custo_medio * novoSaldo} : insumo));
        } else {
            alert("Insira valores válidos.");
            return;
        }
    }

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
                        <button type="button" onClick={() => setPerdaAberto(true)} className="inline-flex items-center gap-2 rounded-lg border border-orange-700 bg-white px-3 py-2.5 text-sm font-medium text-orange-800 hover:bg-orange-50"><FiTrash2 /> Registrar Perda/Descarte</button>
                        <button type="button" onClick={() => setAberto(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-darker-primary"><FiPlus /> Novo Insumo</button>
                        

                        {perda_modal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                                    <h2 className="text-xl font-semibold text-green-900 mb-6">Registrar Perda ou Descarte</h2>

                                    <form onSubmit={registrarPerda}  className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-1">
                                        <label htmlFor="nome_do_insumo" className="text-sm font-medium text-gray-700" >Nome do Insumo</label>
                                        <input type="text" required id="nome_do_insumo" className="flex flex-col gap-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" value={perda.nome_do_insumo} onChange={x => setPerda({...perda, nome_do_insumo: x.target.value})}></input>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                        <label htmlFor="lote" className="text-sm font-medium text-gray-700">Lote</label>
                                        <input type="text" id="lote" className="flex flex-col gap-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" value={perda.lote} onChange={x => setPerda({...perda, lote: x.target.value})}></input>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                        <label htmlFor="quantidade" className="text-sm font-medium text-gray-700">Quantidade</label>
                                        <input type="text" required id="quantidade" className="flex flex-col gap-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" value={perda.quantidade === 0 ? "" : perda.quantidade} onChange={x => setPerda({...perda, quantidade: Number(x.target.value)})}></input>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                        <label htmlFor="data" className="text-sm font-medium text-gray-700">Data</label>
                                        <input type="text" required id="data" className="flex flex-col gap-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" value={perda.data} onChange={x => setPerda({...perda, data: x.target.value})}></input>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                        <label htmlFor="motivo" className="text-sm font-medium text-gray-700">Justificativa</label>
                                        <input type="text" required id="motivo" className="flex flex-col gap-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" value={perda.motivo} onChange={x => setPerda({...perda, motivo: x.target.value})}></input>
                                        </div>

                                        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 mt-2">
                                            <button type="submit" className="rounded-lg bg-green-800 px-5 py-2 font-medium text-white hover:bg-green-900 cursor-pointer">Registrar</button>
                                            <button className="bg-red-800 text-white rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={() => limpaModalPerda()}>Fechar</button>
                                        </div>

                                    </form>

                                    
                                </div>
                            </div>

                        )}





                         {modal_aberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-semibold text-green-900 mb-6">Editar/Cadastrar Insumo</h2>

                        
                        <form onSubmit={cadastrarInsumo} className="flex flex-col gap-4">

                            <div className="flex flex-col gap-1">
                                <label htmlFor="nome_do_insumo" className="text-sm font-medium text-gray-700" >Nome do Insumo</label>
                                <input type="text" required id="nome_do_insumo" className="flex flex-col gap-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" value={form_modal.nome_do_insumo} onChange={x => setFormulario({...form_modal, nome_do_insumo: x.target.value})}></input>
                            </div>
                            
                            

                            <div className="flex flex-col gap-1">
                                <label htmlFor="categoria" className="text-sm font-medium text-gray-700" >Selecione a Categoria</label>
                                <select id="categoria" required className="flex flex-col gap-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" value={form_modal.categoria} onChange={x => setFormulario({...form_modal, categoria: x.target.value})}>
                                    <option value="" disabled>Selecione uma categoria</option>
                                    <option>Defensivos</option>
                                    <option>Fertilizantes</option>
                                    <option>Sementes</option>
                                    <option>Adjuvantes</option>
                                </select>
                            </div>
                            

                            <div className="flex flex-col gap-1">
                                <label htmlFor="unidade" className="text-sm font-medium text-gray-700" >Selecione a Unidade</label>
                                 <select id="unidade" required className="flex flex-col gap-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" value={form_modal.unidade} onChange={x => setFormulario({...form_modal, unidade: x.target.value})} >
                                    <option value="" disabled>Selecione uma unidade</option>
                                    <option>kg</option>
                                    <option>L</option>
                                    <option>sc</option>
                                </select>
                            </div>
                            

                            <div className="flex flex-col gap-1">
                                <label htmlFor="estoque_min" className="text-sm font-medium text-gray-700" >Estoque Minimo: </label>
                                <input type="number" min={0} required id="estoque_min" className="flex flex-col gap-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 " value={form_modal.estoque_min} onChange={x => setFormulario({...form_modal, estoque_min: x.target.value})}></input>
                            </div>
                           
                            
                            

                            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 mt-2">

                                <button type="button" onClick={() => limparFormulario()} className=" bg-red-800 text-white rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">Cancelar</button>
                                <button type="submit" className="rounded-lg bg-green-800 px-5 py-2 font-medium text-white hover:bg-green-900 cursor-pointer">Salvar</button>
                            </div>
                        
                        </form>


                       
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
                            <button type="button"  onClick={() => setCategoria("Todos")} className={`rounded-full border border-[#bdc7b9] ${categoria === "Todos" ? "bg-primary font-semibold text-white" : "bg-white text-black font-medium"}  px-3 py-1.5 text-xs`}>Todos ({(lista_insumos.length)})</button>
                            <button type="button"  onClick={() => setCategoria("Defensivos")} className={`rounded-full border border-[#bdc7b9] ${categoria === "Defensivos" ? "bg-primary font-semibold text-white" : "bg-white text-black font-medium"}  px-3 py-1.5 text-xs`}>Defensivos</button>
                            <button type="button"  onClick={() => setCategoria("Fertilizantes")} className={`rounded-full border border-[#bdc7b9] ${categoria === "Fertilizantes" ? "bg-primary font-semibold text-white" : "bg-white text-black font-medium"}  px-3 py-1.5 text-xs`}>Fertilizantes</button>
                            <button type="button"  onClick={() => setCategoria("Sementes")} className={`rounded-full border border-[#bdc7b9] ${categoria === "Sementes" ? "bg-primary font-semibold text-white" : "bg-white text-black font-medium"}  px-3 py-1.5 text-xs`}>Sementes</button>
                            <button type="button"  onClick={() => setCategoria("Adjuvantes")} className={`rounded-full border border-[#bdc7b9] ${categoria === "Adjuvantes" ? "bg-primary font-semibold text-white" : "bg-white text-black font-medium"}  px-3 py-1.5 text-xs`}>Adjuvantes</button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            
                            <input aria-label="Buscar insumo" placeholder="Buscar por nome ou lote..." className="min-w-0 flex-1 rounded-lg border border-[#bdc7b9] bg-white px-3 py-2 text-sm outline-none focus:border-primary sm:max-w-xs" value={busca} onChange={x => setBusca(x.target.value)}/>

                            <label htmlFor="status" className="text-sm">Status:</label>
                            <select id="status" value={status} onChange={x => setStatus(x.target.value)} className="rounded-lg border border-[#bdc7b9] bg-white px-3 py-2 text-sm">
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
                                    <td className="px-4 py-3 text-left">{insumo.categoria}</td>
                                    <td className="px-4 py-3 text-right">{insumo.saldo}</td>
                                    <td className="px-4 py-3">{insumo.unidade}</td>
                                    <td className="px-4 py-3 text-right">{insumo.custo_medio}</td>
                                    <td className="px-4 py-3 font-semibold text-right">{insumo.valor_total}</td>
                                    <td className="px-4 py-3 text-center">{insumo.status}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-3">
                                            <button type="button">
                                                <FiEye />
                                            </button>

                                            <button type="button" onClick={() => {
                                                setFormulario({
                                                    nome_do_insumo: insumo.nome_do_insumo,
                                                    categoria: insumo.categoria,
                                                    unidade: insumo.unidade,
                                                    estoque_min: String(insumo.estoque_min)
                                                });

                                                setEdit(insumo.id)
                                                setAberto(true);
                                            }}>
                                                <FiEdit2 />
                                            </button>
                                        </div>
                                    </td>
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
                        <label className="flex flex-col gap-1 text-sm font-medium">Insumo *
                            <select className="rounded-lg border border-[#bdc7b9] bg-white px-3 py-2.5 text-sm"
                                value={form_ajuste.idInsumo}
                                onChange={x => setFormAjuste({
                                    ...form_ajuste,
                                    idInsumo: Number(x.target.value)
                                })}
                            >

                                <option value={0}>Selecione um insumo</option>

                                {lista_insumos.map(insumo =>
                                    <option key={insumo.id} value={insumo.id}>
                                            {insumo.nome_do_insumo}
                                    </option>
                                )}
                            </select>
                        </label>
                        <div className="flex flex-col gap-1 text-sm font-medium">Tipo de ajuste *<div className="flex gap-2"><button type="button" className={`rounded-lg px-2 py-2.5 text-xs ${
                            form_ajuste.tipo_ajuste === "entrada"
                            ? "border border-primary bg-green-100 text-primary"
                            : "border border-[#bdc7b9]"
                            }`}  onClick={() => setFormAjuste({...form_ajuste,tipo_ajuste: "entrada"})} >+ Entrada física</button><button type="button" className={`rounded-lg px-2 py-2.5 text-xs ${
                            form_ajuste.tipo_ajuste === "baixa"
                            ? "border border-primary bg-green-100 text-primary"
                            : "border border-[#bdc7b9]"
                            }`} onClick={() => setFormAjuste({...form_ajuste,tipo_ajuste: "baixa"})}>− Baixa / ajuste</button></div></div>
                        <label className="flex flex-col gap-1 text-sm font-medium">Quantidade a ajustar *<input type="number" min="0" value={form_ajuste.quantidade_ajuste === 0 ? "": form_ajuste.quantidade_ajuste} onChange={x => setFormAjuste({...form_ajuste, quantidade_ajuste: Number(x.target.value)})} placeholder="0,00" className="rounded-lg border border-[#bdc7b9] px-3 py-2.5 text-sm" /></label>
                        <button type="button" className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white" onClick={ajustarInventario}><FiCheckCircle /> Confirmar ajuste</button>
                        <label className="flex flex-col gap-1 text-sm font-medium md:col-span-2 xl:col-span-4">Justificativa obrigatória *<textarea rows={2} placeholder="Descreva a divergência encontrada no inventário..." value={form_ajuste.justificativa} onChange={x => setFormAjuste({...form_ajuste, justificativa: x.target.value})} className="rounded-lg border border-[#bdc7b9] px-3 py-2.5 text-sm" /></label>
                    </div>
                </section>
            </div>
        </main>
    );
}
