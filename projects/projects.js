import { initDonut } from '/donut.js';
import '/site.js';

// projects page: spinning the donut fast takes you to the blog
initDonut({ nextPage: '/blog/' });

function renderProject(project, index) {
    const article = document.createElement('article');
    article.className = 'project reveal '
        + (index % 2 === 0 ? 'project-left' : 'project-right')
        + (project.image ? '' : ' no-image');

    const title = project.url
        ? `<a target="_blank" rel="noopener noreferrer" href="${project.url}">${project.title}</a>`
        : project.title;
    const period = project.period ? `<span class="project-period">${project.period}</span>` : '';
    const note = project.note ? `<p>${project.note}</p>` : '';
    const points = project.points.map(p => `<li>${p}</li>`).join('');
    const image = project.image
        ? `<img src="${project.image}" alt="${project.title}" class="project-canvas" loading="lazy">`
        : '';

    article.innerHTML = `
        <div class="project-content">
            ${period}
            <h2>${title}</h2>
            ${note}
            <ul>${points}</ul>
        </div>
        ${image}
    `;
    return article;
}

const revealObserver = new IntersectionObserver(function (entries) {
    for (const entry of entries) {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    }
}, { threshold: 0.15 });

// ### spread: each card sizes to its content and lands at a random spot in
// its horizontal band (left band / right band alternating, so the path snakes)

function spreadCards() {
    const container = document.getElementById('projects');
    const cards = [...container.querySelectorAll('.project')];
    cards.forEach((card, i) => {
        const avail = container.clientWidth - card.offsetWidth;
        const band = i % 2 === 0 ? [0, 0.4] : [0.6, 1];
        const t = band[0] + Math.random() * (band[1] - band[0]);
        card.style.marginLeft = Math.max(0, avail * t) + 'px';
    });
}

// ### the path: a hand-drawn line walking from one project to the next

function drawProjectPath() {
    const container = document.getElementById('projects');
    const svg = document.getElementById('project-path');
    if (!svg) return;
    svg.setAttribute('viewBox', `0 0 ${container.offsetWidth} ${container.offsetHeight}`);

    const cards = [...container.querySelectorAll('.project')];
    let markup = '';

    for (let i = 0; i < cards.length - 1; i++) {
        const a = cards[i], b = cards[i + 1];
        // the path walks from older to newer: it leaves the lower (older) card
        // and its arrow enters the card above, snaking side to side
        const start = {
            x: b.offsetLeft + b.offsetWidth * (i % 2 === 0 ? 0.35 : 0.65),
            y: b.offsetTop + 6,
        };
        const end = {
            x: a.offsetLeft + a.offsetWidth * (i % 2 === 0 ? 0.68 : 0.32),
            y: a.offsetTop + a.offsetHeight - 6,
        };

        const dx = end.x - start.x, dy = end.y - start.y;
        const len = Math.hypot(dx, dy) || 1;
        const perp = { x: -dy / len, y: dx / len };
        const w = (i % 2 === 0 ? 1 : -1) * Math.min(40, len * 0.25);

        const c1 = { x: start.x + dx * 0.3 + perp.x * w, y: start.y + dy * 0.3 + perp.y * w };
        const c2 = { x: start.x + dx * 0.7 - perp.x * w, y: start.y + dy * 0.7 - perp.y * w };
        markup += `<path d="M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}"/>`;

        // small arrowhead entering the next project
        const u = { x: (end.x - c2.x), y: (end.y - c2.y) };
        const ul = Math.hypot(u.x, u.y) || 1;
        u.x /= ul; u.y /= ul;
        for (const side of [1, -1]) {
            const hx = end.x - (u.x * 0.85 + -u.y * 0.5 * side) * 12;
            const hy = end.y - (u.y * 0.85 + u.x * 0.5 * side) * 12;
            markup += `<path d="M ${hx} ${hy} L ${end.x} ${end.y}"/>`;
        }
    }
    svg.innerHTML = markup;
}

fetch('/projects.json')
    .then(response => response.json())
    .then(projects => {
        const container = document.getElementById('projects');
        projects.forEach((project, index) => {
            const card = renderProject(project, index);
            container.appendChild(card);
            revealObserver.observe(card);
        });
        spreadCards();
        drawProjectPath();
        // images load lazily and change the layout: re-place when each arrives
        container.querySelectorAll('img').forEach(img =>
            img.addEventListener('load', () => { spreadCards(); drawProjectPath(); }));
    })
    .catch(error => console.error('Could not load projects:', error));

window.addEventListener('resize', () => { spreadCards(); drawProjectPath(); });
