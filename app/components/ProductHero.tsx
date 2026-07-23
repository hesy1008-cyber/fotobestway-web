export default function ProductHero({

product

}:{

product:any

}){



return(


<section className="detailHero">



<div className="detailInfo">



<h1>

{product.title}

</h1>



<p>

{product.overview}

</p>




<button className="quoteButton">

Request Quote

</button>



</div>






<div className="detailImage">



<img

src={product.image}

alt={product.title}

/>



</div>





</section>


)


}