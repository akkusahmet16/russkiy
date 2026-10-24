import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ok, fail } from "@/lib/http";

export async function POST(req: Request) {
  try {
    const { apiKey } = (await req.json()) as { apiKey: string };
    const clean = apiKey?.trim();
    if (!clean) return ok({ error: "API anahtarı boş olamaz" }, { status: 400 });

    process.env.GEMINI_API_KEY = clean;

    const envPath = path.join(process.cwd(), ".env");
    let content = "";
    try {
      content = await readFile(envPath, "utf8");
    } catch {
      content = `DATABASE_URL="file:./dev.db"\n`;
    }

    if (/^GEMINI_API_KEY=.*$/m.test(content)) {
      content = content.replace(/^GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY="${clean}"`);
    } else {
      content += `\nGEMINI_API_KEY="${clean}"\n`;
    }
    await writeFile(envPath, content, "utf8");

    return ok({ saved: true });
  } catch (e) {
    return fail(e);
  }
}
