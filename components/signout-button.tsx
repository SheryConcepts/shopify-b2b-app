"use client";

import { signOut } from "@/app/actions";
import { linesItems } from "@/lib/atoms";
import { useSetAtom } from "jotai";

export default function SignoutButton() {
  const setLineItems = useSetAtom(linesItems);

  async function handleSignout() {
    await signOut();
    setLineItems([]);
  }

  return <div onClick={handleSignout}>Sign Out</div>;
}
