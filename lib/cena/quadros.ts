/** Roteiro da câmera e das formas. Cada quadro corresponde a uma seção com data-passo na página. */

export type Vetor = readonly [number, number, number];

export type Quadro = {
  mapa: number;
  torre: number;
  histograma: number;
  cor: number;
  extremos: number;
  foco: number;
  camera: Vetor;
  alvo: Vetor;
  /** 1 empurra a imagem para longe do texto: direita no computador, cima no celular. */
  deslocamento: number;
  /** 1 afasta tudo em tela estreita para caber; 0 mantém o zoom. */
  ajusteCelular: number;
};

const CAMPOS = ["mapa", "torre", "histograma", "cor", "extremos", "foco", "deslocamento", "ajusteCelular"] as const;

/** Índice do quadro que aproxima a câmera da cidade de exemplo. */
export const CENA_CIDADE = 7;
export const OFFSET_CIDADE: Vetor = [13, 21, 27];
export const ALTURA_ALVO_CIDADE = 5;

export function montarQuadros(alturaHistograma: number, cidade: readonly [number, number]): readonly Quadro[] {
  const meio = alturaHistograma / 2;
  const [cx, cz] = cidade;
  const base = { mapa: 1, torre: 0, histograma: 0, cor: 0, extremos: 0, foco: 0, deslocamento: 1, ajusteCelular: 1 };
  const torres = { ...base, torre: 1, cor: 1 };
  const grafico = { ...torres, histograma: 1 };
  return [
    { ...base, mapa: 0, camera: [0, 3, 88], alvo: [0, 0, 0] },
    { ...base, mapa: 0, camera: [-20, 30, 74], alvo: [0, 0, 0] },
    { ...base, camera: [0, 66, 9], alvo: [0, 0, 0] },
    { ...torres, camera: [30, 27, 52], alvo: [3, 3, 0] },
    { ...torres, camera: [-38, 24, 56], alvo: [-4, 4, 2] },
    { ...grafico, camera: [0, meio + 5, 63], alvo: [0, meio, 0] },
    { ...grafico, extremos: 1, camera: [-15, meio + 9, 61], alvo: [0, meio, 0] },
    { ...torres, foco: 1, ajusteCelular: 0.35, camera: [cx + OFFSET_CIDADE[0], OFFSET_CIDADE[1], cz + OFFSET_CIDADE[2]], alvo: [cx, ALTURA_ALVO_CIDADE, cz] },
    { ...base, torre: 0.45, cor: 1, camera: [0, 62, 24], alvo: [0, 0, 0] },
  ];
}

function suavizar(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function misturarVetor(a: Vetor, b: Vetor, t: number): Vetor {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** `passo` é contínuo: 2.5 é o meio do caminho entre o quadro 2 e o quadro 3. */
export function quadroEm(quadros: readonly Quadro[], passo: number): Quadro {
  const limitado = Math.min(quadros.length - 1, Math.max(0, passo));
  const indice = Math.min(quadros.length - 2, Math.floor(limitado));
  const a = quadros[indice];
  const b = quadros[indice + 1];
  const t = suavizar(limitado - indice);
  const numeros = Object.fromEntries(CAMPOS.map((c) => [c, a[c] + (b[c] - a[c]) * t])) as Pick<Quadro, (typeof CAMPOS)[number]>;
  return { ...numeros, camera: misturarVetor(a.camera, b.camera, t), alvo: misturarVetor(a.alvo, b.alvo, t) };
}
