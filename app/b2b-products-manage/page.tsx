"use client";

import {
  BlockStack,
  Card,
  Page,
  SkeletonBodyText,
  Text,
} from "@shopify/polaris";
import { useRouter } from "next/navigation";
import { gql, useQuery } from "@apollo/client";

const B2BProductsQuery = gql`
  query {
    products(first: 100, query: "tag:b2b") {
      nodes {
        title
      }
    }
  }
`;

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
          {data.products.nodes.map((i: any) => (
            <ProductCard key={i.title} title={i.title} />
          ))}
        </BlockStack>
      )}
    </Page>
  );
}

function ProductCard({ title }: { title: string }) {
  return (
    <Card>
      <Text as="h2" variant="headingMd">
        {title}
      </Text>
    </Card>
  );
}
