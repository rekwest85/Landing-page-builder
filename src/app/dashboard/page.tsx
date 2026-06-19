import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Rocket, Trash2, ExternalLink, Globe } from "lucide-react";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const dbAvailable = prisma !== null;

  let pages: any[] = [];
  let workspace: any = null;

  if (dbAvailable) {
    try {
      // For MVP: auto-create default workspace + user if none
      let user = await prisma!.user.findFirst();
      if (!user) {
        user = await prisma!.user.create({
          data: { email: "demo@forge.local", name: "Demo User" },
        });
      }
      // Simpler: just get any workspace this user is in
      const member = await prisma!.workspaceMember.findFirst({
        where: { userId: user.id },
        include: { workspace: true },
      });
      if (!member) {
        workspace = await prisma!.workspace.create({
          data: {
            name: "My workspace",
            slug: "demo",
            members: { create: { userId: user.id, role: "OWNER" } },
          },
        });
      } else {
        workspace = member.workspace;
      }
      pages = await prisma!.page.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { updatedAt: "desc" },
      });
    } catch (e) {
      console.error("DB error:", e);
    }
  }

  async function createPage() {
    "use server";
    if (!prisma) return;
    const user = await prisma.user.findFirst();
    if (!user) return;
    const member = await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
    });
    if (!member) return;
    const slug = `page-${Date.now()}`;
    const page = await prisma.page.create({
      data: {
        title: "Untitled page",
        slug,
        tree: [],
        workspaceId: member.workspaceId,
        authorId: user.id,
      },
    });
    redirect(`/editor/${page.id}`);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2">
          <div className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
              <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">Forge</span>
        </Link>
        <div className="flex items-center gap-2">
          {workspace && (
            <span className="text-xs text-white/40">{workspace.slug}.forge.local</span>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Pages</h1>
            <p className="text-sm text-white/50 mt-1">
              {pages.length} {pages.length === 1 ? "page" : "pages"} in your workspace
            </p>
          </div>
          <form action={createPage}>
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4" />
              New page
            </Button>
          </form>
        </div>

        {!dbAvailable ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6">
            <div className="text-sm text-amber-200 font-medium mb-1">
              Database not configured
            </div>
            <p className="text-sm text-amber-200/70">
              Add your <code className="text-amber-100 font-mono text-xs">DATABASE_URL</code> from Neon to <code className="text-amber-100 font-mono text-xs">.env</code>, then run{" "}
              <code className="text-amber-100 font-mono text-xs">npx prisma db push</code>.
            </p>
          </div>
        ) : pages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-16 text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 mb-4">
              <Rocket className="h-7 w-7 text-violet-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No pages yet</h3>
            <p className="text-sm text-white/50 max-w-md mx-auto mb-6">
              Create your first page and let AI build the foundation for you.
            </p>
            <form action={createPage}>
              <Button variant="primary">
                <Plus className="h-4 w-4" />
                Create your first page
              </Button>
            </form>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={`/editor/${page.id}`}
                className="group block rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-violet-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {page.title || "Untitled"}
                    </div>
                    <div className="text-xs text-white/40 mt-0.5 truncate">
                      /{page.slug}
                    </div>
                  </div>
                  <span
                    className={
                      page.status === "PUBLISHED"
                        ? "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300"
                        : "inline-flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 text-[10px] font-medium text-white/50"
                    }
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${page.status === "PUBLISHED" ? "bg-emerald-400" : "bg-white/40"}`} />
                    {page.status.toLowerCase()}
                  </span>
                </div>
                <div className="aspect-[16/9] rounded-lg bg-white/[0.04] border border-white/[0.06] mb-3 overflow-hidden flex items-center justify-center text-[10px] text-white/30">
                  {Array.isArray(page.tree) && page.tree.length > 0
                    ? `${(page.tree as any[]).length} blocks`
                    : "Empty"}
                </div>
                <div className="text-xs text-white/40">
                  Updated {new Date(page.updatedAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
