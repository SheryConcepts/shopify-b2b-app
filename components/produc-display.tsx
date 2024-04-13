"use client";

import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
  Select,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import ProductImages from "./product-images";
import { type Product } from "@/lib/types";
import { useSetAtom } from "jotai";
import { linesItems } from "@/lib/atoms";

export function ProductDisplay({ productData }: { productData: Product }) {
  const setLineItems = useSetAtom(linesItems);
  
  const { hasOnlyDefaultVariant, title, variants, images, id } = productData;
  
  const [selectedVariant, setSelectedVariant] = useState(() =>
    hasOnlyDefaultVariant ? "Default Title" : "",
  );
  
  const [selectedBatch, setSelectedBatch] = useState<{
    price: string;
    quantity: string;
  }>();
  
  const variant = variants.nodes.find((i) => i.title === selectedVariant);

  const batches = JSON.parse(
    variants.nodes.find((i) => i.title === selectedVariant)?.metafield.value ??
    "[]",
  ) as { quantity: string; price: string }[];

  function handleAddToCard() {
    // TODO:
    setLineItems((v) => {
      const newLineItem = {
        id,
        title,
        image: images.nodes.length > 0 ? images.nodes[0].url : "",
        variants: [
          {
            id: variant?.id!,
            title: variant?.title!,
            image: variant?.image?.url ?? "",
            batch: {
              price: selectedBatch?.price!,
              quantity: selectedBatch?.quantity!,
            },
          },
        ],
      } as (typeof v)["0"];
      return [newLineItem, ...v];
    });
  }

  const Images = images.nodes.map((i) => ({
    url: i.url,
    alt: i.altText,
  }));

  return (
    <div
      key="1"
      className="bg-white flex flex-col-reverse md:flex-row gap-y-8 max-w-4xl mx-auto my-8"
    >
      <ProductImages images={Images} />
      <div className="flex-1 px-8">
        <h1 className="text-3xl font-serif font-bold">{title}</h1>
        {hasOnlyDefaultVariant ? null : (
          <div className="mt-4">
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="title"
            >
              Variant
            </label>
            <Select onValueChange={(e) => setSelectedVariant(e)}>
              <SelectTrigger id="title">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper">
                {variants.nodes.map((i) => (
                  <SelectItem key={i.title} value={i.title}>
                    {i.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {batches ? (
          <div className="mt-4">
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="batch"
            >
              Batch
            </label>
            <Select
              onValueChange={(v) => {
                const [quantity, price] = v.split(",");
                setSelectedBatch({ quantity, price });
              }}
              required
            >
              <SelectTrigger id="batch">
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent position="popper">
                {batches.map((i) => (
                  <SelectItem key={uuid()} value={`${i.quantity},${i.price}`}>
                    {i.quantity} units at ${i.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <div className="flex mt-6">
          {/*@ts-ignore*/}
          <Button
            onClick={handleAddToCard}
            disabled={selectedBatch === undefined}
            className="flex-1 mr-2 font-serif text-xl"
            // @ts-ignore
            variant="outline"
          >
            Add to cart
          </Button>
        </div>
        <div className="mt-6 space-y-2 font-serif text-lg">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            sit amet erat sed purus sagittis dapibus. Donec ac scelerisque odio.
            Sed velit sem, pharetra eget nulla vitae, molestie pretium eros. Ut
            imperdiet aliquam augue in auctor.
          </p>
          <p>
            Vivamus volutpat felis sit amet eros tincidunt varius. Fusce posuere
            quis quam et imperdiet. Donec sollicitudin leo at ex scelerisque,
            quis tincidunt magna pulvinar. Nam facilisis enim non metus laoreet
            sollicitudin. Fusce sit amet ullamcorper nulla.
          </p>
        </div>
      </div>
    </div>
  );
}
