import { prisma } from "@/app/lib/prisma";
import EditPdfForm from "./EditPdfForm";
import { notFound } from "next/navigation";

export default async function EditPdfPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pdf = await prisma.pdfFile.findUnique({
    where: { id },
  });

  if (!pdf) {
    notFound();
  }

  const categories = await prisma.pdfCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <EditPdfForm
      pdf={{
        id: pdf.id,
        title: pdf.title,
        categoryId: pdf.categoryId,
        fileName: pdf.fileName,
        fileSize: pdf.fileSize,
        fileUrl: pdf.fileUrl,
        sortOrder: pdf.sortOrder,
        isActive: pdf.isActive,
      }}
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        subtitle: c.subtitle || "",
      }))}
    />
  );
}
