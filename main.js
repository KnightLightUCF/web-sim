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

fieldMesh.position.y = -1;

const sphere = new THREE.SphereGeometry(1, 15, 10);
const material = new THREE.MeshStandardMaterial({color: '#cf1657'});
const drone = new THREE.Mesh(sphere, material);
// scene.add(drone);
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

// we need a way to fetch x number of drone trajectories. <it's done 😁>
// fetch('./sample_data/2_Drones_Up_Down/drones/Drone 1/trajectory.json')
// 	.then(response => response.json())
// 	.then(data => {
// 		initializeTrajectory(data);
// 	});

const drones = [];

let droneNames = [];

// The NEW new import method
fetch('./sample_data/2_Drones_Up_Down.skyc')
    .then(response => response.blob())
    .then(blob => {
        const jszip = new JSZip();
        return jszip.loadAsync(blob);
    })
    .then(zip => {
        // Fetching the list of drone names from the directory structure
        droneNames = Object.keys(zip.files).filter(file => file.startsWith("drones/Drone")).map(file => file.split('/')[1]);
        
        // Fetching trajectories for all drones
        const promises = droneNames.map(name => zip.file(`drones/${name}/trajectory.json`).async('string'));

        return Promise.all(promises);
    })
    .then(datas => {
		datas.forEach((data, index) => {
			// Convert string data to JSON
			const jsonData = JSON.parse(data);

			// Create the sphere (drone)
			const droneMesh = drone.clone();

			// Set the drone's initial coordinates based off it's trajectory.json
			const initialPosition = jsonData.points[0][1];
			droneMesh.position.set(initialPosition[0], initialPosition[2], initialPosition[1]);
		
			// Initialize drone's trajectory data
			droneMesh.trajectoryData = {
				curves: [],
				currentCurveIndex: 0,
				curveProgress: 0
			};

			// Add to drones array
			drones.push(droneMesh);
			
			// Add drone to the scene
			scene.add(droneMesh);

			// Call initializeTrajectory
			initializeTrajectory(jsonData, droneMesh);
		});
    })
    .catch(error => {
		// We won't make errors, but just incase
        console.error("File processing error:", error);
    });

function animate() {
	requestAnimationFrame( animate );

	if (showState.playing) {
		show_animation(drones);
	}

	renderer.render( scene, camera );
}

window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

renderGUI(drones, showState);

helpers(scene, Dlight);

controls(camera, renderer);

show_animation(drones);

animate();