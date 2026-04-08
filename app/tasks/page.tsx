"use client";

import { useState } from "react";
import { useTasks } from "@/lib/hooks/use-tasks";
import { TaskCard } from "@/components/ui/task-card";
import { TaskStatus } from "@/components/ui/status-badge";
import { Loader2, AlertCircle, Search } from "lucide-react";
import Link from "next/link";

const STATUS_FILTERS: { label: string; value: TaskStatus | "ALL" }[] = [
  { label: "All",       value: "ALL"       },
  { label: "Open",      value: "OPEN"      },
  { label: "Claimed",   value: "CLAIMED"   },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Disputed",  value: "DISPUTED"  },
  { label: "Complete",  value: "COMPLETE"  },
];

export default function TasksPage() {
  const { tasks, loading, error } = useTasks();
  const [filter, setFilter] = useState<TaskStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filtered = tasks.filter((t) => {
    const matchesStatus = filter === "ALL" || t.status === filter;
    const matchesSearch =
      search.trim() === "" ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-[var(--cyan)]">
            Marketplace
          </span>
          <h1 className="font-heading text-4xl text-foreground mt-1">Open Tasks</h1>
        </div>
        <Link
          href="/tasks/post"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--cyan)] text-black font-mono text-xs font-bold tracking-[0.1em] uppercase hover:opacity-90 transition-opacity rounded-sm"
        >
          + Post Task
        </Link>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Status filters */}
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={[
                "px-3 py-1.5 font-mono text-[11px] tracking-wider uppercase border transition-all rounded-sm",
                filter === value
                  ? "border-[var(--cyan)] text-[var(--cyan)] bg-[var(--cyan)]/8"
                  : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto">
          <Search
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-8 pr-4 py-1.5 bg-card border border-border font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--cyan)]/40 rounded-sm"
          />
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 size={20} className="animate-spin text-[var(--cyan)]" />
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">
            Fetching tasks from Studionet...
          </span>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <AlertCircle size={20} className="text-[var(--verdict-reject)]" />
          <span className="font-mono text-xs text-muted-foreground">{error}</span>
          <span className="font-mono text-[11px] text-muted-foreground/50">
            Make sure Studionet is reachable
          </span>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 border border-dashed border-border rounded-sm">
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">
            {tasks.length === 0 ? "No tasks posted yet" : "No tasks match your filter"}
          </span>
          {tasks.length === 0 && (
            <Link
              href="/tasks/post"
              className="font-mono text-xs text-[var(--cyan)] hover:underline"
            >
              Be the first to post one →
            </Link>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="font-mono text-[11px] text-muted-foreground mb-4 tracking-wider">
            {filtered.length} task{filtered.length !== 1 ? "s" : ""}
            {filter !== "ALL" && ` · ${filter}`}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {filtered.map((task) => (
              <div key={task.id} className="bg-background">
                <TaskCard
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  requirements={task.requirements}
                  reward={task.reward_gen}
                  status={task.status}
                  requester={task.requester}
                  agent={task.agent}
                />
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
