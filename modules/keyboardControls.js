// Move state declaration
export const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
	up: false,
    down: false
};

export function initKeyboardControls() {
    // Keydown event (press)
    document.addEventListener('keydown', (event) => {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                moveState.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                moveState.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                moveState.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                moveState.right = true;
                break;
            case 'KeyQ':
                moveState.up = true;
                break;
            case 'KeyE':
                moveState.down = true;
                break;
        }
    });

    // Keyup event (stop pressing)
    document.addEventListener('keyup', (event) => {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                moveState.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                moveState.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                moveState.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                moveState.right = false;
                break;
            case 'KeyQ':
                moveState.up = false;
                break;
            case 'KeyE':
                moveState.down = false;
                break;
        }
    });
}
