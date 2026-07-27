import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

import ProductFeatures from "@/app/components/ProductFeatures";
import ProductApplications from "@/app/components/ProductApplications";
import ProductSpecs from "@/app/components/ProductSpecs";
import RelatedProducts from "@/app/components/RelatedProducts";
import ProductSlider from "@/app/components/ProductSlider";
import ProductGallery from "@/app/components/ProductGallery";

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
slug,
},


select:{


id:true,

slug:true,

title:true,

image:true,

coverImage:true,

detailImages:true,

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




// =======================
// 主图
// =======================

const mainImage =
product.coverImage ||
product.image ||
"";





// =======================
// 详情图片
// =======================

const detailImages = Array.isArray(product.detailImages)

?

(product.detailImages as string[])
.map((img)=>img.trim())
.filter((img)=>img !== "")
.filter((img)=>img !== mainImage)

:

[];

// 顶部轮播图片
const sliderImages = [
mainImage,

...detailImages.filter(
(img)=>!img.includes("wagon-detail.webp")
)

];



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



{/* 产品顶部 */}

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


<ProductSlider

images={sliderImages}

title={product.title}

/>


</div>



</section>








{/* Features */}

<section className="product-section">


<ProductFeatures

features={product.features}

/>


</section>








{/* 产品详情图片 */}

{
detailImages.length > 0 && (

<section className="product-detail-images">


<ProductGallery

images={detailImages}

/>


</section>

)

}









{/* Applications */}

<section className="product-section">


<ProductApplications

applications={product.applications}

/>


</section>








{/* Specifications */}

<section className="product-section">


<ProductSpecs

specs={product.specs}

/>


</section>









{

relatedProducts.length >0 &&

(

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