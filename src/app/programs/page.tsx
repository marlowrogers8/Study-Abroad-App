import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProgramExplorer } from "@/components/programs/ProgramExplorer";
import { allPrograms } from "@/lib/data";

export const metadata: Metadata = {
  title: "Browse programs · Abroadly",
  description:
    "Every study abroad program ranked by verified student reviews and real cost and safety data. No sponsored listings, no pay-to-play.",
};

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const { country } = await searchParams;

  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-ink-100 bg-ink-50/50 bg-dotgrid">
          <div className="container-page py-12 sm:py-16">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Browse
            </p>
            <h1 className="mt-3 max-w-2xl text-balance font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              Every program, with nothing hidden
            </h1>
            <p className="mt-3 max-w-2xl text-ink-600">
              Costs shown are the true all-in total: program fee plus housing, food,
              flights, visa, and insurance. Safety and credit-transfer data come from
              public sources and student reviews, never from the programs themselves.
            </p>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="container-page">
            <ProgramExplorer programs={allPrograms} initialCountry={country ?? ""} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
