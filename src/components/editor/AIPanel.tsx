"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editor";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Wand2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Block } from "@/lib/blocks/types";

const QUICK_PROMPTS = [
  "SaaS product launch for a project management tool",
  "Lead magnet for a marketing newsletter",
  "Online course about productivity",
  "Coaching service for first-time founders",
  "Mobile app for tracking daily habits",
  "Webinar registration for AI in business",
];

export function AIPanel() {
  const aiPrompt = useEditorStore((s) => s.aiPrompt);
  const setAiPrompt = useEditorStore((s) => s.setAiPrompt);
  const aiGenerating = useEditorStore((s) => s.aiGenerating);
  const setAiGenerating = useEditorStore((s) => s.setAiGenerating);
  const insertBlocks = useEditorStore((s) => s.insertBlocks);
  const replaceBlock = useEditorStore((s) => s.replaceBlock);
  const selectedId = useEditorStore((s) => s.selectedBlockId);
  const blocks = useEditorStore((s) => s.blocks);

  async function generatePage() {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.blocks) {
        insertBlocks(data.blocks as Block[]);
        setAiPrompt("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  }

  async function improveSelection() {
    if (!selectedId) return;
    const block = blocks.find((b) => b.id === selectedId);
    if (!block) return;
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai/improve-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: block.type,
          props: block.props,
          instruction: aiPrompt || "Improve the copy to be more compelling and clear",
        }),
      });
      const data = await res.json();
      if (data.props) {
        replaceBlock(block.id, { ...block, props: data.props });
        setAiPrompt("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 mb-1">
          <div className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_0_16px_-2px_rgba(139,92,246,0.5)]">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-white">AI Co-designer</h3>
        </div>
        <p className="text-xs text-white/50">
          {selectedId
            ? "Refine the selected block, or generate a new page below."
            : "Describe what you want to build and AI will generate it."}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="wait">
          {aiGenerating && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-100"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generating…
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <Textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder={
              selectedId
                ? "Make this more punchy, add urgency, sound more confident…"
                : "An AI landing page builder that turns voice memos into live pages in 90 seconds…"
            }
            rows={5}
            className="resize-none"
          />
          <div className="mt-2 flex flex-col gap-1.5">
            {selectedId && (
              <Button
                variant="primary"
                size="sm"
                onClick={improveSelection}
                disabled={aiGenerating}
                className="w-full"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Improve selection
              </Button>
            )}
            <Button
              variant={selectedId ? "secondary" : "primary"}
              size="sm"
              onClick={generatePage}
              disabled={aiGenerating || !aiPrompt.trim()}
              className="w-full"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {selectedId ? "Generate new page" : "Generate page"}
            </Button>
          </div>
        </div>

        {!selectedId && (
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/40 font-medium mb-2">
              <MessageSquare className="h-3 w-3" />
              Try one of these
            </div>
            <div className="space-y-1.5">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setAiPrompt(p)}
                  className="block w-full text-left text-xs text-white/70 hover:text-white rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] px-3 py-2 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-violet-500/[0.04] to-indigo-500/[0.04] p-3">
          <div className="text-[10px] uppercase tracking-wider text-violet-300/70 font-medium mb-1.5">
            Pro tip
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Mention your <span className="text-white">audience</span>, the{" "}
            <span className="text-white">problem</span> you solve, and your{" "}
            <span className="text-white">offer</span>. The more specific, the
            better the page.
          </p>
        </div>
      </div>
    </div>
  );
}
