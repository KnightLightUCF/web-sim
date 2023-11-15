import {initializeTrajectory} from './show_animation';
import {convertLightData} from './lightDataConversion';
import * as THREE from 'three';

function ParseSkyc(file, scene, drone) {
	let droneNames = [];
	let drones = [];
	let maxLandingTime = 0;  // Track the latest landing time among all drones

	return new Promise((resolve, reject) => {
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

				// Fetching trajectories and lighting data for all drones
				const promises = droneNames.map(name => {
					const trajectoryPromise = zip.file(`drones/${name}/trajectory.json`).async('string');
					const lightsPromise = zip.file(`drones/${name}/lights.json`).async('string');
					return Promise.all([trajectoryPromise, lightsPromise]);
				});
		
				return Promise.all(promises);
			})
			.then(datas => {
				datas.forEach(([trajectoryData, lightsData], index) => {

					// Convert string data to JSON
					const jsonData = JSON.parse(trajectoryData);

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

					// Add lightData to the droneMesh
					let lightsDataJson = JSON.parse(lightsData);

					let result = convertLightData(lightsDataJson.data);
				
					let totalLightDuration = 0;
					(result.lightingSequence).forEach(color => {
						totalLightDuration += color.duration;
					});

					if ((totalLightDuration / 1000) > maxLandingTime) {
						maxLandingTime = (totalLightDuration / 1000);
					}

					droneMesh.lightData = {
					light: new THREE.PointLight(0xffffff, 1, 100),
					lightingSequence: result.lightingSequence
					};

					// Set the drone's material color to the first color listed in lightingSequence
					droneMesh.material.color.set(droneMesh.lightData.lightingSequence[0].color);

					// Add to drones array
					drones.push(droneMesh);

					// Add drone to the scene
					scene.add(droneMesh);

					// Call initializeTrajectory
					initializeTrajectory(jsonData, droneMesh);
				});

				// Resolve the promise with the final values
				resolve({ drones, maxLandingTime });
			})
			.catch(error => {
				// We won't make errors, but just incase
				console.error('File processing error:', error);
				reject(error);  // Reject the promise on error
			});
	});
}

export default ParseSkyc;
