import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Megaphone, LogOut } from "lucide-react";
import type { TemplateProps } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { AppFrame, PageHead } from "../shared/ui";
import { CampaignsManager } from "../shared/campaigns-manager";

export default function Campaigns({
  config,
  imageSrc,
}: TemplateProps & { imageSrc?: string }) {
  const navigate = useNavigate();
  const [view, setView] = useState("campaigns");
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle();
      setCurrentUser({
        name: profile?.full_name || user.email?.split("@")[0] || "Minha conta",
        email: profile?.email || user.email || "",
      });
    })();
  }, []);

  const nav = [
    { id: "overview", label: "Voltar ao painel", icon: <ArrowLeft size={18} /> },
    { id: "campaigns", label: "Campanhas", icon: <Megaphone size={18} /> },
  ];

  return (
    <AppFrame
      config={config}
      nav={nav}
      active={view}
      onNav={(id) => {
        if (id === "overview") {
          navigate({ to: "/admin" });
          return;
        }
        setView(id);
      }}
      userName={currentUser?.name}
      userEmail={currentUser?.email}
      actions={
        <button
          className="text-button"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
        >
          <LogOut size={16} />
          <span className="desktop-label">Sair</span>
        </button>
      }
    >
      <PageHead
        eyebrow={config.content.eyebrow}
        title={config.content.headline}
        description={config.content.description}
      />
      {imageSrc && (
        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 24,
            border: "1px solid var(--line)",
          }}
        >
          <img
            src={imageSrc}
            alt="Ilustração de um megafone lançando ícones de redes sociais, representando uma campanha de marketing multicanal"
            style={{ width: "100%", maxHeight: 260, objectFit: "cover", display: "block" }}
          />
        </div>
      )}
      <CampaignsManager />
    </AppFrame>
  );
}
