import Image from "next/image";
import Link from "next/link";
import ProductCategories from "@/app/components/ProductCategories";
import HeroCarousel from "@/app/components/HeroCarousel";


export default function Home(){


return(


<main>



{/* HERO */}


<HeroCarousel />





{/* PRODUCT CATEGORIES */}


<ProductCategories />








{/* WHY US */}



<section className="why">



<h2>

Why Choose Fotobestway

</h2>



<div className="features">



<div>

<h3>

Professional Quality

</h3>


<p>

Reliable studio lighting equipment designed for photographers and creators.

</p>


</div>







<div>

<h3>

OEM / ODM Service

</h3>


<p>

Customized lighting solutions for global brands and distributors.

</p>


</div>







<div>

<h3>

Factory Support

</h3>


<p>

Stable production capacity and professional technical support.

</p>


</div>



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
sales@fotobestway.com

</p>


<p>

Phone:
+86 xxx xxxx xxxx

</p>


<p>

Factory support worldwide

</p>



</div>



</div>







<div className="copyright">


© 2026 Fotobestway. All Rights Reserved.


</div>




</footer>




</main>


);


}