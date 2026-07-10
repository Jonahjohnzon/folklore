// components/route-progress-bar.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

NProgress.configure({ showSpinner: false, trickleSpeed: 120, minimum: 0.15 });

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstRender = useRef(true);

  // Fires whenever the route actually finishes changing — stop the bar.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    NProgress.done();
  }, [pathname, searchParams]);

  // Intercept clicks on same-origin links to start the bar immediately,
  // before Next.js finishes fetching/rendering the new route.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.target === "_blank") return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      try {
        const url = new URL(href, window.location.href);
        const isSameOrigin = url.origin === window.location.origin;
        const isSamePage = url.pathname === window.location.pathname && url.search === window.location.search;
        if (isSameOrigin && !isSamePage) {
          NProgress.start();
        }
      } catch {
        // relative/invalid href — ignore
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}