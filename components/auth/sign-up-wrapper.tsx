"use client";

import { SignUp } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SignUpWrapper() {
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
  );
}

