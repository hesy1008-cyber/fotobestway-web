"use client";

import {useState} from "react";
import Image from "next/image";


export default function ProductSlider({

images,
title,

}:{

images:string[];
title:string;

}){


const [index,setIndex]=useState(0);


if(images.length===0){
return null;
}


function prev(){

setIndex(
(index-1+images.length)%images.length
)

}


function next(){

setIndex(
(index+1)%images.length
)

}



return (

<div className="product-slider">


<div className="slider-main">


<Image

src={images[index]}

alt={title}

fill

className="slider-image"

sizes="600px"

/>


<button
className="slider-prev"
onClick={prev}
>
‹
</button>


<button
className="slider-next"
onClick={next}
>
›
</button>


</div>



<div className="slider-dots">


{
images.map((_,i)=>(

<button

key={i}

className={
i===index
?
"active"
:
""
}

onClick={()=>setIndex(i)}

>

</button>

))

}


</div>


</div>

)

}