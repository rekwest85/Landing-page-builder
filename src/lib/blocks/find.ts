// Recursively find a block by id anywhere in the block tree,
// including inside columns.children[][] and section.children[].

import type { Block } from "@/lib/blocks/types";

export function findBlockById(blocks: Block[], id: string): Block | null {
  for (const b of blocks) {
    if (b.id === id) return b;
    // Section-style: flat children
    if (Array.isArray(b.children) && b.children.length > 0) {
      // Columns: Block[][]
      if (Array.isArray(b.children[0])) {
        for (const col of b.children as unknown as Block[][]) {
          const found = findBlockById(col, id);
          if (found) return found;
        }
      } else {
        // Section: Block[]
        const found = findBlockById(b.children as unknown as Block[], id);
        if (found) return found;
      }
    }
  }
  return null;
}