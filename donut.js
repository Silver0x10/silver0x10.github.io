import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// The donut lives on every section page. Tap it to spin it (direction depends
// on where you touch it); make it spin fast enough and it carries you to the
// next page: home -> projects -> blog -> home.

const yellow = new THREE.Color(0xdea30e);
const darkBg = new THREE.Color(0x1a1023);

const TAP_IMPULSE = 0.06;
const MAX_SPEED = 0.4;
const TRAVEL_SPEED = 0.28; // spin faster than this and you travel: it takes
                           // deliberate rapid tapping or really furious scrolling
const IDLE_SPEED = 0.002;

export function initDonut({ nextPage, scrollSpin = true } = {}) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();

    let aspectRatio = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(-aspectRatio, aspectRatio, 1, -1, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const light = new THREE.PointLight(0xaaaaaa, 700);
    light.position.set(-15, -10, 15);
    scene.add(light);

    let donut = new THREE.Object3D();
    const donut_scale = 19;

    new GLTFLoader().load('/assets/donut.glb', function (model) {
        donut = model.scene;
        donut.position.set(0.5, -0.5, 0);
        donut.scale.set(donut_scale, donut_scale, donut_scale);
        donut.rotation.x = Math.PI / 2;
        donut.rotation.z = Math.PI / 6;
        scene.add(donut);
    }, undefined, function (error) { console.error(error); });

    // scene background follows the theme (site.js dispatches 'themechange')
    function applySceneTheme() {
        scene.background = document.documentElement.dataset.theme === 'dark' ? darkBg : yellow;
    }
    applySceneTheme();
    window.addEventListener('themechange', applySceneTheme);

    // pointer parallax: the camera leans gently toward the pointer
    let pointerX = 0, pointerY = 0;
    window.addEventListener('pointermove', function (event) {
        pointerX = (event.clientX / window.innerWidth) * 2 - 1;
        pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    });

    // tap the donut to push it: the touched side decides the spin direction
    const raycaster = new THREE.Raycaster();
    window.addEventListener('pointerdown', function (event) {
        if (traveling) return;
        const pointer = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObject(donut, true);
        if (hits.length > 0) {
            const direction = hits[0].point.y >= donut.position.y ? 1 : -1;
            donutXVel += direction * TAP_IMPULSE;
        }
    });

    // spinning fast enough carries you to the next page, with a soft fade
    let traveling = false;
    const veil = document.createElement('div');
    veil.className = 'page-veil';
    document.body.appendChild(veil);

    function travel() {
        if (traveling || !nextPage) return;
        traveling = true;
        veil.classList.add('down');
        setTimeout(() => { window.location.href = nextPage; }, 900);
    }

    let donutXVel = IDLE_SPEED;
    let lastPosition = document.body.getBoundingClientRect().top;

    renderer.render(scene, camera); // first paint before the animation loop starts

    function animate() {
        requestAnimationFrame(animate);

        if (!reducedMotion) {
            donut.rotation.x += donutXVel;
            donut.rotation.y += -0.001;
            donut.rotation.z += 0.001;
            donutXVel = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, donutXVel * 0.99));

            if (Math.abs(donutXVel) > TRAVEL_SPEED) travel();
            if (traveling) donut.scale.multiplyScalar(1.01); // grows softly while leaving

            camera.position.x += (pointerX * 0.05 - camera.position.x) * 0.05;
            camera.position.y += (-pointerY * 0.05 - camera.position.y) * 0.05;
        }

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', function () {
        aspectRatio = window.innerWidth / window.innerHeight;
        camera.left = -aspectRatio;
        camera.right = aspectRatio;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    if (scrollSpin) {
        window.addEventListener('scroll', function () {
            const currentPosition = document.body.getBoundingClientRect().top;
            const delta = currentPosition - lastPosition;
            lastPosition = currentPosition;
            camera.position.z = 10 - currentPosition * 0.01;
            // scrolling down rolls the donut forward, scrolling up backward;
            // the nudge is small, so only frantic scrolling can trigger a travel
            donutXVel += Math.max(-0.005, Math.min(0.005, -delta * 0.0001));
        });
    }
}
