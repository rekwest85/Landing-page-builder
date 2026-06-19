import { NextResponse } from "next/server";
import { improveBlockCopy } from "@/lib/ai/generate";
import { z } from "zod";

const schema = z.object({
  type: z.string(),
  props: z.record(z.any()),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const props = await improveBlockCopy(
      parsed.data.type,
      parsed.data.props,
      "Rewrite this copy to be more compelling, clearer, and conversion-focused. Keep the same structure."
    );
    return NextResponse.json({ props });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Regenerate failed" },
      { status: 500 }
    );
  }
}
