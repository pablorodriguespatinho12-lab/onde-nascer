"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ESTADOS,
  MINIMO_BAIXO_RISCO,
  type Maternidade,
  carregarEstado,
  cidadesDe,
  ordenar,
  porcento,
  taxa,
  taxaBaixoRisco,
  taxaDaCidade,
} from "@/lib/dados";

type Estado = { tipo: "vazio" } | { tipo: "carregando" } | { tipo: "erro"; mensagem: string } | { tipo: "pronto"; lista: Maternidade[] };

export default function Busca() {
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState<Estado>({ tipo: "vazio" });

  useEffect(() => {
    if (!uf) return;
    let ativo = true;
    setEstado({ tipo: "carregando" });
    carregarEstado(uf)
      .then((lista) => ativo && setEstado({ tipo: "pronto", lista }))
      .catch((erro: Error) => ativo && setEstado({ tipo: "erro", mensagem: erro.message }));
    return () => {
      ativo = false;
    };
  }, [uf]);

  const lista = estado.tipo === "pronto" ? estado.lista : [];
  const cidades = useMemo(() => cidadesDe(lista), [lista]);
  const daCidade = useMemo(() => ordenar(lista.filter((m) => m.cidade === cidade)), [lista, cidade]);

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="escolha">
        <label htmlFor="uf">
          Estado
          <select id="uf" value={uf} onChange={(e) => { setUf(e.target.value); setCidade(""); }}>
            <option value="">Escolha o estado</option>
            {ESTADOS.map(([sigla, nome]) => (
              <option key={sigla} value={sigla}>{nome}</option>
            ))}
          </select>
        </label>
        <label htmlFor="cidade">
          Cidade
          <select id="cidade" value={cidade} disabled={cidades.length === 0} onChange={(e) => setCidade(e.target.value)}>
            <option value="">{estado.tipo === "carregando" ? "Carregando..." : "Escolha a cidade"}</option>
            {cidades.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      {estado.tipo === "erro" && <p className="aviso">{estado.mensagem} Tente recarregar a página.</p>}
      {estado.tipo === "pronto" && !cidade && (
        <p className="aviso">Só aparecem cidades com pelo menos uma maternidade que fez 50 partos ou mais em 2024.</p>
      )}
      {cidade && <Resultado cidade={cidade} lista={daCidade} />}
    </section>
  );
}

function Resultado({ cidade, lista }: { cidade: string; lista: Maternidade[] }) {
  const media = taxaDaCidade(lista);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="resumo-cidade">
        <h2>{cidade}</h2>
        <p>
          {lista.length} {lista.length === 1 ? "maternidade" : "maternidades"} · cesárea em gestação de baixo risco na
          cidade: <strong>{porcento(media)}</strong>
        </p>
      </div>
      <div className="legenda">
        <span className="l-hospital">esta maternidade (baixo risco)</span>
        {media !== null && <span className="l-media">média da cidade</span>}
      </div>
      <ul className="lista">
        {lista.map((m) => (
          <Item key={m.cnes} m={m} media={media} />
        ))}
      </ul>
    </div>
  );
}

function Item({ m, media }: { m: Maternidade; media: number | null }) {
  const br = taxaBaixoRisco(m);
  const total = taxa(m.cesareas, m.partos);
  const endereco = [m.endereco, m.bairro].filter(Boolean).join(" · ");
  return (
    <li className="item">
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
        {m.partos.toLocaleString("pt-BR")} partos em 2024 · cesárea em todos os partos: {porcento(total)}
      </span>
    </li>
  );
}
