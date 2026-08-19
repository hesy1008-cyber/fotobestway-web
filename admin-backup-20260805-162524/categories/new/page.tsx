"use client"

import { useState } from "react"
import { createCategory } from "./actions"
import { useRouter } from "next/navigation"


export default function NewCategoryPage(){

  const router = useRouter()

  const [loading,setLoading] = useState(false)

  const [message,setMessage] = useState("")


  async function handleSubmit(formData:FormData){

    setLoading(true)

    const result = await createCategory(formData)


    if(result.success){

      router.push("/admin/categories")

    }else{

      setMessage(result.message)

      setLoading(false)

    }

  }



  return (

    <div
      style={{
        padding:"50px"
      }}
    >


      <h1>
        Add Category
      </h1>



      <form

        action={handleSubmit}

        style={{
          marginTop:"30px",
          display:"flex",
          flexDirection:"column",
          gap:"15px",
          width:"300px"
        }}

      >



        <input

          name="name"

          placeholder="Category Name"

          required

        />



        <input

          name="slug"

          placeholder="Slug"

          required

        />



        <button

          disabled={loading}

          style={{

            background:"#111",

            color:"#fff",

            padding:"10px",

            cursor:"pointer"

          }}

        >

          {
            loading
            ?
            "Creating..."
            :
            "Create"
          }


        </button>



      </form>



      {
        message &&

        <p
          style={{
            color:"red",
            marginTop:"20px"
          }}
        >

          {message}

        </p>

      }


    </div>


  )

}