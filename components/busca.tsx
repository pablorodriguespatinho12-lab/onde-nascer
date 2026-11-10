"use client";

import { useEffect, useMemo, useState } from "react";
import { EVENTO_FOCO } from "@/components/cena-3d";
import { EscolhaDeCidade, EscolhaDeEstado, Escolhido } from "@/components/escolha-de-lugar";
import ResultadoDaCidade from "@/components/resultado-da-cidade";
import { ESTADOS, type Maternidade, carregarEstado, cidadesDe, ordenar } from "@/lib/dados";

type Estado = { tipo: "vazio" } | { tipo: "carregando" } | { tipo: "erro"; mensagem: string } | { tipo: "pronto"; lista: Maternidade[] };

/** Dois passos, um de cada vez: estado (botões) e cidade (digitar ou tocar). O que já foi escolhido vira uma linha com "Trocar". */
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

  // A cidade escolhida acende e a câmera vai até ela na cena 3D.
  const municipio = daCidade.length > 0 ? Number(daCidade[0].municipio) : null;
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(EVENTO_FOCO, { detail: { municipio } }));
  }, [municipio]);

  const trocarEstado = () => {
    setUf("");
    setCidade("");
    setEstado({ tipo: "vazio" });
  };

  if (!uf) return <EscolhaDeEstado aoEscolher={setUf} />;

  const nomeDoEstado = ESTADOS.find(([sigla]) => sigla === uf)?.[1] ?? uf;
  return (
    <section className="busca">
      <Escolhido rotulo="Estado" valor={nomeDoEstado} aoTrocar={trocarEstado} />
      {estado.tipo === "erro" && <p className="aviso">{estado.mensagem} Tente recarregar a página.</p>}
      {estado.tipo !== "erro" && !cidade && (
        <EscolhaDeCidade cidades={cidades} carregando={estado.tipo !== "pronto"} aoEscolher={setCidade} />
      )}
      {cidade && <Escolhido rotulo="Cidade" valor={cidade} aoTrocar={() => setCidade("")} />}
      {cidade && <ResultadoDaCidade key={cidade} lista={daCidade} />}
    </section>
  );
}
