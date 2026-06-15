import { useState } from "react";
import { api } from "../lib/api/client";
import PageTransition from "../components/PageTransition";

/**
 * Contact Us page.
 * Accessibility: labelled form, fieldset for contact reason,
 * success confirmation with aria-live.
 */
export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("general");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    setSending(true);
    setError(null);

    try {
      const payload = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        reason: formData.get("reason") as string,
        message: formData.get("message") as string,
      };

      await api.post("/api/contact", payload);
      setSubmitted(true);
      form.reset();
    } catch (err) {
      setError("Failed to send message. Please try again or email us directly.");
    } finally {
      setSending(false);
    }
  }

  return (
    <PageTransition>
    <div className="mx-auto max-w-2xl px-6 py-section">
      <h1 className="heading-xl text-ink mb-3">
        Contact Us
      </h1>
      <p className="body text-dark mb-10 leading-relaxed">
        We'd love to hear from you — whether it's a question about an order, a
        gifting enquiry, or just a love note for your favourite candle.
      </p>

      {submitted ? (
        <div
          role="alert"
          aria-live="polite"
          className="bg-warm-sand border border-hairline p-8 text-center"
        >
          <p className="text-2xl mb-2">🕯️</p>
          <p className="body font-semibold text-ink">
            Thank you, {name}!
          </p>
          <p className="body text-dark mt-2">
            We'll get back to you at {email} within 1–2 business days.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="contact-name"
                className="block micro text-muted mb-1"
              >
                Your Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full border border-hairline bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-ink transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="contact-email"
                className="block micro text-muted mb-1"
              >
                Email Address
              </label>
              <input
                id="contact-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-hairline bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-ink transition-colors"
              />
            </div>
          </div>

          <fieldset>
            <legend className="text-xs font-medium uppercase tracking-widest text-muted mb-2">
              I'm writing about…
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: "general", label: "General" },
                { value: "order", label: "My Order" },
                { value: "gifting", label: "Gifting" },
                { value: "wholesale", label: "Wholesale" },
              ].map(({ value, label }) => (
                <label
                  key={value}
                  className={`border p-3 text-center cursor-pointer text-xs transition-colors ${
                    reason === value
                      ? "border-brass-gold bg-brass-gold/5 text-brass-gold font-semibold"
                      : "border-hairline text-dark hover:border-brass-gold"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={value}
                    checked={reason === value}
                    onChange={() => setReason(value)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="contact-message"
              className="block micro text-muted mb-1"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us how we can help…"
               className="w-full border border-hairline bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-ink transition-colors resize-none"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="body text-error bg-error/10 border border-error/30 px-4 py-3"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={sending}
            className="w-full bg-ink text-ivory py-4 caption hover:bg-brass-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending…" : "Send Message"}
          </button>
        </form>
      )}

      {/* Contact details */}
      <dl className="mt-12 grid sm:grid-cols-3 gap-6 border-t border-hairline pt-10" data-animate="fade-up">
        {[
          { term: "Email", value: "hello@lumiere.in" },
          { term: "Phone", value: "+91 98765 43210" },
          { term: "Hours", value: "Mon–Sat, 10 am – 6 pm IST" },
        ].map(({ term, value }) => (
          <div key={term}>
            <dt className="micro text-muted mb-1">
              {term}
            </dt>
            <dd className="body text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
    </PageTransition>
  );
}
