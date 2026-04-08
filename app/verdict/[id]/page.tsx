"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getReadClient, CONTRACTS } from "@/lib/genlayer";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressTag } from "@/components/ui/address-tag";
import { useTask } from "@/lib/hooks/use-tasks";
import { Loader2, AlertCircle, Scale, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Evaluation {
  verdict: "APPROVE" | "PARTIAL" | "REJECT";
  score: number;
  payout_percentage: number;
  reasoning: string;
  evaluated_at?: string;
}

interface Dispute {
  verdict: "AGENT_WINS" | "REQUESTER_WINS" | "SPLIT";
  agent_payout_pct: number;
  requester_payout_pct: number;
  reasoning: string;
  resolved_at?: string;
}

export default function VerdictPage() {
  const { id } = useParams<{ id: string }>();
  const { task, loading: taskLoading } = useTask(id);

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchVerdicts() {
      try {
        setLoading(true);
        const client = getReadClient();

        const hasEval = await client.readContract({
          address: CONTRACTS.evaluation,
          functionName: "has_evaluation",
          args: [id],
        });

        if (hasEval) {
          const evalData = await client.readContract({
            address: CONTRACTS.evaluation,
            functionName: "get_evaluation",
            args: [id],
          });
          setEvaluation(evalData as unknown as Evaluation);
        }

        const disputeCount = await client.readContract({
          address: CONTRACTS.dispute,
          functionName: "get_dispute_count",
          args: [],
        });

        if (Number(disputeCount) > 0) {
          try {
            const disputeData = await client.readContract({
              address: CONTRACTS.dispute,
              functionName: "get_dispute",
              args: [id],
            });
            if (disputeData) setDispute(disputeData as unknown as Dispute);
          } catch {
            // no dispute for this task
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch verdicts");
      } finally {
        setLoading(false);
      }
    }
    fetchVerdicts();
  }, [id]);

  const VERDICT_COLOR = {
    APPROVE:        "var(--verdict-approve)",
    PARTIAL:        "var(--verdict-partial)",
    REJECT:         "var(--verdict-reject)",
    AGENT_WINS:     "var(--verdict-approve)",
    REQUESTER_WINS: "var(--verdict-reject)",
    SPLIT:          "var(--verdict-partial)",
  } as const;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

      <Link href={`/tasks/${id}`} className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={12} /> Back to task
      </Link>

      {/* Header */}
      <div className="mb-8">
        <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-[var(--cyan)]">
          Verdict Log
        </span>
        <h1 className="font-heading text-4xl text-foreground mt-1">
          {taskLoading ? "Loading..." : task?.title ?? id}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="font-mono text-xs text-muted-foreground">{id}</span>
          {task && <StatusBadge status={task.status} />}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 size={16} className="animate-spin text-[var(--cyan)]" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Fetching onchain verdicts...
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 border border-[var(--verdict-reject)]/30 bg-[var(--verdict-reject)]/5 rounded-sm mb-6">
          <AlertCircle size={14} className="text-[var(--verdict-reject)]" />
          <span className="font-mono text-xs text-[var(--verdict-reject)]">{error}</span>
        </div>
      )}

      {!loading && !evaluation && !dispute && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-border rounded-sm">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            No verdicts recorded yet
          </span>
          <span className="font-mono text-[11px] text-muted-foreground/50">
            Verdicts appear once evaluation or dispute contracts are triggered
          </span>
        </div>
      )}

      {/* Evaluation Verdict */}
      {evaluation && (
        <div
          className="border p-6 mb-6 rounded-sm"
          style={{ borderColor: `${VERDICT_COLOR[evaluation.verdict]}30` }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Zap size={14} style={{ color: VERDICT_COLOR[evaluation.verdict] }} />
              <span className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: VERDICT_COLOR[evaluation.verdict] }}>
                AI Evaluation
              </span>
            </div>
            <StatusBadge verdict={evaluation.verdict} />
          </div>

          {/* Score bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Score</span>
              <span className="font-mono text-2xl font-bold" style={{ color: VERDICT_COLOR[evaluation.verdict] }}>
                {evaluation.score}<span className="text-sm text-muted-foreground">/100</span>
              </span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${evaluation.score}%`,
                  backgroundColor: VERDICT_COLOR[evaluation.verdict],
                }}
              />
            </div>
          </div>

          {/* Payout */}
          <div className="grid grid-cols-2 gap-px bg-border mb-6">
            <div className="bg-background px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Payout</span>
              <span className="font-mono text-lg font-bold" style={{ color: VERDICT_COLOR[evaluation.verdict] }}>
                {evaluation.payout_percentage}%
              </span>
            </div>
            <div className="bg-background px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Verdict</span>
              <span className="font-mono text-lg font-bold" style={{ color: VERDICT_COLOR[evaluation.verdict] }}>
                {evaluation.verdict}
              </span>
            </div>
          </div>

          {/* Reasoning */}
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground block mb-2">
              Evaluator Reasoning
            </span>
            <p className="font-mono text-sm text-muted-foreground leading-relaxed bg-card p-4 border border-border rounded-sm">
              {evaluation.reasoning}
            </p>
          </div>
        </div>
      )}

      {/* Dispute Verdict */}
      {dispute && (
        <div
          className="border p-6 rounded-sm"
          style={{ borderColor: `${VERDICT_COLOR[dispute.verdict]}30` }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Scale size={14} style={{ color: VERDICT_COLOR[dispute.verdict] }} />
              <span className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: VERDICT_COLOR[dispute.verdict] }}>
                Dispute Court
              </span>
            </div>
            <StatusBadge verdict={dispute.verdict} />
          </div>

          <div className="grid grid-cols-2 gap-px bg-border mb-6">
            <div className="bg-background px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Agent Payout</span>
              <span className="font-mono text-lg font-bold text-[var(--verdict-approve)]">
                {dispute.agent_payout_pct}%
              </span>
            </div>
            <div className="bg-background px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Requester Payout</span>
              <span className="font-mono text-lg font-bold text-[var(--verdict-reject)]">
                {dispute.requester_payout_pct}%
              </span>
            </div>
          </div>

          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground block mb-2">
              Court Reasoning
            </span>
            <p className="font-mono text-sm text-muted-foreground leading-relaxed bg-card p-4 border border-border rounded-sm">
              {dispute.reasoning}
            </p>
          </div>
        </div>
      )}

      {/* Onchain reference */}
      <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
            Evaluation Contract
          </span>
          <AddressTag address={CONTRACTS.evaluation} copyable />
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
            Dispute Contract
          </span>
          <AddressTag address={CONTRACTS.dispute} copyable />
        </div>
      </div>

    </div>
  );
}
