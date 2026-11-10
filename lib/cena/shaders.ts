/** Programas da placa de vídeo: movem e colorem os cubos sem custo por cubo no JavaScript. */

export const VERTICE = /* glsl */ `
  attribute vec3 aEsfera;
  attribute vec3 aMapa;
  attribute vec3 aHistograma;
  attribute float aTaxa;
  attribute float aSemente;
  attribute float aFoco;
  attribute vec3 aAneis;
  attribute vec3 aSatelite;
  attribute vec3 aGrade;
  attribute vec4 aAceso;

  uniform float uNivel;
  uniform float uAneis;
  uniform float uSatelite;
  uniform float uGrade;
  uniform float uTempo;
  uniform float uVida;
  uniform float uMapa;
  uniform float uTorre;
  uniform float uHistograma;
  uniform float uGiro;
  uniform float uFoco;
  uniform vec2 uMouse;
  uniform float uForca;
  uniform float uAspecto;

  varying vec3 vNormal;
  varying float vTaxa;
  varying float vAltura;
  varying float vFoco;
  varying float vProfundidade;
  varying float vPerto;
  varying float vAceso;
  varying float vForma;
  varying float vOnda;

  const vec3 CENTRO_DA_MAIOR = vec3(-9.0, -6.0, 0.0);
  const vec3 CENTRO_DA_MENOR = vec3(20.0, 13.0, 0.0);
  const float BALANCO_DA_GRADE = 0.32;
  const float ONDA_SOLTA = 0.02;
  const float ONDA_NO_CHAO = 0.3;
  const float ALTURA_MAXIMA = 15.0;
  const float RAIO_MOUSE = 0.34;
  const float EMPURRAO_MOUSE = 0.07;
  const float CRESCE_NO_MOUSE = 0.9;

  float onda(float valor) {
    float inicio = aSemente * 0.38;
    return smoothstep(inicio, inicio + 0.62, valor);
  }

  vec3 girar(vec3 p, float angulo) {
    float c = cos(angulo);
    float s = sin(angulo);
    return vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
  }

  void main() {
    float noMapa = onda(uMapa);
    float noHistograma = onda(uHistograma);
    float crescimento = onda(uTorre);

    float noNivel = onda(uNivel);
    float nosAneis = onda(uAneis);
    float noSatelite = onda(uSatelite);
    float naGrade = onda(uGrade);

    // Antes do mapa os cubos ficam soltos: esfera, anéis, duas esferas ou a grade de 100 pontos.
    vec3 solto = girar(aEsfera, uGiro);
    solto = mix(solto, girar(aAneis, uGiro), nosAneis);
    solto = mix(solto, girar(aSatelite, uGiro) + mix(CENTRO_DA_MAIOR, CENTRO_DA_MENOR, abs(aAceso.z)), noSatelite);
    solto = mix(solto, girar(aGrade, sin(uTempo * 0.5) * BALANCO_DA_GRADE), naGrade);
    // Parada, a cena não fica imóvel: uma onda sobe pelas formas soltas e outra atravessa o mapa e o gráfico.
    solto *= 1.0 + sin(uTempo * 1.3 + solto.y * 0.14) * ONDA_SOLTA * uVida;

    vec3 centro = mix(mix(solto, aMapa, noMapa), aHistograma, noHistograma);
    float noChao = mix(aMapa.x * 0.22 + aMapa.z * 0.17, aHistograma.x * 0.35, noHistograma);
    float ondaDoChao = sin(uTempo * 1.1 + noChao) * noMapa * uVida;
    centro.y += ondaDoChao * ONDA_NO_CHAO;

    float temTaxa = step(0.0, aTaxa);
    float alturaTorre = mix(0.14, 0.14 + max(aTaxa, 0.0) * ALTURA_MAXIMA, crescimento * temTaxa);
    float altura = mix(mix(0.44, alturaTorre, noMapa), 0.42, noHistograma);
    float largura = mix(mix(0.44, 0.27, noMapa), 0.42, noHistograma);
    float some = 1.0 - noHistograma * (1.0 - temTaxa);
    float destaque = 1.0 - aFoco * uFoco * 0.12;

    vec4 centroVista = viewMatrix * vec4(centro, 1.0);
    vec4 centroTela = projectionMatrix * centroVista;
    vec2 distancia = (centroTela.xy / centroTela.w - uMouse) * vec2(uAspecto, 1.0);
    float tamanho = length(distancia);
    float perto = smoothstep(RAIO_MOUSE, 0.0, tamanho) * uForca;
    vec2 direcao = tamanho > 0.001 ? distancia / tamanho : vec2(0.0);

    float incha = 1.0 + perto * CRESCE_NO_MOUSE;
    vec3 local = vec3(position.x * largura * destaque * incha, position.y * altura * mix(incha, 1.0, noMapa), position.z * largura * destaque * incha) * some;
    vec4 mundo = viewMatrix * vec4(centro + local, 1.0);
    mundo.xy += direcao * perto * EMPURRAO_MOUSE * -centroVista.z;

    vNormal = normal;
    vTaxa = aTaxa;
    vAltura = position.y;
    vFoco = aFoco;
    vProfundidade = -mundo.z;
    vPerto = perto;
    vOnda = ondaDoChao;
    vAceso = clamp(aAceso.x * noNivel + aAceso.y * nosAneis + aAceso.z * noSatelite + aAceso.w * naGrade, -1.0, 1.0);
    vForma = max(max(noNivel, nosAneis), max(noSatelite, naGrade));
    gl_Position = projectionMatrix * mundo;
  }
`;

export const FRAGMENTO = /* glsl */ `
  precision highp float;

  uniform float uCor;
  uniform float uExtremos;
  uniform float uFoco;
  uniform float uPerto;
  uniform float uLonge;
  uniform float uSombra;
  uniform float uLarguraTela;

  varying vec3 vNormal;
  varying float vTaxa;
  varying float vAltura;
  varying float vFoco;
  varying float vProfundidade;
  varying float vPerto;
  varying float vAceso;
  varying float vForma;
  varying float vOnda;

  const float APAGA_O_RESTO = 0.62;
  const float BRILHO_DA_ONDA = 0.24;
  const float BRILHO_DO_ACESO = 0.18;
  const vec3 NEUTRO = vec3(0.86, 0.88, 0.90);
  const vec3 BAIXO = vec3(0.14, 0.82, 0.72);
  const vec3 MEIO = vec3(0.95, 0.88, 0.70);
  const vec3 ALTO = vec3(1.00, 0.33, 0.20);
  const vec3 SEM_DADO = vec3(0.32, 0.36, 0.40);
  const vec3 FUNDO = vec3(0.027, 0.039, 0.051);
  const vec3 LUZ = vec3(0.38, 0.86, 0.34);

  vec3 corDaTaxa(float t) {
    return t < 0.5 ? mix(BAIXO, MEIO, t * 2.0) : mix(MEIO, ALTO, (t - 0.5) * 2.0);
  }

  void main() {
    vec3 dado = vTaxa < 0.0 ? SEM_DADO : corDaTaxa(vTaxa);
    float aceso = abs(vAceso);
    vec3 cor = mix(mix(NEUTRO, dado, uCor), vAceso > 0.0 ? ALTO : BAIXO, aceso);

    float luz = 0.42 + 0.58 * max(dot(normalize(vNormal), normalize(LUZ)), 0.0);
    float topo = pow(vAltura, 3.0) * 0.45 * uCor;
    vec3 acesa = cor * (luz + topo + aceso * BRILHO_DO_ACESO);
    acesa *= 1.0 - vForma * (1.0 - aceso) * APAGA_O_RESTO;
    acesa *= 1.0 + vOnda * BRILHO_DA_ONDA;

    float nosExtremos = step(vTaxa, 0.2) + step(0.93, vTaxa);
    float apagar = uExtremos * (1.0 - clamp(nosExtremos, 0.0, 1.0)) * 0.88;
    acesa *= 1.0 - apagar;

    acesa *= 1.0 - uFoco * (1.0 - vFoco) * 0.86;
    acesa += uFoco * vFoco * cor * 0.12;
    acesa += cor * vPerto * 0.75;

    float neblina = smoothstep(uPerto, uLonge, vProfundidade);
    vec3 final = mix(acesa, FUNDO, neblina * (1.0 - uFoco * vFoco));

    float sombraEsquerda = smoothstep(0.0, uLarguraTela * 0.46, gl_FragCoord.x);
    gl_FragColor = vec4(mix(final, FUNDO, uSombra * (1.0 - sombraEsquerda) * 0.82), 1.0);
  }
`;
