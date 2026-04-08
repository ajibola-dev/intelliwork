"use client";

import { useState, useEffect } from "react";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { getReadClient, CONTRACTS } from "@/lib/genlayer";
import { TaskCard } from "@/components/ui/task-card";
import { AddressTag } from "@/components/ui/address-tag";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AgentDashboard() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { tasks, loading, error } = useTasks();
  const [repScore, setRepScore] = useState<number | null>(null);
  const [completedCount, setCompletedCount] = useState<number | null>(null);

  const myTasks = tasks.filter(
    (t) => t.agent?.toLowerCase() === address?.toLowerCase()
  );

  useEffect(() => {
    if (!address) return;
    const addr: string = address;
    async function fetchRep() {
      try {
        const client = getReadClient();
        const [score, count] = await Promise.all([
          client.readContract({
            address: CONTRACTS.work,
            functionName: "get_agent_completed_count",
            args: [addr],
          }),
          client.readContract({
            address: CONTRACTS.work,
            functionName: "get_agent_completed_count",
            args: [addr],
          }),
        ]);
        setCompletedCount(Number(count));
      } catch {
        // reputation not available
      }
    }
    fetchRep();
  }, [address]);

  if (!isConnected) return (
    <div className="max-w-2xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
      <AlertCircle size={20} className="text-[var(--cyan)]" />
      <div>
        <h2 className="font-heading text-2xl text-foreground mb-2">Wallet required</h2>
        <p className="font-mono text-sm text-muted-foreground">Connect to view your agent dashboard.</p>
      </div>
      <button
        onClick={() => connect({ connector: injected() })}
        className="px-6 py-3 bg-[var(--cyan)] text-black font-mono text-xs font-bold tracking-[0.1em] uppercase hover:opacity-90 rounded-sm"
      >
        Connect Wallet
      </button>
    </div>
  );

  const stats = {
    claimed: myTasks.filter((t) => t.status === "CLAIMED").length,
    submitted: myTasks.filter((t) => t.status === "SUBMITTED").length,
    complete: myTasks.filter((t) => t.status === "COMPLETE").length,
    disputed: myTasks.filter((t) => t.status === "DISPUTED").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-[var(--cyan)]">Dashboard</span>
          <h1 className="font-heading text-4xl text-foreground mt-1">Agent</h1>
          <div className="mt-2"><AddressTag address={address!} copyable /></div>
        </div>
        <Link
          href="/tasks"
          className="shrink-0 px-5 py-2.5 border border-[var(--cyan)]/40 text-[var(--cyan)] font-mono text-xs tracking-[0.1em] uppercase hover:bg-[var(--cyan)]/8 rounded-sm"
        >
          Browse Tasks
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border mb-8">
        {[
          { label: "Claimed", value: stats.claimed },
          { label: "Submitted", value: stats.submitted },
          { label: "Complete", value: stats.complete },
          { label: "Disputed", value: stats.disputed },
        ].map(({ label, value }) => (
          <div key={label} className="bg-background px-6 py-4">
            <span className="font-mono text-2xl font-bold text-foreground block">{value}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Reputation */}
      {completedCount !== null && (
        <div className="border border-[var(--cyan)]/15 bg-card p-5 mb-8 flex items-center justify-between rounded-sm">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground block mb-1">
              Tasks Completed
            </span>
            <span className="font-mono text-3xl font-bold text-[var(--cyan)]">{completedCount}</span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground/50 uppercase tracking-wider">
            Onchain · WorkContract
          </span>
        </div>
      )}

      {/* Task list */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 size={16} className="animate-spin text-[var(--cyan)]" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Loading...</span>
        </div>
      )}

      {!loading && !error && myTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-border rounded-sm">
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">No tasks claimed yet</span>
          <Link href="/tasks" className="font-mono text-xs text-[var(--cyan)] hover:underline">Browse open tasks →</Link>
        </div>
      )}

      {!loading && !error && myTasks.length > 0 && (
        <div className="flex flex-col gap-px bg-border">
          {myTasks.map((task) => (
            <div key={task.id} className="bg-background">
              <TaskCard
                id={task.id} title={task.title} description={task.description}
                requirements={task.requirements} reward={task.reward_gen}
                status={task.status} requester={task.requester} agent={task.agent}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
