"use client";

import { Button } from "@/components/ui/button";
import { linesItems } from "@/lib/atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { TrashIcon } from "lucide-react";
import Image from "next/image";

export default function Cart() {
  const items = useAtomValue(linesItems);
  if (items.length < 1) {
    return (
      <h1 className="font-serif text-3xl font-bold text-center">
        No Items in Cart
      </h1>
    );
  }
  return (
    <div className="w-full flex flex-col justify-start gap-y-2 items-center">
      <div className="flex p-3 h-[480px] w-full overflow-scroll  px-4 gap-y-3 flex-col items-center justify-start">
        {items.map((i, index) => (
          <LineItemCard
            title={
              i.variants[0].title === "Default Title"
                ? i.title
                : i.variants[0].title ?? "Default Title"
            }
            key={index}
            index={index}
            image={i.variants[0].image === "" ? i.image : i.variants[0].image}
            batch={{
              price: i.variants[0].batch.price,
              quantity: i.variants[0].batch.quantity,
            }}
          />
        ))}
      </div>
      <Button className="mx-auto font-serif text-lg w-32" size={"lg"}>
        Checkout
      </Button>
    </div>
  );
}

function LineItemCard({
  image,
  title,
  batch,
  index,
}: {
  image: string;
  title: string;
  index: number;
  batch: { price: string; quantity: string };
}) {
  const setAtoms = useSetAtom(linesItems);

  function handleDelete() {
    setAtoms((i) => {
      i.splice(index, 1);
      return [...i];
    });
  }

  return (
    <div className="py-4 shadow-gray-200 shadow px-8 w-3/4 flex items-center justify-between bg-gray-50">
      <Image width={100} height={100} src={image} className="" alt="" />
      <p className="font-serif text-lg text-center">{title}</p>
      <p className="font-serif text-lg">
        {batch.quantity} Unit(s) at ${batch.price}
      </p>
      <Button
        variant={"primary"}
        className="active:bg-gray-300 hover:bg-gray-200 "
        onClick={handleDelete}
      >
        <TrashIcon />
      </Button>
    </div>
  );
}
