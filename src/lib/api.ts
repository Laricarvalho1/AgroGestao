import { LoginUserDTO } from "@/modules/users/login-user.dto";
import { RegisterUserDTO } from "@/modules/users/register-user.dto";

export async function createUser(user: RegisterUserDTO) {
  const payload = await fetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      user,
    }),
  });
  return payload;
}

export async function login(loginInput: LoginUserDTO) {
  const payload = await fetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      user: loginInput,
    }),
  });
  return payload;
}

export interface CloseServiceOrderPayload {
  parts_cost: number;
  labor_cost: number;
  harvest_id?: string | null;
}

export interface FinancialEntryItem {
  id: string;
  property_id: string;
  harvest_id: string | null;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialEntryPayload {
  property_id: string;
  harvest_id?: string | null;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  entry_date?: string;
}

export async function closeServiceOrderApi(
  osId: string,
  data: CloseServiceOrderPayload,
) {
  return await fetch(`/api/service-orders/${osId}/close`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function listFinancialEntriesApi(): Promise<FinancialEntryItem[]> {
  const res = await fetch("/api/financial", { method: "GET" });
  if (!res.ok) throw new Error("Falha ao carregar lançamentos financeiros");
  return await res.json();
}

export async function createFinancialEntryApi(data: FinancialEntryPayload) {
  return await fetch("/api/financial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateFinancialEntryApi(
  id: string,
  data: Partial<FinancialEntryPayload>,
) {
  return await fetch(`/api/financial/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteFinancialEntryApi(id: string) {
  return await fetch(`/api/financial/${id}`, {
    method: "DELETE",
  });
}
