import { Helmet } from 'react-helmet-async';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  TWITTER_HANDLE,
} from '@/lib/seo';

export interface SEOProps {
  /** Page title — rendered as "{title} — Veloz Auto". */
  title?: string;
  /** Meta description (capped at 160 chars). */
  description?: string;
  /** Absolute image URL for OG/Twitter. Falls back to the branded default. */
  image?: string;
  /** Canonical URL — defaults to the current browser URL. */
  url?: string;
  /** Open Graph type (default: "website"). */
  type?: string;
  /** Set true to add <meta name="robots" content="noindex">. */
  noindex?: boolean;
  /** JSON-LD object rendered inside a <script type="application/ld+json"> tag. */
  jsonLd?: Record<string, unknown>;
  /** Override OG title (defaults to the same value as title). */
  ogTitle?: string;
  /** Override OG description (defaults to the same value as description). */
  ogDescription?: string;
}

/** Resolve an image path to an absolute URL. */
function resolveImage(src?: string): string {
  if (!src) return DEFAULT_OG_IMAGE;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return `${SITE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
}

/** Resolve the canonical URL. */
function resolveUrl(explicit?: string): string {
  if (explicit) return explicit;
  if (typeof window !== 'undefined') return window.location.href;
  return SITE_URL;
}

/** Truncate a string to `max` characters, breaking at the last space. */
function truncate(str: string, max = 160): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd();
}

/**
 * Reusable SEO component — sets <title>, meta description, OG tags,
 * Twitter Card tags, canonical link, and optional JSON-LD structured data.
 *
 * Child pages that render their own <Helmet> will override the tags set here
 * (react-helmet-async merges tags, last child wins for duplicates).
 */
export function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  noindex = false,
  jsonLd,
  ogTitle,
  ogDescription,
}: SEOProps) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const desc = description ? truncate(description) : undefined;
  const img = resolveImage(image);
  const canonical = resolveUrl(url);
  const ogT = ogTitle ?? fullTitle;
  const ogD = ogDescription ?? desc;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {desc && <meta name="description" content={desc} />}

      {/* Open Graph */}
      <meta property="og:title" content={ogT} />
      {ogD && <meta property="og:description" content={ogD} />}
      <meta property="og:image" content={img} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      {TWITTER_HANDLE && <meta name="twitter:site" content={TWITTER_HANDLE} />}
      <meta name="twitter:title" content={ogT} />
      {ogD && <meta name="twitter:description" content={ogD} />}
      <meta name="twitter:image" content={img} />

      {/* Canonical */}
      <link rel="canonical" href={canonical} />

      {/* Noindex */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
