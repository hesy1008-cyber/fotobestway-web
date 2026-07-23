export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      {children}
    </main>
  );
}