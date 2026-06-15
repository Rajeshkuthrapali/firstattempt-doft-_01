import { Link } from "react-router-dom";

interface HeroBlockProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImageUrl: string;
}

export default function HeroBlock({ title, subtitle, ctaText, ctaLink, backgroundImageUrl }: HeroBlockProps) {
  return (
    <section className="relative h-[80vh] w-full flex items-center justify-center">
      <div className="absolute inset-0">
        <img 
          src={backgroundImageUrl} 
          alt="" 
          role="presentation" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      <div className="relative z-10 text-center px-4 max-w-3xl">
        <h1 className="font-heading text-5xl md:text-7xl font-medium text-white mb-6">
          {title}
        </h1>
        <p className="text-white/90 text-sm md:text-base mb-10 tracking-wide font-light">
          {subtitle}
        </p>
        <Link 
          to={ctaLink} 
          className="inline-block bg-white text-ink px-8 py-3 text-xs uppercase tracking-[0.2em] font-medium hover:bg-brass-gold hover:text-white transition-colors"
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
}
