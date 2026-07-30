# Hi!
This should be my personal page. \
The idea is to create a portfolio to frame the best projects I've worked on so far. Plus a blog.

Plain HTML + CSS + JavaScript, no build step. The only library is [three.js](https://threejs.org/)
(for the donut), vendored in `vendor/` and loaded through an import map.
The font is self-hosted in `assets/fonts/`, the icons are inline SVGs.

# Run locally
```bash
npm run dev   # just python3 -m http.server 8000
```
(or any static file server — there is nothing to build)

# Deploy
Push to `main`: GitHub Pages serves the repository root directly.

# How to
- **Pages**: `/` (fixed home), `/projects/`, `/blog/`. Spinning the donut fast enough
  travels home → projects → blog → home (`nextPage` in each page's `initDonut` call).
- **Add a project**: add one entry to `projects.json` and drop the image in `assets/`.
- **Write a blog post**: copy `blog/2026-07-29-hello-blog.html`, rename it
  (`YYYY-MM-DD-title.html`), write the content, add one entry to `blog/posts.json`.
- **Update the CV**: replace `assets/cv_silverio_manganaro.pdf` (keep the filename).
- **Change the typewriter roles**: edit the `roles` list in `main.js` (and the
  `aria-label` on `#roles` in `index.html`).

# Tuning knobs

## Handwritten notes (home page)

All in `main.js` unless noted.

**Text of the notes** — `index.html`, the three `<span class="scribble">` elements.
Style (font size, rotation, colors) is in `style.css` under "handwritten notes":
the nav labels use `var(--accent)`, the donut one `var(--text)`.

**Where the labels land** — `placeScribbleLabels()`. Each label gets a random spot
inside its own area, one axis at a time: `rand(min, max)` in px, or
`rand(min, max) * W` / `* H` for viewport-relative ranges. Example: the projects
label picks `left` in 3–15% of the width and `top` between 105 and 150 px.
Keep the vertical bands of "projects" and "blog" disjoint and they can never
overlap each other.

**Arrow shape** — the `scribbleArrows` array, one entry per note:
- `target`: function returning the point to hit (`iconPoint('<id>')` for a nav
  icon, `donutScreenPoint` for the donut).
- `from`: `'top' | 'bottom'` — which edge of the label the tail grows from.
- `wobble`: how far (px) the curve bulges sideways; the sign picks the side.
  It is auto-capped at 22% of the arrow length so short arrows don't kink.
- `keep`: stop the tip this many px short of the target center (used for the
  donut so the arrow doesn't stab its middle).
- `startDir` / `endDir`: tangent directions at the two ends, `{x, y}` with
  y = -1 meaning up. `endDir` also orients the arrowhead — e.g. `{x: 0, y: -1}`
  makes the arrow finish from below, pointing up into the icon.

Inside `drawScribbleArrows()`: `len < 140` is the cutoff below which an arrow
becomes a single clean curve; the `14` in the arrowhead loop is its size in px;
stroke width/color are on `#scribble-canvas` in `style.css`.

## Other parameters

- **Donut feel** — top of `donut.js`: `TAP_IMPULSE` (spin added per tap),
  `TRAVEL_SPEED` (spin needed to travel to the next page), `MAX_SPEED`,
  `IDLE_SPEED`, and the travel destination is the `nextPage` argument each page
  passes to `initDonut`.
- **Typewriter** — `roles` list and, in `typewriter()`, the delays: 80 (type),
  40 (delete), 2000 (pause on full word), 400 (before next word).
- **Theme palettes** — `:root` and `:root[data-theme="dark"]` in `style.css`;
  everything derives from those variables, including the 3D scene backgrounds
  (`yellow` / `darkBg` at the top of `donut.js`, keep them in sync).
- **Post swipe** — `blog/post.js`: `70` px minimum horizontal drag and the
  `1.5` horizontal-vs-vertical ratio.
- **Back-to-top** — `site.js`: appears after `window.innerHeight * 0.6` of scroll.

# ToDOs

## general / home
- [X] fix blur effect on the borders [01.02.25]
- [ ] Optimize for Google search
- [X] CV download [29.07.26]
- [X] Writing effect [29.07.26]
- [X] blog section [29.07.26]
- [ ] blur until loaded
- [X] dark/light mode switch [28.04.25] — real theming with palette swap [29.07.26]

## 3D scene
- [ ] make model loading faster
- [X] movement of the donut on scrolling [01.02.25]
- [X] pointer parallax + tap the donut to spin it [29.07.26]

## projects section:
- [ ] update with thesis work
- [ ] RL project link
- [X] make more clear the separation between each project [28.04.25]
- [X] projects rendered from `projects.json` [29.07.26]
- [ ] transition between home and project (fixed on one until a "powerfull" scroll happens)
- [X] make the ↑ arrow to go back home better looking and the same in all OSs [01.02.25]
