const showProgression = document.getElementById('show_progression');
const hoverTimeMarker = document.getElementById('hover_time_marker');
const fastForwardBtn = document.getElementById('fast_forward_btn');
const reverseBtn = document.getElementById('reverse_btn');
const timelineDiv = document.getElementById('timeline_div');

let progress = 0; // Initial progress
let totalDuration = 10; // Total duration in seconds

// Set initial progress
setProgress(progress);

// Event listeners
timelineDiv.addEventListener('mousemove', (e) => {
    const rect = timelineDiv.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const currentTimeInMs = (x / rect.width) * totalDuration;
    const currentTimeInSeconds = currentTimeInMs / 1000;
    hoverTimeMarker.style.left = `${x}px`;
    hoverTimeMarker.textContent = `${currentTimeInSeconds.toFixed(1)}s`;
    hoverTimeMarker.style.display = 'block';
});

timelineDiv.addEventListener('mouseleave', () => {
    hoverTimeMarker.style.display = 'none';
});

fastForwardBtn.addEventListener('click', () => {
    setProgress(progress + (1000 / totalDuration) * 100);
});

reverseBtn.addEventListener('click', () => {
    setProgress(progress - (1000 / totalDuration) * 100);
});
function setProgress(value) {
    progress = Math.min(Math.max(value, 0), 100); // Ensure progress is between 0 and 100
    showProgression.style.width = `${progress}%`;
}

function updateTotalDuration(newTotalDuration) {
    totalDuration = newTotalDuration;
    progress = 1;
    setProgress(progress);
}

function updateProgressBar(stopwatch) {
    const currentTime = stopwatch.getTime();
    const progressPercentage = (currentTime / totalDuration) * 100;
    setProgress(progressPercentage);
}

export { updateTotalDuration, updateProgressBar };
