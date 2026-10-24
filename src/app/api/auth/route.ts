import { connection } from "next/server";
import {
  getCurrentUser,
  registerUser,
  loginUser,
  clearSessionCookie,
  maskApiKey,
} from "@/lib/auth";
import { ok, fail } from "@/lib/http";

export async function GET() {
  await connection();
  try {
    const user = await getCurrentUser();
    if (!user) return ok({ user: null });
    return ok({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasApiKey: Boolean(user.geminiApiKey),
        maskedKey: maskApiKey(user.geminiApiKey),
      },
    });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      action: "login" | "register" | "logout";
      name?: string;
      email?: string;
      password?: string;
      geminiApiKey?: string;
    };

    if (body.action === "logout") {
      await clearSessionCookie();
      return ok({ loggedOut: true });
    }

    if (body.action === "register") {
      const res = await registerUser({
        name: body.name ?? "",
        email: body.email ?? "",
        password: body.password ?? "",
        geminiApiKey: body.geminiApiKey ?? "",
      });
      if (res.error || !res.user) {
        return ok({ error: res.error || "Kayıt oluşturulamadı." }, { status: 400 });
      }
      return ok({
        user: {
          id: res.user.id,
          email: res.user.email,
          name: res.user.name,
          hasApiKey: Boolean(res.user.geminiApiKey),
          maskedKey: maskApiKey(res.user.geminiApiKey),
        },
      });
    }

    if (body.action === "login") {
      const res = await loginUser({
        email: body.email ?? "",
        password: body.password ?? "",
        geminiApiKey: body.geminiApiKey ?? "",
      });
      if (res.error || !res.user) {
        return ok({ error: res.error || "Giriş yapılamadı." }, { status: 400 });
      }
      return ok({
        user: {
          id: res.user.id,
          email: res.user.email,
          name: res.user.name,
          hasApiKey: Boolean(res.user.geminiApiKey),
          maskedKey: maskApiKey(res.user.geminiApiKey),
        },
      });
    }

    return ok({ error: "Geçersiz işlem" }, { status: 400 });
  } catch (e) {
    return fail(e);
  }
}
