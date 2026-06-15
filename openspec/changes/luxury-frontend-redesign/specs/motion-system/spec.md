## ADDED Requirements

### Requirement: Allowed animation types
GSAP (already installed) SHALL be used ONLY for the following animation types:

- **Hero reveal** — Staggered entrance of headline, subtext, and CTA on page load. Duration: 800ms. Easing: power2.out.
- **Image reveal** — Clip-path reveal from right to left. Duration: 700ms. Easing: power2.inOut. Applied on scroll trigger.
- **Section fade-in** — Single fade-up entrance per section. Duration: 600ms. Y-offset: 30px. Easing: power2.out. Scroll-triggered at 85% viewport.
- **Product grid stagger** — Staggered entrance of product cards within a grid. Duration: 600ms. Stagger delay: 100ms per card. Easing: power2.out. Scroll-triggered.
- **Cart toast feedback** — Toast notification slides in from right. Duration: 400ms. Easing: power3.out.

#### Scenario: Hero reveal plays on page load
- **WHEN** the Home page loads
- **THEN** the hero headline SHALL animate in (opacity 0 → 1, y: 20px → 0, duration 800ms)
- **AND** the hero subtext SHALL follow 200ms after the headline
- **AND** the hero CTA SHALL follow 200ms after the subtext

#### Scenario: Section fade-ins trigger on scroll
- **WHEN** a section with `data-animate="fade-up"` enters the viewport (85% from top)
- **THEN** it SHALL animate from opacity 0, y: 30px to opacity 1, y: 0 over 600ms
- **AND** the animation SHALL play only once (no reverse on scroll-away)

#### Scenario: Product grid staggers on scroll
- **WHEN** a product grid enters the viewport
- **THEN** each product card SHALL animate in sequentially with 100ms delay between them
- **AND** each card SHALL animate from opacity 0, y: 20px to opacity 1, y: 0 over 600ms

### Requirement: Prohibited animation types
The following animation types SHALL NOT be used anywhere on the site:

- Parallax (any direction, any intensity)
- Custom cursor followers or cursor effects
- Particle systems or particle effects
- Magnetic buttons (cursor-attracting hover behaviour)
- Marquees or scrolling text strips
- Apple-style pin-scroll storytelling sections
- Auto-playing carousels or sliders
- Floating or drifting elements
- Constant motion of any kind (spinners excepted for loading states)
- Scroll-jacking or custom scroll behaviour

#### Scenario: Prohibited animations are absent from the codebase
- **WHEN** the codebase is searched for parallax, cursor follower, particle, or marquee implementations
- **THEN** no active implementations SHALL be found
- **AND** the animations.ts file SHALL NOT export or register any prohibited animation function

### Requirement: Reduced motion support
The site SHALL respect the `prefers-reduced-motion` OS-level setting. When enabled:
- All GSAP animations SHALL be skipped (elements appear at their final state immediately)
- All CSS animations SHALL be disabled
- The existing `@media (prefers-reduced-motion: reduce)` rule in index.css SHALL remain in place

#### Scenario: Reduced motion disables animations
- **WHEN** a user has `prefers-reduced-motion: reduce` enabled
- **THEN** no GSAP animation SHALL play
- **AND** elements SHALL appear in their final animated state immediately

### Requirement: Animation code organisation
All GSAP animation logic SHALL reside in `src/lib/animations.ts`. Components SHALL NOT create GSAP timelines or tweens directly. Components SHALL import and call the exported animation functions.

- Functions SHALL accept a container element (or selector) as their first argument
- Animation functions SHALL return GSAP timeline/tween instances for chaining
- ScrollTrigger registration SHALL happen in `animations.ts`, not in components

#### Scenario: Components import animations from the library
- **WHEN** a component needs an animation
- **THEN** it SHALL import from `src/lib/animations.ts`
- **AND** it SHALL NOT import or use GSAP directly
