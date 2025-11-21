import {
  LandingContainer,
  HeroSection,
  FeaturesSection,
  AIFeaturesSection,
  CTASection,
} from "@/components/landing";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentUser();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <LandingContainer>
      <HeroSection />
      <FeaturesSection />
      <AIFeaturesSection />
      <CTASection />
    </LandingContainer>
  );
}
