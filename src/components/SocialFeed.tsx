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

interface SocialTile {
  id: string;
  image: string;
  alt: string;
  href: string;
}

const tiles: SocialTile[] = [
  { id: "s1", image: "/golden-hour.png", alt: "Golden Hour candle on marble", href: "https://instagram.com/lumiere.candles" },
  { id: "s2", image: "/midnight-oud.png", alt: "Midnight Oud matte black vessel", href: "https://instagram.com/lumiere.candles" },
  { id: "s3", image: "/cedarwood-bliss.png", alt: "Cedarwood Bliss in morning light", href: "https://instagram.com/lumiere.candles" },
  { id: "s4", image: "/winter-spice.png", alt: "Winter Spice seasonal collection", href: "https://instagram.com/lumiere.candles" },
  { id: "s5", image: "/jasmine-noir.png", alt: "Jasmine Noir limited edition", href: "https://instagram.com/lumiere.candles" },
  { id: "s6", image: "/velvet-rose.png", alt: "Velvet Rose gift wrap", href: "https://instagram.com/lumiere.candles" },
];

/**
 * Lifestyle social media grid with Instagram-style hover overlay.
 * Uses static local images — see top-of-file comment for live API integration.
 */
export default function SocialFeed() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16" aria-labelledby="social-feed-heading">
      <div className="mb-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4a093] mb-2">✦</p>
        <h2
          id="social-feed-heading"
          className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2d2926]"
        >
          Life by Candlelight
        </h2>
        <p className="mt-2 text-sm text-[#6b5e54]">
          Follow us{" "}
          <a
            href="https://instagram.com/lumiere.candles"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c4a093] hover:underline"
            aria-label="Follow Lumière on Instagram (opens in a new tab)"
          >
            @lumiere.candles
          </a>
        </p>
      </div>

      <ul
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2"
        role="list"
        aria-label="Instagram lifestyle photos"
      >
        {tiles.map((tile) => (
          <li key={tile.id}>
            <a
              href={tile.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden rounded-sm aspect-square bg-[#f3ece4]"
              aria-label={`View on Instagram: ${tile.alt}`}
            >
              <img
                src={tile.image}
                alt={tile.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Instagram icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                </svg>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
