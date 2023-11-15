import * as THREE from 'three';

// Uncomment when loading a GLTF file for the drone, and remember to add const loader = new GLTFLoader();
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import renderGUI from './modules/gui';
import helpers from './modules/helpers';
import initControls from './modules/controls';
import {show_animation, initializeTrajectory} from './modules/show_animation';
import {updateDroneLighting} from './modules/show_lighting'
import ParseSkyc from './modules/parse';

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
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000 );

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

// List of files
let fileList = [];

let currentFile = null;

let drone_list;

// For space bar functionality
let guiObjects;
let playController;

// Camera moving speed
let guiOptions;

// Default views (will need to be moved to probably sceneSetup.js and in it's own JSON file in the future once we have multi-scene support)
const predefinedViews = [
    { name: "View 1", position: new THREE.Vector3(10, 10, 10), rotation: new THREE.Euler(0, 0, 0, 'XYZ') },
    { name: "View 2", position: new THREE.Vector3(-10, 10, -10), rotation: new THREE.Euler(0, Math.PI / 2, 0, 'XYZ') },
    { name: "View 3", position: new THREE.Vector3(-100, 69, -42), rotation: new THREE.Euler(0, Math.PI / 2, 0, 'XYZ') },
    { name: "View 4", position: new THREE.Vector3(100, 100, 100), rotation: new THREE.Euler(0, 0, 0, 'XYZ') },
];

const { controls, changeView } = initControls(camera, renderer);

function changeCameraView(selectedViewName) {
    let selectedView = predefinedViews.find(view => view.name === selectedViewName);
    if (!selectedView) return;

    changeView(selectedView.position, selectedView.rotation);
}

function focusOnDrones() {
    if (!drone_list || drone_list.length === 0) return;

    let center = new THREE.Vector3();
    drone_list.forEach(drone => center.add(drone.position));
    center.divideScalar(drone_list.length);

    // Check if the camera's height is below 30
    if (camera.position.y < 30) {
        camera.position.setY(30);  // Set the height to 10
    }

    // Rotate the camera to look at the center position
    camera.lookAt(center);
    controls.target.copy(center);
    controls.update();
}

fetch('./sample_data/fileList.json')
    .then(response => response.json())
    .then(async data => {
        fileList = data.files;
        currentFile = fileList[0];
        guiObjects = renderGUI(drone, showState, predefinedViews, fileList, setCurrentFile, stopwatch, changeCameraView, focusOnDrones);
        playController = guiObjects.playController;
        guiOptions = guiObjects.options;
        
        const result = await ParseSkyc(`./sample_data/${currentFile}`, scene, drone);
        drone_list = result.drones;
        stopConditionTime = result.maxLandingTime * 1000; // Convert to milliseconds

        return drone_list;
    })
    .catch(error => console.error("File list error:", error));

async function setCurrentFile(filename) {
    currentFile = filename;

    // 1. Reset the stopwatch
    if (stopwatch) {
        stopwatch.stop();
        stopwatch.reset();
        guiOptions.timerOptions.time = "00:00.000";
    }

    // 2. Remove old drones from the scene
    drone_list.forEach(oldDrone => {
        scene.remove(oldDrone);
    });

    const result = await ParseSkyc(`./sample_data/${currentFile}`, scene, drone);
    drone_list = result.drones;
    stopConditionTime = result.maxLandingTime * 1000; // Convert to milliseconds

    if (stopwatch && showState.playing) {
        stopwatch.start();
    }
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
        let formattedTime = (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds + ":" + ("00" + milliseconds).slice(-3);
        guiOptions.timerOptions.time = formattedTime;
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
	if (event.code === "Space" && !isGUIFocused()) {  // Check if the pressed key is the space bar
		showState.playing = !showState.playing;  // Toggle the playing state
		playController.setValue(showState.playing);  // Update the checkbox
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
