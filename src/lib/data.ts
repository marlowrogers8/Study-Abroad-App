import programsData from "./data/programs.json";
import destinationsData from "./data/destinations.json";
import type { Program, Destination } from "./schema";

export type { Program, Destination };

export const allPrograms: Program[] = programsData.programs as Program[];

export const featuredPrograms: Program[] = allPrograms
  .filter((p) => p.rating >= 4.7)
  .sort((a, b) => b.reviewCount - a.reviewCount)
  .slice(0, 3);

export const destinations: Destination[] = destinationsData.destinations as unknown as Destination[];

export const aiSuggestions: string[] = [
  "Affordable engineering programs in Japan with housing",
  "Safest cities for solo female travelers in South America",
  "Programs that accept financial aid and Pell grants",
  "Spring semester design programs under $8,000",
  "All-inclusive programs with housing and meals included",
  "Best LGBTQ+-friendly destinations in Europe",
  "Programs under $20k total cost including flights",
  "Arabic language immersion programs in North Africa",
];

export const mockAnswer = {
  summary:
    "Here are transparent, student-rated matches. Every program below is ranked only by verified reviews — never by who paid us. Costs shown are median out-of-pocket, reported by students.",
  matches: featuredPrograms,
};
