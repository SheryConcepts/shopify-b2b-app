import { CardContent, CardTitle, CardHeader, Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export function ProductCard({
  title,
  image,
  handle,
}: {
  title: string;
  handle: string
  image: { alt: string; url?: string };
}) {
  return (
  <Link href={`/shop/products/${handle}`}>
  
    <Card className="w-full max-w-xs mx-auto flex-col items-start">
      <CardContent className="p-0">
        {image.url ? (
          <Image
            alt={image.alt}
            className="aspect-square object-cover rounded-t-lg min-w-0 w-full"
            height={300}
            src={image.url}
            width={300}
          />
        ) : (
          <Image
            alt="Product Image"
            className="aspect-square object-cover rounded-t-lg min-w-0 w-full"
            height={300}
            src="/placeholder.svg"
            width={300}
          />
        )}
      </CardContent>
      <CardHeader className="text-center">
        <CardTitle className="text-base font-bold">{title}</CardTitle>
      </CardHeader>
    </Card>
  </Link>
  );
}
