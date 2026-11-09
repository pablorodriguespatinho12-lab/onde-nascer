#!/usr/bin/env python3
"""Gera public/historia.json: um registro por maternidade para a cena 3D e os números do texto.

Uso: python3 -I dados/gerar_historia.py public/dados dados/bruto/municipios.csv public/historia.json
Coordenadas: centro de cada município, de github.com/kelvins/municipios-brasileiros (MIT).
"""
import csv
import json
import sys
from pathlib import Path

MINIMO_BAIXO_RISCO = 30  # igual a lib/dados.ts
MINIMO_COMPARAR_CIDADE = 100  # partos de baixo risco para entrar na comparação dentro da cidade
MINIMO_HOSPITAIS_CIDADE = 3
LARGURA_FAIXA = 2  # pontos percentuais por coluna do histograma


def ler_maternidades(pasta: Path) -> list[dict]:
    """Só os arquivos de UF são listas; arquivos de resumo são ignorados."""
    todas = []
    for arquivo in sorted(pasta.glob("*.json")):
        conteudo = json.loads(arquivo.read_text(encoding="utf-8"))
        if isinstance(conteudo, list):
            todas.extend(conteudo)
    return todas


def ler_coordenadas(caminho: Path) -> dict[str, tuple[float, float]]:
    with caminho.open(encoding="utf-8", newline="") as f:
        return {l["codigo_ibge"][:6]: (float(l["longitude"]), float(l["latitude"])) for l in csv.DictReader(f)}


def taxa_br(m: dict) -> float | None:
    return m["cesareas_br"] / m["partos_br"] if m["partos_br"] >= MINIMO_BAIXO_RISCO else None


def percentil(ordenadas: list[float], fracao: float) -> float:
    return ordenadas[int(len(ordenadas) * fracao)]


def maior_distancia_na_cidade(maternidades: list[dict]) -> dict:
    """Cidade com a maior diferença entre maternidades com volume suficiente."""
    por_cidade: dict[str, list[dict]] = {}
    for m in maternidades:
        if m["partos_br"] >= MINIMO_COMPARAR_CIDADE:
            por_cidade.setdefault(m["municipio"], []).append(m)
    candidatas = []
    for codigo, lista in por_cidade.items():
        if len(lista) < MINIMO_HOSPITAIS_CIDADE:
            continue
        taxas = [m["cesareas_br"] / m["partos_br"] for m in lista]
        candidatas.append((max(taxas) - min(taxas), codigo, lista[0]["cidade"], min(taxas), max(taxas), len(lista)))
    _, codigo, nome, menor, maior, quantas = max(candidatas)
    return {"municipio": int(codigo), "nome": nome, "menor": round(menor, 3), "maior": round(maior, 3), "maternidades": quantas}


def main(pasta: str, municipios: str, saida: str) -> None:
    maternidades = ler_maternidades(Path(pasta))
    coordenadas = ler_coordenadas(Path(municipios))
    sem_lugar = sorted({m["municipio"] for m in maternidades if m["municipio"] not in coordenadas})
    if sem_lugar:
        sys.exit(f"Municípios sem coordenada: {sem_lugar}")

    pontos = []
    for m in maternidades:
        t = taxa_br(m)
        lon, lat = coordenadas[m["municipio"]]
        pontos.append([int(m["municipio"]), round(lon, 2), round(lat, 2), -1 if t is None else round(t * 1000)])

    taxas = sorted(t for t in map(taxa_br, maternidades) if t is not None)
    historia = {
        "total": len(maternidades),
        "comTaxa": len(taxas),
        "partos": sum(m["partos"] for m in maternidades),
        "p10": round(percentil(taxas, 0.1), 3),
        "mediana": round(percentil(taxas, 0.5), 3),
        "p90": round(percentil(taxas, 0.9), 3),
        "larguraFaixa": LARGURA_FAIXA,
        "cidadeExemplo": maior_distancia_na_cidade(maternidades),
        "pontos": pontos,
    }
    Path(saida).write_text(json.dumps(historia, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    resumo = {k: v for k, v in historia.items() if k != "pontos"}
    print(json.dumps(resumo, ensure_ascii=False), Path(saida).stat().st_size, "bytes")


if __name__ == "__main__":
    main(*sys.argv[1:4])
