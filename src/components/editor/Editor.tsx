"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editor";
import { EditorTopBar } from "./EditorTopBar";
import { BlockLibrary } from "./BlockLibrary";
import { EditorCanvas } from "./EditorCanvas";
import { RightPanel } from "./RightPanel";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Block } from "@/lib/blocks/types";

export function Editor({
  pageId,
  slug,
  title,
  blocks,
}: {
  pageId: string;
  slug: string;
  title: string;
  blocks: Block[];
}) {
  const setPage = useEditorStore((s) => s.setPage);

  React.useEffect(() => {
    setPage(pageId, slug, title, blocks);
  }, [pageId, slug, title, blocks, setPage]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-screen flex flex-col bg-[#0a0a0f]">
        <EditorTopBar />
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Block library */}
          <aside className="w-64 shrink-0 border-r border-white/[0.06] bg-[#0c0c14]">
            <BlockLibrary />
          </aside>

          {/* Center: Canvas */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <EditorCanvas />
          </main>

          {/* Right: Properties / Style / AI */}
          <aside className="w-80 shrink-0">
            <RightPanel />
          </aside>
        </div>
      </div>
    </TooltipProvider>
  );
}
