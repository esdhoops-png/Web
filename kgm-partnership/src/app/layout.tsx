import type { Metadata, Viewport } from "next";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/inter";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Providers } from "@/components/Providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ESD HOOPS × KGM — Strategic Partnership Proposal",
  description:
    "Two worlds. One vision. Propuesta de colaboración estratégica entre ESD HOOPS y KGM: conectando movilidad, deporte y la nueva generación.",
  openGraph: {
    title: "ESD HOOPS × KGM — Strategic Partnership Proposal",
    description: "Conectando movilidad, deporte y la nueva generación.",
    type: "website",
    images: [{ url: "/images/esd-podium.webp", width: 1616, height: 1080 }],
  },
  robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0d1e2c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
