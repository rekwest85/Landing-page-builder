"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editor";
import { BlockOutline } from "./BlockOutline";
import { cn } from "@/lib/utils";

const VIEWPORT_WIDTHS = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

export function EditorCanvas() {
  const blocks = useEditorStore((s) => s.blocks);
  const viewMode = useEditorStore((s) => s.viewMode);
  const setSelected = useEditorStore((s) => s.setSelected);

  return (
    <div
      className="flex-1 overflow-auto bg-[#0a0a0f]"
      onClick={() => setSelected(null)}
    >
      <div
        className={cn(
          "mx-auto my-8 transition-all duration-300",
          "bg-white text-[#0a0a0f]",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_48px_-12px_rgba(0,0,0,0.6)]",
          "min-h-[calc(100vh-8rem)]"
        )}
        style={{ width: VIEWPORT_WIDTHS[viewMode], maxWidth: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        {blocks.length === 0 ? (
          <EmptyState />
        ) : (
          <BlockOutline blocks={blocks} />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  const addBlock = useEditorStore((s) => s.addBlock);
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-32 min-h-[60vh]">
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_0_32px_-6px_rgba(139,92,246,0.5)] mb-6">
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-white">
          <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" fill="currentColor" />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold text-[#0a0a0f] mb-2">
        Start building your page
      </h2>
      <p className="text-sm text-[#0a0a0f]/60 max-w-md mb-8">
        Add your first block from the library on the left, or describe your idea to AI and let it generate the foundation.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => addBlock("hero")}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-violet-500 to-indigo-600 text-white px-5 py-2.5 text-sm font-medium shadow-[0_0_24px_-6px_rgba(139,92,246,0.6)] hover:from-violet-400 hover:to-indigo-500 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" fill="currentColor" />
          </svg>
          Add hero section
        </button>
        <button
          onClick={() => addBlock("features")}
          className="inline-flex items-center gap-2 rounded-full border border-[#0a0a0f]/10 bg-[#0a0a0f]/5 px-5 py-2.5 text-sm font-medium text-[#0a0a0f] hover:bg-[#0a0a0f]/10 transition-all"
        >
          Add features
        </button>
        <button
          onClick={() => addBlock("pricing")}
          className="inline-flex items-center gap-2 rounded-full border border-[#0a0a0f]/10 bg-[#0a0a0f]/5 px-5 py-2.5 text-sm font-medium text-[#0a0a0f] hover:bg-[#0a0a0f]/10 transition-all"
        >
          Add pricing
        </button>
      </div>
    </div>
  );
}
