"use client";

import { Page } from "@shopify/polaris";
import { useRouter } from "next/navigation";

export default function B2BProductsManage() {
  const router = useRouter();
  return (
    <Page
      primaryAction={{
        onAction: () => console.log("page action triggered"),
        content: "Create Product",
        id: "create-product-action",
      }}
      backAction={{
        onAction: router.back,
        id: "back_to_home_from_b2bProductsManage",
        content: "Go to home screen",
      }}
      title="B2B Products"
    ></Page>
  );
}
