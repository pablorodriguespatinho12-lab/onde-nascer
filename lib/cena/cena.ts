/** A cena 3D: um único desenho de 2.712 cubos, controlado pela posição da rolagem. */
import {
  BoxGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from "three";
import { type Historia, montarLayouts, posicaoNoMapa } from "./layouts";
import { ALTURA_ALVO_CIDADE, CENA_CIDADE, OFFSET_CIDADE, type Quadro, montarQuadros, quadroEm } from "./quadros";
import { FRAGMENTO, VERTICE } from "./shaders";

export type Cena = {
  ajustar: () => void;
  desenhar: (passoAlvo: number, tempo: number) => void;
  focar: (municipio: number | null) => void;
  apontar: (x: number, y: number) => void;
  destruir: () => void;
};

const CAMPO_DE_VISAO = 34;
const PIXELS_MAXIMO = 2;
const LARGURA_REFERENCIA = 1.3;
const DESLOCAMENTO_LATERAL = 0.17;
const DESLOCAMENTO_VERTICAL = 0.2;
const VELOCIDADE_ROLAGEM = 5;
const VELOCIDADE_CIDADE = 3;
const PARALAXE = 1.6;
const TELA_LARGA = 900;
const NEBLINA_INICIO = 1;
const NEBLINA_FIM = 2.4;

function amortecer(atual: number, alvo: number, velocidade: number, dt: number): number {
  return alvo + (atual - alvo) * Math.exp(-velocidade * dt);
}

function montarGeometria(historia: Historia): { geometria: InstancedBufferGeometry; alturaHistograma: number; foco: InstancedBufferAttribute } {
  const caixa = new BoxGeometry(1, 1, 1);
  caixa.translate(0, 0.5, 0);
  const geometria = new InstancedBufferGeometry();
  geometria.setIndex(caixa.getIndex());
  geometria.setAttribute("position", caixa.getAttribute("position"));
  geometria.setAttribute("normal", caixa.getAttribute("normal"));
  geometria.instanceCount = historia.pontos.length;

  const layouts = montarLayouts(historia);
  geometria.setAttribute("aEsfera", new InstancedBufferAttribute(layouts.esfera, 3));
  geometria.setAttribute("aMapa", new InstancedBufferAttribute(layouts.mapa, 3));
  geometria.setAttribute("aHistograma", new InstancedBufferAttribute(layouts.histograma, 3));
  geometria.setAttribute("aTaxa", new InstancedBufferAttribute(layouts.taxa, 1));
  geometria.setAttribute("aSemente", new InstancedBufferAttribute(layouts.semente, 1));
  const foco = new InstancedBufferAttribute(new Float32Array(historia.pontos.length), 1);
  geometria.setAttribute("aFoco", foco);
  return { geometria, alturaHistograma: layouts.alturaHistograma, foco };
}

function montarMaterial(): ShaderMaterial {
  const uniformes = ["uMapa", "uTorre", "uHistograma", "uTempo", "uFoco", "uCor", "uExtremos"];
  return new ShaderMaterial({
    vertexShader: VERTICE,
    fragmentShader: FRAGMENTO,
    uniforms: { ...Object.fromEntries(uniformes.map((u) => [u, { value: 0 }])), uPerto: { value: 40 }, uLonge: { value: 190 } },
  });
}

/** Junta o roteiro com a cidade escolhida pela pessoa na busca. */
function comCidade(q: Quadro, passo: number, mistura: number, cidade: Vector3): Quadro {
  const t = mistura * Math.min(1, Math.max(0, passo - CENA_CIDADE));
  if (t === 0) return q;
  const camera = [cidade.x + OFFSET_CIDADE[0], OFFSET_CIDADE[1], cidade.z + OFFSET_CIDADE[2]];
  const alvo = [cidade.x, ALTURA_ALVO_CIDADE, cidade.z];
  return {
    ...q,
    foco: Math.max(q.foco, t),
    torre: Math.max(q.torre, t),
    ajusteCelular: q.ajusteCelular + (0.35 - q.ajusteCelular) * t,
    camera: [0, 1, 2].map((i) => q.camera[i] + (camera[i] - q.camera[i]) * t) as unknown as Quadro["camera"],
    alvo: [0, 1, 2].map((i) => q.alvo[i] + (alvo[i] - q.alvo[i]) * t) as unknown as Quadro["alvo"],
  };
}

export function criarCena(canvas: HTMLCanvasElement, historia: Historia, semMovimento: boolean): Cena {
  const renderizador = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  const cena = new Scene();
  const camera = new PerspectiveCamera(CAMPO_DE_VISAO, 1, 1, 400);
  const { geometria, alturaHistograma, foco } = montarGeometria(historia);
  const material = montarMaterial();
  const malha = new Mesh(geometria, material);
  malha.frustumCulled = false;
  cena.add(malha);

  const exemplo = historia.pontos.find((p) => p[0] === historia.cidadeExemplo.municipio);
  const quadros = montarQuadros(alturaHistograma, exemplo ? posicaoNoMapa(exemplo[1], exemplo[2]) : [0, 0]);
  const posicaoDe = new Map(historia.pontos.map((p) => [p[0], posicaoNoMapa(p[1], p[2])]));

  const u = material.uniforms;
  const posicaoCidade = new Vector3();
  const alvoCamera = new Vector3();
  let passo = 0;
  let ultimoTempo = 0;
  let municipioEscolhido: number | null = null;
  let municipioAceso: number | null = null;
  let misturaCidade = 0;
  let mouseX = 0;
  let mouseY = 0;
  let largura = 1;
  let altura = 1;

  function acender(municipio: number | null): void {
    if (municipio === municipioAceso) return;
    municipioAceso = municipio;
    historia.pontos.forEach((p, i) => foco.setX(i, p[0] === municipio ? 1 : 0));
    foco.needsUpdate = true;
  }

  function ajustar(): void {
    largura = canvas.clientWidth || 1;
    altura = canvas.clientHeight || 1;
    renderizador.setPixelRatio(Math.min(window.devicePixelRatio || 1, PIXELS_MAXIMO));
    renderizador.setSize(largura, altura, false);
    camera.aspect = largura / altura;
  }

  function posicionarCamera(q: Quadro): void {
    const afastar = Math.pow(Math.max(1, LARGURA_REFERENCIA / camera.aspect), q.ajusteCelular);
    camera.position.set(
      q.alvo[0] + (q.camera[0] - q.alvo[0]) * afastar + mouseX * PARALAXE,
      q.alvo[1] + (q.camera[1] - q.alvo[1]) * afastar + mouseY * PARALAXE,
      q.alvo[2] + (q.camera[2] - q.alvo[2]) * afastar,
    );
    camera.lookAt(alvoCamera.set(q.alvo[0], q.alvo[1], q.alvo[2]));
    const distancia = camera.position.distanceTo(alvoCamera);
    u.uPerto.value = distancia * NEBLINA_INICIO;
    u.uLonge.value = distancia * NEBLINA_FIM;
    const larga = largura >= TELA_LARGA;
    const offsetX = larga ? -largura * DESLOCAMENTO_LATERAL * q.deslocamento : 0;
    const offsetY = larga ? 0 : altura * DESLOCAMENTO_VERTICAL * q.deslocamento;
    camera.setViewOffset(largura, altura, offsetX, offsetY, largura, altura);
  }

  function desenhar(passoAlvo: number, tempo: number): void {
    const dt = Math.min(0.1, tempo - ultimoTempo);
    ultimoTempo = tempo;
    passo = semMovimento ? passoAlvo : amortecer(passo, passoAlvo, VELOCIDADE_ROLAGEM, dt);
    misturaCidade = semMovimento ? Number(municipioEscolhido !== null) : amortecer(misturaCidade, Number(municipioEscolhido !== null), VELOCIDADE_CIDADE, dt);

    const naBusca = passo > CENA_CIDADE + 0.5;
    acender(naBusca ? municipioEscolhido : historia.cidadeExemplo.municipio);
    const destino = municipioEscolhido === null ? undefined : posicaoDe.get(municipioEscolhido);
    if (destino) {
      posicaoCidade.x = amortecer(posicaoCidade.x, destino[0], VELOCIDADE_CIDADE, dt);
      posicaoCidade.z = amortecer(posicaoCidade.z, destino[1], VELOCIDADE_CIDADE, dt);
    }

    const q = comCidade(quadroEm(quadros, passo), passo, misturaCidade, posicaoCidade);
    u.uMapa.value = q.mapa;
    u.uTorre.value = q.torre;
    u.uHistograma.value = q.histograma;
    u.uCor.value = q.cor;
    u.uExtremos.value = q.extremos;
    u.uFoco.value = q.foco;
    u.uTempo.value = semMovimento ? 0 : tempo;
    posicionarCamera(q);
    renderizador.render(cena, camera);
  }

  function destruir(): void {
    geometria.dispose();
    material.dispose();
    renderizador.dispose();
  }

  ajustar();
  return {
    ajustar,
    desenhar,
    destruir,
    focar: (municipio) => { municipioEscolhido = municipio; },
    apontar: (x, y) => { mouseX = x; mouseY = y; },
  };
}
