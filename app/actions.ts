"use server";

import { sign } from "@/lib/session";
import shopify, {
  customShopifyStorefrontClient,
} from "@/lib/shopify/custom-app-initialize";
import { verifyAuth } from "@/lib/shopify/verify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOut as signOutFunction } from "@/lib/session";
import customShopifyClient from "@/lib/shopify/custom-app-initialize";
import { LineItem } from "@/lib/atoms";

export async function checkSession(shop: string) {
  try {
    await verifyAuth(shop);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function doServerAction(shop: string): Promise<{
  status: "success" | "error";
}> {
  try {
    console.log("shop", shop);
    await verifyAuth(shop);
    return {
      status: "success",
    };
  } catch (error) {
    console.log(error);
    return {
      status: "error",
    };
  }
}

const ReadCustomersQuery = `
   query {
     customers(first: 100, query: "tag:b2b") {
       nodes {
         email
         metafields(first: 100, keys: ["b2b-app-customers.password"]){
           nodes {
             key
             value
           }
         },
       }
      }
   }
`;

export async function signIn(email: string, password: string): Promise<void> {
  const client = customShopifyClient;

  const { data, errors } = await client.request(ReadCustomersQuery);

  if (errors) {
    console.error(errors);
    console.log(data);
    return;
  }

  const nodes: {
    email: string;
    metafields: { nodes: { key: string; value: string }[] };
  }[] = data.customers.nodes;
  const emailsAndPasswords = nodes.reduce(
    (acc, i) => {
      acc.push({ email: i.email, password: i.metafields.nodes[0].value });
      return acc;
    },
    [] as { email: string; password: string }[],
  );

  console.log(JSON.stringify(emailsAndPasswords, null, 4));
  if (
    emailsAndPasswords.some((i) => i.password === password && i.email === email)
  ) {
    const userDetails = emailsAndPasswords.find(
      (i) => i.password === password && i.email === email,
    )!;
    console.log("authorized");
    if (!process.env.JWT_SECRET) throw new Error("JWT SECRET key not found.");
    const token = await sign(
      { email: userDetails.email },
      process.env.JWT_SECRET as string,
    );
    console.log(token, "token from server action");
    cookies().set("Authorization", `Bearer ${token}`);
    redirect("/shop/products");
  } else {
    console.log("unauthorized");
  }
}

export async function signOut() {
  await signOutFunction();
  redirect("/shop");
}

const START_CHECKOUT_MUTATION = `
 mutation cartCreate {
    cartCreate {
      cart {
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
} 
`;
function combineItemsWithSameId(
  items: { merchandiseId: string; quantity: number }[],
): { merchandiseId: string; quantity: number }[] {
  // Use a Map to efficiently group items by their 'id'
  const groupedItems = new Map<string, number>();
  for (const item of items) {
    const existingQuantity = groupedItems.get(item.merchandiseId);
    const newQuantity = existingQuantity
      ? existingQuantity + item.quantity
      : item.quantity;
    groupedItems.set(item.merchandiseId, newQuantity);
  }

  // Create a new list to store the combined items
  const combinedItems: { merchandiseId: string; quantity: number }[] = [];
  // @ts-ignore
  for (const [id, quantity] of groupedItems.entries()) {
    combinedItems.push({ merchandiseId: id, quantity });
  }

  return combinedItems;
}

function generateLines(lineItems: LineItem[]) {
  // Remove duplicates, merge same variant by summing their quantity
  const newLinesWithDups = lineItems.map((i) => ({
    quantity: Number(i.variants[0].batch.quantity),
    merchandiseId: i.variants[0].id,
  }));

  const lines = combineItemsWithSameId(newLinesWithDups);
  return lines;
}

export async function startCheckout(lineItems: LineItem[]) {
  // NOTE: for the demo trusting the price info coming from the client, this will not be the case in production
  try {
    const lines = generateLines(lineItems);
    console.log(lines, "lines")
    const variables = {
      lines,
      discountCodes: ["ALL_FREE"],
    };
    const res = await customShopifyStorefrontClient.request(
      START_CHECKOUT_MUTATION,
      {
        variables,
        headers: {
          "X-Shopify-Storefront-Access-Token":
            "6376974078515e880689d64ff33bd35a",
          "Content-Type": "application/json",
        },
      },
    );

    console.log(res.data);

    if (res.errors) {
      console.error(res.errors, "errors");
      return { error: true, data: false };
    }

    if (res.data.cartCreate.userErrors.length > 0) {
      console.error(res.errors, "errors");
      console.error(res.data.userErrors);
      return { error: true, data: false };
    }
    console.log(res.data.cartCreate.cart.checkoutUrl);
  } catch (e) {
    console.error(e, "catchError");
    return { error: true, data: "booh" };
  }
}
