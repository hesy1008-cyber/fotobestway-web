import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import ProductCard from "@/app/components/ProductCard";
import "../styles/products.css";



const categories = [

  {
    number:"01",
    name:"Studio Lighting",
    slug:"lighting"
  },

  {
    number:"02",
    name:"Light Stand",
    slug:"stand"
  },

  {
    number:"03",
    name:"Softbox",
    slug:"softbox"
  },

  {
    number:"04",
    name:"Butterfly Frame",
    slug:"frame"
  },

  {
    number:"05",
    name:"Grip & Clamp",
    slug:"grip"
  },

  {
    number:"06",
    name:"Background",
    slug:"background"
  },

  {
    number:"07",
    name:"Camping Cart",
    slug:"cart"
  }

];





const categoryOrder:Record<string,number> = {

  lighting:1,

  stand:2,

  softbox:3,

  frame:4,

  grip:5,

  background:6,

  cart:7

};






export default async function ProductsPage(){


const products = await prisma.product.findMany();





products.sort((a,b)=>{


const categoryA = categoryOrder[a.category] || 99;

const categoryB = categoryOrder[b.category] || 99;



if(categoryA !== categoryB){

return categoryA-categoryB;

}



return a.title.localeCompare(b.title);



});






return (


<main className="productsPage">







<section className="productsHero">



<div className="heroSmallTitle">

PRODUCT COLLECTION

</div>




<h1>

Professional Studio Lighting Equipment

</h1>




<p>

Explore our professional photography lighting solutions designed for studios,
commercial production and creative professionals.

</p>




<div className="productCount">

{products.length} Products Available

</div>



</section>









<section className="categorySection">



<div className="sectionTitle">


<h2>

Categories

</h2>


</div>





<div className="categoryMenu">



{

categories.map((cat)=>(



<Link


key={cat.slug}


href={`/category/${cat.slug}`}


className="productCategoryItem"



>



<span className="categoryNumber">

{cat.number}

</span>




<span className="categoryName">

{cat.name}

</span>



</Link>



))


}




</div>




</section>









<section className="productListSection">



<div className="sectionHeader">


<h2>

All Products

</h2>


<p>

Professional equipment for studio lighting applications.

</p>


</div>








<section className="productsGrid">



{

products.length === 0 ? (


<p>
No products found.
</p>



) : (



products.map((product)=>(


<ProductCard


key={product.id}


product={product}


/>



))


)


}



</section>





</section>







</main>


);


}