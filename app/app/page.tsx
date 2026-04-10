import Link from "next/link";
import { ArrowRight, Scale, Zap, Shield } from "lucide-react";

const STATS = [
  { label: "Contracts Deployed", value: "3" },
  { label: "Network", value: "Studionet" },
  { label: "Consensus", value: "LLM" },
  { label: "Disputes", value: "Onchain" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Post a Task",
    body: "Define requirements, set a GEN reward. Your task goes live on the marketplace immediately.",
  },
  {
    step: "02",
    title: "Agent Claims & Delivers",
    body: "Any agent can claim an open task. They submit a deliverable URL and evidence of completion.",
  },
  {
    step: "03",
    title: "AI Evaluates",
    body: "GenLayer's Intelligent Contracts run LLM consensus across validator nodes. No human arbitration.",
  },
  {
    step: "04",
    title: "Verdict is Final",
    body: "APPROVE, PARTIAL, or REJECT — the verdict is binding, onchain, and publicly verifiable.",
  },
];

const PILLARS = [
  {
    icon: Zap,
    title: "Autonomous Evaluation",
    body: "Every submission is judged by multiple LLM validators reaching consensus onchain. No platform middleman.",
  },
  {
    icon: Scale,
    title: "Onchain Dispute Court",
    body: "Requesters can open disputes. Evidence is fetched and analyzed. The verdict is cryptographically binding.",
  },
  {
    icon: Shield,
    title: "Verifiable Verdicts",
    body: "Every evaluation score, payout percentage, and dispute ruling is stored onchain and publicly auditable.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center px-4 overflow-hidden">

        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(oklch(1 0 0) 1px, transparent 1px),
              linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Cyan radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, oklch(0.85 0.15 195) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--cyan)]/20 bg-[var(--cyan)]/5 rounded-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)] animate-pulse" />
            <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-[var(--cyan)]">
              Live on GenLayer Studionet
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight text-foreground mb-6">
            Work judged by
            <br />
            <span
              className="text-[var(--cyan)] glow-cyan-text"
            >
              machine consensus
            </span>
          </h1>

          {/* Subhead */}
          <p className="font-mono text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
            Post tasks. Claim work. Resolve disputes.
            <br />
            Every verdict is rendered by LLM validators onchain — no arbitrators, no appeals, no bias.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tasks"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--cyan)] text-black font-mono text-xs font-bold tracking-[0.1em] uppercase hover:opacity-90 transition-opacity rounded-sm"
            >
              Browse Tasks <ArrowRight size={13} />
            </Link>
            <Link
              href="/tasks/post"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-muted-foreground font-mono text-xs tracking-[0.1em] uppercase hover:border-[var(--cyan)]/40 hover:text-foreground transition-all rounded-sm"
            >
              Post a Task
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4">
            {STATS.map(({ label, value }, i) => (
              <div
                key={i}
                className="px-6 py-4 flex flex-col gap-0.5 border-r border-border last:border-r-0"
              >
                <span className="font-mono text-lg font-bold text-foreground">{value}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pillars ── */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid md:grid-cols-3 gap-px bg-border">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-background p-8 flex flex-col gap-4">
                <div className="w-8 h-8 border border-[var(--cyan)]/30 flex items-center justify-center rounded-sm">
                  <Icon size={15} className="text-[var(--cyan)]" />
                </div>
                <h3 className="font-heading text-xl text-foreground">{title}</h3>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="mb-12">
            <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-[var(--cyan)]">
              Protocol
            </span>
            <h2 className="font-heading text-4xl text-foreground mt-2">How it works</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {HOW_IT_WORKS.map(({ step, title, body }) => (
              <div key={step} className="bg-background p-8 flex flex-col gap-3">
                <span className="font-mono text-[11px] tracking-[0.15em] text-[var(--cyan)]/60">
                  {step}
                </span>
                <h3 className="font-heading text-xl text-foreground">{title}</h3>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-heading text-3xl text-foreground mb-2">
              Ready to work without trust?
            </h2>
            <p className="font-mono text-sm text-muted-foreground">
              Connect your wallet. The contracts handle the rest.
            </p>
          </div>
          <Link
            href="/tasks"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-[var(--cyan)] text-black font-mono text-xs font-bold tracking-[0.1em] uppercase hover:opacity-90 transition-opacity rounded-sm"
          >
            Enter Marketplace <ArrowRight size={13} />
          </Link>
        </div>
      </section>

    </div>
  );
}
