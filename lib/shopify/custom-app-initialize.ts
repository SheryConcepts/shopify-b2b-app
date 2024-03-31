import "@shopify/shopify-api/adapters/node";
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";

const customShopify = shopifyApi({
  apiSecretKey: process.env.CUSTOM_APP_API_SECRET ?? "", // Note: this is the API Secret Key, NOT the API access token
  apiVersion: LATEST_API_VERSION,
  isCustomStoreApp: true, // this MUST be set to true (default is false)
  adminApiAccessToken: process.env.CUSTOM_APP_ACCESS_TOKEN, // Note: this is the API access token, NOT the API Secret Key
  isEmbeddedApp: false,
  hostName: process.env.HOST_NAME ?? "",
});

if (!process.env.HOST_NAME) {
  throw new Error("HOST_NAME not found");
}

export default customShopify;
