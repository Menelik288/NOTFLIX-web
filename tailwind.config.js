/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      "colors": {
        "inverse-primary": "#c0000c",
        "tertiary-container": "#0072d7",
        "outline-variant": "#5e3f3b",
        "secondary-fixed": "#ffdad7",
        "surface-container-highest": "#353534",
        "on-tertiary-container": "#f8f9ff",
        "on-tertiary-fixed": "#001b3c",
        "primary-container": "#e50914",
        "surface-container-low": "#1c1b1b",
        "primary-fixed-dim": "#ffb4aa",
        "surface-container": "#201f1f",
        "tertiary-fixed": "#d5e3ff",
        "on-tertiary": "#003061",
        "surface": "#131313",
        "on-secondary-fixed-variant": "#59413f",
        "surface-container-lowest": "#0e0e0e",
        "on-surface-variant": "#e9bcb6",
        "on-error": "#690005",
        "outline": "#af8782",
        "on-background": "#e5e2e1",
        "on-secondary-container": "#d2b1ae",
        "error": "#ffb4ab",
        "background": "#131313",
        "inverse-surface": "#e5e2e1",
        "surface-tint": "#ffb4aa",
        "primary-fixed": "#ffdad5",
        "secondary-container": "#5c4341",
        "surface-variant": "#353534",
        "on-primary-container": "#fff7f6",
        "error-container": "#93000a",
        "surface-container-high": "#2a2a2a",
        "secondary-fixed-dim": "#e1bebb",
        "on-primary-fixed-variant": "#930007",
        "on-secondary": "#412b29",
        "on-primary": "#690003",
        "tertiary": "#a7c8ff",
        "on-primary-fixed": "#410001",
        "surface-dim": "#131313",
        "on-surface": "#e5e2e1",
        "primary": "#ffb4aa",
        "on-secondary-fixed": "#2a1615",
        "surface-bright": "#3a3939",
        "on-error-container": "#ffdad6",
        "secondary": "#e1bebb",
        "inverse-on-surface": "#313030",
        "on-tertiary-fixed-variant": "#004689",
        "tertiary-fixed-dim": "#a7c8ff"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "edge-margin": "4rem",
        "stack-md": "1rem",
        "section-gap": "5rem",
        "gutter": "2rem",
        "container-max": "1440px",
        "stack-lg": "2rem",
        "stack-sm": "0.5rem"
      },
      "fontFamily": {
        sans: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
}
