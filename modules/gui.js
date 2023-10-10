import * as DAT from 'dat.gui';

function renderGUI(drone, showState, files, setCurrentFile) {
	const gui = new DAT.GUI();

	let playController;  // Define a variable for the checkbox controller

	const options = {
		sphereColor: '#cf1657',
		x: 0,
		y: 0,
		z: 0,
		Play: false
	};

	gui.add(options, 'x', -150, 150).onChange(function(e){
		drone.position.setX(e);
	});

	gui.add(options, 'y', -150, 150).onChange(function(e){
		drone.position.setY(e);
	});

	gui.add(options, 'z', -150, 150).onChange(function(e){
		drone.position.setZ(e);
	});

	gui.addColor(options, 'sphereColor').onChange(
		function(e) {
			drone.material.color.set(e);
		}
	);

	// Space bar play and stop functionality
	playController = gui.add(options, 'Play', true, false).onChange((e)=> {
		return showState.playing = e;
	});

	if (files && files.length) {
		const fileController = gui.add({file: files[0]}, 'file', files).name('Select File');
        fileController.onChange(function(selectedFile){
            setCurrentFile(selectedFile);
        });
    }

	return playController;
}

export default renderGUI;