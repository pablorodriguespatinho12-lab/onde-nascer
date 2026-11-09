import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onde Nascer",
  description: "Taxa de cesárea de cada maternidade do Brasil, com dados abertos do SUS.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,700&family=Public+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@500&display=swap"
        />
      </head>
      <body>
        <div className="pagina">
          <nav className="topo">
            <Link href="/" className="marca">Onde Nascer</Link>
            <Link href="/como-calculamos/">Como calculamos</Link>
          </nav>
          {children}
          <footer className="rodape">
            <p>
              Projeto independente, feito com dados abertos do Ministério da Saúde (SINASC e CNES). Não é um
              site do governo e não substitui a conversa com quem acompanha a sua gestação.
            </p>
            <p>Feito por Pablo · código aberto no GitHub</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
