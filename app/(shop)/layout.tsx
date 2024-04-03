import { Header } from "@/components/header";
import { Cardo, PT_Sans } from "next/font/google";

const cardo = Cardo({
  variable: "--font-serif",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const ptSans = PT_Sans({
  variable: "--font-sans",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export default function ShopLayout({ children }: { children: JSX.Element }) {
  return (
    <div className={`w-full h-full ${cardo.variable} ${ptSans.variable}`}>
      <Header />
      {children}
    </div>
  );
}
