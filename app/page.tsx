import Busca from "@/components/busca";
import Cena3D from "@/components/cena-3d";
import CursorVivo from "@/components/cursor-vivo";
import Antes from "@/components/historia/antes";
import Dados from "@/components/historia/dados";
import Problemas from "@/components/historia/problemas";
import ImagemViva from "@/components/imagem-viva";

/** A ordem das seções com `data-passo` tem que bater com os quadros de lib/cena/quadros.ts. */
export default function Inicio() {
  return (
    <>
      <Cena3D />
      <CursorVivo />
      <main className="historia" data-historia>
        <section className="passo abertura" data-passo>
          <div className="passo-texto">
            <h1>Onde nascer muda o parto.</h1>
            <p>Veja quanto cada maternidade da sua cidade faz de cesárea, com dados reais de 2024.</p>
            <a className="botao" href="#busca">Ver minha cidade</a>
          </div>
          <ImagemViva
            arquivo="abertura"
            descricao="Ilustração: gestante de perfil, com a mão na barriga, olha as luzes de uma cidade à noite."
            prioridade
          />
        </section>

        <Problemas />
        <Dados />

        <section className="passo busca-secao" id="busca" data-passo>
          <div className="busca-painel">
            <h2>E na sua cidade?</h2>
            <Busca />
          </div>
        </section>

        <Antes />
      </main>
    </>
  );
}
