import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import renderGUI from './modules/gui';
import helpers from './modules/helpers';
import controls from './modules/controls';

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
Dlight.shadow.camera.left = -50
scene.add( light );
scene.add(Dlight);

const stadiumGeo = new THREE.PlaneGeometry( 100, 100);
const stadiumMat = new THREE.MeshStandardMaterial({color: 'white', side: THREE.DoubleSide});
const stadiumMesh = new THREE.Mesh(stadiumGeo, stadiumMat);
scene.add( stadiumMesh );
stadiumMesh.receiveShadow = true;
stadiumMesh.rotation.x = .5 * Math.PI;

const fieldGeo = new THREE.PlaneGeometry( 200, 200);
const fieldMat = new THREE.MeshStandardMaterial({color: 'lightgreen', side: THREE.DoubleSide});
const fieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
scene.add( fieldMesh );
fieldMesh.receiveShadow = true;
fieldMesh.rotation.x = .5 * Math.PI;

fieldMesh.position.set(-200, 0, -200);

const sphere = new THREE.SphereGeometry(5, 15, 10);
const material = new THREE.MeshStandardMaterial({color: '#cf1657'});
const drone = new THREE.Mesh(sphere, material);
scene.add(drone);
drone.castShadow = true;

drone.position.set(-200, 5, -200);

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

	arena.position.z = -50;
	arena.position.y = 20;
	arena.rotation.x = .09;
	arena.rotation.y = 0.15;
	arena.rotation.z = -.03;
	arena.scale.set(200, 200, 200);

	scene.add( arena );

}, undefined, function ( error ) {

	console.error( error );

} );

let step = 0;
let speed = .05;

function animate() {
	requestAnimationFrame( animate );

	renderer.render( scene, camera );

	step += speed;
	drone.position.y = 50 * Math.abs(Math.sin(step));
}

window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

renderGUI(drone);

helpers(scene, Dlight);

controls(camera, renderer);

animate();