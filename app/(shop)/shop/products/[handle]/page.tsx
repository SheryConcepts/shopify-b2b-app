import { ProducDisplay } from "@/components/produc-display";
import customShopifyClient from "@/lib/shopify/custom-app-initialize";


const ReadB2BProduct = `
  query($handle: String!) {
    productByHandle(handle: $handle){
      variants(first: 100) {
        nodes {
          title
          image {
            altText
            url
          }
          metafield(namespace:"b2b-app", key:"batches"){
            value
          }
        }
        
      }
      hasOnlyDefaultVariant
      title
      images(first: 1){
        nodes {
          altText
          url
          
        }
      }
    }
  }
`;

export default async function ProductCardHandle({
  params: { handle },
}: {
  params: { handle: string };
}) {
  const { data, errors } = await customShopifyClient.request(ReadB2BProduct, {
    variables: { handle },
  });

  if (errors || !data.productByHandle) {
    throw new Error("Error while fetching the B2B product.");
  }

  return <ProducDisplay productData={data.productByHandle} />;
}
