"use client";

import { SkeletonBodyText, SkeletonPage } from "@shopify/polaris";
import { useEffect } from "react";

export default function GeneralLoadingScreen() {
  shopify.loading(true);
  useEffect(() => {
    return () => shopify.loading(false);
  }, []);
  return (
    <SkeletonPage primaryAction backAction >
      <SkeletonBodyText lines={5} />
    </SkeletonPage>
  );
}
