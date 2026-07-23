import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import EditProductForm from "../edit-product-form";


export default async function EditPage({

params

}:{

params:Promise<{
    slug:string;
}>

}){


const {slug}=await params;



const product = await prisma.product.findUnique({

where:{
    slug
}

});



if(!product){

notFound();

}



return (

<main className="adminPage">


<h1>
Edit Product
</h1>



<EditProductForm

product={{
    id:product.id,
    title:product.title,
    slug:product.slug
}}

/>



</main>

);


}