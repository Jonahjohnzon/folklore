/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { ThemeProvider } from "@/context/theme-context";
import "./globals.css";
import { GOOGLE_FONTS_HREF } from "@/components/editor/Fonts";
import StoreHydrator from "@/app/store/StoreHydrator";



export const metadata: Metadata = {
  title: "Lore — stories worth staying up for",
  description: "Read and write serialized fiction. Fantasy, romance, sci-fi, and more.",
};

// Runs before React hydrates / before first paint, so the correct
// theme is on <html> immediately — no flash of the default theme.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("lore-theme");
    var theme = stored || "midnight";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className=" scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"/>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <StoreHydrator />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}