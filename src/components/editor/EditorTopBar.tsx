"use client";

import * as React from "react";
import { useEditorStore, type ViewMode } from "@/stores/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Tablet, Smartphone, Eye, Share2, Rocket, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function EditorTopBar() {
  const pageTitle = useEditorStore((s) => s.pageTitle);
  const blocks = useEditorStore((s) => s.blocks);
  const pageId = useEditorStore((s) => s.pageId);
  const viewMode = useEditorStore((s) => s.viewMode);
  const setViewMode = useEditorStore((s) => s.setViewMode);
  const isDirty = useEditorStore((s) => s.isDirty);

  const [title, setTitle] = React.useState(pageTitle);
  React.useEffect(() => setTitle(pageTitle), [pageTitle]);

  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);

  async function save() {
    if (!pageId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tree: blocks }),
      });
      if (!res.ok) throw new Error("Save failed");
      useEditorStore.getState().markClean();
      toast.success("Saved");
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!pageId) return;
    setPublishing(true);
    try {
      await save();
      const res = await fetch(`/api/pages/${pageId}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Publish failed");
      toast.success("Published!", {
        description: data.url,
        action: {
          label: "View",
          onClick: () => window.open(data.url, "_blank"),
        },
      });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to publish");
    } finally {
      setPublishing(false);
    }
  }

  async function share() {
    if (!pageId) return;
    const url = `${window.location.origin}/p/${pageId}`;
    await navigator.clipboard.writeText(url);
    toast.success("Preview link copied to clipboard");
  }

  // Auto-save every 5s when dirty
  React.useEffect(() => {
    if (!isDirty) return;
    const t = setTimeout(save, 5000);
    return () => clearTimeout(t);
  }, [isDirty, blocks, title]);

  // Save on Cmd/Ctrl+S
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [blocks, title, pageId]);

  return (
    <div className="flex items-center gap-3 h-12 px-3 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-md">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_0_12px_-2px_rgba(139,92,246,0.5)]">
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-white">
            <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" fill="currentColor" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-white">Forge</span>
      </div>

      {/* Page title */}
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={save}
        className="max-w-xs h-8 text-sm bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/[0.08] focus-visible:bg-white/[0.04]"
      />

      {/* Save status */}
      <div className="text-xs text-white/40">
        {saving ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving…
          </span>
        ) : isDirty ? (
          "Unsaved changes"
        ) : (
          "All saved"
        )}
      </div>

      <div className="flex-1" />

      {/* View modes */}
      <div className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.02] p-0.5">
        <ViewModeBtn current={viewMode} target="desktop" onClick={() => setViewMode("desktop")}>
          <Monitor className="h-3.5 w-3.5" />
        </ViewModeBtn>
        <ViewModeBtn current={viewMode} target="tablet" onClick={() => setViewMode("tablet")}>
          <Tablet className="h-3.5 w-3.5" />
        </ViewModeBtn>
        <ViewModeBtn current={viewMode} target="mobile" onClick={() => setViewMode("mobile")}>
          <Smartphone className="h-3.5 w-3.5" />
        </ViewModeBtn>
      </div>

      {/* Actions */}
      <Button variant="ghost" size="sm" onClick={share}>
        <Share2 className="h-3.5 w-3.5" />
        Share
      </Button>
      <Button variant="primary" size="sm" onClick={publish} disabled={publishing}>
        {publishing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Rocket className="h-3.5 w-3.5" />
        )}
        Publish
      </Button>
    </div>
  );
}

function ViewModeBtn({
  current,
  target,
  onClick,
  children,
}: {
  current: ViewMode;
  target: ViewMode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-7 w-8 inline-flex items-center justify-center rounded-md transition-all",
        current === target
          ? "bg-white/[0.08] text-white"
          : "text-white/40 hover:text-white/70"
      )}
    >
      {children}
    </button>
  );
}
