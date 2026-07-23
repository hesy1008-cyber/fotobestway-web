type Props = {
  features: unknown;
};


export default function ProductFeatures({
  features,
}: Props) {


  const items = Array.isArray(features)
    ? features.filter(
        (item): item is string =>
          typeof item === "string"
      )
    : [];



  return (

    <section className="feature-section">


      <h2>
        Features
      </h2>


      <div className="feature-grid">


        {
          items.map((item,index)=>(


            <div
              className="feature-card"
              key={index}
            >

              <div className="feature-number">
                0{index+1}
              </div>


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