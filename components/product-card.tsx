import { CardContent, CardTitle, CardHeader, Card } from "@/components/ui/card";
import { limitString } from "@/lib/utilities";
import Image from "next/image";
import Link from "next/link";

export function ProductCard({
  title,
  image,
  handle,
}: {
  title: string;
  handle: string;
  image: { alt: string; url?: string };
}) {
  if (!image.url) {
    return;
  }
  return (
    <Link href={`/shop/products/${handle}`} className="flex-initial">
      <Card className="w-full mx-auto flex-col items-start">
        <CardContent className="p-0">
          {image.url ? (
            <Image
              alt={image.alt}
              className="aspect-square object-cover rounded-t-lg"
              height={600}
              src={image.url}
              width={400}
            />
          ) : (
            <Image
              alt="Product Image"
              className="aspect-square object-cover rounded-t-lg"
              height={600}
              src="/placeholder.svg"
              width={400}
            />
          )}
        </CardContent>
        <CardHeader className="text-center">
          <CardTitle className="text-base font-serif font-bold">
            {limitString(title, 50)}
          </CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}
