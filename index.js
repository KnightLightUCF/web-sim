const showProgression = document.getElementById('show_progression');
const hoverTimeMarker = document.getElementById('hover_time_marker');
const timelineDiv = document.getElementById('timeline_div');

let progress = 0; // Initial progress
let totalDuration = 10; // Total duration in seconds

// Set initial progress
setProgress(progress);

// Event listeners
// timelineDiv.addEventListener('mousemove', (e) => {
//     const rect = timelineDiv.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const currentTimeInMs = (x / rect.width) * totalDuration;
//     const currentTimeInSeconds = currentTimeInMs / 1000;
//     hoverTimeMarker.style.left = `${x}px`;
//     hoverTimeMarker.textContent = `${currentTimeInSeconds.toFixed(1)}s`;
//     hoverTimeMarker.style.display = 'block';
// });

// timelineDiv.addEventListener('mouseleave', () => {
//     hoverTimeMarker.style.display = 'none';
// });

function formatDuration(totalDuration) {
    const totalSeconds = totalDuration / 1000;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    let formattedTime = '';
    if (hours > 0) {
        // Format as hh:mm:ss
        formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
        // Format as mm:ss
        formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return formattedTime;
}

// function setProgress(value) {
//     progress = Math.min(Math.max(value, 0), 100); // Ensure progress is between 0 and 100
//     showProgression.style.width = `${progress}%`;
// }

function setProgress(value) {
    progress = Math.min(Math.max(value, 0), 100); // Ensure progress is between 0 and 100

    // const progressBar = document.getElementById('show_progression');
    // const progressBarWidth = progressPercentage; // Assuming this is a percentage value (0 to 100)

    // Set the width of the progress bar
    // showProgression.style.width = progressBarWidth + '%';
    showProgression.style.width = `${progress}%`;


    // If the progress bar is nearly full, apply the border-radius
    if (progress >= 99) {
        showProgression.style.borderTopRightRadius = '10px';
        showProgression.style.borderBottomRightRadius = '10px';
    } else {
        // Remove the border-radius for the right side when not at the end
        showProgression.style.borderTopRightRadius = '0';
        showProgression.style.borderBottomRightRadius = '0';
    }
}


function updateTotalDuration(newTotalDuration) {
    totalDuration = newTotalDuration;
    document.getElementById("duration").innerText = formatDuration(totalDuration);
    progress = 1;
    setProgress(progress);
}

function updateProgressBar(stopwatch) {
    const currentTime = stopwatch.getTime();
    const progressPercentage = (currentTime / totalDuration) * 100;
    setProgress(progressPercentage);
}

// Volume Slider
/*
document.getElementById("volume_icon").addEventListener("click", function() {
    let slider = document.getElementById("volume_slider");

    // If slider value is not '0', save the current value and set it to '0'
    if (slider.value !== '0') {
        slider.setAttribute('data-prev-value', slider.value); // Store the current value
        slider.value = '0';
        this.classList.remove('fa-volume-low', 'fa-volume-high');
        this.classList.add('fa-volume-xmark');
    } else {
        // If slider value is '0', restore the previous value or set to '100' if there's no previous value
        let prevValue = slider.getAttribute('data-prev-value') || '100';
        slider.value = prevValue; // Restore the previous value or set to '100'
        slider.removeAttribute('data-prev-value'); // Remove the stored previous value
        this.classList.remove('fa-volume-xmark');
        // Determine which icon to show based on the volume level
        if (prevValue > 0 && prevValue <= 50) {
            this.classList.add('fa-volume-low');
        } else if (prevValue > 50) {
            this.classList.add('fa-volume-high');
        }
    }
});

document.getElementById("volume_slider").addEventListener("input", function() {
    let volumeIcon = document.getElementById("volume_icon");
    volumeIcon.classList.remove('fa-volume-xmark', 'fa-volume-low', 'fa-volume-high');
    if (this.value == 0) {
        volumeIcon.classList.add('fa-volume-xmark');
    } else if (this.value < 50) {
        volumeIcon.classList.add('fa-volume-low');
    } else {
        volumeIcon.classList.add('fa-volume-high');
    }
});

//*/

// Closed Captioning Button
/*
document.getElementById("cc_btn").addEventListener("click", function() {
    this.classList.toggle("active");
});
//*/

// Fullscreen logic
document.getElementById('fullscreen_btn').addEventListener('click', function() {
    var elem = document.documentElement;
    if (!document.fullscreenElement) {

      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
      }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
          }
    }
});

// Fullscreen listener events
document.addEventListener('fullscreenchange', updateIcons);
document.addEventListener('webkitfullscreenchange', updateIcons); // Safari
document.addEventListener('msfullscreenchange', updateIcons); // IE11

// Update fullscreen icons
function updateIcons() {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
        // In fullscreen mode
        document.getElementById("expand_icon").style.display = "none";
        document.getElementById("compress_icon").style.display = "block";
    } else {
        // Not in fullscreen mode
        document.getElementById("expand_icon").style.display = "block";
        document.getElementById("compress_icon").style.display = "none";
    }
}

export { updateTotalDuration, updateProgressBar };
