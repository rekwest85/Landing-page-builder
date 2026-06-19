"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editor";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "design" as const, label: "Design" },
  { id: "style" as const, label: "Style" },
  { id: "ai" as const, label: "AI" },
];

export function RightPanel() {
  const tab = useEditorStore((s) => s.rightPanelTab);
  const setTab = useEditorStore((s) => s.setRightPanelTab);
  const selectedId = useEditorStore((s) => s.selectedBlockId);

  return (
    <div className="flex flex-col h-full border-l border-white/[0.06] bg-[#0c0c14]">
      <div className="flex items-center gap-0.5 px-2 pt-2 border-b border-white/[0.06]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative px-3 py-2 text-xs font-medium transition-colors",
              tab === t.id
                ? "text-white"
                : "text-white/40 hover:text-white/70"
            )}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute bottom-0 left-2 right-2 h-px bg-violet-400" />
            )}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        {tab === "design" && (
          <SelectedBlockKey selectedId={selectedId}>
            <DesignPanelContent />
          </SelectedBlockKey>
        )}
        {tab === "style" && <StyleContent />}
        {tab === "ai" && <AIContent />}
      </div>
    </div>
  );
}

function SelectedBlockKey({
  selectedId,
  children,
}: {
  selectedId: string | null;
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

function DesignPanelContent() {
  // Lazy import to avoid bundling
  const PropertyPanel = React.lazy(() =>
    import("./PropertyPanel").then((m) => ({ default: m.PropertyPanel }))
  );
  return (
    <React.Suspense fallback={null}>
      <PropertyPanel />
    </React.Suspense>
  );
}

function StyleContent() {
  const StylePanel = React.lazy(() =>
    import("./StylePanel").then((m) => ({ default: m.StylePanel }))
  );
  return (
    <React.Suspense fallback={null}>
      <StylePanel />
    </React.Suspense>
  );
}

function AIContent() {
  const AIPanel = React.lazy(() =>
    import("./AIPanel").then((m) => ({ default: m.AIPanel }))
  );
  return (
    <React.Suspense fallback={null}>
      <AIPanel />
    </React.Suspense>
  );
}
