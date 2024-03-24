"use client";

import { gql, useLazyQuery, useMutation } from "@apollo/client";
import {
  Form,
  FormLayout,
  TextField,
  Page,
  Card,
  Button,
  Box,
  Spinner,
} from "@shopify/polaris";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import * as z from "zod";

const customerSchema = z.object({
  firstName: z.string().trim().min(1, "First Name is required").nonempty(),
  lastName: z.string().trim().min(1, "Last Name is required").nonempty(),
  email: z.string().email("Invalid email").nonempty(),
  password: z.string().trim().min(1, "Password is required").nonempty(),
  phone: z.string().optional(),
  address: z.string().trim().optional(),
  note: z.string().optional(),
});

const CUSTOMER_CREATE_MUTATION = gql`
  mutation CreateCustomer($input: CustomerInput!) {
    customerCreate(input: $input) {
      userErrors {
        field
        message
      }
    }
  }
`;

export default function CreatePage() {
  const router = useRouter();
  const [createCustomer, { called, loading }] = useMutation(
    CUSTOMER_CREATE_MUTATION,
    {
      fetchPolicy: "network-only",
    },
  );
  const pending = called && loading;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    note: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    note: "",
  }); // State for specific field errors

  const handleChange = (value: string, id: string) => {
    setFormData((prevData) => ({ ...prevData, [id]: value }));
    setValidationErrors({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      note: "",
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const validatedData = customerSchema.safeParse(formData);
      if (!validatedData.success) {
        // Extract specific error messages for each field, ensuring only the first error per path is included
        const fieldErrors = validatedData.error.issues.reduce(
          (acc, issue) => {
            const path = issue.path[0]; // Use the first path element as the key
            // @ts-ignore
            if (!acc[path]) {
              // @ts-ignore
              acc[path] = issue.message;
            }
            return acc;
          },
          {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            phone: "",
            address: "",
            note: "",
          },
        );

        setValidationErrors(fieldErrors); // Update state with specific errors
        console.error("Validation Errors:", fieldErrors);
        return;
      }

      // Handle form submission logic here (e.g., send data to server)
      const ops = async () => {
        const { data } = await createCustomer({
          variables: {
            input: {
              email: formData.email,
              firstName: formData.firstName,
              lastName: formData.lastName,
              metafields: [
                {
                  namespace: "b2b-app-customers",
                  key: "password",
                  value: formData.password,
                  type: "single_line_text_field",
                },
              ],
              phone: formData.phone,
              note: formData.note,
              tags: ["b2b"],
              addresses: {
                address1: formData.address,
              },
            },
          },
        });
        const userErrors: any[] = data.customerCreate.userErrors ?? undefined;
        if (userErrors.length !== 0) {
          console.log(userErrors, "userErrors");
          const validationErrorsData = userErrors.reduce(
            (acc, error) => {
              if (error.field[0] === "addresses") {
                acc["address"] = error.message;
              } else {
                acc[error.field[0]] = error.message;
              }
              return acc;
            },
            {
              firstName: "",
              lastName: "",
              email: "",
              password: "",
              phone: "",
              address: "",
              note: "",
            },
          );
          setValidationErrors(validationErrorsData);
          return { error: true };
        }
        return { error: false };
      };
      const { error } = await ops();
      console.log(error, "error");
      if (!error) {
        shopify.toast.show("Customer Created");
        router.push("/b2b-customers-manage");
      }
    } catch (error) {
      console.error("Error during validation:", error);
    }
  };

  return (
    <Page
      backAction={{
        onAction: router.back,
        id: "back_to_b2bCustomersManage_from_CreateCustomer",
        content: "Go to home screen",
      }}
      title="Create Customer"
    >
      <Box paddingBlockEnd={"400"}>
        <Card>
          <Form onSubmit={handleSubmit}>
            <FormLayout>
              <TextField
                id="firstName"
                autoComplete=""
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                error={validationErrors.firstName}
              />
              <TextField
                id="lastName"
                autoComplete=""
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                error={validationErrors.lastName}
              />
              <TextField
                id="email"
                autoComplete=""
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={validationErrors.email}
              />
              <TextField
                placeholder="Customers will use this password to Login."
                id="password"
                autoComplete=""
                label="Password"
                type="text"
                value={formData.password}
                onChange={handleChange}
                error={validationErrors.password}
              />
              <TextField
                id="phone"
                autoComplete=""
                label="Phone"
                type="tel"
                error={validationErrors.phone}
                value={formData.phone}
                onChange={handleChange}
              />
              <TextField
                id="address"
                autoComplete=""
                label="Address"
                multiline
                value={formData.address}
                error={validationErrors.address}
                onChange={handleChange}
              />
              <TextField
                id="note"
                autoComplete=""
                label="Note"
                multiline
                error={validationErrors.note}
                value={formData.note}
                onChange={handleChange}
              />
              <Button
                icon={pending ? <Spinner size="small" /> : undefined}
                submit
              >
                {pending ? "" : "Create Customer"}
              </Button>
            </FormLayout>
          </Form>
        </Card>
      </Box>
    </Page>
  );
}
