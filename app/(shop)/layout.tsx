import { Header } from "@/components/header";

export default function ShopLayout({ children }: { children: JSX.Element }) {
  return (
    <div className="w-full h-full">
      <Header />
      {children}
    </div>
  );
}
