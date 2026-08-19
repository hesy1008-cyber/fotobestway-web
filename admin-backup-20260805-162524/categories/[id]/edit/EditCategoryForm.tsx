"use client"


import { updateCategory } from "./actions"




export default function EditCategoryForm({

category

}:{

category:{
id:string
name:string
slug:string
}

}){





return (

<form

action={async(formData)=>{

await updateCategory(formData)

}}

style={{
display:"flex",
flexDirection:"column",
gap:"15px",
width:"300px",
marginTop:"30px"
}}

>


<input
type="hidden"
name="id"
value={category.id}
/>



<input

name="name"

defaultValue={category.name}

/>



<input

name="slug"

defaultValue={category.slug}

/>



<button>

Save

</button>




</form>

)

}