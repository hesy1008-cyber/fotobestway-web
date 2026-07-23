import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";


const categoryTitles: Record<string, string> = {

  lighting: "Studio Lighting",

  stand: "Light Stand",

  softbox: "Softbox",

  frame: "Butterfly Frame",

  grip: "Grip & Clamp",

  background: "Background",

};



/**
 * 前台 URL slug
 * 
 * URL                  Database category
 *
 * /category/light      lighting
 * /category/light-stand stand
 * /category/butterfly-frame frame
 * /category/grip-clamp grip
 *
 */
const categoryMap: Record<string, string> = {


  "light": "lighting",

  "lighting": "lighting",


  "light-stand": "stand",

  "stand": "stand",


  "butterfly-frame": "frame",

  "frame": "frame",


  "grip-clamp": "grip",

  "grip": "grip",


  "softbox": "softbox",


  "background": "background",


};



export default async function CategoryPage({

  params,

}: {

  params: Promise<{ slug: string }>;

}) {



  const { slug } = await params;



  /**
   * 前台 slug 转数据库 category
   */
  const realCategory = categoryMap[slug] || slug;



  const products = await prisma.product.findMany({

    where: {

      category: realCategory,

    },

    orderBy: {

      createdAt: "asc",

    },

  });





  const title = categoryTitles[realCategory] || slug;





  return (


    <main className="products">



      <h1>

        {title}

      </h1>





      {
        products.length === 0 ? (


          <h2>

            No Products Available

          </h2>


        ) : (



          <div className="grid">



            {
              products.map((product) => (



                <div

                  className="card"

                  key={product.id}

                >




                  <div className="productImage">


                    <Image

                      src={product.image}

                      fill

                      alt={product.title}

                      className="productImg"

                      sizes="(max-width:768px) 100vw, 33vw"

                    />


                  </div>






                  <div className="cardBody">


                    <h3>

                      {product.title}

                    </h3>





                    <Link

                      href={`/products/${product.slug}`}

                    >


                      <button className="detail">


                        View Details


                      </button>


                    </Link>




                  </div>





                </div>


              ))

            }



          </div>


        )

      }




    </main>


  );


}