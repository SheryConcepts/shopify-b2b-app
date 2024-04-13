export type Product = {
  id: string;
  title: string;
  hasOnlyDefaultVariant: boolean;
  variants: { nodes: VariantNode[] };
  images: { nodes: ProductImage[] };
};

type VariantNode = {
  id: string;
  title: string;
  image: ProductImage;
  metafield: {
    value: string;
  };
};

type ProductImage = {
  altText: string;
  url: string;
};
