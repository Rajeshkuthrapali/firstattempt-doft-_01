import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import PageTransition from "../components/PageTransition";
import { heroReveal } from "../lib/animations";

export default function About() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = document.querySelector("[data-hero-container]");
    let cleanup: gsap.core.Timeline | undefined;

    if (el) {
      cleanup = heroReveal(el);
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min(scrollTop / docHeight, 1));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (cleanup) {
        cleanup.kill();
        // Clear any inline styles the animation may have set
        const heroEl = document.querySelector("[data-hero-container]") as HTMLElement | null;
        if (heroEl) {
          gsap.set(heroEl, { clearProps: "all" });
        }
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <PageTransition>
      {/* Progress indicator */}
      <div
        className="fixed top-0 left-0 z-[100] h-[2px] bg-brass-gold pointer-events-none"
        style={{ width: `${progress * 100}%` }}
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* 1. HERO */}
      <section
        data-hero-container
        className="relative h-[70vh] min-h-[500px] flex items-center justify-center bg-deep-charcoal"
      >
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <p data-hero="headline" className="heading-hero-display text-white">
            Our Story
          </p>
          <p data-hero="subtext" className="mt-6 body text-white/70 max-w-xl mx-auto leading-relaxed">
            Founded on the belief that a space should feel as good as it looks —
            Lumière brings intention to the simple act of lighting a candle.
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-deep-charcoal/60 via-deep-charcoal/30 to-deep-charcoal/80" />
      </section>

      {/* 2. OUR STORY */}
      <section className="mx-auto max-w-3xl px-6 py-section" data-animate="fade-up">
        <p className="micro uppercase tracking-[0.2em] text-brass-gold text-center">
          The Beginning
        </p>
        <h2 className="heading-xl text-ink text-center mt-2">
          From a small studio in Jaipur
        </h2>
        <div className="mx-auto mt-4 w-12 h-px bg-brass-gold" />
        <div className="mt-10 space-y-6 body text-dark leading-relaxed">
          <p>
            Lumière was born from a simple observation: the most memorable spaces
            are never just seen — they are felt. In 2022, our founder set out to
            create candles that didn&apos;t just fill a room with fragrance, but
            filled it with intention.
          </p>
          <p>
            Working with master chandlers in Jaipur, we spent eighteen months
            developing our signature soy wax blend — one that burns evenly,
            carries fragrance without distortion, and leaves no trace behind.
            Every element, from the wick to the vessel, was chosen for its
            contribution to the experience, not its cost.
          </p>
          <p>
            Today, every Lumière candle is still hand-poured in small batches.
            We source our fragrance oils from houses that share our commitment
            to transparency, and we test every batch for burn quality, scent
            throw, and visual harmony.
          </p>
        </div>

        {/* Pull quote */}
        <blockquote className="my-16 text-center max-w-2xl mx-auto border-t border-b border-hairline py-10">
          <p className="heading-m italic text-ink leading-relaxed">
            &ldquo;A candle should never compete with its surroundings. It should
            complete them.&rdquo;
          </p>
        </blockquote>

        <div className="space-y-6 body text-muted leading-relaxed">
          <p>
            We believe in fragrance as atmosphere, not as statement. Our scents
            are designed to sit quietly in a room — present enough to notice,
            subtle enough to never overwhelm. This restraint defines everything
            we make.
          </p>
        </div>
      </section>

      {/* 3. CRAFTSMANSHIP */}
      <section className="bg-deep-charcoal py-section" data-animate="fade-up">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="space-y-6 max-w-lg">
            <p className="micro uppercase tracking-[0.2em] text-brass-gold">
              Craftsmanship
            </p>
            <h2 className="heading-l text-white">
              The art of the slow pour
            </h2>
            <div className="w-10 h-px bg-brass-gold" />
            <p className="body text-white/70 leading-relaxed">
              Each batch is poured by hand at a precise temperature to ensure
              an even surface and optimal fragrance binding. Our wax is heated
              slowly, cooled gradually, and cured for 48 hours before the first
              wick is trimmed.
            </p>
            <p className="body text-white/50 leading-relaxed">
              We reject mass production not as a marketing choice, but because
              it produces an inferior candle. Every Lumière candle is handled
              nine times before it leaves our studio.
            </p>
          </div>
          <div data-animate="image-reveal">
            <img
              src="/golden-hour.png"
              alt="Hand-pouring soy wax into a candle vessel"
              className="w-full h-[450px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* 4. FOUNDER'S NOTE */}
      <section className="py-section" data-animate="fade-up">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="micro uppercase tracking-[0.2em] text-brass-gold">
            A Note from Our Founder
          </p>
          <blockquote className="mt-8">
            <p className="heading-s italic text-ink leading-relaxed">
              &ldquo;We make candles for people who notice the quality of light
              in a room before they notice anything else.&rdquo;
            </p>
          </blockquote>
          <div className="mt-6 w-10 h-px bg-brass-gold mx-auto" />
          <p className="mt-6 caption text-dark uppercase tracking-[0.1em]">
            — Ananya, Founder
          </p>
        </div>
      </section>

      {/* 5. VALUES */}
      <section className="bg-warm-sand py-section" data-animate="fade-up">
        <div className="mx-auto max-w-7xl px-6">
          <p className="micro uppercase tracking-[0.2em] text-brass-gold text-center">
            What We Stand For
          </p>
          <h2 className="heading-l text-ink text-center mt-2">
            Our Values
          </h2>
          <div className="mx-auto mt-4 w-12 h-px bg-brass-gold" />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { title: "Integrity", desc: "Honest ingredients, honest pricing. No greenwashing, no shortcuts." },
              { title: "Craft", desc: "Every candle is made by hand, inspected, and approved before it ships." },
              { title: "Restraint", desc: "We say no to more than we say yes to. Every element earns its place." },
              { title: "Sustainability", desc: "Eco-conscious packaging, natural materials, minimal waste." },
            ].map(({ title, desc }) => (
              <div key={title} className="space-y-3">
                <h3 className="heading-s text-ink">{title}</h3>
                <p className="body text-dark leading-relaxed max-w-[220px] mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. JOIN US */}
      <section className="py-section text-center" data-animate="fade-up">
        <div className="mx-auto max-w-2xl px-6">
          <p className="micro uppercase tracking-[0.2em] text-brass-gold">
            Join Our World
          </p>
          <h2 className="heading-l text-ink mt-2">
            Be the first to know
          </h2>
          <div className="mx-auto mt-4 w-12 h-px bg-brass-gold" />
          <p className="body text-dark leading-relaxed mt-8 max-w-lg mx-auto">
            Sign up for our newsletter to receive early access to new collections,
            behind-the-scenes stories from our studio, and invitations to
            exclusive events.
          </p>
          <Link
            to="/contact"
            className="inline-block mt-8 px-8 py-3 bg-ink text-ivory text-xs tracking-[0.15em] uppercase hover:bg-warm-charcoal transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
