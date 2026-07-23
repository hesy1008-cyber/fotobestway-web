"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";


type Product = {
  id:number;
  title:string;
  slug:string;
  image:string | null;
  overview:string | null;
  category:string | null;
  features:string[] | null;
  applications:string[] | null;
  specs:any;
};


export default function EditProductForm({
 product
}:{
 product:Product;
}){


const router = useRouter();


const [title,setTitle]=useState(product.title);

const [loading,setLoading]=useState(false);



async function handleSubmit(
e:React.FormEvent
){

e.preventDefault();


setLoading(true);



const res = await fetch("/api/products/update",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

id:product.id,

title

})

});



if(res.ok){

router.push(`/products/${product.slug}`);

router.refresh();

}


setLoading(false);


}



return (

<form

onSubmit={handleSubmit}

style={{
display:"flex",
flexDirection:"column",
gap:"20px",
maxWidth:"500px"
}}

>


<label>

Product Title

</label>



<input

value={title}

onChange={(e)=>setTitle(e.target.value)}

style={{
padding:"10px"
}}

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
"Save Changes"
}


</button>



</form>

);


}