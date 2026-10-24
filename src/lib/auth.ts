import "server-only";
import crypto from "node:crypto";
import Database from "better-sqlite3";
import { cookies } from "next/headers";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  geminiApiKey: string;
}

interface StoredUser extends AuthUser {
  passwordHash: string;
  createdAt: string;
}

export interface ProgressBackup {
  level: string;
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  dailyGoalXp: number;
  completedLessons: string[];
  goalFocus?: string;
  onboardingCompleted?: boolean;
}

const SESSION_COOKIE = "russkiy_session_v1";
const PROGRESS_COOKIE_PREFIX = "russkiy_prog_";
const SECRET = process.env.AUTH_SECRET || "russkiy-swiss-editorial-secret-key-2026";

function getAuthDbPath() {
  return process.env.VERCEL ? "/tmp/russkiy-auth.db" : "./dev-auth.db";
}

function openAuthDb() {
  const db = new Database(getAuthDbPath());
  db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      geminiApiKey TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL
    );
  `);
  return db;
}

export function deriveUserId(email: string): string {
  return crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 16);
}

export function hashPassword(password: string, salt?: string): string {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, s, 64).toString("hex");
  return `${s}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(derived, "hex"));
}

function signPayload(data: object): string {
  const json = Buffer.from(JSON.stringify(data), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(json).digest("base64url");
  return `${json}.${sig}`;
}

function verifyPayload<T>(token: string): T | null {
  try {
    const [json, sig] = token.split(".");
    if (!json || !sig) return null;
    const expected = crypto.createHmac("sha256", SECRET).update(json).digest("base64url");
    if (sig !== expected) return null;
    return JSON.parse(Buffer.from(json, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function maskApiKey(key?: string): string {
  if (!key || key.length < 8) return "";
  return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
}

/**
 * Aktif kullanıcıyı döndürür.
 * Vercel Serverless soğuk başlangıçlarında (/tmp sıfırlandığında) imzalı çerezden
 * kullanıcıyı otomatik olarak SQLite'a geri yükler.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const store = await cookies();
    const raw = store.get(SESSION_COOKIE)?.value;
    if (!raw) return null;

    const payload = verifyPayload<StoredUser>(raw);
    if (!payload || !payload.id || !payload.email) return null;

    const db = openAuthDb();
    try {
      const row = db
        .prepare(`SELECT id, email, name, passwordHash, geminiApiKey, createdAt FROM Users WHERE id = ? LIMIT 1`)
        .get(payload.id) as StoredUser | undefined;

      if (!row) {
        // Vercel cold-start re-hydration
        db.prepare(
          `INSERT OR IGNORE INTO Users (id, email, name, passwordHash, geminiApiKey, createdAt)
           VALUES (?, ?, ?, ?, ?, ?)`,
        ).run(
          payload.id,
          payload.email,
          payload.name,
          payload.passwordHash,
          payload.geminiApiKey || "",
          payload.createdAt || new Date().toISOString(),
        );
        return {
          id: payload.id,
          email: payload.email,
          name: payload.name,
          geminiApiKey: payload.geminiApiKey || "",
        };
      }

      return {
        id: row.id,
        email: row.email,
        name: row.name,
        geminiApiKey: row.geminiApiKey || payload.geminiApiKey || "",
      };
    } finally {
      db.close();
    }
  } catch {
    return null;
  }
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  geminiApiKey?: string;
}): Promise<{ user?: AuthUser; error?: string }> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const password = input.password;
  const geminiApiKey = (input.geminiApiKey ?? "").trim();

  if (!name || name.length < 2) return { error: "Lütfen en az 2 karakterli bir isim girin." };
  if (!email || !email.includes("@")) return { error: "Geçerli bir e-posta adresi girin." };
  if (!password || password.length < 4) return { error: "Şifreniz en az 4 karakter olmalıdır." };

  const id = deriveUserId(email);
  const passwordHash = hashPassword(password);
  const createdAt = new Date().toISOString();

  const db = openAuthDb();
  try {
    const existing = db.prepare(`SELECT id FROM Users WHERE email = ? LIMIT 1`).get(email);
    if (existing) {
      return { error: "Bu e-posta adresiyle kayıtlı bir hesap zaten var. Giriş yapabilirsiniz." };
    }

    db.prepare(
      `INSERT INTO Users (id, email, name, passwordHash, geminiApiKey, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(id, email, name, passwordHash, geminiApiKey, createdAt);

    const stored: StoredUser = { id, email, name, passwordHash, geminiApiKey, createdAt };
    await setSessionCookie(stored);

    return { user: { id, email, name, geminiApiKey } };
  } finally {
    db.close();
  }
}

export async function loginUser(input: {
  email: string;
  password: string;
  geminiApiKey?: string;
}): Promise<{ user?: AuthUser; error?: string }> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const newKey = (input.geminiApiKey ?? "").trim();

  if (!email || !password) return { error: "E-posta ve şifre alanları zorunludur." };

  const db = openAuthDb();
  try {
    const row = db
      .prepare(`SELECT id, email, name, passwordHash, geminiApiKey, createdAt FROM Users WHERE email = ? LIMIT 1`)
      .get(email) as StoredUser | undefined;

    if (!row) {
      return { error: "Bu e-posta ile kayıtlı hesap bulunamadı. Lütfen önce kayıt olun." };
    }

    if (!verifyPassword(password, row.passwordHash)) {
      return { error: "Hatalı şifre girdiniz. Lütfen tekrar deneyin." };
    }

    const finalKey = newKey || row.geminiApiKey || "";
    if (newKey && newKey !== row.geminiApiKey) {
      db.prepare(`UPDATE Users SET geminiApiKey = ? WHERE id = ?`).run(finalKey, row.id);
    }

    const stored: StoredUser = { ...row, geminiApiKey: finalKey };
    await setSessionCookie(stored);

    return {
      user: {
        id: row.id,
        email: row.email,
        name: row.name,
        geminiApiKey: finalKey,
      },
    };
  } finally {
    db.close();
  }
}

export async function updateCurrentUserSettings(input: {
  geminiApiKey?: string;
  name?: string;
}): Promise<AuthUser | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const payload = verifyPayload<StoredUser>(raw);
  if (!payload) return null;

  const nextName = input.name?.trim() || payload.name;
  const nextKey = input.geminiApiKey !== undefined ? input.geminiApiKey.trim() : payload.geminiApiKey;

  const db = openAuthDb();
  try {
    db.prepare(
      `INSERT INTO Users (id, email, name, passwordHash, geminiApiKey, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name = ?, geminiApiKey = ?`,
    ).run(
      payload.id,
      payload.email,
      nextName,
      payload.passwordHash,
      nextKey,
      payload.createdAt || new Date().toISOString(),
      nextName,
      nextKey,
    );
  } finally {
    db.close();
  }

  const updated: StoredUser = {
    ...payload,
    name: nextName,
    geminiApiKey: nextKey,
  };
  await setSessionCookie(updated);

  return {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    geminiApiKey: updated.geminiApiKey,
  };
}

async function setSessionCookie(user: StoredUser) {
  const store = await cookies();
  const token = signPayload(user);
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 gün
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Kullanıcının ilerleme özetini imzalı çerezde yedekler (Vercel serverless soğuk başlangıç koruması) */
export async function saveProgressBackupCookie(userId: string, backup: ProgressBackup) {
  try {
    const store = await cookies();
    const token = signPayload(backup);
    store.set(`${PROGRESS_COOKIE_PREFIX}${userId}`, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
  } catch {
    // Server Component render sırasında cookie yazılamazsa sessizce geç
  }
}

export async function getProgressBackupCookie(userId: string): Promise<ProgressBackup | null> {
  try {
    const store = await cookies();
    const raw = store.get(`${PROGRESS_COOKIE_PREFIX}${userId}`)?.value;
    if (!raw) return null;
    return verifyPayload<ProgressBackup>(raw);
  } catch {
    return null;
  }
}
