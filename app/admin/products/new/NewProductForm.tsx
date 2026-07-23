"use client";

import { useState } from "react";

console.log("NEW PRODUCT FORM LOADED");

export default function NewProductForm(){


const [loading,setLoading]=useState(false);



async function handleSubmit(
e:React.FormEvent<HTMLFormElement>
){

e.preventDefault();

setLoading(true);


const formData = new FormData(e.currentTarget);



await fetch("/api/products/create",{

method:"POST",

body:formData

});


window.location.href="/admin";


}



return (

<form
onSubmit={handleSubmit}
>


<div>
<label>
Title
</label>

<br/>

<input
name="title"
required
/>

</div>


<br/>


<div>
<label>
Slug
</label>

<br/>

<input
name="slug"
required
/>

</div>


<br/>


<div>
<label>
Image
</label>

<br/>

<input
name="image"
/>

</div>


<br/>


<div>

<label>
Overview
</label>

<br/>

<textarea
name="overview"
/>

</div>


<br/>


<div>

<label>
Features
(一行一个)
</label>

<br/>

<textarea
name="features"
/>

</div>


<br/>


<div>

<label>
Applications
(一行一个)
</label>

<br/>

<textarea
name="applications"
/>

</div>


<br/>


<div>

<label>
Specifications
(一行一个)
</label>

<br/>

<textarea
name="specs"
/>

</div>


<br/>


<button
disabled={loading}
>

{
loading
?
"Creating..."
:
"Create Product"
}

</button>


</form>

);


}