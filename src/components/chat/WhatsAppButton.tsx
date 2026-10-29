const WHATSAPP_NUMBER = import.meta.env.APP_WHATSAPP_NUMBER?.replace(/\D/g, '') || '';
const WHATSAPP_MESSAGE = 'Hi! I wanted to reach out to you.';

/** Always-visible floating WhatsApp launcher for the public site. */
export function WhatsAppButton() {
  if (!WHATSAPP_NUMBER) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-20 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-30" />
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <path d="M16.001 3C9.373 3 4.001 8.372 4.001 15c0 2.115.553 4.09 1.516 5.81L4 29l8.372-1.482A11.94 11.94 0 0 0 16 28c6.628 0 12-5.372 12-12S22.629 3 16.001 3Zm0 21.818c-1.77 0-3.428-.48-4.853-1.318l-.348-.206-4.967.879.9-4.846-.224-.363A9.784 9.784 0 0 1 6.183 15c0-5.416 4.402-9.818 9.818-9.818 5.417 0 9.819 4.402 9.819 9.818 0 5.417-4.402 9.818-9.819 9.818Zm5.385-7.353c-.295-.148-1.748-.862-2.019-.96-.271-.099-.468-.148-.665.148-.197.296-.763.96-.936 1.157-.172.197-.345.222-.64.074-.295-.148-1.246-.459-2.374-1.464-.878-.783-1.47-1.75-1.642-2.046-.172-.295-.018-.455.13-.602.132-.132.295-.345.443-.517.148-.173.197-.296.295-.493.099-.197.05-.37-.025-.517-.074-.148-.665-1.6-.911-2.191-.24-.576-.484-.498-.665-.507l-.566-.01c-.197 0-.517.074-.788.37-.27.296-1.034 1.01-1.034 2.463s1.059 2.857 1.206 3.054c.148.197 2.083 3.18 5.047 4.46.705.304 1.255.486 1.684.622.708.225 1.352.193 1.861.117.568-.084 1.748-.714 1.995-1.404.246-.69.246-1.28.172-1.404-.074-.123-.271-.197-.566-.345Z" />
      </svg>
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 sm:block">
        Chat on WhatsApp
      </span>
    </a>
  );
}

export default WhatsAppButton;
