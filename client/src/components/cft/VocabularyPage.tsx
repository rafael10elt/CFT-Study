import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookMarked,
  Check,
  ChevronDown,
  Filter,
  Lightbulb,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { VOCABULARY, type VocabularyLevel } from "@/lib/study-data";
import { useStudy } from "@/lib/study-store";
import {
  Button,
  Card,
  EmptyState,
  PageHeader,
  ProgressBar,
  StatusPill,
} from "./shared";

const LEVELS: VocabularyLevel[] = [
  "New",
  "Learning",
  "Familiar",
  "Confident",
  "Review required",
];

export function VocabularyPage() {
  const { state, setVocabularyLevel } = useStudy();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState("");
  const [practiceDeck, setPracticeDeck] = useState<string[]>([]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [practiceComplete, setPracticeComplete] = useState(false);
  const categories = [...new Set(VOCABULARY.map(item => item.category))];
  const filteredTerms = VOCABULARY.filter(
    item =>
      (category === "all" || item.category === category) &&
      (!query ||
        `${item.term} ${item.meaning} ${item.definition}`
          .toLowerCase()
          .includes(query.toLowerCase()))
  );
  const rated = Object.keys(state.vocabularyLevels).length;
  const confident = Object.values(state.vocabularyLevels).filter(
    level => level === "Confident"
  ).length;
  const practiceTerms = practiceDeck
    .map(id => VOCABULARY.find(item => item.id === id))
    .filter((item): item is (typeof VOCABULARY)[number] => Boolean(item));
  const activeTerm = practiceTerms[practiceIndex];

  const startPractice = () => {
    const suggested = filteredTerms.filter(item =>
      ["New", "Learning", "Review required"].includes(
        state.vocabularyLevels[item.id] ?? ""
      )
    );
    const source = suggested.length ? suggested : filteredTerms;
    const deck = source
      .slice(0, Math.min(5, source.length))
      .map(item => item.id);
    setPracticeDeck(deck);
    setPracticeIndex(0);
    setRevealed(false);
    setPracticeComplete(false);
  };
  const rateTerm = (level: VocabularyLevel) => {
    if (!activeTerm) return;
    setVocabularyLevel(activeTerm.id, level);
    if (practiceIndex + 1 < practiceTerms.length) {
      setPracticeIndex(previous => previous + 1);
      setRevealed(false);
    } else {
      setPracticeComplete(true);
    }
  };
  const endPractice = () => {
    setPracticeDeck([]);
    setPracticeComplete(false);
    setPracticeIndex(0);
    setRevealed(false);
  };

  return (
    <div className="page-stack">
      <PageHeader
        number="09 / 12"
        title="Inglês técnico"
        description="Vocabulário bilíngue para o cotidiano profissional de data centres. Explore, pratique e registre apenas a familiaridade que fizer sentido para você."
        action={
          <span className="vocab-count-tag">
            <Award size={14} /> {confident} confidentes
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
            {rated}
            <small> / {VOCABULARY.length}</small>
          </strong>
          <span>termos avaliados</span>
          <ProgressBar value={(rated / VOCABULARY.length) * 100} />
        </div>
      </div>
      {!practiceDeck.length && (
        <div className="vocab-practice-start">
          <div>
            <span className="eyebrow">
              <Sparkles size={13} /> PRÁTICA RÁPIDA
            </span>
            <strong>Recupere da memória antes de revelar.</strong>
            <small>
              Até 5 termos — prioriza os que ainda precisam de revisão.
            </small>
          </div>
          <Button onClick={startPractice} disabled={!filteredTerms.length}>
            <RotateCcw size={14} /> Praticar cartões
          </Button>
        </div>
      )}
      {practiceDeck.length > 0 && activeTerm && !practiceComplete && (
        <Card className="vocab-practice-card">
          <div className="vocab-practice-head">
            <span className="eyebrow">
              CARTÃO {String(practiceIndex + 1).padStart(2, "0")} /{" "}
              {String(practiceTerms.length).padStart(2, "0")}
            </span>
            <button onClick={endPractice} aria-label="Fechar prática">
              <X size={16} />
            </button>
          </div>
          <ProgressBar
            value={
              ((practiceIndex + (revealed ? 1 : 0)) / practiceTerms.length) *
              100
            }
            tone="blue"
          />
          <div className="vocab-flashcard">
            <span>{activeTerm.category.toUpperCase()}</span>
            <h2>{activeTerm.term}</h2>
            {revealed ? (
              <>
                <strong>{activeTerm.meaning}</strong>
                <p>{activeTerm.definition}</p>
                <blockquote>“{activeTerm.example}”</blockquote>
              </>
            ) : (
              <p className="flashcard-instruction">
                Tente lembrar a tradução e o uso profissional antes de revelar.
              </p>
            )}
          </div>
          {!revealed ? (
            <Button onClick={() => setRevealed(true)}>
              <Lightbulb size={15} /> Revelar resposta
            </Button>
          ) : (
            <div className="flashcard-rating">
              <span>Como ficou sua recordação?</span>
              <div>
                <Button
                  variant="secondary"
                  onClick={() => rateTerm("Review required")}
                >
                  Precisa rever
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => rateTerm("Familiar")}
                >
                  Lembrei
                </Button>
                <Button onClick={() => rateTerm("Confident")}>
                  <Check size={14} /> Confiante
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
      {practiceComplete && (
        <Card className="vocab-practice-done">
          <span className="vocab-done-icon">
            <Check size={18} />
          </span>
          <div>
            <p className="eyebrow">RODADA REGISTRADA</p>
            <h3>{practiceTerms.length} termo(s) avaliados por você.</h3>
            <p>
              As avaliações de familiaridade podem ser atualizadas na lista
              abaixo.
            </p>
          </div>
          <Button variant="secondary" onClick={endPractice}>
            Voltar ao glossário
          </Button>
        </Card>
      )}
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
        {filteredTerms.map(item => {
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
                  {LEVELS.map(value => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
            </Card>
          );
        })}
        {!filteredTerms.length && (
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
