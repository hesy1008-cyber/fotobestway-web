"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendInquiryNotification } from "@/app/lib/email";

// 提交询盘（联系表单）
export async function createInquiry(data: {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  // 基本校验
  if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    const inquiry = await prisma.inquiry.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim(),
        company: data.company?.trim() || null,
        phone: data.phone?.trim() || null,
        subject: data.subject?.trim() || null,
        message: data.message.trim(),
      },
    });

    revalidatePath("/admin/inquiries");

    // 发送邮件通知（异步，不影响主流程）
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

// 删除询盘
export async function deleteInquiry(id: string) {
  await prisma.inquiry.delete({ where: { id } });
  revalidatePath("/admin/inquiries");
}
