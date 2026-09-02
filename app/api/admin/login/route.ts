import { NextResponse } from "next/server";

// 从环境变量读取凭据，与 middleware 保持一致
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "fotobestway2026";
const SECRET = process.env.ADMIN_SESSION_SECRET || "fotobestway-admin-session-secret";

// 额外账号（内部人员，仅导出权限）：从环境变量读取 JSON
// 格式: ADMIN_USERS_EXTRA=[{"username":"mingshi1","password":"ms803","role":"limited"}]
function getExtraUsers(): { username: string; password: string; role: string }[] {
  try {
    const raw = process.env.ADMIN_USERS_EXTRA;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((u) => u && u.username && u.password)
      .map((u) => ({
        username: String(u.username),
        password: String(u.password),
        // 内部账号固定 limited 角色（仅查看产品列表/询盘 + 导出图片）
        role: "limited",
      }));
  } catch (e) {
    return [];
  }
}

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

    let role = "";
    let displayName = "";

    // 1. 主管理员账号
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      role = "admin";
      displayName = username;
    } else {
      // 2. 内部人员账号（limited）
      const extra = getExtraUsers().find(
        (u) => u.username === username && u.password === password
      );
      if (extra) {
        role = extra.role;
        displayName = extra.username;
      }
    }

    if (!role) {
      return NextResponse.json(
        { success: false, error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    // 生成会话 cookie：payload.签名（12 小时有效）
    const expiresIn = 12 * 3600 * 1000;
    const expiry = Date.now() + expiresIn;
    const payload = `${displayName}.${role}.${expiry}`;
    const signature = await sign(payload);

    const res = NextResponse.json({ success: true, role, username: displayName });
    res.cookies.set("admin_session", `${payload}.${signature}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: expiresIn / 1000,
    });
    // 非 httpOnly 的角色 cookie，供前端按角色渲染界面
    res.cookies.set("admin_role", role, {
      httpOnly: false,
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
