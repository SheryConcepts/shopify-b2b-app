"use client";

import { linesItems as linesItemsAtom } from "@/lib/atoms";
import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";

export default function AccountDropDownButton() {
  const linesItems = useAtomValue(linesItemsAtom);
  console.log(linesItems.length, "linesItems.length");
  return (
    <Button
      size="icon"
      /* @ts-ignore*/
      variant="outline"
      className="relative  p-2 border border-gray-200 border-transparent hover:border-gray-300"
    >
      <UserIcon />
      {linesItems.length > 0 ? (
        <p className="absolute -right-0 -top-1  text-center px-[6px]  font-bold bg-green-500 text-white rounded-full">
          {linesItems.length}
        </p >
      ) : null}
    </Button>
  );
}
