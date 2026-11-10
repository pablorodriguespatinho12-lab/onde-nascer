/**
 * Converte as ilustrações originais (JPG ou PNG) em WebP leve para o site.
 * Uso: node dados/otimizar_imagens.mjs <pasta-das-originais> public/imagens
 */
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const LARGURA = 900;
const ALTURA = 1200;
const QUALIDADE = 78;
const EXTENSOES = new Set([".jpg", ".jpeg", ".png"]);

const [entrada, saida] = process.argv.slice(2);
if (!entrada || !saida) {
  console.error("Uso: node dados/otimizar_imagens.mjs <pasta-das-originais> <pasta-de-saída>");
  process.exit(1);
}

await mkdir(saida, { recursive: true });
const arquivos = (await readdir(entrada)).filter((nome) => EXTENSOES.has(path.extname(nome).toLowerCase())).sort();
if (arquivos.length === 0) {
  console.error(`Nenhuma imagem em ${entrada}`);
  process.exit(1);
}

for (const nome of arquivos) {
  const destino = path.join(saida, `${path.parse(nome).name}.webp`);
  await sharp(path.join(entrada, nome)).resize(LARGURA, ALTURA, { fit: "cover" }).webp({ quality: QUALIDADE }).toFile(destino);
  const { size } = await stat(destino);
  console.log(`${destino} ${Math.round(size / 1024)} KB`);
}
