"use client";

import { useMemo, useState } from "react";
import { ESTADOS } from "@/lib/dados";

/** Atraso de entrada em fila: cada item usa `--i` no CSS. */
const naFila = (i: number) => ({ "--i": i }) as React.CSSProperties;

const semAcento = (texto: string) => texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Linha que mostra o que já foi escolhido, com o botão de voltar atrás. */
export function Escolhido({ rotulo, valor, aoTrocar }: { rotulo: string; valor: string; aoTrocar: () => void }) {
  return (
    <div className="escolhido entra">
      <span>
        <small>{rotulo}</small>
        {valor}
      </span>
      <button type="button" onClick={aoTrocar}>Trocar</button>
    </div>
  );
}

export function EscolhaDeEstado({ aoEscolher }: { aoEscolher: (uf: string) => void }) {
  return (
    <div className="etapa entra">
      <p className="etapa-titulo"><b>1</b> Toque no seu estado</p>
      <div className="ufs">
        {ESTADOS.map(([sigla, nome], i) => (
          <button key={sigla} type="button" className="uf entra" style={naFila(i)} title={nome} aria-label={nome} onClick={() => aoEscolher(sigla)}>
            {sigla}
          </button>
        ))}
      </div>
    </div>
  );
}

type PropsCidade = { cidades: readonly string[]; carregando: boolean; aoEscolher: (cidade: string) => void };

/** Digitar filtra a lista (sem ligar para acento); Enter escolhe a primeira. */
export function EscolhaDeCidade({ cidades, carregando, aoEscolher }: PropsCidade) {
  const [texto, setTexto] = useState("");
  const filtradas = useMemo(() => {
    const busca = semAcento(texto.trim());
    return busca ? cidades.filter((c) => semAcento(c).includes(busca)) : cidades;
  }, [cidades, texto]);

  const aoEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (filtradas.length > 0) aoEscolher(filtradas[0]);
  };

  return (
    <form className="etapa entra" onSubmit={aoEnviar}>
      <label className="etapa-titulo" htmlFor="cidade"><b>2</b> Escolha a cidade</label>
      <input
        id="cidade"
        className="campo"
        type="search"
        autoComplete="off"
        placeholder={carregando ? "Carregando..." : "Digite o nome da cidade"}
        disabled={carregando}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      {filtradas.length > 0 && (
        <ul className="cidades">
          {filtradas.map((c) => (
            <li key={c}>
              <button type="button" onClick={() => aoEscolher(c)}>{c}</button>
            </li>
          ))}
        </ul>
      )}
      {!carregando && (
        <p className="item-detalhe">
          {filtradas.length === 0 ? "Nenhuma cidade com esse nome. " : ""}
          Só aparecem cidades com pelo menos uma maternidade que fez 50 partos ou mais em 2024.
        </p>
      )}
    </form>
  );
}
