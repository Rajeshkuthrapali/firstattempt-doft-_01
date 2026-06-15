import { Link } from "react-router-dom";

export interface GridItem {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
}

export default function GridBlock({ items, heading }: { items: GridItem[], heading?: string }) {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {heading && (
        <h2 className="font-heading text-3xl font-medium text-center text-ink mb-12">
          {heading}
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map(item => (
          <Link to={item.link} key={item.id} className="group block">
            <div className="overflow-hidden bg-[#f3ece4] aspect-[4/5] mb-4">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
            </div>
            <h3 className="text-sm font-semibold text-ink group-hover:text-brass-gold transition-colors">{item.title}</h3>
            <p className="text-xs text-muted mt-1">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
