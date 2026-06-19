// The Block Renderer
// Server component. Used for:
//   1. Published pages (/p/[slug] or [subdomain]/[slug])
//   2. Live editor preview (wrapped by the editor)
//
// Each block is rendered with semantic HTML, accessibility, and beautiful defaults.

import type { Block } from "./types";
import { cn } from "@/lib/utils";
import { ArrowRight, Zap, Sparkles, Target, Quote, Star } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { useEditorStore } from "@/stores/editor";

// ── Icon resolver (string → component) ───────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Sparkles,
  Target,
  Star,
  // Add more as needed
};

function Icon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const Cmp = ICON_MAP[name] ?? Sparkles;
  return <Cmp className={className} />;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function styleToCss(style?: Block["style"]): React.CSSProperties {
  if (!style) return {};
  return {
    padding: style.padding,
    margin: style.margin,
    background: style.background,
    color: style.color,
    textAlign: style.textAlign,
    maxWidth: style.maxWidth,
  } as React.CSSProperties;
}

// ── Block components ─────────────────────────────────────────────────────────

function HeroBlock({ block }: { block: Block }) {
  const p = block.props;
  return (
    <div style={styleToCss(block.style)} className={cn("relative overflow-hidden")}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-6">
          {p.eyebrow && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              {p.eyebrow}
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white max-w-4xl leading-[1.05]">
            {p.headline}
          </h1>
          {p.subheadline && (
            <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed">
              {p.subheadline}
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            {p.ctaLabel && (
              <a
                href={p.ctaHref}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-violet-500 to-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-[0_0_32px_-8px_rgba(139,92,246,0.6)] hover:from-violet-400 hover:to-indigo-500 transition-all"
              >
                {p.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </a>
            )}
            {p.secondaryCtaLabel && (
              <a
                href={p.secondaryCtaHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-all"
              >
                {p.secondaryCtaLabel}
              </a>
            )}
          </div>
          {p.image && (
            <div className="mt-12 w-full max-w-5xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="w-full h-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeadingBlock({ block }: { block: Block }) {
  const p = block.props;
  const Tag = (`h${p.level ?? 2}` as "h1" | "h2" | "h3");
  const sizes = {
    1: "text-4xl md:text-5xl font-semibold",
    2: "text-3xl md:text-4xl font-semibold",
    3: "text-2xl md:text-3xl font-semibold",
  };
  return (
    <div style={styleToCss(block.style)}>
      <Tag className={cn("text-white tracking-tight max-w-3xl mx-auto", sizes[(p.level ?? 2) as 1 | 2 | 3])}>
        {p.text}
      </Tag>
    </div>
  );
}

function RichTextBlock({ block }: { block: Block }) {
  return (
    <div style={styleToCss(block.style)}>
      <div
        className="max-w-3xl mx-auto text-white/70 leading-relaxed prose prose-invert prose-sm"
        dangerouslySetInnerHTML={{ __html: block.props.html }}
      />
    </div>
  );
}

function ImageBlock({ block }: { block: Block }) {
  const p = block.props;
  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-4xl mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.src}
          alt={p.alt}
          className={cn("w-full h-auto", p.rounded && "rounded-2xl")}
        />
        {p.caption && (
          <p className="mt-3 text-sm text-white/50 text-center">{p.caption}</p>
        )}
      </div>
    </div>
  );
}

function VideoBlock({ block }: { block: Block }) {
  const p = block.props;
  if (!p.src) return null;
  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-4xl mx-auto">
        <video
          src={p.src}
          poster={p.poster}
          controls
          autoPlay={p.autoplay}
          className="w-full rounded-2xl"
        />
      </div>
    </div>
  );
}

function FeaturesBlock({ block }: { block: Block }) {
  const p = block.props;
  const cols = p.columns ?? 3;
  const colClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[cols as 2 | 3 | 4];

  return (
    <div style={styleToCss(block.style)}>
      <div className={cn("max-w-6xl mx-auto grid gap-6", colClass)}>
        {p.items?.map((item: any, i: number) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors"
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 mb-4">
              <Icon name={item.icon} className="h-5 w-5 text-violet-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
            <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialBlock({ block }: { block: Block }) {
  const p = block.props;
  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-3xl mx-auto">
        <Quote className="h-8 w-8 text-violet-400 mb-6 mx-auto" />
        <blockquote className="text-2xl md:text-3xl text-white font-medium leading-snug">
          "{p.quote}"
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-3">
          {p.avatar && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={p.avatar} alt={p.author} className="h-10 w-10 rounded-full" />
          )}
          <div className="text-left">
            <div className="text-sm font-medium text-white">{p.author}</div>
            {p.role && <div className="text-xs text-white/50">{p.role}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingBlock({ block }: { block: Block }) {
  const p = block.props;
  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {p.tiers?.map((tier: any, i: number) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl border p-8 flex flex-col",
              tier.highlighted
                ? "border-violet-500/40 bg-gradient-to-b from-violet-500/[0.08] to-transparent shadow-[0_0_48px_-12px_rgba(139,92,246,0.4)]"
                : "border-white/[0.08] bg-white/[0.02]"
            )}
          >
            {tier.highlighted && (
              <div className="inline-flex self-start items-center gap-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 px-2.5 py-0.5 text-xs font-medium text-violet-200 mb-4">
                Most popular
              </div>
            )}
            <div className="text-lg font-semibold text-white">{tier.name}</div>
            {tier.description && (
              <div className="text-sm text-white/50 mt-1">{tier.description}</div>
            )}
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-semibold text-white tracking-tight">
                {tier.price}
              </span>
              {tier.period && (
                <span className="text-sm text-white/50">{tier.period}</span>
              )}
            </div>
            <ul className="mt-6 space-y-3 flex-1">
              {tier.features?.map((f: string, j: number) => (
                <li key={j} className="flex items-start gap-2 text-sm text-white/70">
                  <svg
                    className="h-4 w-4 text-violet-400 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href={tier.ctaHref}
              className={cn(
                "mt-8 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all",
                tier.highlighted
                  ? "bg-gradient-to-b from-violet-500 to-indigo-600 text-white hover:from-violet-400 hover:to-indigo-500"
                  : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
              )}
            >
              {tier.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQBlock({ block }: { block: Block }) {
  const p = block.props;
  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-3xl mx-auto space-y-3">
        {p.items?.map((item: any, i: number) => (
          <details
            key={i}
            className="group rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
          >
            <summary className="cursor-pointer p-5 flex items-center justify-between text-white font-medium hover:bg-white/[0.02] transition-colors">
              <span>{item.q}</span>
              <svg
                className="h-4 w-4 text-white/50 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-5 text-sm text-white/70 leading-relaxed">{item.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}

function CTABlock({ block }: { block: Block }) {
  const p = block.props;
  return (
    <div style={styleToCss(block.style)} className="relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
          {p.headline}
        </h2>
        {p.subheadline && (
          <p className="mt-4 text-lg opacity-80 max-w-2xl mx-auto">{p.subheadline}</p>
        )}
        <a
          href={p.ctaHref}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white text-[#0a0a0f] px-8 py-4 text-base font-semibold hover:bg-white/90 transition-all shadow-xl"
        >
          {p.ctaLabel}
          <ArrowRight className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}

function FormBlock({ block }: { block: Block }) {
  const p = block.props;
  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-md mx-auto rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur">
        <form className="space-y-3">
          {p.fields?.map((field: any, i: number) => (
            <div key={i}>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                {field.label}
                {field.required && <span className="text-violet-400 ml-1">*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  required={field.required}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/40"
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  required={field.required}
                  placeholder={field.placeholder}
                  className="w-full h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/40"
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            className="w-full h-10 mt-2 rounded-lg bg-gradient-to-b from-violet-500 to-indigo-600 text-white text-sm font-medium hover:from-violet-400 hover:to-indigo-500 shadow-[0_0_24px_-6px_rgba(139,92,246,0.6)] transition-all"
          >
            {p.submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}

function LogosBlock({ block }: { block: Block }) {
  const p = block.props;
  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-6xl mx-auto">
        {p.caption && (
          <p className="text-sm text-white/40 mb-6">{p.caption}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {p.images?.map((img: any, i: number) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={i}
              src={img.src}
              alt={img.alt}
              className="h-7 opacity-50 hover:opacity-80 transition-opacity"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsBlock({ block }: { block: Block }) {
  const p = block.props;
  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8">
        {p.items?.map((item: any, i: number) => (
          <div key={i}>
            <div className="text-4xl md:text-5xl font-semibold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent tracking-tight">
              {item.value}
            </div>
            <div className="mt-2 text-sm text-white/50">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CountdownBlock({ block }: { block: Block }) {
  const p = block.props;
  const endsAt = new Date(p.endsAt).getTime();
  // Note: this is server-rendered; live ticking happens client-side via a small component
  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-2xl mx-auto">
        {p.label && (
          <p className="text-sm uppercase tracking-wider opacity-70 mb-4">{p.label}</p>
        )}
        <div className="grid grid-cols-4 gap-3">
          {["days", "hours", "minutes", "seconds"].map((unit) => (
            <div
              key={unit}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-3"
            >
              <CountdownValue endsAt={endsAt} unit={unit as any} />
              <div className="text-[10px] uppercase tracking-wider opacity-50 mt-1">{unit}</div>
            </div>
          ))}
        </div>
        {p.ctaLabel && (
          <div className="mt-6">
            <a
              href={p.ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-white text-[#0a0a0f] px-6 py-3 text-sm font-semibold hover:bg-white/90 transition-all"
            >
              {p.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function CountdownValue({ endsAt, unit }: { endsAt: number; unit: "days" | "hours" | "minutes" | "seconds" }) {
  const [val, setVal] = React.useState<string>("--");
  React.useEffect(() => {
    function tick() {
      const diff = Math.max(0, endsAt - Date.now());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      const map = { days, hours, minutes, seconds };
      setVal(String(map[unit]).padStart(2, "0"));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt, unit]);
  return <div className="text-2xl md:text-3xl font-semibold tabular-nums">{val}</div>;
}

function SectionBlock({ block }: { block: Block }) {
  return (
    <section style={styleToCss(block.style)}>
      {block.children?.map((child) => (
        <BlockRenderer key={child.id} block={child} />
      ))}
    </section>
  );
}

function ColumnsBlock({ block }: { block: Block }) {
  const p = block.props;
  const cols = p.columns ?? 2;
  const colClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  }[cols as 2 | 3 | 4];
  // Columns live at block.children (Block[][]), NOT in props
  const columns = (block.children as unknown as Block[][]) ?? [];
  return (
    <div style={styleToCss(block.style)}>
      <div className={cn("max-w-6xl mx-auto grid gap-6", colClass)}>
        {columns.map((column, i) => (
          <Column
            key={i}
            blockId={block.id}
            columnIndex={i}
            column={column}
          />
        ))}
      </div>
    </div>
  );
}

function Column({
  blockId,
  columnIndex,
  column,
}: {
  blockId: string;
  columnIndex: number;
  column: Block[];
}) {
  const addBlockToColumn = useEditorStore((s) => s.addBlockToColumn);
  const setSelected = useEditorStore((s) => s.setSelected);
  const selectedId = useEditorStore((s) => s.selectedBlockId);
  const hoveredId = useEditorStore((s) => s.hoveredBlockId);
  const setHovered = useEditorStore((s) => s.setHovered);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const moveBlock = useEditorStore((s) => s.moveBlock);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [pickerPos, setPickerPos] = React.useState<{
    open: boolean;
    x: number;
    y: number;
  } | null>(null);
  const columnRef = React.useRef<HTMLDivElement>(null);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const type = e.dataTransfer.getData("application/x-forge-block");
    if (!type) return;
    addBlockToColumn(blockId, columnIndex, type);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }

  function onDragLeave() {
    setIsDragOver(false);
  }

  function openPicker() {
    const el = columnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Place picker below the column; if not enough room, flip above
    const pickerW = 240;
    const pickerH = 180;
    const margin = 8;
    let x = rect.left;
    let y = rect.bottom + margin;
    // Flip up if it would overflow the bottom
    if (y + pickerH > window.innerHeight - margin) {
      y = rect.top - pickerH - margin;
    }
    // Clamp X so picker doesn't go off-screen
    if (x + pickerW > window.innerWidth - margin) {
      x = window.innerWidth - pickerW - margin;
    }
    if (x < margin) x = margin;
    setPickerPos({ open: true, x, y });
  }

  return (
    <div
      ref={columnRef}
      className={cn(
        "space-y-4 min-h-[80px] rounded-xl transition-all",
        isDragOver && "ring-2 ring-violet-500 ring-offset-2"
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {(column?.length ?? 0) > 0 ? (
        column.map((child) => {
          const isSelected = selectedId === child.id;
          const isHovered = hoveredId === child.id;
          return (
            <div
              key={child.id}
              className="relative group/block"
              onMouseEnter={() => setHovered(child.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(child.id);
              }}
            >
              {/* Selection / hover outline for inner blocks (mirrors BlockOutline) */}
              <div
                className={cn(
                  "absolute inset-0 pointer-events-none transition-all z-10 rounded-md",
                  isSelected
                    ? "ring-2 ring-violet-500 ring-offset-0 shadow-[0_0_0_4px_rgba(139,92,246,0.15)]"
                    : isHovered
                      ? "ring-1 ring-violet-400/60"
                      : "ring-0"
                )}
              />
              {/* Floating action toolbar when selected (top-right) */}
              {isSelected && (
                <div className="absolute -top-7 right-0 z-20 flex items-center gap-0.5 rounded-md bg-[#14141a] border border-white/[0.08] p-0.5 shadow-lg">
                  <InnerActionBtn title="Move up" onClick={(e) => { e.stopPropagation(); moveBlockInColumn(blockId, columnIndex, child.id, "up"); }}>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>
                  </InnerActionBtn>
                  <InnerActionBtn title="Move down" onClick={(e) => { e.stopPropagation(); moveBlockInColumn(blockId, columnIndex, child.id, "down"); }}>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </InnerActionBtn>
                  <InnerActionBtn title="Duplicate" onClick={(e) => { e.stopPropagation(); duplicateInColumn(blockId, columnIndex, child.id); }}>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  </InnerActionBtn>
                  <InnerActionBtn title="Delete" danger onClick={(e) => { e.stopPropagation(); removeFromColumn(blockId, columnIndex, child.id); }}>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </InnerActionBtn>
                </div>
              )}
              <BlockRenderer block={child} />
            </div>
          );
        })
      ) : (
        <EmptyColumn onClick={openPicker} highlighted={isDragOver} />
      )}

      {pickerPos?.open && (
        <ColumnBlockPicker
          x={pickerPos.x}
          y={pickerPos.y}
          onPick={(type) => {
            addBlockToColumn(blockId, columnIndex, type);
            setPickerPos(null);
          }}
          onClose={() => setPickerPos(null)}
        />
      )}
    </div>
  );
}

function InnerActionBtn({
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
      type="button"
      title={title}
      onClick={onClick}
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

// Inner-block mutations on a column. These are intentionally local helpers
// (not in the store) because they only matter inside the columns render path.
function moveBlockInColumn(
  columnBlockId: string,
  columnIndex: number,
  childId: string,
  direction: "up" | "down",
) {
  const state = useEditorStore.getState();
  const blocks = [...state.blocks];
  const idx = blocks.findIndex((b) => b.id === columnBlockId);
  if (idx < 0) return;
  const target = blocks[idx];
  if (target.type !== "columns") return;
  const columns = (target.children as unknown as Block[][]) ?? [];
  const col = columns[columnIndex];
  if (!col) return;
  const childIdx = col.findIndex((c) => c.id === childId);
  if (childIdx < 0) return;
  const newIdx = direction === "up" ? childIdx - 1 : childIdx + 1;
  if (newIdx < 0 || newIdx >= col.length) return;
  const nextCol = [...col];
  [nextCol[childIdx], nextCol[newIdx]] = [nextCol[newIdx], nextCol[childIdx]];
  const nextColumns = columns.map((c, i) => (i === columnIndex ? nextCol : c));
  blocks[idx] = {
    ...target,
    children: nextColumns as unknown as Block[],
  };
  useEditorStore.setState({ blocks, isDirty: true });
}

function duplicateInColumn(
  columnBlockId: string,
  columnIndex: number,
  childId: string,
) {
  const state = useEditorStore.getState();
  const blocks = [...state.blocks];
  const idx = blocks.findIndex((b) => b.id === columnBlockId);
  if (idx < 0) return;
  const target = blocks[idx];
  if (target.type !== "columns") return;
  const columns = (target.children as unknown as Block[][]) ?? [];
  const col = columns[columnIndex];
  if (!col) return;
  const childIdx = col.findIndex((c) => c.id === childId);
  if (childIdx < 0) return;
  const original = col[childIdx];
  const copy: Block = {
    ...JSON.parse(JSON.stringify(original)),
    id: Math.random().toString(36).slice(2, 14),
  };
  const nextCol = [...col];
  nextCol.splice(childIdx + 1, 0, copy);
  const nextColumns = columns.map((c, i) => (i === columnIndex ? nextCol : c));
  blocks[idx] = {
    ...target,
    children: nextColumns as unknown as Block[],
  };
  useEditorStore.setState({ blocks, selectedBlockId: copy.id, isDirty: true });
}

function removeFromColumn(
  columnBlockId: string,
  columnIndex: number,
  childId: string,
) {
  const state = useEditorStore.getState();
  const blocks = [...state.blocks];
  const idx = blocks.findIndex((b) => b.id === columnBlockId);
  if (idx < 0) return;
  const target = blocks[idx];
  if (target.type !== "columns") return;
  const columns = (target.children as unknown as Block[][]) ?? [];
  const col = columns[columnIndex];
  if (!col) return;
  const nextCol = col.filter((c) => c.id !== childId);
  const nextColumns = columns.map((c, i) => (i === columnIndex ? nextCol : c));
  blocks[idx] = {
    ...target,
    children: nextColumns as unknown as Block[],
  };
  useEditorStore.setState({
    blocks,
    selectedBlockId: state.selectedBlockId === childId ? null : state.selectedBlockId,
    isDirty: true,
  });
}

function EmptyColumn({
  onClick,
  highlighted,
}: {
  onClick: (e: React.MouseEvent) => void;
  highlighted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-center h-24 rounded-xl border-2 border-dashed text-xs transition-colors",
        highlighted
          ? "border-violet-500 bg-violet-500/[0.06] text-violet-700"
          : "border-[#0a0a0f]/15 bg-[#0a0a0f]/[0.02] text-[#0a0a0f]/40 hover:border-violet-500/40 hover:bg-violet-500/[0.04]"
      )}
    >
      <span className="inline-flex items-center gap-2">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Drop a block here, or click to pick one
      </span>
    </button>
  );
}

function ColumnBlockPicker({
  x,
  y,
  onPick,
  onClose,
}: {
  x: number;
  y: number;
  onPick: (type: any) => void;
  onClose: () => void;
}) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Quick list — most useful blocks for inside a column
  const choices: { type: any; label: string }[] = [
    { type: "heading", label: "Heading" },
    { type: "richtext", label: "Text" },
    { type: "image", label: "Image" },
    { type: "features", label: "Features" },
    { type: "testimonial", label: "Testimonial" },
    { type: "cta", label: "CTA" },
    { type: "form", label: "Form" },
    { type: "stats", label: "Stats" },
  ];

  // Portal to document.body so we escape any overflow:hidden/auto
  // ancestors (the canvas uses overflow-auto). Position via fixed coords
  // calculated from the column's bounding rect.
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Click-outside backdrop */}
      <div
        className="fixed inset-0 z-[60]"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      <div
        style={{ position: "fixed", left: x, top: y, width: 240 }}
        className="z-[70] rounded-xl border border-violet-500/30 bg-white shadow-2xl p-2 grid grid-cols-2 gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        {choices.map((c) => (
          <button
            key={c.type}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPick(c.type);
            }}
            className="px-3 py-2 rounded-lg text-left text-xs font-medium text-[#0a0a0f] hover:bg-violet-500/10 hover:text-violet-700 transition-colors"
          >
            {c.label}
          </button>
        ))}
      </div>
    </>,
    document.body
  );
}

function SpacerBlock({ block }: { block: Block }) {
  return <div style={styleToCss(block.style)} aria-hidden />;
}

function DividerBlock({ block }: { block: Block }) {
  return (
    <div style={styleToCss(block.style)}>
      <hr className="max-w-6xl mx-auto border-white/[0.08]" />
    </div>
  );
}

// ── Animated stats / charts ─────────────────────────────────────────────────

function useCountUp(target: number, duration: number = 1800, decimals: number = 0) {
  const [value, setValue] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const started = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const step = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              // ease-out cubic
              const eased = 1 - Math.pow(1 - t, 3);
              setValue(target * eased);
              if (t < 1) requestAnimationFrame(step);
              else setValue(target);
            };
            requestAnimationFrame(step);
          }
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { ref, value: decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString() };
}

function AnimatedStatBlock({ block }: { block: Block }) {
  const p = block.props;
  const { ref, value } = useCountUp(Number(p.value ?? 0), Number(p.duration ?? 1800), Number(p.decimals ?? 0));
  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-3xl mx-auto text-center">
        <div className="text-6xl md:text-7xl font-semibold bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent tracking-tight tabular-nums">
          {p.prefix ?? ""}<span ref={ref}>{value}</span>{p.suffix ?? ""}
        </div>
        <div className="mt-3 text-sm md:text-base text-white/60">{p.label}</div>
      </div>
    </div>
  );
}

function StatProgressBlock({ block }: { block: Block }) {
  const p = block.props;
  const items: { label: string; value: number; max: number; suffix?: string }[] = p.items ?? [];
  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-3xl mx-auto space-y-6">
        {items.map((it, i) => (
          <ProgressBar key={i} item={it} />
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ item }: { item: { label: string; value: number; max: number; suffix?: string } }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  const pct = Math.min(100, Math.max(0, (item.value / item.max) * 100));

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setWidth(pct);
          }
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [pct]);

  return (
    <div ref={ref}>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-medium text-white/80">{item.label}</span>
        <span className="text-sm font-semibold text-white tabular-nums">
          {item.value}{item.suffix ?? ""}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-[1500ms] ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function BarChartBlock({ block }: { block: Block }) {
  const p = block.props;
  const data: { label: string; value: number }[] = p.data ?? [];
  const max = Math.max(...data.map((d) => d.value), 1);
  const highlightMax = p.highlightMax ?? true;
  const maxIdx = data.findIndex((d) => d.value === max);

  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-4xl mx-auto">
        {p.title && (
          <h3 className="text-lg font-semibold text-white mb-6 text-center">{p.title}</h3>
        )}
        <div className="flex items-end justify-around gap-3 h-64 px-4">
          {data.map((d, i) => {
            const heightPct = (d.value / max) * 100;
            const isMax = highlightMax && i === maxIdx;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group">
                <div className="text-xs font-medium text-white/60 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.value}{p.unit ?? ""}
                </div>
                <Bar heightPct={heightPct} highlight={isMax} />
                <div className="text-xs text-white/50">{d.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Bar({ heightPct, highlight }: { heightPct: number; highlight: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [h, setH] = React.useState(0);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setH(heightPct);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [heightPct]);

  return (
    <div
      ref={ref}
      style={{ height: `${h}%` }}
      className={`w-full rounded-t-lg transition-all duration-[1500ms] ease-out ${
        highlight
          ? "bg-gradient-to-t from-violet-600 to-violet-400 shadow-[0_0_24px_-4px_rgba(139,92,246,0.6)]"
          : "bg-gradient-to-t from-white/10 to-white/20"
      }`}
    />
  );
}

function LineChartBlock({ block }: { block: Block }) {
  const p = block.props;
  const data: number[] = p.data ?? [];
  const labels: string[] = p.labels ?? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 1);

  // Build SVG path
  const W = 600, H = 200, padX = 30, padY = 20;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;
  const points = data.map((v, i) => {
    const x = padX + (i / Math.max(data.length - 1, 1)) * innerW;
    const y = padY + (1 - (v - min) / range) * innerH;
    return [x, y] as const;
  });
  const smooth = p.smooth ?? true;
  const linePath = smooth ? buildSmoothPath(points) : buildLinearPath(points);
  const areaPath = linePath + ` L ${padX + innerW},${padY + innerH} L ${padX},${padY + innerH} Z`;

  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-4xl mx-auto">
        {p.title && (
          <h3 className="text-lg font-semibold text-white mb-6 text-center">{p.title}</h3>
        )}
        <LineDraw target={linePath} targetArea={areaPath} points={points} labels={labels.slice(0, data.length)} />
      </div>
    </div>
  );
}

function LineDraw({
  target, targetArea, points, labels,
}: { target: string; targetArea: string; points: readonly (readonly [number, number])[]; labels: string[] }) {
  const [progress, setProgress] = React.useState(0);
  const ref = React.useRef<SVGSVGElement>(null);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const start = performance.now();
            const dur = 1600;
            const step = (now: number) => {
              const t = Math.min(1, (now - start) / dur);
              const eased = 1 - Math.pow(1 - t, 3);
              setProgress(eased);
              if (t < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const W = 600, H = 200, padX = 30, padY = 20;
  const innerH = H - padY * 2;

  // Reveal via stroke-dasharray: build path length = ~ len of "M ... L ..." (approx)
  const totalLen = 1500;
  const visibleLen = totalLen * progress;

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
        <line key={i} x1={padX} x2={W - padX} y1={padY + g * innerH} y2={padY + g * innerH} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {/* area */}
      <path d={targetArea} fill="url(#line-grad)" style={{ opacity: progress }} />
      {/* line */}
      <path
        d={target}
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${visibleLen} ${totalLen}`}
      />
      {/* points */}
      {points.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="3"
          fill="#8b5cf6"
          style={{ opacity: progress, transition: `opacity 0.2s ${i * 50}ms` }}
        />
      ))}
      {/* x labels */}
      {labels.map((label, i) => {
        const x = padX + (i / Math.max(labels.length - 1, 1)) * (W - padX * 2);
        return (
          <text key={i} x={x} y={H - 4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

function buildLinearPath(points: readonly (readonly [number, number])[]): string {
  if (points.length === 0) return "";
  return points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
}

function buildSmoothPath(points: readonly (readonly [number, number])[]): string {
  if (points.length === 0) return "";
  const parts: string[] = [`M ${points[0][0]} ${points[0][1]}`];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const cx = (x0 + x1) / 2;
    parts.push(`C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`);
  }
  return parts.join(" ");
}

function DonutChartBlock({ block }: { block: Block }) {
  const p = block.props;
  const segments: { label: string; value: number; color?: string }[] = p.segments ?? [];
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  // Build conic gradient stops
  let acc = 0;
  const stops = segments.map((s) => {
    const start = (acc / total) * 360;
    acc += s.value;
    const end = (acc / total) * 360;
    return `${s.color ?? "#8b5cf6"} ${start}deg ${end}deg`;
  });
  const conicBg = `conic-gradient(${stops.join(", ")})`;

  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-4xl mx-auto">
        {p.title && (
          <h3 className="text-lg font-semibold text-white mb-6 text-center">{p.title}</h3>
        )}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="relative h-56 w-56 rounded-full" style={{ background: conicBg }}>
            <div className="absolute inset-6 rounded-full bg-[#0a0a0f] flex flex-col items-center justify-center">
              <div className="text-3xl font-semibold text-white tabular-nums">{p.centerValue}</div>
              <div className="text-xs text-white/50 mt-1">{p.centerLabel}</div>
            </div>
          </div>
          <ul className="space-y-2 min-w-[200px]">
            {segments.map((s, i) => (
              <li key={i} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color ?? "#8b5cf6" }} />
                  <span className="text-white/70">{s.label}</span>
                </span>
                <span className="text-white tabular-nums">{Math.round((s.value / total) * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Conversion / effect ─────────────────────────────────────────────────────

function ComparisonTableBlock({ block }: { block: Block }) {
  const p = block.props;
  const rows: { feature: string; ours: string | boolean; theirs: string | boolean }[] = p.rows ?? [];
  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-3xl mx-auto">
        {p.title && (
          <h3 className="text-xl font-semibold text-white mb-6 text-center">{p.title}</h3>
        )}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="text-xs uppercase tracking-wider text-white/40 font-medium">Feature</div>
            <div className="text-xs uppercase tracking-wider text-violet-200 font-medium text-center min-w-[100px]">{p.oursLabel ?? "Us"}</div>
            <div className="text-xs uppercase tracking-wider text-white/40 font-medium text-center min-w-[100px]">{p.theirsLabel ?? "Them"}</div>
          </div>
          {rows.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 ${
                i !== rows.length - 1 ? "border-b border-white/[0.04]" : ""
              }`}
            >
              <div className="text-sm text-white/80">{row.feature}</div>
              <div className="flex justify-center min-w-[100px]">
                <CellValue value={row.ours} highlight />
              </div>
              <div className="flex justify-center min-w-[100px]">
                <CellValue value={row.theirs} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CellValue({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  if (value === true) {
    return (
      <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${
        highlight ? "bg-violet-500/20 text-violet-200" : "bg-white/[0.04] text-white/40"
      }`}>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/[0.04] text-white/30">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`text-xs ${highlight ? "text-violet-200" : "text-white/50"}`}>{value}</span>
  );
}

function BeforeAfterBlock({ block }: { block: Block }) {
  const p = block.props;
  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-5xl mx-auto">
        {p.title && (
          <h3 className="text-xl font-semibold text-white mb-8 text-center">{p.title}</h3>
        )}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-medium text-red-200 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              {p.beforeLabel}
            </div>
            <ul className="space-y-3">
              {(p.beforePoints ?? []).map((pt: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-400/60 shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-b from-violet-500/[0.08] to-transparent p-6 shadow-[0_0_48px_-12px_rgba(139,92,246,0.4)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {p.afterLabel}
            </div>
            <ul className="space-y-3">
              {(p.afterPoints ?? []).map((pt: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white">
                  <svg className="mt-0.5 h-4 w-4 text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function GradientCardBlock({ block }: { block: Block }) {
  const p = block.props;
  return (
    <div style={styleToCss(block.style)}>
      <div className="max-w-xl mx-auto relative group">
        {/* Animated gradient border */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 opacity-70 blur-sm group-hover:opacity-100 transition-opacity animate-[gradient-shift_6s_linear_infinite]"
             style={{ backgroundSize: "200% 200%" }} />
        <div className="relative rounded-2xl bg-[#0a0a0f] p-8">
          {p.eyebrow && (
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200 mb-4">
              {p.eyebrow}
            </div>
          )}
          <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">{p.title}</h3>
          {p.body && <p className="text-sm text-white/60 leading-relaxed mb-5">{p.body}</p>}
          {p.ctaLabel && (
            <a
              href={p.ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/[0.1] text-white px-4 py-2 text-sm font-medium hover:bg-white/[0.1] transition-colors"
            >
              {p.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function GlowCTABlock({ block }: { block: Block }) {
  const p = block.props;
  return (
    <div style={styleToCss(block.style)} className="relative overflow-hidden">
      {/* Pulsing glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-72 w-[600px] rounded-full bg-violet-500/30 blur-[100px] animate-pulse" />
      </div>
      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-white">
          {p.headline}
        </h2>
        {p.subheadline && (
          <p className="mt-5 text-lg text-white/60 max-w-2xl mx-auto">{p.subheadline}</p>
        )}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={p.ctaHref}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-violet-500 to-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_40px_-4px_rgba(139,92,246,0.7)] hover:from-violet-400 hover:to-indigo-500 transition-all"
          >
            {p.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </a>
          {p.secondaryLabel && (
            <a
              href={p.secondaryHref ?? "#"}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] text-white px-6 py-3 text-sm font-medium hover:bg-white/[0.08] transition-colors"
            >
              {p.secondaryLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Registry ─────────────────────────────────────────────────────────────────

const REGISTRY: Record<string, React.FC<{ block: Block }>> = {
  hero: HeroBlock,
  heading: HeadingBlock,
  richtext: RichTextBlock,
  image: ImageBlock,
  video: VideoBlock,
  features: FeaturesBlock,
  testimonial: TestimonialBlock,
  pricing: PricingBlock,
  faq: FAQBlock,
  cta: CTABlock,
  form: FormBlock,
  logos: LogosBlock,
  stats: StatsBlock,
  countdown: CountdownBlock,
  section: SectionBlock,
  columns: ColumnsBlock,
  spacer: SpacerBlock,
  divider: DividerBlock,
  animatedStat: AnimatedStatBlock,
  statProgress: StatProgressBlock,
  barChart: BarChartBlock,
  lineChart: LineChartBlock,
  donutChart: DonutChartBlock,
  comparisonTable: ComparisonTableBlock,
  beforeAfter: BeforeAfterBlock,
  gradientCard: GradientCardBlock,
  glowCta: GlowCTABlock,
};

export function BlockRenderer({ block }: { block: Block }) {
  const Cmp = REGISTRY[block.type];
  if (!Cmp) {
    return (
      <div className="p-4 m-4 rounded border border-dashed border-white/10 text-white/40 text-sm">
        Unknown block: {block.type}
      </div>
    );
  }
  return <Cmp block={block} />;
}

export function RenderTree({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </>
  );
}
