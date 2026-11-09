import { useState } from "react";
import {
  PenLine,
  FileText,
  Settings,
  Plus,
  Eye,
  BookOpen,
  Save,
} from "lucide-react";
import type { TemplateProps, Entity } from "../types";
import { list, makeId } from "../types";
import {
  AppFrame,
  PageHead,
  Button,
  Panel,
  Search,
  Tabs,
  Photo,
  Status,
  Avatar,
  FormModal,
  Modal,
  SettingPanel,
  Empty,
  useToast,
} from "../shared/ui";
export default function CMS({ config }: TemplateProps) {
  const [view, setView] = useState("posts"),
    [posts, setPosts] = useState(list(config, "posts")),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("Todos"),
    [editing, setEditing] = useState<Entity | null>(null),
    [preview, setPreview] = useState<Entity | null>(null);
  const toast = useToast();
  const filtered = posts.filter(
    (p) =>
      (filter === "Todos" || p.status === filter) &&
      p.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <AppFrame
      config={config}
      active={view}
      onNav={setView}
      nav={[
        { id: "posts", label: "Publicações", icon: <FileText size={18} /> },
        {
          id: "library",
          label: "Visão editorial",
          icon: <BookOpen size={18} />,
        },
        { id: "settings", label: "Preferências", icon: <Settings size={18} /> },
      ]}
    >
      <PageHead
        eyebrow="ESTÚDIO EDITORIAL / CONTEÚDO"
        title={config.content.headline}
        description={config.content.description}
      >
        <Button
          onClick={() =>
            setEditing({
              id: makeId(),
              title: "",
              description: "",
              category: "Design",
              status: "Rascunho",
              person: "Marina Costa",
              image: "education.webp",
              date: "Nesta sessão",
            })
          }
        >
          <Plus size={17} />
          Nova publicação
        </Button>
      </PageHead>
      {view === "settings" ? (
        <SettingPanel />
      ) : (
        <>
          <div className="editorial-feature">
            <div>
              <span className="eyebrow">SEU PRÓXIMO CAPÍTULO</span>
              <h2>
                Ideias com espaço
                <br />
                para florescer.
              </h2>
              <p>
                {posts.length} histórias ·{" "}
                {posts.filter((p) => p.status === "Publicado").length}{" "}
                publicadas · seu repertório em movimento.
              </p>
              <Button variant="secondary" onClick={() => setFilter("Rascunho")}>
                Continuar um rascunho
              </Button>
            </div>
            <Photo
              name={config.content.heroImage}
              alt="Espaço criativo de aprendizagem"
              loading="eager"
            />
          </div>
          <div className="toolbar">
            <Tabs
              items={["Todos", "Publicado", "Rascunho"]}
              value={filter}
              onChange={setFilter}
            />
            <Search
              value={query}
              onChange={setQuery}
              placeholder="Buscar publicação…"
            />
          </div>
          {view === "library" ? (
            <div className="three-grid">
              {filtered.map((p) => (
                <article className="cms-card" key={p.id}>
                  <Photo name={p.image || "education.webp"} alt={p.title} />
                  <div>
                    <div className="between">
                      <span className="eyebrow">{p.category}</span>
                      <Status value={p.status} />
                    </div>
                    <h2>{p.title}</h2>
                    <p>{p.description}</p>
                    <Button variant="ghost" onClick={() => setPreview(p)}>
                      Ler prévia
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Panel>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Publicação</th>
                      <th>Status</th>
                      <th>Autor</th>
                      <th>Atualização</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="inline">
                            <div className="post-thumb">
                              <Photo
                                name={p.image || "education.webp"}
                                alt=""
                              />
                            </div>
                            <div>
                              <b>{p.title}</b>
                              <span className="secondary">{p.category}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Status value={p.status} />
                        </td>
                        <td>
                          <div className="inline">
                            <Avatar name={p.person} size={27} />
                            {p.person}
                          </div>
                        </td>
                        <td>{p.date}</td>
                        <td>
                          <div className="inline">
                            <Button
                              variant="ghost"
                              onClick={() => setEditing({ ...p })}
                            >
                              <PenLine size={14} />
                              Editar
                            </Button>
                            <button
                              className="icon-button"
                              aria-label={`Prévia: ${p.title}`}
                              onClick={() => setPreview(p)}
                            >
                              <Eye size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!filtered.length && <Empty />}
            </Panel>
          )}
        </>
      )}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Estúdio de escrita"
        wide
      >
        {editing && (
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const action = (
                e.nativeEvent as SubmitEvent
              ).submitter?.getAttribute("value");
              const post = {
                ...editing,
                status: action === "publish" ? "Publicado" : "Rascunho",
                date: "Nesta sessão",
              };
              setPosts((p) =>
                p.some((x) => x.id === post.id)
                  ? p.map((x) => (x.id === post.id ? post : x))
                  : [post, ...p],
              );
              setEditing(null);
              toast(
                action === "publish"
                  ? "Publicação simulada. Nenhum conteúdo foi enviado à internet."
                  : "Rascunho salvo nesta sessão.",
              );
            }}
          >
            <label className="field">
              <span>Título</span>
              <input
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
                required
                placeholder="Uma ideia começa com um título…"
              />
            </label>
            <label className="field">
              <span>Categoria</span>
              <select
                value={editing.category}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value })
                }
              >
                <option>Design</option>
                <option>Cultura</option>
                <option>Processo</option>
              </select>
            </label>
            <label className="field">
              <span>Conteúdo</span>
              <textarea
                rows={10}
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                required
                placeholder="Escreva sua história…"
              />
            </label>
            <div className="hero-buttons">
              <Button type="submit" value="draft" variant="secondary">
                <Save size={16} />
                Salvar rascunho
              </Button>
              <Button type="submit" value="publish">
                Simular publicação
              </Button>
            </div>
            <p className="field-hint">
              Editor de texto simples. Conteúdo preservado apenas enquanto a
              página estiver aberta.
            </p>
          </form>
        )}
      </Modal>
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title="Prévia editorial"
        wide
      >
        {preview && (
          <article className="article-preview">
            <Photo
              name={preview.image || "education.webp"}
              alt={preview.title}
            />
            <span className="eyebrow">{preview.category}</span>
            <h1>{preview.title}</h1>
            <p className="muted">
              Por {preview.person} · {preview.date}
            </p>
            <div>{preview.description}</div>
          </article>
        )}
      </Modal>
    </AppFrame>
  );
}
