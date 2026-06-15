import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { journalArticles } from "../data/journal";
import PageTransition from "../components/PageTransition";

export default function JournalArticle() {
  const { slug } = useParams<{ slug: string }>();
  const article = journalArticles.find((a) => a.slug === slug);

  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return journalArticles
      .filter(
        (a) =>
          a.slug !== article.slug &&
          (a.category === article.category || a.featured),
      )
      .slice(0, 3);
  }, [article]);

  if (!article) {
    return (
      <PageTransition>
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="heading-l text-ink">Article not found</h1>
          <Link
            to="/journal"
            className="mt-4 inline-block body text-brass-gold hover:underline"
          >
            Back to Journal
          </Link>
        </div>
      </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
    <article>
      {/* ── Back link ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 pt-8">
        <Link
          to="/journal"
          className="inline-flex items-center gap-1.5 caption text-muted hover:text-brass-gold transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          Back to Journal
        </Link>
      </div>

      {/* ── Hero Image with Overlay ─────────────────────────────── */}
      <div className="relative mt-4 mx-auto max-w-7xl px-6">
        <div className="relative aspect-[21/9] overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="img-overlay-gradient" />
        </div>
      </div>

      {/* ── Article Header ──────────────────────────────────────── */}
      <div className="mx-auto max-w-[680px] px-6">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-10 mb-4">
          <span className="micro uppercase tracking-[0.15em] text-brass-gold">
            {article.category}
          </span>
          <span className="w-px h-3 bg-hairline" aria-hidden="true" />
          <span className="caption text-muted">
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="w-px h-3 bg-hairline" aria-hidden="true" />
          <span className="caption text-muted">
            {article.readingTime} min read
          </span>
          <span className="w-px h-3 bg-hairline" aria-hidden="true" />
          <span className="caption text-muted">By {article.author}</span>
        </div>

        {/* Title */}
        <h1 className="heading-xl text-ink">{article.title}</h1>

        {/* Share buttons */}
        <div className="flex items-center gap-4 mt-6 pb-8 border-b border-hairline">
          <span className="tiny text-light tracking-[0.12em] uppercase">
            Share
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
            className="caption text-muted hover:text-brass-gold transition-colors flex items-center gap-1.5"
            aria-label="Copy article link"
          >
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
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Copy link
          </button>
          <a
            href={`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(window.location.href)}`}
            className="caption text-muted hover:text-brass-gold transition-colors flex items-center gap-1.5"
            aria-label="Share via email"
          >
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
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Email
          </a>
        </div>
      </div>

      {/* ── Article Content ─────────────────────────────────────── */}
      <div className="mx-auto max-w-[680px] px-6">
        <div
          className="mt-10 prose-article text-dark"
          dangerouslySetInnerHTML={{
            __html: article.content.replace(
              /<p>/,
              '<p class="has-dropcap">',
            ),
          }}
        />
      </div>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[680px] px-6 my-16">
        <div className="section-separator" />
        <div className="flex items-center justify-between mt-4">
          <span className="tiny text-light uppercase tracking-[0.12em]">
            {article.category}
          </span>
          <span className="caption text-muted">
            Words by {article.author}
          </span>
        </div>
      </div>

      {/* ── Related Articles ─────────────────────────────────────── */}
      {relatedArticles.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-section">
          <div className="mb-10">
            <h2 className="heading-l text-ink">Further reading</h2>
            <div className="mt-2 w-12 h-px bg-brass-gold" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                to={`/journal/${related.slug}`}
                className="group block"
              >
                <div className="aspect-[4/3] overflow-hidden bg-warm-sand">
                  <img
                    src={related.image}
                    alt={related.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <span className="micro uppercase tracking-[0.15em] text-brass-gold">
                    {related.category}
                  </span>
                  <h3 className="heading-s text-ink group-hover:text-brass-gold transition-colors duration-300">
                    {related.title}
                  </h3>
                  <p className="body-small text-dark leading-relaxed line-clamp-2">
                    {related.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
    </PageTransition>
  );
}
