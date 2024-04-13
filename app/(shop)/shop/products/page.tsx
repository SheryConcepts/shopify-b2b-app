import { ProductCard } from "@/components/product-card";
import customShopifyClient from "@/lib/shopify/custom-app-initialize";

const ReadB2BProductsQuery = `
  query {
    products(first: 50, query:"tag:b2b"){
      nodes {
      	title
        handle
        images(first: 1) {
          nodes {
            altText
          	url
          }
        }
      }
    }
  }
`;

export default async function Products() {
  const { data, errors } =
    await customShopifyClient.request(ReadB2BProductsQuery);
  if (errors) {
    throw new Error("Error while fetching products");
  }
  return (
    <div className="bg-white flex flex-wrap justify-center gap-5 gap-y-10 p-5">
      {data.products.nodes.map((i: any) => (
        <ProductCard
          handle={i.handle}
          key={i.handle}
          image={{
            alt: i.images.nodes[0]?.altText as string,
            url: i.images.nodes[0]?.url,
          }}
          title={i.title}
        />
      ))}
    </div>
  );
}
