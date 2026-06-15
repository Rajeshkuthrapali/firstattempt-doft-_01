import { useSearchParams } from "react-router-dom";

interface FilterBarProps {
  productCount: number;
}

export function FilterBar({ productCount }: FilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  function handleSort(value: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (value) params.set("sort", value);
    else params.delete("sort");
    setSearchParams(params);
  }

  return (
    <div className="mx-auto flex max-w-7xl items-center justify-between border-b border-border px-6 py-3">
      <p className="text-sm text-text-muted">{productCount} products</p>
      <select
        onChange={(e) => handleSort(e.target.value)}
        defaultValue={searchParams?.get("sort") ?? ""}
        className="border border-border px-3 py-1.5 text-sm outline-none focus:border-primary"
        aria-label="Sort products"
      >
        <option value="">Featured</option>
        <option value="price-asc">Price: Low → High</option>
        <option value="price-desc">Price: High → Low</option>
      </select>
    </div>
  );
}
