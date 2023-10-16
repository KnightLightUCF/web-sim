import * as THREE from 'three';

function initializeTrajectory(trajectoryData, drone) {
	// Loop through each point in the trajectory data (excluding the last one)
	for (let i = 0; i < trajectoryData.points.length - 1; i++) {
		// Extract the x, y, and z coordinates from the trajectory data for the current and next points (The y and z coordinates are swapped in the data)
		const startPoint = new THREE.Vector3(trajectoryData.points[i][1][0], trajectoryData.points[i][1][2], trajectoryData.points[i][1][1]);
		const endPoint = new THREE.Vector3(trajectoryData.points[i + 1][1][0], trajectoryData.points[i + 1][1][2], trajectoryData.points[i + 1][1][1]);
		// Variable for the curve
		let curve;

		// Check if the next point has control points
		if (trajectoryData.points[i + 1][2].length === 0) {
			// No control points
			// Create a straight line between the two points
			curve = new THREE.LineCurve3(startPoint, endPoint);
		} else {
			// Control points present
			// Rearrange the coordinates
			const controlPoints = trajectoryData.points[i + 1][2].map(cp => new THREE.Vector3(cp[0], cp[2], cp[1]));

			// Create a cubic Bezier curve using the start point, end point, and the two control points
			curve = new THREE.CubicBezierCurve3(startPoint, controlPoints[0], controlPoints[1], endPoint);
		}

		// Store the created curve in the drone's trajectory data
		drone.trajectoryData.curves.push(curve);
	}
}

function show_animation(drones, stopwatch, stopConditionTime) {
    let allDronesCompleted = true;

    // Global time since the animation started
    const globalTime = stopwatch.getTime();

    drones.forEach((drone) => {
        const data = drone.trajectoryData;

        if (!data.completed && data.currentCurveIndex < data.curves.length) {
            allDronesCompleted = false; // At least one drone is still in action

            const currentCurve = data.curves[data.currentCurveIndex];
            const curveDuration = data.durations[data.currentCurveIndex] * 1000;  // Convert to ms
            const curveStartTime = data.currentCurveIndex === 0 ? 0 : data.durations.slice(0, data.currentCurveIndex).reduce((a, b) => a + b) * 1000;  // Convert to ms
            
            // Calculate normalized progress (from 0 to 1) based on global time and curve's duration and start time
            data.curveProgress = (globalTime - curveStartTime) / curveDuration;
            
            const point = currentCurve.getPoint(data.curveProgress);
            drone.position.copy(point);

            if (data.curveProgress >= 1) {
                data.currentCurveIndex++;
                data.curveProgress = 0;
            }
        } else if (!data.completed) {
            data.completed = true;
        }
    });

    if (allDronesCompleted) {
        if (stopwatch && globalTime >= stopConditionTime) {
            drones.forEach(drone => {
                drone.trajectoryData.currentCurveIndex = 0;
                drone.trajectoryData.curveProgress = 0;
                drone.trajectoryData.completed = false;
            });

            stopwatch.stop();
            stopwatch.reset();
            stopwatch.start();
        }
    }
}

export {show_animation, initializeTrajectory};