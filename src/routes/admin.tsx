import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import config from "@/atlas/configs/admin.json";
import Admin from "@/atlas/templates/admin";
import { TemplateRoot } from "@/atlas/shared/ui";
import type { TemplateConfig } from "@/atlas/types";
import "@/atlas/shared/styles.css";

const typedConfig = config as unknown as TemplateConfig;

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel — Content Studio" },
      { name: "description", content: "Painel administrativo da equipe: clientes, artes, aprovações e tendências." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "denied" | "allowed">("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        if (active) navigate({ to: "/auth" });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      const isAdmin = roles?.some((r) => r.role === "admin");
      if (!active) return;
      setStatus(isAdmin ? "allowed" : "denied");
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  if (status === "loading") {
    return (
      <main id="main" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p>Carregando…</p>
      </main>
    );
  }

  if (status === "denied") {
    return (
      <main id="main" style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Acesso restrito</h1>
          <p style={{ color: "#73808e" }}>Sua conta não tem permissão de administrador para ver este painel.</p>
        </div>
      </main>
    );
  }

  return (
    <TemplateRoot config={typedConfig}>
      <Admin config={typedConfig} />
    </TemplateRoot>
  );
}
