"use server";

import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";


export async function createProduct(formData: FormData) {


const title = formData.get("title") as string;
const slug = formData.get("slug") as string;
const image = formData.get("image") as string;
const overview = formData.get("overview") as string;



await prisma.product.create({

data:{

title,

slug,

image,

overview,

features:{},

applications:{},

specs:{}

}

});



redirect("/admin/products");


}