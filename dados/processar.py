"""Conta partos e cesáreas por maternidade a partir do SINASC (nascidos vivos, SUS).

Uso: python3 -I processar.py <SINASC_ANO_csv.zip> <pasta-de-saída>

Saída:
  <saída>/<UF>.json     maternidades da UF com 50+ partos no ano
  <saída>/resumo.json   totais do Brasil e por UF (para conferir)

Regras (ver README):
- Só nascimentos em hospital (LOCNASC = 1) com CODESTAB preenchido.
- PARTO: 1 = vaginal, 2 = cesárea; 9/vazio fica fora da taxa.
- "Baixo risco" = grupos de Robson 1 a 4 (gestação única, cabeça para baixo, a termo, sem cesárea anterior).
- Um nascimento é uma linha: gêmeos contam 2 vezes (o SINASC é por nascido vivo).
"""
import csv
import io
import json
import sys
import zipfile
from collections import defaultdict
from pathlib import Path

MINIMO_PARTOS = 50
BAIXO_RISCO = {"01", "02", "03", "04"}  # no arquivo vem com zero à esquerda
HOSPITAL = "1"
UF_POR_CODIGO = {
    "11": "RO", "12": "AC", "13": "AM", "14": "RR", "15": "PA", "16": "AP", "17": "TO",
    "21": "MA", "22": "PI", "23": "CE", "24": "RN", "25": "PB", "26": "PE", "27": "AL", "28": "SE", "29": "BA",
    "31": "MG", "32": "ES", "33": "RJ", "35": "SP", "41": "PR", "42": "SC", "43": "RS",
    "50": "MS", "51": "MT", "52": "GO", "53": "DF",
}


def contador() -> dict:
    return {"partos": 0, "cesareas": 0, "partos_br": 0, "cesareas_br": 0}


def somar(c: dict, parto: str, robson: str) -> None:
    if parto not in ("1", "2"):
        return
    c["partos"] += 1
    c["cesareas"] += parto == "2"
    if robson in BAIXO_RISCO:
        c["partos_br"] += 1
        c["cesareas_br"] += parto == "2"


def ler(zip_path: Path):
    with zipfile.ZipFile(zip_path) as z:
        nome = z.namelist()[0]
        with z.open(nome) as bruto:
            texto = io.TextIOWrapper(bruto, encoding="latin-1", newline="")
            yield from csv.DictReader(texto, delimiter=";")


def main() -> None:
    zip_path, saida = Path(sys.argv[1]), Path(sys.argv[2])
    saida.mkdir(parents=True, exist_ok=True)
    por_hosp: dict = defaultdict(contador)
    mun_do_hosp: dict = {}
    por_uf: dict = defaultdict(contador)
    brasil = contador()
    linhas = descartadas = 0
    for r in ler(zip_path):
        linhas += 1
        cnes = (r.get("CODESTAB") or "").strip()
        mun = (r.get("CODMUNNASC") or "").strip()
        if r.get("LOCNASC") != HOSPITAL or not cnes or mun[:2] not in UF_POR_CODIGO:
            descartadas += 1
            continue
        parto, robson = (r.get("PARTO") or "").strip(), (r.get("TPROBSON") or "").strip()
        somar(por_hosp[cnes], parto, robson)
        somar(por_uf[UF_POR_CODIGO[mun[:2]]], parto, robson)
        somar(brasil, parto, robson)
        mun_do_hosp.setdefault(cnes, mun)

    por_estado: dict = defaultdict(list)
    for cnes, c in por_hosp.items():
        if c["partos"] < MINIMO_PARTOS:
            continue
        mun = mun_do_hosp[cnes]
        por_estado[UF_POR_CODIGO[mun[:2]]].append({"cnes": cnes, "municipio": mun, **c})
    for uf, lista in por_estado.items():
        lista.sort(key=lambda h: (h["municipio"], h["cnes"]))
        (saida / f"{uf}.json").write_text(json.dumps(lista, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    resumo = {"linhas": linhas, "descartadas": descartadas, "brasil": brasil, "por_uf": por_uf,
              "maternidades": sum(len(v) for v in por_estado.values())}
    (saida / "resumo.json").write_text(json.dumps(resumo, ensure_ascii=False, indent=1), encoding="utf-8")
    taxa = brasil["cesareas"] / brasil["partos"]
    taxa_br = brasil["cesareas_br"] / brasil["partos_br"]
    print(f"linhas {linhas:,} | descartadas {descartadas:,} | maternidades 50+: {resumo['maternidades']}")
    print(f"Brasil: cesárea {taxa:.1%} no total, {taxa_br:.1%} no baixo risco (Robson 1-4)")


if __name__ == "__main__":
    main()
