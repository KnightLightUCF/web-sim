import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function initializeScene(scene, config) {
	let droneTakeoffField;

	// Light setup from config
	const ambientLightConfig = config.light.ambient;
	const ambientLight = new THREE.AmbientLight(ambientLightConfig.color, ambientLightConfig.intensity);
	scene.add(ambientLight);

	const directionalLightConfig = config.light.directional;
	const Dlight = new THREE.DirectionalLight(directionalLightConfig.color, directionalLightConfig.intensity);
	Dlight.position.set(...directionalLightConfig.position);
	Dlight.castShadow = true; // Assuming all directional lights cast shadows
	
	// Apply shadow camera settings from the configuration
	const shadowConfig = directionalLightConfig.shadow.camera;
	Dlight.shadow.camera.top = shadowConfig.top;
	Dlight.shadow.camera.bottom = shadowConfig.bottom;
	Dlight.shadow.camera.right = shadowConfig.right;
	Dlight.shadow.camera.left = shadowConfig.left;
	
	// Configure other shadow properties if needed
	scene.add(Dlight);
	
	// Objects setup from config
	config.objects.forEach(obj => {
		const geometry = new THREE.PlaneGeometry(...obj.geometry);
		const material = new THREE.MeshStandardMaterial({ color: obj.material.color, side: THREE[obj.material.side] });
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(...obj.position);
		mesh.rotation.set(...obj.rotation);
		mesh.receiveShadow = obj.receiveShadow;
		scene.add(mesh);

		if (obj.isDroneTakeoffField) {
		droneTakeoffField = mesh; // Store the mesh if it's marked as a drone takeoff field
		}
	});

	// Model loading from config
	const loader = new GLTFLoader();
	config.models.forEach(model => {
		loader.load(model.path, (glb) => {
		const arena = glb.scene;
		arena.position.set(...model.position);
		arena.rotation.set(...model.rotation);
		arena.scale.set(...model.scale);
		scene.add(arena);
		}, undefined, function (error) {
		console.error(error);
		});
	});

	return { Dlight, droneTakeoffField };
}
