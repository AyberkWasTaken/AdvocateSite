# Agent Handoff — Av. Enes Aktaş Hukuk Ofisi Website

## Project Overview
A professional law-firm website for **Av. Enes Aktaş** (advocate/lawyer, Eskişehir Bar Association).
Built by the user's brother-in-law's request, maintained by the user (cagla.ba06@gmail.com).
**Domain:** https://avukatenes.av.tr (hosted on Vercel)
Office: Alanönü Mah. Gayret Sok. Demirci Apt. No:2 D:11, 26030 Odunpazarı / Eskişehir

## OPEN REMINDERS — Raise these with the user at the start of every session

| # | Reminder | Status |
|---|---|---|
| 1 | **Domain DNS** — A record (`216.198.79.1`) and CNAME (`www` → `cfaf2b4c7f969497.vercel-dns-017.com`) added in METUnic panel. `SITE_URL=https://www.avukatenes.av.tr` set in Vercel env vars. | DONE |
| 2 | **Blog database** — Blog posts are stored in `data/blogPosts.json`. Vercel's filesystem is read-only in production, so posts created via the admin panel on the live site **will not save**. Need to replace `utils/blogStore.js` with a real database (recommended: Vercel KV, Supabase, or PlanetScale). Until then, posts can only be added by editing `blogPosts.json` locally and pushing to GitHub. | NOT DONE |
| 3 | **SEO — manual actions** — Technical SEO is done in code. Remaining actions for Enes Aktaş: (a) create Google Business Profile at business.google.com, (b) collect Google reviews from clients, (c) submit sitemap at Google Search Console using `https://avukatenes.av.tr/sitemap.xml`, (d) write blog posts targeting keywords like "Eskişehir boşanma davası". See SEO table below for full list. | NOT DONE |

---

## Tech Stack
| Layer | Technology |
|---|---|
| Runtime | Node.js (ES Modules — `"type": "module"`) |
| Framework | Express 5 (`express@^5.2.1`) |
| Templating | EJS 5 (`ejs@^5.0.1`) |
| Email | Nodemailer (`nodemailer@^8.0.4`) |
| Config | dotenv (`dotenv@^17.3.1`) |
| CSS | Vanilla CSS (mobile-first, no framework) |
| Font | DM Sans (Google Fonts) |
| Dev | `node --watch app.js` |

**No Webpack, no React, no Tailwind, no Bootstrap.** Keep it this way.

## File Structure
```
app.js                   — Express entrypoint (port 3000 / $PORT)
routes/
  pageRoutes.js          — Public pages (GET /, /about, /services, /contact, /blog, /blog/:slug + POST /contact)
  adminRoutes.js         — Admin panel (GET /admin, POST /admin/posts)
middleware/
  basicAuth.js           — HTTP Basic Auth guard for /admin
utils/
  blogStore.js           — File-based blog CRUD (reads/writes data/blogPosts.json)
  mail.js                — Nodemailer contact form sender
data/
  blogPosts.json         — Blog post storage (array of post objects)
  adminCredentials.json  — Admin username/password (gitignored)
views/
  partials/
    head.ejs             — <!DOCTYPE>, <head>, opens <body>
    nav.ejs              — Sticky header + mobile hamburger nav
    footer.ejs           — Dark 3-column footer + closes </body></html>
  pages/
    home.ejs             — Landing page (hero + why-us + recent posts)
    about.ejs            — Professional bio + credentials + values
    services.ejs         — 6 practice areas with detail lists
    contact.ejs          — Contact form + office info sidebar
    blog-list.ejs        — Blog post grid
    blog-detail.ejs      — Single post with paragraph rendering
    404.ejs              — Custom 404 page
    admin-setup-needed.ejs — Shown when admin credentials missing
  admin/
    dashboard.ejs        — Blog post creation form + post list
public/
  css/main.css           — All styles (theme variables + components)
  js/main.js             — Mobile nav toggle (hamburger)
```

## CSS Architecture
- **Theme variables** in `:root` — edit only `--theme-*` hex codes to recolor the site.
- Color palette: deep navy (`#0c4a6e`) → mid blue (`#0369a1`) → sky accent (`#0ea5e9`) → light blue bg (`#dbeafe`).
- Mobile-first: base styles for small screens, `min-width` media queries for wider.
- Key breakpoints: 420px, 480px, 600px, 640px, 720px, 768px, 960px, 1024px.
- `--radius: 14px`, `--tap-min: 44px` (touch target), `--font: "DM Sans"`.

### Component classes to know
| Class | Used on |
|---|---|
| `.hero--home` | Home page dark gradient hero |
| `.why-card` | Home "Neden Av. Enes Aktaş?" 3-col section |
| `.value-card` | About page principles section |
| `.credential-card` | About page sidebar info card |
| `.service-card` | Services page practice area cards |
| `.contact-layout` | Contact page 2-col grid (form + info) |
| `.post-article` / `.post-content` | Blog detail page |
| `.error-page` / `.error-code` | 404 page |
| `.footer-grid` | Dark 3-col footer (brand / links / contact) |
| `.empty-state` | Shown when no blog posts exist |
| `.btn--primary-dark` | Navy filled button (inner pages) |
| `.btn--outline-primary` | Outlined navy button (about page) |
| `.btn--full` | Full-width blue button (credential card) |
| `.section-lead` | Muted subtitle below page headings |
| `.page-header` | Wrapper for h1 + section-lead on inner pages |

## Admin Panel
- URL: `/admin` — **not linked from public nav** (intentional — access by direct URL).
- Protected by HTTP Basic Auth (`middleware/basicAuth.js`).
- Credentials loaded from: `$ADMIN_USERNAME`/`$ADMIN_PASSWORD` env vars → `data/adminCredentials.json` → `data/adminCredentials.example.json` (fallback, logs a warning).
- Features: create blog posts (title, summary, content). No edit/delete yet.

## Blog System
- Posts stored in `data/blogPosts.json` as a JSON array.
- Each post: `{ id, title, slug, summary, content, publishedAt }`.
- `publishedAt` is ISO date string (`YYYY-MM-DD`).
- Slugs auto-generated from title (lowercase, hyphens). Duplicate slugs are rejected.
- `content` field supports double-newline paragraph breaks — `blog-detail.ejs` splits on `\n\n`.
- Home page shows 3 most recent posts; `/blog` shows all.

## Contact Form
- POST `/contact` → validates fields → sends via Nodemailer → redirects with `?success=1` or `?error=...`.
- Requires `.env` with: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO`.
- If unconfigured, shows a user-friendly error (does not crash).

## Placeholder Content to Replace
The following values are **placeholders** that need real information from Av. Enes Aktaş:
- Phone: `+90 5XX XXX XX XX` (in `footer.ejs`, `contact.ejs`, and Schema.org in `head.ejs`)
- Email: `info@enesaktashukuk.com` (in `footer.ejs`, `contact.ejs`, and Schema.org in `head.ejs`)
- Bar registration number (not yet shown — could be added to `footer.ejs` `.footer-bar-info`)
- About page bio — currently generic placeholder Turkish text; Enes Aktaş should provide real text

## What Was Changed (last major refactor)
- **nav.ejs**: Removed public admin link (admin accesses `/admin` directly).
- **footer.ejs**: Full rewrite — dark navy 3-column layout (brand, page links, contact info).
- **home.ejs**: Added "Neden Av. Enes Aktaş?" 3-card trust section; empty state when no blog posts.
- **about.ejs**: Full rewrite — intro with avatar initials, professional bio, credentials sidebar, 3 values.
- **services.ejs**: Full rewrite — 6 practice areas (Aile, İş, Ceza, İcra-İflas, Gayrimenkul, Tüketici/Ticaret) with bullet lists.
- **contact.ejs**: Two-column layout — form on left, office info card + note on right.
- **blog-detail.ejs**: Content now renders as paragraphs (splits on `\n\n`).
- **404.ejs**: Styled error page with large `404` numeral.
- **main.css**: Replaced footer section + appended ~400 lines of new component styles.

## SEO Status & Reminders

Technical SEO has been implemented in code (meta descriptions, Open Graph, Schema.org JSON-LD, sitemap.xml). The following actions still require Enes Aktaş to do them manually — **remind the user about these at the start of every session:**

| Priority | Action | Who | Status |
|---|---|---|---|
| 1 | Create & verify **Google Business Profile** at business.google.com — most important for Eskişehir local search | Enes Aktaş | NOT DONE |
| 2 | Meta descriptions, Schema.org, Open Graph, sitemap.xml added to site | Code | DONE |
| 3 | Collect **Google reviews** from past clients — even 10–15 reviews ranks above most competitors | Enes Aktaş | NOT DONE |
| 4 | Add listing to **Eskişehir Barosu** lawyer directory with matching name/address/phone | Enes Aktaş | NOT DONE |
| 5 | Write **blog posts** targeting local keywords: "Eskişehir boşanma davası", "Odunpazarı iş avukatı", etc. — the admin panel is ready for this | Enes Aktaş | NOT DONE |
| 6 | `/sitemap.xml` added to site — submit it at **Google Search Console** (search.google.com/search-console) | Enes Aktaş | NOT DONE |
| 7 | Set `SITE_URL=https://avukatenes.av.tr` in Vercel Environment Variables — used in sitemap and Open Graph URLs (hardcoded as fallback in `app.js` already) | Enes Aktaş | NOT DONE |

> **NAP rule:** Name, Address, Phone must be byte-for-byte identical on the website, Google Business Profile, and bar directory. Even "No: 2" vs "No:2" can hurt ranking.

## Known Gaps / Future Work
- Blog has no **edit or delete** — admin can only create posts.
- No **image support** — no `/public/images` directory yet.
- `og:image` not set — no site image exists yet; add one to public/ and reference it in head.ejs.
- Bar registration number not yet shown anywhere on the site.
- Phone and email in footer/contact are still placeholders — need real values from Enes Aktaş.
- The about page bio is placeholder text — Enes Aktaş should provide real text.

## Running Locally
```bash
npm install
cp data/adminCredentials.example.json data/adminCredentials.json   # then edit it
# create .env with SMTP_HOST / SMTP_USER / SMTP_PASS / MAIL_TO if you want email
npm run dev     # node --watch app.js — auto-restarts on file changes
```
Visit `http://localhost:3000`. Admin at `http://localhost:3000/admin`.
