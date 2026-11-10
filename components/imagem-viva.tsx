/** Ilustração que inclina e ganha profundidade conforme o cursor (as variáveis --px e --py vêm de cursor-vivo.tsx). */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const LARGURA = 900;
const ALTURA = 1200;

type Props = {
  arquivo: string;
  descricao: string;
  /** A imagem da abertura carrega primeiro; as outras só quando chegam perto da tela. */
  prioridade?: boolean;
  className?: string;
};

export default function ImagemViva({ arquivo, descricao, prioridade = false, className = "" }: Props) {
  return (
    <figure className={`imagem-viva ${className}`.trim()} data-cursor>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${BASE}/imagens/${arquivo}.webp`}
        alt={descricao}
        width={LARGURA}
        height={ALTURA}
        loading={prioridade ? "eager" : "lazy"}
        fetchPriority={prioridade ? "high" : "auto"}
        decoding="async"
      />
    </figure>
  );
}
