"use client";

import { useState } from "react";
import Link from "next/link";
import AgButton from "@/components/AgButton";
import * as api from "@/lib/api";

export default function Login() {
  const options = [
    { id: "administrador", label: "Administrador" },
    { id: "gerente", label: "Gerente Campo" },
    { id: "operador", label: "Operador" },
  ];

  const [optionSelected, setOptionSelected] = useState("administrador");
  const [acessKey, setAcessKey] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    //A posteriori usar esse payload para contexto global do usuário logado
    const payload = await api.login({ email: acessKey, password });
    //Aqui esta criando token mas no momento o remember é inutil
  }

  return (
    <div className="flex flex-col bg-white">
      <div className="mb-6">
        <p className="mb-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-primary">
          Acesso corporativo seguro
        </p>

        <h1 className="text-2xl font-bold text-neutral-900">
          Acesse sua conta
        </h1>

        <p className="mt-1 text-sm text-neutral-600">
          Insira suas credenciais corporativas para gerenciar operações
          agrícolas e telemetria.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm text-neutral-700">
            Perfil Operacional
          </label>

          <div className="flex gap-1 rounded-lg bg-neutral-100 p-1">
            {options.map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => setOptionSelected(op.id)}
                className={`flex-1 cursor-pointer rounded-md px-2 py-2 text-sm transition ${
                  optionSelected === op.id
                    ? "bg-white font-semibold text-primary shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="access-key"
            className="mb-2 block text-sm text-neutral-700"
          >
            E-mail ou ID de Acesso
          </label>

          <input
            id="access-key"
            type="text"
            autoComplete="username"
            className="w-full rounded-lg border border-neutral-200 px-3 py-3 text-sm outline-none transition focus:border-primary"
            placeholder="operacoes.campo@agrogestao.com.br"
            value={acessKey}
            onChange={(e) => setAcessKey(e.target.value)}
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm text-neutral-700"
          >
            Senha Corporativa
          </label>

          <div className="flex rounded-lg border border-neutral-200 focus-within:border-primary">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="min-w-0 flex-1 rounded-lg px-3 py-3 text-sm outline-none"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="px-3 text-sm text-neutral-500 hover:text-neutral-800"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-primary"
            />
            Lembrar-me
          </label>

          <Link
            href="/auth/forgot-password"
            className="text-sm text-orange-700 hover:text-orange-600"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <AgButton>Entrar no Sistema →</AgButton>

        <div className="flex items-center gap-3">
          <hr className="flex-1 border-neutral-200" />
          <span className="text-xs text-neutral-500">OU CONTINUE COM</span>
          <hr className="flex-1 border-neutral-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="rounded-lg border border-neutral-200 px-2 py-3 text-sm text-neutral-700 transition hover:bg-neutral-50"
          >
            SSO Corporativo
          </button>

          <button
            type="button"
            className="rounded-lg border border-neutral-200 px-2 py-3 text-sm text-neutral-700 transition hover:bg-neutral-50"
          >
            Chave de Token
          </button>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-sm text-neutral-600">
          Não tem uma conta corporativa?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-orange-700 hover:text-orange-600"
          >
            Cadastre sua fazenda
          </Link>
        </div>
      </form>

      <footer className="mt-6 border-t border-neutral-200 pt-4 text-sm text-neutral-500">
        <Link href="/privacy" className="hover:text-neutral-700">
          Privacidade e Segurança
        </Link>
      </footer>
    </div>
  );
}
