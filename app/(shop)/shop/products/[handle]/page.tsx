import { ProductDisplay } from "@/components/produc-display";
import customShopifyClient from "@/lib/shopify/custom-app-initialize";
import { type Product } from "@/lib/types";

const ReadB2BProduct = `
  query($handle: String!) {
    productByHandle(handle: $handle){
      id
      variants(first: 100) {
        nodes {
          id
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
      images(first: 40){
        nodes {
          altText
          url
          
        }
      }
    }
  }
`;

function reshapeProduct(product: Product): Product {
  const variantsWithEmptyMetafeildsRemoved = product.variants.nodes.filter(
    (i) => {
      const value = i.metafield.value;
      if (value === null) {
        return false;
      }
      if (JSON.parse(value).length < 1) {
        return false;
      }
      return true;
    },
  );
  return {
    ...product,
    variants: {
      nodes: variantsWithEmptyMetafeildsRemoved,
    },
  };
}

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

  const product = data.productByHandle as Product;
  if (!product.hasOnlyDefaultVariant) {
    const productWithValidVariant = reshapeProduct(product);
    return <ProductDisplay productData={productWithValidVariant} />;
  } else {
    return <ProductDisplay productData={product} />;
  }
}
