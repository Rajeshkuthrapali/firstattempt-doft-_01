import { useState } from "react";

/**
 * Contact Us page.
 * Accessibility: labelled form, fieldset for contact reason,
 * success confirmation with aria-live.
 */
export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("general");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production: POST to /api/contact
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-['Cormorant_Garamond',serif] text-4xl font-semibold text-[#2d2926] mb-3">
        Contact Us
      </h1>
      <p className="text-sm text-[#6b5e54] mb-10 leading-relaxed">
        We'd love to hear from you — whether it's a question about an order, a gifting enquiry, or just a love note for your favourite candle.
      </p>

      {submitted ? (
        <div role="alert" aria-live="polite" className="rounded bg-[#f3ece4] border border-[#e8d8d0] p-8 text-center">
          <p className="text-2xl mb-2">🕯️</p>
          <p className="text-base font-semibold text-[#2d2926]">Thank you, {name}!</p>
          <p className="text-sm text-[#6b5e54] mt-2">
            We'll get back to you at {email} within 1–2 business days.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="contact-name"
                className="block text-xs font-medium uppercase tracking-widest text-[#9a8d82] mb-1"
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
                className="w-full border border-[#e8e0d8] bg-white px-4 py-3 text-sm text-[#2d2926] placeholder:text-[#c4b8b0] outline-none focus:border-[#c4a093] transition-colors rounded-sm"
              />
            </div>
            <div>
              <label
                htmlFor="contact-email"
                className="block text-xs font-medium uppercase tracking-widest text-[#9a8d82] mb-1"
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
                className="w-full border border-[#e8e0d8] bg-white px-4 py-3 text-sm text-[#2d2926] placeholder:text-[#c4b8b0] outline-none focus:border-[#c4a093] transition-colors rounded-sm"
              />
            </div>
          </div>

          <fieldset>
            <legend className="text-xs font-medium uppercase tracking-widest text-[#9a8d82] mb-2">
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
                  className={`rounded border p-3 text-center cursor-pointer text-xs transition-colors ${
                    reason === value
                      ? "border-[#c4a093] bg-[#fdf6f3] text-[#c4a093] font-semibold"
                      : "border-[#e8e0d8] text-[#6b5e54] hover:border-[#c4a093]"
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
              className="block text-xs font-medium uppercase tracking-widest text-[#9a8d82] mb-1"
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
              className="w-full border border-[#e8e0d8] bg-white px-4 py-3 text-sm text-[#2d2926] placeholder:text-[#c4b8b0] outline-none focus:border-[#c4a093] transition-colors rounded-sm resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2d2926] text-white py-4 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#c4a093] transition-colors rounded-sm"
          >
            Send Message
          </button>
        </form>
      )}

      {/* Contact details */}
      <dl className="mt-12 grid sm:grid-cols-3 gap-6 border-t border-[#e8e0d8] pt-10">
        {[
          { term: "Email", value: "hello@lumiere.in" },
          { term: "Phone", value: "+91 98765 43210" },
          { term: "Hours", value: "Mon–Sat, 10 am – 6 pm IST" },
        ].map(({ term, value }) => (
          <div key={term}>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-1">
              {term}
            </dt>
            <dd className="text-sm text-[#2d2926]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
