"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function DeletePageButton({
  pageId,
  title,
  className,
}: {
  pageId: string;
  title: string;
  className?: string;
}) {
  const router = useRouter();
  const [stage, setStage] = React.useState<"idle" | "confirm" | "deleting">("idle");

  // Reset after 4s of inactivity in the confirm stage (prevents accidental clicks later)
  React.useEffect(() => {
    if (stage !== "confirm") return;
    const t = setTimeout(() => setStage("idle"), 4000);
    return () => clearTimeout(t);
  }, [stage]);

  // Close on escape
  React.useEffect(() => {
    if (stage !== "confirm") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setStage("idle");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage]);

  async function handleDelete() {
    setStage("deleting");
    try {
      const res = await fetch(`/api/pages/${pageId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Delete failed (HTTP ${res.status})`);
      }
      toast.success(`Deleted "${title}"`);
      setStage("idle");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to delete page");
      setStage("confirm");
    }
  }

  if (stage === "confirm" || stage === "deleting") {
    return (
      <div
        className={cn(
          "flex flex-col gap-1.5 p-2 rounded-lg border border-red-500/30 bg-red-500/[0.06] backdrop-blur-sm shadow-lg",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 text-[10px] text-red-200 leading-snug">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span>Delete this page permanently?</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDelete}
            disabled={stage === "deleting"}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-7 rounded-md bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-[11px] font-medium transition-colors"
          >
            {stage === "deleting" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
            Yes, delete
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStage("idle");
            }}
            disabled={stage === "deleting"}
            className="h-7 px-2.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-[11px] font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setStage("confirm");
      }}
      className={cn(
        "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md",
        "text-white/40 hover:text-red-300 hover:bg-red-500/10",
        "border border-transparent hover:border-red-500/30",
        "transition-colors text-[11px] font-medium",
        className
      )}
      title="Delete page"
      aria-label={`Delete ${title}`}
    >
      <Trash2 className="h-3 w-3" />
      Delete
    </button>
  );
}