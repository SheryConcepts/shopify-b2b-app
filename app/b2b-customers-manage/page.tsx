"use client";

import { Page, SkeletonBodyText, SkeletonPage } from "@shopify/polaris";
import { useRouter } from "next/navigation";

export default function B2BCustomersManage() {
  const router = useRouter();
  return (
    <Page
      primaryAction={{
        onAction: () => router.push("/b2b-customers-manage/create"),
        content: "Create Customer",
        id: "create-customer-action",
      }}
      backAction={{
        onAction: router.back,
        id: "back_to_home_from_b2bCustomersManage",
        content: "Go to home screen",
      }}
      title="B2B Customers"
    >
    </Page>
  );
}
