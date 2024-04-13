"use client";

import { Button } from "@/components/ui/button";
import { linesItems } from "@/lib/atoms";
import { useAtom } from "jotai";
import Image from "next/image";

export default function Cart() {
  const [items, setItems] = useAtom(linesItems);
  console.log(items);
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
            image={i.variants[0].image === "" ? i.image : i.variants[0].image}
            batch={{
              price: i.variants[0].batch.price,
              quantity: i.variants[0].batch.quantity,
            }}
          />
        ))}
      </div>
      <Button className="mx-auto font-serif text-lg w-32" size={"lg"}>
        Place Order
      </Button>
    </div>
  );
}

function LineItemCard({
  image,
  title,
  batch,
}: {
  image: string;
  title: string;
  batch: { price: string; quantity: string };
}) {
  return (
    <div className="py-4 shadow-gray-200 shadow px-8 w-3/4 flex items-center justify-around bg-gray-50">
      <Image width={100} height={100} src={image} className="" alt="" />
      <p className="font-serif text-lg flex-1 text-center">{title}</p>
      <p className="font-serif text-lg">
        {batch.quantity} Unit(s) at ${batch.price}
      </p>
    </div>
  );
}
