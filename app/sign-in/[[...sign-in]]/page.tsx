import { SignInWrapper } from "@/components/auth/sign-in-wrapper";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const user = await currentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-5xl border-x border-border">
        <div className="flex min-h-screen items-center justify-center px-8">
          <SignInWrapper />
        </div>
      </div>
    </div>
  );
}
