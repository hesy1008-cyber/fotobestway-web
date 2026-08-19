import { getAboutPage } from "@/app/actions/about";
import FactoryCarousel from "@/app/components/FactoryCarousel";
import CertificateLightbox from "@/app/components/CertificateLightbox";
import "@/app/styles/about.css";

export default async function AboutPage() {
  const about = await getAboutPage();

  // 工厂轮播图
  const factoryImages = Array.isArray(about.factoryImages)
    ? (about.factoryImages as string[])
    : ["/studio.jpg", "/studio2.jpg", "/studio3.jpg"];

  // 证书列表（图片形式）
  const certificates = Array.isArray(about.certificates)
    ? (about.certificates as string[])
    : [];

  return (
    <main className="aboutPage">
      {/* ====== 顶部 Hero Banner ====== */}
      <section
        className="aboutHero"
        style={{ backgroundImage: `url("${about.heroImage}")` }}
      >
        <div className="aboutHeroOverlay" />
        <div className="aboutHeroContent">
          <p className="aboutHeroLabel">ABOUT US</p>
          <h1>{about.heroTitle}</h1>
          <p className="aboutHeroDesc">{about.heroSubtitle}</p>
          <a href="#intro" className="aboutHeroBtn">
            {about.heroButtonText} <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      {/* ====== 内容网格区域 ====== */}
      <section className="aboutContent">
        <div className="aboutGrid">
          {/* 左上：工厂图片轮播 */}
          <div className="aboutGridItem aboutFactory">
            <div className="aboutSectionTitle">
              <span className="aboutSectionLabel">OUR FACTORY</span>
              <h2>{about.factoryTitle}</h2>
            </div>
            <FactoryCarousel images={factoryImages} interval={4000} />
          </div>

          {/* 中间：证书展示（竖长） */}
          <div className="aboutGridItem aboutCertificates">
            <div className="aboutSectionTitle">
              <span className="aboutSectionLabel">CERTIFICATIONS</span>
              <h2>Quality Assurance</h2>
            </div>
            {certificates.length > 0 ? (
              <CertificateLightbox images={certificates} />
            ) : (
              <div style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>
                证书图片待添加...
              </div>
            )}
          </div>

          {/* 右侧：公司视频板块 */}
          <div className="aboutVideo">
            <div className="videoPlaceholder">
              {about.videoUrl ? (
                <video
                  className="videoPlayer"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  poster={about.videoPoster || undefined}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    borderRadius: "8px",
                  }}
                >
                  <source src={about.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <>
                  {about.videoPoster && (
                    <img
                      src={about.videoPoster}
                      alt="Video poster"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        position: "absolute",
                        top: 0,
                        left: 0,
                      }}
                    />
                  )}
                  <div className="videoPlayBtn">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="videoPlaceholderText">Company Introduction Video</p>
                </>
              )}
            </div>
          </div>

          {/* 左下：公司简介 */}
          <div className="aboutGridItem aboutIntro" id="intro">
            <div className="aboutSectionTitle">
              <span className="aboutSectionLabel">WHO WE ARE</span>
              <h2>{about.introTitle}</h2>
            </div>
            <div className="aboutIntroText">
              {about.introContent ? (
                about.introContent.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <p style={{ color: "#999", fontStyle: "italic" }}>
                  公司简介内容待添加...
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
