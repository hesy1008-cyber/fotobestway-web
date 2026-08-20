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



  const category =
  String(formData.get("category") || "");

  const categoryRecord = category
    ? await prisma.category.findUnique({
        where: { slug: category },
        select: { id: true },
      })
    : null;




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





  // 优先读取多型号格式 specsJson
  const specsJsonStr = String(formData.get("specsJson") || "");
  let specs: any;
  if (specsJsonStr) {
    try {
      const parsed = JSON.parse(specsJsonStr);
      // 过滤掉空型号和空规格
      specs = parsed
        .filter((m: any) => m.specs && m.specs.length > 0)
        .map((m: any) => ({
          model: m.model || "",
          specs: m.specs.filter((s: any) => s.label?.trim() || s.value?.trim()),
        }));
    } catch (e) {
      specs = [];
    }
  } else {
    // 旧格式兼容
    specs = String(formData.get("specs") || "")
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((line) => {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          return {
            label: line.substring(0, colonIndex).trim(),
            value: line.substring(colonIndex + 1).trim(),
          };
        }
        return { label: line, value: "" };
      });
  }





await prisma.product.create({

data:{

title,

slug,

image,

overview,

categoryId: categoryRecord?.id,

features,

applications,

specs

}

});




redirect("/admin/products");


}












// 删除产品

export async function deleteProduct(

formData:FormData

){



const id =

String(formData.get("id"));




await prisma.product.delete({

where:{

id

}

});



redirect("/admin/products");


}











// 更新产品

export async function updateProduct(

id:string,

formData:FormData

){



const title =

String(formData.get("title") || "");




const slug =

String(formData.get("slug") ||"");




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






  // 优先读取多型号格式 specsJson
  const specsJsonStr = String(formData.get("specsJson") || "");
  let specs: any;
  if (specsJsonStr) {
    try {
      const parsed = JSON.parse(specsJsonStr);
      // 过滤掉空型号和空规格
      specs = parsed
        .filter((m: any) => m.specs && m.specs.length > 0)
        .map((m: any) => ({
          model: m.model || "",
          specs: m.specs.filter((s: any) => s.label?.trim() || s.value?.trim()),
        }));
    } catch (e) {
      specs = [];
    }
  } else {
    // 旧格式兼容
    specs = String(formData.get("specs") || "")
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((line) => {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          return {
            label: line.substring(0, colonIndex).trim(),
            value: line.substring(colonIndex + 1).trim(),
          };
        }
        return { label: line, value: "" };
      });
  }








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
