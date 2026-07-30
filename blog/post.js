import '/site.js';

// prev/next navigation between posts, from the order in posts.json
// (newest first: "next" goes to the older post, like turning a book page)

fetch('/blog/posts.json')
    .then(response => response.json())
    .then(posts => {
        posts.sort((a, b) => b.date.localeCompare(a.date));
        const files = posts.map(p => new URL(p.file, location.origin + '/blog/').pathname);
        const here = files.indexOf(location.pathname);
        if (here === -1) return;

        const prev = here > 0 ? files[here - 1] : null;
        const next = here < files.length - 1 ? files[here + 1] : null;

        const prevButton = document.getElementById('prevPost');
        const nextButton = document.getElementById('nextPost');
        if (prev) { prevButton.href = prev; prevButton.classList.add('ready'); } else prevButton.remove();
        if (next) { nextButton.href = next; nextButton.classList.add('ready'); } else nextButton.remove();

        // book-like swipe: drag left to turn to the next post, right to go back
        let startX = null, startY = null;
        document.addEventListener('touchstart', function (event) {
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        }, { passive: true });
        document.addEventListener('touchend', function (event) {
            if (startX === null) return;
            const dx = event.changedTouches[0].clientX - startX;
            const dy = event.changedTouches[0].clientY - startY;
            startX = startY = null;
            if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
            const target = dx < 0 ? next : prev;
            if (target) {
                document.body.classList.add(dx < 0 ? 'page-turn-left' : 'page-turn-right');
                setTimeout(() => { location.href = target; }, 250);
            }
        }, { passive: true });
    })
    .catch(error => console.error('Could not load posts:', error));
