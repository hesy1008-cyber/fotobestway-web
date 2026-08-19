import { getAboutPage } from "@/app/actions/about";
import FactoryCarousel from "@/app/components/FactoryCarousel";
import CertificateLightbox from "@/app/components/CertificateLightbox";
import { translateText } from "@/app/lib/translate";
import { getMessages } from "@/app/i18n/messages";
import "@/app/styles/about.css";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getMessages(locale as any);
  const about = await getAboutPage();

  // 中文时翻译数据库字段
  let translatedAbout = about;
  if (locale === "zh") {
    const fieldsToTranslate = [
      "heroTitle",
      "heroSubtitle",
      "heroButtonText",
      "factoryTitle",
      "introTitle",
      "introContent",
    ];
    const tasks = fieldsToTranslate.map(async (field) => {
      if (about[field as keyof typeof about]) {
        return {
          field,
          value: await translateText(about[field as keyof typeof about] as string),
        };
      }
      return null;
    });
    const results = await Promise.all(tasks);
    translatedAbout = { ...about };
    for (const result of results) {
      if (result) {
        (translatedAbout as any)[result.field] = result.value;
      }
    }
  }

  // 工厂轮播图
  const factoryImages = Array.isArray(translatedAbout.factoryImages)
    ? (translatedAbout.factoryImages as string[])
    : ["/studio.jpg", "/studio2.jpg", "/studio3.jpg"];

  // 证书列表（图片形式）
  const certificates = Array.isArray(translatedAbout.certificates)
    ? (translatedAbout.certificates as string[])
    : [];

  // 标签文字
  const labels = locale === "zh" ? {
    aboutUs: "关于我们",
    ourFactory: "我们的工厂",
    certifications: "认证资质",
    qualityAssurance: "品质保证",
    companyVideo: "公司介绍视频",
    whoWeAre: "我们是谁",
    certPlaceholder: "证书图片待添加...",
    introPlaceholder: "公司简介内容待添加...",
  } : {
    aboutUs: "ABOUT US",
    ourFactory: "OUR FACTORY",
    certifications: "CERTIFICATIONS",
    qualityAssurance: "Quality Assurance",
    companyVideo: "Company Introduction Video",
    whoWeAre: "WHO WE ARE",
    certPlaceholder: "Certificate images pending...",
    introPlaceholder: "Company intro content pending...",
  };

  return (
    <main className="aboutPage">
      {/* ====== 顶部 Hero Banner ====== */}
      <section
        className="aboutHero"
        style={{ backgroundImage: `url("${translatedAbout.heroImage}")` }}
      >
        <div className="aboutHeroOverlay" />
        <div className="aboutHeroContent">
          <p className="aboutHeroLabel">{labels.aboutUs}</p>
          <h1>{translatedAbout.heroTitle}</h1>
          <p className="aboutHeroDesc">{translatedAbout.heroSubtitle}</p>
          <a href="#intro" className="aboutHeroBtn">
            {translatedAbout.heroButtonText} <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      {/* ====== 内容网格区域 ====== */}
      <section className="aboutContent">
        <div className="aboutGrid">
          {/* 左上：工厂图片轮播 */}
          <div className="aboutGridItem aboutFactory">
            <div className="aboutSectionTitle">
              <span className="aboutSectionLabel">{labels.ourFactory}</span>
              <h2>{translatedAbout.factoryTitle}</h2>
            </div>
            <FactoryCarousel images={factoryImages} interval={4000} />
          </div>

          {/* 中间：证书展示（竖长） */}
          <div className="aboutGridItem aboutCertificates">
            <div className="aboutSectionTitle">
              <span className="aboutSectionLabel">{labels.certifications}</span>
              <h2>{labels.qualityAssurance}</h2>
            </div>
            {certificates.length > 0 ? (
              <CertificateLightbox images={certificates} />
            ) : (
              <div style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>
                {labels.certPlaceholder}
              </div>
            )}
          </div>

          {/* 右侧：公司视频板块 */}
          <div className="aboutVideo">
            <div className="videoPlaceholder">
              {translatedAbout.videoUrl ? (
                <video
                  className="videoPlayer"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  poster={translatedAbout.videoPoster || undefined}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    borderRadius: "8px",
                  }}
                >
                  <source src={translatedAbout.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <>
                  {translatedAbout.videoPoster && (
                    <img
                      src={translatedAbout.videoPoster}
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
                  <p className="videoPlaceholderText">{labels.companyVideo}</p>
                </>
              )}
            </div>
          </div>

          {/* 左下：公司简介 */}
          <div className="aboutGridItem aboutIntro" id="intro">
            <div className="aboutSectionTitle">
              <span className="aboutSectionLabel">{labels.whoWeAre}</span>
              <h2>{translatedAbout.introTitle}</h2>
            </div>
            <div className="aboutIntroText">
              {translatedAbout.introContent ? (
                translatedAbout.introContent.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <p style={{ color: "#999", fontStyle: "italic" }}>
                  {labels.introPlaceholder}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
