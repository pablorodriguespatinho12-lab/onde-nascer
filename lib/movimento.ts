/**
 * Liga e desliga todo o movimento do site.
 * O padrão é ligado, mesmo quando o sistema pede "reduzir movimento": muita gente tem as animações do Windows
 * desligadas só por desempenho e via o site parado. Quem prefere sem movimento usa o botão "Pausar animação",
 * e a escolha fica guardada no navegador.
 */

const CHAVE = "onde-nascer:movimento";
const PARADO = "parado";
export const EVENTO_MOVIMENTO = "onde-nascer:movimento";

export function estaParado(): boolean {
  try {
    return window.localStorage.getItem(CHAVE) === PARADO;
  } catch {
    // Navegação privada ou armazenamento bloqueado: fica no padrão, com movimento.
    return false;
  }
}

/** O CSS lê `data-movimento` no <html>; a cena 3D, o cursor e os contadores ouvem o evento. */
export function mostrarNoDocumento(parado: boolean): void {
  if (parado) document.documentElement.dataset.movimento = PARADO;
  else delete document.documentElement.dataset.movimento;
}

export function definirParado(parado: boolean): void {
  try {
    if (parado) window.localStorage.setItem(CHAVE, PARADO);
    else window.localStorage.removeItem(CHAVE);
  } catch {
    // Sem armazenamento a escolha vale só até recarregar a página.
  }
  mostrarNoDocumento(parado);
  window.dispatchEvent(new CustomEvent(EVENTO_MOVIMENTO, { detail: { parado } }));
}
