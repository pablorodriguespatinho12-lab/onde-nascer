import type { Metadata } from "next";
import { MINIMO_BAIXO_RISCO } from "@/lib/dados";

export const metadata: Metadata = { title: "Como calculamos · Onde Nascer" };

export default function ComoCalculamos() {
  return (
    <main className="texto">
      <h1>Como calculamos</h1>
      <p>
        <strong>De onde vêm os dados.</strong> Do SINASC, o sistema do Ministério da Saúde que registra cada
        nascimento no Brasil, e do CNES, o cadastro de estabelecimentos de saúde, que dá nome e endereço. São
        2.389.325 registros de 2024, públicos em dadosabertos.saude.gov.br.
      </p>
      <p>
        <strong>O que entra.</strong> Só nascimentos em hospital, com o hospital identificado e o tipo de parto
        informado (normal ou cesárea). Maternidades com menos de 50 partos no ano ficam de fora: com poucos casos,
        a porcentagem muda muito por acaso.
      </p>
      <p>
        <strong>Por que &quot;baixo risco&quot;.</strong> Hospital que recebe gestação de risco faz mais cesárea por
        necessidade. Para comparar de forma justa, o número principal usa só os grupos 1 a 4 da Classificação de
        Robson, recomendada pela OMS: um bebê só, de cabeça para baixo, a termo e sem cesárea anterior. Quando uma
        maternidade tem menos de {MINIMO_BAIXO_RISCO} partos assim, mostramos só a taxa total.
      </p>
      <p>
        <strong>Média da cidade.</strong> É a soma das cesáreas de baixo risco dividida pela soma dos partos de baixo
        risco de todas as maternidades listadas, e não a média das porcentagens.
      </p>
      <p>
        <strong>O que este número não diz.</strong> Ele não diz se uma cesárea foi necessária ou não, nem a
        qualidade do atendimento. Serve para fazer a pergunta certa a quem acompanha a sua gestação.
      </p>
      <p>
        <strong>Gêmeos.</strong> O SINASC conta cada bebê que nasce, então um parto de gêmeos conta duas vezes. O
        efeito é pequeno: gêmeos ficam fora do grupo de baixo risco.
      </p>
    </main>
  );
}
