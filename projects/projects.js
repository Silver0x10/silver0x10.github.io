import { initDonut } from '/donut.js';
import '/site.js';

// projects page: spinning the donut fast takes you to the blog
initDonut({ nextPage: '/blog/' });

function renderProject(project, index) {
    const article = document.createElement('article');
    article.className = 'project reveal ' + (index % 2 === 0 ? 'project-left' : 'project-right');

    const title = project.url
        ? `<a target="_blank" rel="noopener noreferrer" href="${project.url}">${project.title}</a>`
        : project.title;
    const note = project.note ? `<p>${project.note}</p>` : '';
    const points = project.points.map(p => `<li>${p}</li>`).join('');

    article.innerHTML = `
        <div class="project-content">
            <h2>${title}</h2>
            ${note}
            <ul>${points}</ul>
        </div>
        <img src="${project.image}" alt="${project.title}" class="project-canvas" loading="lazy">
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

fetch('/projects.json')
    .then(response => response.json())
    .then(projects => {
        const container = document.getElementById('projects');
        projects.forEach((project, index) => {
            const card = renderProject(project, index);
            container.appendChild(card);
            revealObserver.observe(card);
        });
    })
    .catch(error => console.error('Could not load projects:', error));
