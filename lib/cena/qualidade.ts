/** Reduz a resolução sozinha quando o computador da pessoa não dá conta. */

const AMOSTRAS = 30;
const LIMITE_MS = 24;
const FATOR_REDUCAO = 0.8;
const ESCALA_MINIMA = 0.7;
const INTERVALO_INVALIDO_MS = 250;

export type Qualidade = { registrar: (intervaloMs: number) => number | null };

export function criarQualidade(escalaInicial: number): Qualidade {
  let escala = escalaInicial;
  let amostras: number[] = [];

  return {
    /** Devolve a nova escala quando precisa baixar; `null` mantém a atual. */
    registrar(intervaloMs) {
      if (intervaloMs > INTERVALO_INVALIDO_MS || escala <= ESCALA_MINIMA) return null;
      amostras = [...amostras, intervaloMs];
      if (amostras.length < AMOSTRAS) return null;
      const mediana = [...amostras].sort((a, b) => a - b)[Math.floor(AMOSTRAS / 2)];
      amostras = [];
      if (mediana <= LIMITE_MS) return null;
      escala = Math.max(ESCALA_MINIMA, escala * FATOR_REDUCAO);
      return escala;
    },
  };
}
