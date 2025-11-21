import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-5xl border-x border-border">
        <div className="flex min-h-screen items-center justify-center px-8">
          <SignUp
            routing="path"
            path="/sign-up"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "border border-border shadow-lg",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
