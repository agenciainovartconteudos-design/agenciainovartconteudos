import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import config from "@/atlas/configs/campaigns.json";
import Campaigns from "@/atlas/templates/campaigns";
import { TemplateRoot } from "@/atlas/shared/ui";
import type { TemplateConfig } from "@/atlas/types";
import "@/atlas/shared/styles.css";
import campaignsImage from "@/assets/campaigns-hero.webp";

const typedConfig = config as unknown as TemplateConfig;

export const Route = createFileRoute("/campaigns")({
  head: () => ({
    meta: [
      { title: "Campanhas — Content Studio" },
      {
        name: "description",
        content: "Planeje, lance e acompanhe campanhas de marketing em todos os canais, com dados reais do seu workspace.",
      },
    ],
  }),
  component: CampaignsPage,
});

function CampaignsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "allowed">("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (active) navigate({ to: "/auth" });
        return;
      }
      if (active) setStatus("allowed");
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

  return (
    <TemplateRoot config={typedConfig}>
      <Campaigns config={typedConfig} imageSrc={campaignsImage} />
    </TemplateRoot>
  );
}
