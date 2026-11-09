import Busca from "@/components/busca";
import { ANO_DOS_DADOS } from "@/lib/dados";

export default function Inicio() {
  return (
    <main className="pagina-inicio" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <header className="abertura">
        <h1>Quanto cada maternidade faz de cesárea?</h1>
        <p>
          Em gestação de baixo risco, 1 em cada 10 maternidades do Brasil faz cesárea em menos de{" "}
          <strong className="numero-grande">20%</strong> dos partos. Outra 1 em cada 10 faz em mais de{" "}
          <strong className="numero-grande">93%</strong>. Escolha a sua cidade e compare. Dados de todos os
          nascimentos de {ANO_DOS_DADOS} registrados pelo SUS.
        </p>
      </header>
      <Busca />
    </main>
  );
}
