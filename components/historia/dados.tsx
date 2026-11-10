import Link from "next/link";
import { BRASIL, MATERNIDADES, milhar } from "@/lib/numeros";

const LINK_OMS = "https://www.who.int/news/item/09-04-2015-caesarean-sections-should-only-be-performed-when-medically-necessary";

/** Os passos em que os cubos contam a história: propósito, mapa, torres, pontas e uma cidade. */
export default function Dados() {
  const { exemplo } = MATERNIDADES;
  return (
    <>
      <section className="passo" data-passo>
        <div className="passo-texto">
          <h2>Escolher onde nascer não devia ser no escuro.</h2>
          <p>
            Cada ponto de luz é uma das <strong>{milhar(MATERNIDADES.total)}</strong> maternidades do país. Este site mostra quanto
            cada uma faz de cesárea, com dados do Ministério da Saúde. Grátis e sem cadastro.
          </p>
        </div>
      </section>

      <section className="passo" data-passo>
        <div className="passo-texto">
          <h2>Este é o mapa delas.</h2>
          <p>Cada maternidade na sua cidade. Juntas, fizeram {milhar(MATERNIDADES.partos)} partos em 2024.</p>
        </div>
      </section>

      <section className="passo" data-passo>
        <div className="passo-texto">
          <p className="numeros">
            <strong className="alto">{BRASIL.geral}%</strong>
            <strong className="meio">{BRASIL.baixoRisco}%</strong>
          </p>
          <h2>Altura é cesárea.</h2>
          <p>
            {BRASIL.geral}% dos partos do país foram cesáreas. Em gestações de baixo risco, {BRASIL.baixoRisco}%: é essa taxa
            que levanta cada torre. As {milhar(MATERNIDADES.semTaxa)} com poucos casos ficam rentes ao chão.
          </p>
          <p className="ressalva">
            A OMS não fixa meta, mas diz que, na população, taxas acima de 10% não reduzem a mortalidade de mães e bebês.{" "}
            <a href={LINK_OMS} target="_blank" rel="noopener noreferrer">Ver a OMS</a>
          </p>
          <div className="escala" role="img" aria-label="Escala de cor de 0% a 100% de cesárea">
            <span>0%</span><i /><span>100%</span>
          </div>
        </div>
      </section>

      <section className="passo" data-passo>
        <div className="passo-texto">
          <p className="numeros">
            <strong className="baixo">{MATERNIDADES.abaixoDe}%</strong>
            <strong className="alto">{MATERNIDADES.acimaDe}%</strong>
          </p>
          <h2>A distância entre as pontas.</h2>
          <p>
            Lado a lado, por taxa: 1 em cada 10 fica abaixo de {MATERNIDADES.abaixoDe}%. Outra 1 em cada 10 passa de{" "}
            {MATERNIDADES.acimaDe}%.
          </p>
          <p className="ressalva">
            A torre da esquerda são maternidades, em geral pequenas, quase sem cesárea: pode ser falta de centro cirúrgico ou
            registro incompleto.
          </p>
        </div>
      </section>

      <section className="passo" data-passo>
        <div className="passo-texto">
          <p className="numeros">
            <strong className="baixo">{exemplo.menor}%</strong>
            <strong className="alto">{exemplo.maior}%</strong>
          </p>
          <h2>Na mesma cidade.</h2>
          <p>
            A menor e a maior taxa em {exemplo.nome}, entre as {exemplo.quantas} maternidades com 100 ou mais partos de baixo
            risco.
          </p>
          <p className="ressalva">
            O número não mostra o motivo: tipo de hospital e escolha da gestante também pesam.{" "}
            <Link href="/como-calculamos/">Como calculamos</Link>
          </p>
        </div>
      </section>
    </>
  );
}
