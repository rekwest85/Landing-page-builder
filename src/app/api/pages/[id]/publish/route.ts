import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { id } = await params;
  const page = await prisma.page.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
    include: { workspace: true },
  });

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const protocol = rootDomain.includes("localhost") ? "http" : "https";
  const url = page.workspace.slug === "demo"
    ? `${protocol}://${rootDomain}/p/${page.slug}`
    : `${protocol}://${page.workspace.slug}.${rootDomain}`;

  return NextResponse.json({ page, url });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { id } = await params;
  const page = await prisma.page.update({
    where: { id },
    data: { status: "DRAFT", publishedAt: null },
  });
  return NextResponse.json({ page });
}
