"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { cn } from "@/lib/utils";
import { AddressTag } from "@/components/ui/address-tag";
import { Loader2 } from "lucide-react";

const NAV_LINKS = [
  { href: "/tasks",                label: "Marketplace" },
  { href: "/tasks/post",           label: "Post Task"   },
  { href: "/dashboard/requester",  label: "Requester"   },
  { href: "/dashboard/agent",      label: "Agent"       },
];

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">

        {/* Wordmark */}
        <Link
          href="/"
          className="font-heading text-xl text-foreground hover:text-[var(--cyan)] transition-colors shrink-0"
        >
          IntelliWork
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-1.5 font-mono text-xs tracking-wider uppercase transition-colors rounded-sm",
                pathname === href || pathname.startsWith(href + "/")
                  ? "text-[var(--cyan)] bg-[var(--cyan)]/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/4"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Wallet */}
        <div className="shrink-0">
          {isConnected && address ? (
            <button
              onClick={() => disconnect()}
              className="flex items-center gap-2 px-3 py-1.5 border border-border hover:border-[var(--status-disputed)]/50 hover:text-[var(--status-disputed)] transition-colors rounded-sm"
              title="Disconnect wallet"
            >
              <AddressTag address={address} truncate copyable={false} />
            </button>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              disabled={isPending}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 font-mono text-xs tracking-wider uppercase border transition-all rounded-sm",
                "border-[var(--cyan)]/40 text-[var(--cyan)] hover:bg-[var(--cyan)]/8 hover:border-[var(--cyan)]",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {isPending ? (
                <><Loader2 size={11} className="animate-spin" /> Connecting</>
              ) : (
                "Connect Wallet"
              )}
            </button>
          )}
        </div>

      </nav>
    </header>
  );
}
