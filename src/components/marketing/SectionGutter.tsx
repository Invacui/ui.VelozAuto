import { useState } from 'react';
import { Link } from 'react-scroll';

interface SectionItem {
  id: string;
  title: string;
  brief: string;
}

const SECTIONS: SectionItem[] = [
  { id: 'home-hero', title: 'Hero', brief: 'Discover verified used vehicles tailored to your needs.' },
  { id: 'featured', title: 'Featured', brief: 'Handpicked premium listings curated for you.' },
  { id: 'categories', title: 'Categories', brief: 'Browse vehicles by category to find the right fit.' },
  { id: 'home-search', title: 'Search', brief: 'Find vehicles by brand, city, budget, or keywords.' },
  { id: 'brands', title: 'Brands', brief: 'Explore top vehicle brands available on Veloz Auto.' },
  { id: 'why-choose-us', title: 'Why Choose Us', brief: 'Inspected, verified, and trusted by buyers across India.' },
  { id: 'how-it-works', title: 'How It Works', brief: 'A simple, secure process to buy or sell vehicles.' },
  { id: 'testimonials', title: 'Testimonials', brief: 'See what our happy customers have to say.' },
  { id: 'sell-cta', title: 'Sell Your Vehicle', brief: 'Get a free doorstep inspection and instant offer.' },
];

export function SectionGutter() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="fixed right-3 top-1/2 z-50 hidden -translate-y-1/2 sm:block md:right-5 lg:right-6">
      <nav
        aria-label="Page sections"
        className="flex flex-col items-end gap-2.5 px-2 py-3 "
      >
        {SECTIONS.map((section) => (
          <div
            key={section.id}
            className="relative flex items-center justify-end"
            onMouseEnter={() => setHovered(section.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <Link
              to={section.id}
              spy
              smooth
              duration={500}
              offset={-72}
              hashSpy
              activeClass="[&>span]:w-4 [&>span]:bg-primary"
              className="group flex h-4 cursor-pointer items-center justify-end"
              aria-label={`Go to ${section.title}`}
            >
              <span className="block h-[3px] w-4 rounded-full !bg-blend-difference bg-gray-500 transition-all duration-300 ease-out group-hover:w-6 group-hover:bg-gray-500" />
            </Link>

            {hovered === section.id && (
              <div className="pointer-events-none absolute right-full mr-3 flex w-56 flex-col gap-0.5 rounded-lg border bg-white px-3 py-2 text-left shadow-xl ring-1 ring-black/5">
                <p className="text-xs font-semibold leading-tight text-gray-900">{section.title}</p>
                <p className="text-xs leading-relaxed text-gray-500">{section.brief}</p>
                <span className="absolute left-full top-1/2 -translate-y-1/2 border-y-[6px] border-l-[6px] border-y-transparent border-l-white" />
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}

export default SectionGutter;
