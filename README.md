# Career-Portfolio

Interactive, animated portfolio for **Ahmed Khaled Al-Humaid**, built from the résumé in `assets/`.

Plain HTML/CSS/JS with no build step and no dependencies (only Google Fonts).

## Features

- A particle-text hero that spells the name, scatters around the cursor and morphs into a new word on click
- A custom cursor, magnetic buttons, text-scramble effects and a scroll-progress bar
- An "About" paragraph that lights up word by word as you scroll, plus animated counters and GPA gauges
- A timeline that draws itself on scroll
- 3D-tilt spotlight project cards, each with a live canvas animation. Click a card for a detail view with the architecture flow.
- A draggable 3D skill sphere; hover a category to highlight its skills
- An interactive terminal (`help`, `neofetch`, `projects`, `hire`, …)
- Confetti, plus a Konami-code party mode
- Honors `prefers-reduced-motion` and works on mobile

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (GitHub Pages)

Settings → Pages → Source: *Deploy from a branch* → select the branch and `/ (root)`.

## Customize

Set your LinkedIn profile URL in `LINKEDIN_URL` at the top of `js/main.js`.
