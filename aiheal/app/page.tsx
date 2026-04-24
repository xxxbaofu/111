import { Hero } from "@/components/home/Hero";
import { CoreFeatures } from "@/components/home/CoreFeatures";
import { DemoReport } from "@/components/home/DemoReport";
import { UseCases } from "@/components/home/UseCases";
import { DataSources } from "@/components/home/DataSources";
import { CTA } from "@/components/home/CTA";
import { Infrastructure } from "@/components/home/Infrastructure";
import { DeveloperEntry } from "@/components/home/DeveloperEntry";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CoreFeatures />
      <DemoReport />
      <UseCases />
      <DataSources />
      <CTA />
      <Infrastructure />
      <DeveloperEntry />
    </>
  );
}
