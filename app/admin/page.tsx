import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import "../styles/admin.css";

export default async function AdminProductsPage(){


const products = await prisma.product.findMany({

orderBy:{
    id:"desc"
}

});



return (

<main className="adminPage">


<h1>
Products Management
</h1>



<Link href="/admin/products/new">

<button

style={{
marginBottom:"30px",
padding:"10px 20px",
cursor:"pointer"
}}

>

+ Add New Product

</button>

</Link>




<div>


{
products.map((product)=>(


<div

key={product.id}

style={{

border:"1px solid #ddd",

padding:"20px",

marginBottom:"20px",

display:"flex",

gap:"20px",

alignItems:"center"

}}

>



{
product.image && (

<img

src={product.image}

alt={product.title}

style={{

width:"120px",

height:"90px",

objectFit:"contain",

border:"1px solid #eee"

}}

/>

)

}




<div>


<h2>

{product.title}

</h2>



<p>

Slug:
{product.slug}

</p>



<div

style={{

display:"flex",

gap:"10px"

}}

>


<Link

href={`/admin/products/${product.id}`}

>

<button>

Edit

</button>


</Link>



<Link

href={`/products/${product.slug}`}

>

<button>

View

</button>


</Link>


</div>


</div>




</div>


))

}



</div>


</main>


);


}