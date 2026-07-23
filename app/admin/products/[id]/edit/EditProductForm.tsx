"use client";


import { updateProduct } from "@/app/actions/product";
import { useState } from "react";



export default function EditProductForm({
product
}:{
product:any
}){


const [loading,setLoading]=useState(false);



async function handleSubmit(
e:React.FormEvent<HTMLFormElement>
){

e.preventDefault();


setLoading(true);


const formData=new FormData(
e.currentTarget
);



await updateProduct(
product.id,
formData
);



setLoading(false);


window.location.href="/admin/products";


}



function jsonToText(
obj:any
){

if(
!obj ||
typeof obj!=="object"
){

return "";

}


return Object.entries(obj)

.map(
([key,value])=>
`${key}: ${value}`
)

.join("\n");


}



return (

<form

onSubmit={handleSubmit}

className="adminForm"

>



<label>
Title
</label>


<input

name="title"

defaultValue={product.title}

/>




<label>
Slug
</label>


<input

name="slug"

defaultValue={
product.slug
}

/>




<label>
Image
</label>


<input

name="image"

defaultValue={
product.image
}

/>




<label>
Overview
</label>


<textarea

name="overview"

defaultValue={
product.overview
}

/>




<label>
Category
</label>


<input

name="category"

defaultValue={
product.category
}

/>




<label>
Features
</label>


<textarea

name="features"

defaultValue={

Array.isArray(product.features)

?

product.features.join("\n")

:

""

}

/>




<label>
Applications
</label>


<textarea

name="applications"

defaultValue={

Array.isArray(product.applications)

?

product.applications.join("\n")

:

""

}

/>




<label>
Specifications
</label>


<textarea

name="specs"

defaultValue={

jsonToText(product.specs)

}

/>




<button disabled={loading}>


{
loading

?

"Saving..."

:

"Save Product"

}


</button>



</form>


);


}