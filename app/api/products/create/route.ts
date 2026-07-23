import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(req:Request){


const formData = await req.formData();



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
.filter(Boolean);



const applications =
String(formData.get("applications") || "")
.split("\n")
.filter(Boolean);



const specsText =
String(formData.get("specs") || "");


const specs = Object.fromEntries(

specsText
.split("\n")
.filter(Boolean)
.map(item=>{

const [key,value] = item.split(":");


return [
key.trim(),
value?.trim() || ""
];

})

);




const product = await prisma.product.create({

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



return NextResponse.json(product);


}