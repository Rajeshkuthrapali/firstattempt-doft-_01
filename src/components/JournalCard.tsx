import { Link } from "react-router-dom";
import type { JournalArticle } from "../data/journal";

interface JournalCardProps {
  article: JournalArticle;
}

export function JournalCard({ article }: JournalCardProps) {
  return (
    <Link
      to={`/journal/${article.slug}`}
      className="group block"
      aria-label={`Read ${article.title}`}
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-warm-sand">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
        />
      </div>

      {/* Content */}
      <div className="pt-6 space-y-3">
        {/* Category + Date row */}
        <div className="flex items-center gap-3">
          <span className="micro uppercase tracking-[0.15em] text-brass-gold">
            {article.category}
          </span>
          <span className="w-px h-3 bg-hairline" aria-hidden="true" />
          <span className="caption text-muted">
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Title */}
        <h3 className="heading-m text-ink group-hover:text-brass-gold transition-colors duration-300">
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="body text-dark leading-relaxed line-clamp-2">
          {article.excerpt}
        </p>

        {/* Meta + Read more */}
        <div className="flex items-center justify-between pt-2">
          <span className="caption text-light">
            {article.readingTime} min read
          </span>
          <span className="caption text-brass-gold flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
            Read more
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
