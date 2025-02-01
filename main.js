import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const yellow = new THREE.Color(0xdea30e);
const purple = new THREE.Color(0x6e00cc);
const green = new THREE.Color(0x22ff12);
const donut_path = "./assets/donut.glb";

const scene = new THREE.Scene();

let width = window.innerWidth;
let height = window.innerHeight;
let aspectRatio = width / height;
let camera = new THREE.OrthographicCamera(-aspectRatio, aspectRatio, 1, -1, 0.1, 1000);
// const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000); // field of view, aspect ratio, near and far of the frustrum
scene.background = yellow; // set the background color of the scene

const renderer = new THREE.WebGLRenderer({ // the renderer has to know which scene to render
  canvas: document.querySelector('#bg') 
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight); // set the size of the rendered view to the size of the window

let currentPosition = document.body.getBoundingClientRect().top;
camera.position.z = 10 + currentPosition;
camera.position.x = currentPosition * 0.0005;
camera.position.y = currentPosition * 0.0005;

const light = new THREE.PointLight(0xaaaaaa, 700);
light.position.set(-15,-10,15);
scene.add(light);

// // Helpers
// const controls = new OrbitControls(camera, renderer.domElement);
// const pointLightHelper = new THREE.PointLightHelper(light);
// scene.add(pointLightHelper);
// const gridHelper = new THREE.GridHelper(100, 10);
// scene.add(gridHelper)

let donut = new THREE.Object3D();
let donut_scale = 19;
// let donut_scale = 20;

const loader = new GLTFLoader();
loader.load( donut_path, function ( model ) { 
    donut = model.scene;
    donut.position.set(0.5, -0.5, 0);
    donut.scale.set(donut_scale, donut_scale, donut_scale);
    donut.rotation.x = Math.PI / 2;
    donut.rotation.z = Math.PI / 6;
    scene.add(donut); 
}, undefined, function ( error ) { console.error( error ); } );
  
renderer.render(scene, camera); // render the scene from the perspective of the camera

// Animation Loop
let donutXVel = 0.002;
let lastPosition = document.body.getBoundingClientRect().top;
function animate() {
    requestAnimationFrame(animate);

    donut.rotation.x += donutXVel 
    donut.rotation.y += -0.001;
    donut.rotation.z += 0.001;

    donutXVel *= 0.99;
    // controls.update();

    renderer.render(scene, camera);
}
animate();

// Window Resizing
function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    aspectRatio = width / height;
    camera.left = -aspectRatio;
    camera.right = aspectRatio;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight); // set the size of the rendered view to the size of the window
}
window.addEventListener('resize', onWindowResize, false);

// Buttons behavior
var aboutHeight = document.getElementById("about").offsetHeight;
var goToTopButton = document.getElementById("backToTopBtn");
goToTopButton.onclick = function() {
    window.scrollTo({top: 0});
}
document.getElementById('rocket').addEventListener('click', function() {
    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
});


// Scrolling Events :

// 3D Scene Behavior
function scrollingSceneBehaviour() {
    let currentPosition = document.body.getBoundingClientRect().top;
    let delta = currentPosition - lastPosition;
    lastPosition = currentPosition;

    camera.position.z = 10 - currentPosition*0.01;
    camera.position.x = currentPosition * 0.0005;
    camera.position.y = currentPosition * 0.0005;

    donutXVel += delta * 0.0001;
}

// Arrow button behavior
function goToTopButtonBehavior(){
    if (document.body.scrollTop > aboutHeight || document.documentElement.scrollTop > aboutHeight) {
        goToTopButton.style.opacity = 1;
        goToTopButton.style.pointerEvents = "auto";
    } else {
        goToTopButton.style.opacity = 0;
        goToTopButton.style.pointerEvents = "none";
    }
}

// On Scroll Function
function onScrollFunction() {
    scrollingSceneBehaviour();
    goToTopButtonBehavior();
}
document.body.onscroll = onScrollFunction;
