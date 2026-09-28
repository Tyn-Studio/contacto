# Contacto

A fast, white, contact-sheet Ghost theme for [luisnatera.photo](https://luisnatera.photo).

## Principles

- **No build step.** `assets/css/screen.css` and the two small scripts in `assets/js/` are the source files. Edit them directly, upload.
- **Two tiny scripts.** A dependency-free lightbox (`main.js`) and a portfolio gallery viewer (`gallery.js`). Everything else is HTML and CSS.
- **Subscribe-first.** Homepage photo hero with signup, newsletter landing page, end-of-post CTA, members space. All wired to Ghost Members/Portal, free tier only.
- **One layout system.** A thin page-edge gutter (`--gutter`) and a shared title x-position (`--title-inset`) keep the hero, grids, and every page title aligned.

## Typography

Headings and body come from Ghost Admin custom fonts (currently Space Grotesk + Lora) via `--gh-font-heading` / `--gh-font-body`, with system fallbacks. Metadata (dates, counters, captions) uses the system mono stack.

## Structure

- `default.hbs` — layout, header (Sign in / Account), footer
- `index.hbs` — full-viewport photo hero (cover image + title overlay + stats + signup) and contact-sheet grid
- `post.hbs` / `page.hbs` — article layouts with wide/full image breakouts; `page.hbs` also renders `#portfolio` gallery pages and gates members-only pages
- `page-portfolio.hbs` — portfolio index: one large photo per project, title on hover
- `page-newsletter.hbs` — split signup hero (photo + panel) and the full issue archive as a contact-sheet grid
- `page-members.hbs` — members space: benefits + signup when logged out, goodies grid (`#members` pages) when signed in
- `tag.hbs` / `author.hbs` — archives
- `partials/` — post-card, subscribe-form, subscribe-cta, pagination, navigation

## Content conventions

- **Portfolio gallery** = a page tagged `#portfolio` with images in the body; excerpt is the intro paragraph, feature image is the cover. The viewer (arrows, counter, keyboard, swipe) is progressive enhancement.
- **Members goodie** = a page tagged `#members` with visibility "Members only"; non-members see a subscribe gate.

## Theme settings (Ghost Admin → Design)

- `hero_tagline` / `hero_tagline_line_2` — the two homepage tagline lines (fall back to site description)
- `social_proof_1/2/3` — the three counter columns; auto-updated daily from live Ghost data by `update-social-proof.py` in the photo-analytics repo (edit that script, not these values)
- `social_proof_text` — mono line used by the text-only hero fallback and post CTA
- `signup_disclaimer` — form disclaimer text
- `disable_lightbox` — turn off the image lightbox

Accent colour comes from Ghost Admin's brand accent colour. The hero photo is the publication cover image.

## Deploy

```bash
ghst theme validate .
ghst theme upload --zip .
```

The theme uploads under its `package.json` name (`contacto`) and replaces the active copy in place.
