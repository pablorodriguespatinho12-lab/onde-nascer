"use client";

import { useEffect, useState } from "react";

const SELETOR = "[data-passo]";

/** Pontos na lateral: um por parte da história. Mostra onde a pessoa está e leva até a parte clicada. Só no computador. */
export default function Trilha() {
  const [titulos, setTitulos] = useState<readonly string[]>([]);
  const [ativo, setAtivo] = useState(0);

  useEffect(() => {
    const secoes = Array.from(document.querySelectorAll<HTMLElement>(SELETOR));
    setTitulos(secoes.map((secao) => secao.querySelector("h1, h2")?.textContent ?? ""));
    const observador = new IntersectionObserver(
      (entradas) => {
        const noMeio = entradas.find((entrada) => entrada.isIntersecting);
        if (noMeio) setAtivo(secoes.indexOf(noMeio.target as HTMLElement));
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    secoes.forEach((secao) => observador.observe(secao));
    return () => observador.disconnect();
  }, []);

  const irPara = (indice: number) => {
    document.querySelectorAll<HTMLElement>(SELETOR)[indice]?.scrollIntoView({ block: "start" });
  };

  return (
    <nav className="trilha" aria-label="Partes da página">
      {titulos.map((titulo, i) => (
        <button key={titulo} type="button" title={titulo} aria-label={titulo} aria-current={i === ativo ? "step" : undefined} onClick={() => irPara(i)} />
      ))}
    </nav>
  );
}
