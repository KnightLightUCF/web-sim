// not implemented 
async function ShowSetup(show) {
	// if (drone_list) {
	// 	drone_list.forEach(oldDrone => {
	// 		scene.remove(oldDrone);
	// 	});
	// }

	guiObjects = renderGUI(drone, showState, predefinedViews, setCurrentFile, stopwatch, changeCameraView, focusOnDrones);
	playController = guiObjects.playController;
	guiOptions = guiObjects.options;

	console.log(guiOptions);

	if (stopwatch) {
		stopwatch.stop();
		stopwatch.reset();
		guiOptions.timerOptions.time = '00:00.000';
	}

	const result = await ParseSkyc(`./sample_data/${show}`, scene, drone);
	drone_list = result.drones;
	stopConditionTime = result.maxLandingTime * 1000; // Convert to milliseconds


	if (stopwatch && showState.playing) {
		stopwatch.start();
	}
	console.log(drone_list);
	return drone_list;
	
}

export default temp;