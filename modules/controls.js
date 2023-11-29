import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function initControls(camera, renderer) {
	const controls = new OrbitControls( camera, renderer.domElement );

	camera.position.set(-200, 20, -200);

	controls.update();

	function changeView(position, rotation) {
		camera.position.copy(position);
		camera.rotation.copy(rotation);
		controls.update();
	}

	return { controls, changeView };
}

export default initControls;