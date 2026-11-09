import Link from "next/link";
import Busca from "@/components/busca";
import Cena3D from "@/components/cena-3d";
import resumo from "@/public/dados/resumo.json";
import historia from "@/public/historia.json";

const LINK_OMS = "https://www.who.int/news/item/09-04-2015-caesarean-sections-should-only-be-performed-when-medically-necessary";
const LINK_LEI = "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2005/lei/l11108.htm";
const milhar = (n: number) => n.toLocaleString("pt-BR");
const geral = Math.round((resumo.brasil.cesareas / resumo.brasil.partos) * 100);
const baixoRisco = Math.round((resumo.brasil.cesareas_br / resumo.brasil.partos_br) * 100);
/** Arredonda sempre a favor da frase: "abaixo de" para cima e "acima de" para baixo. */
const abaixoDe = Math.ceil(historia.p10 * 100);
const acimaDe = Math.floor(historia.p90 * 100);
const exemplo = historia.cidadeExemplo;
const menorExemplo = Math.round(exemplo.menor * 100);
const maiorExemplo = Math.round(exemplo.maior * 100);

export default function Inicio() {
  return (
    <>
      <Cena3D />
      <main className="historia" data-historia>
        <section className="passo abertura" data-passo>
          <div className="passo-texto">
            <h1>Cesárea: o Brasil não é um só.</h1>
            <p>Veja quanto cada maternidade da sua cidade faz de cesárea, com dados reais de 2024.</p>
            <a className="botao" href="#busca">Ver minha cidade</a>
          </div>
        </section>

        <section className="passo" data-passo>
          <div className="passo-texto">
            <h2>Para que serve.</h2>
            <p>Escolher onde ter um filho quase sempre é uma decisão sem números. Aqui você compara as maternidades antes de decidir.</p>
            <ul className="fatos">
              <li>Cada cubo é uma das <strong>{milhar(historia.total)}</strong> maternidades do país.</li>
              <li>Os dados vêm do <strong>Ministério da Saúde</strong>: nascimentos registrados em 2024.</li>
              <li>É <strong>grátis</strong> e não pede cadastro.</li>
            </ul>
          </div>
        </section>

        <section className="passo" data-passo>
          <div className="passo-texto">
            <h2>Este é o mapa delas.</h2>
            <p>Cada maternidade na sua cidade. Juntas, fizeram {milhar(historia.partos)} partos em 2024.</p>
          </div>
        </section>

        <section className="passo" data-passo>
          <div className="passo-texto">
            <h2>Altura é cesárea.</h2>
            <p>Só gestações de baixo risco, para comparar de forma justa. Quanto mais alta a torre, maior a taxa. As {milhar(historia.total - historia.comTaxa)} com poucos casos ficam rentes ao chão.</p>
            <div className="escala" role="img" aria-label="Escala de cor de 0% a 100% de cesárea">
              <span>0%</span><i /><span>100%</span>
            </div>
          </div>
        </section>

        <section className="passo" data-passo>
          <div className="passo-texto">
            <p className="numeros">
              <strong className="alto">{geral}%</strong>
              <strong className="meio">{baixoRisco}%</strong>
            </p>
            <h2>Por que isso importa.</h2>
            <p>
              {geral}% dos partos do país foram cesáreas. Em gestações de baixo risco, {baixoRisco}%. A OMS não fixa meta,
              mas diz que, na população, taxas acima de 10% não reduzem a mortalidade de mães e bebês.{" "}
              <a href={LINK_OMS} target="_blank" rel="noopener noreferrer">Ver a OMS</a>
            </p>
          </div>
        </section>

        <section className="passo" data-passo>
          <div className="passo-texto">
            <h2>Agora, todas lado a lado.</h2>
            <p>Cada coluna reúne maternidades com taxa parecida. A torre da esquerda são maternidades, em geral pequenas, quase sem cesárea: pode ser falta de centro cirúrgico ou registro incompleto.</p>
          </div>
        </section>

        <section className="passo" data-passo>
          <div className="passo-texto">
            <p className="numeros">
              <strong className="baixo">{abaixoDe}%</strong>
              <strong className="alto">{acimaDe}%</strong>
            </p>
            <h2>A distância entre as pontas.</h2>
            <p>1 em cada 10 fica abaixo de {abaixoDe}%. Outra 1 em cada 10 passa de {acimaDe}%.</p>
          </div>
        </section>

        <section className="passo" data-passo>
          <div className="passo-texto">
            <p className="numeros">
              <strong className="baixo">{menorExemplo}%</strong>
              <strong className="alto">{maiorExemplo}%</strong>
            </p>
            <h2>Na mesma cidade.</h2>
            <p>
              A menor e a maior taxa em {exemplo.nome}, entre as {exemplo.maternidades} maternidades com 100 ou mais partos de
              baixo risco. O número não mostra o motivo: tipo de hospital e escolha da gestante também pesam.{" "}
              <Link href="/como-calculamos/">Como calculamos</Link>
            </p>
          </div>
        </section>

        <section className="passo busca-secao" id="busca" data-passo>
          <div className="busca-painel">
            <h2>E na sua cidade?</h2>
            <Busca />
          </div>
        </section>

        <section className="antes">
          <div className="antes-conteudo">
            <h2>Antes de escolher.</h2>
            <div className="antes-grade">
              <article>
                <h3>Pergunte na consulta</h3>
                <p>Quantos partos normais e cesáreas vocês fizeram no último ano? Quem fica de plantão? Em que casos indicam cirurgia?</p>
              </article>
              <article>
                <h3>Conheça seu direito</h3>
                <p>
                  Nos serviços do SUS, próprios ou conveniados, você pode ter um acompanhante de sua escolha no trabalho de parto,
                  no parto e logo depois. <a href={LINK_LEI} target="_blank" rel="noopener noreferrer">Lei 11.108/2005</a>
                </p>
              </article>
              <article>
                <h3>O que o número não diz</h3>
                <p>Ele não mede a qualidade do atendimento nem explica cada cirurgia. Cesárea salva vidas quando é necessária.</p>
              </article>
              <article>
                <h3>De onde vêm os dados</h3>
                <p>
                  Dos {milhar(resumo.linhas)} registros de nascimento de 2024 no SINASC, com endereço do CNES.{" "}
                  <Link href="/como-calculamos/">Como calculamos</Link>
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
