"use client";

import { Provider } from "jotai";

export default function JotaiProvider({
  children,
}: {
  children: JSX.Element;
}) {
  return <Provider>{children}</Provider>;
}
