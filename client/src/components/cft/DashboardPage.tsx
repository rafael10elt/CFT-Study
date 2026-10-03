import { useState } from "react";
import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Clock3,
  Flame,
  Gauge,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  Target,
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
import { TOPICS, WEEKS, STATUS_LABELS } from "@/lib/study-data";
import { useStudy, minutesStudied, type ReviewItem } from "@/lib/study-store";
import {
  Button,
  Card,
  MetricCard,
  PageHeader,
  ProgressBar,
  SectionHeading,
  StatusPill,
  formattedDate,
} from "./shared";

export function DashboardPage({
  navigate,
}: {
  navigate: (page: string) => void;
}) {
  const { state, completeReview, postponeReview, addReview } = useStudy();
  const [reviewDifficulties, setReviewDifficulties] = useState<
    Record<string, ReviewItem["difficulty"]>
  >({});
  const completedDays = state.days.filter(
    item => item.status === "Completed"
  ).length;
  const inProgressDays = state.days.filter(
    item => item.status === "In progress"
  ).length;
  const completedPercent = Math.round(
    (completedDays / Math.max(state.days.length, 1)) * 100
  );
  const studiedMinutes = minutesStudied(state);
  const plannedTotalHours = state.plannedHoursPerDay * state.days.length;
  const studiedHours = studiedMinutes / 60;
  const quizAverage = state.quizAttempts.length
    ? Math.round(
        state.quizAttempts.reduce(
          (sum, item) => sum + (item.score / Math.max(item.total, 1)) * 100,
          0
        ) / state.quizAttempts.length
      )
    : 0;
  const now = new Date();
  const dueReviews = state.reviews
    .filter(item => !item.completedAt && new Date(item.dueAt) <= now)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const queuedReviews = state.reviews.filter(
    item => !item.completedAt && new Date(item.dueAt) > now
  ).length;
  const nextDays = state.days
    .filter(item => item.status !== "Completed" && item.status !== "Skipped")
    .slice(0, 3);
  const currentDay =
    state.days.find(item => item.status === "In progress") ?? nextDays[0];
  const chartData = WEEKS.map(week => {
    const days = state.days.filter(item => item.week === week.number);
    return {
      semana: `S${week.number}`,
      label: week.title,
      progresso: Math.round(
        (days.filter(item => item.status === "Completed").length /
          Math.max(days.length, 1)) *
          100
      ),
      dias: days.length,
    };
  });
  const missedFor = (topicId: string) =>
    state.quizAttempts.filter(attempt =>
      attempt.missedTopicIds.includes(topicId)
    ).length;
  const interviewAnswers = Object.values(state.interviews).filter(item =>
    item.answer.trim()
  ).length;
  const adaptiveRecommendations: {
    id: string;
    title: string;
    reason: string;
    page: string;
    priority: number;
  }[] = [];
  const upsLevel = state.knowledge["ups-batteries"]?.level;
  if (upsLevel === "Advanced" || upsLevel === "Practical experience")
    adaptiveRecommendations.push({
      id: "ups-batteries",
      title: "UPS · arquitetura e falhas",
      reason: `Você declarou ${STATUS_LABELS[upsLevel].toLowerCase()}; aprofunde caminhos, redundância, modos e falhas em vez de repetir fundamentos.`,
      page: "plan",
      priority: 8,
    });
  const coolingLevel = state.knowledge.cooling?.level;
  if (
    (coolingLevel && ["Beginner", "Basic"].includes(coolingLevel)) ||
    missedFor("cooling") > 0
  )
    adaptiveRecommendations.push({
      id: "cooling",
      title: "Cooling · HVAC e airflow",
      reason: `Autoavaliação${coolingLevel ? ` ${STATUS_LABELS[coolingLevel].toLowerCase()}` : " pendente"}${missedFor("cooling") ? ` e ${missedFor("cooling")} erro(s) registrado(s)` : ""}; revisar HVAC, chillers, CRAC/CRAH e airflow.`,
      page: "plan",
      priority: 10 + missedFor("cooling"),
    });
  const bmsLevel = state.knowledge.bms?.level;
  if (
    (bmsLevel && ["Beginner", "Basic"].includes(bmsLevel)) ||
    missedFor("bms") > 0
  )
    adaptiveRecommendations.push({
      id: "bms",
      title: "BMS/EPMS · alarmes e sensores",
      reason: `Os registros${bmsLevel ? ` (${STATUS_LABELS[bmsLevel].toLowerCase()})` : ""}${missedFor("bms") ? ` incluem ${missedFor("bms")} erro(s)` : " indicam familiaridade ainda limitada"}; revisar sensores, telemetria e interpretação de dados.`,
      page: "plan",
      priority: 9 + missedFor("bms"),
    });
  const redundancyLevel = state.knowledge.redundancy?.level;
  if (redundancyLevel === "Beginner" || redundancyLevel === "Basic")
    adaptiveRecommendations.push({
      id: "redundancy",
      title: "Redundância · N+1 e 2N",
      reason: `Autoavaliação ${STATUS_LABELS[redundancyLevel].toLowerCase()}; consolidar N, N+1, 2N e dependências compartilhadas.`,
      page: "quizzes",
      priority: 9,
    });
  const safetyMisses = missedFor("safety");
  if (safetyMisses > 0)
    adaptiveRecommendations.push({
      id: "safety",
      title: "Segurança · LOTO e procedimentos",
      reason: `${safetyMisses} resposta(s) incorreta(s) registrada(s); priorizar LOTO, PPE, SOP, MOP, EOP e escalonamento.`,
      page: "plan",
      priority: 12 + safetyMisses,
    });
  if (quizAverage >= 70 && interviewAnswers < 2)
    adaptiveRecommendations.push({
      id: "incident-communication",
      title: "Comunicação técnica em inglês",
      reason: `Há média de quiz de ${quizAverage}% e ${interviewAnswers} resposta(s) de entrevista registrada(s); pratique explicar os mesmos conceitos em inglês.`,
      page: "interviews",
      priority: 7,
    });
  if (!adaptiveRecommendations.length) {
    adaptiveRecommendations.push(
      ...TOPICS.map(topic => {
        const level = state.knowledge[topic.id]?.level;
        const missed = missedFor(topic.id);
        const reason = missed
          ? `${missed} erro(s) registrado(s) em quizzes; confira a explicação antes de repetir.`
          : level
            ? `Autoavaliação registrada: ${STATUS_LABELS[level]}. Atualize o nível após a revisão.`
            : "Sem autoavaliação; estabelecer um nível ajuda a adaptar os exercícios.";
        return {
          id: topic.id,
          title: topic.name,
          reason,
          page: "knowledge",
          priority:
            (level && ["Beginner", "Basic"].includes(level) ? 2 : 0) +
            Math.min(missed, 3) +
            (!level ? 1 : 0),
        };
      }).sort((a, b) => b.priority - a.priority)
    );
  }
  const recommendations = adaptiveRecommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);

  return (
    <div className="page-stack">
      <PageHeader
        number="01 / 12"
        title="Seu centro de operações."
        description="Uma visão clara do que você já revisou, do que falta consolidar e do próximo passo — sem transformar simulação em certificação."
        action={
          <Button onClick={() => navigate("plan")}>
            <CalendarDays size={16} /> Abrir plano
          </Button>
        }
      />
      <div className="dashboard-banner">
        <div className="banner-orbit orbit-one" />
        <div className="banner-orbit orbit-two" />
        <div className="banner-content">
          <div className="banner-kicker">
            <span className="live-indicator" /> PLANO DE 30 DIAS{" "}
            <span className="banner-divider">/</span>{" "}
            {formattedDate(state.startedOn, {
              month: "long",
              year: "numeric",
            }).toUpperCase()}
          </div>
          <h2>
            Experiência na prática.
            <br />
            <span>Clareza na próxima resposta.</span>
          </h2>
          <p>Revisão orientada por evidências do seu próprio progresso.</p>
          <Button
            variant="secondary"
            onClick={() => navigate(currentDay ? "plan" : "topics")}
          >
            Continuar estudos <ArrowRight size={15} />
          </Button>
        </div>
        <div className="banner-stat">
          <strong>
            {completedPercent}
            <small>%</small>
          </strong>
          <ProgressBar value={completedPercent} />
          <span>
            {completedDays} de {state.days.length} dias concluídos
          </span>
        </div>
        <div className="banner-grid" />
      </div>
      <div className="metric-grid">
        <MetricCard
          icon={<CalendarDays size={18} />}
          label="Dias concluídos"
          value={`${completedDays} / ${state.days.length}`}
          detail={`${state.days.length - completedDays} dias em aberto`}
          tone="mint"
        />
        <MetricCard
          icon={<Clock3 size={18} />}
          label="Tempo de estudo"
          value={`${studiedHours.toFixed(1)} h`}
          detail={`${plannedTotalHours.toFixed(1)} h planejadas · ${inProgressDays} em andamento`}
          tone="blue"
        />
        <MetricCard
          icon={<Target size={18} />}
          label="Média dos quizzes"
          value={state.quizAttempts.length ? `${quizAverage}%` : "—"}
          detail={
            state.quizAttempts.length
              ? `${state.quizAttempts.length} avaliações realizadas`
              : "Ainda sem avaliação registrada"
          }
          tone="violet"
        />
        <MetricCard
          icon={<Activity size={18} />}
          label="Revisões pendentes"
          value={dueReviews.length}
          detail={`${queuedReviews} programadas para depois`}
          tone="amber"
        />
      </div>
      <div className="dashboard-columns">
        <Card className="chart-card">
          <div className="card-title-row">
            <div>
              <p className="eyebrow">RITMO DO PLANO</p>
              <h3>Progresso por semana</h3>
            </div>
            <span className="mini-stat">
              <span className="legend-dot" /> Concluído
            </span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -22, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 5"
                  vertical={false}
                  stroke="rgba(147,165,176,.13)"
                />
                <XAxis
                  dataKey="semana"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#93a6b1", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#70828d", fontSize: 11 }}
                  tickFormatter={value => `${value}%`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(53,214,195,.07)" }}
                  contentStyle={{
                    background: "#142129",
                    border: "1px solid rgba(167,194,201,.2)",
                    borderRadius: 12,
                    color: "#eaf3f2",
                  }}
                  formatter={value => [`${value}%`, "Concluído"]}
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload?.label ?? label
                  }
                />
                <Bar
                  dataKey="progresso"
                  fill="#35D6C3"
                  radius={[7, 7, 2, 2]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="week-legend">
            {WEEKS.map(week => (
              <div key={week.number}>
                <span className={`week-key ${week.accent}`} />{" "}
                <strong>Semana {week.number}</strong>
                <small>
                  {
                    state.days.filter(
                      item =>
                        item.week === week.number && item.status === "Completed"
                    ).length
                  }
                  /{state.days.filter(item => item.week === week.number).length}
                </small>
              </div>
            ))}
          </div>
        </Card>
        <Card className="next-card">
          <div className="card-title-row">
            <div>
              <p className="eyebrow">PRÓXIMO PASSO</p>
              <h3>Continue de onde parou</h3>
            </div>
            <span className="next-icon">
              <BookOpenCheck size={19} />
            </span>
          </div>
          {currentDay ? (
            <div className="next-activity">
              <div className="activity-day">
                DIA <strong>{String(currentDay.day).padStart(2, "0")}</strong>
                <span>SEMANA {currentDay.week}</span>
              </div>
              <div>
                <h4>{currentDay.title}</h4>
                <p>{currentDay.objective}</p>
                <div className="activity-tags">
                  {currentDay.topics.slice(0, 2).map(topic => (
                    <span key={topic}>{topic}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="all-done-state">
              <Sparkles size={21} />
              <p>
                Não há dias em aberto no cronograma. Seu histórico continua
                disponível no relatório.
              </p>
            </div>
          )}
          <div className="next-footer">
            <span>
              <Clock3 size={14} />{" "}
              {currentDay?.estimate ?? state.plannedHoursPerDay * 60} min
              estimados
            </span>
            <Button onClick={() => navigate("plan")}>
              Abrir atividade <ArrowRight size={14} />
            </Button>
          </div>
        </Card>
      </div>
      <div className="dashboard-columns lower-columns">
        <Card className="review-card">
          <div className="card-title-row">
            <div>
              <p className="eyebrow">REVISÃO INTELIGENTE</p>
              <h3>O que pede reforço</h3>
            </div>
            <span className="review-badge">
              <Flame size={14} /> {dueReviews.length} para hoje
            </span>
          </div>
          {dueReviews.length ? (
            <div className="review-list">
              {dueReviews.slice(0, 3).map(item => (
                <div className="review-row" key={item.id}>
                  <div className="review-copy">
                    <span className="review-marker">
                      <Lightbulb size={15} />
                    </span>
                    <div>
                      <strong>{item.topic}</strong>
                      <p>{item.reason}</p>
                    </div>
                  </div>
                  <div className="review-actions">
                    <label className="review-difficulty-label">
                      <span>Como foi?</span>
                      <select
                        className="review-difficulty-select"
                        value={reviewDifficulties[item.id] ?? item.difficulty}
                        onChange={event =>
                          setReviewDifficulties(previous => ({
                            ...previous,
                            [item.id]: event.target
                              .value as ReviewItem["difficulty"],
                          }))
                        }
                      >
                        <option value="fácil">Fácil</option>
                        <option value="médio">Médio</option>
                        <option value="difícil">Difícil</option>
                      </select>
                    </label>
                    <Button
                      variant="ghost"
                      onClick={() => postponeReview(item.id, 1)}
                      title="Adiar para amanhã"
                    >
                      Adiar
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        completeReview(
                          item.id,
                          reviewDifficulties[item.id] ?? item.difficulty
                        )
                      }
                    >
                      Revisado
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="ghost"
                className="text-link"
                onClick={() => navigate("report")}
              >
                Ver histórico de revisão <ArrowRight size={14} />
              </Button>
            </div>
          ) : (
            <div className="review-empty">
              <span>
                <Sparkles size={17} />
              </span>
              <div>
                <strong>Nenhuma revisão vencida</strong>
                <p>
                  {queuedReviews
                    ? `${queuedReviews} revisão(ões) já estão programadas.`
                    : "Responda a um quiz ou peça revisão para montar uma agenda de reforço."}
                </p>
              </div>
              {!queuedReviews && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    const first = recommendations[0];
                    if (first)
                      addReview(
                        {
                          topicId: first.id,
                          topic: first.title,
                          reason: first.reason,
                          difficulty: "médio",
                          source: "revisão solicitada",
                        },
                        0
                      );
                  }}
                >
                  Solicitar revisão <ArrowRight size={14} />
                </Button>
              )}
            </div>
          )}
        </Card>
        <Card className="focus-card">
          <div className="card-title-row">
            <div>
              <p className="eyebrow">RECOMENDAÇÃO EXPLICÁVEL</p>
              <h3>Assuntos para consolidar</h3>
            </div>
            <ShieldAlert size={19} className="attention-icon" />
          </div>
          <div className="focus-list">
            {recommendations.map((topic, index) => (
              <button
                type="button"
                className="focus-row"
                key={topic.id}
                onClick={() => navigate(topic.page)}
              >
                <span className="focus-rank">0{index + 1}</span>
                <span className="focus-text">
                  <strong>{topic.title}</strong>
                  <small>{topic.reason}</small>
                </span>
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            className="text-link"
            onClick={() => navigate("topics")}
          >
            Ver avaliação de conhecimento <ArrowRight size={14} />
          </Button>
        </Card>
      </div>
      <Card className="timeline-card">
        <div className="card-title-row">
          <div>
            <p className="eyebrow">NO HORIZONTE</p>
            <h3>Próximas atividades</h3>
          </div>
          <Button variant="ghost" onClick={() => navigate("plan")}>
            Ver plano completo <ArrowRight size={14} />
          </Button>
        </div>
        <div className="upcoming-list">
          {nextDays.map((item, index) => (
            <button
              type="button"
              className="upcoming-row"
              key={item.id}
              onClick={() => navigate("plan")}
            >
              <span
                className={`upcoming-dot ${index === 0 ? "is-next" : ""}`}
              />
              <div className="upcoming-day">
                DIA {String(item.day).padStart(2, "0")}
                <span>S{item.week}</span>
              </div>
              <div className="upcoming-title">
                <strong>{item.title}</strong>
                <small>{item.topics.join(" · ")}</small>
              </div>
              <span className="upcoming-time">
                <Clock3 size={13} /> {item.estimate} min
              </span>
              <span className="upcoming-status">
                <StatusPill status={item.status} />
              </span>
              <ArrowRight size={15} className="upcoming-arrow" />
            </button>
          ))}
        </div>
      </Card>
      <p className="dashboard-footnote">
        <Gauge size={14} /> Indicadores refletem o que foi registrado neste
        navegador. Atividade concluída representa estudo, não certificação nem
        prova de competência operacional.
      </p>
    </div>
  );
}
