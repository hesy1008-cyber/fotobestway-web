"use client";


import { useState } from "react";
import { updateProduct } from "@/app/actions/product";



export default function EditProductForm({

product

}:{

product:{
    id:number;
    title:string;
    slug:string;
}

}){


const [title,setTitle]=useState(product.title);



async function handleSubmit(
e:React.FormEvent
){

e.preventDefault();


await updateProduct(
    product.id,
    title
);


}



return (

<form
onSubmit={handleSubmit}
className="editForm"
>


<h2>
Edit Product
</h2>



<input

value={title}

onChange={(e)=>
setTitle(e.target.value)
}

/>



<button type="submit">

Save Changes

</button>



</form>

);


}