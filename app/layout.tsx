import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import Link from "next/link";
import BotaoDeMovimento from "@/components/botao-de-movimento";
import "./globals.css";

const titulo = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-titulo", display: "swap" });
const texto = DM_Sans({ subsets: ["latin"], variable: "--font-texto", display: "swap" });

export const metadata: Metadata = {
  title: "Onde Nascer",
  description: "Taxa de cesárea de cada maternidade do Brasil, com dados abertos do SUS.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#070a0d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${titulo.variable} ${texto.variable}`}>
      <body>
        <nav className="topo">
          <Link href="/" className="marca">Onde Nascer</Link>
          <Link href="/como-calculamos/">Como calculamos</Link>
        </nav>
        {children}
        <BotaoDeMovimento />
        <footer className="rodape">
          <p>
            Projeto independente, feito com dados abertos do Ministério da Saúde (SINASC e CNES). Não é um site do
            governo e não substitui a conversa com quem acompanha a sua gestação.
          </p>
          <p>Feito por Pablo. Código aberto no GitHub.</p>
        </footer>
      </body>
    </html>
  );
}
