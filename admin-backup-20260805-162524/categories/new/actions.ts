"use server"


import { prisma } from "@/app/lib/prisma"



export async function createCategory(
  formData:FormData
){


  const name = formData.get("name") as string

  const slug = formData.get("slug") as string



  if(!name || !slug){

    return {

      success:false,

      message:"Name and slug are required"

    }

  }



  const exists = await prisma.category.findUnique({

    where:{
      slug
    }

  })



  if(exists){

    return {

      success:false,

      message:"Category slug already exists"

    }

  }




  try{


    await prisma.category.create({

      data:{

        name,

        slug

      }

    })



    return {

      success:true,

      message:"Category created"

    }



  }catch(error){


    return {

      success:false,

      message:"Create category failed"

    }


  }



}