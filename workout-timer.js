// Workout Timer JS - HIIT, EMOM, and Exercise Tracking

// Global variables for timer
let isTimerRunning = false;
let timer = null;
let workTime = 40; // Default work time in seconds
let restTime = 20; // Default rest time in seconds
let totalRounds = 4; // Default number of rounds
let currentRound = 0;
let currentPhase = 'work'; // 'work', 'rest', or 'transition'
let secondsRemaining = 0;
let timerType = 'hiit'; // 'hiit', 'emom', 'tabata', etc.
let exercises = []; // Array of exercise objects for the current workout
let currentExerciseIndex = 0;

// Global variables for rep counter
let currentReps = 0;
let targetReps = 10; // Will be set dynamically based on exercise
let currentSets = 0;
let targetSets = 3; // Will be set dynamically based on exercise
let isRepCounterActive = false;

// DOM elements
let timerContainer = null;
let repCounterContainer = null;

// Initialize the workout timer module - run immediately when script loads
(function() {
    console.log('Initializing workout timer module...');
    // This function runs immediately when the page loads
    // Set up event listeners once DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupWorkoutTimer);
    } else {
        // DOM already loaded
        setupWorkoutTimer();
    }
})();

// Setup function called when DOM is loaded
function setupWorkoutTimer() {
    console.log('Setting up workout timer...');
    
    // Check if timer elements exist, create if not
    timerContainer = document.querySelector('.timer-overlay');
    repCounterContainer = document.querySelector('.rep-counter-container');
    
    if (!timerContainer) {
        createTimerUI();
    }
    
    if (!repCounterContainer) {
        createRepCounterUI();
    }
    
    // Get DOM elements for timer
    const startBtn = document.getElementById('timer-start-btn');
    const resetBtn = document.getElementById('timer-reset-btn');
    const timerTypeSelect = document.getElementById('timer-type-select');
    
    // Add event listeners for timer
    if (startBtn) {
        console.log('Adding timer start button listener');
        startBtn.addEventListener('click', toggleTimer);
    }
    
    if (resetBtn) {
        console.log('Adding timer reset button listener');
        resetBtn.addEventListener('click', resetTimer);
    }
    
    if (timerTypeSelect) {
        console.log('Adding timer type select listener');
        timerTypeSelect.addEventListener('change', changeTimerType);
    }
    
    // Get DOM elements for rep counter
    const repIncrementBtn = document.getElementById('rep-increment-btn');
    const repDecrementBtn = document.getElementById('rep-decrement-btn');
    const setIncrementBtn = document.getElementById('set-increment-btn');
    const repCounterStartBtn = document.getElementById('rep-counter-start-btn');
    
    // Add event listeners for rep counter
    if (repIncrementBtn) {
        console.log('Adding rep increment button listener');
        repIncrementBtn.addEventListener('click', () => incrementReps());
    }
    
    if (repDecrementBtn) {
        console.log('Adding rep decrement button listener');
        repDecrementBtn.addEventListener('click', () => decrementReps());
    }
    
    if (setIncrementBtn) {
        console.log('Adding set increment button listener');
        setIncrementBtn.addEventListener('click', () => incrementSets());
    }
    
    if (repCounterStartBtn) {
        console.log('Adding rep counter start button listener');
        repCounterStartBtn.addEventListener('click', toggleRepCounter);
    }
    
    // Check for workout data in the page
    loadWorkoutData();
    
    // Initialize UI
    updateTimerDisplay();
    updateRepCounterDisplay();
    addTouchEvents();
    
    console.log('Workout timer setup complete');
}

// Create timer UI if not present
function createTimerUI() {
    console.log('Creating timer UI...');
    // Create container
    timerContainer = document.createElement('div');
    timerContainer.className = 'timer-overlay';
    timerContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000; background-color: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); padding: 15px; max-width: 280px; width: 100%; transition: all 0.3s ease; backdrop-filter: blur(10px); border: 1px solid rgba(0, 0, 0, 0.1);';
    
    // Create timer HTML
    const timerHTML = `
        <div class="timer-container">
            <div class="timer-circle-container" style="position: relative; width: 160px; height: 160px; margin-bottom: 15px;">
                <svg class="timer-circle" width="100%" height="100%" viewBox="0 0 160 160" style="transform: rotate(-90deg);">
                    <circle class="timer-circle-bg" cx="80" cy="80" r="70" style="fill: none; stroke: #f0f0f0; stroke-width: 5;"></circle>
                    <circle id="timer-circle-progress" class="timer-circle-progress" cx="80" cy="80" r="70" style="fill: none; stroke: #34495e; stroke-width: 5; stroke-linecap: round; transition: stroke-dashoffset 0.1s;"></circle>
                </svg>
                <div id="timer-display" class="timer-display" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2rem; font-weight: 600; color: #34495e;">0:40</div>
            </div>
            
            <div class="timer-info" style="text-align: center; margin-bottom: 10px;">
                <div id="phase-display">WORK</div>
                <div id="round-display">Round 1/4</div>
            </div>
            
            <div class="timer-controls" style="display: flex; justify-content: center; gap: 10px; margin-bottom: 10px; width: 100%;">
                <button id="timer-start-btn" class="timer-button" style="background-color: #34495e; color: white; border: none; border-radius: 8px; padding: 8px 16px; font-size: 1rem; cursor: pointer;">Start</button>
                <button id="timer-reset-btn" class="timer-button" style="background-color: #34495e; color: white; border: none; border-radius: 8px; padding: 8px 16px; font-size: 1rem; cursor: pointer;">Reset</button>
            </div>
            
            <div>
                <select id="timer-type-select" style="width: 100%; padding: 8px; border-radius: 8px; margin-bottom: 10px;">
                    <option value="hiit">HIIT Timer</option>
                    <option value="tabata">Tabata Timer</option>
                    <option value="emom">EMOM Timer</option>
                </select>
            </div>
            
            <div class="timer-next" style="text-align: center; margin-top: 5px; font-size: 0.9rem; color: #333;">
                <p>Current: <span id="current-exercise">-</span></p>
                <p>Next: <span id="next-exercise">-</span></p>
            </div>
        </div>
    `;
    
    timerContainer.innerHTML = timerHTML;
    document.body.appendChild(timerContainer);
    
    console.log('Timer UI created');
}

// Create rep counter UI if not present
function createRepCounterUI() {
    console.log('Creating rep counter UI...');
    // Create container
    repCounterContainer = document.createElement('div');
    repCounterContainer.className = 'rep-counter-overlay';
    repCounterContainer.style.cssText = 'position: fixed; bottom: 20px; left: 20px; z-index: 1000; background-color: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); padding: 15px; max-width: 280px; width: 100%; transition: all 0.3s ease; backdrop-filter: blur(10px); border: 1px solid rgba(0, 0, 0, 0.1);';
    
    // Create rep counter HTML
    const repCounterHTML = `
        <div class="rep-counter-container">
            <div class="rep-count-display" style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 0.9rem; color: #666;">Reps</div>
                <div style="display: flex; align-items: baseline; justify-content: center;">
                    <span id="rep-count" style="font-size: 3rem; font-weight: 700; color: #34495e;">0</span>
                    <span id="rep-target" style="font-size: 1.2rem; color: #666; margin-left: 5px;">/10</span>
                </div>
                <div style="height: 5px; background: #f0f0f0; border-radius: 3px; margin: 5px 0; width: 100%;">
                    <div id="rep-progress" style="height: 100%; background: #34495e; border-radius: 3px; width: 0%; transition: width 0.3s;"></div>
                </div>
            </div>
            
            <div class="set-count-display" style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 0.9rem; color: #666;">Sets</div>
                <div style="display: flex; align-items: baseline; justify-content: center;">
                    <span id="set-count" style="font-size: 2rem; font-weight: 600; color: #34495e;">0</span>
                    <span id="set-target" style="font-size: 1rem; color: #666; margin-left: 5px;">/3</span>
                </div>
                <div style="height: 5px; background: #f0f0f0; border-radius: 3px; margin: 5px 0; width: 100%;">
                    <div id="set-progress" style="height: 100%; background: #27ae60; border-radius: 3px; width: 0%; transition: width 0.3s;"></div>
                </div>
            </div>
            
            <div class="rep-controls" style="display: flex; justify-content: center; gap: 10px; margin-bottom: 15px;">
                <button id="rep-decrement-btn" class="rep-button" style="background-color: #e74c3c; color: white; border: none; border-radius: 8px; padding: 10px 16px; font-size: 1.2rem; cursor: pointer;">-</button>
                <button id="rep-increment-btn" class="rep-button rep-add" style="background-color: #27ae60; color: white; border: none; border-radius: 8px; padding: 10px 16px; font-size: 1.2rem; cursor: pointer;">+</button>
            </div>
            
            <div style="display: flex; justify-content: center; gap: 10px; width: 100%;">
                <button id="set-increment-btn" style="flex: 1; background-color: #3498db; color: white; border: none; border-radius: 8px; padding: 8px; font-size: 0.9rem; cursor: pointer;">Complete Set</button>
                <button id="rep-counter-start-btn" style="flex: 1; background-color: #34495e; color: white; border: none; border-radius: 8px; padding: 8px; font-size: 0.9rem; cursor: pointer;">Start</button>
            </div>
            
            <div id="next-exercise-prompt" style="text-align: center; margin-top: 10px; padding: 10px; background: #2ecc71; color: white; border-radius: 8px; display: none; cursor: pointer;">
                Exercise Complete! Click to continue
            </div>
        </div>
    `;
    
    repCounterContainer.innerHTML = repCounterHTML;
    document.body.appendChild(repCounterContainer);
    
    console.log('Rep counter UI created');
}

// Load workout data from the page
function loadWorkoutData() {
    console.log('Loading workout data...');
    // Try to find exercise data in the page
    const exerciseTables = document.querySelectorAll('table');
    
    if (exerciseTables.length > 0) {
        exercises = [];
        
        // Process each table to extract exercise data
        exerciseTables.forEach((table, tableIndex) => {
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach((row, rowIndex) => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 3) { // Make sure there are enough cells
                    // Extract exercise data
                    const exercise = {
                        name: cells[0].textContent.trim(),
                        reps: extractReps(cells[1].textContent.trim()),
                        sets: extractSets(cells[1].textContent.trim()),
                        workTime: extractWorkTime(cells[1].textContent.trim()),
                        restTime: extractRestTime(cells[2].textContent.trim()),
                        notes: cells.length > 3 ? cells[3].textContent.trim() : '',
                        tableIndex: tableIndex,
                        rowIndex: rowIndex
                    };
                    
                    exercises.push(exercise);
                }
            });
        });
        
        console.log('Found', exercises.length, 'exercises');
        
        // Initialize with first exercise if available
        if (exercises.length > 0) {
            setCurrentExercise(0);
        }
    } else {
        console.log('No exercise tables found');
    }
}

// Helper functions to extract data from table cells
function extractReps(text) {
    const repsMatch = text.match(/(\d+)\s*(?:reps|rep)/i);
    return repsMatch ? parseInt(repsMatch[1]) : 0;
}

function extractSets(text) {
    const setsMatch = text.match(/(\d+)\s*(?:sets|set|×)/i);
    return setsMatch ? parseInt(setsMatch[1]) : 0;
}

function extractWorkTime(text) {
    const timeMatch = text.match(/(\d+)\s*(?:s|sec|seconds)/i);
    return timeMatch ? parseInt(timeMatch[1]) : workTime;
}

function extractRestTime(text) {
    const timeMatch = text.match(/(\d+)\s*(?:s|sec|seconds)/i);
    return timeMatch ? parseInt(timeMatch[1]) : restTime;
}

// Set the current exercise
function setCurrentExercise(index) {
    if (index >= 0 && index < exercises.length) {
        console.log('Setting current exercise to', index);
        currentExerciseIndex = index;
        const exercise = exercises[currentExerciseIndex];
        
        console.log('Exercise:', exercise);
        
        // Update rep counter
        if (exercise.reps > 0) {
            targetReps = exercise.reps;
            currentReps = 0;
        }
        
        // Update set counter
        if (exercise.sets > 0) {
            targetSets = exercise.sets;
            currentSets = 0;
        }
        
        // Update timer
        if (exercise.workTime > 0) {
            workTime = exercise.workTime;
        }
        
        if (exercise.restTime > 0) {
            restTime = exercise.restTime;
        }
        
        // Update display
        updateTimerDisplay();
        updateRepCounterDisplay();
        updateCurrentExerciseDisplay();
    }
}

// Update the current exercise display
function updateCurrentExerciseDisplay() {
    const exerciseDisplay = document.getElementById('current-exercise');
    const nextExerciseDisplay = document.getElementById('next-exercise');
    
    if (exerciseDisplay && currentExerciseIndex < exercises.length) {
        const exercise = exercises[currentExerciseIndex];
        exerciseDisplay.textContent = exercise.name;
    }
    
    if (nextExerciseDisplay && currentExerciseIndex + 1 < exercises.length) {
        const nextExercise = exercises[currentExerciseIndex + 1];
        nextExerciseDisplay.textContent = nextExercise.name;
    } else if (nextExerciseDisplay) {
        nextExerciseDisplay.textContent = 'Workout Complete';
    }
}

// Change the timer type
function changeTimerType(event) {
    console.log('Changing timer type to', event.target.value);
    timerType = event.target.value;
    resetTimer();
    
    // Update settings based on timer type
    if (timerType === 'hiit') {
        workTime = 40;
        restTime = 20;
        totalRounds = 4;
    } else if (timerType === 'tabata') {
        workTime = 20;
        restTime = 10;
        totalRounds = 8;
    } else if (timerType === 'emom') {
        workTime = 60;
        restTime = 0;
        totalRounds = 10;
    }
    
    updateTimerDisplay();
}

// Start or pause the timer
function toggleTimer() {
    if (isTimerRunning) {
        console.log('Pausing timer');
        // Pause timer
        clearInterval(timer);
        isTimerRunning = false;
        
        // Update button text
        const startBtn = document.getElementById('timer-start-btn');
        if (startBtn) startBtn.textContent = 'Resume';
    } else {
        console.log('Starting timer');
        // Start timer
        startTimer();
        
        // Update button text
        const startBtn = document.getElementById('timer-start-btn');
        if (startBtn) startBtn.textContent = 'Pause';
    }
}

// Start the timer
function startTimer() {
    if (isTimerRunning) return;
    
    // Initialize timer state if needed
    if (currentRound === 0 && currentPhase === 'work' && secondsRemaining === 0) {
        secondsRemaining = workTime;
    }
    
    isTimerRunning = true;
    
    timer = setInterval(() => {
        secondsRemaining--;
        
        // Update timer display
        updateTimerDisplay();
        
        if (secondsRemaining <= 0) {
            // Switch phases or end session
            if (currentPhase === 'work') {
                // End of work phase
                if (timerType === 'emom') {
                    // For EMOM, end of work is end of round
                    currentRound++;
                    
                    if (currentRound >= totalRounds) {
                        // End of workout
                        clearInterval(timer);
                        isTimerRunning = false;
                        playNotification('complete');
                        resetTimer();
                        return;
                    }
                    
                    // Stay in work phase for next round
                    secondsRemaining = workTime;
                } else {
                    // Switch to rest phase for other timer types
                    currentPhase = 'rest';
                    secondsRemaining = restTime;
                    playNotification('rest');
                }
            } else if (currentPhase === 'rest') {
                // End of rest phase, start next round
                currentRound++;
                
                if (currentRound >= totalRounds) {
                    // End of workout
                    clearInterval(timer);
                    isTimerRunning = false;
                    playNotification('complete');
                    
                    // Move to next exercise if available
                    if (currentExerciseIndex + 1 < exercises.length) {
                        setCurrentExercise(currentExerciseIndex + 1);
                    }
                    
                    resetTimer();
                    return;
                }
                
                // Switch to work phase
                currentPhase = 'work';
                secondsRemaining = workTime;
                playNotification('work');
            }
            
            // Update timer display
            updateTimerDisplay();
        }
    }, 1000);
}

// Reset the timer
function resetTimer() {
    console.log('Resetting timer');
    // Clear timer
    clearInterval(timer);
    isTimerRunning = false;
    
    // Reset variables
    currentRound = 0;
    currentPhase = 'work';
    secondsRemaining = workTime;
    
    // Update displays
    updateTimerDisplay();
    
    // Update button text
    const startBtn = document.getElementById('timer-start-btn');
    if (startBtn) startBtn.textContent = 'Start';
}

// Update the timer display
function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    const phaseDisplay = document.getElementById('phase-display');
    const roundDisplay = document.getElementById('round-display');
    const progressCircle = document.getElementById('timer-circle-progress');
    
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(secondsRemaining);
    }
    
    if (phaseDisplay) {
        phaseDisplay.textContent = currentPhase.toUpperCase();
    }
    
    if (roundDisplay) {
        roundDisplay.textContent = `Round ${currentRound + 1}/${totalRounds}`;
    }
    
    // Update progress circle if it exists
    if (progressCircle) {
        const totalTime = currentPhase === 'work' ? workTime : restTime;
        const percentage = ((totalTime - secondsRemaining) / totalTime) * 100;
        const circumference = 2 * Math.PI * 70; // Assuming a radius of 70
        const offset = circumference - (percentage / 100) * circumference;
        
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = offset;
    }
}

// Format time in MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Play notification for phase changes
function playNotification(type) {
    console.log('Playing notification for', type);
    // Audio files if available
    const audio = {
        work: 'work-notification.mp3',
        rest: 'rest-notification.mp3',
        complete: 'complete-notification.mp3'
    };
    
    // Create and play audio if available
    try {
        const sound = new Audio(audio[type]);
        sound.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
        console.log('Audio notification unavailable');
    }
    
    // Visual notification
    const container = document.querySelector('.timer-container');
    if (container) {
        container.classList.add('flash');
        setTimeout(() => container.classList.remove('flash'), 500);
    }
}

// Rep Counter Functions

// Toggle the rep counter
function toggleRepCounter() {
    console.log('Toggling rep counter');
    isRepCounterActive = !isRepCounterActive;
    
    // Update UI
    const repCounterStartBtn = document.getElementById('rep-counter-start-btn');
    if (repCounterStartBtn) {
        repCounterStartBtn.textContent = isRepCounterActive ? 'Reset' : 'Start';
    }
    
    // Reset counters if stopping
    if (!isRepCounterActive) {
        currentReps = 0;
        currentSets = 0;
        updateRepCounterDisplay();
    }
}

// Increment the rep count
function incrementReps() {
    console.log('Incrementing reps:', currentReps, '->', currentReps + 1);
    if (currentReps < targetReps) {
        currentReps++;
        updateRepCounterDisplay();
        
        // Auto-increment set when reps are complete
        if (currentReps >= targetReps) {
            console.log('Reps complete, auto-incrementing set');
            setTimeout(() => {
                currentReps = 0;
                incrementSets();
            }, 500);
        }
    }
}

// Decrement the rep count
function decrementReps() {
    console.log('Decrementing reps:', currentReps, '->', currentReps - 1);
    if (currentReps > 0) {
        currentReps--;
        updateRepCounterDisplay();
    }
}

// Increment the set count
function incrementSets() {
    console.log('Incrementing sets:', currentSets, '->', currentSets + 1);
    if (currentSets < targetSets) {
        currentSets++;
        updateRepCounterDisplay();
        
        // Check if exercise is complete
        if (currentSets >= targetSets) {
            console.log('Exercise complete');
            showNextExercisePrompt();
        }
    }
}

// Update the rep counter display
function updateRepCounterDisplay() {
    const repCount = document.getElementById('rep-count');
    const setCount = document.getElementById('set-count');
    const repTarget = document.getElementById('rep-target');
    const setTarget = document.getElementById('set-target');
    const repProgress = document.getElementById('rep-progress');
    const setProgress = document.getElementById('set-progress');
    
    if (repCount) repCount.textContent = currentReps.toString();
    if (setCount) setCount.textContent = currentSets.toString();
    
    if (repTarget) repTarget.textContent = `/${targetReps}`;
    if (setTarget) setTarget.textContent = `/${targetSets}`;
    
    // Update progress bars
    if (repProgress) {
        repProgress.style.width = `${(currentReps / targetReps) * 100}%`;
    }
    
    if (setProgress) {
        setProgress.style.width = `${(currentSets / targetSets) * 100}%`;
    }
}

// Show the next exercise prompt
function showNextExercisePrompt() {
    console.log('Showing next exercise prompt');
    const nextPrompt = document.getElementById('next-exercise-prompt');
    if (nextPrompt) {
        nextPrompt.style.display = 'block';
        
        // Add event listener to move to next exercise
        nextPrompt.addEventListener('click', () => {
            if (currentExerciseIndex + 1 < exercises.length) {
                setCurrentExercise(currentExerciseIndex + 1);
                nextPrompt.style.display = 'none';
            }
        });
    }
    
    // Auto proceed to next exercise after 5 seconds
    setTimeout(() => {
        if (currentExerciseIndex + 1 < exercises.length) {
            setCurrentExercise(currentExerciseIndex + 1);
            if (nextPrompt) nextPrompt.style.display = 'none';
        }
    }, 5000);
}

// Mobile optimization - add touch events
function addTouchEvents() {
    console.log('Adding touch events');
    // Find buttons
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        // Add touch feedback
        button.addEventListener('touchstart', () => {
            button.style.opacity = '0.7';
        });
        
        button.addEventListener('touchend', () => {
            button.style.opacity = '1';
        });
    });
}