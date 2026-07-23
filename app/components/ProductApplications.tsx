type Props = {

 applications: unknown;

};



export default function ProductApplications({

 applications,

}:Props){


const items = Array.isArray(applications)

?
applications.filter(

(item):item is string=>

typeof item==="string"

)

:

[];




return (

<section className="application-section">


<h2>
Applications
</h2>



<div className="application-grid">


{

items.map((item,index)=>(


<div

className="application-card"

key={index}

>


<p>

{item}

</p>


</div>


))

}


</div>



</section>


);


}