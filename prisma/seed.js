const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


const products = [

    {
title:"Dual-Layer Folding Photography Utility Wagon",

slug:"dual-layer-folding-wagon",

category:"equipment",

image:"/products/wagon/wagon-main.webp",


overview:
"The Dual-Layer Folding Photography Utility Wagon is a professional transport cart designed for photographers, studios and outdoor production teams. Featuring a two-layer storage system, compact folding design and heavy-duty wheels, it provides efficient equipment transportation for professional workflows.",


features:[

"Dual-layer segmented storage design",

"Fast folding and compact storage",

"Heavy-duty all-terrain wheels",

"Stable steel frame construction",

"Designed for photography equipment transport"

],


applications:[

"Photography studio",

"Film production",

"Outdoor shooting",

"Video production",

"Commercial production"

],


specs:[

"Model: DK 9050",

"Extended size: 95×52×105cm",

"Folded size: 95×52×26cm",

"Wheel size: 15cm",

"Gross weight: 14.5kg",

"Maximum loading capacity: 200kg",

"Material: Steel frame + 600D Oxford fabric"

],


// 新字段

coverImage:
"/products/wagon/wagon-main.webp",


description:
"The Dual-Layer Folding Photography Utility Wagon provides professional photographers with a durable and portable solution for transporting lighting equipment, camera accessories and production tools.",



detailImages:[

"/products/wagon/wagon-detail.webp",

"/products/wagon/wagon-expanded.webp",

"/products/wagon/wagon-folded.webp",

"/products/wagon/wagon-wheel-detail.webp",

"/products/wagon/wagon-wheel-side.webp",

"/products/wagon/wagon-usage.webp"

],


gallery:[

"/products/wagon/wagon-main.webp",

"/products/wagon/wagon-expanded.webp",

"/products/wagon/wagon-folded.webp",

"/products/wagon/wagon-storage.webp",

"/products/wagon/wagon-wheel-side.webp",

"/products/wagon/wagon-usage.webp"

]


},

{
title:"PL-400B LED Light",
slug:"pl-400b",
category:"lighting",
image:"/products/light.jpg",

overview:
"The PL-400B is a professional LED studio lighting fixture designed for photography studios, video production and commercial applications.",


features:[
"400W high output LED lighting",
"Professional studio lighting system",
"Stable color performance",
"Low noise cooling system"
],


applications:[
"Studio photography",
"Video production",
"Commercial shooting",
"Creative lighting setups"
],


specs:[
"Power:400W",
"Professional LED light source",
"High color accuracy",
"Studio mounting system"
]

},



{
title:"PL-600B LED Light",
slug:"pl-600b",
category:"lighting",
image:"/products/light.jpg",

overview:
"The PL-600B is a high-power LED lighting fixture for professional studios and commercial productions.",


features:[
"600W high output LED lighting",
"Excellent color consistency",
"Professional cooling system",
"Designed for long working hours"
],


applications:[
"Commercial photography",
"Video production",
"Broadcast studio",
"Creative lighting"
],


specs:[
"Power:600W",
"High CRI",
"Bowens mount",
"Professional LED source"
]

},



{
title:"Fresnel Light",
slug:"fresnel-light",
category:"lighting",
image:"/products/light.jpg",

overview:
"Professional Fresnel lighting equipment providing focused and controllable illumination.",


features:[
"Adjustable beam angle",
"Precision focus",
"Professional lighting",
"Strong output"
],


applications:[
"Film production",
"Studio shooting",
"Television",
"Commercial projects"
],


specs:[
"Adjustable focus",
"High brightness",
"Professional mount",
"Durable housing"
]

},



{
title:"Heavy Duty Light Stand",
slug:"heavy-duty-stand",
category:"stand",
image:"/products/light-stand.jpg",

overview:
"Professional heavy duty lighting stand designed for stable studio equipment support.",


features:[
"Heavy-duty metal construction",
"Adjustable height",
"Strong locking system",
"Professional support"
],


applications:[
"Studio lighting",
"Photography",
"Video production",
"Commercial use"
],


specs:[
"Heavy-duty steel",
"Maximum stability",
"Adjustable sections",
"Professional mounting"
]

},



{
title:"Air Cushion Stand",
slug:"air-stand",
category:"stand",
image:"/products/light-stand.jpg",

overview:
"Air cushion studio stand providing safe and smooth height adjustment.",


features:[
"Air cushion protection",
"Smooth adjustment",
"Stable support",
"Professional design"
],


applications:[
"Photography studio",
"Lighting support",
"Video production",
"Indoor shooting"
],


specs:[
"Air cushion system",
"Professional aluminum",
"Adjustable height",
"Strong load capacity"
]

},



{
title:"Octagon Softbox",
slug:"octagon-softbox",
category:"softbox",
image:"/products/softbox.jpg",

overview:
"Professional octagon softbox providing soft and balanced lighting.",


features:[
"Soft light diffusion",
"Quick assembly",
"Professional quality",
"Even illumination"
],


applications:[
"Portrait photography",
"Fashion shooting",
"Studio production",
"Commercial work"
],


specs:[
"Bowens mount",
"High quality fabric",
"Reflective interior",
"Professional diffusion"
]

},



{
title:"Rectangle Softbox",
slug:"rectangle-softbox",
category:"softbox",
image:"/products/softbox.jpg",

overview:
"Rectangle softbox designed for controlled studio lighting applications.",


features:[
"Large lighting surface",
"Easy setup",
"Professional light shaping",
"Uniform lighting"
],


applications:[
"Portrait photography",
"Video production",
"Commercial studio",
"Creative shooting"
],


specs:[
"Professional diffuser",
"Bowens compatible",
"Durable construction",
"Lightweight frame"
]

},



{
title:"Butterfly Frame Large",
slug:"butterfly-frame-large",
category:"frame",
image:"/products/butterfly-frame.jpg",

overview:
"Large butterfly frame system for professional light diffusion.",


features:[
"Large diffusion surface",
"Heavy-duty frame",
"Easy assembly",
"Professional quality"
],


applications:[
"Outdoor shooting",
"Commercial production",
"Film production",
"Studio lighting"
],


specs:[
"Aluminum frame",
"Large size",
"Quick installation",
"Professional accessories"
]

},



{
title:"Grip Clamp",
slug:"grip-clamp",
category:"grip",
image:"/products/grip-clamp.jpg",

overview:
"Professional grip clamp for mounting studio equipment securely.",


features:[
"Strong grip",
"Durable metal",
"Professional mounting",
"Easy adjustment"
],


applications:[
"Studio support",
"Lighting accessories",
"Photography",
"Video production"
],


specs:[
"Heavy-duty clamp",
"Metal construction",
"Universal mounting",
"Professional finish"
]

},



{
title:"Paper Background",
slug:"paper-background",
category:"background",
image:"/products/background.jpg",

overview:
"Professional paper background solution for photography studios.",


features:[
"Smooth surface",
"Professional quality",
"Multiple colors",
"Easy replacement"
],


applications:[
"Portrait photography",
"Product photography",
"Studio shooting",
"Commercial use"
],


specs:[
"High-quality paper",
"Large roll",
"Matte finish",
"Professional studio"
]

}

];





async function main(){


console.log("Cleaning database...");


await prisma.product.deleteMany();



console.log("Importing products...");



for(const product of products){


await prisma.product.create({

data:{


title:product.title,

slug:product.slug,

category:product.category,

image:product.image,

overview:product.overview,


features:product.features,

applications:product.applications,

specs:product.specs,


// 新字段

coverImage:product.coverImage || product.image,

description:product.description || product.overview,


detailImages:product.detailImages || [
product.image
],


gallery:product.gallery || [
product.image
]


}

});


console.log(
"Imported:",
product.title
);


}



console.log(
"Database seeded successfully"
);


}





main()

.then(async()=>{

await prisma.$disconnect();

})


.catch(async(error)=>{


console.error(error);


await prisma.$disconnect();


process.exit(1);


});