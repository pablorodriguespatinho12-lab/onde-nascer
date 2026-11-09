import Link from "next/link";
import Busca from "@/components/busca";
import Cena3D from "@/components/cena-3d";
import historia from "@/public/historia.json";

const milhar = (n: number) => n.toLocaleString("pt-BR");
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
            <p>Cada cubo é uma das {milhar(historia.total)} maternidades do país, com os dados reais de 2024.</p>
            <a className="botao" href="#busca">Ver minha cidade</a>
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
      </main>
    </>
  );
}
