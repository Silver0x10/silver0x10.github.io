import { initDonut } from '/donut.js';
import '/site.js';

// home page: fixed viewport, spinning the donut fast takes you to the projects
initDonut({ nextPage: '/projects/', scrollSpin: false });

// ### handwritten notes
// Both ends of each arrow are parametrized: the tail starts at the label
// (positioned in CSS) and the tip reaches the target, whatever the screen size.

// where the donut sits on screen: world (0.5, -0.5) through the ortho camera
function donutScreenPoint() {
    const aspect = window.innerWidth / window.innerHeight;
    return {
        x: (0.5 / aspect + 1) / 2 * window.innerWidth,
        y: 0.75 * window.innerHeight,
    };
}

// wobble bends the curve sideways; keep: distance (px) between tip and target
// center; startDir/endDir: the tangent directions where the arrow leaves the
// label and where it lands on the target (y up = -1)
const scribbleArrows = [
    { label: 'scribble-projects', target: () => iconPoint('rocket'), from: 'top', wobble: -42, keep: 0, startDir: { x: -0.3, y: -1 }, endDir: { x: 0, y: -1 } },
    { label: 'scribble-blog', target: () => iconPoint('pencil'), from: 'top', wobble: 46, keep: 0, startDir: { x: 0.2, y: -1 }, endDir: { x: 0, y: -1 } },
    { label: 'scribble-donut', target: donutScreenPoint, from: 'bottom', wobble: 60, keep: 150, startDir: { x: 0.2, y: 1 }, endDir: { x: 0.2, y: 1 } },
];

function iconPoint(id) {
    const rect = document.getElementById(id).getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.bottom + 6 };
}

// each label lands somewhere random inside its own area, every visit
const rand = (min, max) => min + Math.random() * (max - min);

// The notes live in a strip under the nav that the hero may never enter, so a
// label (and its arrow, which only goes upwards from there) can never end up
// on top of the hero text, whatever the browser or the window height.
function notesStrip() {
    const navBottom = document.querySelector('nav').getBoundingClientRect().bottom;
    const line = document.getElementById('scribble-projects').offsetHeight || 34;
    return { top: navBottom + 4, bottom: navBottom + 4 + line * 2.6 };
}

// the hero is anchored to the bottom: if it is tall enough to reach the strip,
// scale it down (it never grows above its designed size)
function fitHero() {
    const hero = document.getElementById('hero');
    hero.style.setProperty('--hero-scale', '1');
    const rect = hero.getBoundingClientRect(); // unscaled, we just reset it
    const room = rect.bottom - notesStrip().bottom;
    if (rect.height > room) {
        hero.style.setProperty('--hero-scale', Math.max(0.5, room / rect.height));
    }
}

function placeScribbleLabels() {
    const W = window.innerWidth, H = window.innerHeight;
    const strip = notesStrip();
    const line = document.getElementById('scribble-projects').offsetHeight || 34;
    // random spot inside the strip, the two labels in disjoint bands
    const band = (from, to) => strip.top + (strip.bottom - strip.top - line) * rand(from, to);

    const projects = document.getElementById('scribble-projects');
    projects.style.left = rand(0.01, 0.02) * W + 'px';
    projects.style.top = band(0, 0.45) + 'px';

    const blog = document.getElementById('scribble-blog');
    blog.style.left = rand(0.262, 0.40) * W + 'px';
    blog.style.top = band(0.55, 1) + 'px';

    const donut = document.getElementById('scribble-donut');
    donut.style.right = rand(0.03, 0.12) * W + 'px';
    donut.style.top = rand(0.14, 0.30) * H + 'px';
}

function drawScribbleArrows() {
    const canvas = document.getElementById('scribble-canvas');
    canvas.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    let markup = '';

    const norm = v => { const l = Math.hypot(v.x, v.y) || 1; return { x: v.x / l, y: v.y / l }; };

    for (const { label, target, from, wobble, keep, startDir, endDir } of scribbleArrows) {
        let arrow = ''; // this arrow's strokes, grouped so it can be checked
        const rect = document.getElementById(label).getBoundingClientRect();
        // the tail starts right against the writing
        const start = from === 'top'
            ? { x: rect.left + rect.width * 0.35, y: rect.top - 1 }
            : { x: rect.left + rect.width * 0.4, y: rect.bottom + 1 };
        let end = target();

        let dx = end.x - start.x, dy = end.y - start.y;
        let len = Math.hypot(dx, dy) || 1;
        if (keep) { // stop the tip short of the target center
            end = { x: end.x - dx / len * keep, y: end.y - dy / len * keep };
            dx = end.x - start.x; dy = end.y - start.y;
            len = Math.hypot(dx, dy) || 1;
        }
        const dir = { x: dx / len, y: dy / len };
        const perp = { x: -dir.y, y: dir.x }; // sideways, for the hand wobble
        const sd = norm(startDir), ed = norm(endDir);
        // never wobble more than the arrow is long, or the tip kinks
        const w = Math.sign(wobble) * Math.min(Math.abs(wobble), len * 0.22);
        const k = len * 0.22, km = len * 0.12, k2 = len * 0.18;

        if (len < 140) {
            // short arrow: one clean curve, endpoint tangents only
            arrow += `<path d="M ${start.x} ${start.y}`
                + ` C ${start.x + sd.x * k + perp.x * w} ${start.y + sd.y * k + perp.y * w},`
                + ` ${end.x - ed.x * k2} ${end.y - ed.y * k2}, ${end.x} ${end.y}"/>`;
        } else {
            // two bulges on opposite sides between the constrained ends
            const m1 = { x: start.x + dx * 0.35 + perp.x * w, y: start.y + dy * 0.35 + perp.y * w };
            const m2 = { x: start.x + dx * 0.7 - perp.x * w * 0.7, y: start.y + dy * 0.7 - perp.y * w * 0.7 };
            arrow += `<path d="M ${start.x} ${start.y}`
                + ` C ${start.x + sd.x * k} ${start.y + sd.y * k}, ${m1.x - dir.x * km} ${m1.y - dir.y * km}, ${m1.x} ${m1.y}`
                + ` C ${m1.x + dir.x * km} ${m1.y + dir.y * km}, ${m2.x - dir.x * km} ${m2.y - dir.y * km}, ${m2.x} ${m2.y}`
                + ` C ${m2.x + dir.x * km} ${m2.y + dir.y * km}, ${end.x - ed.x * k2} ${end.y - ed.y * k2}, ${end.x} ${end.y}"/>`;
        }

        // arrowhead: two short strokes leaning back from the tip, along endDir
        for (const side of [1, -1]) {
            const hx = end.x - (ed.x * 0.85 + -ed.y * 0.5 * side) * 14;
            const hy = end.y - (ed.y * 0.85 + ed.x * 0.5 * side) * 14;
            arrow += `<path d="M ${hx} ${hy} L ${end.x} ${end.y}"/>`;
        }
        markup += `<g data-note="${label}">${arrow}</g>`;
    }
    canvas.innerHTML = markup;
}
// the line boxes of the hero text: what the notes must never touch
function heroTextRects() {
    const rects = [];
    document.querySelectorAll('#hero h1, #hero h2, #hero p').forEach(el => {
        const range = document.createRange();
        range.selectNodeContents(el);
        for (const rect of range.getClientRects()) {
            if (rect.width > 4 && rect.height > 4) rects.push(rect);
        }
    });
    return rects;
}

// which notes (label or arrow) touch the hero text right now
function collidingNotes(texts) {
    const hits = (x, y) => texts.some(t => x >= t.left && x <= t.right && y >= t.top && y <= t.bottom);
    const overlaps = r => texts.some(t =>
        !(r.right < t.left || r.left > t.right || r.bottom < t.top || r.top > t.bottom));

    return scribbleArrows.filter(({ label }) => {
        if (overlaps(document.getElementById(label).getBoundingClientRect())) return true;
        const paths = document.querySelectorAll(`#scribble-canvas [data-note="${label}"] path`);
        for (const path of paths) {
            const length = path.getTotalLength();
            for (let i = 0; i <= 24; i++) {
                const point = path.getPointAtLength(length * i / 24);
                if (hits(point.x, point.y)) return true;
            }
        }
        return false;
    }).map(a => a.label);
}

// Place, then verify: keep trying random placements until nothing touches the
// hero text. If a note simply has no room (a narrow phone, where the donut
// sits behind the text), it is dropped rather than drawn over the writing.
function refreshScribbles() {
    fitHero();
    for (const { label } of scribbleArrows) {
        document.getElementById(label).style.display = '';
    }
    const texts = heroTextRects();

    for (let attempt = 0; attempt < 12; attempt++) {
        placeScribbleLabels();
        drawScribbleArrows();
        const colliding = collidingNotes(texts);
        if (!colliding.length) return;
        if (attempt === 11) {
            for (const label of colliding) {
                document.getElementById(label).style.display = 'none';
                document.querySelector(`#scribble-canvas [data-note="${label}"]`)?.remove();
            }
        }
    }
}
refreshScribbles();
window.addEventListener('resize', refreshScribbles);
// the check measures text, so redo it whenever the text can have moved
document.fonts.ready.then(refreshScribbles);
window.addEventListener('load', refreshScribbles);

// ### typewriter roles

const roles = [
    "AI & Robotics Engineer",
    "Computer Scientist",
    "Rock Climber",
    "Photographer",
    "Woodworker",
    "Runner",
    "Hiker",
    "Maker",
    "Motorcyclist",
];
const typedElement = document.getElementById('typed');

function typewriter() {
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
        const role = roles[roleIndex];
        charIndex += deleting ? -1 : 1;
        typedElement.textContent = role.slice(0, charIndex);

        let delay = deleting ? 40 : 80;
        if (!deleting && charIndex === role.length) {
            deleting = true;
            delay = 2000; // pause on the full word
        } else if (deleting && charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            delay = 400;
        }
        setTimeout(tick, delay);
    }
    tick();
}

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typedElement.textContent = roles[0];
} else {
    typewriter();
}
