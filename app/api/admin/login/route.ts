import { NextResponse } from "next/server";

// 从环境变量读取凭据，与 middleware 保持一致
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "fotobestway2026";
const SECRET = process.env.ADMIN_SESSION_SECRET || "fotobestway-admin-session-secret";

// HMAC-SHA256 签名（Web Crypto，node/edge 通用）
async function sign(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  let binary = "";
  for (let i = 0; i < sig.length; i++) binary += String.fromCharCode(sig[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");

    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
      return NextResponse.json(
        { success: false, error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    // 生成会话 cookie：payload.签名（12 小时有效）
    const expiresIn = 12 * 3600 * 1000;
    const expiry = Date.now() + expiresIn;
    const payload = `${username}.${expiry}`;
    const signature = await sign(payload);

    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_session", `${payload}.${signature}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: expiresIn / 1000,
    });

    return res;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "请求解析失败" },
      { status: 400 }
    );
  }
}
