# Yetiface Games Website

A fast, static, themeable site for Yetiface Games. Content is driven from a single JSON file, so adding or editing sections, social icons, and legal pages is simple and code-light.

## What’s inside

- `index.html` – the HTML shell (loads CSS, fonts, and `js/index.js`)
- `css/`
  - `styles.css` – base layout, components, brand styles for social icons
  - `dark.css`, `light.css` – color themes (only colors; base structure lives in `styles.css`)
- `js/`
  - `index.js` – app bootstrap (loads data, renders header/sections/footer, manages spinner and theme)
  - `modules/headerRenderer.js` – builds the header (logo, title, theme toggle, social links)
  - `modules/sectionRenderer.js` – renders content sections (items, images, Steam buttons)
  - `modules/footerRenderer.js` – renders footer (company, year, links)
  - `modules/metaRenderer.js` – applies meta title/description
  - `modules/themeManager.js` – stores/restores theme selection (dark/light)
  - `modules/modalRenderer.js` – accessible modals (Privacy/Terms/Cookies) driven by JSON
  - `modules/steamUtils.js` – opens Steam client if available, falls back to web
- `data/`
  - `data.json` – the content file: site meta, header/social links, sections, footer, modals, cookie notice
- `assets/`
  - `logo/` – site logo (`logo.webp`)
  - `games/` – section images (e.g., game art)
  - `favicon/` – favicon files (`favicon.webp`, `favicon.png`)
  - `fonts/` – local fonts (e.g., `BAHNSCHRIFT.TTF`)

## Run locally

This is a plain static site. Use any simple static server to avoid CORS issues for fonts and preloads:

- VS Code users: Live Server (127.0.0.1:5500) works great.
- Or any static server you prefer.

Just open `index.html` via your server and you’re set.

## How content works (data.json)

Almost everything you see on the page comes from `data/data.json`.

### Meta

```
{
  "meta": {
    "title": "Yetiface Games - Indie Games",
    "description": "..."
  }
}
```

- Controls the `<title>` and the meta description.

### Header and Social Links

```
{
  "header": {
    "title": "Yetiface Games",
    "logo": "assets/logo/logo.webp",
    "socialLinks": [
      { "name": "X (Twitter)", "url": "https://x.com/YetifaceGames", "icon": "fab fa-x-twitter" },
      { "name": "Discord", "url": "https://discord.com/invite/...", "icon": "fab fa-discord" },
      { "name": "Instagram", "url": "https://www.instagram.com/yetifacegames", "icon": "fab fa-instagram" },
      { "name": "TikTok", "url": "https://www.tiktok.com/@yetifacegames", "icon": "fab fa-tiktok" },
      { "name": "YouTube", "url": "", "icon": "fab fa-youtube" },
      { "name": "Steam", "url": "https://steamcommunity.com/groups/YetifaceGames", "icon": "fab fa-steam" }
    ]
  }
}
```

- `title`: site title next to the logo.
- `logo`: path to the logo image in `assets/logo/`.
- `socialLinks`: array of icons rendered at the top right.
  - Hiding a link: set `url` to an empty string `""` and it will be skipped.
  - `icon` uses Font Awesome classes (brand icons).
  - Special Steam behavior:
    - For `store.steampowered.com/app/<id>` URLs, the site will try to open the Steam client via `steam://store/<id>` with a web fallback.
    - For other Steam URLs (store search, developer pages, `steamcommunity.com` groups), the site will try `steam://openurl/<full-url>` with a fallback to the web page if the client isn’t available.

### Sections (content)

```
{
  "sections": [
    {
      "title": "Games",
      "items": [
        {
          "heading": "Hollowbrook Appartments",
          "text": [
            "Line 1",
            "Line 2"
          ],
          "image": "assets/games/hollowbrook_appartments.webp",
          "steamUrl": "https://store.steampowered.com/app/3983920/Hollowbrook__Apartments/"
        }
      ]
    }
  ]
}
```

- `title`: section heading.
- `items`: cards within a section.
  - `heading`: card title.
  - `text`: either a string or an array of strings (each array item is a paragraph).
  - `image`: card image path.
  - `steamUrl`: optional; if present, a “Open in Steam” button is shown with the same client-first, web-fallback behavior.

### Footer

```
{
  "footer": {
    "companyName": "Yetiface Games LTD",
    "year": "auto",
    "additionalText": "All rights reserved.",
    "links": [
      { "name": "Privacy Policy", "url": "#privacy" },
      { "name": "Terms of Service", "url": "#terms" },
      { "name": "Cookie Policy", "url": "#cookies" }
    ]
  }
}
```

- `year`: set to `"auto"` to always show current year, or set a fixed string.
- `links`: footer links; hash links can open modals (see below).

### Modals (Privacy/Terms/Cookies)

```
{
  "modals": [
    { "id": "privacy", "title": "Privacy Policy", "content": ["..."] },
    { "id": "terms", "title": "Terms of Service", "content": ["..."] },
    { "id": "cookies", "title": "Cookie Policy", "content": ["..."] }
  ]
}
```

- Each modal is accessible: ESC to close, outside-click closes, focus management in place.
- Any link to `#<id>` opens the corresponding modal.

### Cookie Notice

```
{
  "cookieNotice": {
    "enabled": true,
    "message": "We do not use cookies for analytics or ads...",
    "moreText": "Learn more",
    "moreLink": "#cookies",
    "buttonText": "Got it"
  }
}
```

- When enabled, a minimal, theme-aware notice appears on first visit and hides permanently after dismissal.

## Changing logos, favicons, and fonts

### Logo

- Replace `assets/logo/logo.webp` and update the path in `data.header.logo` if you rename it.

### Favicons

- Replace files in `assets/favicon/` (`favicon.webp` plus a `favicon.png` fallback).
- `index.html` already references both:
  - `<link rel="icon" href="assets/favicon/favicon.webp" type="image/webp" />`
  - `<link rel="alternate icon" href="assets/favicon/favicon.png" type="image/png" />`

### Fonts

- Local font: `assets/fonts/BAHNSCHRIFT.TTF` declared in `css/styles.css` via `@font-face`.
- Preloaded in `index.html` for faster paint:
  - `<link rel="preload" href="assets/fonts/BAHNSCHRIFT.TTF" as="font" type="font/ttf" crossorigin="anonymous" />`
- If you add or change fonts:

1. Place your font files under `assets/fonts/`.
2. Add corresponding `@font-face` blocks in `css/styles.css`.
3. Add/update a `<link rel="preload" ...>` tag in `index.html`.
4. Ensure the `font-weight` you use in CSS/JS matches the `@font-face` declarations.

## Theming (dark/light)

- `css/styles.css` contains the layout and shared styles.
- `css/dark.css` and `css/light.css` override only colors/borders.
- The theme toggle stores the user preference in `localStorage` and immediately swaps the theme stylesheet via `#theme-style` link tag.
- Default theme is the one referenced in `index.html` by the `#theme-style` link (currently `css/dark.css`).

## Steam behavior

- Buttons and the Steam social icon use `js/modules/steamUtils.js`:
  - Try the Steam protocol first (`steam://store/<id>` for app pages, `steam://openurl/<url>` otherwise).
  - If Steam isn’t detected quickly, open the web URL in a new tab.

## Performance hints

- The app shows a simple spinner until the logo and the first content image finish loading (or time out), then reveals the page.
- Images below the fold use lightweight lazy loading via IntersectionObserver.
- Font load is preloaded and waited briefly to reduce FOUT.

## Adding a new social icon

1. In `data/data.json`, add to `header.socialLinks`:
   ```json
   { "name": "YouTube", "url": "", "icon": "fab fa-youtube" }
   ```
2. Leave `url` empty to hide it until ready; set to your channel link to show.
3. Brand styles can be added in `css/styles.css` as needed (YouTube styling already included).

## Adding a new game item

1. Drop an image in `assets/games/`.
2. Add an `items` entry in the relevant section:
   ```json
   {
   	"heading": "New Game",
   	"text": ["Short description"],
   	"image": "assets/games/new_game.webp",
   	"steamUrl": "https://store.steampowered.com/app/123456/Your_Game/"
   }
   ```
3. Omit `steamUrl` or set it to `""` to hide the Steam button.

## Deployment

- Any static hosting works (GitHub Pages, Netlify, Vercel, nginx, etc.).
- Ensure the site is served over HTTP(S) so font preloads and relative asset paths work as expected.

## Troubleshooting

- Preload warning for fonts:
  - Make sure the preload tag is before CSS and the `font-weight` in `@font-face` matches usage. The project registers both 400 and 100 for Bahnschrift.
- A social icon doesn’t appear:
  - Verify the `url` in `data.json` isn’t empty. Empty URLs are intentionally skipped.
- Steam icon doesn’t open the client:
  - Client detection is best-effort and timing-based; it always falls back to the web URL.

---

If you want to extend the site (e.g., add more modals, sections, or a contact form), the pattern is intentionally simple: add data to `data.json` and a bit of styling in CSS. The JS modules are small and easy to tweak if you need new rendering behaviors.# Yetiface
