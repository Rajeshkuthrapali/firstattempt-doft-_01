import { useState } from "react";

export default function SignUpBlock({ title, description }: { title: string, description: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    // trigger marketing hook
  };

  return (
    <section className="py-24 bg-[#E2DCD3] px-6 text-center">
      <div className="max-w-xl mx-auto">
        <h2 className="font-heading text-4xl font-medium text-ink mb-4">
          {title}
        </h2>
        <p className="text-sm text-dark mb-8 font-light">
          {description}
        </p>
        
        {submitted ? (
          <p className="text-sm font-medium text-ink bg-white/50 py-4 rounded">
            Thank you. Your journey begins soon.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" 
              className="flex-1 px-4 py-3 text-sm bg-white/80 border border-transparent focus:bg-white focus:border-ink outline-none transition-colors placeholder:text-muted"
              required
            />
            <button 
              type="submit"
              className="px-8 py-3 bg-ink text-white text-xs uppercase tracking-widest hover:bg-brass-gold transition-colors"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
