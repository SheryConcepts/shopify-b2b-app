"use client";

import { gql, useLazyQuery } from "@apollo/client";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Button, LegacyCard as Card, Page, Text } from "@shopify/polaris";
import Link from "next/link";
import { useEffect, useState } from "react";
import { doServerAction } from "./actions";

interface Data {
  name: string;
  height: string;
}

const GET_SHOP = gql`
  query {
    shop {
      name
    }
  }
`;

interface ShopData {
  shop: {
    name: string;
  };
}

export default function Home({ shop }: { shop: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [serverActionResult, setServerActionResult] = useState<{
    status: "success" | "error";
  }>();
  const [graphqlData, setGraphglData] = useState<ShopData | null>(null);
  const [getShop] = useLazyQuery<ShopData>(GET_SHOP, {
    fetchPolicy: "network-only",
  });

  const app = useAppBridge();

  useEffect(() => {
    app.idToken().then((token) => {
      console.log("Token: ", token);
    });
  }, [app]);

  const handleGetAPIRequest = async () => {
    try {
      console.log("Calling API");
      // global fetch has tokens automatically added
      // https://shopify.dev/docs/api/app-bridge-library/apis/resource-fetching
      const response = await fetch("/api/hello");
      const result = (await response.json()) as { data: Data };
      setData(result.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Page title="Home">
      <Card
        sectioned
        title="NextJs API Routes"
        primaryFooterAction={{
          content: "Call API",
          onAction: handleGetAPIRequest,
        }}
      >
        <Text as="p" variant="bodyMd">
          Call a NextJS api route from within your app. The request is verified
          using session tokens.
        </Text>
        {data && (
          <Text as="h1" variant="headingSm">
            {data.name} is {data.height} tall.
          </Text>
        )}
      </Card>

      <Card
        sectioned
        title="React server actions"
        primaryFooterAction={{
          content: "Server action",
          onAction: async () => {
            const response = await doServerAction(shop);
            setServerActionResult(response);
          },
        }}
      >
        <Text as="p" variant="bodyMd">
          Call a server action from within your app. The request is verified
          using session tokens.
        </Text>
        {serverActionResult && serverActionResult.status === "success" && (
          <Text as="h1" variant="headingSm">
            Server action was successful.
          </Text>
        )}
        {serverActionResult && serverActionResult.status === "error" && (
          <Text as="h1" variant="headingSm">
            Server action failed.
          </Text>
        )}
      </Card>

      <Card
        sectioned
        title="Use Apollo Client to query Shopify GraphQL"
        primaryFooterAction={{
          content: "GraphQL Query",
          onAction: async () => {
            try {
              const { data, error } = await getShop();
              if (data) {
                setGraphglData(data);
              }
              if (error) {
                console.error(error);
              }
            } catch (err) {
              console.error(err);
            }
          },
        }}
      >
        <Text as="p" variant="bodyMd">
          Use Apollo Client to query Shopify&apos;s GraphQL API. The request
          uses online session tokens.
        </Text>
        <Text as="p" variant="bodyMd">
          Response:
        </Text>
        {graphqlData && (
          <Text as="h1" variant="headingSm">
            {graphqlData.shop.name}
          </Text>
        )}
      </Card>

      <Card sectioned title="Shopify App Bridge">
        <Text as="p" variant="bodyMd">
          Use the direct graphql api provided by Shopify App Bridge. This
          automatically uses an authenticated graphql route, no need to add
          tokens.
        </Text>
        <Button
          onClick={async () => {
            const res = await fetch("shopify:admin/api/graphql.json", {
              method: "POST",
              body: JSON.stringify({
                query: `
                query {
                  shop {
                    name
                  }
                }
              `,
              }),
            });
            const { data } = await res.json();
            console.log(data);
          }}
        >
          GraphQL Query
        </Button>
      </Card>

      <Card sectioned title="Shopify App Bridge">
        <Text as="p" variant="bodyMd">
          Use Shopify App Bridge to interact with the Shopify admin. The request
          uses online session tokens. This uses Shopify App Bridge v4.
        </Text>
        <Link href="/new">New page using next/link</Link>
      </Card>
    </Page>
  );
}
