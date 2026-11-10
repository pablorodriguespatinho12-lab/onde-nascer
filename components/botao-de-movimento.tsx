"use client";

import { useEffect, useState } from "react";
import { definirParado, estaParado, mostrarNoDocumento } from "@/lib/movimento";

/** Botão fixo no canto: quem não quer movimento na tela pausa tudo com um toque. */
export default function BotaoDeMovimento() {
  const [parado, setParado] = useState(false);

  useEffect(() => {
    const guardado = estaParado();
    setParado(guardado);
    mostrarNoDocumento(guardado);
  }, []);

  const alternar = () => {
    const novo = !parado;
    setParado(novo);
    definirParado(novo);
  };

  return (
    <button type="button" className="botao-movimento" aria-pressed={parado} onClick={alternar}>
      {parado ? "Ligar animação" : "Pausar animação"}
    </button>
  );
}
