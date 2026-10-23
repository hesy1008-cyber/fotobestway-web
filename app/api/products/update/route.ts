import { prisma } from "@/app/lib/prisma";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminRole } from "@/app/lib/auth";


export async function POST(req: NextRequest){
  const role = await requireAdminRole(req);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }


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
id:String(id)
},

data:{
title
}

});



return NextResponse.json(product);


}
