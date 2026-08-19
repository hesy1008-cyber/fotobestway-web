import Image from "next/image";
import Link from "next/link";


export default function RelatedProducts({

products

}:{

products:any[]

}){


return(


<section className="relatedSection">


<h2>
Related Products
</h2>




<div className="relatedGrid">


{

products.map((product)=>(


<div

className="relatedCard"

key={product.id}

>


<div className="relatedImage">


<Image

src={product.image}

alt={product.title}

width={500}

height={500}

className="relatedImageImg"

loading="lazy"

/>


</div>






<h3>

{product.title}

</h3>





<p>

{product.overview}

</p>






<Link

href={`/products/${product.slug}`}

>

View Product

</Link>



</div>


))


}


</div>



</section>



)


}
