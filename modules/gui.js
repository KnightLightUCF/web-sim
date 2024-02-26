import * as DAT from 'dat.gui';
import { SkycZip } from '../sample_data/fileList.json';

const gui = new DAT.GUI();

// this need refractored
// need to swap this to multiple functions e.g (one for the timer, one for the show selection, one for the views, and so on) current state is a a pain to maintain.
function renderGUI(drone, showState, stopwatch, predefinedViews, changeCameraView, droneFocus, temp) {
	const options = {
		Play: false,
		speed: 2,
		timerOptions: {
			time: '00:00.000'
		},
		playController: false
	};

	// Move speed options (arrows and WASD for camera)
	const speeds = [1, 2, 3, 4, 5, 10];
	gui.add(options, 'speed', speeds).name('Speed');

	// Space bar play and stop functionality
	options.playController = gui.add(options, 'Play', true, false).onChange((e)=> {
		showState.playing = e;
		if (showState.playing) {
			stopwatch.start();
		} else {
			stopwatch.stop();
		}
	});

	// .skyc file dropdown
	if (SkycZip && SkycZip.length) {
		const fileController = gui.add({file: SkycZip[0]}, 'file', SkycZip).name('Select File');
		fileController.onChange(function(selectedFile){

			if (stopwatch) {
				stopwatch.stop();
				stopwatch.reset();
				options.timerOptions.time = '00:00.000';
			}
			temp(selectedFile);

			// Remove focus from dropdown so space bar can be pressed to pause or play
			document.activeElement.blur();
		});
	}

	let timerController = gui.add(options.timerOptions, 'time').name('Timer').listen();
	let timerDomElement = timerController.domElement;
	timerDomElement.style.pointerEvents = 'none';

	// Prevent double toggling when pressing spacebar over GUI controls
	const guiContainer = document.querySelector('.dg.main');
	if (guiContainer) {
		guiContainer.addEventListener('keydown', (event) => {
			if (event.code === 'Space') {
				event.stopPropagation();  // Stop the spacebar event from propagating to other listeners
			}
		}, true);
	}

	// Focus on drones button
	gui.add({ focusOnDrones: droneFocus }, 'focusOnDrones').name('Focus on Drones');

	return { options };
}

export default renderGUI;