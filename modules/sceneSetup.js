import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function initializeScene(scene, config, camera) {
	// Light setup from config
	const ambientLightConfig = config.light.ambient;
	const ambientLight = new THREE.AmbientLight(ambientLightConfig.color, ambientLightConfig.intensity);
	scene.add(ambientLight);

	const directionalLightConfig = config.light.directional;
	const Dlight = new THREE.DirectionalLight(directionalLightConfig.color, directionalLightConfig.intensity);
	Dlight.position.set(...directionalLightConfig.position);
	Dlight.castShadow = true; // Assumes all directional lights cast shadows
	
	// Apply shadow camera settings from config
	const shadowConfig = directionalLightConfig.shadow.camera;
	Dlight.shadow.camera.top = shadowConfig.top;
	Dlight.shadow.camera.bottom = shadowConfig.bottom;
	Dlight.shadow.camera.right = shadowConfig.right;
	Dlight.shadow.camera.left = shadowConfig.left;
	
	scene.add(Dlight);

	// helpers.js
	const helpersConfig = config.helpers;

	if (helpersConfig.directionalLightHelper) {
	const DlightHelper = new THREE.DirectionalLightHelper(Dlight, 100);
	scene.add(DlightHelper);
	}

	if (helpersConfig.cameraHelper) {
	const DlightShadowHelper = new THREE.CameraHelper(Dlight.shadow.camera);
	scene.add(DlightShadowHelper);
	}

	if (helpersConfig.displayGrids) {
		const axesHelper = new THREE.AxesHelper(1000);
		const gridHelperZ = new THREE.GridHelper(1000, 10);
		gridHelperZ.rotation.x = Math.PI / 2;
		const gridHelperY = new THREE.GridHelper(1000, 10);
		
		scene.add(axesHelper, gridHelperZ, gridHelperY);
	}

	// Objects setup from config
	config.objects.forEach(obj => {
		const geometry = new THREE.PlaneGeometry(...obj.geometry);
		const material = new THREE.MeshStandardMaterial({ color: obj.material.color, side: THREE[obj.material.side] });
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(...obj.position);
		mesh.rotation.set(...obj.rotation);
		mesh.receiveShadow = obj.receiveShadow;
		scene.add(mesh);
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

	// Populate the dropdown menu with views from the config
	const viewsDropdown = document.getElementById('views_dropdown_menu');
	viewsDropdown.length = 0;
	config.views.forEach(view => {
		const option = document.createElement('option');
		option.value = view.name;
		option.textContent = view.name;
		viewsDropdown.appendChild(option);
	});
	
	if (config.views.length > 0) {
		camera.position.set(config.views[0].position[0], config.views[0].position[1], config.views[0].position[2]);
	}

	return { Dlight, sceneViews: config.views };
}
