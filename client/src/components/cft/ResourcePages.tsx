import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Award,
  Bookmark,
  BookMarked,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Lightbulb,
  LoaderCircle,
  MessageSquareText,
  NotebookPen,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { buildOfflineTutorReply } from "@shared/tutorFallback";
import {
  INITIAL_COURSES,
  INTERVIEW_QUESTIONS,
  STATUS_LABELS,
  TOPICS,
  VOCABULARY,
  WEEKS,
  type CourseItem,
  type VocabularyLevel,
} from "@/lib/study-data";
import { newId, useStudy, type StudyNote } from "@/lib/study-store";
import {
  Button,
  Card,
  EmptyState,
  IconButton,
  MetricCard,
  PageHeader,
  ProgressBar,
  SectionHeading,
  StatusPill,
  formattedDate,
} from "./shared";
import { JobComparisonPanel } from "./JobComparisonPanel";

const COURSE_STATUSES: CourseItem["status"][] = [
  "Not started",
  "In progress",
  "Completed",
];
const CERT_STATUSES: CourseItem["certificate"][] = [
  "Not applicable",
  "Not started",
  "In progress",
  "Issued",
  "To be verified",
];
const VOCAB_LEVELS: VocabularyLevel[] = [
  "New",
  "Learning",
  "Familiar",
  "Confident",
  "Review required",
];
const blankCourse = (): CourseItem => ({
  id: newId("course"),
  title: "",
  modules: "",
  platform: "",
  url: "",
  description: "",
  topic: "",
  startDate: "",
  completionDate: "",
  estimatedHours: "",
  actualHours: 0,
  status: "Not started",
  certificate: "To be verified",
  notes: "",
  officialDetails: "A confirmar",
});
const blankNote = (): Omit<StudyNote, "id" | "updatedAt"> => ({
  title: "",
  content: "",
  topic: "",
  courseId: "",
  dayId: "",
  externalUrl: "",
  important: false,
});

export function CoursesPage() {
  const { state, saveCourse, deleteCourse } = useStudy();
  const [draft, setDraft] = useState<CourseItem | null>(null);
  const [filter, setFilter] = useState("all");
  const courses = state.courses.filter(
    course => filter === "all" || course.status === filter
  );
  const openDraft = (course?: CourseItem) =>
    setDraft(course ? { ...course } : blankCourse());
  const change = <K extends keyof CourseItem>(key: K, value: CourseItem[K]) =>
    setDraft(previous => (previous ? { ...previous, [key]: value } : previous));
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft?.title.trim() || !draft.platform.trim()) return;
    saveCourse({
      ...draft,
      title: draft.title.trim(),
      platform: draft.platform.trim(),
      officialDetails: draft.officialDetails.trim() || "To be verified",
    });
    setDraft(null);
  };
  const totalHours = state.courses.reduce(
    (total, item) => total + (Number(item.actualHours) || 0),
    0
  );
  const verified = state.courses.filter(
    item =>
      item.officialDetails &&
      !/to be verified|a confirmar/i.test(item.officialDetails)
  ).length;
  return (
    <div className="page-stack">
      <PageHeader
        number="07 / 12"
        title="Cursos e conteúdos"
        description="Organize estudos externos sem confundir uma sugestão com curso oficial ou disponibilidade verificada."
        action={
          <Button onClick={() => openDraft()}>
            <Plus size={16} /> Adicionar conteúdo
          </Button>
        }
      />
      <div className="resource-metrics">
        <MetricCard
          icon={<BookOpen size={17} />}
          label="Conteúdos acompanhados"
          value={state.courses.length}
          detail={`${state.courses.filter(item => item.status === "Completed").length} concluídos`}
          tone="mint"
        />
        <MetricCard
          icon={<Clock3 size={17} />}
          label="Tempo registrado"
          value={`${totalHours.toFixed(1)} h`}
          detail="Soma das horas reais informadas"
          tone="blue"
        />
        <MetricCard
          icon={<ShieldCheck size={17} />}
          label="Detalhes verificados"
          value={verified}
          detail="Campos restantes indicados como pendentes"
          tone="amber"
        />
      </div>
      <div className="course-toolbar">
        <div className="course-toolbar-copy">
          <span className="eyebrow">ACOMPANHAMENTO INDIVIDUAL</span>
          <h2>Seu catálogo de estudos</h2>
        </div>
        <label className="filter-control">
          <Filter size={14} />
          <select
            aria-label="Filtrar cursos"
            value={filter}
            onChange={event => setFilter(event.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="Not started">Não iniciado</option>
            <option value="In progress">Em andamento</option>
            <option value="Completed">Concluído</option>
          </select>
          <ChevronDown size={13} />
        </label>
      </div>
      <div className="course-list">
        {courses.map(course => (
          <Card className="course-card" key={course.id}>
            <div className="course-card-head">
              <span className="course-platform-badge">
                {course.platform || "PLATAFORMA A CONFIRMAR"}
              </span>
              <div className="course-head-actions">
                <StatusPill status={course.status} />
                <IconButton
                  label={`Editar ${course.title}`}
                  onClick={() => openDraft(course)}
                >
                  <NotebookPen size={15} />
                </IconButton>
              </div>
            </div>
            <div className="course-card-body">
              <div className="course-title-block">
                <h3>{course.title || "Título a informar"}</h3>
                <p>
                  {course.description ||
                    "Descrição pessoal ainda não adicionada."}
                </p>
                {course.modules?.trim() && (
                  <div className="course-modules">
                    <strong>MÓDULOS / LINKS INFORMADOS</strong>
                    {course.modules
                      .split("\n")
                      .filter(Boolean)
                      .map((module, index) => (
                        <span key={`${course.id}-module-${index}`}>
                          {module}
                        </span>
                      ))}
                  </div>
                )}
              </div>
              <div className="course-data-grid">
                <div>
                  <span>ASSUNTO</span>
                  <strong>{course.topic || "A confirmar"}</strong>
                </div>
                <div>
                  <span>DURAÇÃO ESTIMADA</span>
                  <strong>
                    {course.estimatedHours
                      ? `${course.estimatedHours} h`
                      : "A confirmar"}
                  </strong>
                </div>
                <div>
                  <span>TEMPO REAL</span>
                  <strong>
                    {Number(course.actualHours)
                      ? `${course.actualHours} h`
                      : "Não informado"}
                  </strong>
                </div>
                <div>
                  <span>CERTIFICADO</span>
                  <strong>
                    {course.certificate === "Issued"
                      ? "Emitido (informado)"
                      : course.certificate === "Not applicable"
                        ? "Não se aplica"
                        : course.certificate === "In progress"
                          ? "Em andamento"
                          : course.certificate === "Not started"
                            ? "Não iniciado"
                            : "To be verified"}
                  </strong>
                </div>
              </div>
              <div className="course-verification">
                <AlertCircle size={14} />
                <span>
                  {course.officialDetails ||
                    "To be verified — confirme o título, a disponibilidade e as condições na fonte oficial."}
                </span>
              </div>
            </div>
            <div className="course-card-footer">
              <div>
                <span>
                  {course.startDate
                    ? `Início: ${formattedDate(`${course.startDate}T12:00:00`)}`
                    : "Início não informado"}
                </span>
                <i>·</i>
                <span>
                  {course.completionDate
                    ? `Conclusão: ${formattedDate(`${course.completionDate}T12:00:00`)}`
                    : "Conclusão não informada"}
                </span>
              </div>
              <div>
                {course.url ? (
                  <a
                    className="course-link"
                    href={course.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir link oficial informado <ExternalLink size={13} />
                  </a>
                ) : (
                  <span className="no-link">
                    Nenhum link oficial confirmado
                  </span>
                )}
                <IconButton
                  label={`Remover ${course.title}`}
                  onClick={() => deleteCourse(course.id)}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </div>
          </Card>
        ))}
        {!courses.length && (
          <EmptyState title="Nenhum conteúdo neste filtro">
            Adicione um curso ou selecione outro status.
          </EmptyState>
        )}
      </div>
      <div className="course-callout">
        <Lightbulb size={17} />
        <p>
          Os títulos iniciais são sugestões do prompt e aparecem como{" "}
          <strong>To be verified</strong> até a confirmação direta nas
          plataformas. Este aplicativo não afirma preço, duração, acesso ou
          emissão de certificado.
        </p>
      </div>
      {draft && (
        <div
          className="modal-scrim"
          role="presentation"
          onClick={event => {
            if (event.target === event.currentTarget) setDraft(null);
          }}
        >
          <form
            className="course-editor modal-panel"
            onSubmit={save}
            aria-label="Editar curso ou conteúdo"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">CATÁLOGO PESSOAL</p>
                <h2>
                  {state.courses.some(item => item.id === draft.id)
                    ? "Editar conteúdo"
                    : "Adicionar conteúdo"}
                </h2>
              </div>
              <IconButton label="Fechar" onClick={() => setDraft(null)}>
                <X size={18} />
              </IconButton>
            </div>
            <label className="field-label">
              Course title — título oficial em inglês
              <input
                className="field-control"
                required
                value={draft.title}
                onChange={event => change("title", event.target.value)}
                placeholder="Ex.: Data Centre Fundamentals"
              />
            </label>
            <div className="form-two-col">
              <label className="field-label">
                Platform
                <input
                  className="field-control"
                  required
                  value={draft.platform}
                  onChange={event => change("platform", event.target.value)}
                  placeholder="Plataforma"
                />
              </label>
              <label className="field-label">
                Related topic
                <input
                  className="field-control"
                  value={draft.topic}
                  onChange={event => change("topic", event.target.value)}
                  placeholder="Assunto relacionado"
                />
              </label>
            </div>
            <label className="field-label">
              Official URL — somente se confirmada
              <input
                className="field-control"
                type="url"
                value={draft.url}
                onChange={event => change("url", event.target.value)}
                placeholder="https://..."
              />
            </label>
            <label className="field-label">
              Descrição pessoal em português
              <textarea
                className="field-control field-textarea"
                value={draft.description}
                onChange={event => change("description", event.target.value)}
                rows={2}
                placeholder="Descrição informativa; não invente detalhes do curso."
              />
            </label>
            <label className="field-label">
              Módulos e links (um por linha; somente informações que você
              confirmou)
              <textarea
                className="field-control field-textarea"
                value={draft.modules ?? ""}
                onChange={event => change("modules", event.target.value)}
                rows={3}
                placeholder="Module 1 — URL oficial confirmada"
              />
            </label>
            <div className="form-three-col">
              <label className="field-label">
                Status
                <select
                  className="field-control"
                  value={draft.status}
                  onChange={event =>
                    change("status", event.target.value as CourseItem["status"])
                  }
                >
                  {COURSE_STATUSES.map(value => (
                    <option key={value} value={value}>
                      {STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-label">
                Certificate status
                <select
                  className="field-control"
                  value={draft.certificate}
                  onChange={event =>
                    change(
                      "certificate",
                      event.target.value as CourseItem["certificate"]
                    )
                  }
                >
                  {CERT_STATUSES.map(value => (
                    <option key={value} value={value}>
                      {STATUS_LABELS[value] ?? value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-label">
                Estimated duration (h)
                <input
                  className="field-control"
                  value={draft.estimatedHours}
                  onChange={event =>
                    change("estimatedHours", event.target.value)
                  }
                  placeholder="A confirmar"
                />
              </label>
            </div>
            <div className="form-three-col">
              <label className="field-label">
                Start date
                <input
                  type="date"
                  className="field-control"
                  value={draft.startDate}
                  onChange={event => change("startDate", event.target.value)}
                />
              </label>
              <label className="field-label">
                Completion date
                <input
                  type="date"
                  className="field-control"
                  value={draft.completionDate}
                  onChange={event =>
                    change("completionDate", event.target.value)
                  }
                />
              </label>
              <label className="field-label">
                Actual study time (h)
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  className="field-control"
                  value={draft.actualHours}
                  onChange={event =>
                    change(
                      "actualHours",
                      Math.max(0, Number(event.target.value) || 0)
                    )
                  }
                />
              </label>
            </div>
            <label className="field-label">
              Official course details / situação de verificação
              <input
                className="field-control"
                value={draft.officialDetails}
                onChange={event =>
                  change("officialDetails", event.target.value)
                }
                placeholder="To be verified"
              />
            </label>
            <label className="field-label">
              Personal notes
              <textarea
                className="field-control field-textarea"
                value={draft.notes}
                onChange={event => change("notes", event.target.value)}
                rows={2}
              />
            </label>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setDraft(null)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!draft.title.trim() || !draft.platform.trim()}
              >
                <Check size={15} /> Salvar conteúdo
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function InterviewPage() {
  const { state, saveInterviewAnswer } = useStudy();
  const categories = [
    ...new Set(INTERVIEW_QUESTIONS.map(item => item.category)),
  ];
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const questions = INTERVIEW_QUESTIONS.filter(
    item => item.category === selectedCategory
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const question = questions[activeIndex] ?? INTERVIEW_QUESTIONS[0];
  const record = state.interviews[question.id];
  const [answer, setAnswer] = useState(record?.answer ?? "");
  const [feedback, setFeedback] = useState(record?.feedback ?? "");
  const [offlineFeedback, setOfflineFeedback] = useState(false);
  const mutation = trpc.tutor.ask.useMutation();
  const changeQuestion = (category: string, index = 0) => {
    setSelectedCategory(category);
    setActiveIndex(index);
    const next = INTERVIEW_QUESTIONS.filter(item => item.category === category)[
      index
    ];
    setAnswer(state.interviews[next?.id]?.answer ?? "");
    setFeedback(state.interviews[next?.id]?.feedback ?? "");
  };
  const save = () => saveInterviewAnswer(question.id, answer, feedback);
  const getFeedback = async () => {
    if (!answer.trim()) return;
    saveInterviewAnswer(question.id, answer);
    try {
      const result = await mutation.mutateAsync({
        mode: "interview-feedback",
        messages: [
          {
            role: "user",
            content: `Interview question (English): ${question.question}\n\nStudent's answer (use only these facts):\n${answer.slice(0, 2200)}\n\nGive feedback in Portuguese and, if helpful, a concise English version that does not add claims.`,
          },
        ],
      });
      setFeedback(result.text);
      setOfflineFeedback(result.offline === true);
      saveInterviewAnswer(question.id, answer, result.text);
    } catch {
      // Sem backend (ex.: deploy estático): checklist local de revisão,
      // sem inventar fatos sobre a experiência do estudante.
      const local = buildOfflineTutorReply("interview-feedback", answer);
      setFeedback(local);
      setOfflineFeedback(true);
      saveInterviewAnswer(question.id, answer, local);
    }
  };
  const practicedCount = Object.values(state.interviews).filter(item =>
    item.answer.trim()
  ).length;
  return (
    <div className="page-stack">
      <PageHeader
        number="08 / 12"
        title="Preparação para entrevistas"
        description="Pratique em inglês, com apoio em português. Use experiências reais: esta ferramenta não preenche lacunas profissionais por você."
        action={
          <span className="interview-progress-tag">
            <BriefcaseBusiness size={15} /> {practicedCount} resposta(s)
            praticada(s)
          </span>
        }
      />
      <div className="interview-stage">
        <aside className="interview-category-panel">
          <span className="eyebrow">TEMAS DE ENTREVISTA</span>
          {categories.map(category => (
            <button
              key={category}
              className={selectedCategory === category ? "active" : ""}
              onClick={() => changeQuestion(category)}
            >
              <span>{category}</span>
              <small>
                {
                  INTERVIEW_QUESTIONS.filter(item => item.category === category)
                    .length
                }
              </small>
            </button>
          ))}
          <div className="star-mini">
            <span>
              <Sparkles size={14} /> MÉTODO STAR
            </span>
            <p>Situation · Task · Action · Result</p>
            <small>
              Organize fatos reais. Não invente resultados ou responsabilidades.
            </small>
          </div>
        </aside>
        <Card className="interview-question-card">
          <div className="interview-question-top">
            <span className="eyebrow">{question.category.toUpperCase()}</span>
            <span className="question-count">
              QUESTÃO {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(questions.length).padStart(2, "0")}
            </span>
          </div>
          <h2 className="interview-question-text">“{question.question}”</h2>
          <div className="interview-help">
            <Lightbulb size={15} />
            <p>{question.help}</p>
          </div>
          <div className="interview-keywords">
            {question.keywords.map(word => (
              <span key={word}>{word}</span>
            ))}
          </div>
          <label className="field-label interview-answer-label">
            Sua resposta em inglês
            <textarea
              className="field-control field-textarea interview-answer"
              rows={7}
              value={answer}
              onChange={event => setAnswer(event.target.value)}
              placeholder="Write your answer in English. Use only details from your real experience..."
            />
          </label>
          <div className="interview-actions">
            <Button
              variant="secondary"
              onClick={save}
              disabled={!answer.trim()}
            >
              <Bookmark size={15} /> Salvar resposta
            </Button>
            <Button
              onClick={() => void getFeedback()}
              disabled={!answer.trim() || mutation.isPending}
            >
              {mutation.isPending ? (
                <LoaderCircle size={15} className="spin" />
              ) : (
                <Sparkles size={15} />
              )}{" "}
              {mutation.isPending ? "Analisando…" : "Pedir feedback de IA"}
            </Button>
          </div>
          {feedback && (
            <div className="interview-feedback">
              <span className="eyebrow">
                <Sparkles size={13} /> FEEDBACK PARA REVISÃO
                {offlineFeedback ? " · MODO OFFLINE" : ""}
              </span>
              <p>{feedback}</p>
              <small>
                Sugestões geradas a partir do texto informado. Verifique
                fidelidade aos fatos antes de usar.
              </small>
            </div>
          )}
          <div className="interview-nav">
            <Button
              variant="ghost"
              disabled={activeIndex <= 0}
              onClick={() => changeQuestion(selectedCategory, activeIndex - 1)}
            >
              <ArrowLeft size={14} /> Anterior
            </Button>
            {questions.length > 1 && (
              <div className="interview-dots">
                {questions.map((item, index) => (
                  <button
                    title={`Questão ${index + 1}`}
                    key={item.id}
                    className={
                      index === activeIndex
                        ? "active"
                        : state.interviews[item.id]?.answer
                          ? "done"
                          : ""
                    }
                    onClick={() => changeQuestion(selectedCategory, index)}
                  />
                ))}
              </div>
            )}
            <Button
              variant="ghost"
              disabled={activeIndex >= questions.length - 1}
              onClick={() => changeQuestion(selectedCategory, activeIndex + 1)}
            >
              Próxima <ArrowRight size={14} />
            </Button>
          </div>
        </Card>
      </div>
      <div className="interview-safety-note">
        <ShieldCheck size={15} />
        <span>
          O aplicativo não cria incidentes, resultados, qualificações nem
          empregabilidade. Sua resposta continua no navegador; revise cada
          sugestão antes de reutilizá-la.
        </span>
      </div>
      <JobComparisonPanel />
    </div>
  );
}

export function LegacyVocabularyPage() {
  const { state, setVocabularyLevel } = useStudy();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState("");
  const categories = [...new Set(VOCABULARY.map(item => item.category))];
  const terms = VOCABULARY.filter(
    item =>
      (category === "all" || item.category === category) &&
      (!query ||
        `${item.term} ${item.meaning} ${item.definition}`
          .toLowerCase()
          .includes(query.toLowerCase()))
  );
  const confident = Object.values(state.vocabularyLevels).filter(
    level => level === "Confident"
  ).length;
  return (
    <div className="page-stack">
      <PageHeader
        number="09 / 12"
        title="Inglês técnico"
        description="Vocabulário bilíngue para o cotidiano profissional de data centres. Explore, pratique e registre apenas a familiaridade que fizer sentido para você."
        action={
          <span className="vocab-count-tag">
            <GraduationIcon /> {confident} confidentes
          </span>
        }
      />
      <div className="vocabulary-overview">
        <div className="vocab-hero-icon">
          <BookMarked size={22} />
        </div>
        <div>
          <span className="eyebrow">UM TERMO POR VEZ</span>
          <h2>Mais precisão na hora de comunicar.</h2>
          <p>
            Definições curtas, exemplos naturais em inglês e contexto em
            português.
          </p>
        </div>
        <div className="vocab-progress">
          <strong>
            {Object.keys(state.vocabularyLevels).length}
            <small> / {VOCABULARY.length}</small>
          </strong>
          <span>termos avaliados</span>
          <ProgressBar
            value={
              (Object.keys(state.vocabularyLevels).length / VOCABULARY.length) *
              100
            }
          />
        </div>
      </div>
      <div className="vocab-toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Buscar termo, categoria ou significado..."
            aria-label="Buscar vocabulário"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Limpar busca">
              <X size={14} />
            </button>
          )}
        </label>
        <label className="filter-control">
          <Filter size={14} />
          <select
            value={category}
            onChange={event => setCategory(event.target.value)}
            aria-label="Filtrar vocabulário por categoria"
          >
            <option value="all">Todas as categorias</option>
            {categories.map(item => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <ChevronDown size={13} />
        </label>
      </div>
      <div className="vocab-grid">
        {terms.map(item => {
          const level = state.vocabularyLevels[item.id] ?? "";
          const isOpen = expanded === item.id;
          return (
            <Card
              key={item.id}
              className={`vocab-card ${isOpen ? "vocab-open" : ""}`}
            >
              <div className="vocab-card-head">
                <span className="vocab-category">{item.category}</span>
                {level && <StatusPill status={level} />}
              </div>
              <button
                className="vocab-term-toggle"
                onClick={() => setExpanded(isOpen ? "" : item.id)}
                aria-expanded={isOpen}
              >
                <h3>{item.term}</h3>
                <span>{item.meaning}</span>
                <ChevronDown size={15} />
              </button>
              {isOpen && (
                <div className="vocab-expanded">
                  <p>{item.definition}</p>
                  <div className="vocab-example">
                    <span>EXEMPLO EM CONTEXTO</span>
                    <em>“{item.example}”</em>
                  </div>
                </div>
              )}
              <label className="field-label vocab-status-label">
                Familiaridade
                <select
                  className="field-control"
                  value={level}
                  onChange={event => {
                    if (event.target.value)
                      setVocabularyLevel(
                        item.id,
                        event.target.value as VocabularyLevel
                      );
                  }}
                >
                  <option value="">Registrar familiaridade...</option>
                  {VOCAB_LEVELS.map(value => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
            </Card>
          );
        })}
        {!terms.length && (
          <EmptyState title="Nenhum termo encontrado">
            Tente outra busca ou categoria.
          </EmptyState>
        )}
      </div>
      <p className="language-note">
        <Lightbulb size={14} /> Exemplos são modelos educacionais; adapte-os à
        situação real sem acrescentar experiência que não relatou.
      </p>
    </div>
  );
}
function GraduationIcon() {
  return <Award size={14} />;
}

export function NotesPage() {
  const { state, addNote, updateNote, deleteNote } = useStudy();
  const [draft, setDraft] = useState<Omit<
    StudyNote,
    "id" | "updatedAt"
  > | null>(null);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const visible = state.notes.filter(
    note =>
      (!favoritesOnly || note.important) &&
      (!search ||
        `${note.title} ${note.content} ${note.topic}`
          .toLowerCase()
          .includes(search.toLowerCase()))
  );
  const startNew = () => {
    setDraft(blankNote());
    setEditingId("");
  };
  const startEdit = (note: StudyNote) => {
    const { id, updatedAt: _updatedAt, ...copy } = note;
    setDraft(copy);
    setEditingId(id);
  };
  const save = () => {
    if (!draft?.title.trim() && !draft?.content.trim()) return;
    if (editingId) updateNote(editingId, draft);
    else addNote(draft);
    setDraft(null);
    setEditingId("");
  };
  const change = <K extends keyof Omit<StudyNote, "id" | "updatedAt">>(
    key: K,
    value: Omit<StudyNote, "id" | "updatedAt">[K]
  ) =>
    setDraft(previous => (previous ? { ...previous, [key]: value } : previous));
  return (
    <div className="page-stack">
      <PageHeader
        number="10 / 12"
        title="Anotações de estudo"
        description="Seu espaço para registrar dúvidas, ideias e resumos. Anotações pessoais não são material oficial de fabricantes ou plataformas."
        action={
          <Button onClick={startNew}>
            <Plus size={16} /> Nova anotação
          </Button>
        }
      />
      <div className="notes-toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar nas suas notas..."
          />
        </label>
        <Button
          variant={favoritesOnly ? "primary" : "secondary"}
          onClick={() => setFavoritesOnly(value => !value)}
        >
          <Bookmark size={15} />{" "}
          {favoritesOnly ? "Favoritos" : "Todas as notas"}
        </Button>
      </div>
      {draft && (
        <Card className="note-editor">
          <div className="card-title-row">
            <div>
              <p className="eyebrow">NOTA PESSOAL</p>
              <h3>{editingId ? "Editar anotação" : "Nova anotação"}</h3>
            </div>
            <IconButton
              label="Cancelar edição"
              onClick={() => {
                setDraft(null);
                setEditingId("");
              }}
            >
              <X size={16} />
            </IconButton>
          </div>
          <div className="form-two-col">
            <label className="field-label">
              Título
              <input
                className="field-control"
                value={draft.title}
                onChange={event => change("title", event.target.value)}
                placeholder="Título ou pergunta"
              />
            </label>
            <label className="field-label">
              Tópico relacionado
              <select
                className="field-control"
                value={draft.topic}
                onChange={event => change("topic", event.target.value)}
              >
                <option value="">Sem tópico</option>
                {TOPICS.map(topic => (
                  <option key={topic.id}>{topic.name}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="field-label">
            Resumo / dúvida
            <textarea
              className="field-control field-textarea"
              rows={5}
              value={draft.content}
              onChange={event => change("content", event.target.value)}
              placeholder="Anote os pontos principais e o que ainda precisa confirmar..."
            />
          </label>
          <div className="form-two-col">
            <label className="field-label">
              Link de referência
              <input
                type="url"
                className="field-control"
                value={draft.externalUrl}
                onChange={event => change("externalUrl", event.target.value)}
                placeholder="https://..."
              />
            </label>
            <label className="field-label note-linking">
              <span>Vincular ao dia do plano</span>
              <select
                className="field-control"
                value={draft.dayId}
                onChange={event => change("dayId", event.target.value)}
              >
                <option value="">Nenhuma atividade</option>
                {state.days.map(day => (
                  <option key={day.id} value={day.id}>
                    Dia {day.day} — {day.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="field-label note-linking">
            Vincular a curso ou conteúdo
            <select
              className="field-control"
              value={draft.courseId}
              onChange={event => change("courseId", event.target.value)}
            >
              <option value="">Nenhum curso</option>
              {state.courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
          <label className="note-checkbox">
            <input
              type="checkbox"
              checked={draft.important}
              onChange={event => change("important", event.target.checked)}
            />{" "}
            Marcar como importante
          </label>
          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={() => {
                setDraft(null);
                setEditingId("");
              }}
            >
              Cancelar
            </Button>
            <Button onClick={save}>
              <Check size={15} /> Salvar anotação
            </Button>
          </div>
        </Card>
      )}
      <div className="notes-grid">
        {visible.map(note => (
          <Card
            className={`note-card ${note.important ? "note-important" : ""}`}
            key={note.id}
          >
            <div className="note-card-head">
              <div>
                <span className="note-category">
                  {note.topic || "SEM TÓPICO"}
                </span>
                {note.important && (
                  <span className="note-star">★ IMPORTANTE</span>
                )}
              </div>
              <div className="note-card-actions">
                <IconButton
                  label="Editar anotação"
                  onClick={() => startEdit(note)}
                >
                  <NotebookPen size={14} />
                </IconButton>
                <IconButton
                  label="Excluir anotação"
                  onClick={() => deleteNote(note.id)}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </div>
            <h3>{note.title || "Anotação sem título"}</h3>
            <p className="note-content-preview">
              {note.content || "Sem texto adicional."}
            </p>
            <div className="note-card-footer">
              <span>
                <Clock3 size={12} />{" "}
                {formattedDate(note.updatedAt, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              {note.dayId && (
                <span>
                  DIA{" "}
                  {state.days.find(item => item.id === note.dayId)?.day ?? "—"}
                </span>
              )}
              {note.courseId && (
                <span>
                  {state.courses.find(item => item.id === note.courseId)
                    ?.title ?? "Curso removido"}
                </span>
              )}
              {note.externalUrl && (
                <a href={note.externalUrl} target="_blank" rel="noreferrer">
                  Abrir link <ExternalLink size={12} />
                </a>
              )}
            </div>
          </Card>
        ))}
        {!visible.length && (
          <EmptyState
            title={
              state.notes.length
                ? "Nenhuma anotação nesta busca"
                : "Comece pelo que você quer lembrar"
            }
            icon={<NotebookPen size={19} />}
          >
            {state.notes.length
              ? "Altere a busca ou volte para todas as notas."
              : "Registre seus aprendizados, dúvidas e links de referência."}
          </EmptyState>
        )}
      </div>
    </div>
  );
}

function downloadText(filename: string, content: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/markdown;charset=utf-8" })
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function LegacyReportPage() {
  const { state } = useStudy();
  const completed = state.days.filter(
    item => item.status === "Completed"
  ).length;
  const inProgress = state.days.filter(
    item => item.status === "In progress"
  ).length;
  const studyMinutes =
    state.days.reduce(
      (sum, item) => sum + Math.max(0, Number(item.actualMinutes) || 0),
      0
    ) +
    state.courses.reduce(
      (sum, item) => sum + (Number(item.actualHours) || 0) * 60,
      0
    );
  const avgQuiz = state.quizAttempts.length
    ? Math.round(
        state.quizAttempts.reduce(
          (sum, item) => sum + (item.score / Math.max(item.total, 1)) * 100,
          0
        ) / state.quizAttempts.length
      )
    : null;
  const reviewsDone = state.reviews.filter(item => item.completedAt).length;
  const scenariosDone = Object.values(state.scenarioResponses).filter(
    item => item.completedAt
  ).length;
  const interviewCount = Object.values(state.interviews).filter(item =>
    item.answer.trim()
  ).length;
  const ratedWords = Object.values(state.vocabularyLevels).length;
  const pendingReviews = state.reviews.filter(item => !item.completedAt);
  const topicChart = TOPICS.map(topic => {
    const scores = state.quizAttempts
      .map(attempt => attempt.topicScores[topic.id])
      .filter(Boolean);
    const current = scores.length
      ? Math.round(
          scores.reduce(
            (sum, item) => sum + (item.correct / Math.max(item.total, 1)) * 100,
            0
          ) / scores.length
        )
      : null;
    const level = state.knowledge[topic.id]?.level;
    const baseline = level
      ? ["Beginner", "Basic"].includes(level)
        ? 25
        : level === "Intermediate"
          ? 50
          : level === "Advanced"
            ? 75
            : 75
      : null;
    return {
      name: topic.name.replace(" Systems", ""),
      desempenho: current,
      autoavaliacao: baseline,
      hasAny: current !== null || baseline !== null,
    };
  }).filter(item => item.hasAny);
  const strengths = TOPICS.filter(topic => {
    const level = state.knowledge[topic.id]?.level;
    const scores = state.quizAttempts
      .map(item => item.topicScores[topic.id])
      .filter(Boolean);
    return (
      (level && ["Advanced", "Practical experience"].includes(level)) ||
      (scores.length &&
        scores.reduce(
          (sum, item) => sum + item.correct / Math.max(item.total, 1),
          0
        ) /
          scores.length >=
          0.8)
    );
  }).map(item => item.name);
  const difficulties = TOPICS.filter(topic => {
    const level = state.knowledge[topic.id]?.level;
    const errors = state.quizAttempts.filter(item =>
      item.missedTopicIds.includes(topic.id)
    ).length;
    return (
      (level && ["Beginner", "Basic"].includes(level)) ||
      errors >= 1 ||
      pendingReviews.some(review => review.topicId === topic.id)
    );
  }).map(item => item.name);
  const markdown = `# Relatório de aprendizagem — CFT Study Companion\n\nPeríodo de referência: ${state.startedOn} até ${new Date().toISOString().slice(0, 10)}.\n\n## Resumo\n- Dias planejados: ${state.days.length}\n- Dias concluídos: ${completed}; em andamento: ${inProgress}\n- Tempo registrado: ${(studyMinutes / 60).toFixed(2)} h\n- Cursos acompanhados: ${state.courses.length} (${state.courses.filter(item => item.status === "Completed").length} concluídos)\n- Quizzes: ${state.quizAttempts.length}; média: ${avgQuiz === null ? "sem dados" : `${avgQuiz}%`}\n- Revisões concluídas: ${reviewsDone}; pendentes: ${pendingReviews.length}\n- Cenários concluídos: ${scenariosDone}\n- Respostas de entrevista praticadas: ${interviewCount}\n- Vocabulário avaliado: ${ratedWords}\n\n## Autoavaliação e desempenho por tópico\n${TOPICS.map(
    topic => {
      const level = state.knowledge[topic.id]?.level ?? "não avaliado";
      const scores = state.quizAttempts
        .map(item => item.topicScores[topic.id])
        .filter(Boolean);
      const quiz = scores.length
        ? `${Math.round(scores.reduce((sum, item) => sum + (item.correct / item.total) * 100, 0) / scores.length)}% em ${scores.length} tentativa(s)`
        : "sem resultado";
      return `- ${topic.name}: autoavaliação ${level}; quiz ${quiz}`;
    }
  ).join(
    "\n"
  )}\n\n## Pontos de atenção\n${difficulties.length ? difficulties.map(value => `- ${value}`).join("\n") : "- Sem lacunas sinalizadas nos dados registrados."}\n\n## Preparação e histórico\n- Respostas de entrevista praticadas: ${interviewCount}\n- Cenários hipotéticos concluídos: ${scenariosDone}\n- Termos avaliados: ${ratedWords}\n\nEste relatório descreve atividade de aprendizagem, não certifica competência operacional, não substitui experiência prática nem garante emprego/aprovação.`;
  return (
    <div className="page-stack">
      <PageHeader
        number="11 / 12"
        title="Relatório de progresso"
        description="Uma fotografia factual do que ficou registrado — estudo, revisão, desempenho e autoavaliação permanecem categorias distintas."
        action={
          <Button
            variant="secondary"
            onClick={() =>
              downloadText(
                `relatorio-cft-${new Date().toISOString().slice(0, 10)}.md`,
                markdown
              )
            }
          >
            <Download size={15} /> Baixar relatório
          </Button>
        }
      />
      <div className="report-period-card">
        <div className="report-period-icon">
          <FileText size={20} />
        </div>
        <div>
          <span className="eyebrow">PERÍODO DE ESTUDO</span>
          <strong>
            {formattedDate(`${state.startedOn}T12:00:00`, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            <i>—</i> hoje
          </strong>
          <small>
            Data inicial editável no plano; métricas baseadas em registros deste
            navegador.
          </small>
        </div>
        <div className="report-plan-progress">
          <strong>
            {Math.round((completed / Math.max(state.days.length, 1)) * 100)}
            <small>%</small>
          </strong>
          <span>do plano concluído</span>
        </div>
      </div>
      <div className="resource-metrics">
        <MetricCard
          icon={<CalendarDays size={17} />}
          label="Dias concluídos"
          value={`${completed} / 30`}
          detail={`${inProgress} em andamento`}
          tone="mint"
        />
        <MetricCard
          icon={<Clock3 size={17} />}
          label="Tempo registrado"
          value={`${(studyMinutes / 60).toFixed(1)} h`}
          detail="Tempo informado, sem estimativas de sessões"
          tone="blue"
        />
        <MetricCard
          icon={<Trophy size={17} />}
          label="Média de quizzes"
          value={avgQuiz === null ? "—" : `${avgQuiz}%`}
          detail={`${state.quizAttempts.length} avaliações registradas`}
          tone="violet"
        />
        <MetricCard
          icon={<Target size={17} />}
          label="Reforço e prática"
          value={`${reviewsDone} / ${scenariosDone}`}
          detail="revisões concluídas / cenários"
          tone="amber"
        />
      </div>
      <div className="report-columns">
        <Card className="report-chart-card">
          <div className="card-title-row">
            <div>
              <p className="eyebrow">EVOLUÇÃO POR ÁREA</p>
              <h3>Autoavaliação × quizzes</h3>
            </div>
            <span className="report-legend">
              <i className="legend-self" /> Autoavaliação{" "}
              <i className="legend-quiz" /> Quizzes
            </span>
          </div>
          <p className="report-caption">
            A autoavaliação usa faixas aproximadas apenas para visualização. Os
            valores não são certificação nem comparação formal.
          </p>
          {topicChart.length ? (
            <div className="report-chart-wrap">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={topicChart}
                  layout="vertical"
                  margin={{ left: 12, right: 20 }}
                >
                  <CartesianGrid
                    stroke="rgba(147,165,176,.13)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={value => `${value}%`}
                    tick={{ fill: "#879aa5", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={155}
                    tick={{ fill: "#b3c0c5", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#142129",
                      border: "1px solid rgba(167,194,201,.2)",
                      borderRadius: 12,
                      color: "#eaf3f2",
                    }}
                    formatter={(value, name) => [
                      `${value ?? "sem registro"}${value !== null ? "%" : ""}`,
                      name === "autoavaliacao" ? "Autoavaliação" : "Quizzes",
                    ]}
                  />
                  <Bar
                    dataKey="autoavaliacao"
                    name="Autoavaliação"
                    fill="#8b7bea"
                    radius={[0, 4, 4, 0]}
                    barSize={9}
                  />
                  <Bar
                    dataKey="desempenho"
                    name="Desempenho em quiz"
                    fill="#35D6C3"
                    radius={[0, 4, 4, 0]}
                    barSize={9}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Ainda não há dados para comparar">
              Registre níveis de familiaridade e conclua alguns quizzes para
              montar a visualização.
            </EmptyState>
          )}
          <div className="report-separation-note">
            <ShieldCheck size={15} />
            <p>
              “Experiência prática” é um nível declarado pelo estudante; o app
              não faz validação independente de experiência ou competência.
            </p>
          </div>
        </Card>
        <div className="report-side">
          <Card className="report-list-card">
            <span className="eyebrow">
              <Trophy size={13} /> PONTOS FORTES REGISTRADOS
            </span>
            {strengths.length ? (
              <ul>
                {strengths.map(item => (
                  <li key={item}>
                    <CheckCircle2 size={14} /> {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="report-empty">
                Sem evidências suficientes ainda. A lista aparecerá com
                autoavaliações e resultados registrados.
              </p>
            )}
          </Card>
          <Card className="report-list-card attention-report">
            <span className="eyebrow">
              <Target size={13} /> PONTOS A DESENVOLVER
            </span>
            {difficulties.length ? (
              <ul>
                {difficulties.map(item => (
                  <li key={item}>
                    <AlertCircle size={14} /> {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="report-empty">
                Nenhuma lacuna foi sinalizada pelos dados registrados até o
                momento.
              </p>
            )}
          </Card>
          <Card className="report-list-card">
            <span className="eyebrow">
              <BriefcaseBusiness size={13} /> ENTREVISTAS E IDIOMA
            </span>
            <div className="report-mini-grid">
              <div>
                <strong>{interviewCount}</strong>
                <span>respostas praticadas</span>
              </div>
              <div>
                <strong>{ratedWords}</strong>
                <span>termos avaliados</span>
              </div>
              <div>
                <strong>{scenariosDone}</strong>
                <span>cenários concluídos</span>
              </div>
            </div>
          </Card>
          <Card className="report-list-card">
            <span className="eyebrow">
              <CalendarDays size={13} /> PRÓXIMAS REVISÕES
            </span>
            {pendingReviews.length ? (
              pendingReviews.slice(0, 3).map(item => (
                <div key={item.id} className="report-review-row">
                  <span>{item.topic}</span>
                  <small>
                    {formattedDate(item.dueAt, {
                      day: "numeric",
                      month: "short",
                    })}
                  </small>
                </div>
              ))
            ) : (
              <p className="report-empty">
                Sem revisões pendentes registradas.
              </p>
            )}
          </Card>
        </div>
      </div>
      <div className="report-disclaimer">
        <AlertCircle size={16} />
        <p>
          O relatório é descritivo e baseado nos dados que você registrou.
          Conclusão de curso, quiz ou simulação não representa competência
          operacional formal, certificação nem empregabilidade.
        </p>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const {
    state,
    setPlannedHours,
    setStartedOn,
    setReviewIntervals,
    exportData,
    importData,
    resetData,
  } = useStudy();
  const [importMessage, setImportMessage] = useState("");
  const restoreBackup = (file: File | undefined) => {
    if (!file) return;
    setImportMessage("");
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importData(String(reader.result ?? ""));
      setImportMessage(
        ok
          ? "Backup restaurado neste navegador."
          : "Arquivo inválido: selecione um backup JSON exportado pelo app."
      );
    };
    reader.onerror = () =>
      setImportMessage("Não foi possível ler o arquivo.");
    reader.readAsText(file);
  };
  const [intervals, setIntervals] = useState(
    state.reviewIntervalsDays.join(", ")
  );
  const [saved, setSaved] = useState(false);
  const persistIntervals = () => {
    const values = intervals
      .split(/[;,\s]+/)
      .map(Number)
      .filter(value => Number.isFinite(value) && value > 0)
      .slice(0, 8);
    if (values.length) setReviewIntervals(values);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };
  const reset = () => {
    if (
      window.confirm(
        "Apagar o progresso, notas, avaliações e histórico guardados somente neste navegador? Esta ação não pode ser desfeita."
      )
    )
      resetData();
  };
  const appBytes = (() => {
    try {
      return new Blob([JSON.stringify(state)]).size;
    } catch {
      return 0;
    }
  })();
  return (
    <div className="page-stack">
      <PageHeader
        number="12 / 12"
        title="Configurações"
        description="Ajuste a rotina e a retenção. Seus registros pessoais ficam no armazenamento local deste navegador."
      />
      <div className="settings-layout">
        <div className="settings-main">
          <Card className="settings-card">
            <div className="settings-section-heading">
              <span className="settings-icon mint">
                <CalendarDays size={17} />
              </span>
              <div>
                <span className="eyebrow">ROTINA DE ESTUDO</span>
                <h3>Preferências do plano</h3>
              </div>
            </div>
            <div className="settings-fields">
              <label className="field-label">
                Data de início do cronograma
                <input
                  type="date"
                  className="field-control"
                  value={state.startedOn}
                  onChange={event => setStartedOn(event.target.value)}
                />
                <small>
                  Alterar a data não apaga o histórico das atividades.
                </small>
              </label>
              <label className="field-label">
                Horas planejadas por dia
                <input
                  type="number"
                  min="0.25"
                  max="8"
                  step="0.25"
                  className="field-control"
                  value={state.plannedHoursPerDay}
                  onChange={event =>
                    setPlannedHours(Number(event.target.value))
                  }
                />
                <small>
                  O plano de 30 dias sugere 1–1,5 h por dia, mas pode ser
                  ajustado.
                </small>
              </label>
            </div>
          </Card>
          <Card className="settings-card">
            <div className="settings-section-heading">
              <span className="settings-icon blue">
                <Clock3 size={17} />
              </span>
              <div>
                <span className="eyebrow">RETENÇÃO DO CONHECIMENTO</span>
                <h3>Intervalos de revisão</h3>
              </div>
            </div>
            <p className="settings-copy">
              Dias recomendados após uma atividade ou revisão. São sugestões
              ajustáveis, nunca um prazo obrigatório.
            </p>
            <label className="field-label">
              Intervalos em dias (separados por vírgula)
              <input
                className="field-control"
                value={intervals}
                onChange={event => setIntervals(event.target.value)}
                placeholder="1, 3, 7, 14"
              />
              <small>
                Use números de 1 a 90; até 8 intervalos. Por exemplo: 1, 3, 7,
                14.
              </small>
            </label>
            <div className="settings-actions">
              <Button onClick={persistIntervals}>
                <Check size={15} />{" "}
                {saved ? "Preferências salvas" : "Salvar intervalos"}
              </Button>
            </div>
          </Card>
          <Card className="settings-card">
            <div className="settings-section-heading">
              <span className="settings-icon violet">
                <ArrowDownToLine size={17} />
              </span>
              <div>
                <span className="eyebrow">PORTABILIDADE</span>
                <h3>Exportar seus dados</h3>
              </div>
            </div>
            <p className="settings-copy">
              Baixe uma cópia JSON do progresso, cursos, anotações, histórico,
              quizzes, respostas e preferências deste navegador. O arquivo
              exportado contém dados pessoais; guarde-o com cuidado.
            </p>
            <div className="export-stats">
              <span>
                <FileText size={14} /> {state.days.length} atividades
              </span>
              <span>
                <NotebookPen size={14} /> {state.notes.length} anotações
              </span>
              <span>
                <BookOpen size={14} /> {state.courses.length} conteúdos
              </span>
              <span>{Math.max(1, Math.round(appBytes / 1024))} KB</span>
            </div>
            <Button variant="secondary" onClick={exportData}>
              <Download size={15} /> Baixar backup JSON
            </Button>
            <label className="field-label" style={{ marginTop: 12 }}>
              Restaurar backup deste navegador
              <input
                type="file"
                accept="application/json,.json"
                className="field-control"
                onChange={event => {
                  restoreBackup(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <small>
                Substitui os registros locais pelo conteúdo do arquivo.
              </small>
            </label>
            {importMessage && (
              <p className="settings-copy" role="status">
                {importMessage}
              </p>
            )}
          </Card>
          <Card className="settings-card danger-settings">
            <div className="settings-section-heading">
              <span className="settings-icon red">
                <Trash2 size={17} />
              </span>
              <div>
                <span className="eyebrow">CONTROLE LOCAL</span>
                <h3>Reiniciar seus dados</h3>
              </div>
            </div>
            <p className="settings-copy">
              Apaga registros deste aplicativo neste navegador e recria o plano
              inicial. Esta operação não afeta cópias JSON já baixadas.
            </p>
            <Button variant="danger" onClick={reset}>
              <Trash2 size={14} /> Apagar dados locais
            </Button>
          </Card>
        </div>
        <aside className="settings-aside">
          <Card className="privacy-card">
            <span className="privacy-shield">
              <ShieldCheck size={21} />
            </span>
            <p className="eyebrow">SEU ESPAÇO DE ESTUDO</p>
            <h3>Seus dados permanecem no navegador.</h3>
            <p>
              O aplicativo guarda progresso, notas, respostas e preferências
              neste dispositivo. Não há login ou sincronização entre
              dispositivos nesta versão.
            </p>
            <div className="privacy-indicators">
              <span>
                <i /> Armazenamento local ativo
              </span>
              <span>
                <i /> Sem conta presumida
              </span>
              <span>
                <i /> Tutor usa apenas mensagens enviadas
              </span>
            </div>
            <div className="privacy-footer">
              <AlertCircle size={13} /> Limpar dados do navegador pode remover
              os registros. Exporte um backup para conservar uma cópia.
            </div>
          </Card>
          <Card className="settings-boundaries">
            <span className="eyebrow">
              <ShieldCheck size={13} /> NOTA DE SEGURANÇA
            </span>
            <p>
              Este app é uma ferramenta de estudo. Não substitui procedimentos
              oficiais, fabricante, avaliação de risco, treinamento, permissão
              de trabalho ou profissionais autorizados.
            </p>
            <p>
              Quiz, autoavaliação e cenário não concedem certificação nem
              autorização para trabalhar em equipamentos críticos.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
