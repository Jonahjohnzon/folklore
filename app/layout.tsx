/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { ThemeProvider } from "@/context/theme-context";
import "./globals.css";
import { GOOGLE_FONTS_HREF } from "@/components/editor/Fonts";
import StoreHydrator from "@/app/store/StoreHydrator";
import { RouteProgressBar } from "@/components/route-progress-bar";
import { Suspense } from "react";
import NextTopLoader from "nextjs-toploader";
import { Kalam } from "next/font/google";
import { MessageToastListener } from "@/components/chat/message-toast-listener";
import { NotificationPermissionPrompt } from "@/components/chat/notification-permission-prompt";
import { MessageAlertsMount } from "@/components/chat/message-alerts-mount";


const SITE_NAME = "TipaTale";
const SITE_URL = "https://tipatale.com";
const DESCRIPTION =
  "TipaTale is a free platform to read and write stories online — romance, fantasy, teen fiction, and fanfiction updated daily by a global community of writers. Follow your favorite series chapter by chapter, discover new authors, or start publishing your own serialized story in minutes, on web or mobile.";
const kalam = Kalam({ subsets: ["latin"], weight: ["700"], variable: "--font-heading" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

 title: {
  default: `${SITE_NAME} — Read Free Stories & Publish Your Own Fiction Online`,
  template: `%s | ${SITE_NAME}`,
},
  description: DESCRIPTION,

  applicationName: SITE_NAME,
  generator: "Next.js",
  keywords: [
    "TipaTale",
    "web novels",
    "read stories online",
    "fanfiction",
    "serialized fiction",
    "romance novels",
    "fantasy stories",
    "write stories online",
    "self-publishing platform",
    "story app",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  manifest: "/site.webmanifest",

  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Read and Write Stories Online`,
    description: DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Read and Write Stories Online`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Read and Write Stories Online`,
    description: DESCRIPTION,
    images: ["/opengraph.png"],
    // creator: "@tipatale", // uncomment and set if you have a Twitter/X handle
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: SITE_URL,
  },

  category: "entertainment",

  formatDetection: {
    telephone: false,
  },
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
    <html lang="en" suppressHydrationWarning className=" scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"/>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <meta name="cryptomus" content="8bcee79e" />
      </head>
      <body className={`${kalam.variable}`}>
          <Suspense fallback={null}>
          <RouteProgressBar />
        </Suspense>
        <MessageAlertsMount />
        <MessageToastListener />
        <NotificationPermissionPrompt />
        <NextTopLoader
          color="var(--accent)"
          initialPosition={0.15}
          crawlSpeed={200}
          height={2.5}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={300}
          shadow="0 0 10px var(--accent), 0 0 5px var(--accent)"
          zIndex={9999}
        />
                <StoreHydrator />
        <ThemeProvider>{children}</ThemeProvider>
        {/* <CookieConsentBanner /> */}
      </body>
    </html>
  );
}