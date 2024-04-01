"use server";

import { sign } from "@/lib/session";
import shopify from "@/lib/shopify/custom-app-initialize";
import { verifyAuth } from "@/lib/shopify/verify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOut as signOutFunction } from "@/lib/session";
import customShopifyClient from "@/lib/shopify/custom-app-initialize";

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
