// Stopwatch State
const state = {
    isRunning: false,
    startTime: 0,
    pausedTime: 0,
    laps: [],
    totalPausedDuration: 0
};

// DOM Elements
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const millisecondsEl = document.getElementById('milliseconds');
const startPauseBtn = document.getElementById('startPauseBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapsListEl = document.getElementById('lapsList');
const circularDisplay = document.getElementById('circularDisplay');

let animationId = null;

// Format time to two digits
function formatTime(value) {
    return String(value).padStart(2, '0');
}

// Calculate elapsed time
function getElapsedTime() {
    if (!state.isRunning && state.pausedTime === 0) {
        return 0;
    }

    if (state.isRunning) {
        return Date.now() - state.startTime + state.totalPausedDuration;
    } else {
        return state.pausedTime;
    }
}

// Update display
function updateDisplay() {
    const elapsed = getElapsedTime();
    
    const totalMilliseconds = Math.floor(elapsed);
    const hours = Math.floor(totalMilliseconds / 3600000);
    const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
    const milliseconds = Math.floor((totalMilliseconds % 1000) / 10);

    hoursEl.textContent = formatTime(hours);
    minutesEl.textContent = formatTime(minutes);
    secondsEl.textContent = formatTime(seconds);
    millisecondsEl.textContent = formatTime(milliseconds);

    // Update circular display rotation
    const rotation = (totalMilliseconds / 1000) * 6; // 360/60 = 6 degrees per second
    circularDisplay.style.transform = `rotate(${rotation}deg)`;
}

// Start/Pause functionality
function toggleStartPause() {
    if (state.isRunning) {
        // Pause
        state.isRunning = false;
        state.pausedTime = getElapsedTime();
        startPauseBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Resume</span>';
        lapBtn.disabled = false;
        updateDisplay();
    } else {
        // Start/Resume
        state.isRunning = true;
        state.startTime = Date.now();
        state.totalPausedDuration = state.pausedTime;
        startPauseBtn.innerHTML = '<span class="btn-icon">⏸</span><span class="btn-text">Pause</span>';
        animate();
    }
}

// Animation loop
function animate() {
    updateDisplay();
    if (state.isRunning) {
        animationId = requestAnimationFrame(animate);
    }
}

// Reset functionality
function reset() {
    state.isRunning = false;
    state.startTime = 0;
    state.pausedTime = 0;
    state.laps = [];
    state.totalPausedDuration = 0;

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';
    millisecondsEl.textContent = '00';
    circularDisplay.style.transform = 'rotate(0deg)';

    startPauseBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Start</span>';
    lapBtn.disabled = true;

    // Clear laps
    lapsListEl.innerHTML = '<div class="no-laps-message">No laps recorded yet. Start timing to record laps!</div>';
}

// Add lap
function addLap() {
    if (!state.isRunning && state.pausedTime === 0) {
        return;
    }

    const lapTime = getElapsedTime();
    state.laps.push(lapTime);

    // Calculate lap duration (time since last lap)
    const previousLapTime = state.laps.length > 1 ? state.laps[state.laps.length - 2] : 0;
    const lapDuration = lapTime - previousLapTime;

    // Add to display
    renderLap(state.laps.length, lapDuration);
}

// Render lap
function renderLap(lapNumber, lapTime) {
    const hours = Math.floor(lapTime / 3600000);
    const minutes = Math.floor((lapTime % 3600000) / 60000);
    const seconds = Math.floor((lapTime % 60000) / 1000);
    const milliseconds = Math.floor((lapTime % 1000) / 10);

    const lapElement = document.createElement('div');
    lapElement.className = 'lap-item';
    lapElement.innerHTML = `
        <span class="lap-number">Lap ${lapNumber}</span>
        <span class="lap-time">
            ${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}.${formatTime(milliseconds)}
        </span>
    `;

    // Remove "no laps" message if it exists
    const noLapsMessage = lapsListEl.querySelector('.no-laps-message');
    if (noLapsMessage) {
        noLapsMessage.remove();
    }

    // Add to top of list
    lapsListEl.insertBefore(lapElement, lapsListEl.firstChild);
}

// Event listeners
startPauseBtn.addEventListener('click', toggleStartPause);
lapBtn.addEventListener('click', addLap);
resetBtn.addEventListener('click', reset);

// Initial state
lapBtn.disabled = true;