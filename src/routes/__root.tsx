import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AppLayout } from "../components/Layout";
import { Toaster } from "../components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "#F5F7FA" }}>
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold" style={{ color: "#1B2B4B" }}>404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm" style={{ color: "#8A96AA" }}>
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md text-white px-4 py-2 text-sm font-medium"
            style={{ background: "#1B2B4B" }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Otto Help Center Admin" },
      { name: "description", content: "Internal admin panel for Otto Help Center content." },
      { property: "og:title", content: "Otto Help Center Admin" },
      { name: "twitter:title", content: "Otto Help Center Admin" },
      { property: "og:description", content: "Internal admin panel for Otto Help Center content." },
      { name: "twitter:description", content: "Internal admin panel for Otto Help Center content." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/196a6e96-c4db-4922-8f73-5cdfd40ff5ae/id-preview-fe42b4d4--1dbc7d30-8caa-496c-97ac-58b6e886f66a.lovable.app-1777655997706.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/196a6e96-c4db-4922-8f73-5cdfd40ff5ae/id-preview-fe42b4d4--1dbc7d30-8caa-496c-97ac-58b6e886f66a.lovable.app-1777655997706.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <Toaster position="bottom-right" />
    </>
  );
}
