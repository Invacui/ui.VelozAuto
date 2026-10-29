import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        Rubik: ["Rubik", "sans-serif"],
        Roboto: ["Roboto", "sans-serif"],
        Incompleeta: ["Incompleeta", "Rubik", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
      },
      brightness: {
        // Used by button.tsx (hover:brightness-55) — Tailwind's default scale
        // has no `55`, so it was silently not applying. Enable it here.
        55: "0.55",
      },
      transitionDuration: {
        // Used by Header overlay menu items (mirrors ui-mrt's 400ms hover timing).
        400: "400ms",
      },
      transitionTimingFunction: {
        // Used by Header overlay menu items (ui-mrt's cubic-bezier ease).
        "menu-ease": "cubic-bezier(0,0,0.3642,1)",
      },
      spacing: {
        // Used by dropdown-menu.tsx (data-inset:pl-7.5) — Tailwind's default
        // spacing scale has no `7.5`, so it was silently not applying.
        7.5: "1.875rem",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // The UI components in src/components/ui are authored with shadcn's
    // Tailwind v4 `data-*` variant syntax (`data-open:`, `data-horizontal:`,
    // `group-data-horizontal/tabs:`, ...). This project runs Tailwind v3,
    // which does not ship those variants, so we register them here to map the
    // Radix data attributes onto Tailwind variants.
    plugin(({ addVariant }) => {
      addVariant("data-open", '&[data-state="open"]');
      addVariant("data-closed", '&[data-state="closed"]');
      addVariant("data-checked", '&[data-state="checked"]');
      addVariant("data-unchecked", '&[data-state="unchecked"]');
      addVariant("data-active", '&[data-state="active"]');
      addVariant("data-placeholder", "&[data-placeholder]");
      addVariant("data-disabled", "&[data-disabled]");
      addVariant("data-inset", "&[data-inset]");
      addVariant("data-horizontal", '&[data-orientation="horizontal"]');
      addVariant("data-vertical", '&[data-orientation="vertical"]');
      addVariant(
        "group-data-horizontal/tabs",
        ':merge(.group\\/tabs)[data-orientation="horizontal"] &',
      );
      addVariant(
        "group-data-vertical/tabs",
        ':merge(.group\\/tabs)[data-orientation="vertical"] &',
      );
    }),
  ],
};

export default config;
