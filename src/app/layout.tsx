import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import AuthGate from "../components/AuthGate";
import Sidebar from "../components/Sidebar";
import { ToastProvider } from "../components/ToastContainer";
import "./globals.css";

/**
 * Fontes da marca Scalpel: Manrope nos títulos, Inter na UI.
 *
 * `next/font` baixa e auto-hospeda no build — com `output: "export"` isso
 * significa arquivos estáticos no próprio docroot, sem chamada a terceiro em
 * runtime, que é o mesmo contrato do hub (deploy/build-fonts.sh).
 */
const scalpelBody = Inter({
  variable: "--font-scalpel-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const scalpelDisplay = Manrope({
  variable: "--font-scalpel-display",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://estetoscopio.scalpel.com.br"),
  title: {
    default: "MVP Estetoscópio — Scalpel",
    template: "%s — MVP Estetoscópio",
  },
  description:
    "Flashcards com repetição espaçada (SM-2) para estudo de medicina.",
  applicationName: "MVP Estetoscópio",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon.ico", sizes: "any" },
      { url: "/brand/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "Estetoscópio",
  },
  openGraph: {
    type: "website",
    siteName: "Scalpel",
    locale: "pt_BR",
    title: "MVP Estetoscópio — Scalpel",
    description:
      "Flashcards com repetição espaçada (SM-2) para estudo de medicina.",
    url: "https://estetoscopio.scalpel.com.br/",
    images: [{ url: "/brand/og-default.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0F766E" },
    { media: "(prefers-color-scheme: dark)", color: "#07111F" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${scalpelBody.variable} ${scalpelDisplay.variable} antialiased`}
      >
        <ToastProvider>
          <AuthGate>
            <Sidebar />
            <main className="main-content min-h-screen">{children}</main>
          </AuthGate>
        </ToastProvider>
      </body>
    </html>
  );
}
