import Contador from "@/components/contador";
import { MATERNIDADES, PROBLEMAS, milhar } from "@/lib/numeros";

const LINK_PRE_NATAL = "https://agenciagov.ebc.com.br/noticias/202608/pre-natal-cuidados-desde-as-primeiras-semanas-tornam-a-gestacao-mais-segura";

type Problema = {
  numero: number;
  titulo: string;
  frase: React.ReactNode;
  /** Explica a forma que os cubos fazem ao lado (lib/cena/formas.ts). */
  desenho: string;
  ressalva: React.ReactNode;
};

/** A ordem tem que bater com os quadros de lib/cena/quadros.ts: esfera que enche, anéis, esfera menor, 100 pontos. */
const LISTA: readonly Problema[] = [
  {
    numero: PROBLEMAS.cesareaAntesDoTrabalho,
    titulo: "Cesárea sem trabalho de parto.",
    frase: <>De cada 100 cesáreas, {PROBLEMAS.cesareaAntesDoTrabalho} aconteceram antes de o trabalho de parto começar.</>,
    desenho: "A esfera são as cesáreas. A parte laranja não esperou o trabalho de parto.",
    ressalva: "Muitas têm indicação médica, como placenta prévia. O registro não diz quais foram escolha e quais foram indicação.",
  },
  {
    numero: PROBLEMAS.cesareaCom37ou38,
    titulo: "Nascer com 37 ou 38 semanas.",
    frase: (
      <>
        De cada 100 cesáreas, {PROBLEMAS.cesareaCom37ou38} foram com 37 ou 38 semanas. No parto normal, {PROBLEMAS.normalCom37ou38}.
      </>
    ),
    desenho: "Anel de fora, em laranja: cesáreas. Anel de dentro, em verde: partos normais.",
    ressalva: "Já é gestação a termo, no começo dele. Em parte dos casos, o parto nessa fase é indicação médica.",
  },
  {
    numero: PROBLEMAS.foraDaCidade,
    titulo: "Parir longe de casa.",
    frase: <>De cada 100 bebês, {PROBLEMAS.foraDaCidade} nasceram em uma cidade diferente daquela onde a mãe mora.</>,
    desenho: "A esfera menor, em laranja, são os bebês que nasceram em outra cidade.",
    ressalva: `Só ${milhar(MATERNIDADES.cidades)} cidades do país têm maternidade com 50 ou mais partos por ano.`,
  },
  {
    numero: PROBLEMAS.menosDe7Consultas,
    titulo: "Menos de 7 consultas.",
    frase: <>De cada 100 gestantes, {PROBLEMAS.menosDe7Consultas} fizeram menos de 7 consultas de pré-natal.</>,
    desenho: "São 100 pontos, um para cada gestante. Os laranja fizeram menos de 7 consultas.",
    ressalva: (
      <>
        Sete é o mínimo indicado pelo Ministério da Saúde. Parte são bebês que nasceram antes de dar tempo.{" "}
        <a href={LINK_PRE_NATAL} target="_blank" rel="noopener noreferrer">Ver a recomendação</a>
      </>
    ),
  },
];

/** Os 4 problemas: em cada um, os cubos da cena 3D tomam uma forma que mostra o número. */
export default function Problemas() {
  return (
    <>
      {LISTA.map((problema) => (
        <section className="passo" data-passo key={problema.titulo}>
          <div className="passo-texto">
            <p className="numeros">
              <Contador className="alto" valor={problema.numero} />
            </p>
            <h2>{problema.titulo}</h2>
            <p>{problema.frase}</p>
            <p className="desenho">{problema.desenho}</p>
            <p className="ressalva">{problema.ressalva}</p>
          </div>
        </section>
      ))}
    </>
  );
}
