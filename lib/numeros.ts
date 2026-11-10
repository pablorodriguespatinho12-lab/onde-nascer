/** Números que aparecem no texto da história. Tudo vem dos arquivos gerados por `npm run dados`. */
import resumo from "@/public/dados/resumo.json";
import historia from "@/public/historia.json";

const CEM = 100;
const porcento = (parte: number, todo: number) => Math.round((parte / todo) * CEM);
const p = resumo.problemas;

export const milhar = (n: number) => n.toLocaleString("pt-BR");

export const BRASIL = {
  geral: porcento(resumo.brasil.cesareas, resumo.brasil.partos),
  baixoRisco: porcento(resumo.brasil.cesareas_br, resumo.brasil.partos_br),
  registros: resumo.linhas,
};

export const PROBLEMAS = {
  cesareaAntesDoTrabalho: porcento(p.ces_antes_do_trabalho, p.ces_com_inicio),
  cesareaCom37ou38: porcento(p.ces_37_38, p.ces_com_semanas),
  normalCom37ou38: porcento(p.vag_37_38, p.vag_com_semanas),
  foraDaCidade: porcento(p.fora_da_cidade, p.com_cidades),
  menosDe7Consultas: porcento(p.menos_de_7_consultas, p.com_consultas),
};

export const MATERNIDADES = {
  total: historia.total,
  semTaxa: historia.total - historia.comTaxa,
  partos: historia.partos,
  /** Cidades com pelo menos uma maternidade de 50 ou mais partos no ano. */
  cidades: new Set(historia.pontos.map((ponto) => ponto[0])).size,
  /** Arredonda sempre a favor da frase: "abaixo de" para cima e "acima de" para baixo. */
  abaixoDe: Math.ceil(historia.p10 * CEM),
  acimaDe: Math.floor(historia.p90 * CEM),
  exemplo: {
    nome: historia.cidadeExemplo.nome,
    quantas: historia.cidadeExemplo.maternidades,
    menor: Math.round(historia.cidadeExemplo.menor * CEM),
    maior: Math.round(historia.cidadeExemplo.maior * CEM),
  },
};
