import Link from "next/link";
import { BRASIL, milhar } from "@/lib/numeros";

const LINK_LEI = "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2005/lei/l11108.htm";

export default function Antes() {
  return (
    <section className="antes">
      <div className="antes-conteudo">
        <div className="antes-texto">
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
                Dos {milhar(BRASIL.registros)} registros de nascimento de 2024 no SINASC, com endereço do CNES.{" "}
                <Link href="/como-calculamos/">Como calculamos</Link>
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
