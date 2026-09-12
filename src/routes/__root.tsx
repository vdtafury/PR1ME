import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useMatchRoute,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { Toaster } from "@/components/ui/sonner";
import { CartDrawer } from "@/components/CartDrawer";
import { BrandLoader } from "@/components/BrandLoader";
import { useRouterState } from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-extrabold">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page does not exist.</p>
        <a href="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Go home</a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PR1ME — Affordable Casual Fashion" },
      { name: "description", content: "Modern casual clothing for men, women & kids. Order instantly on WhatsApp." },
      { property: "og:site_name", content: "PR1ME" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <SiteChrome />
    </QueryClientProvider>
  );
}

function SiteChrome() {
  const matchRoute = useMatchRoute();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const isAdmin = !!matchRoute({ to: "/admin", fuzzy: true }) || !!matchRoute({ to: "/admin/login" });

  const alreadyDone = typeof window !== "undefined" && Boolean((window as any).__PR1ME_PRELOADER_DONE__);
  const [isPreloaderActive, setIsPreloaderActive] = useState(() => !alreadyDone);

  const handlePreloaderReady = useCallback(() => {
    setIsPreloaderActive(false);
  }, []);

  if (isAdmin) {
    return (
      <>
        <Outlet />
        <Toaster />
      </>
    );
  }
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F5]">
      <BrandLoader onReady={handlePreloaderReady} />
      <div
        className={`flex min-h-screen flex-col transition-all duration-700 ease-out ${
          isPreloaderActive
            ? "opacity-0 translate-y-2 pointer-events-none"
            : "opacity-100 translate-y-0 pointer-events-auto"
        }`}
      >
        <Header />
        <main key={pathname} className="flex-1 animate-page-enter">
          <Outlet />
        </main>
        <Footer />
        <FloatingWhatsApp />
        <CartDrawer />
      </div>
      <Toaster />
    </div>
  );
}
