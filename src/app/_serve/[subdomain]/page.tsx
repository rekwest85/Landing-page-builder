import { prisma } from "@/lib/db";
import { RenderTree } from "@/lib/blocks/renderer";
import type { Block } from "@/lib/blocks/types";
import { notFound } from "next/navigation";

// Serves a page from a subdomain. URL: /_serve/<workspaceSlug>?path=<slug>
export default async function ServeSubdomain({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ path?: string }>;
}) {
  const { subdomain } = await params;
  const { path } = await searchParams;

  if (!prisma) notFound();

  const workspace = await prisma.workspace.findUnique({
    where: { slug: subdomain },
  });

  if (!workspace) notFound();

  // If no path, show the workspace's index page (latest published, or first page)
  let page = null;
  if (!path) {
    page = await prisma.page.findFirst({
      where: { workspaceId: workspace.id, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
    });
  } else {
    page = await prisma.page.findFirst({
      where: { workspaceId: workspace.id, slug: path, status: "PUBLISHED" },
    });
  }

  if (!page) notFound();

  return (
    <div className="min-h-screen bg-white">
      <RenderTree blocks={(page.tree as unknown as Block[]) ?? []} />
    </div>
  );
}
