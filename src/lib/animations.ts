import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ── Selectors ────────────────────────── */
const FADE_IN = "[data-animate=fade-in]";
const FADE_UP = "[data-animate=fade-up]";
const FADE_LEFT = "[data-animate=fade-left]";
const FADE_RIGHT = "[data-animate=fade-right]";
const SCALE_IN = "[data-animate=scale-in]";
const STAGGER_CHILDREN = "[data-animate=stagger] > [data-animate-child]";

/* ── Defaults ─────────────────────────── */
const DEFAULTS = {
  duration: 0.7,
  ease: "power2.out",
  scrollTrigger: {
    trigger: "",
    start: "top 85%",
    toggleActions: "play none none reverse",
  },
};

/* ── Fade in ──────────────────────────── */
export function fadeIn(elements: string | Element | Element[], opts?: { duration?: number; delay?: number; ease?: string }) {
  return gsap.from(elements, {
    opacity: 0,
    duration: opts?.duration ?? DEFAULTS.duration,
    delay: opts?.delay ?? 0,
    ease: opts?.ease ?? DEFAULTS.ease,
  });
}

/* ── Fade up ──────────────────────────── */
export function fadeUp(
  elements: string | Element | Element[],
  opts?: { y?: number; duration?: number; delay?: number; stagger?: number },
) {
  return gsap.from(elements, {
    opacity: 0,
    y: opts?.y ?? 40,
    duration: opts?.duration ?? 0.8,
    delay: opts?.delay ?? 0,
    stagger: opts?.stagger ?? 0,
    ease: "power3.out",
  });
}

/* ── Fade left (enters from right) ────── */
export function fadeLeft(
  elements: string | Element | Element[],
  opts?: { x?: number; duration?: number; delay?: number },
) {
  return gsap.from(elements, {
    opacity: 0,
    x: opts?.x ?? 60,
    duration: opts?.duration ?? 0.7,
    delay: opts?.delay ?? 0,
    ease: "power2.out",
  });
}

/* ── Fade right (enters from left) ────── */
export function fadeRight(
  elements: string | Element | Element[],
  opts?: { x?: number; duration?: number; delay?: number },
) {
  return gsap.from(elements, {
    opacity: 0,
    x: opts?.x ?? -60,
    duration: opts?.duration ?? 0.7,
    delay: opts?.delay ?? 0,
    ease: "power2.out",
  });
}

/* ── Scale in ─────────────────────────── */
export function scaleIn(
  elements: string | Element | Element[],
  opts?: { scale?: number; duration?: number; delay?: number },
) {
  return gsap.from(elements, {
    opacity: 0,
    scale: opts?.scale ?? 0.9,
    duration: opts?.duration ?? 0.6,
    delay: opts?.delay ?? 0,
    ease: "back.out(1.7)",
  });
}

/* ── Stagger children ─────────────────── */
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
    y: opts?.y ?? 30,
    duration: opts?.duration ?? 0.6,
    stagger: opts?.stagger ?? 0.1,
    delay: opts?.delay ?? 0,
    ease: "power2.out",
  });
}

/* ── Initialize all scroll-triggered animations ── */
export function initScrollAnimations() {
  const ctx = gsap.context(() => {
    // Fade-in elements
    if (document.querySelector(FADE_IN)) {
      gsap.from(FADE_IN, {
        opacity: 0,
        duration: DEFAULTS.duration,
        ease: DEFAULTS.ease,
        scrollTrigger: { trigger: FADE_IN, start: "top 85%", toggleActions: "play none none reverse" },
      });
    }

    // Fade-up elements
    if (document.querySelector(FADE_UP)) {
      gsap.from(FADE_UP, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: FADE_UP, start: "top 85%", toggleActions: "play none none reverse" },
      });
    }

    // Fade-left
    if (document.querySelector(FADE_LEFT)) {
      gsap.from(FADE_LEFT, {
        opacity: 0,
        x: 60,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: FADE_LEFT, start: "top 85%", toggleActions: "play none none reverse" },
      });
    }

    // Fade-right
    if (document.querySelector(FADE_RIGHT)) {
      gsap.from(FADE_RIGHT, {
        opacity: 0,
        x: -60,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: FADE_RIGHT, start: "top 85%", toggleActions: "play none none reverse" },
      });
    }

    // Scale-in
    if (document.querySelector(SCALE_IN)) {
      gsap.from(SCALE_IN, {
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        ease: "back.out(1.7)",
        scrollTrigger: { trigger: SCALE_IN, start: "top 85%", toggleActions: "play none none reverse" },
      });
    }

    // Stagger children
    if (document.querySelector(STAGGER_CHILDREN)) {
      gsap.from(`${STAGGER_CHILDREN}`, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: "[data-animate=stagger]", start: "top 85%", toggleActions: "play none none reverse" },
      });
    }
  });

  return () => ctx.revert(); // cleanup
}

/* ── Page enter animation ─────────────── */
export function pageEnter(container: Element | string) {
  return gsap.from(container, {
    opacity: 0,
    y: 20,
    duration: 0.5,
    ease: "power2.out",
  });
}

/* ── Image reveal (clip-path) ─────────── */
export function imageReveal(
  elements: string | Element | Element[],
  opts?: { duration?: number; delay?: number },
) {
  return gsap.from(elements, {
    clipPath: "inset(0 100% 0 0)",
    duration: opts?.duration ?? 1,
    delay: opts?.delay ?? 0,
    ease: "power2.inOut",
  });
}
