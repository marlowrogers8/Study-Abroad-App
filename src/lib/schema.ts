// Canonical schema for a study abroad program.
// Fields marked [SCRAPED] come from automated pipelines.
// Fields marked [ADVISOR] come from the Track 2 advisor outreach digester.
// Fields marked [MANUAL] require human curation.

export type SafetyLevel = 1 | 2 | 3 | 4; // mirrors US State Dept: 1=normal, 4=do not travel

export type LgbtqTier = "generally safe" | "caution" | "hostile";

export type HousingType = "dorm" | "homestay" | "apartment" | "independent";

export type Duration = "summer" | "semester" | "year";

export type CostBreakdown = {
  programFee: number;       // tuition / program fee (USD)
  housingEstimate: number;  // median housing cost for the term
  foodEstimate: number;     // median food cost for the term
  flightEstimate: number;   // median round-trip from major US hubs
  visaFee: number;          // student visa application cost
  insuranceRequired: number;// mandatory health insurance if any
  total: number;            // sum — the "true cost"
};

export type Scholarship = {
  name: string;
  amount: number;         // USD per term
  url?: string;
};

export type ApplicationWindow = {
  term: "Spring" | "Summer" | "Fall" | "Year";
  deadline: string;       // ISO date string
};

export type Program = {
  id: string;
  name: string;
  provider: string;       // e.g. "CIEE", "IES Abroad", "Direct Enrollment"

  // Location
  city: string;
  country: string;
  countryCode: string;    // ISO 3166-1 alpha-2
  flag: string;

  // Cost transparency [SCRAPED + ADVISOR]
  cost: CostBreakdown;

  // Safety [SCRAPED]
  stateDeptAdvisoryLevel: SafetyLevel;
  crimeIndex: number;           // Numbeo 0–100 (higher = more crime)
  safetyNotes: string;          // [ADVISOR] qualitative advisor flag
  soloFemaleSafetyScore: number;// 0–10 composite (10 = safest)

  // Academic
  fieldsOfStudy: string[];
  durationOptions: Duration[];
  creditTransferRate: number;   // 0–100 [ADVISOR] % who transfer credits successfully
  pellGrantEligible: boolean;   // Title IV eligible [SCRAPED/MANUAL]
  financialAidAccepted: boolean;

  // Experience
  languageBarrierScore: number; // 0–10 (0 = everyone speaks English, 10 = full immersion)
  lgbtqTier: LgbtqTier;         // [SCRAPED] ILGA World index
  housingOptions: HousingType[];
  internshipsAvailable: boolean;
  coopEligible: boolean;

  // Quality signals
  rating: number;         // 0–5
  reviewCount: number;
  grade: string;          // A+, A, B+, etc. — computed from rating
  blurb: string;          // [ADVISOR] or scraped student review summary
  tags: string[];         // surfaced in search + filters

  // Advisor-sourced intelligence [ADVISOR]
  advisorRecommendationRate: number | null; // % of advisors who recommend this program
  advisorRedFlags: string[];               // qualitative red flags from advisors
  advisorHighlights: string[];             // qualitative highlights from advisors
  hiddenCosts: string[];                   // undisclosed costs advisors warn about

  // Meta
  applicationWindows: ApplicationWindow[];
  scholarships: Scholarship[];
  programUrl: string;
  lastUpdated: string;    // ISO date
};

export type Destination = {
  country: string;
  countryCode: string;
  flag: string;
  programCount: number;
  stateDeptAdvisoryLevel: SafetyLevel;
  crimeIndex: number;
  costOfLivingIndex: number; // Numbeo (lower = cheaper)
  lgbtqTier: LgbtqTier;
  topFieldsOfStudy: string[];
  gradient: string;         // Tailwind gradient for UI card
};
