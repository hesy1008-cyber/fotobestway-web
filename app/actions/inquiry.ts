"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { sendInquiryNotification } from "@/app/lib/email";

// 获取客户端 IP（通过反向代理头）
async function getClientIp(): Promise<string | null> {
  try {
    const h = await headers();
    const fwd = h.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    return h.get("x-real-ip") || null;
  } catch {
    return null;
  }
}

// 垃圾特征检测（命中任一规则即判定垃圾）
function detectSpam(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): { isSpam: boolean; reason: string } {
  const message = (data.message || "").trim();
  const email = (data.email || "").trim().toLowerCase();
  const phone = (data.phone || "").trim().replace(/[\s\-()]/g, "");

  // 1. 留言为纯数字（长度>=6）→ 无意义内容
  if (/^\d{6,}$/.test(message)) {
    return { isSpam: true, reason: "留言为纯数字" };
  }

  // 2. 垃圾邮箱模式：主流免费邮箱前缀含多点且带数字（如 a.q.e.f.u.l.a.x.u.6.23@gmail.com）
  const atIdx = email.indexOf("@");
  if (atIdx > 0) {
    const local = email.slice(0, atIdx);
    const domain = email.slice(atIdx + 1);
    if (/(gmail|outlook|hotmail|yahoo|qq)\.com$/i.test(domain)) {
      const dots = (local.match(/\./g) || []).length;
      if (dots >= 2 && /\d/.test(local)) {
        return { isSpam: true, reason: "垃圾邮箱模式" };
      }
      // 纯随机乱码前缀（无元音连续乱序），如 qvl sdy jevpyd 对应的邮箱前缀
      if (dots >= 2 && !/[aeiou]/i.test(local.replace(/[.\d]/g, ""))) {
        return { isSpam: true, reason: "垃圾邮箱模式" };
      }
    }
  }

  // 3. 美国免费电话（800/866/877/888/855 开头）
  if (/^(800|866|877|888|855)\d{7}$/.test(phone)) {
    return { isSpam: true, reason: "美国免费电话" };
  }

  return { isSpam: false, reason: "" };
}

// 提交询盘（联系表单）——带防垃圾拦截
export async function createInquiry(data: {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject?: string;
  message: string;
  website?: string;
}) {
  // 蜜罐检测：隐藏字段被填写说明是机器人 → 静默丢弃（假装成功）
  if (data.website && data.website.trim() !== "") {
    return { success: true };
  }

  // 基本校验
  if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
    return { success: false, error: "Missing required fields" };
  }

  const email = data.email.trim().toLowerCase();
  const ip = await getClientIp();

  try {
    // 黑名单检测（后台标记过的邮箱 / IP）
    const blocked = await prisma.spamBlock.findFirst({
      where: {
        OR: [
          { email },
          ...(ip ? [{ ip } as const] : []),
        ],
      },
    });
    if (blocked) {
      return { success: true }; // 静默丢弃
    }

    // 垃圾特征检测
    const spamCheck = detectSpam({
      name: data.name,
      email,
      phone: data.phone,
      message: data.message,
    });

    // 频率限制：同一 IP 10 分钟内已有 >=2 条 → 静默丢弃
    if (ip) {
      const recentCount = await prisma.inquiry.count({
        where: {
          ip,
          createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
        },
      });
      if (recentCount >= 2) {
        return { success: true };
      }
    }

    // 明确垃圾 → 静默丢弃（不入库、不通知）
    if (spamCheck.isSpam) {
      return { success: true };
    }

    // 同邮箱已有 >=3 条未读 → 疑似轰炸，入库但标记为垃圾
    const existingUnread = await prisma.inquiry.count({
      where: { email, isRead: false },
    });
    const markAsSpam = existingUnread >= 3;

    const inquiry = await prisma.inquiry.create({
      data: {
        name: data.name.trim(),
        email,
        company: data.company?.trim() || null,
        phone: data.phone?.trim() || null,
        subject: data.subject?.trim() || null,
        message: data.message.trim(),
        ip,
        isSpam: markAsSpam,
        spamReason: markAsSpam ? "同邮箱疑似轰炸" : null,
      },
    });

    revalidatePath("/admin/inquiries");

    // 只有正常询盘才发邮件通知
    if (!markAsSpam) {
      sendInquiryNotification({
        name: inquiry.name,
        email: inquiry.email,
        company: inquiry.company,
        phone: inquiry.phone,
        subject: inquiry.subject,
        message: inquiry.message,
        createdAt: inquiry.createdAt,
      }).catch((err) => {
        console.error("Failed to send notification email:", err);
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to create inquiry:", error);
    return { success: false, error: "Failed to submit inquiry" };
  }
}

// 标记询盘为已读/未读
export async function toggleInquiryRead(id: string, isRead: boolean) {
  await prisma.inquiry.update({
    where: { id },
    data: { isRead },
  });
  revalidatePath("/admin/inquiries");
}

// 标记询盘为垃圾：该邮箱/IP 加入黑名单，之后自动拦截
export async function markInquirySpam(id: string) {
  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) return;

  await prisma.$transaction([
    prisma.spamBlock.create({
      data: {
        email: inquiry.email.toLowerCase(),
        ip: inquiry.ip || null,
        reason: `后台标记（原询盘: ${inquiry.name}）`,
      },
    }),
    prisma.inquiry.update({
      where: { id },
      data: { isSpam: true, spamReason: "后台标记" },
    }),
  ]);

  revalidatePath("/admin/inquiries");
}

// 删除询盘
export async function deleteInquiry(id: string) {
  await prisma.inquiry.delete({ where: { id } });
  revalidatePath("/admin/inquiries");
}
