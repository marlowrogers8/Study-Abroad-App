// Static content for the landing page.
// In production this is replaced by real data from the reviews database.

export type Program = {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  grade: string;
  rating: number;
  reviews: number;
  costPerTerm: string;
  tags: string[];
  blurb: string;
};

export const featuredPrograms: Program[] = [
  {
    id: "kyoto-engineering",
    name: "Kyoto Institute Exchange",
    city: "Kyoto",
    country: "Japan",
    flag: "🇯🇵",
    grade: "A+",
    rating: 4.8,
    reviews: 312,
    costPerTerm: "$9,400 / term",
    tags: ["Engineering", "Housing included", "Scholarships"],
    blurb:
      "Strong robotics labs and genuinely supportive faculty. Students cite low hidden costs and excellent housing.",
  },
  {
    id: "barcelona-design",
    name: "Barcelona School of Design",
    city: "Barcelona",
    country: "Spain",
    flag: "🇪🇸",
    grade: "A",
    rating: 4.6,
    reviews: 489,
    costPerTerm: "$7,150 / term",
    tags: ["Design", "Internships", "City life"],
    blurb:
      "Reviewers praise the studio culture and internship pipeline. A few note the cost of living runs high.",
  },
  {
    id: "cape-town-public-health",
    name: "Cape Town Global Health",
    city: "Cape Town",
    country: "South Africa",
    flag: "🇿🇦",
    grade: "A",
    rating: 4.7,
    reviews: 201,
    costPerTerm: "$6,300 / term",
    tags: ["Public Health", "Field work", "Need-based aid"],
    blurb:
      "Hands-on fieldwork and a tight-knit cohort. Students flag the value of the on-the-ground safety briefings.",
  },
];

export type Destination = {
  name: string;
  programs: number;
  gradient: string;
  flag: string;
};

export const destinations: Destination[] = [
  { name: "Japan", programs: 142, gradient: "from-rose-400/90 to-orange-300/90", flag: "🇯🇵" },
  { name: "Spain", programs: 168, gradient: "from-amber-400/90 to-yellow-300/90", flag: "🇪🇸" },
  { name: "Italy", programs: 197, gradient: "from-emerald-400/90 to-teal-300/90", flag: "🇮🇹" },
  { name: "Australia", programs: 121, gradient: "from-sky-400/90 to-cyan-300/90", flag: "🇦🇺" },
  { name: "Ghana", programs: 54, gradient: "from-fuchsia-400/90 to-rose-300/90", flag: "🇬🇭" },
  { name: "Chile", programs: 89, gradient: "from-indigo-400/90 to-blue-300/90", flag: "🇨🇱" },
];

export const aiSuggestions: string[] = [
  "Affordable engineering programs in Japan with housing",
  "Safest cities for solo female travelers in South America",
  "Programs that accept financial aid and Pell grants",
  "Spring semester design programs under $8,000",
];

// Mocked AI responses keyed loosely to the suggestion chips above.
// This is the UI shell — a real model call replaces `getMockAnswer` later.
export const mockAnswer = {
  summary:
    "Here are transparent, student-rated matches. Every program below is ranked only by verified reviews — never by who paid us. Costs shown are median out-of-pocket, reported by students.",
  matches: featuredPrograms,
};
