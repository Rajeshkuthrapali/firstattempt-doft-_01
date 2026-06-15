import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { journalArticles } from "../data/journal";
import { JournalCard } from "../components/JournalCard";
import PageTransition from "../components/PageTransition";

const ALL_CATEGORIES = "All";

export default function Journal() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const featured = useMemo(
    () => journalArticles.find((a) => a.featured),
    [],
  );

  const categories = useMemo(() => {
    const cats = new Set(journalArticles.map((a) => a.category));
    return [ALL_CATEGORIES, ...Array.from(cats)];
  }, []);

  const filtered = useMemo(() => {
    if (!activeCategory || activeCategory === ALL_CATEGORIES) {
      return journalArticles.filter((a) => !a.featured);
    }
    return journalArticles.filter(
      (a) => !a.featured && a.category === activeCategory,
    );
  }, [activeCategory]);

  return (
    <PageTransition>
      {/* ── Featured Article Hero ────────────────────────────── */}
      {featured && (
        <section className="relative" data-animate="fade-up">
          <div className="mx-auto max-w-7xl px-6 pt-section pb-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-section">
              {/* Image */}
              <div className="aspect-[4/3] lg:aspect-[5/4] overflow-hidden order-1 lg:order-2">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text */}
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="micro uppercase tracking-[0.15em] text-brass-gold">
                    {featured.category}
                  </span>
                  <span className="w-px h-3 bg-hairline" aria-hidden="true" />
                  <span className="caption text-muted">Featured</span>
                </div>

                <h2 className="heading-hero-display text-ink">
                  {featured.title}
                </h2>

                <p className="mt-4 body-large text-dark leading-relaxed max-w-lg">
                  {featured.excerpt}
                </p>

                <div className="mt-6 flex items-center gap-6">
                  <Link
                    to={`/journal/${featured.slug}`}
                    className="inline-flex items-center gap-2 caption text-brass-gold border-b border-brass-gold pb-0.5 hover:gap-3 transition-all duration-300"
                  >
                    Read the story
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Link>

                  <span className="caption text-light">
                    {featured.readingTime} min read ·{" "}
                    {featured.author}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Journal Header ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-section">
        <div className="text-center mb-12">
          <h1 className="heading-xl text-ink">Journal</h1>
          <p className="mt-3 body text-muted">
            Stories, craft, and the art of fragrance
          </p>
          <div className="mx-auto mt-4 w-12 h-px bg-brass-gold" />
        </div>

        {/* ── Category Filter ────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(cat === activeCategory ? null : cat)
              }
              className={`px-5 py-2.5 micro border transition-colors duration-300 ${
                activeCategory === cat
                  ? "border-ink text-ink bg-warm-sand"
                  : "border-hairline text-muted hover:border-muted hover:text-dark"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Article Grid ───────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
            data-animate="stagger"
          >
            {filtered.map((article) => (
              <div key={article.slug} data-animate-child>
                <JournalCard article={article} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="body text-muted">
              No articles found in this category.
            </p>
            <button
              onClick={() => setActiveCategory(null)}
              className="mt-3 caption text-brass-gold hover:underline"
            >
              View all articles
            </button>
          </div>
        )}
      </section>
    </PageTransition>
  );
}
