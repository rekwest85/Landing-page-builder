import { prisma } from "@/lib/db";
import { RenderTree } from "@/lib/blocks/renderer";
import type { Block } from "@/lib/blocks/types";
import { notFound } from "next/navigation";

export default async function PublishedPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!prisma) notFound();

  const page = await prisma.page.findFirst({
    where: { slug, status: { in: ["PUBLISHED", "DRAFT"] } },
  });

  if (!page) notFound();

  return (
    <div className="min-h-screen bg-white">
      <RenderTree blocks={(page.tree as unknown as Block[]) ?? []} />
    </div>
  );
}
