import { createRootRoute, Outlet, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "@/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Content Studio — artes em lote, aprovação de clientes e Kanban editorial" },
      { name: "description", content: "Banco de clientes, estúdio de design em lote, Kanban multi-cliente, portal de aprovação por link e tendências por nicho, em um só painel." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: () => (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
});
