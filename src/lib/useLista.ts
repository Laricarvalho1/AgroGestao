"use client";

// Hook para buscar uma lista na API (GET) e guardar o resultado.
//
//   const { dados, carregando, erro, recarregar } = useLista<Equipamento>("/api/equipments");
//
// Depois de criar/editar/excluir algo, chame recarregar() para atualizar a lista.

import { useCallback, useEffect, useState } from "react";
import { mensagemDoErro, requisitar } from "./http";

export function useLista<T>(url: string) {
  const [dados, setDados] = useState<T[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [versao, setVersao] = useState(0); // muda a cada recarregar()

  useEffect(() => {
    let cancelado = false; // evita atualizar a tela se ela já foi fechada

    requisitar<T[]>(url)
      .then((lista) => {
        if (cancelado) return;
        setDados(Array.isArray(lista) ? lista : []);
        setErro("");
      })
      .catch((e) => {
        if (!cancelado) setErro(mensagemDoErro(e));
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [url, versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  return { dados, carregando, erro, recarregar };
}
