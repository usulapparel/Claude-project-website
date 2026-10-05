# USUL — أصول

A website for an upscale apparel and fragrance house inspired by the culture and history of the Arab world. *Usul* is Arabic for origins, roots and first principles.

It's a plain static site with no build step. Open `index.html` in a browser, or deploy the folder to any static host (GitHub Pages, Netlify, Vercel).

```
index.html      Home: hero, the two houses, fragrances, apparel, heritage, journal, newsletter
product.html    Product page: the "Layl" Eau de Parfum
css/styles.css  Design system and layout
css/fonts.css   Self-hosted fonts (Bodoni Moda, Amiri, Jost; SIL Open Font License)
js/main.js      Menu, English/Arabic (RTL) toggle, tabs, bag, newsletter, scroll reveals
assets/         Khatam (eight-pointed star) pattern and favicon
```

## Design references (from styles.refero.design)

These three styles in the Refero library were the closest match out of its 1,342 entries:

1. **Bedouin's Daughter** (https://styles.refero.design/style/3043d3b9-6bcc-472b-b339-1013c37ef4ab)
   A fashion brand with Bedouin heritage. "Sun flare over black velvet": black surfaces, desert-butter yellow (`#f5e78d`) type and hairlines, a scrolling announcement bar, and pill-shaped links over dark photography.
   *Used for:* the announcement marquee, the heritage night band, the hero sunset plate and the footer.
2. **D.S. & DURGA** (https://styles.refero.design/style/391bd401-06d7-4444-8243-8573e96eab24)
   An independent perfumery laid out like a newspaper on bone-white paper. Oversized, tightly spaced display type, dusty-rose bands, vertical side labels, and no buttons or rounded corners.
   *Used for:* the "Smoke, saffron, stars." fragrance statement, the scent pyramid and the warm canvas colour.
3. **Franco Maria Ricci Editore** (https://styles.refero.design/style/6120469b-a1c8-46d3-b7fd-8aa6dc22c0d9)
   An Art Deco art-book publisher: burnished-gold hairlines on vellum and a single Bodoni typeface. Text links are written in brackets like `{ ORDER NOW }`, and product grids are divided by 1px rules.
   *Used for:* the typography, gold section rules, three-column product grids, the bracketed links and the split hero.

Runners-up: Aesop (apothecary formulary), Adam Lippes (Optima on cream), Incommonwith (oxblood ink on cream) and Maison Margiela.

## Arabic and cultural details

- Bilingual throughout. The **عربي** button switches the whole site to Arabic and mirrors the layout right-to-left; the choice is remembered.
- The Arabic font is Amiri (classical Naskh). Arabic text never gets letter-spacing, because spacing breaks the joined script.
- Motifs: the eight-pointed *khatam* star pattern, arch (*mihrab*) shaped image frames, Al Sadu stripes, and large Arabic calligraphy plates.
- Products and stories come from the region: oud, *luban* (frankincense), Taif rose, bakhoor, the bisht and the Incense Route.

## Placeholders to replace

- **Imagery.** The calligraphy and gradient "plates" (`.plate`) and line-drawn bottles stand in for photography. Swap in campaign and product photos, using `<img>` inside the same containers or a `--plate-bg: url(...)` style.
- **Copy, prices and product names** are illustrative.
- **The brand name.** "USUL / أصول" was inferred from the account name. Search for `USUL` and `أصول` to change it.
- **Commerce.** The bag count and newsletter are front-end only. Connect them to Shopify or another store backend when ready.
