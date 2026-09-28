# Career-Portfolio

Interactive, animated portfolio for **Ahmed Khaled Al-Humaid**, built from the résumé in `assets/`.

Plain HTML/CSS/JS with no build step and no dependencies (only Google Fonts).

## Features

- A big animated name on the front page: letters rise in, then lift and glow as the cursor passes over them. Behind it, a particle network follows the mouse and bursts into sparks on click.
- An animated space background across the whole page: parallax star layers, warp-speed streaks while scrolling, shooting stars and soft color clouds
- A custom cursor, magnetic buttons, text-scramble effects and a scroll-progress bar
- An "About" paragraph that lights up word by word as you scroll, plus animated counters and GPA gauges
- A timeline that draws itself on scroll
- 3D-tilt spotlight project cards, each with a live canvas animation. Click a card for a detail view with the architecture flow.
- A draggable 3D skill sphere; hover a category to highlight its skills
- A B.Sc. card with GPA gauges, the Cloud Computing concentration, First Class Honors and academic awards
- Labelled soft skills, plus a certificates section showing the Security Analyst path in progress
- Confetti, plus a Konami-code party mode
- Honors `prefers-reduced-motion` and works on mobile

## Performance notes

- The starfield is pre-rendered into images once and only moved with GPU transforms, and only while the page scrolls or the mouse moves.
- Cards use solid tinted backgrounds, not `backdrop-filter`. A live blur over a moving background has to be recomputed every frame.
- Scroll and pointer handlers are batched to one update per frame. Animations use `transform`/`opacity` rather than layout properties.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (GitHub Pages)

Settings → Pages → Source: *Deploy from a branch* → select the branch and `/ (root)`.

## Customize

The LinkedIn link is `LINKEDIN_URL` at the top of `js/main.js`. Keep the `https://` prefix, or the browser treats it as a page on this site.
