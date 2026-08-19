import { prisma } from "../app/lib/prisma";
import { products } from "../data/products";


async function main() {

  const list = Object.entries(products);


  for (const [slug, item] of list) {
    const category = await prisma.category.findUnique({
      where: { slug: item.category },
      select: { id: true },
    });


    await prisma.product.upsert({

      where: {
        slug: slug,
      },


      update: {

        title: item.title,

        slug: slug,

        image: item.image,

        overview: item.overview,

        categoryId: category?.id,

        features: item.features,

        applications: item.applications,

        specs: item.specs,

      },


      create: {

        title: item.title,

        slug: slug,

        image: item.image,

        overview: item.overview,

        categoryId: category?.id,

        features: item.features,

        applications: item.applications,

        specs: item.specs,

      },


    });


    console.log(
      "Imported:",
      item.title
    );


  }


}



main()

.then(()=>{

  console.log(
    "Import finished"
  );


})


.catch((error)=>{

  console.error(error);

})


.finally(async()=>{

  await prisma.$disconnect();

});
