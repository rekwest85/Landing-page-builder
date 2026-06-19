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
          <div key={i} className="space-y-4 min-h-[80px]">
            {column?.length ? (
              column.map((child) => (
                <BlockRenderer key={child.id} block={child} />
              ))
            ) : (
              <EmptyColumn />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyColumn() {
  return (
    <div className="flex items-center justify-center h-20 rounded-xl border border-dashed border-white/[0.08] text-xs text-white/30">
      Drop blocks here
    </div>
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
