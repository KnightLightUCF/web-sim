import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import renderGUI from './modules/gui';
import helpers from './modules/helpers';
import controls from './modules/controls';
import {show_animation, initializeTrajectory} from './modules/show_animation';

let showState = {
	playing: false
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000 );

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const light = new THREE.AmbientLight(0x333333, 4);
const Dlight = new THREE.DirectionalLight(0xFFFFFF, 1);
Dlight.position.set(200, 200, 200);
Dlight.castShadow = true;
Dlight.shadow.camera.top = 50;
Dlight.shadow.camera.bottom = -50;
Dlight.shadow.camera.right = 50;
Dlight.shadow.camera.left = -50;
scene.add( light );
scene.add(Dlight);

const stadiumGeo = new THREE.PlaneGeometry( 100, 100);
const stadiumMat = new THREE.MeshStandardMaterial({color: 'white', side: THREE.DoubleSide});
const stadiumMesh = new THREE.Mesh(stadiumGeo, stadiumMat);
scene.add( stadiumMesh );
stadiumMesh.receiveShadow = true;
stadiumMesh.rotation.x = .5 * Math.PI;

stadiumMesh.position.set(-200, -5, -200);

const fieldGeo = new THREE.PlaneGeometry( 200, 200);
const fieldMat = new THREE.MeshStandardMaterial({color: 'lightgreen', side: THREE.DoubleSide});
const fieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
scene.add( fieldMesh );
fieldMesh.receiveShadow = true;
fieldMesh.rotation.x = .5 * Math.PI;

fieldMesh.position.y = -5;

const sphere = new THREE.SphereGeometry(5, 15, 10);
const material = new THREE.MeshStandardMaterial({color: '#cf1657'});
const drone = new THREE.Mesh(sphere, material);
scene.add(drone);
drone.castShadow = true;

// drone.position.set(-200, 5, -200);

const loader = new GLTFLoader();

let arena;
loader.load( './models/arena.glb', ( glb ) => {
	arena = glb.scene;

	arena.traverse((child) => {
		if (child.isMesh) {
			// disabling cast shadows for now as it casts shadows onto itself in a wierd manner. you can see this through the lines that appera on it.
			// child.castShadow = true;
			child.receiveShadow = true;
		}
	});

	arena.position.set(-200, 15, -250);
	arena.rotation.x = .09;
	arena.rotation.y = 0.15;
	arena.rotation.z = -.03;
	arena.scale.set(200, 200, 200);

	scene.add( arena );

}, undefined, function ( error ) {

	console.error( error );

} );

// we need a way to fetch x number of drone trajectories. <just wait for the next commit 😉>
// fetch('./sample_data/2_Drones_Up_Down/drones/Drone 1/trajectory.json')
// 	.then(response => response.json())
// 	.then(data => {
// 		initializeTrajectory(data);
// 	});

// New import method
fetch('./sample_data/2_Drones_Up_Down.skyc')
    .then(response => response.blob())
    .then(blob => {
        const jszip = new JSZip();
        return jszip.loadAsync(blob);
    })
    .then(zip => {
        // Path to the desired file
        const filePath = 'drones/Drone 1/trajectory.json';
		// Get file contents as a string
        return zip.file(filePath).async('string');
    })
    .then(data => {
		// Convert string data to JSON
        const jsonData = JSON.parse(data);
		// Call initializeTrajectory
        initializeTrajectory(jsonData);
    })
    .catch(error => {
		// We won't make errors, but just incase
        console.error("File processing error:", error);
    });

function animate() {
	requestAnimationFrame( animate );

	if (showState.playing) {
		show_animation(drone);
	}

	renderer.render( scene, camera );
}

window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

renderGUI(drone, showState);

helpers(scene, Dlight);

controls(camera, renderer);

show_animation(drone);

animate();