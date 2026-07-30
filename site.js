// Shared page behavior: theme toggle, CV dialog, back-to-top button.

// ### theme (persisted in localStorage; applied before paint by the inline head script)

// the sun/moon icons are both in the markup; CSS shows the right one from
// data-theme, so there is nothing to swap (and no icon flash on load)
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', function () {
        const dark = document.documentElement.dataset.theme !== 'dark';
        document.documentElement.dataset.theme = dark ? 'dark' : 'light';
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        window.dispatchEvent(new Event('themechange'));
    });
}

// ### CV dialog

const cvButton = document.getElementById('cvButton');
const cvDialog = document.getElementById('cvDialog');
if (cvButton && cvDialog) {
    cvButton.addEventListener('click', () => cvDialog.showModal());
    cvDialog.addEventListener('click', function (event) {
        // click on the backdrop closes it
        if (event.target === cvDialog) cvDialog.close();
    });
    document.getElementById('cvClose').addEventListener('click', () => cvDialog.close());
    document.getElementById('cvDownload').addEventListener('click', () => cvDialog.close());
}

// ### back-to-top (only on pages that have the button)

const goToTopButton = document.getElementById('backToTopBtn');
if (goToTopButton) {
    goToTopButton.addEventListener('click', () => window.scrollTo({ top: 0 }));
    window.addEventListener('scroll', function () {
        const shown = window.scrollY > window.innerHeight * 0.6;
        goToTopButton.style.opacity = shown ? 1 : 0;
        goToTopButton.style.pointerEvents = shown ? 'auto' : 'none';
    });
}
