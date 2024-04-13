"use client";

import { gql, useLazyQuery, useMutation } from "@apollo/client";
import {
  Page,
  Button,
  BlockStack,
  Thumbnail,
  Box,
  IndexTable,
  LegacyCard,
  Text,
  useBreakpoints,
} from "@shopify/polaris";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { showAndHideShopifyToast } from "../../../helpers/showAndHideShopifyToast";
import { BatchTable } from "@/components/batch-table";

const ProductTagMutation = gql`
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      userErrors {
        field
        message
      }
    }
  }
`;

const VariantMetafieldsReadQuery = gql`
  query VariantMetafieldRead($id: ID!) {
    productVariant(id: $id) {
      metafield(namespace: "b2b-app", key: "batches") {
        value
        id
      }
    }
  }
`;

type ShopifyProductVaraint = {
  title?: string;
  image?: string;
  id?: string;
};

export default function CreatePage() {
  const router = useRouter();
  const [shopifyProduct, setShopifyProduct] = useState<{
    title: string;
    id: string;
    variants: { title?: string; image?: string; id?: string }[];
  }>();
  const [productMarked, setProductMarked] = useState(false);
  const [productTags, setProductTags] = useState<string[]>([]);
  // const [pendingChecks, startCheckTransition] = useTransition();

  const [markProductAsB2B, { loading, called }] = useMutation(
    ProductTagMutation,
    {
      variables: { input: { tags: ["b2b"], id: shopifyProduct?.id ?? "" } },
      fetchPolicy: "network-only",
    },
  );

  // const [fetchVariantMetafields] = useLazyQuery(VariantMetafieldsReadQuery, {
  //   fetchPolicy: "network-only",
  // });

  useEffect(() => {
    if (productTags.some((i) => i === "b2b")) {
      setProductMarked(true);
    }
  }, [productTags]);

  async function handleProductSelection() {
    try {
      const payload = await shopify.resourcePicker({ type: "product" });
      if (payload) {
        const product = payload[0];
        console.log(product);
        setProductTags(product.tags);
        if (product.totalVariants === 1) {
          setShopifyProduct({
            title: product.title,
            id: product.id,
            variants: product.variants.map((i) => {
              return {
                id: i.id,
                title: i.title,
                image: product.images[0]?.originalSrc ?? "",
              };
            }),
          });
          return;
        }
        setShopifyProduct({
          title: product.title,
          id: product.id,
          variants: product.variants.map((i) => {
            return {
              id: i.id,
              title: i.title,
              image:
                i.image?.originalSrc ?? product.images[0]?.originalSrc ?? "",
            };
          }),
        });
      }
    } catch (e) {
      showAndHideShopifyToast("Cannot add this product", 3000);
      console.error(e, "handleProductSelection");
    }
  }

  async function handleMarkAsB2b() {
    // TODO: only mark if all the selected variants have the batches defined on them.
    // 1. fetch all the variants
    // 2. for each variant, check if it batches metafield defined
    // 3. defined means: batches is not equal to nul or []
    
    // shopifyProduct?.variants.forEach(i => {
    //    
    // })

    const { data, errors } = await markProductAsB2B({
      variables: {
        input: {
          id: shopifyProduct?.id ?? "",
          tags: [...productTags, "b2b"],
        },
      },
    });

    if (errors || data.productUpdate.userErrors.length > 0) {
      console.error(errors);
      console.error(data);
      showAndHideShopifyToast(
        "Error while marking product as b2b, please try again",
        3000,
      );
      return;
    }

    setProductMarked(true);
  }

  async function handleUnmarkAsB2B() {
    const { data, errors } = await markProductAsB2B({
      variables: {
        input: {
          id: shopifyProduct?.id ?? "",
          tags: productTags.filter((i) => i !== "b2b"),
        },
      },
    });

    if (errors || data.productUpdate.userErrors.length > 0) {
      console.error(errors);
      console.error(data);
      showAndHideShopifyToast(
        "Error while unmarking product as b2b, please try again",
        3000,
      );
      return;
    }
    setProductMarked(false);
  }

  return (
    <Page
      backAction={{
        onAction: router.back,
        id: "back_to_b2bCustomersManage_from_CreateCustomer",
        content: "Go to home screen",
      }}
      primaryAction={{
        onAction: handleProductSelection,
        content: "Choose Product",
      }}
      title="Create Product"
    >
      {shopifyProduct ? (
        <Box paddingBlockEnd={"400"}>
          <BlockStack gap={"400"}>
            <Text as="h2" variant="headingXl">
              {shopifyProduct?.title}
            </Text>
            <VariantsTable variants={shopifyProduct.variants} />
          </BlockStack>
        </Box>
      ) : null}
      {shopifyProduct &&
        (productMarked ? (
          <Button loading={called && loading} onClick={handleUnmarkAsB2B}>
            Unmark as B2B
          </Button>
        ) : (
          <Button loading={called && loading} onClick={handleMarkAsB2b}>
            Mark as B2B
          </Button>
        ))}
    </Page>
  );
}

function VariantsTable({ variants }: { variants: ShopifyProductVaraint[] }) {
  const resourceName = {
    singular: "variant",
    plural: "variants",
  };

  const rowMarkup = variants.map(({ id, image, title }, index) => (
    <IndexTable.Row id={id!} key={id} position={index}>
      <IndexTable.Cell>
        <Thumbnail source={image ?? ""} alt="" />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <BatchTable variantId={id!} />
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <LegacyCard>
      <IndexTable
        condensed={useBreakpoints().smDown}
        resourceName={resourceName}
        itemCount={variants.length}
        headings={[
          { title: "Image" },
          { title: "Title" },
          { title: "Batches" },
        ]}
        selectable={false}
      >
        {rowMarkup}
      </IndexTable>
    </LegacyCard>
  );
}
