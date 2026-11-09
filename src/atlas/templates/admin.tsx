import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Pencil,
  Activity,
  UserCheck,
  Download,
  TrendingUp,
  Building2,
  LayoutGrid,
  Megaphone,
} from "lucide-react";
import type { TemplateProps } from "../types";
import { supabase } from "@/integrations/supabase/client";
import {
  AppFrame,
  PageHead,
  Stat,
  Panel,
  Avatar,
  Status,
  Search,
  Tabs,
  FormModal,
  SettingPanel,
  LineChart,
  IconButton,
  Empty,
  exportCSV,
  useToast,
} from "../shared/ui";
import { StrategyGenerator } from "../shared/strategy-generator";
import { TrendTracker } from "../shared/trend-tracker";
import { ClientsManager } from "../shared/clients-manager";
import { KanbanBoard } from "../shared/kanban-board";
import { CampaignsManager } from "../shared/campaigns-manager";

type Member = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  role: "admin" | "editor";
};

const roleLabel = (r: "admin" | "editor") => (r === "admin" ? "Administrador" : "Editor");

export default function Admin({ config }: TemplateProps) {
  const [view, setView] = useState("overview"),
    [members, setMembers] = useState<Member[]>([]),
    [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState(""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("Todos"),
    [edit, setEdit] = useState<Member | null>(null);
  const toast = useToast();

  async function load() {
    setLoading(true);
    setLoadError("");
    const [{ data: profiles, error: perr }, { data: roles, error: rerr }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (perr || rerr) {
      setLoadError("Não foi possível carregar as pessoas da equipe.");
      setLoading(false);
      return;
    }
    const roleMap = new Map((roles || []).map((r) => [r.user_id, r.role]));
    setMembers(
      (profiles || []).map((p) => ({
        ...p,
        role: (roleMap.get(p.id) as "admin" | "editor") || "editor",
      })),
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = members.filter(
    (m) =>
      (filter === "Todos" || roleLabel(m.role) === filter) &&
      `${m.full_name || ""} ${m.email || ""}`.toLowerCase().includes(query.toLowerCase()),
  );

  async function saveEdit(d: Record<string, string>) {
    if (!edit) return false;
    const newRole: "admin" | "editor" = d.role === "Administrador" ? "admin" : "editor";
    const { error: perr } = await supabase
      .from("profiles")
      .update({ full_name: d.full_name })
      .eq("id", edit.id);
    if (perr) {
      toast("Não foi possível atualizar o nome.");
      return false;
    }
    const { data: existing } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", edit.id)
      .maybeSingle();
    const roleErr = existing
      ? (await supabase.from("user_roles").update({ role: newRole }).eq("id", existing.id)).error
      : (await supabase.from("user_roles").insert({ user_id: edit.id, role: newRole })).error;
    if (roleErr) {
      toast("Não foi possível atualizar o papel.");
      return false;
    }
    setMembers((prev) =>
      prev.map((m) => (m.id === edit.id ? { ...m, full_name: d.full_name, role: newRole } : m)),
    );
    toast("Pessoa atualizada.");
  }

  const nav = [
    {
      id: "overview",
      label: "Visão geral",
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: "users",
      label: "Usuários",
      icon: <Users size={18} />,
      count: members.length,
    },
    { id: "roles", label: "Papéis & acesso", icon: <Shield size={18} /> },
    { id: "clients", label: "Clientes", icon: <Building2 size={18} /> },
    { id: "campaigns", label: "Campanhas", icon: <Megaphone size={18} /> },
    { id: "kanban", label: "Kanban", icon: <LayoutGrid size={18} /> },
    { id: "strategy", label: "Estratégia & IA", icon: <Activity size={18} /> },
    { id: "trends", label: "Tendências", icon: <TrendingUp size={18} /> },
    { id: "settings", label: "Configurações", icon: <Settings size={18} /> },
  ];
  return (
    <AppFrame config={config} nav={nav} active={view} onNav={setView}>
      <PageHead
        eyebrow="WORKSPACE / OPERAÇÃO"
        title={
          view === "overview"
            ? config.content.headline
            : view === "users"
              ? "Pessoas que fazem acontecer"
              : view === "roles"
                ? "Cada pessoa, o acesso certo"
                : view === "trends"
                  ? "O que está em alta no seu nicho"
                  : view === "clients"
                    ? "Cada marca, seu próprio espaço"
                    : view === "campaigns"
                      ? "Planeje, lance e acompanhe"
                      : view === "kanban"
                        ? "Do roteiro à aprovação"
                        : "Do seu jeito"
        }
        description={config.content.description}
      />
      {view === "settings" ? (
        <SettingPanel />
      ) : view === "strategy" ? (
        <StrategyGenerator />
      ) : view === "trends" ? (
        <TrendTracker />
      ) : view === "clients" ? (
        <ClientsManager />
      ) : view === "campaigns" ? (
        <CampaignsManager />
      ) : view === "kanban" ? (
        <KanbanBoard />
      ) : view === "roles" ? (
        <div className="three-grid">
          {(["admin", "editor"] as const).map((role) => (
            <Panel
              key={role}
              title={roleLabel(role)}
              subtitle={`${members.filter((m) => m.role === role).length} pessoas nesta função`}
            >
              <div className="panel-body">
                <Shield size={30} color="var(--accent)" />
                <p className="muted" style={{ fontSize: 14, margin: "20px 0" }}>
                  {role === "admin"
                    ? "Visão completa da operação, clientes e configurações."
                    : "Gestão dos conteúdos, Kanban e aprovações da equipe."}
                </p>
                <button
                  className="btn secondary"
                  onClick={() => {
                    setView("users");
                    setQuery("");
                  }}
                >
                  Gerenciar pessoas
                </button>
                <p className="field-hint">
                  O papel é validado no servidor por política de segurança (RLS).
                </p>
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <>
          {view === "overview" && (
            <>
              <div className="stat-grid">
                <Stat
                  label="Usuários no workspace"
                  value={members.length}
                  change="Pessoas cadastradas no sistema"
                  icon={<Users size={18} />}
                />
                <Stat
                  label="Administradores"
                  value={members.filter((m) => m.role === "admin").length}
                  change="Acesso total ao workspace"
                  icon={<UserCheck size={18} />}
                />
                <Stat
                  label="Editores"
                  value={members.filter((m) => m.role === "editor").length}
                  change="Gestão de conteúdo e aprovações"
                  icon={<Shield size={18} />}
                />
                <Stat
                  label="Papéis disponíveis"
                  value="2"
                  change="Administrador e Editor"
                  icon={<Shield size={18} />}
                />
              </div>
              <div className="grid-2" style={{ marginBottom: 25 }}>
                <Panel
                  title="Atividade do workspace"
                  subtitle="Interações ilustrativas · últimos 7 dias"
                  action={<span className="badge success">Visão semanal</span>}
                >
                  <LineChart
                    values={[18, 25, 20, 38, 31, 49, 42]}
                    labels={["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]}
                  />
                </Panel>
                <Panel
                  title="Tudo em movimento"
                  subtitle="Resumo da equipe"
                >
                  <div className="row-list">
                    {members.slice(0, 3).map((m) => (
                      <div className="list-row" key={m.id}>
                        <Avatar name={m.full_name || m.email || "Pessoa"} />
                        <div>
                          <h3>{m.full_name || "Sem nome"}</h3>
                          <p>{roleLabel(m.role)}</p>
                        </div>
                        <Status value={roleLabel(m.role)} />
                      </div>
                    ))}
                  </div>
                  <div className="panel-body">
                    <button
                      className="btn ghost full"
                      onClick={() => setView("users")}
                    >
                      Ver todas as pessoas
                    </button>
                  </div>
                </Panel>
              </div>
            </>
          )}
          <Panel
            title={
              view === "overview" ? "Pessoas recentes" : "Gerenciar pessoas"
            }
            subtitle="Equipe cadastrada via login (e-mail/senha ou Google)"
            action={
              <IconButton
                label="Exportar pessoas"
                onClick={() =>
                  exportCSV(
                    "equipe.csv",
                    ["Nome", "E-mail", "Papel", "Criado em"],
                    filtered.map((m) => [
                      m.full_name || "",
                      m.email || "",
                      roleLabel(m.role),
                      new Date(m.created_at).toLocaleDateString("pt-BR"),
                    ]),
                  )
                }
              >
                <Download size={17} />
              </IconButton>
            }
          >
            {loadError && (
              <div className="panel-body">
                <p role="alert" style={{ color: "#a8493d", fontSize: 13, fontWeight: 600 }}>
                  {loadError}
                </p>
              </div>
            )}
            <div className="toolbar panel-body" style={{ paddingBottom: 0 }}>
              <Tabs
                items={["Todos", "Administrador", "Editor"]}
                value={filter}
                onChange={setFilter}
              />
              <Search
                value={query}
                onChange={setQuery}
                placeholder="Buscar pessoas…"
              />
            </div>
            {loading ? (
              <div className="panel-body">
                <p className="muted">Carregando…</p>
              </div>
            ) : filtered.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Papel</th>
                      <th>Criado em</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <div className="inline">
                            <Avatar name={m.full_name || m.email || "Pessoa"} />
                            <div>
                              <strong>{m.full_name || "Sem nome"}</strong>
                              <span className="secondary">{m.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Status value={roleLabel(m.role)} />
                        </td>
                        <td>{new Date(m.created_at).toLocaleDateString("pt-BR")}</td>
                        <td>
                          <IconButton
                            label={`Editar ${m.full_name || m.email}`}
                            onClick={() => setEdit(m)}
                          >
                            <Pencil size={15} />
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                title="Nenhuma pessoa encontrada"
                text="As pessoas aparecem aqui automaticamente quando criam conta pelo login."
              />
            )}
            <div className="table-footer">
              {filtered.length} de {members.length} pessoas
              <span>Dados reais do banco</span>
            </div>
          </Panel>
        </>
      )}
      <FormModal
        open={!!edit}
        onClose={() => setEdit(null)}
        title="Editar pessoa"
        description="Alterações são salvas direto no banco de dados."
        fields={[
          { name: "full_name", label: "Nome completo", value: edit?.full_name || "" },
          {
            name: "role",
            label: "Papel",
            type: "select",
            options: ["Administrador", "Editor"],
            value: edit ? roleLabel(edit.role) : "Editor",
          },
        ]}
        onSubmit={saveEdit}
      />
    </AppFrame>
  );
}
