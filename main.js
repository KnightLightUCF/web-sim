import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import renderGUI from './modules/gui';
import helpers from './modules/helpers';
import controls from './modules/controls';
import {show_animation, initializeTrajectory} from './modules/show_animation';
import ParseSkyc from './modules/parse';

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

const stadiumGeo = new THREE.PlaneGeometry(100, 100);
const stadiumMat = new THREE.MeshStandardMaterial({color: 'white', side: THREE.DoubleSide});
const stadiumMesh = new THREE.Mesh(stadiumGeo, stadiumMat);
scene.add( stadiumMesh );
stadiumMesh.receiveShadow = true;
stadiumMesh.rotation.x = .5 * Math.PI;

stadiumMesh.position.set(-200, -5, -200);

const fieldGeo = new THREE.PlaneGeometry(200, 200);
const fieldMat = new THREE.MeshStandardMaterial({color: 'lightgreen', side: THREE.DoubleSide});
const fieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
scene.add( fieldMesh );
fieldMesh.receiveShadow = true;
fieldMesh.rotation.x = .5 * Math.PI;

fieldMesh.position.y = -1;

const sphere = new THREE.SphereGeometry(1, 15, 10);
const material = new THREE.MeshStandardMaterial({color: '#cf1657'});
const drone = new THREE.Mesh(sphere, material);
drone.castShadow = true;

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

	arena.position.set(-210, 15, -250);
	arena.rotation.x = .10;
	arena.rotation.y = 0.15;
	arena.rotation.z = -.03;
	arena.scale.set(200, 200, 200);

	scene.add( arena );

}, undefined, function ( error ) {

	console.error( error );

} );

// Start of camera moving with arrow keys and WASD code
// Move state declaration
let moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
	up: false,
    down: false
};

// Keydown event (press)
document.addEventListener('keydown', (event) => {
    switch(event.code) {
        case 'KeyW':
		case 'ArrowUp':
            moveState.forward = true;
            break;
        case 'KeyS':
		case 'ArrowDown':
            moveState.backward = true;
            break;
        case 'KeyA':
		case 'ArrowLeft':
            moveState.left = true;
            break;
        case 'KeyD':
		case 'ArrowRight':
            moveState.right = true;
            break;
		case 'KeyQ':
			moveState.up = true;
			break;
		case 'KeyE':
			moveState.down = true;
			break;
    }
});

// Keyup event (stop pressing)
document.addEventListener('keyup', (event) => {
    switch(event.code) {
        case 'KeyW':
		case 'ArrowUp':
            moveState.forward = false;
            break;
        case 'KeyS':
		case 'ArrowDown':
            moveState.backward = false;
            break;
        case 'KeyA':
		case 'ArrowLeft':
            moveState.left = false;
            break;
        case 'KeyD':
		case 'ArrowRight':
            moveState.right = false;
            break;
		case 'KeyQ':
			moveState.up = false;
			break;
		case 'KeyE':
			moveState.down = false;
			break;
    }
});
// End of camera moving with arrow keys and WASD code

// List of files
let fileList = [];

let currentFile = null;

let drone_list;

// For space bar functionality
let guiObjects;
let playController;

// Camera moving speed
let guiOptions;

fetch('./sample_data/fileList.json')
    .then(response => response.json())
    .then(data => {
        fileList = data.files;
        currentFile = fileList[0];
        guiObjects = renderGUI(drone, showState, fileList, setCurrentFile);
		playController = guiObjects.playController;
		guiOptions = guiObjects.options;
        return drone_list = ParseSkyc(`./sample_data/${currentFile}`, scene, drone);
    })
    .catch(error => console.error("File list error:", error));

function setCurrentFile(filename) {
    currentFile = filename;

    // Remove old drones from the scene
    drone_list.forEach(oldDrone => {
        scene.remove(oldDrone);
    });

    drone_list = ParseSkyc(`./sample_data/${currentFile}`, scene, drone);
}

function animate() {
	requestAnimationFrame( animate );
	
	// Moving the camera
    if (moveState.forward) {
        camera.translateZ(-guiOptions.speed);
    }
    if (moveState.backward) {
        camera.translateZ(guiOptions.speed);
    }
    if (moveState.left) {
        camera.translateX(-guiOptions.speed);
    }
    if (moveState.right) {
        camera.translateX(guiOptions.speed);
    }
	if (moveState.up) {
        camera.translateY(guiOptions.speed);
    }
    if (moveState.down) {
        camera.translateY(-guiOptions.speed);
    }

	// Pause and Play
	if (showState.playing) {
		show_animation(drone_list);
	}

	renderer.render( scene, camera );
}

window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

// Add an event listener for the space bar keydown event
document.addEventListener('keydown', (event) => {
    if (event.code === "Space") {  // Check if the pressed key is the space bar
        showState.playing = !showState.playing;  // Toggle the playing state
        playController.setValue(showState.playing);  // Update the checkbox
    }
});

helpers(scene, Dlight);

controls(camera, renderer);

animate();