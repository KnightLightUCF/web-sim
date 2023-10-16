import {initializeTrajectory} from './show_animation';

function ParseSkyc(file, scene, drone) {
	let droneNames = [];
	let drones = [];
	let maxLandingTime = 0;  // Track the latest landing time among all drones

	// Dynamic import
	fetch(file)
		.then(response => response.blob())
		.then(blob => {
			const jszip = new JSZip();
			return jszip.loadAsync(blob);
		})
		.then(zip => {
			// New method: Fetching the list of drone names from the directory structure
			droneNames = [...new Set(Object.keys(zip.files).filter(file => file.startsWith('drones/Drone')).map(file => file.split('/')[1]))];

			// Fetching trajectories for all drones
			const promises = droneNames.map(name => zip.file(`drones/${name}/trajectory.json`).async('string'));

			return Promise.all(promises);
		})
		.then(datas => {
			datas.forEach((data, index) => {
				// Convert string data to JSON
				const jsonData = JSON.parse(data);

				// Track the maximum landing time
				if (jsonData.landingTime > maxLandingTime) {
					maxLandingTime = jsonData.landingTime;
				}

				// Create the sphere (drone)
				const droneMesh = drone.clone();
	
				// Set the drone's initial coordinates based off it's trajectory.json
				const initialPosition = jsonData.points[0][1];
				droneMesh.position.set(initialPosition[0], initialPosition[2], initialPosition[1]);

				// Initialize drone's trajectory data
				droneMesh.trajectoryData = {
					curves: [],
					durations: [],
					currentCurveIndex: 0,
					curveProgress: 0
				};

				// Compute durations
				for (let i = 1; i < jsonData.points.length; i++) {
					const duration = jsonData.points[i][0] - jsonData.points[i - 1][0];
					droneMesh.trajectoryData.durations.push(duration);
				}

				// Add to drones array
				drones.push(droneMesh);

				// Add drone to the scene
				scene.add(droneMesh);

				// Call initializeTrajectory
				initializeTrajectory(jsonData, droneMesh);
			});
		})
		.catch(error => {
			// We won't make errors, but just incase
			console.error('File processing error:', error);
		});
	// return drones;
	// Make maxLandingTime accessible outside this function. One way is to return it.
	return { drones, maxLandingTime };
}

export default ParseSkyc;