/** Formas que os cubos assumem nos 4 problemas. Em cada uma, a parte acesa é o número da frase. Funções puras, sem 3D. */
import { ANGULO_DOURADO, RAIO_ESFERA, pontoNaEsfera, sementeDe } from "./layouts";

/** Cada valor vai de 0 a 1 e vem do SINASC (lib/numeros.ts). */
export type Fracoes = {
  /** Esfera que enche de baixo para cima. */
  nivel: number;
  anelDeFora: number;
  anelDeDentro: number;
  /** Parte dos cubos que se solta e forma a esfera menor. */
  satelite: number;
  /** Quantos dos 100 pontos acendem. */
  grade: number;
};

export type Formas = {
  aneis: Float32Array;
  satelite: Float32Array;
  grade: Float32Array;
  /** 4 números por cubo (nível, anéis, satélite, grade): 1 = laranja, -1 = verde, 0 = apagado. */
  aceso: Float32Array;
};

const LARANJA = 1;
const VERDE = -1;
const RAIO_ANEL_DE_FORA = 22;
const RAIO_ANEL_DE_DENTRO = 13;
const ESPESSURA_ANEL = 1.5;
const PONTOS_POR_LADO = 10;
const PONTOS_DA_GRADE = PONTOS_POR_LADO * PONTOS_POR_LADO;
const ESPACO_ENTRE_PONTOS = 4.4;
const RAIO_DO_PONTO = 1.45;

type Cubo = { posicao: readonly [number, number, number]; aceso: number };

/** Cubos pares no anel de fora, ímpares no de dentro; o arco aceso começa no mesmo ângulo nos dois. */
function cuboNosAneis(i: number, total: number, fracoes: Fracoes): Cubo {
  const deFora = i % 2 === 0;
  const ordem = Math.floor(i / 2);
  const volta = ordem / Math.ceil(total / 2);
  const angulo = volta * Math.PI * 2;
  const desvio = ESPESSURA_ANEL * Math.sqrt(sementeDe(ordem));
  const anguloDoTubo = ordem * ANGULO_DOURADO;
  const raio = (deFora ? RAIO_ANEL_DE_FORA : RAIO_ANEL_DE_DENTRO) + Math.cos(anguloDoTubo) * desvio;
  const dentroDoArco = volta < (deFora ? fracoes.anelDeFora : fracoes.anelDeDentro);
  return {
    posicao: [Math.cos(angulo) * raio, Math.sin(anguloDoTubo) * desvio, Math.sin(angulo) * raio],
    aceso: dentroDoArco ? (deFora ? LARANJA : VERDE) : 0,
  };
}

/** Cada ponto da grade é um grupinho de cubos; os pontos acendem de baixo para cima. */
function cuboNaGrade(i: number, total: number, fracao: number): Cubo {
  const ponto = i % PONTOS_DA_GRADE;
  const [dx, dy, dz] = pontoNaEsfera(Math.floor(i / PONTOS_DA_GRADE), Math.ceil(total / PONTOS_DA_GRADE), RAIO_DO_PONTO);
  const meio = (PONTOS_POR_LADO - 1) / 2;
  const x = ((ponto % PONTOS_POR_LADO) - meio) * ESPACO_ENTRE_PONTOS;
  const y = (Math.floor(ponto / PONTOS_POR_LADO) - meio) * ESPACO_ENTRE_PONTOS;
  return { posicao: [x + dx, y + dy, dz], aceso: ponto < Math.round(fracao * PONTOS_DA_GRADE) ? LARANJA : 0 };
}

export function montarFormas(total: number, fracoes: Fracoes): Formas {
  const aneis = new Float32Array(total * 3);
  const satelite = new Float32Array(total * 3);
  const grade = new Float32Array(total * 3);
  const aceso = new Float32Array(total * 4);

  // Quem se solta é escolhido pela semente: fica espalhado pela esfera inteira, não num lado só.
  const solta = Array.from({ length: total }, (_, i) => sementeDe(i) < fracoes.satelite);
  const quantosSoltam = solta.filter(Boolean).length;
  const raioMenor = RAIO_ESFERA * Math.sqrt(quantosSoltam / total);
  const primeiroAceso = total * (1 - fracoes.nivel);
  let ordemNaMenor = 0;

  for (let i = 0; i < total; i += 1) {
    const anel = cuboNosAneis(i, total, fracoes);
    const ponto = cuboNaGrade(i, total, fracoes.grade);
    const naMenor = solta[i];
    const lugar = naMenor ? pontoNaEsfera(ordemNaMenor, quantosSoltam, raioMenor) : pontoNaEsfera(i, total, RAIO_ESFERA);
    if (naMenor) ordemNaMenor += 1;

    aneis.set(anel.posicao, i * 3);
    satelite.set(lugar, i * 3);
    grade.set(ponto.posicao, i * 3);
    // Na esfera, o índice cresce de cima para baixo: os últimos cubos são o fundo, que enche primeiro.
    aceso.set([i >= primeiroAceso ? LARANJA : 0, anel.aceso, naMenor ? LARANJA : 0, ponto.aceso], i * 4);
  }
  return { aneis, satelite, grade, aceso };
}
