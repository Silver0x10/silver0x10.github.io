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

function placeScribbleLabels() {
    const W = window.innerWidth, H = window.innerHeight;
    // wider areas, kept apart by disjoint vertical bands, and (almost)
    // clear of the "hello world!" heading
    const projects = document.getElementById('scribble-projects');
    projects.style.left = rand(0.01, 0.02) * W + 'px';
    projects.style.top = rand(115, 150) + 'px';

    const blog = document.getElementById('scribble-blog');
    blog.style.left = rand(0.262, 0.40) * W + 'px';
    blog.style.top = rand(160, 200) + 'px';

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
            markup += `<path d="M ${start.x} ${start.y}`
                + ` C ${start.x + sd.x * k + perp.x * w} ${start.y + sd.y * k + perp.y * w},`
                + ` ${end.x - ed.x * k2} ${end.y - ed.y * k2}, ${end.x} ${end.y}"/>`;
        } else {
            // two bulges on opposite sides between the constrained ends
            const m1 = { x: start.x + dx * 0.35 + perp.x * w, y: start.y + dy * 0.35 + perp.y * w };
            const m2 = { x: start.x + dx * 0.7 - perp.x * w * 0.7, y: start.y + dy * 0.7 - perp.y * w * 0.7 };
            markup += `<path d="M ${start.x} ${start.y}`
                + ` C ${start.x + sd.x * k} ${start.y + sd.y * k}, ${m1.x - dir.x * km} ${m1.y - dir.y * km}, ${m1.x} ${m1.y}`
                + ` C ${m1.x + dir.x * km} ${m1.y + dir.y * km}, ${m2.x - dir.x * km} ${m2.y - dir.y * km}, ${m2.x} ${m2.y}`
                + ` C ${m2.x + dir.x * km} ${m2.y + dir.y * km}, ${end.x - ed.x * k2} ${end.y - ed.y * k2}, ${end.x} ${end.y}"/>`;
        }

        // arrowhead: two short strokes leaning back from the tip, along endDir
        for (const side of [1, -1]) {
            const hx = end.x - (ed.x * 0.85 + -ed.y * 0.5 * side) * 14;
            const hy = end.y - (ed.y * 0.85 + ed.x * 0.5 * side) * 14;
            markup += `<path d="M ${hx} ${hy} L ${end.x} ${end.y}"/>`;
        }
    }
    canvas.innerHTML = markup;
}
function refreshScribbles() {
    placeScribbleLabels();
    drawScribbleArrows();
}
refreshScribbles();
window.addEventListener('resize', refreshScribbles);
window.addEventListener('load', refreshScribbles); // again once fonts are in

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
