import { cn } from "@/lib/utils";

export type TaskStatus = "OPEN" | "CLAIMED" | "SUBMITTED" | "COMPLETE" | "DISPUTED";
export type VerdictType = "APPROVE" | "PARTIAL" | "REJECT" | "AGENT_WINS" | "REQUESTER_WINS" | "SPLIT";

const STATUS_STYLES: Record<TaskStatus, string> = {
  OPEN:      "border-[var(--status-open)] text-[var(--status-open)] bg-[var(--status-open)]/8",
  CLAIMED:   "border-[var(--status-claimed)] text-[var(--status-claimed)] bg-[var(--status-claimed)]/8",
  SUBMITTED: "border-[var(--status-submitted)] text-[var(--status-submitted)] bg-[var(--status-submitted)]/8",
  COMPLETE:  "border-[var(--status-complete)] text-[var(--status-complete)] bg-[var(--status-complete)]/8",
  DISPUTED:  "border-[var(--status-disputed)] text-[var(--status-disputed)] bg-[var(--status-disputed)]/8",
};

const VERDICT_STYLES: Record<VerdictType, string> = {
  APPROVE:         "border-[var(--verdict-approve)] text-[var(--verdict-approve)] bg-[var(--verdict-approve)]/8",
  PARTIAL:         "border-[var(--verdict-partial)] text-[var(--verdict-partial)] bg-[var(--verdict-partial)]/8",
  REJECT:          "border-[var(--verdict-reject)] text-[var(--verdict-reject)] bg-[var(--verdict-reject)]/8",
  AGENT_WINS:      "border-[var(--verdict-approve)] text-[var(--verdict-approve)] bg-[var(--verdict-approve)]/8",
  REQUESTER_WINS:  "border-[var(--verdict-reject)] text-[var(--verdict-reject)] bg-[var(--verdict-reject)]/8",
  SPLIT:           "border-[var(--verdict-partial)] text-[var(--verdict-partial)] bg-[var(--verdict-partial)]/8",
};

interface StatusBadgeProps {
  status?: TaskStatus;
  verdict?: VerdictType;
  className?: string;
}

export function StatusBadge({ status, verdict, className }: StatusBadgeProps) {
  const label = status ?? verdict;
  const style = status
    ? STATUS_STYLES[status]
    : verdict
    ? VERDICT_STYLES[verdict]
    : "";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] uppercase border font-mono rounded-sm",
        style,
        className
      )}
    >
      {label?.replace("_", " ")}
    </span>
  );
}
