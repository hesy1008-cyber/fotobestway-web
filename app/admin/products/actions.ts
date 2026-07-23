"use server";


import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";




// 创建产品

export async function createProduct(
  formData: FormData
){


  const title =
  String(formData.get("title") || "");


  const slug =
  String(formData.get("slug") || "");


  const image =
  String(formData.get("image") || "");


  const overview =
  String(formData.get("overview") || "");



  await prisma.product.create({

    data:{


      title,

      slug,

      image,

      overview,


      features:[],


      applications:[],


      specs:[]


    }


  });



  redirect("/admin/products");


}









// 删除产品

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











// 更新产品

export async function updateProduct(

id:number,

formData:FormData

){



const title =
String(formData.get("title") || "");



const slug =
String(formData.get("slug") || "");



const image =
String(formData.get("image") || "");



const overview =
String(formData.get("overview") || "");





const features =

String(formData.get("features") || "")

.split("\n")

.map(item=>item.trim())

.filter(item=>item.length>0);






const applications =

String(formData.get("applications") || "")

.split("\n")

.map(item=>item.trim())

.filter(item=>item.length>0);






const specs =

String(formData.get("specs") || "")

.split("\n")

.map(item=>item.trim())

.filter(item=>item.length>0);








await prisma.product.update({


where:{

id

},



data:{


title,


slug,


image,


overview,


features,


applications,


specs


}



});






redirect("/admin/products");



}