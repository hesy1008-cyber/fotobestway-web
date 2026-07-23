type Props = {

  specs: unknown;

};



export default function ProductSpecs({

  specs,

}:Props){



let entries:[string,string][] = [];



if(

typeof specs==="object"

&& specs!==null

&& !Array.isArray(specs)

){

  entries = Object.entries(specs)

  .map(([key,value])=>[

    key,

    String(value)

  ]);

}



if(Array.isArray(specs)){


  entries = specs.map(

    (item,index)=>[

      `Specification ${index+1}`,

      String(item)

    ]

  );


}




return (


<section className="spec-section">


<h2>

Specifications

</h2>



<div className="spec-table">


{

entries.map(([key,value])=>(


<div

className="spec-row"

key={key}

>


<div className="spec-key">

{key}

</div>


<div className="spec-value">

{value}

</div>


</div>


))


}



</div>


</section>


);


}