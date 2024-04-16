"use client";

import { linesItems as linesItemsAtom } from "@/lib/atoms";
import { useAtomValue } from "jotai";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function HeaderCart() {
  const linesItems = useAtomValue(linesItemsAtom);
  return (
    <Link href="/shop/cart" className="flex gap-x-2 items-center relative">
      <ShoppingCart className="w-5" />
      Cart
      {linesItems.length > 0 ? (
        <div className="font-bold">
          {linesItems.length}
        </div>
      ) : null}
    </Link>
  );
}

