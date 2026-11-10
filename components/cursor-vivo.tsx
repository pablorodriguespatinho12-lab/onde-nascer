"use client";

import { useEffect, useRef } from "react";
import { estaParado } from "@/lib/movimento";

const VELOCIDADE = 7;
const QUASE_PARADO = 0.0005;
const DT_MAXIMO_S = 0.1;

/**
 * Uma luz suave segue o cursor.
 * Só liga com mouse de verdade; com o cursor parado ou a animação pausada, não gasta nada.
 */
export default function CursorVivo() {
  const luzRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const luz = luzRef.current;
    const temMouse = window.matchMedia("(pointer: fine)").matches;
    if (!luz || !temMouse) return;

    let alvoX = 0;
    let alvoY = 0;
    let x = 0;
    let y = 0;
    let quadro = 0;
    let anterior = 0;

    const aplicar = () => {
      const px = (x * 0.5 + 0.5) * window.innerWidth;
      const py = (0.5 - y * 0.5) * window.innerHeight;
      luz.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    };

    const laco = (agora: number) => {
      const dt = Math.min(DT_MAXIMO_S, (agora - anterior) / 1000);
      anterior = agora;
      const fator = 1 - Math.exp(-VELOCIDADE * dt);
      x += (alvoX - x) * fator;
      y += (alvoY - y) * fator;
      aplicar();
      const falta = Math.abs(alvoX - x) + Math.abs(alvoY - y);
      quadro = falta > QUASE_PARADO ? requestAnimationFrame(laco) : 0;
    };

    const aoMover = (e: PointerEvent) => {
      if (estaParado()) return;
      alvoX = (e.clientX / window.innerWidth - 0.5) * 2;
      alvoY = (0.5 - e.clientY / window.innerHeight) * 2;
      luz.classList.add("acesa");
      if (quadro !== 0) return;
      anterior = performance.now();
      quadro = requestAnimationFrame(laco);
    };

    window.addEventListener("pointermove", aoMover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", aoMover);
      cancelAnimationFrame(quadro);
    };
  }, []);

  return (
    <div className="luz" aria-hidden="true">
      <div ref={luzRef} />
    </div>
  );
}
