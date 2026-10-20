# UṢŪL — Usul Collective

**Stories That Shape Us.** A website for Usul Collective, an apparel and fragrance brand rooted in Arab and Islamic history, for those who refuse to forget where they come from.

It's a plain static site with no build step. Open `index.html` in a browser.

The live site is served by GitHub Pages from this branch at **shop.usulapparel.com** (`CNAME` names the domain; `.nojekyll` serves the files as they are). The Shopify store stays at usulapparel.com, and the site's Bag and product links point there.

```
index.html      Home: tagline hero, Who We Are, Follow·Learn·Share, apparel/fragrance, products, quote, stories, newsletter
product.html    Product page: the "Ṣumūd" tee (gallery, colour/size pickers, "added to bag" dialog, specs, reviews, pairs well with)
shop.html       All products: every item in the Shopify store, with category, country and sort controls (css/shop.css, js/shop.js)
js/shop-data.js The catalog shop.html shows, copied from Shopify (names, prices, photos, categories, countries)
fragrances.html Fragrances: Levant, Desert Rose, Rose Oud and Yasmin with their notes and an Add to bag button each (css/fragrances.css)
fragrances-scroll.html  Fragrances, scroll version: each bottle stays pinned while its name, story and notes arrive as you scroll (css/fragrances-scroll.css, js/fragrances-scroll.js)
css/styles.css  Design system and layout
css/fonts.css   Self-hosted fonts (Marcellus, Reem Kufi, IBM Plex Sans Arabic; SIL Open Font License)
js/main.js      Menu, English/Arabic (RTL) toggle, tabs, product options, bag + upsell dialog, newsletter, scroll reveals
assets/         Logo mark, favicon, brand and product photography (assets/img)
```

## Brand (from the Usul Brand Guide and the Ṣumūd product design)

Colours, copy and photography follow `Usul_Rebrand.pdf`. The look of the pages (the scrolling clay announcement bar, the pine header with a centred wordmark, Marcellus headings, Reem Kufi Arabic display lines, square corners, the product page layout and the footer) follows the owner's Ṣumūd product design made in Claude Design.

- **Logo:** the **UṢŪL** wordmark, set in Marcellus and widely tracked. The teardrop أصول calligraphy mark from the guide is kept as `assets/logo-mark.svg` (inlined as `#logo` on the home page) and used on the newsletter panel.
- **Colours:**

  | Name | Hex | Used for |
  |------|-----|----------|
  | Pine | `#263530` | Header, footer, dark panels, text on cream |
  | Olive | `#577343` | "Behind the stamp" panel, button hover, text links |
  | Leaf | `#688C4F` | Reserved for small accents |
  | Cream | `#F2E9CE` | Page background, type on pine |
  | Clay | `#A67C49` | Announcement bar, prices, Arabic sub-lines, primary buttons, footer headings |

- **Type:** Helvetica for Latin text and Snaga Arabic Text for Arabic, as the guide specifies. Headings and the wordmark use Marcellus, Roman inscriptional capitals chosen because their even stroke and open shapes sit naturally beside Reem Kufi, which sets the Arabic display lines (product names, sub-lines). Marcellus has no Ṣ (and no combining dot to build one), so in display text the letter is written as a plain `S` wrapped in `<span class="dot">`, and the dot is drawn beneath it by CSS; `dotted()` in `js/main.js` does the same for the name shown in the "added to bag" dialog. Body text keeps the real Ṣ character.
- **Layout:** full-bleed, square-cornered sections stacked edge to edge, as in the product design.
- **Photography:** the guide's sepia images (olive harvest, courtyard, scholar painting), in `assets/img`. The fourth image in the guide, a reel credited to @archiveafrica, is not used because it isn't Usul's to publish.
- **Copy:** the tagline, "Who We Are", "Follow. Learn. Share.", the quote "You will learn by reading, but you will understand with love." and @usul_collective all come from the guide.

### Fonts to finish

- **Snaga Arabic Text is an Adobe Font,** so it can't be bundled here. IBM Plex Sans Arabic stands in for it in body text. To use Snaga, add your Adobe Fonts kit to the `<head>` of both pages (`<link rel="stylesheet" href="https://use.typekit.net/XXXXXXX.css">`). The CSS already lists `snaga-arabic-text` first, so it takes over automatically.
- **Helvetica** comes from the visitor's system. Where it isn't installed, Arial is used.

## Layout references (from styles.refero.design)

The page structure keeps the restraint of three Refero styles: [YSL](https://styles.refero.design/style/bb2a2b0b-c84e-48ee-9dd9-7b623f81a422) (full-screen imagery, a centred wordmark, a see-through menu over the hero), [Maison Margiela](https://styles.refero.design/style/44a6d2a5-16ef-42cd-a69c-33a7af16638d) (small widely spaced labels, serif product names, text links, flush product tiles) and [AATHER](https://styles.refero.design/style/3b080dc3-1992-43fe-91d6-2a721f934435) (serif captions over imagery, fine rules). Where the references and the brand guide differ, the brand guide wins.

## Arabic

- Bilingual throughout. The **عربي** button switches the whole site to Arabic and mirrors the layout right-to-left; the choice is remembered.
- Arabic text never gets letter-spacing, because spacing breaks the joined script.

## Placeholders to replace

- **Product photos.** The Ṣumūd tee, Gibran, Darwish, Ez-Zitouna and Levant photos come from the product design. The Ṣumūd gallery has one photo; the design calls for four (embroidery detail, faded black, on the rack, faded bone). To add more, drop a `<button>` per photo into `.gallery__thumbs` on `product.html` (copy the existing one and change `data-src`, `data-label` and the `<img>`); the thumbnail column shows itself once there are two or more.
- **Fragrance bottles and flasks** on the home page are still drawn SVG scenes, toned to match the photography. To use a product photo, replace the `<svg class="art">` inside a `.plate` with `<img src="..." alt="...">`.
- **Reviews, the rating and the "38 reviews" count** on the product page are placeholders from the design. Replace them with real reviews before launch.
- **Products and prices** match the Usul Apparel Shopify store (October 2026). Update them here if they change in Shopify. The product page reviews are still placeholders.
- **Commerce.** Product tiles link to their pages on usulapparel.com. The bag keeps Shopify variant IDs (`data-variants` / `data-variant` on the product form and upsell buttons) and hands them to Shopify with a cart permalink (`usulapparel.com/cart/<variant>:<qty>,…`) when the shopper clicks Bag or Checkout.
- **All products page.** `js/shop-data.js` is a copy of the Shopify catalog from October 2026, so new products, price changes and removals in Shopify don't show on `shop.html` until that file is updated. Three products have no or a mismatched type in Shopify and are filed here by hand: Yasmin (Fragrance), Another Day in the South (T-shirts) and The South Welcomes You (Hats).
- **Newsletter.** The signup form subscribes emails to the Klaviyo "Newsletter" list (double opt-in, so subscribers confirm by email). The site and list IDs are at the top of the newsletter block in `js/main.js`.
