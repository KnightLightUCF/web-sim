import * as THREE from 'three';

import renderGUI from './modules/gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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
stats.domElement.style.display = 'none';
document.body.appendChild(stats.domElement);

let showState = {
	playing: false
};

const productionENV = false;

// The minimum height for the camera
const MIN_HEIGHT = 0;

import { Stopwatch } from './modules/stopwatch';

let stopwatch = new Stopwatch();

document.getElementById('playback_speed').addEventListener('change', function() {
	if (showState.playing) {
		stopwatch.stop();
		stopwatch.timeWarp = this.value;
		stopwatch.start();
	} else {
		stopwatch.timeWarp = this.value;
	}
});

let stopConditionTime = 0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000);


const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

import sceneConfig from './scenes/OG.json';

const controls = new OrbitControls( camera, renderer.domElement );

// Initialize the scene with the specified config file
const { Dlight, sceneViews } = initializeScene(scene, sceneConfig, camera);

controls.update();

const sphere = new THREE.SphereGeometry(1, 15, 10);
const material = new THREE.MeshStandardMaterial({color: '#cf1657'});
const drone = new THREE.Mesh(sphere, material);
drone.castShadow = true;

let drone_list;

//*
function getDronesCenter() {
	if (!drone_list || drone_list.length === 0) return new THREE.Vector3();

	let center = new THREE.Vector3();
	drone_list.forEach(drone => center.add(drone.position));
	center.divideScalar(drone_list.length);
	return center;
}

function changeCameraView(selectedViewName) {
	console.log(sceneViews)
    let selectedView = sceneViews.find(view => view.name === selectedViewName);
    if (!selectedView) return;

    // Calculate the center position of the drones
    let center = getDronesCenter();

    // Calculate the target quaternion for the camera to look at the center
    let cloneCamera = camera.clone();
    cloneCamera.position.set(selectedView.position[0], selectedView.position[1], selectedView.position[2]);
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
        posX: selectedView.position[0],
        posY: selectedView.position[1],
        posZ: selectedView.position[2],
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

    // Create a temporary camera for calculating the target orientation
    let tempCamera = camera.clone();
    tempCamera.position.copy(camera.position);
    tempCamera.lookAt(center);

    // Determines how quickly the camera orientation changes
    let changeSpeed = 0.05;

    camera.quaternion.slerp(tempCamera.quaternion, changeSpeed);
    controls.target.lerp(center, changeSpeed);
    controls.update();
}

import { updateTotalDuration, updateProgressBar } from './index.js';

let mainTotalDuration = 10;

async function RenderShow(show) {
	if (drone_list) {
		drone_list.forEach(oldDrone => {
			scene.remove(oldDrone);
		});
	}

	const result = await ParseSkyc(`./sample_data/${show}`, scene, drone);
	drone_list = result.drones;
	stopConditionTime = result.maxLandingTime * 1000; // Convert to milliseconds

	updateTotalDuration(stopConditionTime);

	mainTotalDuration = stopConditionTime;
	updateCirclePosition();

	if (stopwatch && showState.playing) {
		stopwatch.start();
	}

	return drone_list;
}

RenderShow(SkycZip[0]);

let guiObjects = renderGUI(drone, showState, stopwatch, sceneViews, changeCameraView, RenderShow, productionENV).options;

function animateProgressBar() {
    if (stopwatch.running) {
        updateProgressBar(stopwatch); // Pass the necessary arguments if they're not globally accessible
		updateCirclePosition();
		updateDroneLighting(drone_list, stopwatch);
    }
    requestAnimationFrame(animateProgressBar);
}

function animate() {
	requestAnimationFrame( animate );

	// Smooth transitions update
	TWEEN.update();

	// Moving the camera
	if (productionENV == false) {
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
	}

	// Constrain camera's Y position
	if (camera.position.y < MIN_HEIGHT) {
		camera.position.y = MIN_HEIGHT;
	}

    // Automatically focus on drones if the checkbox is checked
    if (document.getElementById("focus_drones").checked) {
        focusOnDrones();
    }

	// Pause and Play
	if (showState.playing) {
		show_animation(drone_list, stopwatch, stopConditionTime);
		// show_animation(drone_list, stopwatch, stopConditionTime, 5000);
		updateDroneLighting(drone_list, stopwatch);
		let time = stopwatch.getTime();
		let minutes = Math.floor(time / 60000);
		let seconds = Math.floor((time % 60000) / 1000);
		let milliseconds = time % 1000;
		let formattedTime = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds + ':' + ('00' + milliseconds).slice(-3);
		document.getElementById("currentTime").innerText = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
		if (productionENV == false) { guiObjects.timerOptions.time = formattedTime; }
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
		if (showState.playing) {
			stopwatch.start();
		} else {
			stopwatch.stop();
		}
		changePlayPauseBtn();
	}
});

document.getElementById('views_dropdown_menu').addEventListener('change', function(event) {
	const selectedViewName = event.target.value;
	changeCameraView(selectedViewName);
});

function isGUIFocused() {
	return document.activeElement && document.activeElement.classList.contains('dg');
}

controls.update();

// Initialize keyboard controls
initKeyboardControls();

animate();

// Start the progress bar animation loop
animateProgressBar();

document.getElementById('play_pause_btn').addEventListener('click', () => {
	showState.playing = !showState.playing;  // Toggle the playing state
	if (showState.playing) {
		stopwatch.start();
	} else {
		stopwatch.stop();
	}

	changePlayPauseBtn();
});

function changePlayPauseBtn() {
	if (showState.playing) {
		document.getElementById("play_icon").style.display = 'none';
		document.getElementById("pause_icon").style.display = 'block';
	} else {
		document.getElementById("play_icon").style.display = 'block';
		document.getElementById("pause_icon").style.display = 'none';
	}
};

function seekToTime(seekTimeInSeconds) {
    const wasRunning = stopwatch.running;

	 // Temporarily stop the stopwatch
    if (wasRunning) {
        stopwatch.stop();
    }

    stopwatch.elapsedTime = Math.round(seekTimeInSeconds);

	let time = stopwatch.getTime();
	let minutes = Math.floor(time / 60000);
	let seconds = Math.floor((time % 60000) / 1000);
	let milliseconds = time % 1000;
	let formattedTime = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds + ':' + ('00' + milliseconds).slice(-3);
	document.getElementById("currentTime").innerText = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
	if (productionENV == false) { guiObjects.timerOptions.time = formattedTime; }

    // Update the animation and progress bar to reflect the seek
    show_animation(drone_list, stopwatch, stopConditionTime, seekTimeInSeconds);
    updateProgressBar(stopwatch);
	updateCirclePosition();
	updateDroneLighting(drone_list, stopwatch);

	// Resume stopwach if it was running before
    if (wasRunning) {
        stopwatch.start();
    }
}

// Seek based on clicked position
document.getElementById('progress_bar_wrapper').addEventListener('click', (e) => {
    const rect = document.getElementById('progress_bar_wrapper').getBoundingClientRect();
    const x = e.clientX - rect.left; // Get the x position of the click within the timeline
    const seekTimeInSeconds = (x / rect.width) * mainTotalDuration; // Calculate the seek time based on the click position

    seekToTime(seekTimeInSeconds);
});

const draggableCircle = document.getElementById('draggable_circle');
let isDragging = false;

// Function to update the circle position
function updateCirclePosition() {
    let progressionWidth = document.getElementById('show_progression').offsetWidth; // Get the current width of the played portion
    draggableCircle.style.left = `${progressionWidth - (draggableCircle.offsetWidth / 2)}px`; // Adjust based on circle size
}

// Initialize circle position
updateCirclePosition();

// Show/hide circle based on animation state
document.getElementById('progress_bar_wrapper').addEventListener('mouseenter', function() {
    if (!showState.playing) {
        draggableCircle.style.display = 'block'; // Show circle only if the animation is not playing
    }
});

document.getElementById('progress_bar_wrapper').addEventListener('mouseleave', function() {
    draggableCircle.style.display = 'none'; // Hide circle when not hovering
});

// Drag start
draggableCircle.addEventListener('mousedown', function(e) {
    e.preventDefault(); // Prevent default action (text selection, etc.)
    isDragging = true;
});

// Drag move
document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    
    let rect = document.getElementById('progress_bar_wrapper').getBoundingClientRect();
    let minX = rect.left;
    let maxX = rect.right;
    let newX = e.clientX - minX;

    // Constrain newX within the progressBarWrapper
    newX = Math.max(0, Math.min(newX, rect.width));

    // Update position of the draggableCircle
    draggableCircle.style.left = `${newX}px`;

    // Update position of the showProgression
    document.getElementById('show_progression').style.width = `${newX}px`;

	let progressPercentage = newX / rect.width;
	let showPosition = progressPercentage * mainTotalDuration;
	seekToTime(showPosition);
});

// Drag end
document.addEventListener('mouseup', function(e) {
    if (!isDragging) return;
    isDragging = false;

	let rect = document.getElementById('progress_bar_wrapper').getBoundingClientRect();
    let x = e.clientX - rect.left; // Get the x position of the click within the timeline
    let seekTimeInSeconds = (x / rect.width) * mainTotalDuration; // Calculate the seek time based on the click position

    seekToTime(seekTimeInSeconds);
});

document.getElementById("performance_stats").addEventListener('change', function() {
    if (this.checked) {
        // Checked
		stats.domElement.style.display = 'block';
    } else {
        // Not checked
		stats.domElement.style.display = 'none';
    }
});
