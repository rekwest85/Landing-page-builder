// AI generation pipeline — the 3-stage architecture

import { generateCompletion, generateHeuristic, type AIMessage } from "./client";
import { INTENT_SYSTEM, STRUCTURE_SYSTEM, BLOCK_COPY_SYSTEM } from "./prompts";
import type { Block } from "@/lib/blocks/types";
import { createBlock } from "@/lib/blocks/types";

interface IntentResult {
  offer: string;
  audience: string;
  primaryAction: string;
  tone: string;
  industry: string;
  pricePoint: string;
  keyBenefits: string[];
}

interface StructureBlock {
  type: string;
  props?: Record<string, any>;
}

interface StructureResult {
  blocks: StructureBlock[];
  rationale: string;
}

export async function generatePageFromPrompt(prompt: string): Promise<Block[]> {
  // Stage 1: Extract intent
  let intent: IntentResult;
  try {
    const intentContent = await generateCompletion({
      messages: [
        { role: "system", content: INTENT_SYSTEM },
        { role: "user", content: prompt },
      ],
    });
    intent = JSON.parse(intentContent);
  } catch (err) {
    console.warn("Intent extraction failed, using heuristic:", err);
    return buildHeuristicBlocks(prompt);
  }

  // Stage 2: Structure the page
  let structure: StructureResult;
  try {
    const structureContent = await generateCompletion({
      messages: [
        { role: "system", content: STRUCTURE_SYSTEM },
        {
          role: "user",
          content: `Brief: ${prompt}\n\nIntent:\n${JSON.stringify(intent, null, 2)}`,
        },
      ],
    });
    structure = JSON.parse(structureContent);
  } catch (err) {
    console.warn("Structure failed, using heuristic:", err);
    return buildHeuristicBlocks(prompt);
  }

  // Stage 3: Fill in copy per block — in parallel
  const blockPromises = structure.blocks.map(async (s) => {
    try {
      const content = await generateCompletion({
        messages: [
          { role: "system", content: BLOCK_COPY_SYSTEM },
          {
            role: "user",
            content: `Block type: ${s.type}\n\nIntent:\n${JSON.stringify(intent, null, 2)}\n\nWrite compelling copy for this block.`,
          },
        ],
      });
      const props = JSON.parse(content);
      return createBlock(s.type as any, { props });
    } catch (err) {
      console.warn(`Block ${s.type} generation failed:`, err);
      return createBlock(s.type as any);
    }
  });

  const blocks = await Promise.all(blockPromises);
  return blocks;
}

// ── Improve a specific block ─────────────────────────────────────────────────

export async function improveBlockCopy(
  type: string,
  currentProps: Record<string, any>,
  instruction: string
): Promise<Record<string, any>> {
  const content = await generateCompletion({
    messages: [
      { role: "system", content: BLOCK_COPY_SYSTEM },
      {
        role: "user",
        content: `Block type: ${type}\n\nCurrent copy:\n${JSON.stringify(currentProps, null, 2)}\n\nInstruction: ${instruction}\n\nReturn improved copy as JSON matching the same shape.`,
      },
    ],
  });
  return JSON.parse(content);
}

// ── Heuristic fallback (no API key) ──────────────────────────────────────────

function buildHeuristicBlocks(prompt: string): Block[] {
  try {
    const json = JSON.parse(generateHeuristic(prompt));
    return (json.blocks as any[]).map((b) =>
      createBlock(b.type, { props: b.props })
    );
  } catch {
    return [createBlock("hero")];
  }
}
