/**
 * Static blog/editorial post data for the Lumière journal.
 * In future this can be replaced with a Sanity CMS fetch or any headless CMS.
 */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  author: string;
  category: "lifestyle" | "behind-the-scenes" | "gifting" | "scent-guide";
  body: string;
  readingTimeMinutes: number;
}

export const posts: BlogPost[] = [
  {
    slug: "the-art-of-slow-living",
    title: "The Art of Slow Living: How Scent Shapes Your Space",
    excerpt:
      "In a world of constant motion, a single candle flame can become the anchor that brings you home. We explore the ritual of slow living and how fragrance transforms a house into a sanctuary.",
    coverImage: "/golden-hour.png",
    publishedAt: "2026-03-10",
    author: "Priya Mehra",
    category: "lifestyle",
    readingTimeMinutes: 5,
    body: `There is something quietly radical about choosing to slow down. About setting the table properly, brewing tea with intention, and lighting a candle not because you need the light — but because you want the warmth.

At Lumière, we believe fragrance is one of the fastest paths to presence. The olfactory system is the only sense that connects directly to the limbic brain — the seat of memory and emotion. A single whiff of amber and vanilla and you are transported: to a grandmother's kitchen, a mountain cabin, a evening in Goa that you never quite got over.

**Building your scent ritual**

Begin simply. Choose one candle for your morning routine and one for the evening. Let the morning scent be something crisp and clarifying — our Cedarwood Bliss, perhaps, with its brightening bergamot top note. Reserve the deeper, smokier Midnight Oud for the slow hours after dinner.

Over time, your nervous system will learn to associate these scents with the invitation to shift gears. This is the power of scent conditioning — a gentle, non-coercive way to guide yourself back to the present.

**The light itself**

Never underestimate what the flame does. In a world lit by screens at 6500K, the warm glow of a candle flame — approximately 1900K — is a physiological signal to your body that evening has arrived. Melatonin begins to rise. Breath deepens. The day releases its grip.

Slow living is not an aesthetic. It is a practice. And like all practices, it begins with a small, repeatable act. Tonight, light a candle. See what unfolds.`,
  },
  {
    slug: "behind-the-pour-our-process",
    title: "Behind the Pour: Inside Our Candle-Making Process",
    excerpt:
      "Every Lumière candle passes through twelve hands before it reaches yours. We pull back the curtain on the craft, the ingredients, and the exacting standards that define our signature quality.",
    coverImage: "/cedarwood-bliss.png",
    publishedAt: "2026-02-28",
    author: "Anika Sharma",
    category: "behind-the-scenes",
    readingTimeMinutes: 7,
    body: `It begins with the wax.

We use 100% natural soy wax — not the blended paraffin-soy mixes that flood the mass market, but certified single-origin soy, traceable to farms that practise regenerative agriculture. Soy wax burns cooler than paraffin, releasing fragrance more gently and producing minimal soot. Your lungs notice the difference, even if your nose does not immediately.

**The fragrance labs**

Our perfumers — based in both Mumbai and Grasse — work to briefs that read more like poetry than chemistry. For Golden Hour, the brief was: "The last twenty minutes of a Mediterranean sunset. Warmth, not heat. Sweetness without saccharine." It took eleven months and forty-three iterations to arrive at the final accord.

Each fragrance is tested for cold throw (how it smells unlit), hot throw (during burning), and longevity. We insist on a minimum of 50 hours of consistent scent performance — a threshold most commercial candles do not meet.

**The vessel**

We pour into hand-thrown ceramic vessels, each with subtle irregularities that are a feature, not a flaw. The glaze is food-safe and the vessels are designed to be used as planters, spice pots, or drinking cups once the wax is spent. Because a Lumière candle should outlast its flame.

**The people**

Behind every candle is a team of twelve: farmers, chemists, ceramicists, pourers, quality checkers, and packagers. Many of our pourers are women from Dharavi's artisan cooperatives who were previously employed in the garment industry. We pay above-industry wages and offer health cover and childcare subsidies.

This is what we mean when we say *luxury with a conscience*.`,
  },
  {
    slug: "the-perfect-gifting-guide",
    title: "The Perfect Gift: How to Choose a Candle for Someone You Love",
    excerpt:
      "Gifting a candle is an act of intimacy — you are choosing a scent that will fill someone else's home. Here is our guide to getting it beautifully right.",
    coverImage: "/velvet-rose.png",
    publishedAt: "2026-02-14",
    author: "Priya Mehra",
    category: "gifting",
    readingTimeMinutes: 4,
    body: `A candle says: *I thought about your home. I thought about how you rest.*

It is one of the few gifts that asks to be used rather than kept. And when used, it fills a room — and therefore a life — with something you chose.

**Know your recipient's scent personality**

Some people are drawn to clean, green, woody scents — the olfactory equivalent of a forest walk. Cedarwood Bliss or a fresh fig fragrance would suit them well. Others live in the warm and oriental — amber, oud, vanilla, musk. These are the people who layer perfumes and keep their homes dimly lit and full of velvet cushions. Midnight Oud was made for them.

If you are unsure, default to a floral-neutral — something like Velvet Rose, which is romantic but not polarising. Or choose a limited-edition piece: the rarity carries its own message.

**The packaging matters**

All Lumière candles ship in our signature kraft-and-ribbon box. If you'd like to add a handwritten note, use our gift-wrapping option at checkout — we'll include a cream card with your message in copper ink.

**When in doubt, give the story**

Sometimes the most meaningful gift is not the most expensive one. Our Cedarwood Bliss, at ₹1,999, comes with a card that tells the story of the scent — the cedar forest in Himachal Pradesh that inspired it, the bergamot groves of Calabria. It is an invitation to imagine.

That, finally, is what a good gift does. It invites.`,
  },
  {
    slug: "understanding-fragrance-notes",
    title: "Top, Middle, Base: Understanding Fragrance Notes",
    excerpt:
      "Why does a candle smell different when you first light it versus an hour in? A beginner's guide to fragrance construction and what it means for your home.",
    coverImage: "/jasmine-noir.png",
    publishedAt: "2026-01-20",
    author: "Anika Sharma",
    category: "scent-guide",
    readingTimeMinutes: 6,
    body: `Every complex fragrance is a story told in three acts.

**The top notes** are what you smell first — bright, volatile molecules that evaporate within 15–30 minutes. Citrus, light herbs, fresh greenery. In Jasmine Noir, the top note is a whisper of black pepper that gives way almost immediately to the floral heart.

**The heart notes** (or middle notes) are the soul of the fragrance. They emerge as the top notes fade and constitute the majority of the scent experience. In Jasmine Noir, these are the night-blooming jasmine petals — heavy, indolic, feminine, and unapologetically romantic.

**The base notes** provide depth and longevity. They are large, slow-evaporating molecules — musks, resins, woods, ambers. They linger long after the candle is extinguished. In Jasmine Noir, white musk anchors the florals and gives the fragrance its signature silkiness.

**In a candle, this architecture differs from a perfume**

Because a candle's fragrance is delivered via heat and air rather than skin chemistry, the dynamics change. The wax temperature, wick size, and pour density all affect how quickly the fragrance molecules are released. This is why a Lumière candle smells different in a small bathroom versus a large living room — and why we test each in both environments.

**Practical tip: the first burn**

Always burn your candle long enough for the melt pool to reach the edge of the vessel — typically 2–3 hours for our 280g candles. This prevents tunnelling and ensures the wax heats evenly, releasing the full fragrance spectrum. A candle that tunnels will never show you its base notes.

Now you know what to look for. Light one tonight and listen to the whole story.`,
  },
];

/**
 * Looks up a blog post by slug.
 * @param slug - The URL-safe post slug.
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
