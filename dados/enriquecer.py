"""Acrescenta nome e endereço (CNES) e nome da cidade (IBGE) aos JSON de cada UF.

Uso: python3 -I enriquecer.py <pasta public/dados> <arquivo-cache.json>

O cache guarda cada hospital já buscado: se a rede cair, rodar de novo continua de onde parou.
APIs públicas: apidadosabertos.saude.gov.br (CNES) e servicodados.ibge.gov.br (municípios).
"""
import gzip
import json
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

URL_CNES = "https://apidadosabertos.saude.gov.br/cnes/estabelecimentos/{}"
URL_IBGE = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado"
TENTATIVAS = 3
PARALELO = 4
CABECALHO = {"User-Agent": "onde-nascer/1.0 (projeto independente de dados abertos)"}


def baixar_json(url: str):
    for tentativa in range(TENTATIVAS):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=CABECALHO), timeout=30) as r:
                corpo = r.read()
            if corpo[:2] == b"\x1f\x8b":  # o IBGE responde compactado mesmo sem pedir
                corpo = gzip.decompress(corpo)
            return json.loads(corpo)
        except Exception as erro:  # rede instável: tenta de novo, depois desiste deste item
            if tentativa == TENTATIVAS - 1:
                print(f"falhou {url}: {erro}", file=sys.stderr)
                return None
            time.sleep(2 * (tentativa + 1))


def titulo(texto: str) -> str:
    pequenas = {"de", "da", "do", "das", "dos", "e", "na", "no", "nas", "nos", "em", "a", "o"}
    palavras = (texto or "").strip().lower().split()
    return " ".join(p if p in pequenas and i else p.capitalize() for i, p in enumerate(palavras))


def buscar_hospital(cnes: str) -> dict:
    d = baixar_json(URL_CNES.format(cnes)) or {}
    rua = titulo(d.get("endereco_estabelecimento", ""))
    numero = (d.get("numero_estabelecimento") or "").strip()
    endereco = ", ".join(x for x in (rua, numero) if x)
    return {"nome": titulo(d.get("nome_fantasia", "")) or f"Estabelecimento {cnes}",
            "endereco": endereco, "bairro": titulo(d.get("bairro_estabelecimento", ""))}


def main() -> None:
    pasta, cache_path = Path(sys.argv[1]), Path(sys.argv[2])
    cache = json.loads(cache_path.read_text()) if cache_path.exists() else {}
    arquivos = sorted(p for p in pasta.glob("*.json") if len(p.stem) == 2)
    todos = {h["cnes"] for p in arquivos for h in json.loads(p.read_text())}
    faltam = sorted(todos - cache.keys())
    print(f"hospitais: {len(todos)} | no cache: {len(todos) - len(faltam)} | buscar: {len(faltam)}")
    with ThreadPoolExecutor(PARALELO) as ex:
        for i, (cnes, info) in enumerate(zip(faltam, ex.map(buscar_hospital, faltam)), 1):
            cache[cnes] = info
            if i % 200 == 0:
                cache_path.write_text(json.dumps(cache, ensure_ascii=False))
                print(f"  {i}/{len(faltam)}")
    cache_path.write_text(json.dumps(cache, ensure_ascii=False))

    cidades = {str(m["municipio-id"])[:6]: m["municipio-nome"] for m in baixar_json(URL_IBGE) or []}
    sem_nome = 0
    for p in arquivos:
        lista = json.loads(p.read_text())
        novos = []
        for h in lista:
            bruto = cache.get(h["cnes"], {})
            info = {k: titulo(v) if k in ("nome", "endereco", "bairro") else v for k, v in bruto.items()}
            sem_nome += info.get("nome", "").startswith("Estabelecimento") or not info
            novos.append({**h, **info, "cidade": cidades.get(h["municipio"], h["municipio"])})
        p.write_text(json.dumps(novos, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"cidades IBGE: {len(cidades)} | hospitais sem nome: {sem_nome}")


if __name__ == "__main__":
    main()
