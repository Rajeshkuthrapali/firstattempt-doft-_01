import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPosts } from "../lib/sanity";

const categoryLabels: Record<string, string> = {
  lifestyle: "Lifestyle",
  "behind-the-scenes": "Behind the Scenes",
  gifting: "Gifting",
  "scent-guide": "Scent Guide",
};

/**
 * Blog index page — editorial journal for Lumière.
 * Showcases brand storytelling for SEO and lifestyle positioning.
 */
export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm uppercase tracking-widest text-[#9a8d82]">Loading Journal...</p>
      </div>
    );
  }

  const sorted = [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  const [featured, ...rest] = sorted;

  return (
    <>
      <title>Journal — Lumière Candles</title>
      <meta
        name="description"
        content="The Lumière Journal — stories about slow living, fragrance, and the craft behind every candle."
      />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Lumière Journal",
        description: "Stories about slow living, fragrance, and craft.",
        url: "https://lumiere-candles.com/blog",
        publisher: {
          "@type": "Organization",
          name: "Lumière",
          logo: { "@type": "ImageObject", url: "https://lumiere-candles.com/logo.png" },
        },
      })}</script>

      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Header */}
        <header className="mb-14 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4a093] mb-3">
            ✦ The Lumière Journal
          </p>
          <h1 className="font-['Cormorant_Garamond',serif] text-5xl font-medium text-[#2d2926]">
            Stories of Scent
          </h1>
          <p className="mt-4 text-sm text-[#6b5e54] max-w-md mx-auto">
            Slow living, craftsmanship, and the philosophy behind every flame we light.
          </p>
        </header>

        {/* Featured post */}
        {featured && (
          <Link
            to={`/blog/${featured.slug}`}
            className="group mb-16 grid md:grid-cols-2 gap-8 items-center rounded-xl overflow-hidden bg-[#f3ece4] hover:shadow-lg transition-shadow"
          >
            <div className="overflow-hidden">
              <img
                src={featured.coverImage}
                alt={featured.title}
                className="h-72 md:h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8 md:p-10 flex flex-col gap-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#c4a093]">
                {categoryLabels[featured.category]}
              </span>
              <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2d2926] group-hover:text-[#c4a093] transition-colors leading-snug">
                {featured.title}
              </h2>
              <p className="text-sm text-[#6b5e54] leading-relaxed">{featured.excerpt}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[11px] text-[#9a8d82]">By {featured.author}</span>
                <span className="text-[#e8e0d8]">·</span>
                <span className="text-[11px] text-[#9a8d82]">
                  {new Date(featured.publishedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="text-[#e8e0d8]">·</span>
                <span className="text-[11px] text-[#9a8d82]">{featured.readingTimeMinutes} min read</span>
              </div>
            </div>
          </Link>
        )}

        {/* Post grid */}
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {rest.map((post) => (
            <li key={post.slug}>
              <Link
                to={`/blog/${post.slug}`}
                className="group flex flex-col rounded-lg overflow-hidden border border-[#e8e0d8] hover:border-[#c4a093] hover:shadow-md transition-all"
              >
                <div className="overflow-hidden bg-[#f3ece4]">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    loading="lazy"
                    className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex flex-col gap-2 p-5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#c4a093]">
                    {categoryLabels[post.category]}
                  </span>
                  <h2 className="font-['Cormorant_Garamond',serif] text-xl font-medium text-[#2d2926] group-hover:text-[#c4a093] transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-xs text-[#6b5e54] line-clamp-2 leading-relaxed">{post.excerpt}</p>
                  <p className="mt-2 text-[10px] text-[#9a8d82]">
                    {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    · {post.readingTimeMinutes} min read
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
