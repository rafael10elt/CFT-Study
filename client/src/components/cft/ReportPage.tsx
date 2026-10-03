import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  History,
  ShieldCheck,
  Target,
  Trophy,
} from "lucide-react";
import {
  INTERVIEW_QUESTIONS,
  SCENARIOS,
  TOPICS,
  VOCABULARY,
  WEEKS,
  type KnowledgeLevel,
} from "@/lib/study-data";
import { useStudy, type StudyState } from "@/lib/study-store";
import {
  Button,
  Card,
  EmptyState,
  MetricCard,
  PageHeader,
  ProgressBar,
  StatusPill,
  formattedDate,
} from "./shared";

const levelPercent: Record<KnowledgeLevel, number> = {
  Beginner: 20,
  Basic: 40,
  Intermediate: 60,
  Advanced: 80,
  "Practical experience": 90,
};
const levelLabel = (level?: KnowledgeLevel) =>
  level
    ? {
        Beginner: "Iniciante",
        Basic: "Básico",
        Intermediate: "Intermediário",
        Advanced: "Avançado",
        "Practical experience": "Experiência prática (autoavaliada)",
      }[level]
    : "Sem autoavaliação";
const eventLabel = (kind: string) =>
  ({
    status: "Status",
    reorder: "Reorganização",
    reschedule: "Reagendamento",
    notes: "Anotação",
    time: "Tempo",
  })[kind] ?? kind;

function downloadReport(content: string, state: StudyState) {
  const details = [
    "## Dias concluídos",
    state.days
      .filter(day => day.status === "Completed")
      .map(
        day =>
          `- Dia ${day.day}: ${day.title} — ${day.actualMinutes ?? 0} min informados`
      )
      .join("\n") || "- Nenhum dia concluído registrado.",
    "## Respostas de entrevista praticadas",
    Object.entries(state.interviews)
      .filter(([, record]) => record.answer.trim())
      .map(([id, record]) => {
        const question = INTERVIEW_QUESTIONS.find(item => item.id === id);
        return `### ${question?.category ?? "Entrevista"}: ${question?.question ?? "Pergunta removida do catálogo"}\n${record.answer}${record.feedback ? `\n\nFeedback salvo: ${record.feedback}` : ""}`;
      })
      .join("\n\n") || "- Nenhuma resposta registrada.",
    "## Vocabulário avaliado",
    Object.entries(state.vocabularyLevels)
      .map(([id, level]) => {
        const word = VOCABULARY.find(item => item.id === id);
        return `- ${word?.term ?? "Termo removido do catálogo"} — ${word?.meaning ?? ""}; status: ${level}`;
      })
      .join("\n") || "- Nenhum termo avaliado.",
    "## Cenários concluídos",
    Object.entries(state.scenarioResponses)
      .filter(([, record]) => record.completedAt)
      .map(([id, record]) => {
        const scenario = SCENARIOS.find(item => item.id === id);
        return `### ${scenario?.title ?? "Cenário removido do catálogo"}\nResposta registrada: ${record.answer || "(sem resposta escrita)"}`;
      })
      .join("\n\n") || "- Nenhum cenário concluído.",
    "## Histórico completo de alterações",
    state.activityHistory
      .map(
        event =>
          `- ${event.at.slice(0, 16).replace("T", " ")} — Dia ${event.dayNumber}: ${eventLabel(event.kind)} — ${event.detail}`
      )
      .join("\n") || "- Sem alterações registradas.",
    "Este relatório é um registro local. Não valida competência, experiência prática, certificação ou empregabilidade.",
  ].join("\n\n");
  const url = URL.createObjectURL(
    new Blob([`${content}\n\n${details}`], {
      type: "text/markdown;charset=utf-8",
    })
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `relatorio-cft-${new Date().toISOString().slice(0, 10)}.md`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ReportPage() {
  const { state } = useStudy();
  const completedDays = state.days.filter(
    item => item.status === "Completed"
  ).length;
  const inProgressDays = state.days.filter(
    item => item.status === "In progress"
  ).length;
  const skippedDays = state.days.filter(
    item => item.status === "Skipped"
  ).length;
  const plannedHours = state.plannedHoursPerDay * state.days.length;
  const studyMinutes =
    state.days.reduce(
      (total, item) => total + Math.max(0, Number(item.actualMinutes) || 0),
      0
    ) +
    state.courses.reduce(
      (total, course) => total + (Number(course.actualHours) || 0) * 60,
      0
    );
  const quizAverage = state.quizAttempts.length
    ? Math.round(
        state.quizAttempts.reduce(
          (total, attempt) =>
            total + (attempt.score / Math.max(attempt.total, 1)) * 100,
          0
        ) / state.quizAttempts.length
      )
    : null;
  const completedReviews = state.reviews.filter(item => item.completedAt);
  const pendingReviews = state.reviews
    .filter(item => !item.completedAt)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const completedScenarios = Object.entries(state.scenarioResponses).filter(
    ([, item]) => item.completedAt
  );
  const interviewEntries = Object.entries(state.interviews).filter(([, item]) =>
    item.answer.trim()
  );
  const ratedWords = Object.keys(state.vocabularyLevels).length;
  const topicRows = TOPICS.map(topic => {
    const knowledge = state.knowledge[topic.id];
    const quizResults = state.quizAttempts
      .map(item => item.topicScores[topic.id])
      .filter((score): score is NonNullable<typeof score> => Boolean(score));
    const quizScore = quizResults.length
      ? Math.round(
          quizResults.reduce(
            (total, score) =>
              total + (score.correct / Math.max(score.total, 1)) * 100,
            0
          ) / quizResults.length
        )
      : null;
    return {
      id: topic.id,
      name: topic.name.replace(" Systems", ""),
      initial: knowledge ? levelPercent[knowledge.initialLevel] : null,
      current: knowledge ? levelPercent[knowledge.level] : null,
      currentLevel: knowledge?.level,
      quiz: quizScore,
      quizCount: quizResults.length,
    };
  });
  const chartRows = topicRows.filter(
    item => item.initial !== null || item.current !== null || item.quiz !== null
  );
  const difficulties = topicRows.filter(row => {
    const missedCount = state.quizAttempts.filter(attempt =>
      attempt.missedTopicIds.includes(row.id)
    ).length;
    const hasDue = pendingReviews.some(
      review =>
        review.topicId === row.id && new Date(review.dueAt) <= new Date()
    );
    return (
      row.currentLevel === "Beginner" ||
      row.currentLevel === "Basic" ||
      (row.quiz !== null && row.quiz < 65) ||
      missedCount > 0 ||
      hasDue
    );
  });
  const strengths = topicRows
    .filter(
      row =>
        row.currentLevel === "Advanced" ||
        row.currentLevel === "Practical experience" ||
        (row.quiz !== null && row.quiz >= 80) ||
        (row.initial !== null &&
          row.current !== null &&
          row.current > row.initial)
    )
    .map(row => row.name);
  const weekRows = WEEKS.map(week => {
    const days = state.days.filter(item => item.week === week.number);
    const done = days.filter(item => item.status === "Completed").length;
    const minutes = days.reduce(
      (total, day) => total + (Number(day.actualMinutes) || 0),
      0
    );
    return {
      ...week,
      done,
      total: days.length,
      progress: Math.round((done / Math.max(days.length, 1)) * 100),
      hours: minutes / 60,
    };
  });
  const futureRecommendations = [
    ...difficulties
      .slice(0, 3)
      .map(
        item =>
          `Revisar ${item.name}: ${item.currentLevel ? `autoavaliação atual ${levelLabel(item.currentLevel)}` : "lacuna sinalizada por respostas ou revisão pendente"}${item.quiz !== null ? `; desempenho médio registrado de ${item.quiz}%` : ""}.`
      ),
    ...(!interviewEntries.length && (quizAverage ?? 0) >= 70
      ? [
          "Praticar explicações técnicas em inglês: há resultados de quiz registrados e ainda não há respostas de entrevista salvas.",
        ]
      : []),
    ...pendingReviews
      .slice(0, 2)
      .map(item => `Revisar ${item.topic}; motivo registrado: ${item.reason}`),
  ]
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 5);

  const reportMarkdown = `# Relatório de aprendizagem — CFT Study Companion\n\nPeríodo: ${state.startedOn} a ${new Date().toISOString().slice(0, 10)}\n\n## Resumo geral\n- Dias planejados: ${state.days.length}\n- Dias concluídos: ${completedDays}; em andamento: ${inProgressDays}; pulados: ${skippedDays}\n- Horas planejadas: ${plannedHours.toFixed(1)} h\n- Tempo informado: ${(studyMinutes / 60).toFixed(1)} h\n- Cursos/conteúdos acompanhados: ${state.courses.length} (${state.courses.filter(item => item.status === "In progress").length} iniciados; ${state.courses.filter(item => item.status === "Completed").length} concluídos)\n- Quizzes: ${state.quizAttempts.length}; média: ${quizAverage === null ? "sem dados" : `${quizAverage}%`}\n- Revisões: ${completedReviews.length} concluídas; ${pendingReviews.length} pendentes\n- Cenários hipotéticos concluídos: ${completedScenarios.length}\n- Respostas de entrevista registradas: ${interviewEntries.length}\n- Termos de vocabulário avaliados: ${ratedWords}\n\n## Evolução por assunto (autoavaliação distinta de quiz)\n${topicRows.map(row => `- ${row.name}: autoavaliação inicial ${levelLabel(state.knowledge[row.id]?.initialLevel)}; atual ${levelLabel(row.currentLevel)}; quiz ${row.quiz === null ? "sem dados" : `${row.quiz}% (${row.quizCount} resultado(s))`}`).join("\n")}\n\n## Conteúdos/cursos acompanhados\n${state.courses.map(course => `- ${course.title} — ${course.platform}; status: ${course.status}; horas informadas: ${course.actualHours}${course.officialDetails ? `; detalhes: ${course.officialDetails}` : ""}`).join("\n")}\n\n## Revisões e atividades recentes\n${
    state.activityHistory
      .slice(-15)
      .reverse()
      .map(
        event =>
          `- ${event.at.slice(0, 16).replace("T", " ")} — Dia ${event.dayNumber}: ${eventLabel(event.kind)} — ${event.detail}`
      )
      .join("\n") || "- Sem eventos de atividade registrados."
  }\n\n## Pontos fortes registrados\n${strengths.map(item => `- ${item}`).join("\n") || "- Ainda não há registros suficientes."}\n\n## Pontos a desenvolver\n${difficulties.map(item => `- ${item.name}`).join("\n") || "- Nenhuma lacuna sinalizada nos dados disponíveis."}\n\n## Prática e próximos passos\n- Cenários concluídos: ${completedScenarios.length}; entrevistas praticadas: ${interviewEntries.length}; termos avaliados: ${ratedWords}.\n${futureRecommendations.map(item => `- ${item}`).join("\n") || "- Continue conforme os próximos dias do plano e atualize seus registros."}\n\nEste relatório descreve somente dados registrados neste navegador. Não valida experiência prática nem certifica competência operacional e não garante contratação/aprovação.`;

  return (
    <div className="page-stack">
      <PageHeader
        number="11 / 12"
        title="Relatório de progresso"
        description="Uma fotografia factual do que ficou registrado — estudo, revisão, desempenho e autoavaliação permanecem categorias distintas."
        action={
          <Button
            variant="secondary"
            onClick={() => downloadReport(reportMarkdown, state)}
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
            A data de início é editável; todas as métricas vêm dos registros
            deste navegador.
          </small>
        </div>
        <div className="report-plan-progress">
          <strong>
            {Math.round((completedDays / Math.max(state.days.length, 1)) * 100)}
            <small>%</small>
          </strong>
          <span>do plano concluído</span>
        </div>
      </div>
      <div className="resource-metrics">
        <MetricCard
          icon={<CalendarDays size={17} />}
          label="Dias concluídos"
          value={`${completedDays} / ${state.days.length}`}
          detail={`${inProgressDays} em andamento · ${skippedDays} pulados`}
          tone="mint"
        />
        <MetricCard
          icon={<Clock3 size={17} />}
          label="Tempo registrado"
          value={`${(studyMinutes / 60).toFixed(1)} h`}
          detail={`${plannedHours.toFixed(1)} h planejadas`}
          tone="blue"
        />
        <MetricCard
          icon={<Trophy size={17} />}
          label="Média dos quizzes"
          value={quizAverage === null ? "—" : `${quizAverage}%`}
          detail={`${state.quizAttempts.length} avaliações registradas`}
          tone="violet"
        />
        <MetricCard
          icon={<Target size={17} />}
          label="Reforço e prática"
          value={`${completedReviews.length} / ${completedScenarios.length}`}
          detail="revisões concluídas / cenários"
          tone="amber"
        />
      </div>
      <Card className="report-week-card">
        <div className="card-title-row">
          <div>
            <p className="eyebrow">ACOMPANHAMENTO POR PERÍODO</p>
            <h3>Ritmo das quatro semanas</h3>
          </div>
          <BarChart3 size={18} />
        </div>
        <div className="report-week-list">
          {weekRows.map(week => (
            <div className="report-week-row" key={week.number}>
              <div className="report-week-name">
                <strong>Semana {week.number}</strong>
                <span>{week.title}</span>
              </div>
              <ProgressBar
                value={week.progress}
                tone={week.accent as "mint" | "blue" | "amber" | "violet"}
              />
              <div className="report-week-stat">
                {week.done}/{week.total}
                <small>{week.hours.toFixed(1)} h informadas</small>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="report-columns">
        <Card className="report-chart-card">
          <div className="card-title-row">
            <div>
              <p className="eyebrow">EVOLUÇÃO POR ÁREA</p>
              <h3>Autoavaliação inicial × atual × quiz</h3>
            </div>
            <span className="report-legend">
              <i className="legend-initial" /> Inicial{" "}
              <i className="legend-current" /> Atual{" "}
              <i className="legend-quiz" /> Quiz
            </span>
          </div>
          <p className="report-caption">
            Faixas aproximadas para visualizar a autoavaliação. O quiz é outra
            medida; nenhuma barra representa certificação ou validação
            independente.
          </p>
          {chartRows.length ? (
            <div className="report-chart-wrap">
              <ResponsiveContainer
                width="100%"
                height={Math.max(330, chartRows.length * 38)}
              >
                <BarChart
                  data={chartRows}
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
                    width={158}
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
                      name === "initial"
                        ? "Autoavaliação inicial"
                        : name === "current"
                          ? "Autoavaliação atual"
                          : "Desempenho em quiz",
                    ]}
                  />
                  <Bar
                    dataKey="initial"
                    name="Autoavaliação inicial"
                    fill="#7790a2"
                    radius={[0, 4, 4, 0]}
                    barSize={7}
                  />
                  <Bar
                    dataKey="current"
                    name="Autoavaliação atual"
                    fill="#a89af5"
                    radius={[0, 4, 4, 0]}
                    barSize={7}
                  />
                  <Bar
                    dataKey="quiz"
                    name="Desempenho em quiz"
                    fill="#35D6C3"
                    radius={[0, 4, 4, 0]}
                    barSize={7}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Ainda não há dados para comparar">
              Registre autoavaliações e conclua quizzes para montar esta
              visualização.
            </EmptyState>
          )}
          <div className="report-separation-note">
            <ShieldCheck size={15} />
            <p>
              “Experiência prática” é um nível declarado pelo estudante; o app
              não faz validação independente de experiência nem competência.
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
                Sem evidências suficientes ainda. Esta lista se baseia somente
                nos registros disponíveis.
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
                  <li key={item.id}>
                    <AlertCircle size={14} /> {item.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="report-empty">
                Nenhuma lacuna foi sinalizada pelos dados registrados.
              </p>
            )}
          </Card>
          <Card className="report-list-card">
            <span className="eyebrow">
              <BriefcaseBusiness size={13} /> ENTREVISTAS E IDIOMA
            </span>
            <div className="report-mini-grid">
              <div>
                <strong>{interviewEntries.length}</strong>
                <span>respostas registradas</span>
              </div>
              <div>
                <strong>{ratedWords}</strong>
                <span>termos avaliados</span>
              </div>
              <div>
                <strong>{completedScenarios.length}</strong>
                <span>cenários concluídos</span>
              </div>
            </div>
            <p className="report-caption">
              {interviewEntries
                .slice(-4)
                .map(
                  ([id]) => TOPICS.find(topic => topic.id === id)?.name ?? id
                )
                .join(" · ")}
            </p>
          </Card>
          <Card className="report-list-card">
            <span className="eyebrow">
              <CalendarDays size={13} /> PRÓXIMAS REVISÕES
            </span>
            {pendingReviews.length ? (
              pendingReviews.slice(0, 4).map(item => (
                <div key={item.id} className="report-review-row">
                  <span>
                    {item.topic}
                    <small>{item.reason}</small>
                  </span>
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
      <Card className="report-course-card">
        <div className="card-title-row">
          <div>
            <p className="eyebrow">
              <BookOpen size={13} /> CURSOS E CONTEÚDOS ACOMPANHADOS
            </p>
            <h3>{state.courses.length} item(ns) no seu registro</h3>
          </div>
        </div>
        {state.courses.length ? (
          <div className="report-course-list">
            {state.courses.map(item => (
              <div key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <small>
                    {item.platform} · {item.topic}
                  </small>
                </div>
                <StatusPill status={item.status} />
                <span>{item.actualHours.toFixed(1)} h informadas</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sem conteúdos acompanhados">
            Adicione um curso na área de Cursos para incluí-lo neste relatório.
          </EmptyState>
        )}
      </Card>
      <Card className="report-practice-card">
        <div className="card-title-row">
          <div>
            <p className="eyebrow">PRÁTICA REGISTRADA</p>
            <h3>Entrevistas, vocabulário e cenários</h3>
          </div>
          <span>
            {interviewEntries.length} entrevista(s) · {ratedWords} termo(s) ·{" "}
            {completedScenarios.length} cenário(s)
          </span>
        </div>
        <div className="report-practice-grid">
          <section>
            <h4>Respostas de entrevista em inglês</h4>
            {interviewEntries.length ? (
              interviewEntries
                .slice(-4)
                .reverse()
                .map(([id, record]) => {
                  const question = INTERVIEW_QUESTIONS.find(
                    item => item.id === id
                  );
                  return (
                    <article className="report-practice-item" key={id}>
                      <strong>
                        {question?.question ?? "Pergunta removida do catálogo"}
                      </strong>
                      <p>{record.answer}</p>
                      <small>
                        {question?.category ?? "Categoria não registrada"} ·
                        praticada em{" "}
                        {formattedDate(record.practicedAt, {
                          day: "numeric",
                          month: "short",
                        })}
                      </small>
                    </article>
                  );
                })
            ) : (
              <p className="report-empty">
                Nenhuma resposta de entrevista salva.
              </p>
            )}
          </section>
          <section>
            <h4>Vocabulário avaliado</h4>
            {Object.entries(state.vocabularyLevels).length ? (
              <ul className="report-vocabulary-list">
                {Object.entries(state.vocabularyLevels).map(([id, level]) => {
                  const word = VOCABULARY.find(item => item.id === id);
                  return (
                    <li key={id}>
                      <strong>{word?.term ?? "Termo removido"}</strong>
                      <span>{word?.meaning ?? ""}</span>
                      <StatusPill status={level} />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="report-empty">Nenhum termo avaliado.</p>
            )}
          </section>
          <section>
            <h4>Cenários concluídos</h4>
            {completedScenarios.length ? (
              completedScenarios.map(([id, record]) => {
                const scenario = SCENARIOS.find(item => item.id === id);
                return (
                  <article className="report-practice-item" key={id}>
                    <strong>
                      {scenario?.title ?? "Cenário removido do catálogo"}
                    </strong>
                    <p>{record.answer || "Sem resposta escrita registrada."}</p>
                    <small>
                      {scenario?.system ?? "Sistema não registrado"}
                    </small>
                  </article>
                );
              })
            ) : (
              <p className="report-empty">Nenhum cenário concluído.</p>
            )}
          </section>
        </div>
      </Card>
      <Card className="report-history-card">
        <div className="card-title-row">
          <div>
            <p className="eyebrow">
              <History size={13} /> HISTÓRICO CONSULTÁVEL
            </p>
            <h3>Mudanças no plano e revisões</h3>
          </div>
          <span>{state.activityHistory.length} evento(s)</span>
        </div>
        {state.activityHistory.length ? (
          <div className="activity-history-list">
            {state.activityHistory
              .slice(-12)
              .reverse()
              .map(event => (
                <div key={event.id}>
                  <span className={`history-kind kind-${event.kind}`}>
                    {eventLabel(event.kind)}
                  </span>
                  <strong>Dia {event.dayNumber}</strong>
                  <span>{event.detail}</span>
                  <time>
                    {formattedDate(event.at, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              ))}
          </div>
        ) : (
          <EmptyState title="Nenhuma mudança registrada">
            Status, tempo informado, notas, reagendamentos e reorganizações
            aparecerão aqui sem apagar o histórico.
          </EmptyState>
        )}
      </Card>
      {completedReviews.length > 0 && (
        <Card className="report-history-card">
          <div className="card-title-row">
            <div>
              <p className="eyebrow">
                <CheckCircle2 size={13} /> HISTÓRICO DE REVISÃO
              </p>
              <h3>Revisões concluídas</h3>
            </div>
            <span>{completedReviews.length} registro(s)</span>
          </div>
          <div className="review-history-list">
            {completedReviews
              .slice(-8)
              .reverse()
              .map(item => (
                <div key={item.id}>
                  <strong>{item.topic}</strong>
                  <span>
                    {item.source} · dificuldade informada: {item.difficulty}
                  </span>
                  <time>
                    {item.completedAt
                      ? formattedDate(item.completedAt, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : ""}
                  </time>
                </div>
              ))}
          </div>
        </Card>
      )}
      {futureRecommendations.length > 0 && (
        <Card className="report-recommendations">
          <div className="card-title-row">
            <div>
              <p className="eyebrow">
                <ArrowRight size={13} /> RECOMENDAÇÕES EXPLICÁVEIS
              </p>
              <h3>Próximos passos sugeridos</h3>
            </div>
          </div>
          <ul>
            {futureRecommendations.map((item, index) => (
              <li key={`${index}-${item}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>
      )}
      <div className="report-disclaimer">
        <AlertCircle size={16} />
        <p>
          O relatório é factual e baseado somente no que você registrou.
          Conclusão de módulo, curso, quiz ou simulação não representa
          experiência prática, competência operacional formal, certificação nem
          empregabilidade garantida.
        </p>
      </div>
    </div>
  );
}
