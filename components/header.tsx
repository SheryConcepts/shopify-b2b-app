import Link from "next/link";
import isSignedIn from "@/lib/session";
import CartIcon from "@/public/CartIcon.svg";
import Image from "next/image";
import Logo from "@/public/Wellbeing2day_Logo.jpg";
import HeaderCartIcon from "./header-cart-icon";

export async function Header() {
  const signedIn = await isSignedIn();
  return (
    <header className="bg-white px-16 flex items-center p-4 gap-4">
      <div className="flex items-center gap-4">
        <Link
          className="flex items-center gap-2 font-semibold text-2xl tracking-tight"
          href="/shop/products"
        >
          <Image src={Logo} className="w-36 aspect-square" alt="Wellbeing2day Logo" />
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {signedIn ? <HeaderCartIcon /> : undefined}
      </div>
    </header>
  );
}
