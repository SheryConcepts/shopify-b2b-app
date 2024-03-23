"use client";
import {
  BlockStack,
  Page,
} from "@shopify/polaris";
import HomePageCard from "@/components/home/HomePageCard";

export default function HomePage() {
  return (
    <Page title="Home">
      <BlockStack gap="200">
        <HomePageCard
          title="B2B Customers"
          description="Create and Manage B2B Customers."
          href="/b2b-customers-manage"
        />
        <HomePageCard
          title="B2B Products"
          description="Create and Manage B2B Poducts."
          href="/b2b-products-manage"
        />
      </BlockStack>
    </Page>
  );
}
