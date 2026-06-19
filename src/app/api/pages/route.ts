import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/pages — list all pages (across user's workspaces)
export async function GET() {
  if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      updatedAt: true,
      workspaceId: true,
    },
  });
  return NextResponse.json({ pages });
}
