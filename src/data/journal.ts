export interface JournalArticle {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  publishedAt: string;
  readingTime: number;
  author: string;
  featured?: boolean;
}

export const journalArticles: JournalArticle[] = [
  {
    slug: "art-of-candle-making",
    title: "The Art of Candle Making",
    excerpt:
      "From wax selection to wick choice, discover the patience and precision behind every hand-poured Lumière candle.",
    category: "Craft",
    image: "/golden-hour.png",
    publishedAt: "2026-03-15",
    readingTime: 5,
    author: "Elena Voss",
    featured: true,
    content: `
      <p>Every candle begins as an idea — a mood, a memory, a particular quality of light that someone wants to recreate. At Lumière, the process from idea to finished candle takes three weeks and involves nine separate pairs of hands.</p>
      <p>The result is an object that carries intention. Each candle we produce is a collaboration between the perfumer who composed the fragrance, the chandler who perfected the pour, and the person who will eventually strike the match. This chain of care is what elevates a candle from commodity to ritual object.</p>
      <h2>Choosing the wax</h2>
      <p>We use 100% natural soy wax, sourced from non-GMO suppliers. Soy wax burns slower and cleaner than paraffin, produces minimal soot, and carries fragrance evenly throughout the burn. We tested seven types of wax before settling on our current blend, which we developed in collaboration with a master chandler in Jaipur.</p>
      <p>The wax must also be compatible with our fragrance load. Some waxes can hold more fragrance oil than others; ours is formulated to carry up to 10% fragrance oil by weight, which is roughly double the industry standard for soy candles.</p>
      <h2>The pour</h2>
      <p>Temperature control is critical. If the wax is too hot, it can separate from the fragrance oil. If it's too cool, it won't set evenly. We heat our wax to precisely 175°F, add fragrance oil at 165°F, and pour at 155°F. Each pour is done by hand — no machines, no automation.</p>
      <p>Our artisans work in small batches of 24 candles at a time. This allows them to monitor each pour individually and make micro-adjustments as needed. It is painstaking work, but the consistency of the finished product justifies every moment of attention.</p>
      <blockquote class="pull-quote">A candle is not simply wax and wick — it is a vessel for light, a repository of memory, a small act of daily devotion.</blockquote>
      <h2>Curing</h2>
      <p>After pouring, candles cure for 48 hours before their first test burn. During this time, the wax crystallises and the fragrance binds with the wax molecules. A proper cure is what gives a Lumière candle its even burn and consistent scent throw from first light to last.</p>
      <p>We burn one candle from every batch in our testing studio. If the burn pool, scent throw, or flame height deviates from our standards, the entire batch is melted down and re-poured. This rarely happens — but the protocol exists for a reason.</p>
      <h2>The finishing</h2>
      <p>Once cured and tested, each candle is trimmed by hand, fitted with a brass-gold lid, and wrapped in tissue. The label is applied by hand, aligned to within millimetres. Every detail matters because every detail is noticed.</p>
      <p>The result is a candle that burns for its stated duration, fragrances a room without overwhelming it, and looks as good unlit as it does in flame.</p>
    `,
  },
  {
    slug: "notes-on-fragrance",
    title: "Notes on Fragrance: A Beginner's Guide",
    excerpt:
      "Understanding top, heart, and base notes — and how to choose a scent that feels like you.",
    category: "Fragrance",
    image: "/midnight-oud.png",
    publishedAt: "2026-02-20",
    readingTime: 4,
    author: "Maya Chen",
    featured: false,
    content: `
      <p>Fragrance is often described in musical terms — notes, chords, compositions. This isn't just poetry; it's chemistry. Every scent is built in three layers that unfold over time, like a story with a beginning, middle, and end.</p>
      <p>Understanding these layers will change how you choose candles. Instead of picking by name or packaging alone, you will begin to read fragrance profiles the way a wine drinker reads a label — with curiosity and a growing vocabulary.</p>
      <h2>Top notes</h2>
      <p>These are the molecules you smell first — light, volatile, and fleeting. Citrus, herbs, and light florals are common top notes. They last 5-15 minutes and create the first impression of a fragrance. Think of them as the handshake: quick, memorable, and soon replaced by something deeper.</p>
      <h2>Heart notes</h2>
      <p>As the top notes fade, the heart emerges. This is the core of the fragrance, lasting 2-4 hours. Floral, spicy, and fruity notes typically occupy the heart. A well-composed heart note should feel like the natural evolution of the top, not a departure from it.</p>
      <blockquote class="pull-quote">A fragrance is not a single note but a conversation — between the perfumer and the wearer, between memory and the present moment.</blockquote>
      <h2>Base notes</h2>
      <p>The foundation. Base notes are heavy, long-lasting molecules (woods, resins, musks) that can persist for 6-8 hours or more. They anchor the lighter notes above them and give a fragrance its depth and longevity.</p>
      <p>When choosing a candle, consider which layer matters most to you. If you want an immediate impression, follow the top notes. If you want a scent that lingers, look to the base. The best candles, like the best fragrances, are beautiful at every stage of their unfolding.</p>
    `,
  },
  {
    slug: "creating-atmosphere",
    title: "Creating Atmosphere: Light + Scent",
    excerpt:
      "How candlelight and fragrance work together to transform a room from functional to intentional.",
    category: "Lifestyle",
    image: "/hero-candle.png",
    publishedAt: "2026-01-10",
    readingTime: 3,
    author: "Elena Voss",
    featured: false,
    content: `
      <p>Light and scent are the two fastest ways to change how a room feels. Together, they create atmosphere — that intangible quality that makes a space feel intentional rather than accidental.</p>
      <p>We believe that a home should never feel finished. It should always feel like it is becoming — a space shaped by the light that falls through its windows, the objects on its shelves, and the scents that linger in its air.</p>
      <h2>The quality of candlelight</h2>
      <p>Unlike electric light, candlelight flickers. This micro-movement is what makes it feel alive. The human eye is drawn to flickering light; it signals warmth, safety, and presence. A single candle can change the entire mood of a room without changing anything visible about it.</p>
      <p>This is not romanticism — it is biology. Our circadian rhythms evolved under the warm, dynamic light of fire. Electric light is flat by comparison. When we light a candle, we are returning to an older, deeper relationship with illumination.</p>
      <h2>Choosing a scent for the moment</h2>
      <p>Different scents suit different times of day and different activities. Citrus and herbal scents work well for morning and focus. Floral and green scents suit afternoon relaxation. Woody and amber scents are natural evening choices, helping the mind transition from activity to rest.</p>
      <blockquote class="pull-quote">A room is just a room until you fill it with light and scent — then it becomes a place.</blockquote>
      <h2>The ritual</h2>
      <p>Lighting a candle can be a deliberate act — a signal to yourself and others that the space is now in a different mode. The simple ritual of striking a match, watching the flame catch the wick, and placing the candle in its chosen spot is itself a form of mindfulness.</p>
      <p>We recommend keeping at least three candles in rotation: one for focus (citrus or herbal), one for relaxation (floral or green), and one for evening (woody or amber). Rotate them based on your mood and the time of day.</p>
    `,
  },
  {
    slug: "sustainable-luxury",
    title: "Sustainable Luxury: Crafting Consciously",
    excerpt:
      "Why sustainability and luxury are not opposing forces — and how we approach both with equal rigour.",
    category: "Craft",
    image: "/golden-hour.png",
    publishedAt: "2026-04-02",
    readingTime: 6,
    author: "Maya Chen",
    featured: false,
    content: `
      <p>There is a misconception that luxury and sustainability exist in opposition — that one must choose between beauty and conscience. We have never found this to be true. The most beautiful objects are almost always the most carefully made, and care is the foundation of sustainability.</p>
      <p>At Lumière, we define luxury not by excess but by intentionality. A luxury object is one that has been thought through at every stage: where its materials come from, who made it, how long it will last, and what happens when it is finally spent.</p>
      <h2>Materials</h2>
      <p>Our wax is 100% natural soy, grown without GMOs. Our fragrance oils are phthalate-free and developed in partnership with perfumers who share our commitment to clean ingredients. Our glass vessels are designed to be refilled — we offer a returns programme that cleans, sterilises, and refills each vessel up to five times.</p>
      <h2>Packaging</h2>
      <p>We eliminated all single-use plastics from our packaging in 2025. Our boxes are made from FSC-certified cardstock, our tissue paper is acid-free and compostable, and our shipping labels are printed on recycled paper. Even our tape is paper-based.</p>
      <blockquote class="pull-quote">Sustainability is not a compromise — it is a design constraint that produces better results.</blockquote>
      <h2>The long view</h2>
      <p>We design for longevity. A Lumière candle should be kept, not discarded. The vessel should find a second life as a planter, a pencil holder, or a small vase. The lid should become a coaster or a trinket dish. Every element of our product is intended to outlive its first purpose.</p>
      <p>This is what we mean by sustainable luxury: objects so well considered that you would never think to throw them away.</p>
    `,
  },
  {
    slug: "winter-notes",
    title: "Winter Notes: Scents for the Dark Months",
    excerpt:
      "The fragrances that carry us through winter — warm, deep, and built for hibernation.",
    category: "Fragrance",
    image: "/midnight-oud.png",
    publishedAt: "2025-12-01",
    readingTime: 4,
    author: "Elena Voss",
    featured: false,
    content: `
      <p>Winter changes how we experience scent. The cold air is thinner, drier — it carries fragrance differently than the humid air of summer. Our noses are more sensitive to warmth, which is why winter fragrances lean toward the deep and the resinous.</p>
      <p>This is the season of hibernation, of turning inward. The scents we choose should honour that inward turn.</p>
      <h2>Tobacco and leather</h2>
      <p>These are the great winter notes — warm, dry, and slightly sweet. They evoke libraries, armchairs, and wool blankets. A tobacco note in a candle can make a room feel instantly cosy, like walking into a study where a fire has been burning for hours.</p>
      <h2>Amber and vanilla</h2>
      <p>Amber is not a single ingredient but a blend — typically labdanum, vanilla, and benzoin. It is warm, powdery, and golden. Vanilla adds sweetness without cloying. Together, they create a scent that feels like being wrapped in cashmere.</p>
      <blockquote class="pull-quote">Winter is not a season to endure — it is an invitation to nest, to rest, to gather around small sources of warmth.</blockquote>
      <h2>Wood and smoke</h2>
      <p>Cedar, sandalwood, and a whisper of smoke. These are the notes that ground a winter fragrance, that give it structure and longevity. They are the bassline beneath the melody of sweeter notes.</p>
      <p>Our winter collection is designed to be layered — light a woody amber in the living room and a tobacco-vanilla in the bedroom. Let the scents mingle in the hallway. This is how you fragrance a home for the darkest months.</p>
    `,
  },
  {
    slug: "gift-of-presence",
    title: "The Gift of Presence: Giving Candles Intentionally",
    excerpt:
      "Why a candle is never just a candle — and how to choose one that carries meaning.",
    category: "Lifestyle",
    image: "/hero-candle.png",
    publishedAt: "2025-11-15",
    readingTime: 3,
    author: "Maya Chen",
    featured: false,
    content: `
      <p>A candle is one of the most thoughtful gifts you can give. It is not just an object — it is an invitation to pause, to create a moment of stillness in a life that moves too fast.</p>
      <p>When you give someone a candle, you are giving them permission to stop. To light a match. To watch the flame settle. To breathe. In a world that demands constant productivity, that permission is a rare and precious thing.</p>
      <h2>Choosing for the recipient</h2>
      <p>The best candle gifts are chosen with the recipient's space and habits in mind. Do they work from home? A citrus or herbal scent supports focus. Do they love long baths? Floral or green notes create a spa-like atmosphere. Are they evening people? Woody or amber scents help with wind-down.</p>
      <h2>Presentation matters</h2>
      <p>We wrap every Lumière candle in tissue and ribbon, but we encourage our customers to add their own touch — a handwritten note, a favourite matchbook, a small tray to set the candle on. The ritual of unwrapping should feel as deliberate as the ritual of lighting.</p>
      <blockquote class="pull-quote">The best gifts are not things but moments — a candle is simply the excuse for one.</blockquote>
      <h2>A gift that keeps giving</h2>
      <p>After the candle has burned, the vessel remains — a small ceramic or glass object that can be refilled, repurposed, or remembered by. A candle is not a consumable; it is the beginning of something. A memory. A habit. A small daily ritual that outlasts the wax.</p>
    `,
  },
];
