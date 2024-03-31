"use client";

import { signOut } from "@/app/actions";
import { Button } from "./ui/button";

export default function SignoutButton() {
  return (
    <Button
      className="border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900"
      size="sm"
      variant="primary"
      onClick={() => signOut()}
    >
      Sign Out
    </Button>
  );
}
