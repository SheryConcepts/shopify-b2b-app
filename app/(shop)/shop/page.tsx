import { SignInForm } from "@/components/sign-in-form";
import isSignedIn from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Shop() {
  return (
    <div className="bg-slate-200 flex flex-col justify-center h-full">
      <SignInForm />
    </div>
  );
}
