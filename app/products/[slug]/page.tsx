import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import ProductFeatures from "@/app/components/ProductFeatures";
import ProductApplications from "@/app/components/ProductApplications";
import ProductSpecs from "@/app/components/ProductSpecs";
import RelatedProducts from "@/app/components/RelatedProducts";

import "@/app/styles/detail.css";
console.log("PRODUCT DETAIL ROUTE LOADED");

export default async function ProductDetailPage({

params,

}:{

params: Promise<{
slug:string;
}>;

}){


const { slug } = await params;



const product = await prisma.product.findUnique({

where:{
slug: slug,
},


select:{

id:true,

slug:true,

title:true,

image:true,

overview:true,

category:true,

features:true,

applications:true,

specs:true,

}

});



if(!product){

notFound();

}



const relatedProducts = await prisma.product.findMany({

where:{

category:product.category,

NOT:{
id:product.id
}

},

take:3,

orderBy:{

id:"desc"

}

});



return (

<main className="product-detail">


<section className="product-hero">


<div className="product-info">


<p className="product-category">

{product.category}

</p>



<h1>

{product.title}

</h1>



<p className="product-overview">

{product.overview}

</p>



<Link

href={`/contact?product=${product.slug}`}

className="inquiry-btn"

>

Contact Us

</Link>


</div>




<div className="product-image">


<Image

src={product.image}

alt={product.title}

width={800}

height={800}

className="detail-image"

/>


</div>



</section>





<section className="product-section">

<ProductFeatures

features={product.features}

/>

</section>





<section className="product-section">

<ProductApplications

applications={product.applications}

/>

</section>





<section className="product-section">

<ProductSpecs

specs={product.specs}

/>

</section>





{

relatedProducts.length > 0 && (

<RelatedProducts

products={relatedProducts}

/>

)

}





<section className="contact-box">


<h2>

Interested in this product?

</h2>



<p>

Contact Fotobestway for professional solutions.

</p>



<Link

href={`/contact?product=${product.slug}`}

>

Send Inquiry

</Link>


</section>



</main>

)

}