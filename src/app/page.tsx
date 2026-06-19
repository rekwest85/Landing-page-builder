import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, MessageSquare, Rocket } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background grid + glow */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_0_16px_-2px_rgba(139,92,246,0.5)]">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
              <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-base font-semibold text-white">Forge</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              Start building
              <Rocket className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-6">
          <Sparkles className="h-3 w-3 text-violet-300" />
          AI-native page builder
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.05]">
          Build pages
          <br />
          <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
            at the speed of thought.
          </span>
        </h1>
        <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
          Forge turns ideas into high-converting landing pages. Describe what you want, get a beautiful page in 60 seconds, then refine it with a chat interface that actually feels like a co-designer.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="primary" size="lg">
              <Sparkles className="h-4 w-4" />
              Start building free
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              See a live page
            </Button>
          </Link>
        </div>
      </section>

      {/* Demo placeholder — actual editor screenshot will go here */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="aspect-[16/9] rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#14141a] to-[#0a0a0f] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.8)] flex items-center justify-center text-white/30 text-sm">
          <span>The editor — coming soon</span>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Sparkles, title: "AI co-designer", desc: "Describe your offer and AI builds the page. Refine any section with natural language." },
            { icon: Zap, title: "Live & instant", desc: "Every edit updates the page in real time. No save button, no waiting." },
            { icon: MessageSquare, title: "Chat-native", desc: "No clunky drag-and-drop. Edit your page the way you'd brief a designer." },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 mb-4">
                <f.icon className="h-5 w-5 text-violet-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-8 border-t border-white/[0.06] text-center text-xs text-white/40">
        Forge · Built for the next generation of makers.
      </footer>
    </main>
  );
}
