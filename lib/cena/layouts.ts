/** Calcula, para cada maternidade, onde o cubo fica em cada forma da história. Funções puras, sem 3D. */

/** [município, longitude, latitude, taxa em milésimos ou -1 quando há poucos casos] */
export type Ponto = readonly [number, number, number, number];

export type Historia = {
  total: number;
  comTaxa: number;
  partos: number;
  p10: number;
  mediana: number;
  p90: number;
  larguraFaixa: number;
  cidadeExemplo: { municipio: number; nome: string; menor: number; maior: number; maternidades: number };
  pontos: readonly Ponto[];
};

export type Layouts = {
  esfera: Float32Array;
  mapa: Float32Array;
  histograma: Float32Array;
  taxa: Float32Array;
  semente: Float32Array;
  alturaHistograma: number;
};

const CENTRO_LONGITUDE = -52;
const CENTRO_LATITUDE = -14.5;
const CORRECAO_LONGITUDE = 0.96; // cos(15°): evita o Brasil achatado sem projeção completa
const RAIO_ESFERA = 21;
const ANGULO_DOURADO = Math.PI * (3 - Math.sqrt(5));
const ESPIRAL_NA_CIDADE = 0.24;
const PERCENTUAL_TOTAL = 100;
const LADO_COLUNA = 0.74;
const LADO_CAMADA = 0.5;
const CUBOS_POR_CAMADA = 3;

export function posicaoNoMapa(longitude: number, latitude: number): [number, number] {
  return [(longitude - CENTRO_LONGITUDE) * CORRECAO_LONGITUDE, -(latitude - CENTRO_LATITUDE)];
}

function montarEsfera(total: number): Float32Array {
  const saida = new Float32Array(total * 3);
  for (let i = 0; i < total; i += 1) {
    const y = 1 - (2 * (i + 0.5)) / total;
    const raio = Math.sqrt(1 - y * y);
    const angulo = i * ANGULO_DOURADO;
    saida.set([Math.cos(angulo) * raio * RAIO_ESFERA, y * RAIO_ESFERA, Math.sin(angulo) * raio * RAIO_ESFERA], i * 3);
  }
  return saida;
}

/** Maternidades da mesma cidade se abrem em espiral a partir do centro do município. */
function montarMapa(pontos: readonly Ponto[]): Float32Array {
  const saida = new Float32Array(pontos.length * 3);
  const usadosNaCidade = new Map<number, number>();
  pontos.forEach(([municipio, longitude, latitude], i) => {
    const ordem = usadosNaCidade.get(municipio) ?? 0;
    usadosNaCidade.set(municipio, ordem + 1);
    const [x, z] = posicaoNoMapa(longitude, latitude);
    const raio = ESPIRAL_NA_CIDADE * Math.sqrt(ordem);
    const angulo = ordem * ANGULO_DOURADO;
    saida.set([x + Math.cos(angulo) * raio, 0, z + Math.sin(angulo) * raio], i * 3);
  });
  return saida;
}

/** Cubos com a mesma taxa empilham na mesma coluna; quem tem poucos casos fica fora (some nessa cena). */
function montarHistograma(pontos: readonly Ponto[], larguraFaixa: number): { posicoes: Float32Array; altura: number } {
  const colunas = Math.ceil(PERCENTUAL_TOTAL / larguraFaixa);
  const usados = new Array<number>(colunas).fill(0);
  const posicoes = new Float32Array(pontos.length * 3);
  pontos.forEach((ponto, i) => {
    const milesimos = ponto[3];
    if (milesimos < 0) return;
    const coluna = Math.min(colunas - 1, Math.floor(milesimos / (larguraFaixa * 10)));
    const ordem = usados[coluna];
    usados[coluna] = ordem + 1;
    const x = (coluna - (colunas - 1) / 2) * LADO_COLUNA;
    const y = Math.floor(ordem / CUBOS_POR_CAMADA) * LADO_CAMADA;
    const z = ((ordem % CUBOS_POR_CAMADA) - (CUBOS_POR_CAMADA - 1) / 2) * LADO_CAMADA;
    posicoes.set([x, y, z], i * 3);
  });
  return { posicoes, altura: (Math.max(...usados) / CUBOS_POR_CAMADA) * LADO_CAMADA };
}

/** Semente estável derivada do índice: o mesmo cubo sempre anima no mesmo momento. */
function montarSementes(total: number): Float32Array {
  return Float32Array.from({ length: total }, (_, i) => (i * 0.618034) % 1);
}

export function montarLayouts(historia: Historia): Layouts {
  const { pontos, larguraFaixa } = historia;
  const { posicoes, altura } = montarHistograma(pontos, larguraFaixa);
  return {
    esfera: montarEsfera(pontos.length),
    mapa: montarMapa(pontos),
    histograma: posicoes,
    taxa: Float32Array.from(pontos, (p) => (p[3] < 0 ? -1 : p[3] / 1000)),
    semente: montarSementes(pontos.length),
    alturaHistograma: altura,
  };
}
