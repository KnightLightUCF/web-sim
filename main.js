import * as THREE from 'three';

import renderGUI from './modules/gui';
import helpers from './modules/helpers';
import initControls from './modules/controls';
import {show_animation, initializeTrajectory} from './modules/showControl/show_animation';
import {updateDroneLighting} from './modules/showLights/show_lighting';
import ParseSkyc from './modules/showControl/parse';
import { SkycZip } from './sample_data/fileList.json';

// Scene initialization
import { initializeScene } from './modules/sceneSetup';

// Keyboard controls
import { moveState, initKeyboardControls } from './modules/keyboardControls';

// Top left statistics
import Stats from 'stats.js';

// Initialize statistics
const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

let showState = {
	playing: false
};

// The minimum height for the camera
const MIN_HEIGHT = 0;

import { Stopwatch } from './modules/stopwatch';

let stopwatch = new Stopwatch();

let stopConditionTime = 0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000);

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const sphere = new THREE.SphereGeometry(1, 15, 10);
const material = new THREE.MeshStandardMaterial({color: '#cf1657'});
const drone = new THREE.Mesh(sphere, material);
drone.castShadow = true;

// Initialize the scene
const { Dlight } = initializeScene(scene);

let drone_list;

// Default views (will need to be moved to probably sceneSetup.js and in it's own JSON file in the future once we have multi-scene support)
const predefinedViews = [
	{ name: 'View 1', position: new THREE.Vector3(10, 10, 10), rotation: new THREE.Euler(0, 0, 0, 'XYZ') },
	{ name: 'View 2', position: new THREE.Vector3(-10, 10, -10), rotation: new THREE.Euler(0, Math.PI / 2, 0, 'XYZ') },
	{ name: 'View 3', position: new THREE.Vector3(-100, 69, -42), rotation: new THREE.Euler(0, Math.PI / 2, 0, 'XYZ') },
	{ name: 'View 4', position: new THREE.Vector3(100, 100, 100), rotation: new THREE.Euler(0, 0, 0, 'XYZ') },
];

const { controls, changeView } = initControls(camera, renderer);

//*
function getDronesCenter() {
	if (!drone_list || drone_list.length === 0) return new THREE.Vector3();

	let center = new THREE.Vector3();
	drone_list.forEach(drone => center.add(drone.position));
	center.divideScalar(drone_list.length);
	return center;
}

function changeCameraView(selectedViewName) {
	let selectedView = predefinedViews.find(view => view.name === selectedViewName);
	if (!selectedView) return;

	// Calculate the center position of the drones
	let center = getDronesCenter();

	// Calculate the target quaternion for the camera to look at the center
	let cloneCamera = camera.clone();
	cloneCamera.position.set(selectedView.position.x, selectedView.position.y, selectedView.position.z);
	cloneCamera.lookAt(center);
	const targetQuaternion = cloneCamera.quaternion;

	// Create a single tween for both position and rotation
	new TWEEN.Tween({
		posX: camera.position.x,
		posY: camera.position.y,
		posZ: camera.position.z,
		quatX: camera.quaternion.x,
		quatY: camera.quaternion.y,
		quatZ: camera.quaternion.z,
		quatW: camera.quaternion.w
	})
		.to({
			posX: selectedView.position.x,
			posY: selectedView.position.y,
			posZ: selectedView.position.z,
			quatX: targetQuaternion.x,
			quatY: targetQuaternion.y,
			quatZ: targetQuaternion.z,
			quatW: targetQuaternion.w
		}, 3000) // Adjust duration as needed
		.easing(TWEEN.Easing.Quadratic.InOut)
		.onUpdate(function(obj) {
			camera.position.set(obj.posX, obj.posY, obj.posZ);
			camera.quaternion.set(obj.quatX, obj.quatY, obj.quatZ, obj.quatW);
		})
		.onComplete(() => {
			controls.target.copy(center);
			controls.update();
		})
		.start();
}

function focusOnDrones() {
	if (!drone_list || drone_list.length === 0) return;

	let center = new THREE.Vector3();
	drone_list.forEach(drone => center.add(drone.position));
	center.divideScalar(drone_list.length);

	// Check if the camera's height is below 30
	// if (camera.position.y < 30) {
	//     camera.position.setY(30);  // Set the height to 10
	// }

	// Clone the current camera to avoid modifying the actual camera
	let cloneCamera = camera.clone();
	cloneCamera.lookAt(center);

	const targetQuaternion = cloneCamera.quaternion;

	new TWEEN.Tween(camera.quaternion)
		.to({ 
			x: targetQuaternion.x, 
			y: targetQuaternion.y, 
			z: targetQuaternion.z, 
			w: targetQuaternion.w 
		}, 700)
		.easing(TWEEN.Easing.Quadratic.InOut)
		.onComplete(() => {
			// Update the OrbitControls target
			controls.target.copy(center);
			controls.update();
		})
		.start();
}

async function RenderShow(show) {
	if (drone_list) {
		drone_list.forEach(oldDrone => {
			scene.remove(oldDrone);
		});
	}

	const result = await ParseSkyc(`./sample_data/${show}`, scene, drone);
	drone_list = result.drones;
	stopConditionTime = result.maxLandingTime * 1000; // Convert to milliseconds

	if (stopwatch && showState.playing) {
		stopwatch.start();
	}

	return drone_list;
}
RenderShow(SkycZip[0]);

let guiObjects = renderGUI(drone, showState, stopwatch, predefinedViews, changeCameraView, focusOnDrones, RenderShow).options;
console.log(guiObjects);

function animate() {
	requestAnimationFrame( animate );

	// Smooth transitions update
	TWEEN.update();

	// Moving the camera
	if (moveState.forward) {
		camera.translateZ(-guiObjects.speed);
	}
	if (moveState.backward) {
		camera.translateZ(guiObjects.speed);
	}
	if (moveState.left) {
		camera.translateX(-guiObjects.speed);
	}
	if (moveState.right) {
		camera.translateX(guiObjects.speed);
	}
	if (moveState.up) {
		camera.translateY(guiObjects.speed);
	}
	if (moveState.down) {
		camera.translateY(-guiObjects.speed);
	}

	// Constrain camera's Y position
	if (camera.position.y < MIN_HEIGHT) {
		camera.position.y = MIN_HEIGHT;
	}

	// Pause and Play
	if (showState.playing) {
		show_animation(drone_list, stopwatch, stopConditionTime);
		updateDroneLighting(drone_list, stopwatch);
		let time = stopwatch.getTime();
		let minutes = Math.floor(time / 60000);
		let seconds = Math.floor((time % 60000) / 1000);
		let milliseconds = time % 1000;
		console.log(time);
		let formattedTime = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds + ':' + ('00' + milliseconds).slice(-3);
		guiObjects.timerOptions.time = formattedTime;
	}

	// Update statistics
	stats.update();

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
	// Check if any GUI control is focused
	if (event.code === 'Space' && !isGUIFocused()) {  // Check if the pressed key is the space bar
		showState.playing = !showState.playing;  // Toggle the playing state
		guiObjects.playController.setValue(showState.playing);  // Update the checkbox
		if (showState.playing) {
			stopwatch.start();
		} else {
			stopwatch.stop();
		}
	}
});

function isGUIFocused() {
	return document.activeElement && document.activeElement.classList.contains('dg');
}

helpers(scene, Dlight);

// controls(camera, renderer);
controls.update();

// Initialize keyboard controls
initKeyboardControls();

animate();
