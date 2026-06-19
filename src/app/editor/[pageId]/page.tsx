import { prisma } from "@/lib/db";
import { Editor } from "@/components/editor/Editor";
import { notFound } from "next/navigation";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;

  if (!prisma) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-white mb-2">Database not configured</h1>
          <p className="text-sm text-white/60">
            Set DATABASE_URL in your .env file from your Neon project, then run{" "}
            <code className="text-violet-300">npx prisma db push</code>.
          </p>
        </div>
      </div>
    );
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
  });

  if (!page) notFound();

  return (
    <Editor
      pageId={page.id}
      slug={page.slug}
      title={page.title}
      blocks={(page.tree as any) ?? []}
    />
  );
}
