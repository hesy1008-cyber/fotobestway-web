import Image from "next/image";
import Link from "next/link";
import ProductCategories from "@/app/components/ProductCategories";
import GalleryShowcase from "@/app/components/GalleryShowcase";
import HeroCarousel from "@/app/components/HeroCarousel";
import SocialIcons from "@/app/components/SocialIcons";
import { prisma } from "@/app/lib/prisma";
import { getMessages } from "@/app/i18n/messages";
import { type Locale } from "@/app/i18n/config";


export default async function Home({ params }: { params: Promise<{ locale: string }> }){
  const { locale } = await params;
  const t = getMessages(locale as Locale);

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


<ProductCategories locale={locale} />


{/* GALLERY SHOWCASE */}

<GalleryShowcase />


{/* BRANDS - 鍚堜綔鍝佺墝 */}

<section className="brands">
  <div className="brandsHeader">
    <h2 className="brandsTitle">{t.home.brandsTitle}</h2>
    <p className="brandsDesc">
      {t.home.brandsDesc}
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

{t.home.contactTitle}

</h2>



<p>

{t.home.contactDesc}

</p>



<Link href={`/${locale}/contact`}>
  <button>

{t.home.requestQuote}

</button>
</Link>


</section>








{/* FOOTER */}



<footer className="footer">


<div className="footerContent">


<div className="footerBrand">


<h2>

Fotobestway

</h2>


<p>

{t.footer.brandDesc1}

</p>


<p>

{t.footer.brandDesc2}

</p>

      <div style={{ marginTop: "20px" }}>
        <SocialIcons size={22} vibrant={true} />
      </div>



</div>






<div className="footerLinks">


<h3>

{t.footer.quickLinks}

</h3>



<Link href={`/${locale}`}>

{t.footer.home}

</Link>



<Link href={`/${locale}/products`}>

{t.footer.products}

</Link>



<Link href={`/${locale}/about`}>

{t.footer.about}

</Link>



<Link href={`/${locale}/contact`}>

{t.footer.contact}

</Link>



</div>








<div className="footerContact">


<h3>

{t.footer.contactTitle}

</h3>


<p>

{t.footer.emailLabel}
maggie@fotobestway.com.cn

</p>


<p>

{t.footer.telLabel}
+86 574 6270 7558

</p>


<p>

{t.footer.wechatWhatsappLabel}
+86 135 6782 6336

</p>



</div>


</div>








<div className="copyright">


{t.footer.copyright}


</div>



</footer>



</main>


);


}
