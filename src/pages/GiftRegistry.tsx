import { useState } from "react";

interface RegistryItem {
  id: string;
  name: string;
  image: string;
  price: number;
}

/**
 * GiftRegistry — placeholder interface allowing users to create
 * and manage lists for occasions (weddings, housewarming, etc).
 */
export default function GiftRegistry() {
  const [registryName, setRegistryName] = useState("Our Housewarming");
  const [items, setItems] = useState<RegistryItem[]>([
    {
      id: "lum-001",
      name: "Golden Hour",
      image: "/golden-hour.png",
      price: 2499,
    },
    {
      id: "lum-002",
      name: "Midnight Oud",
      image: "/midnight-oud.png",
      price: 2499,
    },
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 border-b border-[#e8e0d8] pb-6 text-center md:text-left">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#9a8d82] mb-2">
          Gifting Experiences
        </p>
        <h1 className="font-['Cormorant_Garamond',serif] text-4xl font-medium text-[#2d2926]">
          Gift Registry
        </h1>
        <p className="mt-3 text-sm text-[#6b5e54] max-w-xl">
          Curate a collection of Lumière fragrances for your special occasion. Share your unique link with guests and friends.
        </p>
      </div>

      <div className="rounded-xl border border-[#e8e0d8] bg-white p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-[#e8e0d8] pb-8">
          <div>
            <label htmlFor="registry-name" className="sr-only">Registry Name</label>
            <input
              id="registry-name"
              type="text"
              value={registryName}
              onChange={(e) => setRegistryName(e.target.value)}
              className="text-2xl font-['Cormorant_Garamond',serif] text-[#2d2926] border-none outline-none focus:ring-1 focus:ring-[#c4a093] rounded px-2 py-1 w-full bg-[#faf7f4]"
            />
            <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#9a8d82] pl-2">
              Public Link: <span className="text-[#c4a093] lowercase">lumiere-candles.com/registry/{registryName.replace(/\s+/g, '-').toLowerCase()}</span>
            </p>
          </div>
          <button className="shrink-0 rounded bg-[#c4a093] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white hover:bg-[#a8877b] transition-colors">
            Copy Link
          </button>
        </div>

        <h3 className="text-lg font-medium text-[#2d2926] mb-6">Requested Items ({items.length})</h3>
        
        {items.length === 0 ? (
          <div className="rounded border border-dashed border-[#e8e0d8] bg-[#faf7f4] p-10 text-center">
            <p className="text-sm text-[#6b5e54] mb-4">Your registry is currently empty.</p>
            <a href="/collections" className="text-sm font-semibold text-[#c4a093] hover:underline">
              Browse Collections →
            </a>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {items.map((item) => (
              <li key={item.id} className="group relative rounded border border-[#e8e0d8] bg-[#faf7f4] overflow-hidden">
                <button
                  onClick={() => setItems(items.filter(i => i.id !== item.id))}
                  className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#6b5e54] shadow hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${item.name} from registry`}
                >
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="aspect-square bg-[#f3ece4]">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="p-4 text-center">
                  <h4 className="font-['Cormorant_Garamond',serif] text-lg font-medium text-[#2d2926]">{item.name}</h4>
                  <p className="text-sm text-[#6b5e54] mt-1">₹{item.price}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
