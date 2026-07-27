import Image from "next/image";
import Link from "next/link";


const categories = [

{
title:"Lighting",
image:"/categories/lighting.jpg",
slug:"lighting",
},


{
title:"Background",
image:"/categories/background.jpg",
slug:"background",
},


{
title:"Lighting Accessories",
image:"/categories/lighting-accessories.jpg",
slug:"lighting-accessories",
},


{
title:"Light Stands",
image:"/categories/light-stands.jpg",
slug:"light-stands",
},


{
title:"Studio Accessories",
image:"/categories/studio-accessories.jpg",
slug:"accessories",
},


{
title:"Photography Carts",
image:"/categories/photography-carts.jpg",
slug:"carts",
},


];





export default function ProductCategories(){


return (

<section className="categorySection">


<div className="categoryHeader">


<span>
PRODUCT RANGE
</span>


<h2>
Explore Our Products
</h2>


<p>
Professional photography equipment solutions
</p>


</div>




<div className="categoryGrid">


{
categories.map((item)=>(


<Link

key={item.slug}

href={`/products?category=${item.slug}`}

className="categoryItem"

>


<Image

src={item.image}

alt={item.title}

fill

sizes="50vw"

className="categoryImage"

/>



<div className="categoryMask"></div>



<div className="categoryText">


<h3>
{item.title}
</h3>


<p>
Learn More →
</p>


</div>




</Link>


))

}


</div>



</section>


)

}