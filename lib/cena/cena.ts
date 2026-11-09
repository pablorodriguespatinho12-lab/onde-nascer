/** A cena 3D: um único desenho de 2.712 cubos. Só desenha de novo quando algo se move. */
import {
  BoxGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { type Historia, montarLayouts, posicaoNoMapa } from "./layouts";
import { criarQualidade } from "./qualidade";
import { ALTURA_ALVO_CIDADE, CENA_CIDADE, OFFSET_CIDADE, type Quadro, montarQuadros, quadroEm } from "./quadros";
import { FRAGMENTO, VERTICE } from "./shaders";

export type Cena = {
  ajustar: () => void;
  desenhar: (passoAlvo: number, tempo: number) => void;
  focar: (municipio: number | null) => void;
  apontar: (x: number, y: number) => void;
  destruir: () => void;
};

const COR_FUNDO = 0x070a0d;
const CAMPO_DE_VISAO = 34;
const ESCALA_MAXIMA = 1.5;
const LARGURA_REFERENCIA = 1.3;
const DESLOCAMENTO_LATERAL = 0.17;
const DESLOCAMENTO_VERTICAL = 0.2;
const VELOCIDADE_ROLAGEM = 9;
const VELOCIDADE_CIDADE = 3;
const VELOCIDADE_MOUSE = 8;
const VELOCIDADE_FORCA = 7;
const VELOCIDADE_GIRO = 5;
const PARALAXE = 2.4;
const GIRO_POR_PASSO = 2.2;
const GIRO_POR_MOUSE = 1.1;
const GIRO_DE_ENTRADA = 1.4;
const MOUSE_PARADO_S = 0.16;
const TELA_LARGA = 900;
const NEBLINA_INICIO = 1;
const NEBLINA_FIM = 2.4;
const QUASE_PARADO = 0.0004;

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
  const numeros = ["uMapa", "uTorre", "uHistograma", "uGiro", "uFoco", "uCor", "uExtremos", "uForca", "uAspecto", "uPerto", "uLonge", "uSombra", "uLarguraTela"];
  return new ShaderMaterial({
    vertexShader: VERTICE,
    fragmentShader: FRAGMENTO,
    uniforms: { ...Object.fromEntries(numeros.map((n) => [n, { value: 0 }])), uMouse: { value: new Vector2() } },
  });
}

function misturar(a: Quadro["camera"], b: Quadro["camera"], t: number): Quadro["camera"] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** Junta o roteiro com a cidade escolhida pela pessoa na busca. */
function comCidade(q: Quadro, passo: number, mistura: number, cidade: Vector3): Quadro {
  const t = mistura * Math.min(1, Math.max(0, passo - CENA_CIDADE));
  if (t === 0) return q;
  return {
    ...q,
    foco: Math.max(q.foco, t),
    torre: Math.max(q.torre, t),
    ajusteCelular: q.ajusteCelular + (0.35 - q.ajusteCelular) * t,
    camera: misturar(q.camera, [cidade.x + OFFSET_CIDADE[0], OFFSET_CIDADE[1], cidade.z + OFFSET_CIDADE[2]], t),
    alvo: misturar(q.alvo, [cidade.x, ALTURA_ALVO_CIDADE, cidade.z], t),
  };
}

export function criarCena(canvas: HTMLCanvasElement, historia: Historia, semMovimento: boolean): Cena {
  const densidade = window.devicePixelRatio || 1;
  const renderizador = new WebGLRenderer({ canvas, antialias: densidade < ESCALA_MAXIMA, alpha: false, powerPreference: "high-performance" });
  renderizador.setClearColor(COR_FUNDO, 1);
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
  let escala = Math.min(densidade, ESCALA_MAXIMA);
  const qualidade = criarQualidade(escala);
  let passo = 0;
  let giro = semMovimento ? 0 : -GIRO_DE_ENTRADA;
  let giroMouse = 0;
  let ultimoTempo = 0;
  let ultimoDesenho = 0;
  let municipioEscolhido: number | null = null;
  let municipioAceso: number | null = null;
  let misturaCidade = 0;
  let mouseAlvoX = 0;
  let mouseAlvoY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let forca = 0;
  let movimentoRecente = false;
  let ultimoMovimento = -1;
  let largura = 1;
  let altura = 1;
  let precisaDesenhar = true;

  function acender(municipio: number | null): void {
    if (municipio === municipioAceso) return;
    municipioAceso = municipio;
    historia.pontos.forEach((p, i) => foco.setX(i, p[0] === municipio ? 1 : 0));
    foco.needsUpdate = true;
    precisaDesenhar = true;
  }

  function aplicarTamanho(): void {
    renderizador.setPixelRatio(escala);
    renderizador.setSize(largura, altura, false);
    u.uLarguraTela.value = renderizador.domElement.width;
  }

  function ajustar(): void {
    const novaLargura = canvas.clientWidth || 1;
    const novaAltura = canvas.clientHeight || 1;
    if (novaLargura === largura && novaAltura === altura) return;
    largura = novaLargura;
    altura = novaAltura;
    camera.aspect = largura / altura;
    u.uAspecto.value = camera.aspect;
    u.uSombra.value = largura >= TELA_LARGA ? 1 : 0;
    aplicarTamanho();
    precisaDesenhar = true;
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

  function aplicarQuadro(q: Quadro): void {
    u.uMapa.value = q.mapa;
    u.uTorre.value = q.torre;
    u.uHistograma.value = q.histograma;
    u.uCor.value = q.cor;
    u.uExtremos.value = q.extremos;
    u.uFoco.value = q.foco;
    u.uGiro.value = giro;
    u.uForca.value = forca;
    (u.uMouse.value as Vector2).set(mouseAlvoX, mouseAlvoY);
    posicionarCamera(q);
  }

  /** Avança as animações; devolve quanto tudo mudou neste quadro. */
  function avancar(passoAlvo: number, tempo: number, dt: number): number {
    if (movimentoRecente) {
      ultimoMovimento = tempo;
      movimentoRecente = false;
    }
    const antes = [passo, giro, misturaCidade, forca, mouseX, mouseY];
    const escolheu = Number(municipioEscolhido !== null);
    passo = semMovimento ? passoAlvo : amortecer(passo, passoAlvo, VELOCIDADE_ROLAGEM, dt);
    misturaCidade = semMovimento ? escolheu : amortecer(misturaCidade, escolheu, VELOCIDADE_CIDADE, dt);
    giro = semMovimento ? passo * GIRO_POR_PASSO : amortecer(giro, passo * GIRO_POR_PASSO + giroMouse, VELOCIDADE_GIRO, dt);
    forca = amortecer(forca, tempo - ultimoMovimento < MOUSE_PARADO_S ? 1 : 0, VELOCIDADE_FORCA, dt);
    mouseX = amortecer(mouseX, mouseAlvoX, VELOCIDADE_MOUSE, dt);
    mouseY = amortecer(mouseY, mouseAlvoY, VELOCIDADE_MOUSE, dt);
    const depois = [passo, giro, misturaCidade, forca, mouseX, mouseY];
    return depois.reduce((soma, valor, i) => soma + Math.abs(valor - antes[i]), 0);
  }

  function medirQualidade(tempo: number): void {
    const novaEscala = qualidade.registrar((tempo - ultimoDesenho) * 1000);
    ultimoDesenho = tempo;
    if (novaEscala === null) return;
    escala = novaEscala;
    aplicarTamanho();
  }

  function desenhar(passoAlvo: number, tempo: number): void {
    const dt = Math.min(0.1, tempo - ultimoTempo);
    ultimoTempo = tempo;
    const mudanca = avancar(passoAlvo, tempo, dt);

    acender(passo > CENA_CIDADE + 0.5 ? municipioEscolhido : historia.cidadeExemplo.municipio);
    const destino = municipioEscolhido === null ? undefined : posicaoDe.get(municipioEscolhido);
    let moveuCidade = 0;
    if (destino) {
      const x = amortecer(posicaoCidade.x, destino[0], VELOCIDADE_CIDADE, dt);
      const z = amortecer(posicaoCidade.z, destino[1], VELOCIDADE_CIDADE, dt);
      moveuCidade = Math.abs(x - posicaoCidade.x) + Math.abs(z - posicaoCidade.z);
      posicaoCidade.set(x, 0, z);
    }

    if (!precisaDesenhar && mudanca + moveuCidade < QUASE_PARADO) {
      ultimoDesenho = 0;
      return;
    }
    precisaDesenhar = false;
    if (ultimoDesenho > 0) medirQualidade(tempo);
    else ultimoDesenho = tempo;
    aplicarQuadro(comCidade(quadroEm(quadros, passo), passo, misturaCidade, posicaoCidade));
    renderizador.render(cena, camera);
  }

  function apontar(x: number, y: number): void {
    giroMouse += (x - mouseAlvoX) * GIRO_POR_MOUSE;
    mouseAlvoX = x;
    mouseAlvoY = y;
    movimentoRecente = true;
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
    apontar,
    destruir,
    focar: (municipio) => { municipioEscolhido = municipio; precisaDesenhar = true; },
  };
}
