# How to Change the Display Font in Civic.ai

Currently, the primary display font is set up via Next.js `localFont` targeting a file located in `public/fonts/`. These are the step-by-step instructions for replacing the font.

## Method 1: Using a Local Custom Font File (.woff2, .ttf, .otf)

### Step 1: Add the new font file
Place your new font file into the `public/fonts/` directory of your project:
`public/fonts/Your-New-Font-File.woff2`

### Step 2: Update `src/app/layout.tsx`
Open `src/app/layout.tsx` and update the local font configuration pointing to `tanAegean` to point to your new font.

Currently, it looks like this:
```tsx
const tanAegean = localFont({
  src: "../../public/fonts/TAN-AEGEAN-Regular.ttf", // <-- Update this path
  variable: "--font-display",
  display: "swap",
});
```

Change it to match your new font:
```tsx
const myNewDisplayFont = localFont({
  src: "../../public/fonts/Your-New-Font-File.woff2", // Replace with your font's exact filename
  variable: "--font-display",
  display: "swap",
});
```

### Step 3: Apply the new font variable
In the same `src/app/layout.tsx` file, scroll down to the `<body>` tag and replace `${tanAegean.variable}` with your new font's variable name:

```tsx
<body className={`antialiased ${helvetica.variable} ${myNewDisplayFont.variable} font-sans`}>
```

---

## Method 2: Using a Google Font

If you want to use a Google Font, Next.js provides built-in optimization so you don't even need to download any font files.

### Step 1: Update the imports in `src/app/layout.tsx`
Remove the localFont import if you are no longer using it, and add the Google Font import:
```tsx
import { Playfair_Display } from "next/font/google"; // For example, Playfair Display
```

### Step 2: Configure the external font
Define the font configuration:
```tsx
const displayFont = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
```

### Step 3: Ensure it is passed into the `<body>` element
```tsx
<body className={`antialiased ${helvetica.variable} ${displayFont.variable} font-sans`}>
```

Once you save the file, Next.js will parse the new font variable and inject it into your website's `--font-display` CSS variable natively.
