"use client";
import { useState, useEffect, useCallback } from "react";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SearchHit { id: string; title: string; slug: string; description: string; scentFamily: string; price: number; image: string; _formatted?: { title?: string; description?: string }; }
const SCENT_FAMILIES = ["Fresh & Citrusy", "Floral & Aromatic", "Woody & Earthy", "Opulent & Warm"];
const SORT_OPTIONS = [{ label: "Relevance", value: "" }, { label: "Price: Low → High", value: "price-asc" }, { label: "Price: High → Low", value: "price-desc" }, { label: "Title: A → Z", value: "title-asc" }];

export default function SearchPage() {
  const [query, setQuery] = useState(""); const [hits, setHits] = useState<SearchHit[]>([]); const [loading, setLoading] = useState(false); const [searched, setSearched] = useState(false); const [showFilters, setShowFilters] = useState(false);
  const [scent, setScent] = useState(""); const [sort, setSort] = useState(""); const [minPrice, setMinPrice] = useState(""); const [maxPrice, setMaxPrice] = useState("");

  const search = useCallback(async (q: string) => {
    if (!q.trim() && !scent && !minPrice && !maxPrice) { setHits([]); setSearched(false); return; }
    setLoading(true); setSearched(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q); if (scent) params.set("scent", scent); if (sort) params.set("sort", sort); if (minPrice) params.set("minPrice", minPrice); if (maxPrice) params.set("maxPrice", maxPrice);
      const res = await fetch(`/api/search?${params.toString()}`); const data = await res.json(); setHits(data.hits ?? []);
    } catch { setHits([]); } finally { setLoading(false); }
  }, [scent, sort, minPrice, maxPrice]);

  useEffect(() => { const timer = setTimeout(() => search(query), 300); return () => clearTimeout(timer); }, [query, search]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="relative mb-6">
        <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for candles, scents, gift sets…" className="w-full border-b-2 border-primary bg-transparent py-4 pl-12 pr-12 text-lg outline-none placeholder:text-text-muted" autoFocus />
        <button onClick={() => setShowFilters(!showFilters)} className={`absolute right-4 top-1/2 -translate-y-1/2 ${showFilters ? "text-primary" : "text-text-muted hover:text-primary"}`} aria-label="Toggle filters"><SlidersHorizontal size={20} /></button>
      </div>
      {showFilters && (
        <div className="mb-8 grid gap-4 border border-border bg-bg-secondary p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div><label className="mb-1 block text-xs font-bold uppercase tracking-wider text-text-muted">Scent Family</label><select value={scent} onChange={(e) => setScent(e.target.value)} className="w-full border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"><option value="">All Scents</option>{SCENT_FAMILIES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
          <div><label className="mb-1 block text-xs font-bold uppercase tracking-wider text-text-muted">Min Price</label><input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="$0" className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></div>
          <div><label className="mb-1 block text-xs font-bold uppercase tracking-wider text-text-muted">Max Price</label><input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="$200" className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></div>
          <div><label className="mb-1 block text-xs font-bold uppercase tracking-wider text-text-muted">Sort By</label><select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary">{SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
          {(scent || sort || minPrice || maxPrice) && <button onClick={() => { setScent(""); setSort(""); setMinPrice(""); setMaxPrice(""); }} className="flex items-center gap-1 text-xs text-accent hover:underline sm:col-span-2 lg:col-span-4"><X size={14} />Clear all filters</button>}
        </div>
      )}
      {loading && <p className="py-12 text-center text-text-muted">Searching…</p>}
      {!loading && searched && hits.length === 0 && <p className="py-12 text-center text-text-muted">No results found{query ? ` for "${query}"` : ""}</p>}
      {hits.length > 0 && (
        <div className="space-y-1">
          <p className="mb-4 text-sm text-text-muted">{hits.length} result{hits.length !== 1 && "s"}</p>
          {hits.map((hit) => (
            <Link key={hit.id} href={`/products/${hit.slug}`} className="flex gap-5 border-b border-border-light p-4 transition-all hover:bg-bg-secondary">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-bg-secondary"><Image src={hit.image} alt={hit.title} fill sizes="96px" className="object-cover" loading="lazy" /></div>
              <div className="flex-1">
                <h3 className="font-heading text-lg text-primary" dangerouslySetInnerHTML={{ __html: hit._formatted?.title ?? hit.title }} />
                <p className="mt-1 text-sm font-bold text-primary">${hit.price.toFixed(2)}</p>
                <span className="mt-2 inline-block text-xs uppercase tracking-wider text-text-muted">{hit.scentFamily}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
