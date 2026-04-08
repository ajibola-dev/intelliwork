"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";

interface AddressTagProps {
  address: string;
  truncate?: boolean;
  copyable?: boolean;
  className?: string;
}

export function AddressTag({
  address,
  truncate = true,
  copyable = false,
  className,
}: AddressTagProps) {
  const [copied, setCopied] = useState(false);

  const display = truncate
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : address;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground",
        copyable && "cursor-pointer hover:text-foreground transition-colors",
        className
      )}
      onClick={copyable ? handleCopy : undefined}
      title={address}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-cyan shrink-0" />
      {display}
      {copyable && (
        copied
          ? <Check size={11} className="text-[var(--verdict-approve)]" />
          : <Copy size={11} className="opacity-40" />
      )}
    </span>
  );
}
