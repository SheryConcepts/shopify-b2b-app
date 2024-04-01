"use client";

import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
  Select,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { v4 as uuid } from "uuid";

type Product = {
  title: string;
  hasOnlyDefaultVariant: boolean;
  variants: { nodes: VariantNode[] };
  images: { nodes: ProductImage[] };
};

type VariantNode = {
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

export function ProducDisplay({ productData }: { productData: Product }) {
  const { hasOnlyDefaultVariant, title, variants, images } = productData;
  const [selectedVariant, setSelectedVariant] = useState(() =>
    hasOnlyDefaultVariant ? "Default Title" : "",
  );
  console.log(images, "images")
  const variant = variants.nodes.find((i) => i.title === selectedVariant);

  const batches = JSON.parse(
    variants.nodes.find((i) => i.title === selectedVariant)?.metafield.value ??
    "",
  ) as { quantity: string; price: string }[];

  console.log(title, hasOnlyDefaultVariant, variants, images);

  function handleAddToCard() {
    // TODO:
  }

  function handleBuy() {
    // TODO:
  }

  return (
    <div key="1" className="flex max-w-4xl mx-auto my-8">
      <div className="flex-1">
        <Image
          alt={
            hasOnlyDefaultVariant
              ? images.nodes.length === 0 ? "" :  images?.nodes[0]?.altText ?? ""
              : variant?.image.altText ?? ""
          }
          className="w-full h-auto"
          height="400"
          src={
            hasOnlyDefaultVariant
              ? images.nodes.length === 0 ? "/placeholder.svg" :  images?.nodes[0]?.url ?? "/placeholder.svg"
              : variant?.image.url ?? "/placeholder.svg"
          }
          style={{
            aspectRatio: "400/400",
            objectFit: "cover",
          }}
          width="400"
        />
      </div>
      <div className="flex-1 px-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="mt-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="title"
          >
            {hasOnlyDefaultVariant ? title : "Selected Variant Title"}
          </label>
          {hasOnlyDefaultVariant ? undefined : (
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
          )}
        </div>
        <div className="mt-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="batch"
          >
            Batch
          </label>
          <Select>
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
        <div className="flex mt-6">
          {/*@ts-ignore*/}
          <Button
            onClick={handleAddToCard}
            className="flex-1 mr-2"
            variant="outline"
          >
            Add to cart
          </Button>
          <Button onClick={handleBuy} className="flex-1">
            Buy it now
          </Button>
        </div>
      </div>
    </div>
  );
}
