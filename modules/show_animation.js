import * as THREE from 'three';

// Adjust the speed of the show
const deltaTime = 0.01;

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

// Animate the movement of drones along their defined trajectories
function show_animation(drones) {
	// Iterate over each drone to update its position
    drones.forEach((drone, index) => {
        const data = drone.trajectoryData;

		// Check if the drone hasn't completed its trajectory
        if (data.currentCurveIndex < data.curves.length) {
			// Current curve the drone is following
            const currentCurve = data.curves[data.currentCurveIndex];
            
			// Get the drone's position on the curve based on its progress
			const point = currentCurve.getPoint(data.curveProgress);

			// Update the drone's position
            drone.position.copy(point);

			// Increment the progress along the curve by the time delta
            data.curveProgress += deltaTime;

			// Check if the drone has reached or passed the end of the current curve
            if (data.curveProgress >= 1) {
				// Move to the next curve and reset progress
                data.currentCurveIndex++;
                data.curveProgress = 0;
            }
        } else {
			// The drone has completed its trajectory, reset its position and progress
            data.currentCurveIndex = 0;
            data.curveProgress = 0;
        }
    });
}

export {show_animation, initializeTrajectory};