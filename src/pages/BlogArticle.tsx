import { useParams, Link } from "react-router-dom";
import { getPostBySlug } from "../data/posts";

/**
 * Individual blog article page.
 * Renders rich body copy, author, date, and a BlogPosting JSON-LD schema.
 */
export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const post = getPostBySlug(slug ?? "");

  if (!post) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-center px-6">
        <div>
          <h1 className="font-['Cormorant_Garamond',serif] text-3xl text-[#2d2926] mb-4">
            Article Not Found
          </h1>
          <Link to="/blog" className="text-sm text-[#c4a093] hover:underline">
            ← Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `https://lumiere-candles.com${post.coverImage}`,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Lumière",
      logo: { "@type": "ImageObject", url: "https://lumiere-candles.com/logo.png" },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://lumiere-candles.com/blog/${post.slug}`,
    },
  };

  return (
    <>
      <title>{post.title} — Lumière Journal</title>
      <meta name="description" content={post.excerpt} />
      <script
        type="application/ld+json"
        id="blog-posting-jsonld"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-3xl px-6 py-16">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-[11px] text-[#9a8d82]" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#c4a093] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-[#c4a093] transition-colors">Journal</Link>
          <span>/</span>
          <span className="text-[#6b5e54]">{post.title}</span>
        </nav>

        {/* Category + Meta */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#e8e0d8] px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-[#c4a093]">
            {post.category.replace("-", " ")}
          </span>
          <span className="text-[11px] text-[#9a8d82]">
            {new Date(post.publishedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="text-[#e8e0d8]">·</span>
          <span className="text-[11px] text-[#9a8d82]">{post.readingTimeMinutes} min read</span>
        </div>

        {/* Title */}
        <h1 className="font-['Cormorant_Garamond',serif] text-4xl md:text-5xl font-medium text-[#2d2926] leading-tight mb-6">
          {post.title}
        </h1>

        <p className="text-base text-[#6b5e54] leading-relaxed mb-8 italic">{post.excerpt}</p>

        {/* Cover image */}
        <div className="mb-10 overflow-hidden rounded-xl">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full aspect-[16/9] object-cover"
          />
        </div>

        {/* By-line */}
        <div className="mb-10 flex items-center gap-3 border-b border-[#e8e0d8] pb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c4a093] text-white text-sm font-semibold">
            {post.author.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-[#2d2926]">{post.author}</p>
            <p className="text-[11px] text-[#9a8d82]">Lumière Editorial</p>
          </div>
        </div>

        {/* Body — render markdown-style paragraphs */}
        <div className="prose prose-sm max-w-none text-[#4a3f37]">
          {post.body.split("\n\n").map((para: string, i: number) => {
            if (para.startsWith("**") && para.endsWith("**")) {
              return (
                <h3
                  key={i}
                  className="font-['Cormorant_Garamond',serif] text-xl font-semibold text-[#2d2926] mt-8 mb-3"
                >
                  {para.replace(/\*\*/g, "")}
                </h3>
              );
            }
            // Replace inline **bold** markers
            const formatted = para.replace(
              /\*\*(.+?)\*\*/g,
              "<strong>$1</strong>",
            );
            return (
              <p
                key={i}
                className="mb-5 leading-[1.85] text-[15px]"
                dangerouslySetInnerHTML={{ __html: formatted }}
              />
            );
          })}
        </div>

        {/* Back link */}
        <div className="mt-16 border-t border-[#e8e0d8] pt-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-[#c4a093] hover:text-[#a8877b] transition-colors"
          >
            ← Back to Journal
          </Link>
        </div>
      </article>
    </>
  );
}
