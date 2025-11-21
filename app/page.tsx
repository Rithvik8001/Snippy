import {
  LandingContainer,
  HeroSection,
  FeaturesSection,
  AIFeaturesSection,
  CTASection,
} from "@/components/landing";

export default function Home() {
  return (
    <LandingContainer>
      <HeroSection />
      <FeaturesSection />
      <AIFeaturesSection />
      <CTASection />
    </LandingContainer>
  );
}
