import * as THREE from 'three';

let curves = [];
let currentCurveIndex = 0;
let curveProgress = 0;
const deltaTime = 0.01;

function initializeTrajectory(trajectoryData) {
	for (let i = 0; i < trajectoryData.points.length - 1; i++) {
		const startPoint = new THREE.Vector3(trajectoryData.points[i][1][0], trajectoryData.points[i][1][2], trajectoryData.points[i][1][1]);
		const endPoint = new THREE.Vector3(trajectoryData.points[i + 1][1][0], trajectoryData.points[i + 1][1][2], trajectoryData.points[i + 1][1][1]);
		// Determine the type of curve based on the presence of control points
		if (trajectoryData.points[i + 1][2].length === 0) {
			// No control points, so use a linear curve
			const curve = new THREE.LineCurve3(startPoint, endPoint);
			curves.push(curve);
		} else {
			// Control points present, use cubic Bezier curve
			const controlPoints = trajectoryData.points[i + 1][2].map(cp => new THREE.Vector3(cp[0], cp[2], cp[1]));
			const curve = new THREE.CubicBezierCurve3(startPoint, controlPoints[0], controlPoints[1], endPoint);
			curves.push(curve);
		}
	}
}

let isDelayed = false;

function show_animation(drone) {
	if (isDelayed) {
		return;  // If we're in a delay period, don't progress the animation
	}

	if (currentCurveIndex < curves.length) {
		const currentCurve = curves[currentCurveIndex];
		const point = currentCurve.getPoint(curveProgress);

		drone.position.copy(point);

		curveProgress += deltaTime;

		if (curveProgress >= 1) {
			currentCurveIndex++;
			curveProgress = 0;
		}
	} else {
		currentCurveIndex = 0;
		curveProgress = 0;
		isDelayed = false;
	}
}

export {show_animation, initializeTrajectory};