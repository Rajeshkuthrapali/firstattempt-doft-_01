import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ── Allowed Animation Types ──────────────
 *
 * Hero reveal     — staggered headline → subtext → CTA (800ms, power2.out)
 * Image reveal    — clip-path from right (700ms, power2.inOut)
 * Section fade-in — scroll-triggered fade-up (600ms, power2.out)
 * Product stagger — grid cards staggered entrance (600ms, 100ms delay)
 * Toast slide-in  — notification from right (400ms, power3.out)
 *
 * Prohibited (removed):
 *   Parallax, cursor effects, particles, magnetic buttons,
 *   marquees, pin-scroll, auto-carousels, floating elements,
 *   constant motion, scroll-jacking
 * ───────────────────────────────────────── */

/* ── Selectors ──────────────────────────── */
const FADE_UP = "[data-animate=fade-up]";
const STAGGER_CHILDREN = "[data-animate=stagger] > [data-animate-child]";

/* ── Hero Reveal ──────────────────────────
 * Staggered entrance: label → headline → subtext → CTA.
 * Duration: 1000ms (headline), 800ms (subtext/cta). Easing: power2.out.
 * Called once on page load for the hero section.
 */
export function heroReveal(container: string | Element) {
  const getEl = (sel: string) =>
    container instanceof Element
      ? container.querySelector(sel)
      : document.querySelector(`${container} ${sel}`);

  const label = getEl("[data-hero=label]");
  const headline = getEl("[data-hero=headline]");
  const subtext = getEl("[data-hero=subtext]");
  const cta = getEl("[data-hero=cta]");

  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  if (label) tl.from(label, { opacity: 0, y: 10, duration: 0.6 });
  if (headline) tl.from(headline, { opacity: 0, y: 30, duration: 1.0 }, "+=0.15");
  if (subtext) tl.from(subtext, { opacity: 0, y: 20, duration: 0.8 }, "+=0.3");
  if (cta) tl.from(cta, { opacity: 0, y: 20, duration: 0.8 }, "+=0.3");

  return tl;
}

/* ── Image Clip Reveal ────────────────────
 * Clip-path reveal from right to left.
 * Duration: 700ms. Easing: power2.inOut.
 * Applied on scroll trigger via initScrollAnimations.
 */
export function imageReveal(
  elements: string | Element | Element[],
  opts?: { duration?: number; delay?: number },
) {
  return gsap.from(elements, {
    clipPath: "inset(0 100% 0 0)",
    duration: opts?.duration ?? 0.7,
    delay: opts?.delay ?? 0,
    ease: "power2.inOut",
  });
}

/* ── Section Fade-In ──────────────────────
 * Single fade-up entrance per section.
 * Duration: 600ms. Y-offset: 30px. Easing: power2.out.
 * Scroll-triggered at 85% viewport. Plays once (no reverse).
 */
export function sectionFadeIn(
  elements: string | Element | Element[],
  opts?: { y?: number; duration?: number; delay?: number },
) {
  return gsap.from(elements, {
    opacity: 0,
    y: opts?.y ?? 30,
    duration: opts?.duration ?? 0.6,
    delay: opts?.delay ?? 0,
    ease: "power2.out",
  });
}

/* ── Product Grid Stagger ─────────────────
 * Staggered entrance of product cards within a grid.
 * Duration: 600ms. Stagger delay: 100ms per card. Easing: power2.out.
 */
export function staggerChildren(
  parent: string | Element,
  opts?: {
    y?: number;
    duration?: number;
    stagger?: number;
    delay?: number;
  },
) {
  const children = parent instanceof Element
    ? parent.querySelectorAll("[data-animate-child]")
    : document.querySelectorAll(`${parent} [data-animate-child]`);
  if (!children.length) return gsap.timeline();

  return gsap.from(children, {
    opacity: 0,
    y: opts?.y ?? 20,
    duration: opts?.duration ?? 0.6,
    stagger: opts?.stagger ?? 0.1,
    delay: opts?.delay ?? 0,
    ease: "power2.out",
  });
}

/* ── Toast Slide-In ───────────────────────
 * Slide in from right for notifications.
 * Duration: 400ms. Easing: power3.out.
 */
export function toastSlideIn(element: string | Element) {
  return gsap.from(element, {
    x: 120,
    opacity: 0,
    duration: 0.4,
    ease: "power3.out",
  });
}

/* ── Toast Slide-Out ──────────────────────
 * Slide out to right on dismiss.
 * Duration: 300ms. Easing: power2.in.
 */
export function toastSlideOut(element: string | Element) {
  return gsap.to(element, {
    x: 120,
    opacity: 0,
    duration: 0.3,
    ease: "power2.in",
  });
}

/* ── Page Enter ──────────────────────────
 * Subtle fade-up on route change.
 */
export function pageEnter(container: Element | string) {
  return gsap.from(container, {
    y: 8,
    duration: 0.4,
    ease: "power2.out",
  });
}

/* ── Initialize Scroll-Triggered Animations ──
 * Scans the DOM for allowed data attributes and creates
 * ScrollTrigger instances. Plays each animation exactly once.
 * Respects prefers-reduced-motion via the CSS fallback.
 */
export function initScrollAnimations() {
  const ctx = gsap.context(() => {
    // Section fade-ins
    if (document.querySelector(FADE_UP)) {
      gsap.from(FADE_UP, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: FADE_UP,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }

    // Stagger children (product grids, card arrays)
    if (document.querySelector(STAGGER_CHILDREN)) {
      gsap.from(`${STAGGER_CHILDREN}`, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "[data-animate=stagger]",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }

    // Image reveals
    if (document.querySelector("[data-animate=image-reveal]")) {
      gsap.from("[data-animate=image-reveal]", {
        clipPath: "inset(0 100% 0 0)",
        duration: 0.7,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: "[data-animate=image-reveal]",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }
  });

  return () => ctx.revert(); // cleanup
}
