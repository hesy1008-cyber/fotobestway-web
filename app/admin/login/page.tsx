"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // 整页跳转，确保 middleware 校验通过
        window.location.href = "/admin";
      } else {
        setError(data?.error || "登录失败，请重试");
        setLoading(false);
      }
    } catch (err) {
      setError("网络错误，请重试");
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* 背景光晕 */}
      <div style={styles.glow1} />
      <div style={styles.glow2} />
      {/* 顶部细线装饰 */}
      <div style={styles.topLine} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoBadge}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 16.5C4 15.12 5.12 14 6.5 14H17.5C18.88 14 20 15.12 20 16.5C20 17.88 18.88 19 17.5 19H6.5C5.12 19 4 17.88 4 16.5Z"
                fill="#e60012"
              />
              <path
                d="M4 7.5C4 6.12 5.12 5 6.5 5H17.5C18.88 5 20 6.12 20 7.5C20 8.88 18.88 10 17.5 10H6.5C5.12 10 4 8.88 4 7.5Z"
                fill="#fff"
                fillOpacity="0.9"
              />
              <rect x="4" y="5" width="2.6" height="14" rx="1.3" fill="#e60012" />
            </svg>
          </div>
          <div>
            <div style={styles.logoTitle}>
              FOTO<span style={{ color: "#e60012" }}>BESTWAY</span>
            </div>
            <div style={styles.logoSub}>ADMIN PANEL · 管理后台</div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* 标题 */}
        <h1 style={styles.heading}>欢迎回来</h1>
        <p style={styles.subheading}>登录以管理您的网站内容</p>

        {/* 表单 */}
        <form onSubmit={handleSubmit} style={styles.form} autoComplete="off">
          <div style={styles.field}>
            <label style={styles.label}>用户名</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
              </svg>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                style={styles.input}
                autoComplete="off"
                name="fbw-username"
                readOnly
                onFocus={(e) => e.target.removeAttribute("readonly")}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>密码</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                style={styles.input}
                autoComplete="new-password"
                name="fbw-password"
                readOnly
                onFocus={(e) => e.target.removeAttribute("readonly")}
              />
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={loading ? { ...styles.button, opacity: 0.6 } : styles.button}>
            {loading ? "登录中..." : "登 录"}
          </button>
        </form>

        <div style={styles.footer}>
          <span>FOTOBESTWAY · 摄影器材管理后台</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(ellipse at 50% -20%, #2a0a0d 0%, #161212 45%, #0b0b0b 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily:
      "'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif",
  },
  topLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: "linear-gradient(90deg, #e60012 0%, #ff4d5a 50%, #e60012 100%)",
  },
  glow1: {
    position: "absolute",
    top: "-15%",
    right: "-10%",
    width: 520,
    height: 520,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(230,0,18,0.18) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  glow2: {
    position: "absolute",
    bottom: "-20%",
    left: "-10%",
    width: 480,
    height: 480,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(230,0,18,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    width: 400,
    maxWidth: "90vw",
    background: "linear-gradient(180deg, #1c1c1c 0%, #141414 100%)",
    borderRadius: 14,
    padding: "40px 42px 28px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.65)",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: 0.5,
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: 11,
    color: "#888",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  divider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(230,0,18,0.5), transparent)",
    margin: "20px 0 26px",
  },
  heading: {
    margin: 0,
    fontSize: 24,
    fontWeight: 600,
    color: "#fff",
  },
  subheading: {
    margin: "8px 0 26px",
    fontSize: 13,
    color: "#8a8a8a",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  label: {
    fontSize: 13,
    color: "#bbb",
    fontWeight: 500,
  },
  inputWrap: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#777",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px 12px 42px",
    background: "#0e0e0e",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  error: {
    background: "rgba(230,0,18,0.12)",
    border: "1px solid rgba(230,0,18,0.4)",
    color: "#ff6b76",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
  },
  button: {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #e60012, #c4000f)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: 4,
    cursor: "pointer",
    transition: "transform 0.15s, box-shadow 0.2s",
    boxShadow: "0 6px 20px rgba(230,0,18,0.3)",
    marginTop: 4,
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 11,
    color: "#555",
  },
};
