import { prisma } from "@/app/lib/prisma"
import EditCategoryForm from "./EditCategoryForm"


export default async function EditCategoryPage({
  params,
}:{
  params: Promise<{
    id:string
  }>
}){


  const { id } = await params


  const category = await prisma.category.findUnique({

    where:{
      id
    }

  })


  if(!category){

    return (
      <div>
        Category not found
      </div>
    )

  }



  return (

    <div
      style={{
        padding:"50px",
        minHeight:"100vh",
        background:"#f7f7f7"
      }}
    >

      <h1>
        Edit Category
      </h1>


      <EditCategoryForm
        category={category}
      />


    </div>

  )

}