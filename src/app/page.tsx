import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { HowWeWorkSection } from "@/components/sections/HowWeWorkSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { PhasesSection } from "@/components/sections/PhasesSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <HowWeWorkSection />
      <PricingSection />
      <PhasesSection />
      <ContactSection />
    </>
  );
}
