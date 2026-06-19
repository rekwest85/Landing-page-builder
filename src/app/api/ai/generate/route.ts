import { NextResponse } from "next/server";
import { generatePageFromPrompt } from "@/lib/ai/generate";
import { z } from "zod";

const schema = z.object({
  prompt: z.string().min(3),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
  }

  try {
    const blocks = await generatePageFromPrompt(parsed.data.prompt);
    return NextResponse.json({ blocks });
  } catch (err: any) {
    console.error("AI generation error:", err);
    return NextResponse.json(
      { error: err.message ?? "Generation failed" },
      { status: 500 }
    );
  }
}
