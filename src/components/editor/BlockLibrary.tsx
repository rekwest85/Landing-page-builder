"use client";

import * as React from "react";
import {
  Sparkles,
  LayoutGrid,
  Heading2,
  Type,
  Image as ImageIcon,
  Video,
  Quote,
  CreditCard,
  HelpCircle,
  Megaphone,
  Mail,
  Award,
  BarChart3,
  Timer,
  Square,
  Columns3,
  Minus,
  Search,
  TrendingUp,
  Activity,
  PieChart,
  ArrowRightLeft,
  Zap,
} from "lucide-react";
import { BLOCK_CATEGORIES, BLOCK_DEFINITIONS, type BlockType } from "@/lib/blocks/types";
import { useEditorStore } from "@/stores/editor";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  LayoutGrid,
  Heading2,
  Type,
  Image: ImageIcon,
  Video,
  Quote,
  CreditCard,
  HelpCircle,
  Megaphone,
  Mail,
  Award,
  BarChart3,
  Timer,
  Square,
  Columns3,
  Minus,
  TrendingUp,
  Activity,
  PieChart,
  ArrowRightLeft,
  Zap,
};

export function BlockLibrary() {
  const addBlock = useEditorStore((s) => s.addBlock);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase();
    return Object.values(BLOCK_DEFINITIONS).filter(
      (b) =>
        !q ||
        b.label.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = React.useMemo(() => {
    const out: Record<string, typeof filtered> = {};
    for (const cat of BLOCK_CATEGORIES) {
      out[cat.id] = filtered.filter((b) => b.category === cat.id);
    }
    return out;
  }, [filtered]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/[0.06]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blocks…"
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-violet-500/40"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {BLOCK_CATEGORIES.map((cat) => {
          const items = grouped[cat.id] ?? [];
          if (items.length === 0) return null;
          return (
            <div key={cat.id}>
              <div className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-2 px-1">
                {cat.label}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {items.map((block) => {
                  const Icon = ICON_MAP[block.icon] ?? Square;
                  return (
                    <button
                      key={block.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          "application/x-forge-block",
                          block.type
                        );
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      onClick={() => addBlock(block.type as BlockType)}
                      className={cn(
                        "group flex flex-col items-start gap-1.5 p-2.5 rounded-lg cursor-grab active:cursor-grabbing",
                        "border border-white/[0.06] bg-white/[0.02]",
                        "hover:bg-white/[0.05] hover:border-violet-500/30 hover:shadow-[0_0_24px_-8px_rgba(139,92,246,0.4)]",
                        "transition-all text-left"
                      )}
                    >
                      <Icon className="h-4 w-4 text-white/60 group-hover:text-violet-300 transition-colors" />
                      <div className="text-[11px] font-medium text-white/80 group-hover:text-white leading-tight">
                        {block.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
