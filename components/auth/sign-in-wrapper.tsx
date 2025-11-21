"use client";

import { SignIn } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SignInWrapper() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded) {
    return null;
  }

  return (
    <SignIn
      routing="path"
      path="/sign-in"
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "border border-border shadow-lg",
        },
      }}
    />
  );
}
