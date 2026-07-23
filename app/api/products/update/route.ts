import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(req:Request){


const body = await req.json();


const {
id,
title
}=body;



if(!id || !title){

return NextResponse.json(

{
error:"Missing data"
},

{
status:400
}

);

}



const product = await prisma.product.update({

where:{
id:Number(id)
},

data:{
title
}

});



return NextResponse.json(product);


}