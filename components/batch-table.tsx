import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";
import { PlusIcon, EditIcon, DeleteIcon } from "@shopify/polaris-icons";
import { Icon, Text, Tooltip, Button } from "@shopify/polaris";

export function BatchTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Text as="p" variant="bodySm">
              ID
            </Text>
          </TableHead>
          <TableHead>
            <Text as="p" variant="bodySm">
              Price
            </Text>
          </TableHead>
          <TableHead>
            <Text as="p" variant="bodySm">
              Quantity
            </Text>
          </TableHead>
          <TableHead>
            <Tooltip content="Add new batch">
              <Button size="large" icon={PlusIcon} />
            </Tooltip>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            <Text as="p" variant="bodySm">
              1
            </Text>
          </TableCell>
          <TableCell>
            <Text as="p" variant="bodySm">
              $9.99
            </Text>
          </TableCell>
          <TableCell>
            <Text as="p" variant="bodySm">
              22
            </Text>
          </TableCell>
          <TableCell className="text-right">
            <div className="gap-x-2 flex flex-row justify-start items-center">
              <Tooltip content="Edit this batch">
                <Button icon={EditIcon} />
              </Tooltip>
              <Tooltip content="Delete this batch">
                <Button icon={DeleteIcon} />
              </Tooltip>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
