import NewsForm from "./NewsForm";

export const metadata = {
  title: "新增新闻 - 后台管理",
};

export default function NewNewsPage() {
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">新增新闻</h1>
          <p className="admin-page-subtitle">创建一篇新的新闻资讯</p>
        </div>
      </div>
      <div className="admin-form-container">
        <NewsForm />
      </div>
    </div>
  );
}
