"use client";

import { gql, useLazyQuery } from "@apollo/client";
import { BlockStack, Box, Card, DescriptionList, Page } from "@shopify/polaris";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const READ_CUSTOMERS_QUERY = gql`
  query {
    customers(first: 100, query: "tag:b2b") {
      nodes {
        firstName
        lastName
        email
        phone
        addresses {
          address1
        }
        metafield(namespace: "b2b-app-customers", key: "password") {
          value
        }
        note
      }
    }
  }
`;

type GQLResponse = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addresses: { address1: string }[];
  metafield: { value: string };
  note: string;
};

type CustomerInfo = {
  firstName: string;
  lastName: string;
  email: string;
  password: string; // New field with an empty string
  phone: string;
  address: string; // Merged from addresses array
  note: string;
};

function convertUsers(gqlData: GQLResponse[]): CustomerInfo[] {
  return gqlData.map((i) => ({
    firstName: i.firstName,
    lastName: i.lastName,
    email: i.email,
    password: i.metafield.value, // Initialize password as empty string
    phone: i.phone,
    address: i.addresses.length > 0 ? i.addresses[0].address1 : "", // Extract first address or empty string
    note: i.note,
  }));
}

export default function B2BCustomersManage() {
  const router = useRouter();
  const [readCustomers] = useLazyQuery(READ_CUSTOMERS_QUERY, {
    fetchPolicy: "network-only",
  });
  const [customersInfo, setCustomersInfo] = useState<CustomerInfo[]>([]);

  useEffect(() => {
    async function ops() {
      const { data, error } = await readCustomers();
      if (error) {
        console.error(error, "error while fetching customers data");
        return;
      }
      const customerInfo = convertUsers(data.customers.nodes);
      setCustomersInfo(customerInfo);
    }
    ops();
  }, []);

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
      <Box paddingBlockEnd={"300"}>
        <BlockStack gap={"300"}>
          {customersInfo.map((i) => (
            <CustomerInfoCard key={i.email} customerInfo={i} />
          ))}
        </BlockStack>
      </Box>
    </Page>
  );
}

function CustomerInfoCard({
  customerInfo: { firstName, lastName, email, note, phone, address, password },
}: {
  customerInfo: CustomerInfo;
}) {
  return (
    <Card padding="300">
      <DescriptionList
        gap={"tight"}
        items={[
          {
            term: "First Name",
            description: firstName,
          },
          {
            term: "Last Name",
            description: lastName,
          },
          {
            term: "Email",
            description: email,
          },
          {
            term: "Password",
            description: password,
          },
          {
            term: "Phone",
            description: phone,
          },
          {
            term: "Address",
            description: address,
          },
          {
            term: "Note",
            description: note,
          },
        ]}
      />
    </Card>
  );
}
