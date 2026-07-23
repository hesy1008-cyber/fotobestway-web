"use server";

import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";


export async function updateProduct(
  id:number,
  formData:FormData
){

const title = String(formData.get("title") || "");

const slug = String(formData.get("slug") || "");

const image = String(formData.get("image") || "");

const overview = String(formData.get("overview") || "");

const category = String(formData.get("category") || "lighting");


const features =
String(formData.get("features") || "")
.split("\n")
.filter(Boolean);


const applications =
String(formData.get("applications") || "")
.split("\n")
.filter(Boolean);



const specsText = String(
  formData.get("specs") || ""
);


const specs = Object.fromEntries(

  specsText

  .split("\n")

  .filter(Boolean)

  .map(item => {


    const index = item.indexOf(":");


    if(index === -1){

      return [
        item.trim(),
        ""
      ];

    }


    const key =
      item
      .slice(0,index)
      .trim();


    const value =
      item
      .slice(index + 1)
      .trim();



    return [
      key,
      value
    ];


  })

);



await prisma.product.update({

where:{
id
},

data:{

title,
slug,
image,
overview,
category,
features,
applications,
specs

}

});


redirect("/admin/products");

}



export async function deleteProduct(
formData:FormData
){

const id =
Number(formData.get("id"));


await prisma.product.delete({

where:{
id
}

});


redirect("/admin/products");

}