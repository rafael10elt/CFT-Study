import { useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  Gauge,
  GraduationCap,
  HelpCircle,
  Menu,
  MessageSquareText,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";
import { DashboardPage } from "./DashboardPage";
import { StudyProvider, useStudy } from "@/lib/study-store";
import {
  PlanPage,
  KnowledgePage,
  ScenariosPage,
  TutorPage,
} from "./LearningPages";
import {
  CoursesPage,
  InterviewPage,
  NotesPage,
  SettingsPage,
} from "./ResourcePages";
import { QuizPage } from "./QuizPage";
import { ReportPage } from "./ReportPage";
import { VocabularyPage } from "./VocabularyPage";
import { Button } from "./shared";

const NAV = [
  {
    group: "VISÃO GERAL",
    items: [
      { id: "dashboard", label: "Painel", icon: Gauge },
      { id: "plan", label: "Plano de estudos", icon: CalendarDays },
      { id: "report", label: "Relatório de progresso", icon: Activity },
    ],
  },
  {
    group: "APRENDER",
    items: [
      { id: "knowledge", label: "Tópicos técnicos", icon: Zap },
      { id: "courses", label: "Cursos", icon: BookOpen },
      { id: "quizzes", label: "Questionários", icon: ClipboardCheck },
      { id: "scenarios", label: "Cenários de falha", icon: ShieldCheck },
    ],
  },
  {
    group: "PRATICAR",
    items: [
      { id: "tutor", label: "Tutor técnico com IA", icon: Sparkles },
      {
        id: "interviews",
        label: "Preparação para entrevistas",
        icon: MessageSquareText,
      },
      { id: "vocabulary", label: "Inglês técnico", icon: GraduationCap },
      { id: "notes", label: "Anotações", icon: NotebookPen },
    ],
  },
];
const PAGE_INFO: Record<string, { label: string; eyebrow: string }> = {
  dashboard: { label: "Painel", eyebrow: "VISÃO GERAL" },
  plan: { label: "Plano de estudos", eyebrow: "PROGRAMA DE 30 DIAS" },
  report: { label: "Relatório de progresso", eyebrow: "ACOMPANHAMENTO" },
  knowledge: { label: "Tópicos técnicos", eyebrow: "MAPA DE CONHECIMENTO" },
  courses: { label: "Cursos", eyebrow: "CONTEÚDO EXTERNO" },
  quizzes: { label: "Questionários", eyebrow: "REVISÃO ATIVA" },
  scenarios: { label: "Cenários de falha", eyebrow: "SIMULAÇÕES EDUCATIVAS" },
  tutor: { label: "Tutor técnico com IA", eyebrow: "ESTUDO ASSISTIDO" },
  interviews: {
    label: "Preparação para entrevistas",
    eyebrow: "PRÁTICA EM INGLÊS",
  },
  vocabulary: { label: "Inglês técnico", eyebrow: "VOCABULÁRIO PROFISSIONAL" },
  notes: { label: "Anotações", eyebrow: "SEU MATERIAL PESSOAL" },
  settings: { label: "Configurações", eyebrow: "PREFERÊNCIAS DE ESTUDO" },
};

function ShellContent() {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state } = useStudy();
  const page = PAGE_INFO[active] ?? PAGE_INFO.dashboard;
  const navigate = (id: string) => {
    setActive(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const done = state.days.filter(item => item.status === "Completed").length;
  const content = (() => {
    switch (active) {
      case "plan":
        return <PlanPage />;
      case "report":
        return <ReportPage />;
      case "knowledge":
        return <KnowledgePage />;
      case "courses":
        return <CoursesPage />;
      case "quizzes":
        return <QuizPage navigate={navigate} />;
      case "scenarios":
        return <ScenariosPage />;
      case "tutor":
        return <TutorPage />;
      case "interviews":
        return <InterviewPage />;
      case "vocabulary":
        return <VocabularyPage />;
      case "notes":
        return <NotesPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage navigate={navigate} />;
    }
  })();

  return (
    <div className={`app-frame ${collapsed ? "nav-collapsed" : ""}`}>
      {mobileOpen && (
        <button
          className="mobile-scrim"
          aria-label="Fechar navegação"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? "mobile-visible" : ""}`}>
        <div className="brand-row">
          <img src="/cft-mark.svg" alt="" className="brand-mark" />
          <div className="brand-copy">
            <strong>
              CFT<span>study</span>
            </strong>
            <small>
              STUDY COMPANION <span>·</span> IRELAND
            </small>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace-chip">
          <span className="workspace-orb">
            <Activity size={13} />
          </span>
          <span>
            ESPAÇO PESSOAL<small>Progresso neste navegador</small>
          </span>
          <ChevronDown size={13} />
        </div>
        <nav className="primary-nav" aria-label="Navegação principal">
          {NAV.map(group => (
            <div className="nav-group" key={group.group}>
              <p className="nav-group-label">{group.group}</p>
              {group.items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`nav-item ${active === item.id ? "active" : ""}`}
                    aria-current={active === item.id ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                    <span>{item.label}</span>
                    {item.id === "report" && done === 30 && (
                      <span className="nav-spark" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <button
          className={`nav-item settings-link ${active === "settings" ? "active" : ""}`}
          onClick={() => navigate("settings")}
        >
          <Target size={17} />
          <span>Configurações</span>
        </button>
        <div className="sidebar-plan">
          <div className="plan-card-top">
            <span>SEU PLANO</span>
            <span className="plan-card-index">30D</span>
          </div>
          <div className="sidebar-progress-copy">
            <strong>{done}</strong>
            <span>de 30 dias</span>
            <small>{Math.round((done / 30) * 100)}%</small>
          </div>
          <div className="sidebar-track">
            <span style={{ width: `${(done / 30) * 100}%` }} />
          </div>
          <button onClick={() => navigate("plan")}>
            Abrir cronograma <ArrowDownToLine size={13} />
          </button>
        </div>
        <div className="sidebar-footer">
          <span className="local-indicator">
            <span /> DADOS LOCAIS
          </span>
          <button
            className="collapse-button"
            onClick={() => setCollapsed(value => !value)}
            aria-label={collapsed ? "Expandir navegação" : "Recolher navegação"}
          >
            {collapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </button>
        </div>
      </aside>
      <div className="main-frame">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            <span>ESPAÇO DE ESTUDO</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{page.label}</strong>
          </div>
          <div className="topbar-right">
            <span className="today-label">
              {new Intl.DateTimeFormat("pt-BR", {
                weekday: "short",
                day: "numeric",
                month: "short",
              }).format(new Date())}
            </span>
            <span className="topbar-divider" />
            <button
              className="help-button"
              title="O plano não substitui procedimentos autorizados."
              onClick={() => navigate("settings")}
            >
              <HelpCircle size={17} />
              <span>Ajuda</span>
            </button>
            <div className="avatar-mark">CFT</div>
          </div>
        </header>
        <main className="main-content" id="main-content">
          {content}
        </main>
        <footer className="main-footer">
          <span>© CFT STUDY COMPANION</span>
          <span>
            ESTUDO EDUCACIONAL <i>·</i> NÃO É CERTIFICAÇÃO
          </span>
          <button onClick={() => navigate("settings")}>
            <Snowflake size={13} /> Privacidade & segurança
          </button>
        </footer>
      </div>
    </div>
  );
}

export default function CftShell() {
  return (
    <StudyProvider>
      <ShellContent />
    </StudyProvider>
  );
}

export { Button };
