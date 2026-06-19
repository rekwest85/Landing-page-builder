// Editor state — single source of truth for what's selected, view mode, AI panel open, etc.

import { create } from "zustand";
import type { Block } from "@/lib/blocks/types";
import { createBlock, cryptoRandomId } from "@/lib/blocks/types";

export type ViewMode = "desktop" | "tablet" | "mobile";
export type RightPanelTab = "design" | "ai" | "style";

interface EditorState {
  // Page data
  pageId: string | null;
  pageTitle: string;
  blocks: Block[];
  setPage: (pageId: string, title: string, blocks: Block[]) => void;

  // Selection
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  setSelected: (id: string | null) => void;
  setHovered: (id: string | null) => void;

  // Block operations
  addBlock: (type: any, index?: number) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  moveBlock: (id: string, direction: "up" | "down") => void;
  updateBlockProps: (id: string, props: Record<string, any>) => void;
  updateBlockStyle: (id: string, style: Record<string, any>) => void;
  replaceBlock: (id: string, block: Block) => void;
  insertBlocks: (blocks: Block[], index?: number) => void;

  // UI
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  rightPanelTab: RightPanelTab;
  setRightPanelTab: (t: RightPanelTab) => void;
  leftPanelOpen: boolean;
  toggleLeftPanel: () => void;

  // AI
  aiPrompt: string;
  setAiPrompt: (s: string) => void;
  aiGenerating: boolean;
  setAiGenerating: (b: boolean) => void;

  // Saving
  isDirty: boolean;
  markClean: () => void;
  markDirty: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  pageId: null,
  pageTitle: "",
  blocks: [],

  setPage: (pageId, pageTitle, blocks) =>
    set({ pageId, pageTitle, blocks, isDirty: false }),

  selectedBlockId: null,
  hoveredBlockId: null,
  setSelected: (id) => set({ selectedBlockId: id, rightPanelTab: "design" }),
  setHovered: (id) => set({ hoveredBlockId: id }),

  addBlock: (type, index) => {
    const newBlock = createBlock(type);
    const blocks = [...get().blocks];
    if (index == null) blocks.push(newBlock);
    else blocks.splice(index, 0, newBlock);
    set({ blocks, selectedBlockId: newBlock.id, isDirty: true });
  },

  removeBlock: (id) => {
    set({
      blocks: get().blocks.filter((b) => b.id !== id),
      selectedBlockId: null,
      isDirty: true,
    });
  },

  duplicateBlock: (id) => {
    const blocks = [...get().blocks];
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const original = blocks[idx];
    const copy: Block = {
      ...JSON.parse(JSON.stringify(original)),
      id: cryptoRandomId(),
    };
    blocks.splice(idx + 1, 0, copy);
    set({ blocks, selectedBlockId: copy.id, isDirty: true });
  },

  moveBlock: (id, direction) => {
    const blocks = [...get().blocks];
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    [blocks[idx], blocks[newIdx]] = [blocks[newIdx], blocks[idx]];
    set({ blocks, isDirty: true });
  },

  updateBlockProps: (id, props) => {
    set({
      blocks: get().blocks.map((b) =>
        b.id === id ? { ...b, props: { ...b.props, ...props } } : b
      ),
      isDirty: true,
    });
  },

  updateBlockStyle: (id, style) => {
    set({
      blocks: get().blocks.map((b) =>
        b.id === id ? { ...b, style: { ...(b.style ?? {}), ...style } } : b
      ),
      isDirty: true,
    });
  },

  replaceBlock: (id, block) => {
    set({
      blocks: get().blocks.map((b) => (b.id === id ? block : b)),
      isDirty: true,
    });
  },

  insertBlocks: (newBlocks, index) => {
    const blocks = [...get().blocks];
    if (index == null) blocks.push(...newBlocks);
    else blocks.splice(index, 0, ...newBlocks);
    set({ blocks, isDirty: true });
  },

  viewMode: "desktop",
  setViewMode: (m) => set({ viewMode: m }),
  rightPanelTab: "design",
  setRightPanelTab: (t) => set({ rightPanelTab: t }),
  leftPanelOpen: true,
  toggleLeftPanel: () => set({ leftPanelOpen: !get().leftPanelOpen }),

  aiPrompt: "",
  setAiPrompt: (s) => set({ aiPrompt: s }),
  aiGenerating: false,
  setAiGenerating: (b) => set({ aiGenerating: b }),

  isDirty: false,
  markClean: () => set({ isDirty: false }),
  markDirty: () => set({ isDirty: true }),
}));
