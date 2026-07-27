import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import ProductCard from "@/app/components/ProductCard";
import "../styles/products.css";

const categories = [
  {
    number: "01",
    name: "Lighting",
    slug: "lighting",
  },
  {
    number: "02",
    name: "Background",
    slug: "background",
  },
  {
    number: "03",
    name: "Lighting Accessories",
    slug: "lighting-accessories",
  },
  {
    number: "04",
    name: "Light Stands",
    slug: "light-stands",
  },
  {
    number: "05",
    name: "Studio Accessories",
    slug: "accessories",
  },
  {
    number: "06",
    name: "Photography Carts",
    slug: "carts",
  },
];

const categoryOrder: Record<string, number> = {
  lighting: 1,
  background: 2,
  "lighting-accessories": 3,
  "light-stands": 4,
  accessories: 5,
  carts: 6,
};

const heroData: Record<
  string,
  {
    title: string;
    desc: string;
  }
> = {
  "": {
    title: "Professional Studio Equipment",
    desc: "Explore our complete range of photography equipment.",
  },

  lighting: {
    title: "Professional Studio Lighting Equipment",
    desc: "Professional photography lighting solutions designed for studios, commercial production and creative professionals.",
  },

  background: {
    title: "Photography Background Systems",
    desc: "Professional background solutions for studio photography.",
  },

  "lighting-accessories": {
    title: "Lighting Accessories",
    desc: "Essential accessories for professional lighting setups.",
  },

  "light-stands": {
    title: "Professional Light Stands",
    desc: "Heavy-duty studio light stands for professional applications.",
  },

  accessories: {
    title: "Studio Accessories",
    desc: "Complete range of professional studio accessories.",
  },

  carts: {
    title: "Photography Carts",
    desc: "Professional transport carts for studio equipment.",
  },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
  }>;
}) {
  const params = await searchParams;

  const currentCategory = params.category || "";

  const hero = heroData[currentCategory] ?? heroData[""];

  const products = await prisma.product.findMany({
    where: currentCategory
      ? {
          category: currentCategory,
        }
      : undefined,
  });

  products.sort((a, b) => {
    const categoryA = categoryOrder[a.category] || 99;
    const categoryB = categoryOrder[b.category] || 99;

    if (categoryA !== categoryB) {
      return categoryA - categoryB;
    }

    return a.title.localeCompare(b.title);
  });

  return (
    <main className="productsPage">

      {/* Hero */}

      <section className="productsHero">

        <div className="heroSmallTitle">
          PRODUCT COLLECTION
        </div>

        <h1>
          {hero.title}
        </h1>

        <p>
          {hero.desc}
        </p>

        <div className="productCount">
          {products.length} Products Available
        </div>

      </section>

      {/* Layout */}

      <section className="productLayout">

        {/* Sidebar */}

        <aside className="categorySidebar">

          <h2>
            Categories
          </h2>

          <Link
            href="/products"
            className={`categoryLink ${
              currentCategory === "" ? "active" : ""
            }`}
          >
            All Products
          </Link>

          {categories.map((cat) => (

            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className={`categoryLink ${
                currentCategory === cat.slug ? "active" : ""
              }`}
            >

              <span>
                {cat.number}
              </span>

              {cat.name}

            </Link>

          ))}

        </aside>

        {/* Products */}

        <section className="productListSection">

          <div className="sectionHeader">

            <h2>

              {
                currentCategory
                  ? categories.find(c => c.slug === currentCategory)?.name
                  : "All Products"
              }

            </h2>

            <p>

              {
                currentCategory
                  ? `Browse all ${categories.find(c => c.slug === currentCategory)?.name}.`
                  : "Professional equipment for studio lighting applications."
              }

            </p>

          </div>

          <section className="productsGrid">

            {
              products.length === 0 ? (

                <p>
                  No products found.
                </p>

              ) : (

                products.map((product) => (

                  <ProductCard
                    key={product.id}
                    product={product}
                  />

                ))

              )
            }

          </section>

        </section>

      </section>

    </main>
  );
}