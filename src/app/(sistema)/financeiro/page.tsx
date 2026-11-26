"use client";

import { useEffect, useState } from "react";
import {
  createFinancialEntryApi,
  deleteFinancialEntryApi,
  FinancialEntryItem,
  listFinancialEntriesApi,
  updateFinancialEntryApi,
} from "@/lib/api";
import { formatCurrencyBRL, formatDateBR } from "@/lib/formatters";

export default function FinanceiroPage() {
  const [entries, setEntries] = useState<FinancialEntryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState("");
  const [harvestId, setHarvestId] = useState("");
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  async function loadEntries() {
    setLoading(true);
    try {
      const data = await listFinancialEntriesApi();
      setEntries(data);
    } catch {
      setError("Erro ao carregar lançamentos financeiros.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  function resetForm() {
    setEditingId(null);
    setPropertyId("");
    setHarvestId("");
    setType("EXPENSE");
    setCategory("");
    setAmount("");
    setEntryDate(new Date().toISOString().split("T")[0]);
    setError(null);
  }

  function handleEdit(item: FinancialEntryItem) {
    setEditingId(item.id);
    setPropertyId(item.property_id);
    setHarvestId(item.harvest_id ?? "");
    setType(item.type);
    setCategory(item.category);
    setAmount(String(item.amount));
    setEntryDate(item.entry_date.split("T")[0]);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      property_id: propertyId.trim(),
      harvest_id: harvestId.trim() ? harvestId.trim() : null,
      type,
      category: category.trim(),
      amount: Number(amount),
      entry_date: entryDate,
    };

    try {
      const response = editingId
        ? await updateFinancialEntryApi(editingId, payload)
        : await createFinancialEntryApi(payload);

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        setError(errData?.error ?? "Verifique os dados informados.");
        return;
      }

      resetForm();
      await loadEntries();
    } catch {
      setError("Erro de conexão ao salvar lançamento.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir este lançamento financeiro?")) return;
    try {
      const response = await deleteFinancialEntryApi(id);
      if (response.ok) {
        await loadEntries();
      } else {
        setError("Não foi possível excluir o lançamento.");
      }
    } catch {
      setError("Erro de conexão ao excluir lançamento.");
    }
  }

  const totalDespesas = entries
    .filter((e) => e.type === "EXPENSE")
    .reduce((acc, item) => acc + item.amount, 0);

  const totalReceitas = entries
    .filter((e) => e.type === "INCOME")
    .reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">
            Lançamentos Financeiros
          </h1>
          <p className="text-sm text-gray-600">
            Gestão de despesas manuais e custos operacionais apropriados
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <span className="text-xs font-medium uppercase text-gray-500">
              Total de Despesas
            </span>
            <p className="mt-1 text-xl font-bold text-secondary">
              {formatCurrencyBRL(totalDespesas)}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <span className="text-xs font-medium uppercase text-gray-500">
              Total de Receitas
            </span>
            <p className="mt-1 text-xl font-bold text-primary">
              {formatCurrencyBRL(totalReceitas)}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <span className="text-xs font-medium uppercase text-gray-500">
              Saldo Operacional
            </span>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {formatCurrencyBRL(totalReceitas - totalDespesas)}
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {editingId ? "Editar Lançamento" : "Novo Lançamento Avulso"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tipo <span className="text-red-600">*</span>
              </label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "EXPENSE" | "INCOME")
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              >
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Categoria <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex.: Administrativo, Energia, Frota"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Valor (R$) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Data do Lançamento <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                ID da Propriedade <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                placeholder="UUID da propriedade"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                ID da Safra (opcional)
              </label>
              <input
                type="text"
                value={harvestId}
                onChange={(e) => setHarvestId(e.target.value)}
                placeholder="UUID da safra"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            {error && (
              <div className="md:col-span-3">
                <p className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 md:col-span-3">
              <button
                type="submit"
                disabled={submitting}
                className="cursor-pointer rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-darker-primary active:bg-lighter-primary disabled:opacity-60 transition"
              >
                {submitting
                  ? "Salvando..."
                  : editingId
                    ? "Atualizar Lançamento"
                    : "Registrar Lançamento"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="cursor-pointer rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar Edição
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Histórico de Lançamentos
            </h2>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-gray-500">Carregando registros...</p>
          ) : entries.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">
              Nenhum lançamento financeiro cadastrado até o momento.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8F9FA] text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3">Categoria</th>
                    <th className="px-6 py-3">Valor</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-4 text-gray-700">
                        {formatDateBR(item.entry_date)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.type === "EXPENSE"
                              ? "bg-orange-100 text-secondary"
                              : "bg-green-100 text-primary"
                          }`}
                        >
                          {item.type === "EXPENSE" ? "Despesa" : "Receita"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatCurrencyBRL(item.amount)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="cursor-pointer font-medium text-primary hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="cursor-pointer font-medium text-red-600 hover:underline"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
  );
}