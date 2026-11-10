import { MATERNIDADES, PROBLEMAS, milhar } from "@/lib/numeros";
import Palco from "./palco";

const LINK_PRE_NATAL = "https://agenciagov.ebc.com.br/noticias/202608/pre-natal-cuidados-desde-as-primeiras-semanas-tornam-a-gestacao-mais-segura";

type Problema = {
  arquivo: string;
  descricao: string;
  numero: number;
  titulo: string;
  frase: React.ReactNode;
  ressalva: React.ReactNode;
};

const LISTA: readonly Problema[] = [
  {
    arquivo: "cesarea-marcada",
    descricao: "Ilustração: gestante sentada olha um calendário com um dia marcado em laranja.",
    numero: PROBLEMAS.cesareaAntesDoTrabalho,
    titulo: "Cesárea sem trabalho de parto.",
    frase: <>De cada 100 cesáreas, {PROBLEMAS.cesareaAntesDoTrabalho} aconteceram antes de o trabalho de parto começar.</>,
    ressalva: "Muitas têm indicação médica, como placenta prévia. O registro não diz quais foram escolha e quais foram indicação.",
  },
  {
    arquivo: "nascer-cedo",
    descricao: "Ilustração: recém-nascido pequeno dorme num berço de hospital, com a mão de um adulto ao lado.",
    numero: PROBLEMAS.cesareaCom37ou38,
    titulo: "Nascer com 37 ou 38 semanas.",
    frase: (
      <>
        De cada 100 cesáreas, {PROBLEMAS.cesareaCom37ou38} foram com 37 ou 38 semanas. No parto normal, {PROBLEMAS.normalCom37ou38}.
      </>
    ),
    ressalva: "Já é gestação a termo, no começo dele. Em parte dos casos, o parto nessa fase é indicação médica.",
  },
  {
    arquivo: "viajar-para-parir",
    descricao: "Ilustração: um carro sozinho numa estrada à noite, indo em direção às luzes de uma cidade distante.",
    numero: PROBLEMAS.foraDaCidade,
    titulo: "Parir longe de casa.",
    frase: <>De cada 100 bebês, {PROBLEMAS.foraDaCidade} nasceram em uma cidade diferente daquela onde a mãe mora.</>,
    ressalva: `Só ${milhar(MATERNIDADES.cidades)} cidades do país têm maternidade com 50 ou mais partos por ano.`,
  },
  {
    arquivo: "pre-natal",
    descricao: "Ilustração: gestante sentada sozinha numa sala de espera vazia, com luz saindo de uma porta entreaberta.",
    numero: PROBLEMAS.menosDe7Consultas,
    titulo: "Menos de 7 consultas.",
    frase: <>De cada 100 gestantes, {PROBLEMAS.menosDe7Consultas} fizeram menos de 7 consultas de pré-natal.</>,
    ressalva: (
      <>
        Sete é o mínimo indicado pelo Ministério da Saúde. Parte são bebês que nasceram antes de dar tempo.{" "}
        <a href={LINK_PRE_NATAL} target="_blank" rel="noopener noreferrer">Ver a recomendação</a>
      </>
    ),
  },
];

/** Os 4 problemas: a ilustração fica parada à direita e troca conforme o texto passa. */
export default function Problemas() {
  return (
    <div className="problemas">
      <Palco ilustracoes={LISTA.map(({ arquivo, descricao }) => ({ arquivo, descricao }))} />
      <div className="trilho">
        {LISTA.map((problema) => (
          <section className="passo" data-passo key={problema.arquivo}>
            <div className="passo-texto">
              <p className="numeros">
                <strong className="alto">{problema.numero}%</strong>
              </p>
              <h2>{problema.titulo}</h2>
              <p>{problema.frase}</p>
              <p className="ressalva">{problema.ressalva}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
