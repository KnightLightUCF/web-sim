import * as THREE from 'three';
import * as DAT from 'dat.gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// lighting is buggy when it comes to color names. use hex. either '#<hexcode>' or 0x<hexcode>
const light = new THREE.AmbientLight(0x333333, 4); // soft white light
scene.add( light );

const Dlight = new THREE.DirectionalLight(0xFFFFFF, 1);
scene.add(Dlight);
Dlight.position.set(200, 200, 200);
Dlight.castShadow = true;
// one has to be positive and one negative. its a mini grid essentially.
Dlight.shadow.camera.top = 50;
Dlight.shadow.camera.bottom = -50;
Dlight.shadow.camera.right = 50;
Dlight.shadow.camera.left = -50;


const DlightHelper = new THREE.DirectionalLightHelper(Dlight, 100);
scene.add(DlightHelper);

const DlightShadowHelper = new THREE.CameraHelper(Dlight.shadow.camera);
scene.add(DlightShadowHelper);

const axes = new THREE.AxesHelper(1000);
scene.add(axes);

const gridHelperZ = new THREE.GridHelper( 60, 10 );
scene.add( gridHelperZ );

const gridHelperY = new THREE.GridHelper( 60, 10 );
scene.add( gridHelperY );

gridHelperZ.rotation.x =  .5 * Math.PI;

const planeGeo = new THREE.PlaneGeometry( 100, 100, 10, 10 );
const planeMat = new THREE.MeshStandardMaterial({color: 'white', side: THREE.DoubleSide, wireframe: false});
const planeMesh = new THREE.Mesh(planeGeo, planeMat);
scene.add( planeMesh );
planeMesh.receiveShadow = true;

planeMesh.rotation.x = -.5 * Math.PI;

const sphere = new THREE.SphereGeometry(10, 32, 50);
const material = new THREE.MeshStandardMaterial({color: '#cf1657', wireframe: false});
const drone = new THREE.Mesh(sphere, material);
scene.add(drone);

drone.position.set(0, 0, 0);
drone.castShadow = true;

// const geometry1 = new THREE.BoxGeometry( 1, 1, 80 );
// const material1 = new THREE.MeshBasicMaterial( { color: 'aqua' } );
// const cube1 = new THREE.Mesh( geometry1, material1 );

// const geometry2 = new THREE.BoxGeometry( 1, 50, 1 );
// const material2 = new THREE.MeshBasicMaterial( { color: 'pink' } );
// const cube2 = new THREE.Mesh( geometry2, material2 );

// const geometry3 = new THREE.BoxGeometry( 60, 1, 1 );
// const material3 = new THREE.MeshBasicMaterial( { color: 'red' } );
// const cube3 = new THREE.Mesh( geometry3, material3 );
// scene.add( cube1, cube2, cube3 );

// camera.position.z = 100;

const controls = new OrbitControls( camera, renderer.domElement );

camera.position.set( 200, 15, 200 );
// camera.position.set( 0, 1, .3 );

controls.update();

const loader = new GLTFLoader();
let arena;
let room;

loader.load( './models/arena.glb', function ( glb ) {

	arena = glb.scene;

	scene.add( arena );

}, undefined, function ( error ) {

	console.error( error );

} );

loader.load('/models/room/scene.gltf', function ( glb ) {

	room = glb.scene;

	scene.add( room );

}, undefined, function ( error ) {

	console.error( error );

} );

// GUI
const gui = new DAT.GUI();

const options = {
	sphereColor: '#5a82ff',
	x: 0,
	y: 0,
	z: 0
};

gui.add(options, 'x', -150, 150).onChange(function(e){
	drone.position.setX(e);
});

gui.add(options, 'y', -150, 150).onChange(function(e){
	drone.position.setY(e);
});

gui.add(options, 'z', -150, 150).onChange(function(e){
	drone.position.setZ(e);
});

gui.addColor(options, 'sphereColor').onChange(
	function(e) {
		drone.material.color.set(e);
	}
);

let step = 0;
let speed = .05;

function animate() {
	requestAnimationFrame( animate );

	renderer.render( scene, camera );

	step += speed;
	drone.position.y = 50 * Math.abs(Math.sin(step));

	if (arena) {
		arena.position.z = -50;
		arena.position.y = 20;
		arena.rotation.x = .09;
		arena.rotation.y = 0.15;
		arena.rotation.z = -.03;
		arena.scale.set(200, 200, 200);
	}

	if(room) {
		room.position.y = 20;
		room.position.z = -80;
		room.rotation.y = 1.5;
	}

	// scene.rotation.x += 300;
	// scene.rotation.z += 300;
	// scene.rotation.y += 300;

	// cube1.rotation.x += .5;
	// cube1.rotation.y += .5;
	// cube2.rotation.x += .8;
	// cube2.rotation.y += .8;
	// cube2.rotation.z += .8;
	// cube3.rotation.x += .2;
	// cube3.rotation.y += .2;
}

animate();

// code below here allows for screen to dynamically modify itself.
window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}