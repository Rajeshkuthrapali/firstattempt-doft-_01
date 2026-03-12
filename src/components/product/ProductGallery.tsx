"use client";
import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps { images: string[]; title: string; }

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      <div className="flex gap-2 overflow-x-auto sm:flex-col">
        {images.map((img, i) => (
          <button key={i} onClick={() => setSelected(i)} className={`relative h-20 w-20 shrink-0 overflow-hidden border-2 transition-all ${selected === i ? "border-primary" : "border-transparent hover:border-border"}`}>
            <Image src={img} alt={`${title} ${i + 1}`} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative flex-1 aspect-square overflow-hidden bg-bg-secondary">
        <Image src={images[selected] ?? ""} alt={title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-all duration-500" priority />
      </div>
    </div>
  );
}
