import './style.css';
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // field of view, aspect ratio, near and far of the frustrum

const renderer = new THREE.WebGLRenderer({ // the renderer has to know which scene to render
  canvas: document.querySelector('#bg') 
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight); // set the size of the rendered view to the size of the window

camera.position.setZ(30); // move the camera back 30 units in the z direction

renderer.render(scene, camera); // render the scene from the perspective of the camera

const geometry = new THREE.TorusGeometry(10, 3, 16, 100); // Geometry
const material = new THREE.MeshBasicMaterial({color:0xffffff, wireframe:true}); // Material (basic materials requires no light source)
const torus = new THREE.Mesh(geometry, material); // Mesh

scene.add(torus); // add the mesh to the scene
renderer.render(scene, camera);

function animate() {
    requestAnimationFrame(animate);

    torus.rotation.x += 0.001;
    torus.rotation.y += 0.005;
    torus.rotation.z += 0.001;

    renderer.render(scene, camera);
}

animate();