"use client";

import Image from "next/image";
import { useState } from "react";


interface Props {
images:string[];
}


export default function ProductGallery({
images
}:Props){


const [active,setActive]=useState(0);



return (

<div className="product-gallery">


{/* 主图 */}

<div className="gallery-main">

<Image

src={images[active]}

alt="product image"

width={1200}

height={800}

className="gallery-main-image"

/>

</div>




{/* 缩略图 */}

<div className="gallery-thumbs">


{
images.map((img,index)=>(


<button

key={img}

onClick={()=>setActive(index)}

className={
active===index
?
"active"
:
""
}

>


<Image

src={img}

alt="thumb"

width={140}

height={100}

className="thumb-image"

/>


</button>


))

}


</div>


</div>

)

}