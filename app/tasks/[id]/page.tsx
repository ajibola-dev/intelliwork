"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAccount, useWalletClient, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { getReadClient, getWriteClient, CONTRACTS } from "@/lib/genlayer";
import { useTask } from "@/lib/hooks/use-tasks";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressTag } from "@/components/ui/address-tag";
import { cn } from "@/lib/utils";
import type { Hash } from "genlayer-js/types";
import {
  Loader2, AlertCircle, ArrowLeft, CheckCircle2,
  Scale, Zap, ClipboardList
} from "lucide-react";
import Link from "next/link";

type ActionState = "idle" | "submitting" | "confirming" | "success" | "error";

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function Field({
  value, onChange, placeholder, rows, disabled
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
  disabled?: boolean;
}) {
  return rows ? (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-4 py-3 bg-card border border-border font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[var(--cyan)]/40 disabled:opacity-40 resize-none rounded-sm"
    />
  ) : (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-4 py-3 bg-card border border-border font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[var(--cyan)]/40 disabled:opacity-40 rounded-sm"
    />
  );
}

async function sendTx(
  client: ReturnType<typeof getWriteClient>,
  args: { address: `0x${string}`; functionName: string; args: unknown[] }
) {
  const hash = await client.writeContract({
    ...args,
    value: BigInt(0),
  } as Parameters<typeof client.writeContract>[0]);
  await client.waitForTransactionReceipt({
    hash: hash as unknown as Hash,
    status: 5 as unknown as never,
  });
  return hash;
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { task, loading, error } = useTask(id);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { connect } = useConnect();

  // Claim
  const [claimState, setClaimState] = useState<ActionState>("idle");

  // Submit work
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [evidence, setEvidence] = useState("");
  const [submitState, setSubmitState] = useState<ActionState>("idle");

  // Evaluate
  const [evalState, setEvalState] = useState<ActionState>("idle");
  const [evalResult, setEvalResult] = useState<Record<string, unknown> | null>(null);

  // Dispute
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeState, setDisputeState] = useState<ActionState>("idle");

  // Approve
  const [approveState, setApproveState] = useState<ActionState>("idle");

  const [actionError, setActionError] = useState<string | null>(null);

  async function handleClaim() {
    if (!walletClient) return;
    try {
      setClaimState("submitting"); setActionError(null);
      const client = getWriteClient(walletClient);
      setClaimState("confirming");
      await sendTx(client, { address: CONTRACTS.work, functionName: "claim_task", args: [id] });
      setClaimState("success");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed");
      setClaimState("error");
    }
  }

  async function handleSubmit() {
    if (!walletClient || !deliverableUrl.trim() || !evidence.trim()) return;
    try {
      setSubmitState("submitting"); setActionError(null);
      const client = getWriteClient(walletClient);
      setSubmitState("confirming");
      await sendTx(client, {
        address: CONTRACTS.work,
        functionName: "submit_work",
        args: [id, deliverableUrl.trim(), evidence.trim()],
      });
      setSubmitState("success");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed");
      setSubmitState("error");
    }
  }

  async function handleEvaluate() {
    if (!walletClient || !task) return;
    try {
      setEvalState("submitting"); setActionError(null);
      const client = getWriteClient(walletClient);
      setEvalState("confirming");
      await sendTx(client, {
        address: CONTRACTS.evaluation,
        functionName: "evaluate_submission",
        args: [id, task.title, task.requirements, deliverableUrl, evidence],
      });
      setEvalState("confirming");
      const readClient = getReadClient();
      const result = await readClient.readContract({
        address: CONTRACTS.evaluation,
        functionName: "get_evaluation",
        args: [id],
      });
      setEvalResult(result as Record<string, unknown>);
      setEvalState("success");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed");
      setEvalState("error");
    }
  }

  async function handleApprove() {
    if (!walletClient) return;
    try {
      setApproveState("submitting"); setActionError(null);
      const client = getWriteClient(walletClient);
      setApproveState("confirming");
      await sendTx(client, { address: CONTRACTS.work, functionName: "approve_work", args: [id] });
      setApproveState("success");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed");
      setApproveState("error");
    }
  }

  async function handleDispute() {
    if (!walletClient || !disputeReason.trim()) return;
    try {
      setDisputeState("submitting"); setActionError(null);
      const client = getWriteClient(walletClient);
      setDisputeState("confirming");
      await sendTx(client, {
        address: CONTRACTS.work,
        functionName: "open_dispute",
        args: [id, disputeReason.trim()],
      });
      setDisputeState("success");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed");
      setDisputeState("error");
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3">
      <Loader2 size={18} className="animate-spin text-[var(--cyan)]" />
      <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Loading task...</span>
    </div>
  );

  if (error || !task) return (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <AlertCircle size={18} className="text-[var(--verdict-reject)]" />
      <span className="font-mono text-xs text-muted-foreground">{error ?? "Task not found"}</span>
      <Link href="/tasks" className="font-mono text-xs text-[var(--cyan)] hover:underline">← Back to marketplace</Link>
    </div>
  );

  const isRequester = address?.toLowerCase() === task.requester?.toLowerCase();
  const isAgent = address?.toLowerCase() === task.agent?.toLowerCase();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

      {/* Back */}
      <Link href="/tasks" className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={12} /> Back to marketplace
      </Link>

      {/* Header */}
      <div className="border border-border bg-card p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={task.status} />
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">{id}</span>
          </div>
          <span className="font-mono text-xl font-bold text-[var(--cyan)] shrink-0">{task.reward_gen} GEN</span>
        </div>
        <h1 className="font-heading text-3xl text-foreground mb-4">{task.title}</h1>
        <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-6">{task.description}</p>
        <div className="flex flex-wrap gap-6 pt-4 border-t border-border">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Requester</span>
            <AddressTag address={task.requester} copyable />
          </div>
          {task.agent && (
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Agent</span>
              <AddressTag address={task.agent} copyable />
            </div>
          )}
        </div>
      </div>

      {/* Requirements */}
      <div className="border border-border bg-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={14} className="text-[var(--cyan)]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--cyan)]">Acceptance Requirements</span>
        </div>
        <p className="font-mono text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{task.requirements}</p>
      </div>

      {/* Error banner */}
      {actionError && (
        <div className="p-4 border border-[var(--verdict-reject)]/30 bg-[var(--verdict-reject)]/5 flex items-start gap-3 rounded-sm mb-6">
          <AlertCircle size={14} className="text-[var(--verdict-reject)] mt-0.5 shrink-0" />
          <span className="font-mono text-xs text-[var(--verdict-reject)]">{actionError}</span>
        </div>
      )}

      {!isConnected && (
        <div className="border border-border p-6 flex items-center justify-between mb-6">
          <span className="font-mono text-sm text-muted-foreground">Connect wallet to interact with this task</span>
          <button
            onClick={() => connect({ connector: injected() })}
            className="px-4 py-2 border border-[var(--cyan)]/40 text-[var(--cyan)] font-mono text-xs tracking-wider uppercase hover:bg-[var(--cyan)]/8 transition-colors rounded-sm"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {/* ── CLAIM (agent, task is OPEN) ── */}
      {isConnected && task.status === "OPEN" && !isRequester && (
        <div className="border border-border bg-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-[var(--cyan)]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--cyan)]">Claim Task</span>
          </div>
          <p className="font-mono text-sm text-muted-foreground mb-5">
            Claim this task to lock it to your address. You'll then have exclusive rights to submit.
          </p>
          <ActionButton
            state={claimState}
            onClick={handleClaim}
            label="Claim Task"
            submittingLabel="Sending..."
            confirmingLabel="Finalizing..."
            successLabel="Claimed"
          />
        </div>
      )}

      {/* ── SUBMIT WORK (agent, task is CLAIMED by them) ── */}
      {isConnected && task.status === "CLAIMED" && isAgent && (
        <div className="border border-border bg-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-[var(--cyan)]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--cyan)]">Submit Work</span>
          </div>
          <div className="flex flex-col gap-4">
            <Section label="Deliverable URL">
              <Field value={deliverableUrl} onChange={setDeliverableUrl} placeholder="https://github.com/you/repo or deployed URL" disabled={submitState === "submitting" || submitState === "confirming"} />
            </Section>
            <Section label="Evidence of Completion">
              <Field value={evidence} onChange={setEvidence} placeholder="Describe what you built, how it meets requirements, and any relevant context the AI evaluator should know." rows={4} disabled={submitState === "submitting" || submitState === "confirming"} />
            </Section>
            <ActionButton
              state={submitState}
              onClick={handleSubmit}
              disabled={!deliverableUrl.trim() || !evidence.trim()}
              label="Submit Work"
              submittingLabel="Sending..."
              confirmingLabel="Finalizing on Studionet..."
              successLabel="Submitted"
            />
          </div>
        </div>
      )}

      {/* ── EVALUATE + APPROVE/DISPUTE (requester, task is SUBMITTED) ── */}
      {isConnected && task.status === "SUBMITTED" && isRequester && (
        <div className="border border-border bg-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-[var(--cyan)]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--cyan)]">Review Submission</span>
          </div>
          <div className="flex flex-col gap-4">
            <ActionButton
              state={evalState}
              onClick={handleEvaluate}
              label="Request AI Evaluation"
              submittingLabel="Sending to validators..."
              confirmingLabel="LLM consensus running..."
              successLabel="Evaluation complete"
            />
            {evalResult && (
              <div className="p-4 border border-[var(--verdict-approve)]/20 bg-[var(--verdict-approve)]/5 rounded-sm">
                <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--verdict-approve)] mb-2">Verdict</p>
                <pre className="font-mono text-xs text-foreground whitespace-pre-wrap overflow-auto">
                  {JSON.stringify(evalResult, null, 2)}
                </pre>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <ActionButton
                state={approveState}
                onClick={handleApprove}
                label="Approve & Pay"
                submittingLabel="Approving..."
                confirmingLabel="Finalizing..."
                successLabel="Approved"
                variant="approve"
              />
              <div className="flex flex-col gap-2">
                <Field value={disputeReason} onChange={setDisputeReason} placeholder="Reason for dispute..." disabled={disputeState === "submitting" || disputeState === "confirming"} />
                <ActionButton
                  state={disputeState}
                  onClick={handleDispute}
                  disabled={!disputeReason.trim()}
                  label="Open Dispute"
                  submittingLabel="Submitting..."
                  confirmingLabel="Finalizing..."
                  successLabel="Dispute opened"
                  variant="reject"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DISPUTE DETAILS (task is DISPUTED) ── */}
      {task.status === "DISPUTED" && (
        <div className="border border-[var(--status-disputed)]/20 bg-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Scale size={14} className="text-[var(--status-disputed)]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--status-disputed)]">
              Dispute in Progress
            </span>
          </div>
          <p className="font-mono text-sm text-muted-foreground">
            This task is under dispute. The DisputeContract is analyzing evidence and will render a binding verdict.
          </p>
        </div>
      )}

      {/* ── COMPLETE ── */}
      {task.status === "COMPLETE" && (
        <div className="border border-[var(--status-complete)]/20 bg-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-[var(--status-complete)]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--status-complete)]">
              Task Complete
            </span>
          </div>
          <p className="font-mono text-sm text-muted-foreground">
            This task has been completed and payment has been released.
          </p>
        </div>
      )}

    </div>
  );
}

function ActionButton({
  state, onClick, disabled, label, submittingLabel, confirmingLabel, successLabel, variant = "default",
}: {
  state: ActionState;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  submittingLabel: string;
  confirmingLabel: string;
  successLabel: string;
  variant?: "default" | "approve" | "reject";
}) {
  const isLoading = state === "submitting" || state === "confirming";
  const isSuccess = state === "success";

  const baseStyle = "w-full py-3 font-mono text-xs font-bold tracking-[0.1em] uppercase transition-all rounded-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed";

  const variantStyle = {
    default: isSuccess
      ? "bg-[var(--verdict-approve)]/10 text-[var(--verdict-approve)] border border-[var(--verdict-approve)]/30"
      : "bg-[var(--cyan)] text-black hover:opacity-90",
    approve: isSuccess
      ? "bg-[var(--verdict-approve)]/10 text-[var(--verdict-approve)] border border-[var(--verdict-approve)]/30"
      : "bg-[var(--verdict-approve)]/10 text-[var(--verdict-approve)] border border-[var(--verdict-approve)]/30 hover:bg-[var(--verdict-approve)]/20",
    reject: isSuccess
      ? "bg-[var(--verdict-reject)]/10 text-[var(--verdict-reject)] border border-[var(--verdict-reject)]/30"
      : "bg-[var(--verdict-reject)]/10 text-[var(--verdict-reject)] border border-[var(--verdict-reject)]/30 hover:bg-[var(--verdict-reject)]/20",
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading || isSuccess}
      className={cn(baseStyle, variantStyle)}
    >
      {isLoading && <Loader2 size={12} className="animate-spin" />}
      {isSuccess && <CheckCircle2 size={12} />}
      {state === "submitting" ? submittingLabel
        : state === "confirming" ? confirmingLabel
        : state === "success" ? successLabel
        : label}
    </button>
  );
}
