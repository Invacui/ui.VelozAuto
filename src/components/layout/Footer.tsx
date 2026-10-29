import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import { getSiteSettings } from '@/services/content.service';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/constants/routes';
import logoImage from '@/assets/logo.png';

const linkGroups = [
  {
    title: 'Buy',
    links: [
      { label: 'All vehicles', to: ROUTES.vehicles },
      { label: `Passenger cars`, to: `${ROUTES.vehicles}?category=PASSENGER_CAR` },
      { label: 'Two wheelers', to: `${ROUTES.vehicles}?category=TWO_WHEELER` },
      { label: 'Commercial', to: `${ROUTES.vehicles}?category=COMMERCIAL` },
      { label: 'Caravan / Motorhome', to: `${ROUTES.vehicles}?category=CARAVAN_MOTORHOME` },
    ],
  },
  {
    title: 'Sell',
    links: [
      { label: 'Sell your vehicle', to: ROUTES.sell },
      { label: 'EMI calculator', to: ROUTES.emiCalculator },
      { label: 'Compare vehicles', to: ROUTES.compare },
      { label: 'Wishlist', to: ROUTES.wishlist },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', to: ROUTES.about },
      { label: 'Contact', to: ROUTES.contact },
      { label: 'FAQ', to: ROUTES.faq },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', to: ROUTES.privacy },
      { label: 'Terms of use', to: ROUTES.terms },
    ],
  },
];

export function Footer() {
  const { data: settings } = useQuery({
    queryKey: queryKeys.content.siteSettings(),
    queryFn: getSiteSettings,
    staleTime: 10 * 60_000,
  });

  const social = settings?.social || {};

  return (
    <footer className="mt-16 border-t border-white/10 bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2">
            <Link to={ROUTES.home} className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/20 ">
                <img src={logoImage} alt="Veloz Auto" className="h-full w-full scale-150  object-contain invert" />
              </span>
              <span className="flex h-16 items-center font-Incompleeta text-3xl leading-none tracking-wide text-white">
                VELOZ AUTO
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-gray-400">
              {settings?.tagline ||
                'India’s trusted marketplace for buying and selling verified used vehicles — cars, bikes, commercial vehicles and caravans.'}
            </p>
            <div className="mt-4 flex gap-2">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-white">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-white">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noreferrer" aria-label="Twitter" className="text-gray-400 hover:text-white">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="text-gray-400 hover:text-white">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-white">{group.title}</h3>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-gray-400 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-gray-400 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {settings?.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4" /> {settings.phone}
              </span>
            )}
            {settings?.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4" /> {settings.email}
              </span>
            )}
            {settings?.address && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {settings.address}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col items-start justify-between gap-2 text-xs text-gray-400 md:flex-row md:items-center">
          <p>
            &copy; {new Date().getFullYear()} Veloz Auto. All rights reserved.
          </p>
          <p className="text-balance">
            {settings?.footerText ||
              'Vehicle details, prices and availability are indicative and subject to change; please verify before purchase.'}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
