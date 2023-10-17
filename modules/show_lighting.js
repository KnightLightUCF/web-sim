// show_lighting.js

function getLightColorForElapsedTime(lightingSequence, stopwatch) {
    // Get the current time
    let currentTime = stopwatch.getTime();

    // Iterate over each item in the lighting sequence
    for (let i = 0; i < lightingSequence.length; i++) {
        // If the current elapsed time is within the duration, return the color
        if (currentTime <= lightingSequence[i].duration) {
            return lightingSequence[i].color;
        }

        // Current time is not within the duration, reduce it from the currentTime
        currentTime -= lightingSequence[i].duration;
    }

    // Fallback: Return the last sequence's color if none match.
    return lightingSequence[lightingSequence.length - 1].color;
}

function updateDroneLighting(drone_list, stopwatch) {
    drone_list.forEach(drone => {
        // Extract the lightData from the drone
        let lightData = drone.lightData;

        // If the drone does not have lightData or a lightingSequence, skip it
        if (!lightData || !lightData.lightingSequence) return;

        // Get the current color based on elapsed time
        let currentColor = getLightColorForElapsedTime(lightData.lightingSequence, stopwatch);

        // Ensure drone has a material property and set its color
        if (drone.material) {
            drone.material.color.set(currentColor);
        }
    });
}

export {updateDroneLighting};