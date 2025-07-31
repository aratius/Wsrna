import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { remark } from "remark";
import html from "remark-html";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "ja";
    const langCode = lang === "en" ? "en" : "ja";

    const filePath = path.join(process.cwd(), `src/content/help.${langCode}.md`);
    const markdown = fs.readFileSync(filePath, "utf8");
    const result = await remark().use(html).process(markdown);
    const contentHtml = result.toString();

    return NextResponse.json({ content: contentHtml });
  } catch (error) {
    console.error("Error loading help content:", error);
    return NextResponse.json(
      { error: "Failed to load help content" },
      { status: 500 }
    );
  }
}