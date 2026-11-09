"use client";

import { useEffect, useRef } from "react";
import type { Cena } from "@/lib/cena/cena";
import type { Historia } from "@/lib/cena/layouts";

export const EVENTO_FOCO = "onde-nascer:foco";

/** Posição do centro de cada seção; a seção longa da busca usa só a primeira tela dela. */
function medirSecoes(): number[] {
  const alturaTela = window.innerHeight;
  return Array.from(document.querySelectorAll<HTMLElement>("[data-passo]")).map((secao) => {
    const topo = secao.getBoundingClientRect().top + window.scrollY;
    return topo + Math.min(secao.offsetHeight, alturaTela) / 2;
  });
}

function passoDaRolagem(centros: readonly number[]): number {
  const y = window.scrollY + window.innerHeight / 2;
  if (centros.length === 0 || y <= centros[0]) return 0;
  for (let i = 0; i < centros.length - 1; i += 1) {
    if (y < centros[i + 1]) return i + (y - centros[i]) / (centros[i + 1] - centros[i]);
  }
  return centros.length - 1;
}

function ativarEntradasDeTexto(raiz: HTMLElement): IntersectionObserver {
  raiz.classList.add("anima");
  const observador = new IntersectionObserver(
    (entradas) => entradas.forEach((e) => e.target.classList.toggle("visivel", e.isIntersecting)),
    { threshold: 0.25 },
  );
  raiz.querySelectorAll(".passo-texto").forEach((el) => observador.observe(el));
  return observador;
}

/** Sem suporte a 3D, a página continua inteira: só o fundo fica parado. Parada, a cena não gasta a placa de vídeo. */
export default function Cena3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const raiz = document.querySelector<HTMLElement>("[data-historia]");
    if (!canvas || !raiz) return;

    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const comMouse = window.matchMedia("(pointer: fine)").matches;
    const observadorTexto = semMovimento ? null : ativarEntradasDeTexto(raiz);
    let cena: Cena | null = null;
    let quadro = 0;
    let cancelado = false;
    let centros = medirSecoes();
    let municipio: number | null = null;

    const remedir = new ResizeObserver(() => {
      centros = medirSecoes();
      cena?.ajustar();
    });
    remedir.observe(document.body);
    remedir.observe(canvas);

    const aoFocar = (e: Event) => {
      municipio = (e as CustomEvent<{ municipio: number | null }>).detail.municipio;
      cena?.focar(municipio);
    };
    const aoApontar = (e: PointerEvent) => {
      cena?.apontar((e.clientX / window.innerWidth - 0.5) * 2, (0.5 - e.clientY / window.innerHeight) * 2);
    };
    window.addEventListener(EVENTO_FOCO, aoFocar);
    if (comMouse && !semMovimento) window.addEventListener("pointermove", aoApontar, { passive: true });

    const laco = (agora: number) => {
      cena?.desenhar(passoDaRolagem(centros), agora / 1000);
      quadro = requestAnimationFrame(laco);
    };

    async function iniciar(): Promise<void> {
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const [modulo, resposta] = await Promise.all([import("@/lib/cena/cena"), fetch(`${base}/historia.json`)]);
      if (!resposta.ok) throw new Error(`historia.json respondeu ${resposta.status}`);
      const historia = (await resposta.json()) as Historia;
      if (cancelado) return;
      cena = modulo.criarCena(canvas as HTMLCanvasElement, historia, semMovimento);
      cena.focar(municipio);
      canvas?.classList.add("pronta");
      quadro = requestAnimationFrame(laco);
    }

    iniciar().catch((erro: unknown) => {
      console.warn("Cena 3D indisponível; a página segue sem ela.", erro);
    });

    return () => {
      cancelado = true;
      cancelAnimationFrame(quadro);
      remedir.disconnect();
      observadorTexto?.disconnect();
      window.removeEventListener(EVENTO_FOCO, aoFocar);
      window.removeEventListener("pointermove", aoApontar);
      cena?.destruir();
    };
  }, []);

  return (
    <div className="cena" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
