import { useState, type FormEvent } from "react";
import {
  BriefcaseBusiness,
  Check,
  ExternalLink,
  FilePlus2,
  Pencil,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { TOPICS } from "@/lib/study-data";
import { newId, useStudy, type JobPosting } from "@/lib/study-store";
import { Button, Card, EmptyState, ProgressBar, StatusPill } from "./shared";

const REQUIREMENT_TERMS: Record<string, string[]> = {
  "critical-power": [
    "critical power",
    "power path",
    "critical power systems",
    "power infrastructure",
  ],
  "ups-batteries": ["ups", "uninterruptible power", "battery", "batteries"],
  generators: ["generator", "standby generation", "genset"],
  "hv-lv": [
    "hv/lv",
    "high voltage",
    "low voltage",
    "hv electrical",
    "lv electrical",
  ],
  distribution: [
    "electrical distribution",
    "switchgear",
    "transformer",
    "circuit breaker",
  ],
  cooling: ["cooling", "hvac", "chiller", "crac", "crah", "airflow"],
  bms: ["bms", "epms", "dcim", "building management", "monitoring telemetry"],
  redundancy: ["redundancy", "n+1", "2n", "single point of failure"],
  safety: [
    "loto",
    "lockout/tagout",
    "ppe",
    "electrical safety",
    "permit to work",
  ],
  operations: [
    "sop",
    "mop",
    "eop",
    "critical operations",
    "shift handover",
    "critical facilities operations",
  ],
  "fault-diagnosis": [
    "fault diagnosis",
    "fault finding",
    "root cause",
    "troubleshooting",
  ],
  pue: ["pue", "energy efficiency", "energy management"],
  "incident-communication": [
    "incident reporting",
    "incident communication",
    "incident report",
    "escalation",
    "shift communication",
  ],
};

function matchTerms(topicId: string, description: string) {
  const text = description.toLowerCase();
  return (REQUIREMENT_TERMS[topicId] ?? []).filter(term =>
    text.includes(term.toLowerCase())
  );
}

function topicStudyEvidence(
  topicName: string,
  job: JobPosting,
  state: ReturnType<typeof useStudy>["state"]
) {
  const knowledgeEntry = Object.entries(state.knowledge).find(
    ([id]) => TOPICS.find(topic => topic.id === id)?.name === topicName
  )?.[1];
  const studyDays = state.days.filter(day =>
    day.topics.some(topic =>
      topic
        .toLowerCase()
        .includes(topicName.toLowerCase().replace(" systems", ""))
    )
  );
  const completedDays = studyDays.filter(
    day => day.status === "Completed"
  ).length;
  const knowledge = knowledgeEntry?.level;
  return { completedDays, totalDays: studyDays.length, knowledge };
}

function JobCard({
  job,
  onEdit,
  onDelete,
}: {
  job: JobPosting;
  onEdit: (job: JobPosting) => void;
  onDelete: (id: string) => void;
}) {
  const { state } = useStudy();
  const mentionedTopics = TOPICS.map(topic => ({
    topic,
    matched: matchTerms(topic.id, job.description),
  })).filter(item => item.matched.length > 0);
  const unmentionedTopics = TOPICS.filter(
    topic => !matchTerms(topic.id, job.description).length
  );
  return (
    <Card className="job-card">
      <div className="job-card-heading">
        <div>
          <span className="eyebrow">
            <BriefcaseBusiness size={13} /> VAGA ADICIONADA PELO ESTUDANTE
          </span>
          <h3>{job.title}</h3>
          <p>{job.company || "Empresa não informada"}</p>
        </div>
        <div className="job-card-actions">
          <Button variant="ghost" onClick={() => onEdit(job)}>
            <Pencil size={14} /> Editar
          </Button>
          <Button
            variant="ghost"
            onClick={() => onDelete(job.id)}
            title="Remover vaga"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      {job.sourceUrl && (
        <a
          className="job-source-link"
          href={job.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Abrir link informado <ExternalLink size={12} />
        </a>
      )}
      <p className="job-description-preview">{job.description}</p>
      <div className="job-comparison">
        <div className="job-comparison-heading">
          <strong>Temas mencionados no texto da vaga</strong>
          <small>
            {mentionedTopics.length} tópico(s) identificável(is) por
            palavras-chave
          </small>
        </div>
        {mentionedTopics.length ? (
          <div className="job-topic-list">
            {mentionedTopics.map(({ topic, matched }) => {
              const evidence = topicStudyEvidence(topic.name, job, state);
              return (
                <div key={topic.id}>
                  <span className="job-topic-status">
                    <Check size={12} /> Requisito mencionado
                  </span>
                  <div>
                    <strong>{topic.name}</strong>
                    <small>Termo(s) encontrado(s): {matched.join(", ")}</small>
                  </div>
                  <div className="job-study-evidence">
                    <ProgressBar
                      value={
                        evidence.totalDays
                          ? (evidence.completedDays / evidence.totalDays) * 100
                          : 0
                      }
                    />
                    <small>
                      {evidence.completedDays}/{evidence.totalDays} dia(s) do
                      plano concluídos
                      {evidence.knowledge
                        ? ` · autoavaliação ${evidence.knowledge}`
                        : " · sem autoavaliação"}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="Nenhum assunto reconhecido ainda">
            Edite o texto da vaga para incluir requisitos técnicos que queira
            comparar.
          </EmptyState>
        )}
        <details className="job-unmentioned">
          <summary>
            Temas não identificados no texto ({unmentionedTopics.length})
          </summary>
          <p>
            {unmentionedTopics.map(item => item.name).join(" · ") ||
              "Todos os temas possuem ao menos um termo identificado."}
          </p>
        </details>
      </div>
      <div className="job-safety-note">
        <ShieldAlert size={14} />
        <p>
          Comparação textual de apoio à revisão. “Mencionado” não significa que
          você atende ao requisito nem avalia qualificação; não há nota,
          probabilidade de contratação ou garantia.
        </p>
      </div>
    </Card>
  );
}

export function JobComparisonPanel() {
  const { state, saveJobPosting, deleteJobPosting } = useStudy();
  const [editingId, setEditingId] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [description, setDescription] = useState("");
  const clearForm = () => {
    setEditingId("");
    setTitle("");
    setCompany("");
    setSourceUrl("");
    setDescription("");
  };
  const startEdit = (job: JobPosting) => {
    setEditingId(job.id);
    setTitle(job.title);
    setCompany(job.company);
    setSourceUrl(job.sourceUrl);
    setDescription(job.description);
  };
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !description.trim()) return;
    saveJobPosting({
      id: editingId || newId("job"),
      title: title.trim(),
      company: company.trim(),
      sourceUrl: sourceUrl.trim(),
      description: description.trim(),
    });
    clearForm();
  };
  return (
    <section className="job-comparison-section">
      <div className="job-section-heading">
        <div>
          <span className="eyebrow">
            <BriefcaseBusiness size={13} /> COMPARAÇÃO DE VAGA REAL
          </span>
          <h2>Compare requisitos com o plano estudado.</h2>
          <p>
            Adicione a descrição real da vaga. O app destaca apenas
            palavras-chave e progresso relacionado; não acessa o link nem
            determina qualificação.
          </p>
        </div>
        <span>{state.jobPostings.length} vaga(s)</span>
      </div>
      <Card className="job-entry-card">
        <form onSubmit={save}>
          <div className="form-three-col">
            <label className="field-label">
              Título da vaga
              <input
                className="field-control"
                required
                maxLength={120}
                value={title}
                onChange={event => setTitle(event.target.value)}
                placeholder="Ex.: Critical Facilities Technician"
              />
            </label>
            <label className="field-label">
              Empresa (opcional)
              <input
                className="field-control"
                maxLength={120}
                value={company}
                onChange={event => setCompany(event.target.value)}
                placeholder="Empresa"
              />
            </label>
            <label className="field-label">
              Link de origem (opcional)
              <input
                className="field-control"
                type="url"
                value={sourceUrl}
                onChange={event => setSourceUrl(event.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>
          <label className="field-label">
            Descrição/requisitos da vaga
            <textarea
              className="field-control field-textarea"
              required
              rows={5}
              maxLength={8000}
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="Cole aqui somente o texto da vaga que deseja comparar. O aplicativo não visita nem valida a página."
            />
            <small>
              {description.length}/8.000 caracteres · guardado no navegador
            </small>
          </label>
          <div className="job-form-actions">
            <Button type="submit">
              <FilePlus2 size={15} />{" "}
              {editingId ? "Salvar alterações" : "Adicionar e comparar"}
            </Button>
            {editingId && (
              <Button variant="ghost" onClick={clearForm}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>
      {state.jobPostings.length ? (
        <div className="job-card-list">
          {state.jobPostings.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={startEdit}
              onDelete={deleteJobPosting}
            />
          ))}
        </div>
      ) : (
        <Card className="job-empty-card">
          <EmptyState title="Nenhuma vaga adicionada">
            Você pode colar os requisitos de uma oportunidade real de Critical
            Facilities, Data Centre Operations ou função correlata. Os dados não
            serão enviados ao tutor de IA.
          </EmptyState>
        </Card>
      )}
      <div className="job-privacy-note">
        <StatusPill status="Dados locais" />
        <span>
          Vagas salvas somente neste navegador. Exportar backup inclui os textos
          informados.
        </span>
      </div>
    </section>
  );
}
