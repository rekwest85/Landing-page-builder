// AI generation for Forge.
// Calls any OpenAI-compatible chat completions API.
// Defaults to whatever OPENAI_API_KEY points at; can be swapped for Anthropic, DeepSeek, Kimi, etc.

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionOptions {
  messages: AIMessage[];
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
}

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";

export async function generateCompletion({
  messages,
  jsonMode = true,
  temperature = 0.7,
  maxTokens = 4000,
}: AICompletionOptions): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY not set. Add it to .env to enable AI generation."
    );
  }

  const baseUrl = process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ── Heuristic fallback when no API key is set ───────────────────────────────
// Returns a simple but solid template based on the prompt so the UI still works.

export function generateHeuristic(prompt: string): string {
  const title = prompt.length > 60 ? prompt.slice(0, 57) + "…" : prompt;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return JSON.stringify(
    {
      blocks: [
        {
          type: "hero",
          props: {
            eyebrow: "Now live",
            headline: title.charAt(0).toUpperCase() + title.slice(1),
            subheadline:
              "Built for modern teams. Ship faster, convert more, and let AI handle the heavy lifting.",
            ctaLabel: "Get started",
            ctaHref: "#form",
            secondaryCtaLabel: "Learn more",
            secondaryCtaHref: "#features",
            align: "center",
          },
        },
        {
          type: "logos",
          props: {
            caption: "Trusted by teams at",
            images: [],
          },
        },
        {
          type: "features",
          props: {
            columns: 3,
            items: [
              { icon: "Zap", title: "Lightning fast", description: "Pages publish in seconds and load instantly worldwide." },
              { icon: "Sparkles", title: "AI-native", description: "Generate, rewrite, and optimize with a chat interface." },
              { icon: "Target", title: "Conversion focused", description: "Built-in scoring and A/B testing, no extra tools." },
            ],
          },
        },
        {
          type: "testimonial",
          props: {
            quote: "Forge cut our landing page production from days to minutes. The AI writes copy that actually converts.",
            author: "Sarah Chen",
            role: "Head of Growth, Linear",
          },
        },
        {
          type: "pricing",
          props: {
            tiers: [
              { name: "Starter", price: "$0", period: "forever", features: ["1 published page", "Forge subdomain"], ctaLabel: "Start free", ctaHref: "#" },
              { name: "Pro", price: "$29", period: "/month", features: ["Unlimited pages", "Custom domain", "AI optimize"], ctaLabel: "Upgrade", ctaHref: "#", highlighted: true },
              { name: "Agency", price: "$299", period: "/month", features: ["Everything in Pro", "White-label"], ctaLabel: "Contact sales", ctaHref: "#" },
            ],
          },
        },
        {
          type: "faq",
          props: {
            items: [
              { q: "How does it work?", a: "Describe your offer, AI builds the page, you refine with chat. Publish in minutes." },
              { q: "Can I use my own domain?", a: "Yes — connect any domain and we provision SSL automatically." },
            ],
          },
        },
        {
          type: "cta",
          props: {
            headline: "Ready to get started?",
            subheadline: "Join teams already shipping faster with Forge.",
            ctaLabel: "Start free",
            ctaHref: "#",
          },
        },
      ],
    },
    null,
    2
  );
}
