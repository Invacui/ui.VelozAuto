/** Shared SEO and contact constants used by the <SEO> component and marketing pages. */
export const SITE_URL =
  import.meta.env.APP_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
export const SITE_NAME = 'Veloz Auto';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
export const TWITTER_HANDLE = import.meta.env.APP_TWITTER_HANDLE?.trim() || '';
export const CONTACT_PHONE = import.meta.env.APP_CONTACT_PHONE?.trim() || '';
export const CONTACT_PHONE_HREF = CONTACT_PHONE
  ? `tel:${CONTACT_PHONE.replace(/[^\d+]/g, '')}`
  : '';
export const SUPPORT_EMAIL = import.meta.env.APP_SUPPORT_EMAIL?.trim() || '';
export const PRIVACY_EMAIL = import.meta.env.APP_PRIVACY_EMAIL?.trim() || '';
export const DEFAULT_DESCRIPTION =
  'Browse verified used cars, bikes, commercial vehicles and caravans across India. Raise a buy request or sell your vehicle with a free inspection and instant offer.';
