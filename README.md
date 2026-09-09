# Contacto

A fast, white, contact-sheet Ghost theme for [luisnatera.photo](https://luisnatera.photo).

## Principles

- **No build step.** `assets/css/screen.css` and `assets/js/main.js` are the source files. Edit them directly, re-zip, upload.
- **No web fonts.** System grotesque for text, system mono for metadata. Zero font bytes.
- **One tiny script.** A dependency-free lightbox (~2 KB). Everything else is HTML and CSS.
- **Subscribe-first.** Sticky header CTA, homepage hero signup, end-of-post CTA. All wired to Ghost Members/Portal.

## Structure

- `default.hbs` — layout, header, footer
- `index.hbs` — hero signup (page 1, logged-out only) + contact-sheet grid
- `post.hbs` / `page.hbs` — article layouts with wide/full image breakouts
- `tag.hbs` / `author.hbs` — archives
- `partials/` — post-card, subscribe-form, subscribe-cta, pagination, navigation

## Theme settings (Ghost Admin → Design)

- `hero_tagline` — homepage line above the signup form (falls back to site description)
- `social_proof_text` — small mono line under signup forms
- `signup_disclaimer` — form disclaimer text
- `disable_lightbox` — turn off the image lightbox

Accent colour comes from Ghost Admin's brand accent colour.

## Package for upload

```bash
cd contacto && zip -r ../contacto.zip . -x "*.git*" -x "*.DS_Store"
```

Validate with `npx gscan .`
