"use client";

import { useEffect, useRef, useState } from "react";
import ImagemViva from "@/components/imagem-viva";

export type Ilustracao = { arquivo: string; descricao: string };

/** Fica parado na tela enquanto os textos dos problemas passam; mostra a ilustração do texto que está no meio da tela. */
export default function Palco({ ilustracoes }: { ilustracoes: readonly Ilustracao[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ativa, setAtiva] = useState(0);

  useEffect(() => {
    const secao = ref.current?.closest(".problemas");
    if (!secao) return;
    const passos = Array.from(secao.querySelectorAll<HTMLElement>("[data-passo]"));
    const observador = new IntersectionObserver(
      (entradas) => {
        const noMeio = entradas.find((e) => e.isIntersecting);
        if (noMeio) setAtiva(passos.indexOf(noMeio.target as HTMLElement));
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    passos.forEach((passo) => observador.observe(passo));
    return () => observador.disconnect();
  }, []);

  return (
    <div className="palco" ref={ref}>
      {ilustracoes.map((ilustracao, i) => (
        <ImagemViva key={ilustracao.arquivo} {...ilustracao} className={i === ativa ? "ativa" : ""} />
      ))}
    </div>
  );
}
