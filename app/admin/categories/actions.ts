"use server"


import { prisma } from "@/app/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"



export async function deleteCategory(
  formData: FormData
){

  const id = formData.get("id") as string


  if(!id){

    throw new Error("Category id missing")

  }


  const category = await prisma.category.findUnique({

    where:{
      id
    },

    include:{
      products:true
    }

  })


  if(!category){

    throw new Error("Category not found")

  }



  if(category.products.length > 0){

    throw new Error(
      "Cannot delete category with products"
    )

  }



  await prisma.category.delete({

    where:{
      id
    }

  })

  revalidatePath("/", "layout")

  redirect("/admin/categories")

}