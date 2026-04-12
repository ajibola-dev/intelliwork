"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { injected } from "wagmi/connectors";
import { useConnect } from "wagmi";
import { getWindowWriteClient, CONTRACTS } from "@/lib/genlayer";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type FormState = "idle" | "submitting" | "confirming" | "success" | "error";

const FIELD_LIMITS = {
  title:        { max: 100  },
  description:  { max: 500  },
  requirements: { max: 1000 },
};

export default function PostTaskPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [reward, setReward] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const isValid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    requirements.trim().length > 0 &&
    Number(reward) > 0;

  const isSubmitting = state === "submitting" || state === "confirming";

  async function handleSubmit() {
    if (isSubmitting || state === "success") return;
    if (!isValid) { setError("Please fill all fields"); setState("error"); return; }
    try {
      setState("submitting");
      setError(null);
      console.log("CONTRACTS.work:", CONTRACTS.work);
      console.log("address:", address);
      if (!CONTRACTS.work) { throw new Error("CONTRACTS.work is undefined - check env vars"); }
      const { client, account } = await getWindowWriteClient();
      const hash = await client.writeContract({
        account: account as unknown as import('viem').Account,
        address: CONTRACTS.work,
        functionName: "post_task",
        args: [
          title.trim(),
          description.trim(),
          requirements.trim(),
          BigInt(Math.round(Number(reward) || 0)),
        ],
        value: BigInt(0),
      });

      setTxHash(hash as unknown as string);
      setState("confirming");

      await client.waitForTransactionReceipt({
        hash: hash as unknown as never,
        status: 5 as unknown as never,
      });

      setState("success");
      setTimeout(() => router.push("/tasks"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setState("error");
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center text-center gap-6">
        <AlertCircle size={20} className="text-[var(--cyan)]" />
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-2">Wallet required</h2>
          <p className="font-mono text-sm text-muted-foreground">Connect your wallet to post a task onchain.</p>
        </div>
        <button
          onClick={() => connect({ connector: injected() })}
          disabled={isConnecting}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--cyan)] text-black font-mono text-xs font-bold tracking-[0.1em] uppercase hover:opacity-90 transition-opacity rounded-sm disabled:opacity-40"
        >
          {isConnecting ? <><Loader2 size={12} className="animate-spin" /> Connecting</> : "Connect Wallet"}
        </button>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center text-center gap-6">
        <div className="w-12 h-12 border border-[var(--verdict-approve)]/30 flex items-center justify-center rounded-sm">
          <CheckCircle2 size={20} className="text-[var(--verdict-approve)]" />
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-2">Task posted</h2>
          <p className="font-mono text-sm text-muted-foreground mb-3">Your task is live on Studionet. Redirecting...</p>
          {txHash && <span className="font-mono text-[11px] text-muted-foreground/50 break-all">{txHash}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/tasks" className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={12} /> Back to marketplace
      </Link>

      <div className="mb-10">
        <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-[var(--cyan)]">New Task</span>
        <h1 className="font-heading text-4xl text-foreground mt-1">Post a Task</h1>
        <p className="font-mono text-sm text-muted-foreground mt-2">
          Define your requirements clearly. The AI evaluator will use them to judge submissions.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground">
              Task Title <span className="text-[var(--verdict-reject)]">*</span>
            </label>
            <span className="font-mono text-[10px] text-muted-foreground/40">{title.length}/{FIELD_LIMITS.title.max}</span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={FIELD_LIMITS.title.max}
            placeholder="e.g. Build a REST API endpoint for user authentication"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-card border border-border font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[var(--cyan)]/40 disabled:opacity-40 rounded-sm"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground">
              Description <span className="text-[var(--verdict-reject)]">*</span>
            </label>
            <span className="font-mono text-[10px] text-muted-foreground/40">{description.length}/{FIELD_LIMITS.description.max}</span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={FIELD_LIMITS.description.max}
            rows={4}
            placeholder="Describe the task in detail."
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-card border border-border font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[var(--cyan)]/40 disabled:opacity-40 resize-none rounded-sm"
          />
        </div>

        {/* Requirements */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground">
              Acceptance Requirements <span className="text-[var(--verdict-reject)]">*</span>
            </label>
            <span className="font-mono text-[10px] text-muted-foreground/40">{requirements.length}/{FIELD_LIMITS.requirements.max}</span>
          </div>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            maxLength={FIELD_LIMITS.requirements.max}
            rows={5}
            placeholder="List the criteria the AI evaluator will use to judge the submission."
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-card border border-border font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[var(--cyan)]/40 disabled:opacity-40 resize-none rounded-sm"
          />
          <p className="font-mono text-[11px] text-muted-foreground/50">
            The AI evaluator reads these requirements verbatim when scoring submissions.
          </p>
        </div>

        {/* Reward */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground">
            Reward (GEN) <span className="text-[var(--verdict-reject)]">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              min="1"
              step="1"
              placeholder="100"
              disabled={isSubmitting}
              className="w-full px-4 py-3 pr-16 bg-card border border-border font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[var(--cyan)]/40 disabled:opacity-40 rounded-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">GEN</span>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground/50">Full reward on APPROVE. Partial on PARTIAL verdict. Zero on REJECT.</p>
        </div>

        {/* Posting as */}
        <div className="p-4 border border-border bg-card/50 flex items-center justify-between rounded-sm">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Posting as</span>
          <span className="font-mono text-xs text-foreground">{address}</span>
        </div>

        {/* Error */}
        {state === "error" && error && (
          <div className="p-4 border border-[var(--verdict-reject)]/30 bg-[var(--verdict-reject)]/5 flex items-start gap-3 rounded-sm">
            <AlertCircle size={14} className="text-[var(--verdict-reject)] mt-0.5 shrink-0" />
            <span className="font-mono text-xs text-[var(--verdict-reject)]">{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className={cn(
            "w-full py-4 font-mono text-xs font-bold tracking-[0.12em] uppercase transition-all rounded-sm",
            isValid && !isSubmitting
              ? "bg-[var(--cyan)] text-black hover:opacity-90"
              : "bg-card border border-border text-muted-foreground cursor-not-allowed opacity-50"
          )}
        >
          {state === "submitting" && <span className="flex items-center justify-center gap-2"><Loader2 size={12} className="animate-spin" /> Sending transaction...</span>}
          {state === "confirming" && <span className="flex items-center justify-center gap-2"><Loader2 size={12} className="animate-spin" /> Waiting for finalization...</span>}
          {(state === "idle" || state === "error") && "Post Task Onchain"}
        </button>
      </div>
    </div>
  );
}
