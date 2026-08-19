import Image from "next/image";
import Link from "next/link";
import ProductCategories from "@/app/components/ProductCategories";
import GalleryShowcase from "@/app/components/GalleryShowcase";
import HeroCarousel from "@/app/components/HeroCarousel";
import SocialIcons from "@/app/components/SocialIcons";
import { prisma } from "@/app/lib/prisma";


export default async function Home(){

const banners = await prisma.banner.findMany({
  where: { isActive: true },
  orderBy: { sortOrder: "asc" },
});

const slides = banners.map((b) => ({
  image: b.image,
  title: b.title || "",
  desc: b.subtitle || "",
  buttonText: b.buttonText || undefined,
  buttonLink: b.buttonLink || undefined,
}));

const brandLogos = Array.from({ length: 20 }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  return `/brands/brand-${num}.jpg`;
});


return(


<main>



{/* HERO */}


<HeroCarousel slides={slides} />





{/* PRODUCT CATEGORIES */}


<ProductCategories />


{/* GALLERY SHOWCASE */}

<GalleryShowcase />


{/* BRANDS - 鍚堜綔鍝佺墝 */}

<section className="brands">
  <div className="brandsHeader">
    <h2 className="brandsTitle">Trusted by Leading Brands</h2>
    <p className="brandsDesc">
      We are proud to partner with industry-leading companies worldwide
    </p>
  </div>

  <div className="brandsGrid">
    {brandLogos.map((logo, i) => (
      <div key={i} className="brandItem">
        <Image
          src={logo}
          alt={`Brand ${i + 1}`}
          width={250}
          height={192}
          className="brandLogo"
          loading="lazy"
        />
      </div>
    ))}
  </div>
</section>


{/* CONTACT */}



<section className="contact">


<h2>

Need Professional Lighting Solutions?

</h2>



<p>

Contact our team for product information and quotation.

</p>



<button>

Request Quote

</button>


</section>








{/* FOOTER */}



<footer className="footer">


<div className="footerContent">


<div className="footerBrand">


<h2>

Fotobestway

</h2>


<p>

Professional photography lighting equipment manufacturer.

</p>


<p>

OEM / ODM solutions for global customers.

</p>

      <div style={{ marginTop: "20px" }}>
        <SocialIcons size={22} vibrant={true} />
      </div>



</div>






<div className="footerLinks">


<h3>

Quick Links

</h3>



<Link href="/">

Home

</Link>



<Link href="/products">

Products

</Link>



<Link href="/about">

About

</Link>



<Link href="/contact">

Contact

</Link>



</div>








<div className="footerContact">


<h3>

Contact

</h3>


<p>

Email:
maggie@fotobestway.com.cn

</p>


<p>

Tel:
+86 574 6270 7558

</p>


<p>

WeChat / WhatsApp:
+86 135 6782 6336

</p>



</div>


</div>








<div className="copyright">


漏 2026 Fotobestway. All Rights Reserved.


</div>



</footer>



</main>


);


}
