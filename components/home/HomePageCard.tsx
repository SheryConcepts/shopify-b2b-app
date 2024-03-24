import { Box, Button, Card, InlineStack, Text } from "@shopify/polaris";
import Link from "next/link";
import { ArrowRightIcon } from "@shopify/polaris-icons";

export default function HomePageCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Card>
      <Text as="h2" variant="headingSm">
        {title}
      </Text>
      <Box paddingBlockStart="200">
        <Text as="p" variant="bodyMd">
          {description}
        </Text>
      </Box>
      <InlineStack align="end">
        <Link href={href}>
          <Button icon={<ArrowRightIcon width={25} />}>
          </Button>
        </Link>
      </InlineStack>
    </Card>
  );
}
