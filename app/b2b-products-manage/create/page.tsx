"use client";

import { gql, useMutation, useQuery } from "@apollo/client";
import {
  Page,
  Card,
  Button,
  Text,
  BlockStack,
  Thumbnail,
  Layout,
  TextField,
  Form,
  Box,
  InlineStack,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { showAndHideShopifyToast } from "../../../helpers/showAndHideShopifyToast";

export default function CreatePage() {
  const router = useRouter();
  const [shopifyProduct, setShopifyProduct] = useState<{
    title: string;
    id: string;
    variants: { title?: string; image?: string; id?: string }[];
  }>();

  async function handleProductSelection() {
    try {
      const payload = await shopify.resourcePicker({ type: "product" });
      if (payload) {
        const product = payload[0];
        console.log(JSON.stringify(product, null, 4));
        if (product.totalVariants === 1) {
          setShopifyProduct({
            title: product.title,
            id: product.id,
            variants: product.variants.map((i) => {
              return {
                id: i.id,
                title: i.title,
                image: product.images[0].originalSrc,
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
              image: i.image?.originalSrc ?? product.images[0].originalSrc,
            };
          }),
        });
      }
    } catch (e) {
      showAndHideShopifyToast("Cannot add this product", 3000);
      console.error(e, "handleProductSelection");
    }
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
            <BlockStack gap={"200"}>
              {shopifyProduct.variants.map((i) => (
                <VariantCard
                  title={i.title}
                  image={i.image}
                  id={i.id}
                  key={i.id}
                />
              ))}
            </BlockStack>
          </BlockStack>
        </Box>
      ) : null}
    </Page>
  );
}

const VariantMetafieldsUpdateMutation = gql`
  mutation VariantMetafieldAdd($variantInput: ProductVariantInput!) {
    productVariantUpdate(input: $variantInput) {
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
      }
    }
  }
`;

function VariantCard({
  image,
  title,
  id,
}: {
  image?: string;
  title?: string;
  id?: string;
}) {
  const [batchQuantity, setBatchQuantity] = useState("");
  const [batchQuantityError, setBatchQuantityError] = useState("");
  const [batchPrice, setBatchPrice] = useState("");
  const [batchPriceError, setBatchPriceError] = useState("");
  const [batches, setBatches] = useState<
    { id: string; quantity: string; price: string }[]
  >([]);

  const [updateMetafield, { called, loading }] = useMutation(
    VariantMetafieldsUpdateMutation,
    {
      fetchPolicy: "network-only",
    },
  );

  const { error, data } = useQuery(VariantMetafieldsReadQuery, {
    fetchPolicy: "network-only",
    variables: { id },
  });

  useEffect(() => {
    if (error) {
      console.error(error, "VariantMetafieldsReadQueryError");
      showAndHideShopifyToast(
        "Error while loading batches of the variant. Please try again.",
        3000
      );
      return;
    }
    try {
      const fetchedBatches = JSON.parse(data.productVariant.metafield.value);
      setBatches(fetchedBatches);
    } catch (e) {
      console.error("Error while parsing the variant metafield");
    }
  }, [error, data.productVariant.metafield.value]);

  const pending = called && loading;

  async function handleBatchSubmition() {
    if (!batchQuantity) {
      setBatchQuantityError("Can't be empty.");
      return;
    }
    if (!batchPrice) {
      setBatchPriceError("Can't be empty.");
      return;
    }
    if (
      batches.some(
        (i) => i.quantity === batchQuantity && i.price === batchPrice,
      )
    ) {
      setBatchPriceError("Already Exists");
      setBatchQuantityError("Already Exists");
      return;
    }

    const { data, errors } = await updateMetafield({
      variables: {
        variantInput: {
          id: id,
          metafields: [
            {
              namespace: "b2b-app",
              type: "json",
              key: "batches",
              value: JSON.stringify(
                batches.map((i) => ({ quantity: i.quantity, price: i.price })),
              ),
            },
          ],
        },
      },
    });

    if (errors) {
      console.error(errors, "updateMetafieldErrors");
      console.error(data, "updateMetafieldData");
      showAndHideShopifyToast("Error while updating batch.", 3000);
      return;
    }

    console.log(data, "updateMetafieldData");

    setBatches([
      ...batches,
      { id: uuid(), quantity: batchQuantity, price: batchPrice },
    ]);
  }

  async function handleBatchDelete(id: string) {
    const newBatches = batches.filter((i) => i.id !== id);
    setBatches(newBatches);
  }

  return (
    <Card padding={"400"}>
      <Layout>
        <Layout.Section variant="oneHalf">
          <BlockStack gap={"300"} align="start">
            {image && (
              <Thumbnail source={image} alt="Variant Image" size="large" />
            )}
            {title && (
              <Text as="p" variant="headingSm">
                {title}
              </Text>
            )}
            {batches.length > 0 && (
              <BlockStack gap={"100"}>
                <Text as="h2" variant="headingMd">
                  Batches
                </Text>
                {batches.map((i) => (
                  <InlineStack align="start" key={i.id} gap={"200"}>
                    <Button
                      onClick={() => handleBatchDelete(i.id)}
                      icon={DeleteIcon}
                    />
                    <Text as="p" variant="bodyLg">
                      {i.quantity} Products for {i.price}$
                    </Text>
                  </InlineStack>
                ))}
              </BlockStack>
            )}
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneHalf">
          <Form onSubmit={handleBatchSubmition}>
            <BlockStack gap={"200"}>
              <TextField
                value={batchQuantity}
                onChange={(e) => {
                  setBatchQuantityError("");
                  setBatchQuantity(e);
                }}
                label="Batch Quantity"
                type="number"
                error={batchQuantityError}
                autoComplete=""
              />
              <TextField
                value={batchPrice}
                onChange={(e) => {
                  setBatchPriceError("");
                  setBatchPrice(e);
                }}
                label="Batch Price"
                error={batchPriceError}
                type="number"
                autoComplete=""
              />
              <Button loading={pending} submit>
                Create Batch
              </Button>
            </BlockStack>
          </Form>
        </Layout.Section>
      </Layout>
    </Card>
  );
}
