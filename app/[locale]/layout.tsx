import { getMessages, type Messages } from "@/app/i18n/messages";
import { getDirection, type Locale } from "@/app/i18n/config";
import { TranslationProvider } from "@/app/i18n/TranslationContext";
import { prisma } from "@/app/lib/prisma";
import ClientLayout from "@/app/components/ClientLayout";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }, { locale: "ar" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "Fotobestway",
    description: "Professional Photography Equipment",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = getMessages(locale);
  const direction = getDirection(locale);

  const categories = await prisma.category.findMany({
    include: {
      subCategories: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <TranslationProvider messages={messages as Messages}>
      <ClientLayout categories={categories} locale={locale} direction={direction}>
        {children}
      </ClientLayout>
    </TranslationProvider>
  );
}
