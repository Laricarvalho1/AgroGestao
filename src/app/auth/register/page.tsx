"use client";

import Link from "next/link";
import { useState } from "react";
import * as api from "@/lib/api";

import AgButton from "@/components/AgButton";
import { UserRole } from "@/types/user";
import { redirect } from "next/navigation";

export default function Register() {
  const [farmName, setFarmName] = useState<string>("");
  const [responsibleName, setResponsibleName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [role, setRole] = useState<UserRole | undefined>("OPERATOR");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();

    if (password !== passwordConfirmation) return;
    if (role == undefined) return;

    const payload = await api.createUser({
      name: responsibleName,
      email,
      password,
      role,
    });

    if (!payload.ok) return;

    redirect("/auth/login");
  }

  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const inputClass =
    "w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary";

  const labelClass = "mb-1.5 block text-md font-medium";

  return (
    <div className="flex min-h-full flex-col bg-neutral-100 px-6 py-7 sm:px-10 lg:px-12">
      <header className="mb-6 flex items-center justify-between gap-3 border-b border-neutral-200 pb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:text-primary">
          Voltar à página inicial
        </Link>
        <span>Etapa 1 de 2: Credenciais Corporativas</span>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 justify-center flex flex-col">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Criar Nova Conta Corporativa
        </h1>
        <p className="mt-1.5 mb-6 text-xs text-neutral-500">
          Cadastre-se para gerenciar safras, estoque e finanças da fazenda
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="responsible-name">
                Nome Completo *
              </label>
              <input
                id="responsible-name"
                className={inputClass}
                placeholder="Nome completo"
                autoComplete="name"
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="email">
                E-mail Profissional *
              </label>
              <input
                id="email"
                type="email"
                className={inputClass}
                placeholder="contato@fazenda.com.br"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="farm-name">
                Nome da Fazenda *
              </label>
              <input
                id="farm-name"
                className={inputClass}
                placeholder="Fazenda Boa Esperança"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="role">
                Perfil de Acesso *
              </label>
              <select
                id="role"
                className={inputClass}
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                required
              >
                <option value="" disabled>
                  Selecione seu cargo
                </option>
                <option value="ADMIN">Gerente agrícola</option>
                <option value="OPERATOR">Operador</option>
                <option value="FIELD_MANAGER">Técnico agrícola</option>
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="password">
                Senha Corporativa *
              </label>
              <input
                id="password"
                type="password"
                className={inputClass}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="mt-2 flex justify-between gap-2 text-sm text-neutral-500">
                <span>FORÇA DA SENHA</span>
                <span>
                  {password.length === 0
                    ? "Digite uma senha"
                    : strength <= 2
                      ? "Fraca"
                      : strength <= 4
                        ? "Moderada"
                        : "Forte"}
                </span>
              </div>

              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`h-1 flex-1 rounded-full ${
                      strength >= n
                        ? strength <= 2
                          ? "bg-red-500"
                          : strength <= 4
                            ? "bg-secondary"
                            : "bg-primary"
                        : "bg-neutral-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="password-confirmation">
                Confirmar Senha *
              </label>
              <input
                id="password-confirmation"
                type="password"
                className={inputClass}
                placeholder="Repita sua senha"
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />

              {passwordConfirmation && password !== passwordConfirmation && (
                <p className="mt-1 text-sm text-red-600">
                  As senhas não coincidem.
                </p>
              )}
            </div>
          </div>

          <label className="mt-5 flex items-start gap-2.5 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-600">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 accent-green-800"
              required
            />
            <span>
              Aceito os{" "}
              <Link href="/terms" className="text-green-800 hover:underline">
                termos de uso
              </Link>{" "}
              e a{" "}
              <Link href="/privacy" className="text-green-800 hover:underline">
                política de privacidade
              </Link>{" "}
              da plataforma AgroGestão.
            </span>
          </label>

          <div className="mt-5">
            <AgButton>Finalizar Cadastro →</AgButton>
          </div>

          <p className="my-6 text-center text-sm text-neutral-500">
            Já possui conta?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-orange-700 hover:text-orange-600"
            >
              Ir para Login
            </Link>
          </p>
        </form>
      </main>
      <footer className="mt-5 flex flex-col justify-between gap-3 border-t border-neutral-200 pt-5 text-sm leading-relaxed text-neutral-400 sm:flex-row">
        <div>
          <p>© 2026 AgroGestão · AgroGestão</p>
          <p>Todos os direitos reservados · Conformidade com a LGPD</p>
        </div>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-neutral-600">
            Privacidade
          </Link>
          <Link href="/terms" className="hover:text-neutral-600">
            Termos de Uso
          </Link>
        </div>
      </footer>
    </div>
  );
}
