import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatusBadge, TaskStatus } from "./status-badge";
import { AddressTag } from "./address-tag";
import { ArrowUpRight } from "lucide-react";

export interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  requirements: string;
  reward: number | string;
  status: TaskStatus;
  requester: string;
  agent?: string;
  className?: string;
}

export function TaskCard({
  id,
  title,
  description,
  reward,
  status,
  requester,
  agent,
  className,
}: TaskCardProps) {
  return (
    <Link href={`/tasks/${id}`} className="group block">
      <article
        className={cn(
          "relative border border-border bg-card p-5 transition-all duration-200",
          "hover:border-[var(--cyan)]/30 hover:bg-card/80",
          "group-hover:glow-cyan",
          className
        )}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={status} />
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
              {id}
            </span>
          </div>
          <ArrowUpRight
            size={14}
            className="text-muted-foreground group-hover:text-[var(--cyan)] transition-colors shrink-0 mt-0.5"
          />
        </div>

        {/* Title */}
        <h3 className="font-heading text-lg leading-snug mb-2 text-foreground group-hover:text-white transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Requester
            </span>
            <AddressTag address={requester} />
          </div>
          {agent && (
            <div className="flex flex-col gap-1 items-end">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Agent
              </span>
              <AddressTag address={agent} />
            </div>
          )}
          <div className="flex flex-col gap-1 items-end">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Reward
            </span>
            <span className="font-mono text-sm font-bold text-[var(--cyan)]">
              {reward} GEN
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
