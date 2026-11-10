"use client";

import { useEffect, useRef } from "react";

const DURACAO_MS = 1100;
const PARTE_VISIVEL = 0.6;

type Props = { valor: number; sufixo?: string; className?: string };

/** Número grande que conta de 0 até o valor quando entra na tela. Sem JavaScript ou com "reduzir movimento", já mostra o valor. */
export default function Contador({ valor, sufixo = "%", className }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let quadro = 0;

    const contar = (inicio: number) => (agora: number) => {
      const t = Math.min(1, (agora - inicio) / DURACAO_MS);
      const suave = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.round(valor * suave)}${sufixo}`;
      if (t < 1) quadro = requestAnimationFrame(contar(inicio));
    };

    const observador = new IntersectionObserver(
      ([entrada]) => {
        cancelAnimationFrame(quadro);
        if (entrada.isIntersecting) quadro = requestAnimationFrame(contar(performance.now()));
        else el.textContent = `${valor}${sufixo}`;
      },
      { threshold: PARTE_VISIVEL },
    );
    observador.observe(el);
    return () => {
      observador.disconnect();
      cancelAnimationFrame(quadro);
    };
  }, [valor, sufixo]);

  return <strong ref={ref} className={className}>{`${valor}${sufixo}`}</strong>;
}
