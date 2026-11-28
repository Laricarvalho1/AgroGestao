"use client";

import { useState } from "react";
import { closeServiceOrderApi } from "@/lib/api";
import { formatCurrencyBRL } from "@/lib/formatters";

interface CloseServiceOrderModalProps {
  isOpen: boolean;
  serviceOrderId: string;
  equipmentName?: string;
  defaultHarvestId?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CloseServiceOrderModal({
  isOpen,
  serviceOrderId,
  equipmentName,
  defaultHarvestId = null,
  onClose,
  onSuccess,
}: CloseServiceOrderModalProps) {
  const [partsCost, setPartsCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsedParts = Number(partsCost) || 0;
  const parsedLabor = Number(laborCost) || 0;
  const totalCost = parsedParts + parsedLabor;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (partsCost === "" || laborCost === "") {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (parsedParts < 0 || parsedLabor < 0) {
      setError("Os valores de custo não podem ser negativos.");
      return;
    }

    setLoading(true);
    try {
      const response = await closeServiceOrderApi(serviceOrderId, {
        parts_cost: parsedParts,
        labor_cost: parsedLabor,
        harvest_id: defaultHarvestId,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        setError(errData?.error ?? "Não foi possível encerrar a Ordem de Serviço.");
        return;
      }

      setPartsCost("");
      setLaborCost("");
      onSuccess?.();
      onClose();
    } catch {
      setError("Erro de conexão ao encerrar a Ordem de Serviço.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 border-b border-gray-100 pb-3">
          <h2 className="text-lg font-bold text-gray-900">
            Encerrar Ordem de Serviço
          </h2>
          {equipmentName && (
            <p className="mt-1 text-sm text-gray-600">
              Equipamento: <span className="font-medium">{equipmentName}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Custo de Peças (R$) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={partsCost}
              onChange={(e) => setPartsCost(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Custo de Mão de Obra (R$) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={laborCost}
              onChange={(e) => setLaborCost(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="rounded-xl bg-[#F8F9FA] p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total a lançar (Frota):</span>
              <span className="text-base font-bold text-primary">
                {formatCurrencyBRL(totalCost)}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Ao confirmar, o equipamento voltará para Disponível e a despesa será registrada no centro de custo Mecanização / Frota.
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full cursor-pointer rounded-xl border border-gray-300 py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-xl bg-primary py-3 px-4 text-sm font-medium text-white hover:bg-darker-primary active:bg-lighter-primary disabled:opacity-60 transition"
            >
              {loading ? "Encerrando..." : "Concluir OS"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}