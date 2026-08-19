import { getAboutPage } from "@/app/actions/about";
import Link from "next/link";
import AboutManager from "./AboutManager";

export default async function AdminAboutPage() {
  const about = await getAboutPage();

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">关于页</h1>
          <p className="admin-page-subtitle">
            管理 About 页面的内容、图片和布局
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/about" className="admin-btn admin-btn-secondary" target="_blank">
            查看页面 →
          </Link>
          <Link href="/admin" className="admin-btn admin-btn-secondary">
            ← 返回控制台
          </Link>
        </div>
      </div>

      <AboutManager
        initialData={{
          heroTitle: about.heroTitle,
          heroSubtitle: about.heroSubtitle,
          heroButtonText: about.heroButtonText,
          heroImage: about.heroImage,
          introTitle: about.introTitle,
          introContent: about.introContent,
          factoryTitle: about.factoryTitle,
          factoryImages: Array.isArray(about.factoryImages)
            ? (about.factoryImages as string[])
            : [],
          certificates: Array.isArray(about.certificates)
            ? (about.certificates as string[])
            : [],
          videoTitle: about.videoTitle,
          videoUrl: about.videoUrl || "",
          videoPoster: about.videoPoster || "",
        }}
      />
    </div>
  );
}
