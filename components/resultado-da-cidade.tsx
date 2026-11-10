import { MINIMO_BAIXO_RISCO, type Maternidade, margemDeErro, porcento, taxa, taxaBaixoRisco, taxaDaCidade } from "@/lib/dados";

/** Depois deste item, todos entram juntos: lista longa não fica esperando a fila. */
const ULTIMO_DA_FILA = 10;
const PASSO_DA_FILA = 3;
const naFila = (i: number) => ({ "--i": Math.min(i, ULTIMO_DA_FILA) * PASSO_DA_FILA }) as React.CSSProperties;

/** As maternidades da cidade entram uma a uma e cada barra cresce até a taxa. */
export default function ResultadoDaCidade({ lista }: { lista: readonly Maternidade[] }) {
  const media = taxaDaCidade([...lista]);
  return (
    <div className="resultado">
      <p className="resumo-cidade entra">
        {lista.length} {lista.length === 1 ? "maternidade" : "maternidades"} · cesárea em gestação de baixo risco na cidade:{" "}
        <strong>{porcento(media)}</strong>
      </p>
      <div className="legenda entra">
        <span className="l-hospital">esta maternidade (baixo risco)</span>
        {media !== null && <span className="l-media">média da cidade</span>}
      </div>
      <ul className="lista">
        {lista.map((m, i) => (
          <Item key={m.cnes} m={m} media={media} ordem={i} />
        ))}
      </ul>
    </div>
  );
}

function Item({ m, media, ordem }: { m: Maternidade; media: number | null; ordem: number }) {
  const br = taxaBaixoRisco(m);
  const margem = br === null ? null : margemDeErro(m.cesareas_br, m.partos_br);
  const total = taxa(m.cesareas, m.partos);
  const endereco = [m.endereco, m.bairro].filter(Boolean).join(" · ");
  return (
    <li className="item entra" style={naFila(ordem)}>
      <div className="item-topo">
        <span className="item-nome">{m.nome}</span>
        <span className="item-taxa">{porcento(br)}</span>
      </div>
      {endereco && <span className="item-endereco">{endereco}</span>}
      {br !== null ? (
        <div className="barra" role="img" aria-label={`Cesárea em baixo risco: ${porcento(br)}`}>
          <div className="barra-cheia" style={{ width: `${br * 100}%` }} />
          {media !== null && <div className="barra-media" style={{ left: `calc(${media * 100}% - 1px)` }} />}
        </div>
      ) : (
        <span className="item-detalhe">Menos de {MINIMO_BAIXO_RISCO} partos de baixo risco: poucos casos para comparar.</span>
      )}
      <span className="item-detalhe">
        {margem !== null && <>Margem de erro: ± {margem} pontos · </>}
        {m.partos.toLocaleString("pt-BR")} partos em 2024 · cesárea em todos os partos: {porcento(total)}
      </span>
    </li>
  );
}
