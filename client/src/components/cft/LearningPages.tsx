import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookmarkCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileQuestion,
  Lightbulb,
  LoaderCircle,
  MessageCircle,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { buildOfflineTutorReply } from "@shared/tutorFallback";
import {
  QUIZ_QUESTIONS,
  SCENARIOS,
  STATUS_LABELS,
  TOPICS,
  WEEKS,
  type KnowledgeLevel,
  type QuizQuestion,
  type StudyStatus,
} from "@/lib/study-data";
import { newId, useStudy } from "@/lib/study-store";
import {
  Button,
  Card,
  EmptyState,
  IconButton,
  PageHeader,
  ProgressBar,
  SectionHeading,
  StatusPill,
  formattedDate,
} from "./shared";

type TutorMode = "tutor" | "interview-feedback";
const STUDY_STATUSES: StudyStatus[] = [
  "Not started",
  "In progress",
  "Completed",
  "Review required",
  "Skipped",
];
const KNOWLEDGE_LEVELS: KnowledgeLevel[] = [
  "Beginner",
  "Basic",
  "Intermediate",
  "Advanced",
  "Practical experience",
];
const localDate = (date: Date) => {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return copy.toISOString().slice(0, 10);
};
const scheduledFor = (start: string, index: number) => {
  const value = new Date(`${start}T12:00:00`);
  value.setDate(value.getDate() + index);
  return localDate(value);
};
const shortDate = (value?: string) =>
  value ? formattedDate(`${value}T12:00:00`) : "Data a escolher";

function StudyDayCard({
  item,
  index,
  total,
}: {
  item: ReturnType<typeof useStudy>["state"]["days"][number];
  index: number;
  total: number;
}) {
  const { state, updateDay, moveDay } = useStudy();
  const [open, setOpen] = useState(item.status === "In progress");
  const [notes, setNotes] = useState(item.notes);
  const [actualMinutes, setActualMinutes] = useState(item.actualMinutes ?? 0);
  const dayDate = item.scheduledDate ?? scheduledFor(state.startedOn, index);
  return (
    <article
      className={`study-day-card ${item.status === "Completed" ? "day-completed" : ""} ${open ? "day-open" : ""}`}
    >
      <button
        type="button"
        className="study-day-toggle"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
      >
        <span className="day-number">
          {String(item.day).padStart(2, "0")}
          <small>DIA</small>
        </span>
        <span className="day-main">
          <span className="day-kicker">
            SEMANA {item.week} <i>·</i> {item.weekTitle}
          </span>
          <strong>{item.title}</strong>
          <small>{item.objective}</small>
        </span>
        <span className="day-side">
          <StatusPill status={item.status} />
          <span className="day-date">
            <CalendarClock size={13} /> {shortDate(dayDate)}
          </span>
          <ChevronDown
            size={16}
            className={`day-chevron ${open ? "rotated" : ""}`}
          />
        </span>
      </button>
      {open && (
        <div className="study-day-detail">
          <div className="day-detail-grid">
            <div>
              <p className="eyebrow">OBJETIVO</p>
              <p className="detail-copy">{item.objective}</p>
            </div>
            <div>
              <p className="eyebrow">FOCO TÉCNICO</p>
              <div className="topic-chip-row">
                {item.topics.map(topic => (
                  <span key={topic} className="topic-chip">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="activity-block">
            <p className="eyebrow">ATIVIDADES SUGERIDAS</p>
            <ul className="activity-checklist">
              {item.activities.map((activity, i) => (
                <li key={`${item.id}-${i}`}>
                  <span>{i + 1}</span>
                  {activity}
                </li>
              ))}
            </ul>
          </div>
          <div className="day-resources">
            <span className="eyebrow">
              CONTEÚDOS RELACIONADOS{" "}
              <i>· títulos sugeridos, disponibilidade não confirmada</i>
            </span>
            <ul>
              {item.resources.map((resource, i) => (
                <li key={`${item.id}-resource-${i}`}>{resource}</li>
              ))}
            </ul>
          </div>
          <div className="day-controls">
            <label className="field-label">
              Status
              <select
                className="field-control"
                value={item.status}
                onChange={event =>
                  updateDay(
                    item.id,
                    { status: event.target.value as StudyStatus },
                    "status",
                    `Status: ${STATUS_LABELS[event.target.value] ?? event.target.value}`
                  )
                }
              >
                {STUDY_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Tempo estudado (min)
              <input
                className="field-control"
                type="number"
                min="0"
                max="720"
                step="5"
                value={actualMinutes}
                onChange={event =>
                  setActualMinutes(
                    Math.max(0, Math.min(720, Number(event.target.value) || 0))
                  )
                }
                onBlur={() => {
                  if (actualMinutes !== (item.actualMinutes ?? 0))
                    updateDay(
                      item.id,
                      { actualMinutes },
                      "time",
                      "Tempo estudado atualizado"
                    );
                }}
              />
            </label>
            <label className="field-label">
              Reagendar
              <input
                className="field-control"
                type="date"
                value={dayDate}
                disabled={item.status === "Completed"}
                onChange={event =>
                  updateDay(
                    item.id,
                    { scheduledDate: event.target.value },
                    "reschedule",
                    "Data da atividade reagendada"
                  )
                }
              />
            </label>
            <div className="day-order-controls">
              <span className="field-label">Reorganizar</span>
              <div>
                <IconButton
                  label="Mover dia para cima"
                  disabled={
                    index <= 0 ||
                    item.status === "Completed" ||
                    state.days[index - 1]?.status === "Completed"
                  }
                  onClick={() => moveDay(item.id, -1)}
                >
                  <ArrowUp size={15} />
                </IconButton>
                <IconButton
                  label="Mover dia para baixo"
                  disabled={
                    index >= total - 1 ||
                    item.status === "Completed" ||
                    state.days[index + 1]?.status === "Completed"
                  }
                  onClick={() => moveDay(item.id, 1)}
                >
                  <ArrowDown size={15} />
                </IconButton>
              </div>
            </div>
          </div>
          <label className="field-label day-notes-label">
            Anotações desta atividade
            <textarea
              className="field-control field-textarea"
              value={notes}
              onChange={event => setNotes(event.target.value)}
              placeholder="Registre observações, dúvidas ou o que quer rever depois..."
              rows={3}
            />
          </label>
          <div className="detail-footer">
            <span className="estimated-time">
              <Clock3 size={14} /> Sugestão: {item.estimate} min
            </span>
            <Button
              variant="secondary"
              onClick={() =>
                updateDay(
                  item.id,
                  { notes },
                  "notes",
                  "Anotações do dia salvas"
                )
              }
            >
              Salvar anotações
            </Button>
            <Button
              onClick={() =>
                updateDay(
                  item.id,
                  {
                    status:
                      item.status === "Completed" ? "In progress" : "Completed",
                  },
                  "status",
                  item.status === "Completed"
                    ? "Atividade reaberta"
                    : "Atividade concluída"
                )
              }
            >
              {item.status === "Completed" ? (
                <RotateCcw size={15} />
              ) : (
                <Check size={15} />
              )}
              {item.status === "Completed"
                ? "Reabrir atividade"
                : "Marcar como concluída"}
            </Button>
          </div>
          {item.completedAt && (
            <p className="completion-note">
              <CheckCircle2 size={13} /> Concluída em{" "}
              {shortDate(item.completedAt.slice(0, 10))} · Registro de estudo,
              não certificação ou qualificação.
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export function PlanPage() {
  const { state, setStartedOn, setPlannedHours } = useStudy();
  const [activeWeek, setActiveWeek] = useState(0);
  const weeks = activeWeek
    ? WEEKS.filter(week => week.number === activeWeek)
    : WEEKS;
  const done = state.days.filter(item => item.status === "Completed").length;
  return (
    <div className="page-stack">
      <PageHeader
        number="02 / 12"
        title="Plano de estudos"
        description="Trinta sessões editáveis para revisar o que importa, registrar progresso e manter o histórico — sem ritmo obrigatório."
        action={
          <div className="plan-quick-settings">
            <label>
              Início{" "}
              <input
                aria-label="Data inicial do plano"
                type="date"
                value={state.startedOn}
                onChange={event => setStartedOn(event.target.value)}
              />
            </label>
            <label>
              Horas/dia{" "}
              <input
                aria-label="Horas de estudo planejadas por dia"
                type="number"
                min="0.25"
                max="8"
                step="0.25"
                value={state.plannedHoursPerDay}
                onChange={event => setPlannedHours(Number(event.target.value))}
              />
            </label>
          </div>
        }
      />
      <div className="plan-summary-strip">
        <div>
          <span className="summary-kicker">SEU PERCURSO</span>
          <strong>
            {done}
            <small> / 30 sessões</small>
          </strong>
        </div>
        <div className="plan-summary-progress">
          <ProgressBar value={(done / 30) * 100} />
          <span>{Math.round((done / 30) * 100)}% do plano concluído</span>
        </div>
        <div className="plan-summary-duration">
          <Clock3 size={16} />
          <span>
            <strong>{(state.plannedHoursPerDay * 30).toFixed(1)} h</strong>
            <small>estimativa ajustável</small>
          </span>
        </div>
      </div>
      <div className="week-filter-row">
        <div>
          <p className="eyebrow">CRONOGRAMA</p>
          <h2>Quatro semanas de revisão</h2>
        </div>
        <div className="week-filter">
          <button
            className={activeWeek === 0 ? "active" : ""}
            onClick={() => setActiveWeek(0)}
          >
            Todas
          </button>
          {WEEKS.map(week => (
            <button
              key={week.number}
              className={activeWeek === week.number ? "active" : ""}
              onClick={() => setActiveWeek(week.number)}
            >
              S{week.number}
            </button>
          ))}
        </div>
      </div>
      {weeks.map(week => {
        const days = state.days.filter(item => item.week === week.number);
        const weekDone = days.filter(
          item => item.status === "Completed"
        ).length;
        return (
          <section
            className={`week-section week-${week.accent}`}
            key={week.number}
          >
            <div className="week-heading">
              <span className="week-number">0{week.number}</span>
              <div className="week-heading-copy">
                <p className="eyebrow">
                  SEMANA {week.number} · {week.focus.toUpperCase()}
                </p>
                <h3>{week.title}</h3>
              </div>
              <div className="week-progress-meta">
                <strong>
                  {weekDone}
                  <small> / {days.length}</small>
                </strong>
                <ProgressBar
                  value={(weekDone / Math.max(days.length, 1)) * 100}
                  tone={week.accent}
                  label={`Progresso da semana ${week.number}`}
                />
              </div>
            </div>
            <div className="study-day-list">
              {days.map(item => (
                <StudyDayCard
                  key={item.id}
                  item={item}
                  index={state.days.findIndex(day => day.id === item.id)}
                  total={state.days.length}
                />
              ))}
            </div>
          </section>
        );
      })}
      <div className="study-disclaimer">
        <ShieldCheck size={17} />
        <p>
          Atividades de estudo e cenários são educacionais e hipotéticos. Em
          qualquer situação real, siga a documentação, os procedimentos e as
          autorizações do seu site.
        </p>
      </div>
    </div>
  );
}

export function KnowledgePage() {
  const { state, setKnowledge, addReview } = useStudy();
  const { setVocabularyLevel: _unused } = useStudy();
  const overallRated = Object.keys(state.knowledge).length;
  const perWeek = [1, 2, 3, 4].map(week => {
    const topics = TOPICS.filter(topic =>
      state.days.some(
        item =>
          item.week === week && item.topics.some(name => name === topic.name)
      )
    );
    return {
      week,
      topics: topics.length,
      rated: topics.filter(item => state.knowledge[item.id]).length,
    };
  });
  return (
    <div className="page-stack">
      <PageHeader
        number="03 / 12"
        title="Tópicos técnicos"
        description="Autoavaliação de familiaridade para decidir o próximo reforço. O nível informado não é certificação nem validação formal de competência."
        action={
          <span className="self-assessment-tag">
            <Target size={15} /> AUTOAVALIAÇÃO
          </span>
        }
      />
      <div className="knowledge-overview">
        <div>
          <span className="eyebrow">SEU MAPA DE CONHECIMENTO</span>
          <strong>
            {overallRated}
            <small> / {TOPICS.length} tópicos avaliados</small>
          </strong>
        </div>
        <div className="knowledge-week-strip">
          {perWeek.map(item => (
            <div key={item.week}>
              <span>SEMANA {item.week}</span>
              <strong>
                {item.rated}
                <small>/{item.topics}</small>
              </strong>
              <ProgressBar
                value={item.topics ? (item.rated / item.topics) * 100 : 0}
                tone={WEEKS[item.week - 1].accent}
              />
            </div>
          ))}
        </div>
      </div>
      {Object.entries(
        TOPICS.reduce<Record<string, typeof TOPICS>>((all, topic) => {
          (all[topic.category] ??= []).push(topic);
          return all;
        }, {})
      ).map(([category, items]) => (
        <section className="topic-group" key={category}>
          <SectionHeading
            eyebrow="ÁREA TÉCNICA"
            title={category}
            description={`${items.length} tópico(s) de revisão`}
          />
          <div className="topic-grid">
            {items.map(topic => {
              const entry = state.knowledge[topic.id];
              const misses = state.quizAttempts.filter(item =>
                item.missedTopicIds.includes(topic.id)
              ).length;
              return (
                <Card className="topic-card" key={topic.id}>
                  <div className="topic-title-row">
                    <span className="topic-symbol">
                      <Zap size={16} />
                    </span>
                    {entry && <StatusPill status={entry.level} />}
                  </div>
                  <h3>{topic.name}</h3>
                  <p>{topic.summary}</p>
                  <label className="field-label">
                    Como você avalia sua familiaridade?
                    <select
                      className="field-control"
                      value={entry?.level ?? ""}
                      onChange={event => {
                        if (event.target.value) {
                          setKnowledge(
                            topic.id,
                            event.target.value as KnowledgeLevel
                          );
                          addReview(
                            {
                              topicId: topic.id,
                              topic: topic.name,
                              reason: `Revisão baseada na autoavaliação: ${STATUS_LABELS[event.target.value]}.`,
                              difficulty: "médio",
                              source: "autoavaliação",
                            },
                            state.reviewIntervalsDays[0] ?? 1
                          );
                        }
                      }}
                    >
                      <option value="">Selecione um nível...</option>
                      {KNOWLEDGE_LEVELS.map(level => (
                        <option key={level} value={level}>
                          {level} — {STATUS_LABELS[level]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="topic-card-foot">
                    <span>
                      {misses ? (
                        <>
                          <AlertTriangle size={13} /> {misses} resposta(s)
                          incorreta(s)
                        </>
                      ) : entry ? (
                        <>
                          <CheckCircle2 size={13} /> Última atualização
                          registrada
                        </>
                      ) : (
                        <>
                          <CircleHelp size={13} /> Ainda sem avaliação
                        </>
                      )}
                    </span>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        addReview(
                          {
                            topicId: topic.id,
                            topic: topic.name,
                            reason: topic.prompt,
                            difficulty:
                              entry?.level === "Advanced" ? "médio" : "difícil",
                            source: "solicitação manual",
                          },
                          0
                        )
                      }
                    >
                      Revisar agora <ArrowRight size={13} />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
      <div className="study-disclaimer">
        <Lightbulb size={17} />
        <p>
          “Practical experience” é uma autoavaliação pessoal. Ela não confirma
          autorização, certificação ou domínio de todos os equipamentos citados.
        </p>
      </div>
    </div>
  );
}

export function LegacyQuizPage() {
  const { state, addQuizAttempt, addReview } = useStudy();
  const [topicFilter, setTopicFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [mode, setMode] = useState<"idle" | "playing" | "results">("idle");
  const [deck, setDeck] = useState<typeof QUIZ_QUESTIONS>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const available = useMemo(
    () =>
      QUIZ_QUESTIONS.filter(
        item =>
          (topicFilter === "all" || item.topicId === topicFilter) &&
          (difficultyFilter === "all" || item.difficulty === difficultyFilter)
      ),
    [topicFilter, difficultyFilter]
  );
  const question = deck[index];
  const answered = index < answers.length;
  const correctSoFar = answers.reduce(
    (total, answer, questionIndex) =>
      total + (answer === deck[questionIndex]?.answer ? 1 : 0),
    0
  );
  const begin = () => {
    setDeck(available);
    setIndex(0);
    setAnswers([]);
    setSelected(null);
    setMode("playing");
  };
  const choose = (answer: number) => {
    if (!answered) setSelected(answer);
  };
  const checkAnswer = () => {
    if (selected === null || answered) return;
    setAnswers(previous => [...previous, selected]);
  };
  const finish = () => {
    const attempted = answers.map((answer, questionIndex) => ({
      question: deck[questionIndex],
      correct: answer === deck[questionIndex].answer,
    }));
    const topicScores = attempted.reduce<
      Record<string, { correct: number; total: number }>
    >((scores, item) => {
      const key = item.question.topicId;
      scores[key] ??= { correct: 0, total: 0 };
      scores[key].total += 1;
      if (item.correct) scores[key].correct += 1;
      return scores;
    }, {});
    const missedTopicIds = [
      ...new Set(
        attempted
          .filter(item => !item.correct)
          .map(item => item.question.topicId)
      ),
    ];
    addQuizAttempt({
      score: attempted.filter(item => item.correct).length,
      total: attempted.length,
      topicScores,
      missedTopicIds,
    });
    missedTopicIds.forEach(topicId => {
      const topic = TOPICS.find(item => item.id === topicId);
      if (topic)
        addReview(
          {
            topicId,
            topic: topic.name,
            reason:
              "Resposta incorreta neste quiz; revisar o conceito e a explicação associada.",
            difficulty: "difícil",
            source: "questionário",
          },
          state.reviewIntervalsDays[0] ?? 1
        );
    });
    setMode("results");
  };
  const restart = () => {
    setMode("idle");
    setDeck([]);
  };
  const lastAttempt = state.quizAttempts.at(-1);
  return (
    <div className="page-stack">
      <PageHeader
        number="04 / 12"
        title="Questionários"
        description="Revisão ativa por assunto. As questões são educativas e próprias para estudo — não são provas oficiais de certificação."
        action={
          <span className="assessment-chip">
            <FileQuestion size={15} /> {state.quizAttempts.length} avaliações
          </span>
        }
      />
      {mode === "idle" && (
        <>
          <div className="quiz-intro-card">
            <div className="quiz-intro-icon">
              <Zap size={22} />
            </div>
            <div>
              <p className="eyebrow">CHECKPOINT DE CONHECIMENTO</p>
              <h2>Recupere o conceito antes de conferir a resposta.</h2>
              <p>
                As respostas incorretas sugerem reforços. O app registra seu
                desempenho sem interpretar isso como experiência prática.
              </p>
            </div>
          </div>
          <div className="quiz-start-grid">
            <Card className="quiz-config-card">
              <SectionHeading
                eyebrow="PERSONALIZAR SESSÃO"
                title="Escolha o foco"
                description="Comece por um assunto ou misture os temas."
              />
              <label className="field-label">
                Assunto
                <select
                  className="field-control"
                  value={topicFilter}
                  onChange={event => setTopicFilter(event.target.value)}
                >
                  <option value="all">Todos os assuntos</option>
                  {TOPICS.map(topic => (
                    <option value={topic.id} key={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-label">
                Nível
                <select
                  className="field-control"
                  value={difficultyFilter}
                  onChange={event => setDifficultyFilter(event.target.value)}
                >
                  <option value="all">Todos os níveis</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>
              <div className="quiz-ready-note">
                <span>{available.length}</span>
                <p>questão(ões) disponíveis nesta seleção</p>
              </div>
              <Button onClick={begin} disabled={!available.length}>
                <Zap size={15} /> Iniciar avaliação <ArrowRight size={15} />
              </Button>
            </Card>
            <Card className="quiz-history-card">
              <SectionHeading
                eyebrow="REGISTRO PESSOAL"
                title="Últimos resultados"
              />
              <div className="quiz-result-stack">
                {state.quizAttempts
                  .slice(-5)
                  .reverse()
                  .map((attempt, i) => (
                    <div className="quiz-result-row" key={attempt.id}>
                      <span className="result-badge">
                        {String(state.quizAttempts.length - i).padStart(2, "0")}
                      </span>
                      <div>
                        <strong>
                          {new Intl.DateTimeFormat("pt-BR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(attempt.date))}
                        </strong>
                        <small>
                          {attempt.total} questões ·{" "}
                          {attempt.missedTopicIds.length} tópico(s) sugeridos
                          para revisão
                        </small>
                      </div>
                      <span
                        className={`result-score ${attempt.score / Math.max(attempt.total, 1) >= 0.7 ? "score-good" : "score-review"}`}
                      >
                        {Math.round(
                          (attempt.score / Math.max(attempt.total, 1)) * 100
                        )}
                        %
                      </span>
                    </div>
                  ))}
                {!state.quizAttempts.length && (
                  <EmptyState title="Sem resultados ainda">
                    Ao concluir uma sessão, a pontuação ficará registrada aqui.
                  </EmptyState>
                )}
              </div>
            </Card>
          </div>
          <div className="quiz-types-strip">
            <span>FORMATO DAS QUESTÕES</span>
            {[
              "Multiple choice",
              "True or False",
              "Scenario-based question",
              "Technical definition",
              "System comparison",
              "Fault diagnosis",
            ].map(value => (
              <span key={value}>{value}</span>
            ))}
          </div>
        </>
      )}
      {mode === "playing" && question && (
        <Card className="quiz-player">
          <div className="quiz-player-top">
            <div>
              <p className="eyebrow">
                {question.type.toUpperCase()} <i>·</i>{" "}
                {question.difficulty.toUpperCase()}
              </p>
              <h2>{question.topic}</h2>
            </div>
            <span className="question-counter">
              {String(index + 1).padStart(2, "0")} <i>/</i>{" "}
              {String(deck.length).padStart(2, "0")}
            </span>
          </div>
          <ProgressBar
            value={((index + (answered ? 1 : 0)) / deck.length) * 100}
          />
          <div className="quiz-question">
            <span className="question-label">
              QUESTÃO {String(index + 1).padStart(2, "0")}
            </span>
            <h3>{question.prompt}</h3>
            <div className="answer-options">
              {question.options.map((option, optionIndex) => {
                const wasSelected = answered
                  ? answers[index] === optionIndex
                  : selected === optionIndex;
                const isCorrect = answered && optionIndex === question.answer;
                return (
                  <button
                    key={option}
                    className={`answer-option ${wasSelected ? "selected" : ""} ${isCorrect ? "correct" : ""} ${answered && wasSelected && !isCorrect ? "incorrect" : ""}`}
                    onClick={() => choose(optionIndex)}
                    disabled={answered}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span>{option}</span>
                    {isCorrect && <CheckCircle2 size={17} />}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div
                className={`answer-feedback ${answers[index] === question.answer ? "feedback-correct" : "feedback-review"}`}
              >
                <span>
                  {answers[index] === question.answer ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                </span>
                <div>
                  <strong>
                    {answers[index] === question.answer
                      ? "Resposta correta"
                      : "Vale revisar este ponto"}
                  </strong>
                  <p>{question.explanation}</p>
                </div>
              </div>
            )}
          </div>
          <div className="quiz-player-footer">
            <span>{correctSoFar} acerto(s) registrados nesta sessão</span>
            {answered ? (
              <Button
                onClick={() => {
                  if (index + 1 < deck.length) {
                    setIndex(value => value + 1);
                    setSelected(null);
                  } else finish();
                }}
              >
                {index + 1 < deck.length ? (
                  <>
                    Próxima questão <ArrowRight size={15} />
                  </>
                ) : (
                  <>
                    Ver resultado <Check size={15} />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={checkAnswer} disabled={selected === null}>
                Conferir resposta <ArrowRight size={15} />
              </Button>
            )}
          </div>
          <p className="quiz-safety-note">
            <ShieldCheck size={13} /> Não use este resultado como autorização ou
            evidência de competência para operar equipamentos.
          </p>
        </Card>
      )}
      {mode === "results" && lastAttempt && (
        <Card className="quiz-final-card">
          <div className="final-score-ring">
            <span>RESULTADO</span>
            <strong>
              {Math.round((correctSoFar / Math.max(deck.length, 1)) * 100)}
              <small>%</small>
            </strong>
            <i>
              {correctSoFar} de {deck.length} respostas
            </i>
          </div>
          <div className="final-score-copy">
            <p className="eyebrow">SESSÃO CONCLUÍDA</p>
            <h2>
              {correctSoFar / Math.max(deck.length, 1) >= 0.7
                ? "Base consolidada. Continue revisando."
                : "Um bom ponto de partida para a próxima revisão."}
            </h2>
            <p>
              Confira as explicações, observe os tópicos sinalizados e escolha
              uma revisão. A pontuação representa somente este exercício.
            </p>
            <div className="missed-topic-pills">
              {lastAttempt.missedTopicIds.length ? (
                lastAttempt.missedTopicIds.map(id => (
                  <span key={id}>
                    <AlertTriangle size={12} />{" "}
                    {TOPICS.find(topic => topic.id === id)?.name}
                  </span>
                ))
              ) : (
                <span>
                  <CheckCircle2 size={13} /> Nenhum erro registrado nesta sessão
                </span>
              )}
            </div>
            <div className="final-actions">
              <Button onClick={restart}>
                <RotateCcw size={15} /> Nova avaliação
              </Button>
              <Button variant="secondary" onClick={() => window.print()}>
                Imprimir resumo
              </Button>
            </div>
          </div>
          <div className="answer-review-grid">
            {deck.map((item, i) => (
              <div
                className={`answer-review-row ${answers[i] === item.answer ? "right" : "wrong"}`}
                key={item.id}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{item.topic}</strong>
                  <small>{item.prompt}</small>
                  <p>{item.explanation}</p>
                </div>
                {answers[i] === item.answer ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function ScenarioDetail({ id }: { id: string }) {
  const { state, saveScenarioAnswer } = useStudy();
  const scenario = SCENARIOS.find(item => item.id === id)!;
  const response = state.scenarioResponses[id]?.answer ?? "";
  const submitted = Boolean(state.scenarioResponses[id]?.completedAt);
  const [answer, setAnswer] = useState(response);
  return (
    <Card className="scenario-detail">
      <div className="scenario-detail-header">
        <div>
          <span className="scenario-code">
            SIMULAÇÃO HIPOTÉTICA · {scenario.system.toUpperCase()}
          </span>
          <h2>{scenario.title}</h2>
        </div>
        <span className="hypothetical-tag">
          <ShieldCheck size={13} /> EDUCATIVO
        </span>
      </div>
      <p className="scenario-description">{scenario.description}</p>
      <div className="scenario-context-grid">
        <div className="scenario-fact-box">
          <span className="eyebrow">CONTEXTO OPERACIONAL</span>
          <p>{scenario.context}</p>
          <span className="eyebrow">SISTEMA ENVOLVIDO</span>
          <strong>{scenario.system}</strong>
        </div>
        <div className="scenario-fact-box">
          <span className="eyebrow">SINTOMAS OBSERVADOS</span>
          <ul>
            {scenario.symptoms.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <span className="eyebrow">INFORMAÇÕES DISPONÍVEIS</span>
          <ul>
            {scenario.information.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="scenario-questions">
        <span className="eyebrow">RACIOCÍNIO TÉCNICO</span>
        {scenario.questions.map((question, index) => (
          <p key={question}>
            <span>{index + 1}</span>
            {question}
          </p>
        ))}
      </div>
      <label className="field-label">
        Sua resposta / notas
        <textarea
          className="field-control field-textarea"
          value={answer}
          onChange={event => setAnswer(event.target.value)}
          rows={5}
          placeholder="Separe fatos, incertezas, perguntas e comunicação segura..."
        />
      </label>
      <div className="scenario-submit-row">
        <span>
          <BookmarkCheck size={14} />{" "}
          {submitted
            ? "Resposta registrada"
            : "Resposta salva no navegador ao concluir"}
        </span>
        <Button
          onClick={() => saveScenarioAnswer(id, answer, true)}
          disabled={!answer.trim()}
        >
          <Check size={15} /> Registrar resposta
        </Button>
      </div>
      {submitted && (
        <div className="scenario-feedback-grid">
          <div className="scenario-feedback-box">
            <span className="eyebrow">
              <Lightbulb size={13} /> FEEDBACK TÉCNICO
            </span>
            <p>{scenario.feedback}</p>
            <span className="eyebrow">CRITÉRIOS GERAIS DE ESCALONAMENTO</span>
            <ul>
              {scenario.escalation.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="scenario-safety-box">
            <span className="eyebrow">
              <ShieldAlert size={13} /> SEGURANÇA EM PRIMEIRO LUGAR
            </span>
            <ul>
              {scenario.safety.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <span className="eyebrow">VOCABULÁRIO DO CENÁRIO</span>
            {scenario.vocabulary.map(item => (
              <p className="scenario-vocab" key={item.term}>
                <strong>{item.term}</strong>
                <span>{item.meaning}</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export function ScenariosPage() {
  const { state } = useStudy();
  const [active, setActive] = useState(SCENARIOS[0].id);
  const completed = Object.values(state.scenarioResponses).filter(
    item => item.completedAt
  ).length;
  return (
    <div className="page-stack">
      <PageHeader
        number="05 / 12"
        title="Cenários de falha"
        description="Pratique observação, priorização, registro e comunicação em casos hipotéticos. Não são procedimentos de operação."
        action={
          <span className="scenario-count">
            <ShieldCheck size={15} /> {completed} concluído(s)
          </span>
        }
      />
      <div className="safety-callout">
        <ShieldAlert size={19} />
        <div>
          <strong>Exercício educacional. Não realize manobras.</strong>
          <p>
            O aplicativo não instrui intervenções em sistemas críticos. Em
            situação real, siga SOP/MOP/EOP, avaliação de risco e equipe
            autorizada.
          </p>
        </div>
      </div>
      <div className="scenario-workspace">
        <div className="scenario-list-panel">
          <span className="eyebrow">BIBLIOTECA DE CENÁRIOS</span>
          {SCENARIOS.map((scenario, index) => (
            <button
              type="button"
              className={`scenario-list-item ${active === scenario.id ? "active" : ""}`}
              key={scenario.id}
              onClick={() => setActive(scenario.id)}
            >
              <span className="scenario-list-index">0{index + 1}</span>
              <span>
                <strong>{scenario.title}</strong>
                <small>{scenario.system}</small>
              </span>
              {state.scenarioResponses[scenario.id]?.completedAt && (
                <CheckCircle2 size={16} />
              )}
            </button>
          ))}
        </div>
        <ScenarioDetail id={active} />
      </div>
    </div>
  );
}

export function TutorPage() {
  const { state, saveTutorMessages } = useStudy();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const mutation = trpc.tutor.ask.useMutation();
  const storedMessages = state.tutorMessages;
  const messages = storedMessages.length
    ? storedMessages
    : [
        {
          id: "welcome",
          role: "assistant" as const,
          text: "Olá. Sou seu tutor técnico para revisão de infraestrutura crítica. Que conceito, alarme hipotético ou pergunta de entrevista você quer explorar?",
          at: new Date().toISOString(),
        },
      ];
  const send = async (value = text) => {
    const question = value.trim();
    if (!question || mutation.isPending) return;
    const userMessage = {
      id: newId("chat"),
      role: "user" as const,
      text: question,
      at: new Date().toISOString(),
    };
    const thread = [...storedMessages, userMessage];
    saveTutorMessages(thread);
    setText("");
    setError("");
    setOffline(false);
    try {
      const result = await mutation.mutateAsync({
        mode: "tutor",
        messages: thread.slice(-10).map(message => ({
          role: message.role,
          content: message.text.slice(0, 2500),
        })),
      });
      setOffline(result.offline === true);
      saveTutorMessages([
        ...thread,
        {
          id: newId("chat"),
          role: "assistant",
          text: result.text,
          at: new Date().toISOString(),
        },
      ]);
    } catch {
      // Sem backend (ex.: deploy estático) ou IA indisponível: responde
      // localmente no navegador, com os mesmos limites de segurança.
      const local = buildOfflineTutorReply("tutor", question);
      setOffline(true);
      setError("");
      saveTutorMessages([
        ...thread,
        {
          id: newId("chat"),
          role: "assistant",
          text: local,
          at: new Date().toISOString(),
        },
      ]);
    }
  };
  return (
    <div className="page-stack">
      <PageHeader
        number="06 / 12"
        title="Tutor técnico com IA"
        description="Explore conceitos, compare sistemas e pratique explicações — com respostas calibradas ao seu nível e limites de segurança explícitos."
        action={
          <span className="ai-status-tag">
            <span /> IA GERENCIADA
          </span>
        }
      />
      <div className="tutor-disclaimer">
        <ShieldCheck size={17} />
        <p>
          Conversa vinculada ao seu espaço local. Evite compartilhar dados
          confidenciais do seu empregador, credenciais ou detalhes
          identificáveis de sites. Respostas não substituem documentação ou
          procedimentos autorizados.
        </p>
      </div>
      {offline && (
        <div className="tutor-disclaimer" role="status">
          <AlertTriangle size={17} />
          <p>
            Serviço de IA indisponível — respostas geradas localmente em modo
            offline. O estudo continua, com os mesmos limites de segurança.
          </p>
        </div>
      )}
      <Card className="tutor-card">
        <div className="tutor-topbar">
          <div className="tutor-avatar">
            <Sparkles size={18} />
          </div>
          <div>
            <strong>Assistente de revisão CFT</strong>
            <small>Português brasileiro · termos técnicos em inglês</small>
          </div>
          <span className="tutor-live">
            <i /> pronto
          </span>
        </div>
        <div className="tutor-messages" aria-live="polite">
          {messages.map(message => (
            <div
              className={`chat-row ${message.role === "user" ? "chat-user" : "chat-assistant"}`}
              key={message.id}
            >
              <span className="chat-avatar">
                {message.role === "user" ? "VOCÊ" : <Sparkles size={14} />}
              </span>
              <div className="chat-bubble">
                <div className="chat-bubble-top">
                  <strong>
                    {message.role === "user" ? "Sua pergunta" : "Tutor técnico"}
                  </strong>
                  <time>
                    {new Intl.DateTimeFormat("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(message.at))}
                  </time>
                </div>
                <p>{message.text}</p>
              </div>
            </div>
          ))}
          {mutation.isPending && (
            <div className="chat-row chat-assistant">
              <span className="chat-avatar">
                <Sparkles size={14} />
              </span>
              <div className="chat-bubble typing-bubble">
                <LoaderCircle size={15} className="spin" /> Pensando na sua
                pergunta…
              </div>
            </div>
          )}
        </div>
        {error && (
          <div className="tutor-error">
            <AlertTriangle size={15} />
            <span>{error}</span>
            <button onClick={() => setError("")}>Dispensar</button>
          </div>
        )}
        <div className="quick-prompts">
          <span>SUGESTÕES</span>
          {[
            "Compare N+1 e 2N, incluindo limitações de cada conceito.",
            "Explique, em nível intermediário, a diferença entre CRAC e CRAH.",
            "Ajude-me a estruturar uma resposta em inglês sobre shift handover.",
          ].map(item => (
            <button
              key={item}
              onClick={() => {
                setText(item);
                void send(item);
              }}
              disabled={mutation.isPending}
            >
              {item}
              <ArrowRight size={12} />
            </button>
          ))}
        </div>
        <form
          className="tutor-composer"
          onSubmit={event => {
            event.preventDefault();
            void send();
          }}
        >
          <textarea
            className="field-control"
            value={text}
            onChange={event => setText(event.target.value)}
            onKeyDown={event => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
            rows={2}
            maxLength={2500}
            placeholder="Faça uma pergunta técnica ou de entrevista..."
            aria-label="Escreva sua pergunta para o tutor"
          />
          <div className="composer-footer">
            <span>
              Enter para enviar · Shift+Enter para nova linha · máximo 2.500
              caracteres
            </span>
            <Button type="submit" disabled={!text.trim() || mutation.isPending}>
              <Send size={15} /> Enviar
            </Button>
          </div>
        </form>
        <div className="tutor-terms">
          <span>
            <ShieldCheck size={13} /> segurança em primeiro lugar
          </span>
          <span>
            <MessageCircle size={13} /> não envia suas notas automaticamente
          </span>
        </div>
      </Card>
    </div>
  );
}
