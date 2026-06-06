"use client";
import { useState } from "react";
import { Heart } from "lucide-react";

interface WishlistToggleProps {
  productId: string;
  initialWishlisted?: boolean;
}

export function WishlistToggle({
  productId,
  initialWishlisted = false,
}: WishlistToggleProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    setWishlisted(!wishlisted);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        const data = await res.json();
        setWishlisted(data.wishlisted);
      } else {
        setWishlisted(wishlisted);
      }
    } catch {
      setWishlisted(wishlisted);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      disabled={loading}
      className={`rounded-full p-2 shadow-sm backdrop-blur-sm transition-all hover:scale-110 ${wishlisted ? "bg-white text-accent" : "bg-white/80 text-text-muted hover:text-accent"} disabled:opacity-50`}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
    </button>
  );
}
