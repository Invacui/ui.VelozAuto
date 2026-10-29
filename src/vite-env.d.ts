/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_API_URL: string;
  readonly APP_SITE_URL: string;
  readonly APP_GA_MEASUREMENT_ID?: string;
  readonly APP_GOOGLE_CLIENT_ID?: string;
  readonly APP_CONTACT_PHONE?: string;
  readonly APP_SUPPORT_EMAIL?: string;
  readonly APP_PRIVACY_EMAIL?: string;
  readonly APP_TWITTER_HANDLE?: string;
  readonly APP_WHATSAPP_NUMBER?: string;
  readonly APP_PHONE_VERIFICATION_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
