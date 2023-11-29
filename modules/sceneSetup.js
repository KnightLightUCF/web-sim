import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function initializeScene(scene) {
	// Light setup
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
    
	// Stadium setup
	const stadiumGeo = new THREE.PlaneGeometry(100, 100);
	const stadiumMat = new THREE.MeshStandardMaterial({color: 'white', side: THREE.DoubleSide});
	const stadiumMesh = new THREE.Mesh(stadiumGeo, stadiumMat);
	scene.add( stadiumMesh );
	stadiumMesh.receiveShadow = true;
	stadiumMesh.rotation.x = .5 * Math.PI;
    
	stadiumMesh.position.set(-200, -5, -200);
    
	// Field setup
	const fieldGeo = new THREE.PlaneGeometry(200, 200);
	const fieldMat = new THREE.MeshStandardMaterial({color: 'lightgreen', side: THREE.DoubleSide});
	const fieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
	scene.add( fieldMesh );
	fieldMesh.receiveShadow = true;
	fieldMesh.rotation.x = .5 * Math.PI;
    
	fieldMesh.position.y = -1;

	// Arena model loading
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

	return { Dlight };
}
