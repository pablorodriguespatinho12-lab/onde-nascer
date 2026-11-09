/** Formato de cada maternidade em public/dados/<UF>.json (gerado por dados/processar.py + enriquecer.py). */
export type Maternidade = {
  cnes: string;
  municipio: string;
  cidade: string;
  nome: string;
  endereco: string;
  bairro: string;
  partos: number;
  cesareas: number;
  partos_br: number;
  cesareas_br: number;
};

/** Abaixo disso, a taxa de baixo risco oscila demais para comparar hospitais. */
export const MINIMO_BAIXO_RISCO = 30;

export const ANO_DOS_DADOS = 2024;

export const ESTADOS: ReadonlyArray<readonly [string, string]> = [
  ["AC", "Acre"], ["AL", "Alagoas"], ["AP", "Amapá"], ["AM", "Amazonas"], ["BA", "Bahia"],
  ["CE", "Ceará"], ["DF", "Distrito Federal"], ["ES", "Espírito Santo"], ["GO", "Goiás"],
  ["MA", "Maranhão"], ["MT", "Mato Grosso"], ["MS", "Mato Grosso do Sul"], ["MG", "Minas Gerais"],
  ["PA", "Pará"], ["PB", "Paraíba"], ["PR", "Paraná"], ["PE", "Pernambuco"], ["PI", "Piauí"],
  ["RJ", "Rio de Janeiro"], ["RN", "Rio Grande do Norte"], ["RS", "Rio Grande do Sul"],
  ["RO", "Rondônia"], ["RR", "Roraima"], ["SC", "Santa Catarina"], ["SP", "São Paulo"],
  ["SE", "Sergipe"], ["TO", "Tocantins"],
];

export function taxa(cesareas: number, partos: number): number | null {
  return partos > 0 ? cesareas / partos : null;
}

export function taxaBaixoRisco(m: Maternidade): number | null {
  return m.partos_br >= MINIMO_BAIXO_RISCO ? taxa(m.cesareas_br, m.partos_br) : null;
}

/** Taxa da cidade inteira (soma de todos os partos, não média das taxas). */
export function taxaDaCidade(lista: Maternidade[]): number | null {
  const soma = lista.reduce(
    (acc, m) => ({ c: acc.c + m.cesareas_br, p: acc.p + m.partos_br }),
    { c: 0, p: 0 },
  );
  return soma.p >= MINIMO_BAIXO_RISCO ? taxa(soma.c, soma.p) : null;
}

/** Menor cesárea de baixo risco primeiro; quem tem poucos casos vai para o fim. */
export function ordenar(lista: Maternidade[]): Maternidade[] {
  return [...lista].sort((a, b) => {
    const ta = taxaBaixoRisco(a);
    const tb = taxaBaixoRisco(b);
    if (ta === null && tb === null) return b.partos - a.partos;
    if (ta === null) return 1;
    if (tb === null) return -1;
    return ta - tb;
  });
}

const Z_95 = 1.96;

/** Meia largura do intervalo de confiança de 95% (Wilson), em pontos percentuais inteiros. */
export function margemDeErro(cesareas: number, partos: number): number | null {
  if (partos <= 0) return null;
  const p = cesareas / partos;
  const z2 = Z_95 * Z_95;
  const meia = (Z_95 * Math.sqrt((p * (1 - p)) / partos + z2 / (4 * partos * partos))) / (1 + z2 / partos);
  return Math.round(meia * 100);
}

export function porcento(valor: number | null): string {
  return valor === null ? "–" : `${Math.round(valor * 100)}%`;
}

export function cidadesDe(lista: Maternidade[]): string[] {
  return Array.from(new Set(lista.map((m) => m.cidade))).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export async function carregarEstado(uf: string): Promise<Maternidade[]> {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const resposta = await fetch(`${base}/dados/${uf}.json`);
  if (!resposta.ok) throw new Error(`Não consegui carregar os dados de ${uf} (erro ${resposta.status}).`);
  return (await resposta.json()) as Maternidade[];
}
