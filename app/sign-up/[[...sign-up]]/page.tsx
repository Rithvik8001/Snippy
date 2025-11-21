import { SignUpWrapper } from "@/components/auth/sign-up-wrapper";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const user = await currentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-5xl border-x border-border">
        <div className="flex min-h-screen items-center justify-center px-8">
          <SignUpWrapper />
        </div>
      </div>
    </div>
  );
}
