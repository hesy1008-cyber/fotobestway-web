import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/app/lib/prisma";
import { deleteProduct } from "./actions";
import "../../styles/admin.css";


export default async function AdminProductsPage(){


  const products = await prisma.product.findMany({

    orderBy:[
      {
        category:"asc"
      },
      {
        title:"asc"
      }
    ]

  });



  return (


    <main className="adminPage">



      <div

        style={{

          display:"flex",

          justifyContent:"space-between",

          alignItems:"center"

        }}

      >


        <h1>
          Products Management
        </h1>



        <Link href="/admin/products/new">


          <button>
            Add Product
          </button>


        </Link>



      </div>




      <br />




      {


        products.map((product)=>(


          <div


            key={product.id}


            className="adminProductCard"


          >





            <div

              className="adminProductImage"

            >



              <Image


                src={product.image}


                alt={product.title}


                fill


                style={{

                  objectFit:"contain"

                }}


              />



            </div>







            <div

              className="adminProductInfo"

            >



              <h2>

                {product.title}


              </h2>




              <p>

                Category: {product.category}

              </p>




              <p>

                ID: {product.id}

              </p>




              <p>

                Slug: {product.slug}

              </p>




              <p>

                Image: {product.image}

              </p>




            </div>









            <div

              className="adminProductActions"

            >



              <Link


                href={`/admin/products/${product.id}/edit`}


              >


                <button>

                  Edit

                </button>


              </Link>








              <form action={deleteProduct}>


                <input


                  type="hidden"


                  name="id"


                  value={product.id}


                />



                <button>


                  Delete


                </button>


              </form>




            </div>




          </div>



        ))

      }





    </main>


  );


}