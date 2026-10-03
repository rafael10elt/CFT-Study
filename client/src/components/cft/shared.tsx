import type { ReactNode } from "react";
import { ArrowRight, Check, CircleHelp, Clock3 } from "lucide-react";
import { STATUS_LABELS } from "@/lib/study-data";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}

export function PageHeader({
  number,
  title,
  description,
  action,
}: {
  number: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="page-heading-copy">
        <span className="page-index">{number}</span>
        <div>
          <p className="eyebrow">CFT STUDY COMPANION</p>
          <h1>{title}</h1>
          <p className="page-description">{description}</p>
        </div>
      </div>
      {action && <div className="page-action">{action}</div>}
    </header>
  );
}

export function ProgressBar({
  value,
  tone = "mint",
  label,
}: {
  value: number;
  tone?: "mint" | "blue" | "amber" | "violet";
  label?: string;
}) {
  const safeValue = Math.min(
    100,
    Math.max(0, Number.isFinite(value) ? value : 0)
  );
  return (
    <div
      className={`progress-track ${tone}`}
      role="progressbar"
      aria-valuenow={Math.round(safeValue)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progresso"}
    >
      <span style={{ width: `${safeValue}%` }} />
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Completed" || status === "Issued" || status === "Confident"
      ? "good"
      : status === "In progress" || status === "Learning"
        ? "active"
        : status === "Review required" || status === "To be verified"
          ? "attention"
          : status === "Skipped"
            ? "muted"
            : "quiet";
  return (
    <span className={`status-pill ${tone}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function Card({
  children,
  className = "",
  ...props
}: {
  children: ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <section className={`surface-card ${className}`} {...props}>
      {children}
    </section>
  );
}

export function MetricCard({
  icon,
  label,
  value,
  detail,
  tone = "mint",
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  detail: string;
  tone?: string;
}) {
  return (
    <Card className={`metric-card metric-${tone}`}>
      <div className="metric-top">
        <span className="metric-icon">{icon}</span>
        <span className="metric-dot" />
      </div>
      <p className="metric-label">{label}</p>
      <strong className="metric-value">{value}</strong>
      <span className="metric-detail">{detail}</span>
    </Card>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  className = "",
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  title?: string;
}) {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

export function IconButton({
  children,
  onClick,
  label,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      className="icon-button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

export function EmptyState({
  title,
  children,
  icon,
}: {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon ?? <CircleHelp size={21} />}</span>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

export function InlineMeta({
  minutes,
  status,
}: {
  minutes?: number;
  status?: string;
}) {
  return (
    <div className="inline-meta">
      {minutes !== undefined && (
        <span>
          <Clock3 size={13} /> {minutes} min
        </span>
      )}
      {status && <StatusPill status={status} />}
      {!minutes && !status && <ArrowRight size={14} />}
      {status === "Completed" && <Check size={13} />}
    </div>
  );
}

export const formattedDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
) =>
  new Intl.DateTimeFormat("pt-BR", options).format(
    typeof date === "string" ? new Date(date) : date
  );
export const reviewedCount = (ids: string[], values: string[]) =>
  ids.filter(id => values.includes(id)).length;
