"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editor";
import { cn } from "@/lib/utils";
import { Trash2, Copy, ChevronUp, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BLOCK_DEFINITIONS } from "@/lib/blocks/types";

export function BlockOutline({ children }: { children: React.ReactNode }) {
  const blocks = useEditorStore((s) => s.blocks);
  const selectedId = useEditorStore((s) => s.selectedBlockId);
  const hoveredId = useEditorStore((s) => s.hoveredBlockId);
  const setSelected = useEditorStore((s) => s.setSelected);
  const setHovered = useEditorStore((s) => s.setHovered);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const moveBlock = useEditorStore((s) => s.moveBlock);
  const addBlock = useEditorStore((s) => s.addBlock);

  return (
    <div className="relative">
      {blocks.map((block, i) => {
        const isSelected = selectedId === block.id;
        const isHovered = hoveredId === block.id;
        return (
          <div
            key={block.id}
            className="relative group/block"
            onMouseEnter={() => setHovered(block.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(block.id);
            }}
          >
            {/* Selection outline */}
            <div
              className={cn(
                "absolute inset-0 pointer-events-none transition-all z-10",
                isSelected
                  ? "ring-2 ring-violet-500 ring-offset-0 shadow-[0_0_0_4px_rgba(139,92,246,0.15)]"
                  : isHovered
                    ? "ring-1 ring-violet-400/60"
                    : "ring-0"
              )}
            />

            {/* Block label badge (top-left) */}
            {(isSelected || isHovered) && (
              <div
                className={cn(
                  "absolute -top-7 left-2 z-20 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium",
                  "bg-[#14141a] border border-violet-500/40 text-white shadow-lg"
                )}
              >
                {BLOCK_DEFINITIONS[block.type]?.label ?? block.type}
              </div>
            )}

            {/* Floating actions (top-right) */}
            {isSelected && (
              <div className="absolute -top-7 right-2 z-20 flex items-center gap-0.5 rounded-md bg-[#14141a] border border-white/[0.08] p-0.5 shadow-lg">
                <ActionBtn
                  title="Move up"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBlock(block.id, "up");
                  }}
                >
                  <ChevronUp className="h-3 w-3" />
                </ActionBtn>
                <ActionBtn
                  title="Move down"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBlock(block.id, "down");
                  }}
                >
                  <ChevronDown className="h-3 w-3" />
                </ActionBtn>
                <ActionBtn
                  title="Duplicate"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateBlock(block.id);
                  }}
                >
                  <Copy className="h-3 w-3" />
                </ActionBtn>
                <ActionBtn
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBlock(block.id);
                  }}
                  danger
                >
                  <Trash2 className="h-3 w-3" />
                </ActionBtn>
              </div>
            )}

            {/* Insert button between blocks */}
            {(isHovered || isSelected) && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover/block:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlock("heading", i + 1);
                  }}
                  className="flex items-center justify-center h-6 w-6 rounded-full bg-violet-500 text-white shadow-lg shadow-violet-500/40 hover:scale-110 transition-transform"
                  title="Insert block below"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* The actual rendered block */}
            {children}
          </div>
        );
      })}
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "h-6 w-6 inline-flex items-center justify-center rounded text-white/60 hover:text-white",
        danger && "hover:bg-red-500/20 hover:text-red-300",
        !danger && "hover:bg-white/[0.08]"
      )}
    >
      {children}
    </button>
  );
}
