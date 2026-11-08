import { createFileRoute } from "@tanstack/react-router";
import config from "@/atlas/configs/auth.json";
import Auth from "@/atlas/templates/auth";
import { TemplateRoot } from "@/atlas/shared/ui";
import type { TemplateConfig } from "@/atlas/types";
import "@/atlas/shared/styles.css";

const typedConfig = config as unknown as TemplateConfig;

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Content Studio" },
      { name: "description", content: "Acesso restrito à equipe do Content Studio." },
    ],
  }),
  component: () => (
    <TemplateRoot config={typedConfig}>
      <Auth config={typedConfig} />
    </TemplateRoot>
  ),
});
