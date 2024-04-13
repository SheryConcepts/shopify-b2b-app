"use client";
import { linesItems as linesItemsAtom } from "@/lib/atoms";
import CartIcon from "@/public/CartIcon.svg";
import { useAtomValue } from "jotai";
import Image from "next/image";
import Link from "next/link";

export default function HeaderCartIcon() {
  const linesItems = useAtomValue(linesItemsAtom);
  console.log(linesItems.length, "linesItems.length");
  return (
    <Link href="/shop/cart" className="relative rounded-full hover:bg-gray-200 p-3">
      <Image src={CartIcon} className="w-8" alt="Cart Icon" />
      {linesItems.length > 0 ? (
        <div className="absolute right-0 top-0 w-7 text-center p-1 font-bold bg-green-500 text-white rounded-full">
          {linesItems.length}
        </div>
      ) : null}
    </Link>
  );
}
