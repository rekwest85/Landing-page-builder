"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
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
  const [confirming, setConfirming] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus the input when the confirm step appears
  React.useEffect(() => {
    if (confirming) inputRef.current?.focus();
  }, [confirming]);

  // Close confirmation on escape
  React.useEffect(() => {
    if (!confirming) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirming(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming]);

  async function handleDelete() {
    if (!inputRef.current) return;
    if (inputRef.current.value.trim() !== title) {
      toast.error("Type the page title exactly to confirm");
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/pages/${pageId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Page deleted");
      router.refresh();
      setConfirming(false);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to delete page");
    } finally {
      setDeleting(false);
    }
  }

  if (confirming) {
    return (
      <div
        className={cn(
          "flex flex-col gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/[0.06]",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[11px] text-red-200 leading-snug">
          Type <span className="font-semibold text-white">{title}</span> to confirm deletion. This permanently removes the page and all its versions.
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={title}
          className="w-full h-7 px-2 rounded-md bg-black/40 border border-red-500/30 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-red-400/60"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleDelete();
          }}
        />
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-7 rounded-md bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-[11px] font-medium transition-colors"
          >
            {deleting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
            Delete page
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirming(false);
            }}
            disabled={deleting}
            className="h-7 px-3 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-[11px] font-medium transition-colors"
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
        setConfirming(true);
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