# UṢŪL — Usul Collective

**Stories That Shape Us.** A website for Usul Collective, an apparel and fragrance brand rooted in Arab and Islamic history, for those who refuse to forget where they come from.

It's a plain static site with no build step. Open `index.html` in a browser, or deploy the folder to any static host (GitHub Pages, Netlify, Vercel).

```
index.html      Home: tagline hero, Who We Are, Follow·Learn·Share, apparel/fragrance, products, quote, stories, newsletter
product.html    Product page: the "Layl" Eau de Parfum
css/styles.css  Design system and layout
css/fonts.css   Self-hosted fonts (EB Garamond, IBM Plex Sans Arabic; SIL Open Font License)
js/main.js      Menu, English/Arabic (RTL) toggle, header on scroll, tabs, bag, newsletter, scroll reveals
assets/         Logo mark, favicon, brand photography (assets/img)
```

## Brand (from the Usul Brand Guide)

Everything brand-specific follows `Usul_Rebrand.pdf`:

- **Logo:** the teardrop أصول calligraphy mark, extracted from the guide as vector artwork (`assets/logo-mark.svg`, and inlined as `#logo` in each page). The **UṢŪL** wordmark sits beside it.
- **Colours:**

  | Name | Hex | Used for |
  |------|-----|----------|
  | Pine | `#263530` | Text, dark panels, announcement bar, buttons |
  | Olive | `#577343` | Button hover |
  | Leaf | `#688C4F` | Small accents on dark panels |
  | Cream | `#F2E9CE` | Light panels, type on photos and dark panels |
  | Clay | `#A67C49` | Arabic sub-lines, footer headings |

- **Type:** Helvetica for Latin text and Snaga Arabic Text for Arabic, as the guide specifies. Headings, the tagline and the wordmark use a Garamond serif (EB Garamond), matching the guide's headings.
- **Layout:** large rounded cream and pine panels inset from the page edge, as in the guide.
- **Photography:** the guide's sepia images (olive harvest, courtyard, scholar painting), in `assets/img`. The fourth image in the guide, a reel credited to @archiveafrica, is not used because it isn't Usul's to publish.
- **Copy:** the tagline, "Who We Are", "Follow. Learn. Share.", the quote "You will learn by reading, but you will understand with love." and @usul_collective all come from the guide.

### Fonts to finish

- **Snaga Arabic Text is an Adobe Font,** so it can't be bundled here. IBM Plex Sans Arabic stands in for it. To use Snaga, add your Adobe Fonts kit to the `<head>` of both pages (`<link rel="stylesheet" href="https://use.typekit.net/XXXXXXX.css">`). The CSS already lists `snaga-arabic-text` first, so it takes over automatically.
- **Helvetica** comes from the visitor's system. Where it isn't installed, Arial is used.
- **EB Garamond draws the macron on "Ū" off-centre,** so the wordmark's macron is drawn in CSS (`.macron`). Screen readers still get "UṢŪL".

## Layout references (from styles.refero.design)

The page structure keeps the restraint of three Refero styles: [YSL](https://styles.refero.design/style/bb2a2b0b-c84e-48ee-9dd9-7b623f81a422) (full-screen imagery, a centred wordmark, a see-through menu over the hero), [Maison Margiela](https://styles.refero.design/style/44a6d2a5-16ef-42cd-a69c-33a7af16638d) (small widely spaced labels, serif product names, text links, flush product tiles) and [AATHER](https://styles.refero.design/style/3b080dc3-1992-43fe-91d6-2a721f934435) (serif captions over imagery, fine rules). Where the references and the brand guide differ, the brand guide wins.

## Arabic

- Bilingual throughout. The **عربي** button switches the whole site to Arabic and mirrors the layout right-to-left; the choice is remembered.
- Arabic text never gets letter-spacing, because spacing breaks the joined script.

## Placeholders to replace

- **Product imagery.** Bottles, flasks, fabric and the Al Sadu weave are drawn SVG scenes, toned to match the photography. To use a product photo, replace the `<svg class="art">` inside a `.plate` with `<img src="..." alt="...">`; the CSS fills the frame.
- **Products, prices and descriptions** are illustrative.
- **Commerce.** The bag count is front-end only; connect it to Shopify (or another store) when ready.
- **Newsletter.** The signup form subscribes emails to the Klaviyo "Newsletter" list (double opt-in, so subscribers confirm by email). The site and list IDs are at the top of the newsletter block in `js/main.js`.
