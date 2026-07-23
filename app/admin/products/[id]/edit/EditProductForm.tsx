"use client";


import { updateProduct } from "@/app/actions/product";
import { useState } from "react";


type Product = {

id:number;

title:string;

slug:string;

image?:string | null;

overview?:string | null;

category?:string | null;

features?:string[] | null;

applications?:string[] | null;

specs?:Record<string,string> | null;

};



export default function EditProductForm({

product

}:{

product:Product

}){


const [loading,setLoading]=useState(false);



async function handleSubmit(

e:React.FormEvent<HTMLFormElement>

){

e.preventDefault();


setLoading(true);



try{


const formData=new FormData(

e.currentTarget

);



await updateProduct(

product.id,

formData

);



window.location.href="/admin/products";


}

catch(error){

console.error(
"Update product failed:",
error
);


alert(
"保存失败，请检查服务器"
);


}

finally{


setLoading(false);


}


}




function jsonToText(

obj:Record<string,string>|null|undefined

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

defaultValue={
product.title
}

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
product.image ?? ""
}

/>



<label>
Overview
</label>


<textarea

name="overview"

defaultValue={
product.overview ?? ""
}

/>




<label>
Category
</label>


<input

name="category"

defaultValue={
product.category ?? ""
}

/>




<label>
Features
</label>


<textarea

name="features"

defaultValue={

product.features?.join("\n") ?? ""

}

/>




<label>
Applications
</label>


<textarea

name="applications"

defaultValue={

product.applications?.join("\n") ?? ""

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




<button

type="submit"

disabled={loading}

>


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