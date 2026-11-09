# Onde Nascer

Quanto cada maternidade do Brasil faz de cesárea, com dados abertos do SUS.
Projeto independente: não é site do governo e não é conselho médico.

## Números (SINASC 2024)
- 2.389.325 nascimentos lidos; 2.712 maternidades com 50+ partos, em 1.798 cidades.
- Cesárea no Brasil: 61,3% no total; 47,8% em gestação de baixo risco (Robson 1 a 4).
- Mediana por maternidade: 70,8%. Em baixo risco, 10% das maternidades ficam abaixo de 20% e 10% acima de 93%.
- Conferência: 3 maternidades (SP, BA, RS) recontadas direto no CSV com outro código: as 3 batem.

## Como funciona
1. `dados/processar.py` lê o zip do SINASC em fluxo e conta partos e cesáreas por hospital.
2. `dados/enriquecer.py` busca nome e endereço no CNES e o nome da cidade no IBGE (com cache).
3. O site (Next.js, exportação estática) carrega só o JSON do estado escolhido (~25 KB em média).

Custo para rodar: R$ 0 (site estático, sem servidor nem banco).

## Rodar
```
curl -o dados/bruto/SINASC_2024_csv.zip https://s3.sa-east-1.amazonaws.com/ckan.saude.gov.br/SINASC/csv/SINASC_2024_csv.zip
npm install
npm run dados
npm run build        # gera out/
```
Para GitHub Pages: `BASE_PATH=/onde-nascer npm run build`.

## Fontes
- SINASC: https://opendatasus.saude.gov.br (Sistema de Informações sobre Nascidos Vivos)
- CNES: https://apidadosabertos.saude.gov.br
- IBGE municípios: https://servicodados.ibge.gov.br/api/docs/localidades
