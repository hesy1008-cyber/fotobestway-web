import nodemailer from "nodemailer";

// 创建邮件传输器
function createTransporter() {
  // 从环境变量读取配置
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  // 如果没有配置 SMTP，返回 null
  if (!host || !user || !pass) {
    console.warn("SMTP not configured, email notifications disabled");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 端口用 SSL，其他用 STARTTLS
    auth: {
      user,
      pass,
    },
  });
}

// 发送询盘通知邮件
export async function sendInquiryNotification(inquiry: {
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  subject?: string | null;
  message: string;
  createdAt?: Date;
}) {
  const transporter = createTransporter();
  if (!transporter) return false;

  const to = process.env.INQUIRY_NOTIFY_EMAIL || process.env.SMTP_USER;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!to) {
    console.warn("No notification email configured");
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Fotobestway Website" <${from}>`,
      to: to,
      subject: `[新询盘] ${inquiry.subject || "来自网站的新询盘"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e60012; border-bottom: 2px solid #e60012; padding-bottom: 10px;">
            📩 您收到了一条新询盘
          </h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; background: #f5f5f5; width: 120px; font-weight: bold;">姓名</td>
              <td style="padding: 10px; border: 1px solid #eee;">${inquiry.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">邮箱</td>
              <td style="padding: 10px; border: 1px solid #eee;">${inquiry.email}</td>
            </tr>
            ${inquiry.company ? `
            <tr>
              <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">公司</td>
              <td style="padding: 10px; border: 1px solid #eee;">${inquiry.company}</td>
            </tr>
            ` : ""}
            ${inquiry.phone ? `
            <tr>
              <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">电话</td>
              <td style="padding: 10px; border: 1px solid #eee;">${inquiry.phone}</td>
            </tr>
            ` : ""}
            ${inquiry.subject ? `
            <tr>
              <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">主题</td>
              <td style="padding: 10px; border: 1px solid #eee;">${inquiry.subject}</td>
            </tr>
            ` : ""}
            <tr>
              <td style="padding: 10px; background: #f5f5f5; font-weight: bold; vertical-align: top;">留言内容</td>
              <td style="padding: 10px; border: 1px solid #eee; white-space: pre-wrap;">${inquiry.message}</td>
            </tr>
          </table>
          
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
            此邮件由 Fotobestway 官网自动发送
          </p>
        </div>
      `,
    });

    console.log(`Inquiry notification email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Failed to send inquiry notification email:", error);
    return false;
  }
}
