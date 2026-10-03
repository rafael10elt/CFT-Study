import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  FileQuestion,
  Lightbulb,
  RotateCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  QUIZ_QUESTIONS,
  STATUS_LABELS,
  TOPICS,
  type QuizQuestion,
} from "@/lib/study-data";
import { newId, useStudy } from "@/lib/study-store";
import {
  Button,
  Card,
  EmptyState,
  PageHeader,
  ProgressBar,
  SectionHeading,
} from "./shared";

type QuizAnswer = number | string;
function isAnswerCorrect(question: QuizQuestion, response: QuizAnswer) {
  if (question.expectedKeywords) {
    const normalized = String(response)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const hits = question.expectedKeywords.filter(word =>
      normalized.includes(word.toLowerCase())
    ).length;
    return hits >= Math.min(2, question.expectedKeywords.length);
  }
  return typeof response === "number" && response === question.answer;
}

export function QuizPage({ navigate }: { navigate?: (page: string) => void }) {
  const { state, addQuizAttempt, addReview } = useStudy();
  const [topicFilter, setTopicFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [mode, setMode] = useState<"idle" | "playing" | "results">("idle");
  const [deck, setDeck] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [shortText, setShortText] = useState("");
  const [savedResult, setSavedResult] = useState(false);
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
  const correctCount = answers.reduce<number>(
    (total, answer, questionIndex) =>
      total +
      (deck[questionIndex] && isAnswerCorrect(deck[questionIndex], answer)
        ? 1
        : 0),
    0
  );
  const begin = () => {
    setDeck(available);
    setIndex(0);
    setAnswers([]);
    setSelected(null);
    setShortText("");
    setSavedResult(false);
    setMode("playing");
  };
  const submitAnswer = () => {
    if (!question || answered) return;
    if (question.expectedKeywords) {
      if (!shortText.trim()) return;
      setAnswers(previous => [...previous, shortText.trim()]);
    } else if (selected !== null)
      setAnswers(previous => [...previous, selected]);
  };
  const finish = () => {
    const attempted = answers.map((answer, questionIndex) => ({
      question: deck[questionIndex],
      correct: isAnswerCorrect(deck[questionIndex], answer),
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
              "Resposta incorreta no quiz; revisar o conceito e a explicação associada.",
            difficulty: "difícil",
            source: "questionário",
          },
          state.reviewIntervalsDays[0] ?? 1
        );
    });
    setSavedResult(true);
    setMode("results");
  };
  const restart = () => {
    setMode("idle");
    setDeck([]);
  };
  const lastAttempt = state.quizAttempts.at(-1);
  const missedTopics =
    lastAttempt?.missedTopicIds
      .map(id => TOPICS.find(topic => topic.id === id))
      .filter((item): item is (typeof TOPICS)[number] => Boolean(item)) ?? [];

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
                As respostas incorretas sugerem reforços. Questões abertas usam
                um checklist de palavras como apoio de estudo, não como
                avaliação formal.
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
                  <option value="Intermediate">Intermediário</option>
                  <option value="Advanced">Avançado</option>
                </select>
              </label>
              <div className="quiz-ready-note">
                <span>{available.length}</span>
                <p>questões disponíveis nesta seleção</p>
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
              "Short technical answers",
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
                {question.difficulty === "Intermediate"
                  ? "INTERMEDIÁRIO"
                  : "AVANÇADO"}
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
            {question.expectedKeywords ? (
              <div className="quiz-short-answer">
                <label className="field-label">
                  Sua resposta (texto livre)
                  <textarea
                    className="field-control field-textarea"
                    rows={4}
                    maxLength={900}
                    value={answered ? String(answers[index]) : shortText}
                    onChange={event => setShortText(event.target.value)}
                    disabled={answered}
                    placeholder="Escreva uma resposta curta em inglês ou português, conforme a pergunta..."
                  />
                </label>
                {answered && (
                  <p className="keyword-hint">
                    <Lightbulb size={13} /> Checklist de revisão:{" "}
                    {question.expectedKeywords.join(" · ")} — basta corresponder
                    a dois ou mais termos; confira se o sentido está correto.
                  </p>
                )}
              </div>
            ) : (
              <div className="answer-options">
                {question.options.map((option, optionIndex) => {
                  const wasSelected = answered
                    ? answers[index] === optionIndex
                    : selected === optionIndex;
                  const isCorrect = answered && optionIndex === question.answer;
                  const isWrongSelected = answered && wasSelected && !isCorrect;
                  return (
                    <button
                      key={option}
                      className={`answer-option ${wasSelected ? "selected" : ""} ${isCorrect ? "correct" : ""} ${isWrongSelected ? "incorrect" : ""}`}
                      onClick={() => {
                        if (!answered) setSelected(optionIndex);
                      }}
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
            )}
            {answered && (
              <div
                className={`answer-feedback ${isAnswerCorrect(question, answers[index]) ? "feedback-correct" : "feedback-review"}`}
              >
                <span>
                  {isAnswerCorrect(question, answers[index]) ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                </span>
                <div>
                  <strong>
                    {isAnswerCorrect(question, answers[index])
                      ? "Resposta correta"
                      : question.expectedKeywords
                        ? "Checklist parcial — revise a formulação"
                        : "Vale revisar este ponto"}
                  </strong>
                  <p>{question.explanation}</p>
                  {question.expectedKeywords && (
                    <small>
                      O indicador nesta resposta aberta usa correspondência de
                      palavras para estudo e pode não refletir o sentido
                      técnico. Avalie o conteúdo manualmente.
                    </small>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="quiz-player-footer">
            <span>
              {correctCount} resposta(s) indicativa(s) correta(s) nesta sessão
            </span>
            {answered ? (
              <Button
                onClick={() => {
                  if (index + 1 < deck.length) {
                    setIndex(value => value + 1);
                    setSelected(null);
                    setShortText("");
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
              <Button
                onClick={submitAnswer}
                disabled={
                  question.expectedKeywords
                    ? !shortText.trim()
                    : selected === null
                }
              >
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
      {mode === "results" && (
        <Card className="quiz-final-card">
          <div className="final-score-ring">
            <span>RESULTADO</span>
            <strong>
              {Math.round((correctCount / Math.max(deck.length, 1)) * 100)}
              <small>%</small>
            </strong>
            <i>
              {correctCount} de {deck.length} indicações
            </i>
          </div>
          <div className="final-score-copy">
            <p className="eyebrow">SESSÃO CONCLUÍDA</p>
            <h2>
              {correctCount / Math.max(deck.length, 1) >= 0.7
                ? "Base consolidada. Continue revisando."
                : "Um bom ponto de partida para a próxima revisão."}
            </h2>
            <p>
              Confira as explicações, observe os tópicos sinalizados e escolha
              uma revisão. A pontuação representa somente este exercício
              {deck.some(item => item.expectedKeywords)
                ? "; respostas abertas usam um checklist indicativo de palavras, não avaliação semântica"
                : ""}
              .
            </p>
            <div className="missed-topic-pills">
              {missedTopics.length ? (
                missedTopics.map(topic => (
                  <span key={topic.id}>
                    <AlertTriangle size={12} /> {topic.name}
                  </span>
                ))
              ) : (
                <span>
                  <CheckCircle2 size={13} /> Nenhum erro sinalizado nesta sessão
                </span>
              )}
            </div>
            <div className="next-activity-recommendation">
              <Lightbulb size={15} />
              <p>
                <strong>Próxima atividade:</strong>{" "}
                {missedTopics.length
                  ? `revisar ${missedTopics.map(topic => topic.name).join(", ")} e conferir as explicações.`
                  : "continuar para a próxima sessão de estudo do plano."}{" "}
                {missedTopics.length
                  ? `Uma revisão foi sugerida para ${state.reviewIntervalsDays[0] ?? 1} dia(s).`
                  : ""}
              </p>
            </div>
            <div className="final-actions">
              <Button onClick={restart}>
                <RotateCcw size={15} /> Nova avaliação
              </Button>
              {missedTopics.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    missedTopics.forEach(topic =>
                      addReview(
                        {
                          topicId: topic.id,
                          topic: topic.name,
                          reason:
                            "Revisão imediata solicitada a partir dos tópicos incorretos neste quiz.",
                          difficulty: "difícil",
                          source: "questionário",
                        },
                        0
                      )
                    );
                    navigate?.("knowledge");
                  }}
                >
                  Revisar tópicos agora <ArrowRight size={14} />
                </Button>
              )}
              {navigate && (
                <Button variant="ghost" onClick={() => navigate("plan")}>
                  Abrir plano
                </Button>
              )}
            </div>
            {savedResult && (
              <small className="quiz-saved-note">
                Resultado registrado neste navegador.
              </small>
            )}
          </div>
          <div className="answer-review-grid">
            {deck.map((item, i) => {
              const isCorrect = isAnswerCorrect(item, answers[i]);
              const responseText =
                typeof answers[i] === "number"
                  ? item.options[Number(answers[i])]
                  : String(answers[i] ?? "");
              return (
                <div
                  className={`answer-review-row ${isCorrect ? "right" : "wrong"}`}
                  key={item.id}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{item.topic}</strong>
                    <small>{item.prompt}</small>
                    <small className="quiz-review-response">
                      Sua resposta: {responseText}
                    </small>
                    <p>{item.explanation}</p>
                  </div>
                  {isCorrect ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
