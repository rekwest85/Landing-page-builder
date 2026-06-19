"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const COLOR_PRESETS = [
  "#0a0a0f",
  "#14141a",
  "#1c1c24",
  "#ffffff",
  "#f5f5f7",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "transparent",
];

const BG_PRESETS = [
  "#0a0a0f",
  "#14141a",
  "#ffffff",
  "#fafafa",
  "linear-gradient(180deg, #0a0a0f 0%, #14141a 100%)",
  "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
  "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
  "linear-gradient(180deg, #fafafa 0%, #ffffff 100%)",
];

export function StylePanel() {
  const blocks = useEditorStore((s) => s.blocks);
  const selectedId = useEditorStore((s) => s.selectedBlockId);
  const updateBlockStyle = useEditorStore((s) => s.updateBlockStyle);

  const block = blocks.find((b) => b.id === selectedId);

  if (!block) {
    return (
      <div className="p-6 text-center">
        <div className="text-sm text-white/40">
          Select a block to edit its style
        </div>
      </div>
    );
  }

  const style = block.style ?? {};

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/[0.06]">
        <span className="text-xs text-white/40 uppercase tracking-wider font-medium">
          Style
        </span>
        <h3 className="text-base font-semibold text-white mt-1">
          {block.type}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <label className="block text-xs font-medium text-white/70 mb-2">
            Background
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {BG_PRESETS.map((bg) => (
              <button
                key={bg}
                onClick={() => updateBlockStyle(block.id, { background: bg })}
                className={cn(
                  "h-12 rounded-lg border transition-all",
                  style.background === bg
                    ? "border-violet-500 ring-2 ring-violet-500/30"
                    : "border-white/[0.08] hover:border-white/[0.16]"
                )}
                style={{ background: bg }}
                title={bg}
              />
            ))}
          </div>
          <Input
            value={style.background ?? ""}
            onChange={(e) => updateBlockStyle(block.id, { background: e.target.value })}
            placeholder="Or paste custom: linear-gradient(...)"
            className="mt-2 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/70 mb-2">
            Text color
          </label>
          <div className="grid grid-cols-6 gap-1.5">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => updateBlockStyle(block.id, { color })}
                className={cn(
                  "h-8 rounded-md border transition-all",
                  style.color === color
                    ? "border-violet-500 ring-2 ring-violet-500/30"
                    : "border-white/[0.08] hover:border-white/[0.16]"
                )}
                style={{ background: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/70 mb-1.5">
            Padding
          </label>
          <Input
            value={style.padding ?? ""}
            onChange={(e) => updateBlockStyle(block.id, { padding: e.target.value })}
            placeholder="80px 24px"
            className="text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/70 mb-1.5">
            Max width
          </label>
          <Input
            value={style.maxWidth ?? ""}
            onChange={(e) => updateBlockStyle(block.id, { maxWidth: e.target.value })}
            placeholder="1200px"
            className="text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/70 mb-2">
            Text align
          </label>
          <div className="grid grid-cols-3 gap-1">
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                onClick={() => updateBlockStyle(block.id, { textAlign: align })}
                className={cn(
                  "h-8 rounded-md text-xs font-medium border transition-all",
                  style.textAlign === align
                    ? "bg-violet-500/20 border-violet-500/40 text-violet-100"
                    : "bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05]"
                )}
              >
                {align}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
