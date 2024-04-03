"use client";

import {
  IndexTable,
  useIndexResourceState,
  BlockStack,
  Page,
  SkeletonBodyText,
  Thumbnail,
  LegacyCard,
} from "@shopify/polaris";
import { useRouter } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import { v4 } from "uuid";

const B2BProductsQuery = gql`
  query {
    products(first: 100, query: "tag:b2b") {
      nodes {
        title
        images(first: 1) {
          nodes {
            url
          }
        }
      }
    }
  }
`;

type ShopifyProduct = {
  nodes: Node[];
};

type Node = {
  title: string;
  images: {
    nodes: ImageNode[];
  };
};

type ImageNode = {
  url: string;
};

type Product = {
  id: string;
  title: string;
  image: string;
};

function reshapeProducts(products: ShopifyProduct): Product[] {
  return products.nodes.map((i) => {
    console.log(i, "product");
    const title = i.title;
    const image = i.images.nodes[0]?.url ?? "/placeholder.svg";
    return {
      id: v4(),
      title,
      image,
    };
  });
}

export default function B2BProductsManage() {
  const router = useRouter();
  const { data, loading, called } = useQuery(B2BProductsQuery, {
    fetchPolicy: "network-only",
  });
  return (
    <Page
      primaryAction={{
        onAction: () => router.push("/b2b-products-manage/create"),
        content: "Create Product",
        id: "create-product-action",
      }}
      backAction={{
        onAction: router.back,
        id: "back_to_home_from_b2bProductsManage",
        content: "Go to home screen",
      }}
      title="B2B Products"
    >
      {called && loading ? (
        <SkeletonBodyText />
      ) : (
        <BlockStack gap={"200"}>
          <ProductIndexTable products={reshapeProducts(data.products)} />
        </BlockStack>
      )}
    </Page>
  );
}

function ProductIndexTable({ products }: { products: Product[] }) {
  const router = useRouter();

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(products);

  const rowMarkup = products.map(({ id, title, image }, index) => (
    <IndexTable.Row
      onClick={() => router.push("/b2b-products-manage/edit")}
      id={id}
      key={id}
      selected={selectedResources.includes(id)}
      position={index}
    >
      <IndexTable.Cell>
        <Thumbnail size="small" source={image} alt="" />
      </IndexTable.Cell>
      <IndexTable.Cell>
          {title}
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <LegacyCard>
      <IndexTable
        resourceName={resourceName}
        itemCount={products.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[{ title: "Image" }, { title: "title" }]}
      >
        {rowMarkup}
      </IndexTable>
    </LegacyCard>
  );
}
