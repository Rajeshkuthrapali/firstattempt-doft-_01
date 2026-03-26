import { useState } from "react";
import { Link } from "react-router-dom";
import { products } from "../data/products";
import { formatPrice } from "../lib/format";
import { trackEvent } from "../lib/analytics";

type ScentProfile = "Woody" | "Floral" | "Fresh" | "Spicy";

/** Maps each scent profile to the fragrance notes that match in our catalog. */
const PROFILE_NOTES: Record<ScentProfile, string[]> = {
  Woody: ["Cedarwood", "Sandalwood", "Oud", "Amber", "Leather"],
  Floral: ["Jasmine", "Rose", "Lavender", "Peony", "Ylang-Ylang"],
  Fresh: ["Sea Salt", "Bergamot", "Eucalyptus", "Mint", "Citrus"],
  Spicy: ["Cinnamon", "Cardamom", "Black Pepper", "Clove", "Ginger"],
};

const QUIZ_STEPS = [
  {
    question: "What is your ideal evening setting?",
    options: [
      { label: "Reading by a crackling fireplace", profile: "Woody" as ScentProfile },
      { label: "A twilight walk through a garden", profile: "Floral" as ScentProfile },
      { label: "Watching waves crash on the shore", profile: "Fresh" as ScentProfile },
      { label: "A vibrant dinner party with friends", profile: "Spicy" as ScentProfile },
    ],
  },
  {
    question: "Which sensory experience do you prefer?",
    options: [
      { label: "The smell of rain hitting warm earth", profile: "Fresh" as ScentProfile },
      { label: "Freshly ground coffee and cinnamon", profile: "Spicy" as ScentProfile },
      { label: "Freshly cut stems and blooming petals", profile: "Floral" as ScentProfile },
      { label: "Aged leather and cedar trunks", profile: "Woody" as ScentProfile },
    ],
  },
  {
    question: "How do you want your space to feel?",
    options: [
      { label: "Comforting & Grounded", profile: "Woody" as ScentProfile },
      { label: "Romantic & Soft", profile: "Floral" as ScentProfile },
      { label: "Clean & Invigorating", profile: "Fresh" as ScentProfile },
      { label: "Warm & Mysterious", profile: "Spicy" as ScentProfile },
    ],
  },
];

/** Scores products by how many of their notes overlap with the profile's target notes. */
function getRecommendations(profile: ScentProfile) {
  const targetNotes = PROFILE_NOTES[profile].map((n) => n.toLowerCase());
  return products
    .filter((p) => p.inStock)
    .map((p) => ({
      ...p,
      score: p.notes.filter((n) => targetNotes.includes(n.toLowerCase())).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

/**
 * ScentMatchQuiz — interactive personality-based quiz that maps
 * answers to a dominant scent profile and shows tailored product recommendations.
 */
export default function ScentMatchQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<ScentProfile[]>([]);
  const [result, setResult] = useState<ScentProfile | null>(null);

  const handleSelect = (profile: ScentProfile) => {
    const newAnswers = [...answers, profile];
    setAnswers(newAnswers);

    if (currentStep < QUIZ_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const counts = newAnswers.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dominant = Object.keys(counts).reduce((a, b) =>
        counts[a] > counts[b] ? a : b,
      ) as ScentProfile;

      setResult(dominant);
      trackEvent("scent_match_completed", { scent_profile: dominant });
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResult(null);
  };

  // ── Results Screen ──
  if (result) {
    const recommended = getRecommendations(result);
    return (
      <section className="bg-[#faf7f4] py-20 px-4 min-h-[60vh]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#c4a093] mb-3">
            Your Scent Profile
          </p>
          <h2 className="font-['Cormorant_Garamond',serif] text-5xl md:text-6xl font-medium text-[#2d2926] mb-4">
            {result}
          </h2>
          <p className="text-sm text-[#6b5e54] mb-12 max-w-md mx-auto">
            Based on your preferences, we&apos;ve curated candles that match
            your <strong className="text-[#2d2926]">{result.toLowerCase()}</strong> sensibility.
          </p>

          <div className="grid gap-8 sm:grid-cols-3 mb-12">
            {recommended.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.slug}`}
                className="group bg-white rounded-lg border border-[#e8e0d8] overflow-hidden hover:border-[#c4a093] transition-colors"
              >
                <div className="overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-4 text-left">
                  <p className="text-[10px] uppercase tracking-widest text-[#c4a093] mb-1">
                    {p.category}
                  </p>
                  <h3 className="text-sm font-semibold text-[#2d2926] group-hover:text-[#c4a093] transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-xs text-[#9a8d82] mt-1">{p.notes.join(" · ")}</p>
                  <p className="text-sm font-semibold text-[#2d2926] mt-2">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Link
              to={`/collections?scent=${result.toLowerCase()}`}
              className="bg-[#2d2926] text-white px-6 py-3 text-[10px] uppercase tracking-widest hover:bg-[#c4a093] transition-colors"
            >
              Browse All {result} Candles
            </Link>
            <button
              onClick={handleRestart}
              className="border border-[#e8e0d8] text-[#6b5e54] px-6 py-3 text-[10px] uppercase tracking-widest hover:border-[#c4a093] transition-colors"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ── Quiz Steps ──
  const step = QUIZ_STEPS[currentStep];

  return (
    <section className="bg-[#faf7f4] py-20 px-4 min-h-[60vh] flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full bg-white p-10 md:p-16 rounded-xl border border-[#e8e0d8] shadow-sm text-center">
        <p className="text-[10px] uppercase font-semibold tracking-[0.2em] text-[#c4a093] mb-4">
          Step {currentStep + 1} of {QUIZ_STEPS.length}
        </p>
        <h2 className="font-['Cormorant_Garamond',serif] text-3xl md:text-4xl font-medium text-[#2d2926] mb-10">
          {step.question}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="group" aria-label="Quiz options">
          {step.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(option.profile)}
              className="px-6 py-4 rounded border border-[#e8e0d8] bg-white text-sm text-[#6b5e54] hover:bg-[#f3ece4] hover:text-[#2d2926] hover:border-[#c4a093] transition-colors text-left focus:outline-none focus:ring-2 focus:ring-[#c4a093] focus:ring-offset-2"
              aria-label={`Select: ${option.label}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-12 flex justify-center gap-2">
          {QUIZ_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 w-8 rounded-full transition-colors ${
                idx <= currentStep ? "bg-[#c4a093]" : "bg-[#e8e0d8]"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
