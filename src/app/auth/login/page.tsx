"use client";

/*eslint-disable-next-line tailwindcss/no-contradicting-classname*/

import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const options = [
    { id: "administrador", label: "Administrador" },
    { id: "gerente", label: "Gerente de Campo" },
    { id: "operador", label: "Operador" },
  ];

  const [optionSelected, setOptionSelected] = useState<string>("");
  const [acessKey, setAcessKey] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
  }
  return (
    <div className="justify-items-between flex flex-col">
      <h1 className="text-4xl font-bold">Acesse sua conta</h1>
      <p>
        Insira suas credenciais para gerenciar operações agrícolas e telemetria
      </p>
      <form className="my-5 flex flex-col" onSubmit={(e) => handleSubmit(e)}>
        <label className="text-neutral-600">Perfil operacional</label>
        <div className="bg-neutral-200 flex mt-2 justify-between py-1 px-5 rounded-xl gap-1">
          {options.map((op) => {
            return (
              <button
                className={`text-primary text-sm cursor-pointer hover:bg-neutral-100 border-2 border-neutral-300 hover:border-primary py-2 px-8 rounded-xl ${
                  optionSelected === op.id
                    ? "bg-neutral-100"
                    : "bg-neutral-300 "
                }`}
                key={op.id}
                onClick={() => setOptionSelected(op.id)}
              >
                {op.label}
              </button>
            );
          })}
        </div>

        <label className="mt-4 px-1">E-mail ou ID de acesso</label>
        <input
          type="email"
          className="border border-neutral-200 py-2 px-5 rounded-xl focus:outline-primary focus:outline-2"
          placeholder="operacoes.campo@agrogestao.com.br"
          value={acessKey}
          onChange={(e) => setAcessKey(e.target.value.trim())}
        />

        <label className="mt-4 px-1">Senha Corporativa</label>
        <input
          type="password"
          className="border border-neutral-200 py-2 px-5 rounded-xl focus:outline-primary focus:outline-2"
          placeholder="**********"
          value={password}
          onChange={(e) => setPassword(e.target.value.trim())}
        />

        <div className="flex mt-2 justify-between">
          <div className="flex gap-1">
            <input
              className="bg-neutral-200 cursor-pointer p-2 accent-primary"
              type="checkbox"
              onClick={() =>
                remember ? setRemember(false) : setRemember(true)
              }
            />
            <label className="text-sm text-primary">Lembrar-me</label>
          </div>

          <button className="text-sm text-red-700 cursor-pointer hover:text-red-500">
            Esqueceu a senha?
          </button>
        </div>

        <button className="cursor-pointer text-white my-5 py-3 rounded-xl active:bg-darker-primary bg-primary">
          Entrar no Sistema
        </button>

        <hr className="text-neutral-300" />

        <div className="text-sm">
          <label>Não tem uma conta corporativa? </label>
          <Link
            href="/auth/register"
            className="text-red-700 hover:text-red-500"
          >
            Cadastre sua fazenda
          </Link>
        </div>
      </form>
    </div>
  );
}
