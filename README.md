# Career-Portfolio

Interactive, animated portfolio for **Ahmed Khaled Al-Humaid**, built from the résumé in `assets/`.

Plain HTML/CSS/JS with no build step and no dependencies (only Google Fonts).

## Features

- A calm, professional dark theme with a single accent color, suitable for formal presentations
- A quiet starfield background with gentle parallax and a few softly twinkling stars
- A hero section with the full name, a rotating role line and the key credentials
- About, Education (a B.Sc. card with GPA gauges, the Cloud Computing concentration, First Honors, academic awards and coursework), Experience, Projects, Skills, Certificates & languages, and Contact sections
- Project cards with small diagrams that animate only on hover; click a card for details and the architecture flow
- Gentle fade-in on scroll, keyboard accessible, honors `prefers-reduced-motion` and works on mobile

## Performance notes

- The starfield is drawn once into images and moved only with GPU transforms while scrolling.
- Project diagrams stay still until hovered or focused, so nothing animates in the background.
- Scroll handling is batched to one update per frame.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (GitHub Pages)

Settings → Pages → Source: *Deploy from a branch* → select the branch and `/ (root)`.

## Customize

The LinkedIn link is `LINKEDIN_URL` at the top of `js/main.js`. Keep the `https://` prefix, or the browser treats it as a page on this site.
