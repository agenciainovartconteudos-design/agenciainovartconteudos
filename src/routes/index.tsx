import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Content Studio — artes em lote, aprovação de clientes e Kanban editorial" },
      { name: "description", content: "Banco de clientes, estúdio de design em lote, Kanban multi-cliente, portal de aprovação por link e tendências por nicho, em um só painel." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main id="main" style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
      <div style={{ maxWidth: 520 }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 14, letterSpacing: "-0.03em" }}>
          Content Studio
        </h1>
        <p style={{ color: "#73808e", marginBottom: 28, lineHeight: 1.6 }}>
          Banco de clientes, estúdio de design em lote, Kanban multi-cliente, portal de aprovação por
          link e tendências por nicho, em um só painel.
        </p>
        <Link
          to="/auth"
          style={{
            display: "inline-flex",
            padding: "14px 28px",
            borderRadius: 10,
            background: "#3676e6",
            color: "#fff",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Entrar no painel da equipe
        </Link>
      </div>
    </main>
  );
}
