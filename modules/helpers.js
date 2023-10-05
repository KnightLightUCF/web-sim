import * as THREE from 'three';

function helpers(scene, Dlight) {
	const DlightHelper = new THREE.DirectionalLightHelper(Dlight, 100);
	scene.add(DlightHelper);

	const DlightShadowHelper = new THREE.CameraHelper(Dlight.shadow.camera);
	scene.add(DlightShadowHelper);

	const axes = new THREE.AxesHelper(1000);
	scene.add(axes);

	const gridHelperZ = new THREE.GridHelper( 1000, 10 );
	scene.add( gridHelperZ );

	const gridHelperY = new THREE.GridHelper( 1000, 10 );
	scene.add( gridHelperY );

	gridHelperZ.rotation.x =  .5 * Math.PI;
}

export default helpers;