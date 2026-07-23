import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import EditProductForm from "./EditProductForm";
import "../../../../styles/admin.css";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{
    id:string;
  }>;
}) {


const {id}=await params;


const product = await prisma.product.findUnique({

where:{
id:Number(id)
}

});


if(!product){

return notFound();

}



return (

<main className="adminPage">

<h1>
Edit Product
</h1>


<EditProductForm
product={{
  ...product,

  features:
    Array.isArray(product.features)
      ? product.features as string[]
      : [],

  applications:
    Array.isArray(product.applications)
      ? product.applications as string[]
      : [],

  specs:
    typeof product.specs === "object" &&
    product.specs !== null &&
    !Array.isArray(product.specs)
      ? product.specs as Record<string,string>
      : {}

}}
/>


</main>


);


}