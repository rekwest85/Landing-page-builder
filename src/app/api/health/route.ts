import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/health — diagnostic endpoint to verify DB connectivity
export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      {
        ok: false,
        error: "Prisma client is null — DATABASE_URL likely missing or invalid",
        envPresent: !!process.env.DATABASE_URL,
        envHost: process.env.DATABASE_URL?.split("@")[1]?.split("?")[0] || null,
      },
      { status: 503 },
    );
  }
  try {
    const userCount = await prisma.user.count();
    const wsCount = await prisma.workspace.count();
    const pageCount = await prisma.page.count();
    return NextResponse.json({
      ok: true,
      envHost: process.env.DATABASE_URL?.split("@")[1]?.split("?")[0],
      counts: { users: userCount, workspaces: wsCount, pages: pageCount },
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e.message?.split("\n").slice(0, 3).join(" | "),
        code: e.code,
        envHost: process.env.DATABASE_URL?.split("@")[1]?.split("?")[0],
      },
      { status: 500 },
    );
  }
}