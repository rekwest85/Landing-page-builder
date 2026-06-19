// Block type system — the heart of Forge.
// Every page is a tree of these. The AI writes them. The editor edits them.
// The renderer renders them. One shape, three consumers.

export type BlockType =
  // Layout
  | "section" // container with background + padding, holds children
  | "columns" // 2/3/4 column row
  // Content
  | "hero"
  | "heading"
  | "richtext"
  | "image"
  | "video"
  | "spacer"
  | "divider"
  | "logos"
  | "gradientCard"
  // Animated stats / charts
  | "animatedStat"
  | "statProgress"
  | "barChart"
  | "lineChart"
  | "donutChart"
  // Conversion
  | "features"
  | "testimonial"
  | "pricing"
  | "faq"
  | "cta"
  | "glowCta"
  | "form"
  | "comparisonTable"
  | "beforeAfter"
  | "stats"
  | "countdown";

export interface BlockStyle {
  padding?: string; // e.g. "80px 0"
  margin?: string;
  background?: string; // color, gradient, image url
  color?: string;
  textAlign?: "left" | "center" | "right";
  maxWidth?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  props: Record<string, any>; // type-specific data
  style?: BlockStyle;
  children?: Block[]; // for section/columns
}

// ── Block-specific prop types (for editor validation) ────────────────────────

export interface HeroProps {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  image?: string; // hero image url
  align?: "left" | "center";
}

export interface HeadingProps {
  text: string;
  level?: 1 | 2 | 3;
  align?: "left" | "center" | "right";
}

export interface RichTextProps {
  html: string; // sanitized
  align?: "left" | "center" | "right";
}

export interface ImageProps {
  src: string;
  alt: string;
  caption?: string;
  rounded?: boolean;
  aspectRatio?: string;
}

export interface VideoProps {
  src: string; // url or upload id
  poster?: string;
  autoplay?: boolean;
}

export interface FeaturesProps {
  items: {
    icon?: string; // lucide icon name
    title: string;
    description: string;
  }[];
  columns?: 2 | 3 | 4;
}

export interface TestimonialProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  logo?: string;
}

export interface PricingProps {
  tiers: {
    name: string;
    price: string;
    period?: string;
    description?: string;
    features: string[];
    ctaLabel: string;
    ctaHref: string;
    highlighted?: boolean;
  }[];
}

export interface FAQProps {
  items: { q: string; a: string }[];
}

export interface CTAProps {
  headline: string;
  subheadline?: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface FormProps {
  fields: { name: string; label: string; type: "text" | "email" | "tel" | "textarea"; required?: boolean; placeholder?: string }[];
  submitLabel: string;
  successMessage?: string;
  // where to POST — set by the publish step
  endpoint?: string;
}

export interface LogosProps {
  images: { src: string; alt: string }[];
  caption?: string;
}

export interface StatsProps {
  items: { value: string; label: string }[];
}

export interface CountdownProps {
  endsAt: string; // ISO date
  label?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface SectionProps {
  children: Block[];
}

export interface ColumnsProps {
  columns: number; // 2, 3, or 4
  children: Block[][];
}

// ── Animated stats / charts ─────────────────────────────────────────────────

export interface AnimatedStatProps {
  value: number;        // target number to count up to
  prefix?: string;      // e.g. "$"
  suffix?: string;      // e.g. "%", "x", "k"
  label: string;        // caption below
  decimals?: number;    // for decimal values like 4.7
  duration?: number;    // ms, default 1800
}

export interface StatWithProgressProps {
  items: { label: string; value: number; max: number; suffix?: string }[];
}

export interface BarChartProps {
  title?: string;
  data: { label: string; value: number }[];
  unit?: string;        // e.g. "users", "$"
  highlightMax?: boolean;
}

export interface LineChartProps {
  title?: string;
  data: number[];
  labels?: string[];    // x-axis labels (defaults to month names)
  smooth?: boolean;     // bezier vs straight
}

export interface DonutChartProps {
  title?: string;
  centerValue: string;
  centerLabel: string;
  segments: { label: string; value: number; color?: string }[];
}

// ── Conversion / effect ─────────────────────────────────────────────────────

export interface ComparisonTableProps {
  title?: string;
  rows: { feature: string; ours: string | boolean; theirs: string | boolean }[];
  oursLabel?: string;
  theirsLabel?: string;
}

export interface BeforeAfterProps {
  title?: string;
  beforeLabel: string;
  afterLabel: string;
  beforePoints: string[];
  afterPoints: string[];
}

export interface GradientCardProps {
  eyebrow?: string;
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface GlowCTAProps {
  headline: string;
  subheadline?: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

// ── Block registry — single source of truth for the editor + renderer ────────

export interface BlockDefinition<TProps = any> {
  type: BlockType;
  label: string;
  category: "layout" | "content" | "conversion";
  icon: string; // lucide icon name
  description: string;
  defaultProps: TProps;
  defaultStyle?: BlockStyle;
  hasChildren?: boolean;
}

export const BLOCK_DEFINITIONS: Record<BlockType, BlockDefinition> = {
  hero: {
    type: "hero",
    label: "Hero",
    category: "content",
    icon: "Sparkles",
    description: "Big headline + CTA above the fold",
    defaultProps: {
      eyebrow: "",
      headline: "Build beautiful landing pages in minutes",
      subheadline:
        "Forge is the AI-native page builder that turns ideas into high-converting pages — no code, no setup.",
      ctaLabel: "Get started free",
      ctaHref: "#",
      secondaryCtaLabel: "Watch demo",
      secondaryCtaHref: "#",
      align: "center",
    },
    defaultStyle: {
      padding: "120px 24px",
      textAlign: "center",
      background: "linear-gradient(180deg, #0a0a0f 0%, #14141a 100%)",
    },
  },
  heading: {
    type: "heading",
    label: "Heading",
    category: "content",
    icon: "Heading2",
    description: "A section heading",
    defaultProps: { text: "Why teams choose Forge", level: 2, align: "center" },
    defaultStyle: { padding: "24px", textAlign: "center" },
  },
  richtext: {
    type: "richtext",
    label: "Text",
    category: "content",
    icon: "Type",
    description: "Rich text paragraph",
    defaultProps: {
      html: "<p>Tell your story here.</p>",
      align: "left",
    },
    defaultStyle: { padding: "16px 24px" },
  },
  image: {
    type: "image",
    label: "Image",
    category: "content",
    icon: "Image",
    description: "Single image with optional caption",
    defaultProps: {
      src: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200",
      alt: "",
      rounded: true,
    },
    defaultStyle: { padding: "24px" },
  },
  video: {
    type: "video",
    label: "Video",
    category: "content",
    icon: "Video",
    description: "Embed a video",
    defaultProps: { src: "", autoplay: false },
    defaultStyle: { padding: "24px" },
  },
  spacer: {
    type: "spacer",
    label: "Spacer",
    category: "layout",
    icon: "Minus",
    description: "Vertical breathing room",
    defaultProps: {},
    defaultStyle: { padding: "40px 0" },
  },
  divider: {
    type: "divider",
    label: "Divider",
    category: "layout",
    icon: "Minus",
    description: "A horizontal line",
    defaultProps: {},
    defaultStyle: { padding: "24px" },
  },
  features: {
    type: "features",
    label: "Features",
    category: "content",
    icon: "LayoutGrid",
    description: "Grid of feature cards",
    defaultProps: {
      columns: 3,
      items: [
        {
          icon: "Zap",
          title: "Lightning fast",
          description: "Pages publish in seconds and load instantly worldwide.",
        },
        {
          icon: "Sparkles",
          title: "AI-native",
          description: "Generate, rewrite, and optimize with a chat interface.",
        },
        {
          icon: "Target",
          title: "Conversion focused",
          description: "Built-in scoring and A/B testing, no extra tools.",
        },
      ],
    },
    defaultStyle: { padding: "80px 24px" },
  },
  testimonial: {
    type: "testimonial",
    label: "Testimonial",
    category: "conversion",
    icon: "Quote",
    description: "Customer quote with avatar",
    defaultProps: {
      quote:
        "Forge cut our landing page production from days to minutes. The AI writes copy that actually converts.",
      author: "Sarah Chen",
      role: "Head of Growth, Linear",
      avatar: "",
    },
    defaultStyle: { padding: "80px 24px", textAlign: "center" },
  },
  pricing: {
    type: "pricing",
    label: "Pricing",
    category: "conversion",
    icon: "CreditCard",
    description: "Tiered pricing table",
    defaultProps: {
      tiers: [
        {
          name: "Starter",
          price: "$0",
          period: "forever",
          description: "For solo creators",
          features: ["1 published page", "Forge subdomain", "Basic analytics"],
          ctaLabel: "Start free",
          ctaHref: "#",
        },
        {
          name: "Pro",
          price: "$29",
          period: "/month",
          description: "For growing teams",
          features: [
            "Unlimited pages",
            "Custom domain",
            "AI auto-optimize",
            "A/B testing",
            "Priority support",
          ],
          ctaLabel: "Upgrade",
          ctaHref: "#",
          highlighted: true,
        },
        {
          name: "Agency",
          price: "$299",
          period: "/month",
          description: "For agencies",
          features: ["Everything in Pro", "White-label", "Client workspaces", "Bulk pricing"],
          ctaLabel: "Contact sales",
          ctaHref: "#",
        },
      ],
    },
    defaultStyle: { padding: "80px 24px" },
  },
  faq: {
    type: "faq",
    label: "FAQ",
    category: "content",
    icon: "HelpCircle",
    description: "Expandable Q&A",
    defaultProps: {
      items: [
        {
          q: "How does the AI generation work?",
          a: "Describe your offer in a sentence or two. Our AI structures it into a complete page — headline, sections, FAQs, CTA — in under 60 seconds.",
        },
        {
          q: "Can I use my own domain?",
          a: "Yes. Connect any domain you own and we'll provision SSL automatically. Pages publish globally to our edge network.",
        },
        {
          q: "Do I need to know code?",
          a: "No. Forge is a visual builder. Power users can add custom HTML/CSS/JS blocks or export to clean React.",
        },
      ],
    },
    defaultStyle: { padding: "80px 24px" },
  },
  cta: {
    type: "cta",
    label: "Call to Action",
    category: "conversion",
    icon: "Megaphone",
    description: "Closing CTA section",
    defaultProps: {
      headline: "Ready to ship your next landing page?",
      subheadline: "Join thousands of teams building with Forge.",
      ctaLabel: "Start free",
      ctaHref: "#",
    },
    defaultStyle: {
      padding: "100px 24px",
      textAlign: "center",
      background:
        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
      color: "#ffffff",
    },
  },
  form: {
    type: "form",
    label: "Form",
    category: "conversion",
    icon: "Mail",
    description: "Lead capture form",
    defaultProps: {
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
      ],
      submitLabel: "Get early access",
      successMessage: "Thanks! We'll be in touch shortly.",
    },
    defaultStyle: { padding: "60px 24px" },
  },
  logos: {
    type: "logos",
    label: "Logos",
    category: "content",
    icon: "Award",
    description: "Trusted-by logo strip",
    defaultProps: {
      caption: "Trusted by teams at",
      images: [],
    },
    defaultStyle: { padding: "60px 24px", textAlign: "center" },
  },
  stats: {
    type: "stats",
    label: "Stats",
    category: "content",
    icon: "BarChart3",
    description: "Number callouts",
    defaultProps: {
      items: [
        { value: "10x", label: "faster to publish" },
        { value: "47%", label: "avg conversion lift" },
        { value: "12k+", label: "pages shipped" },
      ],
    },
    defaultStyle: { padding: "60px 24px", textAlign: "center" },
  },
  countdown: {
    type: "countdown",
    label: "Countdown",
    category: "conversion",
    icon: "Timer",
    description: "Urgency timer",
    defaultProps: {
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      label: "Launch offer ends in",
      ctaLabel: "Claim now",
      ctaHref: "#",
    },
    defaultStyle: {
      padding: "60px 24px",
      textAlign: "center",
      background: "#0f0f17",
      color: "#ffffff",
    },
  },
  section: {
    type: "section",
    label: "Section",
    category: "layout",
    icon: "Square",
    description: "Container with background and padding",
    defaultProps: { children: [] },
    defaultStyle: { padding: "60px 24px", background: "#ffffff" },
    hasChildren: true,
  },
  columns: {
    type: "columns",
    label: "Columns",
    category: "layout",
    icon: "Columns3",
    description: "Multi-column row",
    defaultProps: { columns: 2, children: [[], []] },
    defaultStyle: { padding: "40px 24px" },
    hasChildren: true,
  },
  animatedStat: {
    type: "animatedStat",
    label: "Animated Stat",
    category: "content",
    icon: "TrendingUp",
    description: "Big number that counts up on scroll",
    defaultProps: {
      value: 10000,
      prefix: "",
      suffix: "+",
      label: "happy users",
      decimals: 0,
      duration: 1800,
    },
    defaultStyle: { padding: "60px 24px", textAlign: "center" },
  },
  statProgress: {
    type: "statProgress",
    label: "Stats with Progress",
    category: "content",
    icon: "BarChart3",
    description: "Numbers + animated progress bars",
    defaultProps: {
      items: [
        { label: "Page speed", value: 98, max: 100, suffix: "" },
        { label: "Conversion lift", value: 47, max: 100, suffix: "%" },
        { label: "Customer satisfaction", value: 4.9, max: 5, suffix: "/5" },
      ],
    },
    defaultStyle: { padding: "60px 24px" },
  },
  barChart: {
    type: "barChart",
    label: "Bar Chart",
    category: "content",
    icon: "BarChart3",
    description: "Animated SVG bar chart",
    defaultProps: {
      title: "Monthly signups",
      unit: "",
      highlightMax: true,
      data: [
        { label: "Jan", value: 24 },
        { label: "Feb", value: 38 },
        { label: "Mar", value: 52 },
        { label: "Apr", value: 67 },
        { label: "May", value: 84 },
        { label: "Jun", value: 102 },
      ],
    },
    defaultStyle: { padding: "60px 24px" },
  },
  lineChart: {
    type: "lineChart",
    label: "Line Chart",
    category: "content",
    icon: "Activity",
    description: "Animated SVG line chart",
    defaultProps: {
      title: "Growth over time",
      smooth: true,
      data: [10, 18, 14, 28, 35, 42, 58, 72, 88, 110, 140, 180],
    },
    defaultStyle: { padding: "60px 24px" },
  },
  donutChart: {
    type: "donutChart",
    label: "Donut Chart",
    category: "content",
    icon: "PieChart",
    description: "Distribution donut with center label",
    defaultProps: {
      title: "Where users come from",
      centerValue: "47%",
      centerLabel: "Organic",
      segments: [
        { label: "Organic", value: 47, color: "#8b5cf6" },
        { label: "Direct", value: 28, color: "#6366f1" },
        { label: "Referral", value: 15, color: "#ec4899" },
        { label: "Other", value: 10, color: "#475569" },
      ],
    },
    defaultStyle: { padding: "60px 24px" },
  },
  comparisonTable: {
    type: "comparisonTable",
    label: "Comparison Table",
    category: "conversion",
    icon: "Columns3",
    description: "Us vs Them feature comparison",
    defaultProps: {
      title: "How we compare",
      oursLabel: "Forge",
      theirsLabel: "Others",
      rows: [
        { feature: "AI-native editing", ours: true, theirs: false },
        { feature: "Voice → page", ours: true, theirs: false },
        { feature: "Subdomain included", ours: true, theirs: "Paid" },
        { feature: "Custom domain", ours: true, theirs: "Paid" },
        { feature: "Heatmaps built-in", ours: true, theirs: "Add-on" },
        { feature: "Export React code", ours: true, theirs: false },
      ],
    },
    defaultStyle: { padding: "60px 24px" },
  },
  beforeAfter: {
    type: "beforeAfter",
    label: "Before / After",
    category: "conversion",
    icon: "ArrowRightLeft",
    description: "Side-by-side state comparison",
    defaultProps: {
      title: "The difference Forge makes",
      beforeLabel: "Without Forge",
      afterLabel: "With Forge",
      beforePoints: [
        "Days to launch a landing page",
        "Hire a designer + copywriter",
        "Constantly tweaking by hand",
        "Generic templates only",
      ],
      afterPoints: [
        "Ship in minutes, not days",
        "AI writes + designs for you",
        "Auto-optimizes while you sleep",
        "Custom blocks tailored to you",
      ],
    },
    defaultStyle: { padding: "60px 24px" },
  },
  gradientCard: {
    type: "gradientCard",
    label: "Gradient Card",
    category: "content",
    icon: "Sparkles",
    description: "Card with animated gradient border",
    defaultProps: {
      eyebrow: "New",
      title: "Beautiful by default",
      body: "Drop in any card and the gradient border animates subtly. Great for highlighting features or CTAs.",
      ctaLabel: "Learn more",
      ctaHref: "#",
    },
    defaultStyle: { padding: "40px 24px" },
  },
  glowCta: {
    type: "glowCta",
    label: "Glow CTA",
    category: "conversion",
    icon: "Zap",
    description: "Full-bleed CTA with pulsing glow",
    defaultProps: {
      headline: "Ready to ship in minutes?",
      subheadline: "Join 10,000+ teams building faster.",
      ctaLabel: "Start free",
      ctaHref: "#",
      secondaryLabel: "Watch demo",
      secondaryHref: "#",
    },
    defaultStyle: {
      padding: "120px 24px",
      background: "#0a0a0f",
    },
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

export function createBlock<T extends BlockType>(
  type: T,
  overrides?: Partial<Block>
): Block {
  const def = BLOCK_DEFINITIONS[type];
  return {
    id: overrides?.id ?? cryptoRandomId(),
    type,
    props: { ...def.defaultProps, ...(overrides?.props ?? {}) },
    style: { ...(def.defaultStyle ?? {}), ...(overrides?.style ?? {}) },
    children: overrides?.children ?? def.defaultProps?.children,
  };
}

export function cryptoRandomId(): string {
  // 12-char URL-safe ID; collision-resistant for our use case
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  }
  return Math.random().toString(36).slice(2, 14);
}

export const BLOCK_CATEGORIES = [
  { id: "layout", label: "Layout" },
  { id: "content", label: "Content" },
  { id: "conversion", label: "Conversion" },
] as const;
