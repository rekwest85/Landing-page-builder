import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  tree: z.array(z.any()).optional(),
  description: z.string().optional(),
  ogImage: z.string().url().optional(),
  customCss: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // If tree changed, snapshot a version
  if (parsed.data.tree) {
    const existing = await prisma.page.findUnique({ where: { id }, select: { tree: true } });
    if (existing) {
      await prisma.pageVersion.create({
        data: { pageId: id, tree: existing.tree as any },
      });
    }
  }

  const page = await prisma.page.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ page });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { id } = await params;
  await prisma.page.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ page });
}
