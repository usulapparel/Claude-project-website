# USUL — أصول

A website for an upscale apparel and fragrance house inspired by the culture and history of the Arab world. *Usul* is Arabic for origins, roots and first principles.

It's a plain static site with no build step. Open `index.html` in a browser, or deploy the folder to any static host (GitHub Pages, Netlify, Vercel).

```
index.html      Home: moonlit dunes hero, apparel/fragrance diptych, fragrances, LAYL feature, apparel, ritual, the house, newsletter
product.html    Product page: the "Layl" Eau de Parfum
css/styles.css  Design system and layout
css/fonts.css   Self-hosted fonts (Bodoni Moda, Cormorant Garamond, Inter, Amiri; SIL Open Font License)
js/main.js      Menu, English/Arabic (RTL) toggle, header on scroll, tabs, bag, newsletter, scroll reveals
assets/         Favicon
```

## Design references (from styles.refero.design)

The direction is stark black and white. From the 1,342 styles in the Refero library, these three were the closest match:

1. **YSL** (https://styles.refero.design/style/bb2a2b0b-c84e-48ee-9dd9-7b623f81a422)
   "A black-and-white cinema still": only pure black and pure white, full-screen photography, a plain centred wordmark, and a see-through menu laid over the hero.
   *Used for:* the hero, the uppercase captions over images, the black LAYL band and the black footer.
2. **Maison Margiela** (https://styles.refero.design/style/44a6d2a5-16ef-42cd-a69c-33a7af16638d)
   "Gallery wall with a whisper": near-black ink on white and off-white, tiny widely spaced labels, serif product names, and underlined text links instead of buttons.
   *Used for:* the announcement bar, the product tiles, the centred brand statement, the off-white heritage section and the rounded newsletter field.
3. **AATHER** (https://styles.refero.design/style/3b080dc3-1992-43fe-91d6-2a721f934435)
   A candle and scent studio in near-total monochrome ("quiet luxury held in stillness"): thin serif type over images, 1px underlined links and fine rules.
   *Used for:* the "ritual of bakhoor" image with its thin serif caption, and the fine rules in the heritage section.

Runners-up: SSENSE, Zara, COS and CHAIBOY.

## Arabic and cultural details

- Bilingual throughout. The **عربي** button switches the whole site to Arabic and mirrors the layout right-to-left; the choice is remembered.
- The Arabic font is Amiri (classical Naskh). Arabic text never gets letter-spacing, because spacing breaks the joined script.
- Motifs, kept strictly black and white: the moonlit desert, bakhoor smoke rising from a *mabkhara* (incense burner), the bisht's drape, and Al Sadu weave bands.
- Products and stories come from the region: oud, *luban* (frankincense), Taif rose, bakhoor, the bisht and the Incense Route.

## Placeholders to replace

- **Imagery.** Every image is a grayscale SVG scene (moonlit dunes, black and clear glass bottles, attar flasks, bakhoor smoke, draped wool and linen, an Al Sadu weave), inlined at the top of each page. They stand in for black-and-white photography. To use a photo, replace the `<svg class="art">` inside a `.plate` with `<img src="..." alt="...">`; the CSS fills the frame and turns the image grayscale.
- **Copy, prices and product names** are illustrative.
- **The brand name.** "USUL / أصول" was inferred from the account name. Search for `USUL` and `أصول` to change it.
- **Commerce.** The bag count and newsletter are front-end only. Connect them to Shopify or another store backend when ready.
