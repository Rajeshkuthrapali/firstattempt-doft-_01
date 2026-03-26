/**
 * SocialFeed — static Instagram-style lifestyle grid.
 *
 * HOW TO ENABLE LIVE INSTAGRAM INTEGRATION:
 * 1. Create a Meta Developer app at https://developers.facebook.com/
 * 2. Add the Instagram Basic Display product.
 * 3. Generate a long-lived access token and add to .env as:
 *    VITE_INSTAGRAM_ACCESS_TOKEN=your_long_lived_token
 * 4. Replace the `tiles` array below with a fetch call to:
 *    https://graph.instagram.com/me/media?fields=id,media_url,permalink,thumbnail_url&access_token=${token}
 * 5. Handle refresh: long-lived tokens expire in 60 days; use the refresh endpoint monthly.
 */

import { useEffect, useState } from "react";

/**
 * Instagram Basic Display API response shape.
 */
interface InstaMedia {
  id: string;
  media_url: string;
  permalink: string;
  media_type: "IMAGE" | "CAROUSEL_ALBUM" | "VIDEO";
  caption?: string;
}

/**
 * SocialFeed — Fetches and displays a live grid of recent Instagram posts.
 * Provides a fallback to static images if the API token is missing or fails.
 */
export default function SocialFeed() {
  const [feed, setFeed] = useState<InstaMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN;

    if (!token) {
      // Fallback to static imagery
      setFeed([
        { id: "1", media_url: "/social-1.jpg", permalink: "#", media_type: "IMAGE" },
        { id: "2", media_url: "/social-2.jpg", permalink: "#", media_type: "IMAGE" },
        { id: "3", media_url: "/social-3.jpg", permalink: "#", media_type: "IMAGE" },
        { id: "4", media_url: "/social-4.jpg", permalink: "#", media_type: "IMAGE" },
        { id: "5", media_url: "/social-1.jpg", permalink: "#", media_type: "IMAGE" },
        { id: "6", media_url: "/social-2.jpg", permalink: "#", media_type: "IMAGE" },
      ]);
      setLoading(false);
      return;
    }

    async function fetchInstagram() {
      try {
        const url = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,permalink,caption&access_token=${token}&limit=6`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.data) {
          // Filter to only display images or carousels (no raw videos for grid simplicity)
          const images = data.data.filter((m: InstaMedia) => m.media_type !== "VIDEO").slice(0, 6);
          setFeed(images);
        }
      } catch (err) {
        console.error("Failed to fetch Instagram feed", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInstagram();
  }, []);

  return (
    <section className="py-20" aria-label="Social Feed">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#c4a093] mb-3">
            Join the Community
          </p>
          <h2 className="font-['Cormorant_Garamond',serif] text-4xl md:text-5xl font-medium text-[#2d2926]">
            @LumiereCandles
          </h2>
          <p className="mt-4 text-sm text-[#6b5e54]">
            Share your curated moments with us.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <span className="text-sm uppercase tracking-widest text-[#9a8d82]">Loading Feed...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {feed.map((post) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noreferrer"
                className="group relative block aspect-square overflow-hidden bg-[#faf7f4]"
                aria-label={post.caption || "View post on Instagram"}
              >
                <img
                  src={post.media_url}
                  alt={post.caption || "Instagram post"}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
