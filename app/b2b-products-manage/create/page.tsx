"use client";

import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  Page,
  Card,
  Button,
  Text,
  BlockStack,
  Thumbnail,
  Layout,
  Box,
  InlineStack,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { v4 as uuid } from "uuid";
import { showAndHideShopifyToast } from "../../../helpers/showAndHideShopifyToast";

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

const ProductTagQuery = gql`
  query productTagRead($id: ID!) {
    product(id: $id) {
      tags
    }
  }
`;

export default function CreatePage() {
  const router = useRouter();
  const [shopifyProduct, setShopifyProduct] = useState<{
    title: string;
    id: string;
    variants: { title?: string; image?: string; id?: string }[];
  }>();
  const [productMarked, setProductMarked] = useState(false);

  const [markProductAsB2B, { loading, called }] = useMutation(
    ProductTagMutation,
    {
      variables: { input: { tags: ["b2b"], id: shopifyProduct?.id ?? "" } },
      fetchPolicy: "network-only",
    },
  );

  const {
    data: tagQueryData,
    // loading: tagQueryLoading,
    // called: tagQueryCalled,
  } = useQuery(ProductTagQuery, {
    variables: {
      id: shopifyProduct?.id ?? "",
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (tagQueryData) {
      const tags: String[] = tagQueryData.product.tags;
      if (tags.some((i) => i === "b2b")) {
        setProductMarked(true);
      }
    }
  }, [tagQueryData]);

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
    const { data, errors } = await markProductAsB2B({
      variables: {
        input: {
          id: shopifyProduct?.id ?? "",
          tags: ["b2b"],
        },
      },
    });
    console.log(data, "data");

    if (errors || data.productUpdate.userErrors.length > 0) {
      console.error(errors);
      console.error(data);
      showAndHideShopifyToast(
        "Error while marking product as b2b, please try again later",
        3000,
      );
      return;
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
      {shopifyProduct && (
        <Button loading={called && loading} onClick={handleMarkAsB2b}>
          Mark as B2B
        </Button>
      )}
    </Page>
  );
}

// TODO: handleMarkAsB2B

const VariantMetafieldsUpdateMutation = gql`
  mutation VariantMetafieldAdd($variantInput: ProductVariantInput!) {
    productVariantUpdate(input: $variantInput) {
      productVariant {
        metafield(namespace: "b2b-app", key: "batches") {
          id
        }
      }
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
  const [batchesMetafieldId, setBactchesMetafieldId] = useState("");
  const [pendingDelete, startTransition] = useTransition();
  const [clickedDelete, setClickedDelete] = useState("");

  const [updateMetafield, { called, loading }] = useMutation(
    VariantMetafieldsUpdateMutation,
    {
      fetchPolicy: "network-only",
    },
  );

  const [readMetafeilds] = useLazyQuery(VariantMetafieldsReadQuery, {
    fetchPolicy: "network-only",
    variables: { id },
  });

  useEffect(() => {
    async function ops() {
      const { data, error } = await readMetafeilds();
      console.log(
        data.productVariant.metafield,
        "data.productVariant.metafield",
      );

      if (error) {
        console.error(error, "VariantMetafieldsReadQueryError");
        showAndHideShopifyToast(
          "Error while loading batches of the variant. Please try again.",
          3000,
        );
        return;
      }

      if (!data) {
        console.error(data, "VariantMetafield not fetched");
        return;
      }

      if (!data.productVariant.metafield) {
        console.log(data, "VariantMetafield not defined");
        return;
      }

      try {
        const fetchedBatches = JSON.parse(data.productVariant.metafield.value);
        console.log(fetchedBatches, "fetchedBatches");
        setBatches(
          fetchedBatches.map((i: any) => ({
            ...i,
            id: uuid(),
          })),
        );
        const fetchedBatchesMetafieldId = data.productVariant.metafield.id;
        setBactchesMetafieldId(fetchedBatchesMetafieldId ?? "");
      } catch (e) {
        console.error("Error while parsing the variant metafield");
      }
    }
    ops();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const newBatches = [
      ...batches,
      { id: uuid(), quantity: batchQuantity, price: batchPrice },
    ];
    const value = JSON.stringify(
      newBatches.map((i) => ({ quantity: i.quantity, price: i.price })),
    );
    console.log(value, "value");

    const { data, errors } = await updateMetafield({
      variables: {
        variantInput: {
          id: id,
          metafields: [
            {
              namespace: "b2b-app",
              type: "json",
              key: "batches",
              id: batchesMetafieldId ? batchesMetafieldId : undefined,
              value: value,
            },
          ],
        },
      },
    });

    if (errors || data.productVariantUpdate.userErrors.length > 0) {
      console.error(errors, "updateMetafieldErrors");
      console.error(data, "updateMetafieldData");
      showAndHideShopifyToast("Error while updating batch.", 3000);
      return;
    }

    setBatches([
      ...batches,
      { id: uuid(), quantity: batchQuantity, price: batchPrice },
    ]);
    setBactchesMetafieldId(
      data.productVariantUpdate.productVariant.metafield.id,
    );
  }

  async function handleBatchDelete(batchId: string) {
    startTransition(async () => {
      const newBatches = batches.filter((i) => i.id !== batchId);
      const value = JSON.stringify(newBatches);
      const { data, errors } = await updateMetafield({
        variables: {
          variantInput: {
            id: id,
            metafields: [
              {
                namespace: "b2b-app",
                type: "json",
                key: "batches",
                id: batchesMetafieldId ? batchesMetafieldId : undefined,
                value: value,
              },
            ],
          },
        },
      });

      if (errors || data.productVariantUpdate.userErrors.length > 0) {
        console.error(errors, "updateMetafieldErrors");
        console.error(data, "updateMetafieldData");
        showAndHideShopifyToast("Error while updating batch.", 3000);
        return;
      }
      setBatches(newBatches);
    });
    setClickedDelete(batchId);
  }

  return (
    <Card padding={"400"}>
      <Layout>
        <Layout.Section variant="oneThird">
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
                      loading={pendingDelete && clickedDelete === i.id}
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
