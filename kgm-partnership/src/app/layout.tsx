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
    "Two worlds. One vision. A strategic partnership proposal connecting mobility, sport and the next generation.",
  openGraph: {
    title: "ESD HOOPS × KGM — Strategic Partnership Proposal",
    description: "Connecting mobility, sport and the next generation.",
    type: "website",
    images: [{ url: "/images/kgm-torres-showroom-front.jpg", width: 1920, height: 1134 }],
  },
  robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
