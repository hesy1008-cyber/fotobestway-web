import Link from "next/link";


export default function ProductCard({

product

}:{

product:any

}){


return (

<div className="productCard">



<div className="productCardImage">


<img

src={product.image || "/products/light.jpg"}

alt={product.title}

className="productCardImg"

/>


</div>





<div className="productCardBody">



<div className="productCategory">

{product.category}

</div>




<h3>

{product.title}

</h3>





<p>

{product.overview}

</p>





<div className="productCardFooter">


<Link

href={`/products/${product.slug}`}

className="productCardButton"

>

View Details

</Link>


</div>



</div>


</div>

);


}