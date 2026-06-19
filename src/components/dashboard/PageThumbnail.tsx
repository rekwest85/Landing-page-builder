import * as React from "react";
import { BlockRenderer } from "@/lib/blocks/renderer";
import type { Block } from "@/lib/blocks/types";

/**
 * Renders the page's block tree at a tiny scale inside a fixed 16:9 frame,
 * like a live screenshot. Animations are paused via CSS so the thumbnail
 * is static and lightweight.
 *
 * - aspect-[16/9] container, overflow hidden
 * - inner content rendered at 1.0 scale on a virtual 1280x720 "page"
 * - scaled down to fit the frame
 */
export function PageThumbnail({
  blocks,
  className,
}: {
  blocks: Block[];
  className?: string;
}) {
  // Reference width: 1280px (typical desktop page). Height: 720 (16:9).
  const refW = 1280;
  const refH = 720;
  const scale = 0.18; // 1280 * 0.18 ≈ 230px wide
  const innerW = refW * scale;
  const innerH = refH * scale;

  const hasBlocks = Array.isArray(blocks) && blocks.length > 0;

  return (
    <div
      className={`relative aspect-[16/9] rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a25] to-[#0d0d14] border border-white/[0.06] ${className ?? ""}`}
      style={{ contain: "layout paint" }}
    >
      {/* The miniature rendered page */}
      <div
        className="absolute top-0 left-0 origin-top-left pointer-events-none select-none thumbnail-frozen"
        style={{
          width: `${refW}px`,
          height: `${refH}px`,
          transform: `scale(${scale})`,
        }}
      >
        {hasBlocks ? (
          <div className="w-full h-full bg-white text-[#0a0a0f]">
            <BlockRenderer block={{ id: "__thumb_root__", type: "section", props: {}, children: blocks }} />
          </div>
        ) : null}
      </div>

      {/* Empty state */}
      {!hasBlocks && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] mb-1.5">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white/30">
              <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" fill="currentColor" />
            </svg>
          </div>
          <div className="text-[10px] text-white/40">Empty page</div>
        </div>
      )}

      {/* Subtle vignette to anchor the thumbnail */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.35) 100%)",
        }}
      />
    </div>
  );
}