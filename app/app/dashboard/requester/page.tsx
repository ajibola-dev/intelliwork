"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { TaskCard } from "@/components/ui/task-card";
import { StatusBadge, TaskStatus } from "@/components/ui/status-badge";
import { AddressTag } from "@/components/ui/address-tag";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

const STATUS_ORDER: TaskStatus[] = ["DISPUTED", "SUBMITTED", "CLAIMED", "OPEN", "COMPLETE"];

export default function RequesterDashboard() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { tasks, loading, error } = useTasks();

  const myTasks = tasks
    .filter((t) => t.requester?.toLowerCase() === address?.toLowerCase())
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));

  const stats = {
    total: myTasks.length,
    open: myTasks.filter((t) => t.status === "OPEN").length,
    active: myTasks.filter((t) => ["CLAIMED", "SUBMITTED"].includes(t.status)).length,
    disputed: myTasks.filter((t) => t.status === "DISPUTED").length,
    complete: myTasks.filter((t) => t.status === "COMPLETE").length,
  };

  if (!isConnected) return (
    <div className="max-w-2xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
      <AlertCircle size={20} className="text-[var(--cyan)]" />
      <div>
        <h2 className="font-heading text-2xl text-foreground mb-2">Wallet required</h2>
        <p className="font-mono text-sm text-muted-foreground">Connect to view your requester dashboard.</p>
      </div>
      <button
        onClick={() => connect({ connector: injected() })}
        className="px-6 py-3 bg-[var(--cyan)] text-black font-mono text-xs font-bold tracking-[0.1em] uppercase hover:opacity-90 rounded-sm"
      >
        Connect Wallet
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-[var(--cyan)]">Dashboard</span>
          <h1 className="font-heading text-4xl text-foreground mt-1">Requester</h1>
          <div className="mt-2"><AddressTag address={address!} copyable /></div>
        </div>
        <Link
          href="/tasks/post"
          className="shrink-0 px-5 py-2.5 bg-[var(--cyan)] text-black font-mono text-xs font-bold tracking-[0.1em] uppercase hover:opacity-90 rounded-sm"
        >
          + Post Task
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-border mb-8">
        {[
          { label: "Total", value: stats.total },
          { label: "Open", value: stats.open },
          { label: "Active", value: stats.active },
          { label: "Disputed", value: stats.disputed },
          { label: "Complete", value: stats.complete },
        ].map(({ label, value }) => (
          <div key={label} className="bg-background px-6 py-4">
            <span className="font-mono text-2xl font-bold text-foreground block">{value}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Tasks */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 size={16} className="animate-spin text-[var(--cyan)]" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Loading...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-20 gap-3">
          <AlertCircle size={16} className="text-[var(--verdict-reject)]" />
          <span className="font-mono text-xs text-muted-foreground">{error}</span>
        </div>
      )}

      {!loading && !error && myTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-border rounded-sm">
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">No tasks posted yet</span>
          <Link href="/tasks/post" className="font-mono text-xs text-[var(--cyan)] hover:underline">Post your first task →</Link>
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
