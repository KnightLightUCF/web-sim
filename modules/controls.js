import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function controls(camera, renderer) {
	const controls = new OrbitControls( camera, renderer.domElement );

	camera.position.set(-200, 20, -200);

	controls.update();
}

export default controls;