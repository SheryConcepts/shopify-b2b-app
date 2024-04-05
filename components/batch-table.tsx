import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";
import { PlusIcon, EditIcon, DeleteIcon } from "@shopify/polaris-icons";
import {
  Icon,
  Text,
  Tooltip,
  Button,
  Form,
  BlockStack,
  TextField,
  SkeletonBodyText,
} from "@shopify/polaris";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import { showAndHideShopifyToast } from "@/helpers/showAndHideShopifyToast";

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

type Batch = {
  price: number;
  quantity: number;
};

export function BatchTable({ variantId }: { variantId: string }) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchesMetafieldId, setBatchesMetafieldId] = useState("");
  const [fetchMetafields, { called, loading }] = useLazyQuery(
    VariantMetafieldsReadQuery,
    {
      fetchPolicy: "network-only",
      variables: { id: variantId },
    },
  );

  useEffect(() => {
    async function ops() {
      try {
        const { data, error } = await fetchMetafields();

        if (error) {
          console.error(error);
          shopify.toast.show("Error while fetching metafields");
          return;
        }

        if (!data.productVariant.metafield) {
          console.log("No batches defined");
          return;
        }

        const parsedMetafield = JSON.parse(data.productVariant.metafield.value);

        const fetchedBatches = parsedMetafield.map((i: Batch) => ({
          price: i.price,
          quantity: i.quantity,
        }));

        setBatches(fetchedBatches);
        setBatchesMetafieldId(data.productVariant.metafield.id);
      } catch (e) {
        console.error(e);
        shopify.toast.show(
          "Error while parsing the batches. Please contact support.",
        );
      }
    }
    ops();
    // eslint-disable-next-line
  }, []);

  function handleBatchAdd(batch: Batch) {
    setBatches((i) => [...i, { price: batch.price, quantity: batch.quantity }]);
  }

  return called && loading ? (
    <SkeletonBodyText lines={3} />
  ) : batches.length > 0 ? (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Text as="p" variant="bodySm">
              ID
            </Text>
          </TableHead>
          <TableHead>
            <Text as="p" variant="bodySm">
              Price
            </Text>
          </TableHead>
          <TableHead>
            <Text as="p" variant="bodySm">
              Quantity
            </Text>
          </TableHead>
          <TableHead>
            <Tooltip content="Add new batch">
              <AddBatch
                batches={batches}
                metafieldId={batchesMetafieldId}
                variant={variantId}
                setBatchesMetafieldId={setBatchesMetafieldId}
                handleBatchAdd={handleBatchAdd}
              />
            </Tooltip>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {batches.map((i, index) => (
          <TableRow key={index}>
            <TableCell>
              <Text as="p" variant="bodySm">
                {index + 1}
              </Text>
            </TableCell>
            <TableCell>
              <Text as="p" variant="bodySm">
                ${i.price}
              </Text>
            </TableCell>
            <TableCell>
              <Text as="p" variant="bodySm">
                {i.quantity}
              </Text>
            </TableCell>
            <TableCell className="text-right">
              <div className="gap-x-2 flex flex-row justify-start items-center">
                <Tooltip content="Edit this batch">
                  <EditBatch
                    batches={batches}
                    metafieldId={batchesMetafieldId}
                    variant={variantId}
                    setBatchesMetafieldId={setBatchesMetafieldId}
                    handleBatchAdd={handleBatchAdd}
                    batchId={index}
                  />
                </Tooltip>
                <DeleteBatch
                  setBatches={setBatches}
                  batchId={index}
                  variant={variantId}
                  batches={batches}
                  metafieldId={batchesMetafieldId}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <AddBatch
      batches={batches}
      metafieldId={batchesMetafieldId}
      variant={variantId}
      setBatchesMetafieldId={setBatchesMetafieldId}
      handleBatchAdd={handleBatchAdd}
    />
  );
}

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

function EditBatch({
  handleBatchAdd,
  variant,
  batches,
  metafieldId,
  setBatchesMetafieldId,
  batchId,
}: {
  batchId: number;
  setBatchesMetafieldId: (v: string) => void;
  handleBatchAdd: (batch: Batch) => void;
  variant: string;
  metafieldId: string;
  batches: Batch[];
}) {
  const [price, setPrice] = useState("0");
  const [priceError, setPriceError] = useState("");

  const [quantity, setQuantity] = useState("0");
  const [quantityError, setQuantityError] = useState("");

  const [updateMetafield, { called, loading }] = useMutation(
    VariantMetafieldsUpdateMutation,
    {
      fetchPolicy: "network-only",
    },
  );

  async function handleBatchSubmition() {
    if (!price) {
      setPriceError("Can't be empty.");
      return;
    }
    if (!quantity) {
      setQuantityError("Can't be empty.");
      return;
    }

    if (Number(price) < 0) {
      setPriceError("Can't be negative.");
      return;
    }
    if (Number(quantity) < 0) {
      setQuantityError("Can't be negative.");
      return;
    }

    const newBatches = batches.map((i, index) => {
      if (index === batchId) {
        return {
          price,
          quantity,
        };
      }
      return i;
    });
    const value = JSON.stringify(newBatches);

    const { data, errors } = await updateMetafield({
      variables: {
        variantInput: {
          id: variant,
          metafields: [
            {
              namespace: "b2b-app",
              type: "json",
              key: "batches",
              id: metafieldId ? metafieldId : undefined,
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

    handleBatchAdd({ price: Number(price), quantity: Number(quantity) });
    setBatchesMetafieldId(
      data.productVariantUpdate.productVariant.metafield.id,
    );
    shopify.modal.hide(modalId);
  }

  const modalId = `${variant}-edit`;

  return (
    <>
      <Button
        onClick={() => shopify.modal.show(modalId)}
        size="large"
        icon={EditIcon}
      />
      <Modal id={modalId}>
        <div className="flex flex-row justify-center items-center w-full">
          <div className="w-2/3 p-4 space-y-2 text-center">
            <TextField
              value={quantity}
              onChange={(e) => {
                setQuantity(e);
              }}
              size="slim"
              label="Batch Quantity"
              type="number"
              error={quantityError}
              autoComplete=""
            />
            <TextField
              value={price}
              onChange={(e) => {
                setPrice(e);
              }}
              label="Batch Price"
              size="slim"
              error={priceError}
              type="number"
              autoComplete=""
            />
            <Button onClick={handleBatchSubmition} loading={called && loading}>
              Save
            </Button>
          </div>
        </div>
        <TitleBar title="Edit Batch"></TitleBar>
      </Modal>
    </>
  );
}

function DeleteBatch({
  variant,
  batchId,
  batches,
  setBatches,
  metafieldId,
}: {
  variant: string;
  batchId: number;
  batches: Batch[];
  setBatches: (batches: Batch[]) => void;
  metafieldId: string;
}) {
  const [updateMetafield, { called, loading }] = useMutation(
    VariantMetafieldsUpdateMutation,
    {
      fetchPolicy: "network-only",
    },
  );

  async function handleDelete() {
    try {
      const newBatches = batches.filter((_, index) => index !== batchId);
      const value = JSON.stringify(newBatches);

      const { data, errors } = await updateMetafield({
        variables: {
          variantInput: {
            id: variant,
            metafields: [
              {
                namespace: "b2b-app",
                type: "json",
                key: "batches",
                id: metafieldId ? metafieldId : undefined,
                value: value,
              },
            ],
          },
        },
      });

      if (errors || data.productVariantUpdate.userErrors.length > 0) {
        console.error(errors, "updateMetafieldErrors");
        console.error(data, "updateMetafieldData");
        showAndHideShopifyToast("Error while deleting batch.", 3000);
        return;
      }

      setBatches(newBatches);
    } catch (e) {
      console.error(e);
      showAndHideShopifyToast("Error while deleting batch.", 3000);
    }
  }

  return (
    <Tooltip content="Delete this batch">
      <Button
        loading={called && loading}
        onClick={handleDelete}
        icon={DeleteIcon}
      />
    </Tooltip>
  );
}

function AddBatch({
  handleBatchAdd,
  variant,
  batches,
  metafieldId,
  setBatchesMetafieldId,
}: {
  setBatchesMetafieldId: (v: string) => void;
  handleBatchAdd: (batch: Batch) => void;
  variant: string;
  metafieldId: string;
  batches: Batch[];
}) {
  const [price, setPrice] = useState("0");
  const [priceError, setPriceError] = useState("");

  const [quantity, setQuantity] = useState("0");
  const [quantityError, setQuantityError] = useState("");

  const [updateMetafield, { called, loading }] = useMutation(
    VariantMetafieldsUpdateMutation,
    {
      fetchPolicy: "network-only",
    },
  );

  async function handleBatchSubmition() {
    if (!price) {
      setPriceError("Can't be empty.");
      return;
    }
    if (!quantity) {
      setQuantityError("Can't be empty.");
      return;
    }

    if (Number(price) < 0) {
      setPriceError("Can't be negative.");
      return;
    }
    if (Number(quantity) < 0) {
      setQuantityError("Can't be negative.");
      return;
    }

    const newBatches = [...batches, { quantity: quantity, price: price }];
    const value = JSON.stringify(newBatches);

    const { data, errors } = await updateMetafield({
      variables: {
        variantInput: {
          id: variant,
          metafields: [
            {
              namespace: "b2b-app",
              type: "json",
              key: "batches",
              id: metafieldId ? metafieldId : undefined,
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

    handleBatchAdd({ price: Number(price), quantity: Number(quantity) });
    setBatchesMetafieldId(
      data.productVariantUpdate.productVariant.metafield.id,
    );
    shopify.modal.hide(variant);
  }

  return (
    <>
      <Button
        onClick={() => shopify.modal.show(variant)}
        size="large"
        icon={PlusIcon}
      />
      <Modal id={variant}>
        <div className="flex flex-row justify-center items-center w-full">
          <div className="w-2/3 p-4 space-y-2 text-center">
            <TextField
              value={quantity}
              onChange={(e) => {
                setQuantity(e);
              }}
              size="slim"
              label="Batch Quantity"
              type="number"
              error={quantityError}
              autoComplete=""
            />
            <TextField
              value={price}
              onChange={(e) => {
                setPrice(e);
              }}
              label="Batch Price"
              size="slim"
              error={priceError}
              type="number"
              autoComplete=""
            />
            <Button onClick={handleBatchSubmition} loading={called && loading}>
              Save
            </Button>
          </div>
        </div>
        <TitleBar title="Batch"></TitleBar>
      </Modal>
    </>
  );
}
