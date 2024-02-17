import * as THREE from 'three';

export default function Panorama() {
	const loader = new THREE.TextureLoader();

	const texture = loader.load('../textures/turks.png');

	texture.wrapS = THREE.RepeatWrapping;
	// texture.repeat = -1;

	const geo = new THREE.SphereGeometry(500, 60, 40);

	geo.scale(-1, 1, 1);
	// geo.rotateZ(-175);
	// geo.rotateX(3);

	const mat = new THREE.MeshBasicMaterial({map: texture});

	const mesh = new THREE.Mesh(geo, mat);

	return {mesh};
}