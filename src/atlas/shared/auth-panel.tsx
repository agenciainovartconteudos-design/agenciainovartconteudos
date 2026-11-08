import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  CheckCircle2,
  Layers,
  ShieldCheck,
} from "lucide-react";
import type { TemplateConfig } from "../types";
import { Brand, Button, Photo, useToast } from "./ui";
import { supabase } from "@/integrations/supabase/client";

export function AuthPanel({
  config,
  onEnter,
  imageSrc,
}: {
  config: TemplateConfig;
  onEnter: () => void;
  imageSrc?: string;
}) {
  const [mode, setMode] = useState("login"),
    [show, setShow] = useState(false),
    [success, setSuccess] = useState(false),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const toast = useToast();

  async function handleGoogle() {
    setError("");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin` },
    });
    if (err) setError("Não foi possível conectar com o Google.");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    setLoading(true);
    try {
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (err) {
          setError("E-mail ou senha incorretos.");
          return;
        }
        toast("Login realizado com sucesso.");
        onEnter();
      } else if (mode === "register") {
        const { error: err } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { full_name: data.name },
          },
        });
        if (err) {
          setError(err.message === "User already registered" ? "Este e-mail já está cadastrado." : "Não foi possível criar a conta.");
          return;
        }
        setSuccess(true);
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(data.email);
        if (err) {
          setError("Não foi possível enviar o e-mail de recuperação.");
          return;
        }
        setSuccess(true);
      }
      form.reset();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main id="main" className="auth-layout">
      <section className="auth-visual">
        <Photo
          name={imageSrc || config.content.heroImage}
          alt={config.content.heroAlt || `Imagem de ${config.branding.name}`}
          loading="eager"
        />
        <div className="auth-visual-top">
          <Brand config={config} />
          <span>{config.branding.tagline}</span>
        </div>
        <div className="auth-visual-copy">
          <span className="auth-pill">
            <Layers size={14} />
            {config.content.visualBadge || config.branding.tagline}
          </span>
          <h1>{config.content.headline}</h1>
          <p>{config.content.visualDescription || config.content.description}</p>
          <div className="auth-visual-bottom">
            <span>{config.content.visualFooter || config.branding.tagline}</span>
          </div>
        </div>
      </section>
      <section className="auth-form-side">
        <div className="auth-mobile-brand">
          <Brand config={config} />
        </div>
        <div className="auth-box">
          {success ? (
            <div className="success-card">
              <CheckCircle2 size={48} />
              <h2>Tudo certo</h2>
              <p>
                {mode === "recover"
                  ? "Se o e-mail informado existir, enviamos um link de recuperação de senha."
                  : "Cadastro realizado. Verifique seu e-mail para confirmar a conta antes de entrar."}
              </p>
              <Button
                onClick={() => {
                  setMode("login");
                  setSuccess(false);
                }}
              >
                Voltar para entrar
              </Button>
            </div>
          ) : (
            <>
              <div className="auth-icon">
                <LockKeyhole size={24} />
              </div>
              <span className="eyebrow">{config.content.eyebrow}</span>
              <h2>
                {mode === "login"
                  ? config.content.loginTitle || "Acesse sua conta"
                  : mode === "register"
                    ? config.content.registerTitle || "Crie sua conta"
                    : config.content.recoverTitle || "Recupere sua senha"}
              </h2>
              <p>
                {mode === "login"
                  ? config.content.description
                  : mode === "register"
                    ? config.content.registerDescription || config.content.description
                    : config.content.recoverDescription || "Informe seu e-mail para recuperar o acesso."}
              </p>
              {mode !== "recover" && (
                <div className="auth-tabs">
                  <button
                    className={mode === "login" ? "active" : ""}
                    onClick={() => setMode("login")}
                  >
                    Entrar
                  </button>
                  <button
                    className={mode === "register" ? "active" : ""}
                    onClick={() => setMode("register")}
                  >
                    Criar conta
                  </button>
                </div>
              )}
              <form className="form-stack" onSubmit={handleSubmit}>
                {mode === "register" && (
                  <label className="field">
                    <span>Nome completo</span>
                    <input
                      name="name"
                      autoComplete="name"
                      placeholder="Como podemos chamar você?"
                      required
                    />
                  </label>
                )}
                <label className="field">
                  <span>Seu e-mail</span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    required
                  />
                </label>
                {mode !== "recover" && (
                  <label className="field">
                    <span>Senha</span>
                    <div className="password-wrap">
                      <input
                        name="password"
                        type={show ? "text" : "password"}
                        aria-label="Senha"
                        aria-describedby="auth-password-hint"
                        autoComplete={
                          mode === "login" ? "current-password" : "new-password"
                        }
                        placeholder="Digite sua senha"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                        onClick={() => setShow(!show)}
                      >
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <small id="auth-password-hint" className="field-hint">
                      Mínimo de 8 caracteres.
                    </small>
                  </label>
                )}
                {mode === "login" && (
                  <div className="between auth-options">
                    <span>Acesso restrito à equipe</span>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setMode("recover")}
                    >
                      Esqueci a senha
                    </button>
                  </div>
                )}
                {error && (
                  <p role="alert" style={{ color: "#a8493d", fontSize: 13, fontWeight: 600 }}>
                    {error}
                  </p>
                )}
                <Button type="submit" className="full" disabled={loading}>
                  {loading
                    ? "Enviando..."
                    : mode === "login"
                      ? "Entrar"
                      : mode === "register"
                        ? "Criar conta"
                        : "Enviar link de recuperação"}
                </Button>
                {mode === "recover" && (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setMode("login")}
                  >
                    Voltar para entrar
                  </Button>
                )}
              </form>
              {mode !== "recover" && (
                <>
                  <div className="between" style={{ margin: "20px 0", color: "var(--muted)", fontSize: 12, fontWeight: 700 }}>
                    <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
                    <span style={{ padding: "0 10px" }}>OU</span>
                    <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
                  </div>
                  <Button variant="secondary" type="button" className="full" onClick={handleGoogle}>
                    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4C 11.8 7.3 21.3 7.3 29.9z"/>
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.9 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.7 13.4-4.6l-6.2-5.2C29.2 35.9 26.7 36.8 24 36.8c-5.3 0-9.7-3.1-11.3-7.8l-6.6 5.1C9.6 39.6 16.2 44 24 44z"/>
                      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.6-6.1 7.2l6.2 5.2C39.1 37.1 44 31.4 44 24c0-1.2-.1-2.4-.4-3.5z"/>
                    </svg>
                    Continuar com Google
                  </Button>
                </>
              )}
              <div className="auth-demo">
                <ShieldCheck size={17} />
                <p>Acesso restrito à equipe. Suas credenciais são protegidas.</p>
              </div>
            </>
          )}
        </div>
        <div className="auth-bottom">
          <span>© {config.branding.name}</span>
          <span>{config.branding.tagline}</span>
        </div>
      </section>
    </main>
  );
}
