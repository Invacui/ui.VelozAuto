import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { SectionHeading } from '@/components/marketing/SectionHeading';
import { ROUTES } from '@/constants/routes';

const HOMEPAGE_BRANDS = [
  { name: 'Honda', logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/honda/default.svg' },
  { name: 'Toyota', logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/toyota/default.svg' },
  { name: 'Kia', logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/kia/default.svg' },
  { name: 'MG Motor', logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/mg/default.svg' },
  { name: 'Skoda', logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/skoda/default.svg' },
  { name: 'Renault', logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/renault/default.svg' },
  { name: 'Volkswagen', logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/volkswagen/default.svg' },
  { name: 'Nissan', logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/nissan/default.svg' },
  { name: 'Mercedes-Benz', logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/mercedes-benz/default.svg' },
  { name: 'BMW', logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/bmw/default.svg' },
  { name: 'Audi', logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/audi/default.svg' },
  { name: 'Maruti Suzuki', logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/maruti-suzuki/default.svg' },
  { name: 'Hyundai', logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/hyundai/default.svg' },
  { name: 'Tata Motors', logo: 'https://cdn.brandfetch.io/tatamotors.com/w/400/h/400' },
  { name: 'Mahindra', logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/mahindra/default.svg' },
  { name: 'Ashok Leyland', logo: 'https://cdn.brandfetch.io/ashokleyland.com/w/400/h/400' },
  { name: 'Eicher', logo: 'https://cdn.brandfetch.io/eicher.com/w/400/h/400' },
  { name: 'BharatBenz', logo: 'https://cdn.brandfetch.io/bharatbenz.com/w/400/h/400' },
];

export function Brands() {
  return (
    <section id="brands" className="border-t py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Trusted Brands"
          icon={Tag}
          title="Popular brands"
          subtitle="Explore top vehicle brands available on Veloz Auto."
        />
      </div>
      <div className="marquee-logos mt-8">
        {[0, 1, 2].map((copy) => (
          <div key={copy} className="marquee-logos__container">
            {HOMEPAGE_BRANDS.map((b) => (
              <Link
                key={`${copy}-${b.name}`}
                to={`${ROUTES.vehicles}?q=${encodeURIComponent(b.name)}`}
                className="marquee-logos__item"
              >
                <img
                  src={b.logo}
                  alt={`${b.name} logo`}
                  loading="lazy"
                  className="marquee-logos__logo"
                />
                <span>{b.name}</span>
              </Link>
            ))}
          </div>
        ))}
        <div className="marquee-logos__fade marquee-logos__fade-left" />
        <div className="marquee-logos__fade marquee-logos__fade-right" />
      </div>
    </section>
  );
}

export default Brands;
