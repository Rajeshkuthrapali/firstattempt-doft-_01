import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-warm-ivory">
      <div className="text-center px-6 max-w-md">
        <p className="heading-hero-display text-brass-gold">
          404
        </p>
        <h1 className="heading-l text-ink mt-4">
          Page not found
        </h1>
        <p className="body text-muted mt-4 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
          Perhaps try a different path, or browse our collections.
        </p>
        <div className="mt-10 h-px w-16 bg-hairline mx-auto" />
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/collections"
            className="micro uppercase tracking-[0.08em] text-ink hover:underline underline-offset-4"
          >
            Browse Collections
          </Link>
          <span className="text-muted">&middot;</span>
          <Link
            to="/"
            className="micro uppercase tracking-[0.08em] text-ink hover:underline underline-offset-4"
          >
            Return Home
          </Link>
        </div>
      </div>
    </section>
  );
}
