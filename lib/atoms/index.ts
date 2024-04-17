import { atomWithStorage } from "jotai/utils";

export type LineItem = {
  id: string;
  title: string;
  image: string;
  variants: Variant[];
};

type Variant = {
  id: string;
  title: string;
  image: string;
  batch: {
    quantity: string;
    price: string;
  };
};

export const linesItems = atomWithStorage<LineItem[]>("linesItems", []);
