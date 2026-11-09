import { useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Settings,
  Plus,
  Check,
  CalendarDays,
  LogOut,
  Target,
} from "lucide-react";
import type { TemplateProps, Entity } from "../types";
import { list, makeId } from "../types";
import { AuthPanel } from "../shared/auth-panel";
import {
  AppFrame,
  PageHead,
  Button,
  Panel,
  Avatar,
  Status,
  Tabs,
  FormModal,
  SettingPanel,
  Photo,
  Progress,
  Empty,
  useToast,
} from "../shared/ui";
export default function App({ config }: TemplateProps) {
  const [session, setSession] = useState(true),
    [view, setView] = useState("overview"),
    [tasks, setTasks] = useState(list(config, "tasks")),
    [filter, setFilter] = useState("Todas"),
    [create, setCreate] = useState(false);
  const toast = useToast();
  const complete = tasks.filter((t) => t.status === "Concluído").length;
  const filtered = tasks.filter(
    (t) => filter === "Todas" || t.status === filter,
  );
  return !session ? (
    <AuthPanel config={config} onEnter={() => setSession(true)} />
  ) : (
    <AppFrame
      config={config}
      active={view}
      onNav={setView}
      nav={[
        {
          id: "overview",
          label: "Meu dia",
          icon: <LayoutDashboard size={18} />,
        },
        {
          id: "tasks",
          label: "Minhas tarefas",
          icon: <CheckSquare size={18} />,
          count: tasks.length,
        },
        { id: "settings", label: "Preferências", icon: <Settings size={18} /> },
      ]}
      actions={
        <button className="text-button" onClick={() => setSession(false)}>
          <LogOut size={16} />
          <span className="desktop-label">Sair da demo</span>
        </button>
      }
    >
      <PageHead
        eyebrow="QUARTA-FEIRA / SEU ESPAÇO"
        title={config.content.headline}
        description={config.content.description}
      >
        <Button onClick={() => setCreate(true)}>
          <Plus size={17} />
          Nova tarefa
        </Button>
      </PageHead>
      {view === "settings" ? (
        <SettingPanel />
      ) : (
        <>
          {view === "overview" && (
            <div className="orbital-grid">
              <section className="focus-card">
                <div>
                  <span className="eyebrow">MENOS RUÍDO, MAIS DIREÇÃO</span>
                  <h2>
                    Seu foco merece
                    <br />
                    um lugar especial.
                  </h2>
                  <p>Pequenos passos fazem grandes projetos acontecerem.</p>
                  <Button onClick={() => setView("tasks")}>
                    Organizar meu dia
                  </Button>
                </div>
                <Photo
                  name={config.content.heroImage}
                  alt="Forma abstrata cromada"
                  loading="eager"
                />
              </section>
              <Panel title="Ritmo da semana" subtitle="Cada entrega conta">
                <div
                  className="goal-ring"
                  style={
                    {
                      "--ring": `${tasks.length ? (complete / tasks.length) * 100 : 0}%`,
                    } as React.CSSProperties
                  }
                >
                  <div>
                    <b>
                      {complete}/{tasks.length}
                    </b>
                    <span>tarefas concluídas</span>
                  </div>
                </div>
                <div className="panel-body">
                  <Progress
                    value={tasks.length ? (complete / tasks.length) * 100 : 0}
                    label="Seu progresso"
                  />
                </div>
              </Panel>
            </div>
          )}
          <div className="grid-2">
            <Panel
              title="Um passo de cada vez"
              subtitle="Sua lista, do seu jeito"
              action={
                <Button variant="ghost" onClick={() => setCreate(true)}>
                  <Plus size={16} />
                  Adicionar
                </Button>
              }
            >
              <div className="panel-body" style={{ paddingBottom: 5 }}>
                <Tabs
                  items={["Todas", "Pendente", "Em andamento", "Concluído"]}
                  value={filter}
                  onChange={setFilter}
                />
              </div>
              {filtered.map((t) => (
                <div
                  className={`task-row ${t.status === "Concluído" ? "completed" : ""}`}
                  key={t.id}
                >
                  <button
                    className="task-check"
                    aria-label={`${t.status === "Concluído" ? "Reabrir" : "Concluir"} ${t.title}`}
                    aria-pressed={t.status === "Concluído"}
                    onClick={() =>
                      setTasks((p) =>
                        p.map((x) =>
                          x.id === t.id
                            ? {
                                ...x,
                                status:
                                  x.status === "Concluído"
                                    ? "Pendente"
                                    : "Concluído",
                              }
                            : x,
                        ),
                      )
                    }
                  >
                    {t.status === "Concluído" && <Check size={14} />}
                  </button>
                  <div>
                    <h3>{t.title}</h3>
                    <p>
                      {t.category} <span>·</span> {t.date}
                    </p>
                  </div>
                  <Avatar name={t.person} size={29} />
                </div>
              ))}
              {!filtered.length && (
                <Empty
                  title="Tudo certo por aqui"
                  text="Nenhuma tarefa com este filtro."
                />
              )}
            </Panel>
            <Panel
              title="Um bom plano para hoje"
              subtitle="Reserve tempo para o que importa"
            >
              <div className="daily-plan">
                <div>
                  <span>09:00</span>
                  <i />
                  <div>
                    <h3>Momento de foco</h3>
                    <p>Seu projeto mais importante</p>
                  </div>
                </div>
                <div>
                  <span>11:00</span>
                  <i />
                  <div>
                    <h3>Alinhar próximos passos</h3>
                    <p>Conversa com a equipe</p>
                  </div>
                </div>
                <div>
                  <span>14:00</span>
                  <i />
                  <div>
                    <h3>Criar com espaço</h3>
                    <p>Tempo livre para boas ideias</p>
                  </div>
                </div>
              </div>
              <div className="panel-body">
                <p className="field-hint">
                  Agenda ilustrativa. Personalize os blocos no componente.
                </p>
              </div>
            </Panel>
          </div>
        </>
      )}
      <FormModal
        open={create}
        onClose={() => setCreate(false)}
        title="Uma nova tarefa"
        fields={[
          { name: "title", label: "O que precisa acontecer?" },
          { name: "category", label: "Projeto ou área", value: "Design" },
          { name: "person", label: "Responsável", value: "Marina" },
          {
            name: "date",
            label: "Quando?",
            type: "select",
            options: ["Hoje", "Amanhã", "Esta semana"],
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["Pendente", "Em andamento", "Concluído"],
          },
        ]}
        onSubmit={(d) => {
          setTasks((p) => [...p, { ...d, id: makeId(), title: d.title }]);
          toast("Tarefa adicionada.");
        }}
      />
    </AppFrame>
  );
}
