"use server"


import { prisma } from "@/app/lib/prisma"
import { redirect } from "next/navigation"


export async function updateCategory(
formData:FormData
){


const id=formData.get("id") as string

const name=formData.get("name") as string

const slug=formData.get("slug") as string



const exists = await prisma.category.findFirst({

where:{

slug,

NOT:{
id
}

}

})



if(exists){

return {

success:false,

message:"Category slug already exists"

}

}



await prisma.category.update({

where:{
id
},

data:{

name,

slug

}

})


redirect("/admin/categories")


}