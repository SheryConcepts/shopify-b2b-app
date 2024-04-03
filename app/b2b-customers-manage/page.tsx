"use client";

import { gql, useLazyQuery } from "@apollo/client";
import {
  BlockStack,
  Box,
  Page,
  SkeletonBodyText,
  IndexTable,
  LegacyCard,
  useIndexResourceState,
  Text,
  Tooltip,
  Icon,
} from "@shopify/polaris";

import { NoteIcon } from "@shopify/polaris-icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

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
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string; 
  note: string;
};

function convertUsers(gqlData: GQLResponse[]): CustomerInfo[] {
  return gqlData.map((i) => ({
    id: v4(),
    firstName: i.firstName,
    lastName: i.lastName,
    email: i.email,
    password: i.metafield.value, 
    phone: i.phone,
    address: i.addresses.length > 0 ? i.addresses[0].address1 : "",
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
        shopify.toast.show("Error while fetching products");
        return;
      }
      const customerInfo = convertUsers(data.customers.nodes);
      setCustomersInfo(customerInfo);
    }
    ops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {customersInfo.length > 0 ? (
          <BlockStack gap={"300"}>
            <CustomersIndexTable customers={customersInfo} />
          </BlockStack>
        ) : (
          <SkeletonBodyText lines={5} />
        )}
      </Box>
    </Page>
  );
}

function CustomersIndexTable({ customers }: { customers: CustomerInfo[] }) {
  const router = useRouter();

  const resourceName = {
    singular: "customer",
    plural: "customers",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(customers);

  const rowMarkup = customers.map(
    (
      { id, firstName, lastName, email, password, phone, address, note },
      index,
    ) => (
      <IndexTable.Row
        onClick={() => router.push("/b2b-customers-manage/edit")}
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {firstName + " " + lastName}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{email}</IndexTable.Cell>
        <IndexTable.Cell>{password}</IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" alignment="end" numeric>
            {phone}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{address}</IndexTable.Cell>
        <IndexTable.Cell>
          <Tooltip content={note}>
            <Icon source={NoteIcon} />
          </Tooltip>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <LegacyCard>
      <IndexTable
        resourceName={resourceName}
        itemCount={customers.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: "Name" },
          { title: "Email" },
          { title: "Password" },
          { title: "Phone", alignment: "end" },
          { title: "Address" },
          { title: "Note" },
        ]}
      >
        {rowMarkup}
      </IndexTable>
    </LegacyCard>
  );
}
