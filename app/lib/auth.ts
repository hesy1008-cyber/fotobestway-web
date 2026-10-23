import type { NextRequest } from "next/server";

/**
 * 后台会话校验（供 proxy 与 /api 写操作路由共用）。
 *
 * 会话格式：`<user>.<role>.<expiry>.<signature>`（HMAC-SHA256）
 * 与 app/api/admin/login/route.ts 保持一致。
 */

const SECRET = process.env.ADMIN_SESSION_SECRET || "";

// HMAC-SHA256 签名（Node.js runtime 使用 Web Crypto）
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

/**
 * 校验会话 cookie，返回角色（admin/limited），无效返回空字符串。
 * 未配置 ADMIN_SESSION_SECRET 时一律视为未登录（防止弱密钥伪造）。
 */
export async function checkSession(request: NextRequest): Promise<string> {
  const cookie = request.cookies.get("admin_session")?.value;
  if (!cookie) return "";
  if (!SECRET) return "";

  const parts = cookie.split(".");
  if (parts.length !== 4) return "";

  const [user, role, expiry, signature] = parts;
  const exp = Number(expiry);
  if (!exp || Date.now() > exp) return "";

  const expected = await sign(`${user}.${role}.${expiry}`);
  return signature === expected ? role : "";
}

/**
 * API 写操作鉴权：必须是已登录会话（admin 或 limited 均可）才放行。
 * 返回 role；未登录返回 null。
 */
export async function requireAdminRole(
  request: NextRequest
): Promise<string | null> {
  const role = await checkSession(request);
  if (!role) return null;
  return role;
}
