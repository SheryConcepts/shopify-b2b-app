import Link from "next/link";
import SignoutButton from "./signout-button";
import isSignedIn from "@/lib/session";

export async function Header() {
  return (
    <header className="flex items-center p-4 gap-4">
      <div className="flex items-center gap-4">
        <Link
          className="flex items-center gap-2 font-semibold text-2xl tracking-tight"
          href="/shop/products"
        >
          <HomeIcon className="w-6 h-6" />
          <span className="sr-only">Home</span>
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {(await isSignedIn()) ? <SignoutButton /> : null}
      </div>
    </header>
  );
}

function HomeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
