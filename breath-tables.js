// Breath Tables JS - CO2 and O2 Table Training

// Global variables
let currentLevel = 1;
let maxLevel = 10;
let isBreathTimerRunning = false;
let breathTimer = null;
let breathHoldTime = 0;
let breathRestTime = 0;
let breathCycles = 0;
let currentCycle = 0;
let breathPhase = 'hold'; // 'hold' or 'rest'
let totalTime = 0;
let elapsedTime = 0;

// DOM Elements
let tableType = 'co2'; // 'co2' or 'o2'
let breathContainer = null;
let levelDisplay = null;
let startBtn = null;
let resetBtn = null;
let tableTypeToggle = null;

// Initialize the breath tables module - run this immediately when script loads
(function() {
    // This function runs immediately when the page loads
    // Set up event listeners once DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupBreathTable);
    } else {
        // DOM already loaded
        setupBreathTable();
    }
})();

// Setup function called when DOM is loaded
function setupBreathTable() {
    console.log('Setting up breath table...');
    
    // Get DOM elements
    breathContainer = document.querySelector('.breath-container');
    levelDisplay = document.getElementById('level-display');
    startBtn = document.getElementById('breath-start-btn');
    resetBtn = document.getElementById('breath-reset-btn');
    tableTypeToggle = document.getElementById('table-type-toggle');
    
    // Create container if it doesn't exist
    if (!breathContainer) {
        createBreathUI();
    }
    
    // Add event listeners if elements exist
    const levelUpBtn = document.getElementById('level-up-btn');
    const levelDownBtn = document.getElementById('level-down-btn');
    
    if (levelUpBtn) {
        console.log('Adding level up button listener');
        levelUpBtn.addEventListener('click', function() {
            changeLevel(1);
        });
    }
    
    if (levelDownBtn) {
        console.log('Adding level down button listener');
        levelDownBtn.addEventListener('click', function() {
            changeLevel(-1);
        });
    }
    
    if (startBtn) {
        console.log('Adding start button listener');
        startBtn.addEventListener('click', toggleBreathTimer);
    }
    
    if (resetBtn) {
        console.log('Adding reset button listener');
        resetBtn.addEventListener('click', resetBreathTimer);
    }
    
    if (tableTypeToggle) {
        console.log('Adding table type toggle listener');
        tableTypeToggle.addEventListener('click', toggleTableType);
    }
    
    // Set initial values
    levelDisplay = document.getElementById('level-display');
    if (levelDisplay) {
        levelDisplay.textContent = currentLevel;
    }
    
    // Initialize table settings
    updateTableSettings();
    console.log('Breath table setup complete');
}

// Create breath UI if not present
function createBreathUI() {
    console.log('Creating breath UI...');
    // Create container
    breathContainer = document.createElement('div');
    breathContainer.className = 'breath-container';
    breathContainer.style.cssText = 'background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 15px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1);';
    
    // Create controls
    const controlsHTML = `
        <div class="breath-controls" style="margin-bottom: 15px;">
            <h3>Breath Training</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div>
                    <button id="level-down-btn" style="width: 30px;">-</button>
                    <span>Level: <span id="level-display">1</span></span>
                    <button id="level-up-btn" style="width: 30px;">+</button>
                </div>
                <button id="table-type-toggle">CO2 Table</button>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <div id="breath-phase-display">HOLD BREATH</div>
                    <div id="breath-timer-display" style="font-size: 1.5rem; font-weight: bold;">1:00</div>
                </div>
                <div>
                    <div id="cycle-display">Cycle 1/8</div>
                    <div id="next-phase-display">Next: Rest (1:30)</div>
                </div>
            </div>
            <div style="margin-top: 10px;">
                <div style="background: #eee; height: 10px; border-radius: 5px; overflow: hidden;">
                    <div id="breath-progress-bar" style="background: #34495e; height: 100%; width: 0%; transition: width 0.5s;"></div>
                </div>
            </div>
            <div style="margin-top: 10px; display: flex; gap: 10px;">
                <button id="breath-start-btn" style="flex: 1;">Start</button>
                <button id="breath-reset-btn" style="flex: 1;">Reset</button>
            </div>
        </div>
    `;
    
    breathContainer.innerHTML = controlsHTML;
    
    // Add to page
    const sections = document.querySelectorAll('.section');
    if (sections.length > 0) {
        // Try to insert before a section that mentions breath training
        let inserted = false;
        for (const section of sections) {
            if (section.textContent.toLowerCase().includes('breath')) {
                section.parentNode.insertBefore(breathContainer, section);
                inserted = true;
                break;
            }
        }
        
        // If no breath training section found, append to last section
        if (!inserted) {
            sections[sections.length - 1].appendChild(breathContainer);
        }
    } else {
        // No sections found, append to body
        document.body.appendChild(breathContainer);
    }
    
    // Update references to newly created elements
    levelDisplay = document.getElementById('level-display');
    startBtn = document.getElementById('breath-start-btn');
    resetBtn = document.getElementById('breath-reset-btn');
    tableTypeToggle = document.getElementById('table-type-toggle');
    
    console.log('Breath UI created');
}

// Change the difficulty level
function changeLevel(change) {
    console.log('Changing level by', change);
    const newLevel = currentLevel + change;
    
    // Validate level bounds
    if (newLevel >= 1 && newLevel <= maxLevel) {
        currentLevel = newLevel;
        
        // Update level display - explicitly update the DOM
        levelDisplay = document.getElementById('level-display');
        if (levelDisplay) {
            console.log('Updating level display to', currentLevel);
            levelDisplay.textContent = currentLevel.toString();
        } else {
            console.error('Level display element not found!');
        }
        
        // Update table settings based on new level
        updateTableSettings();
        
        // Reset timer if running
        if (isBreathTimerRunning) {
            resetBreathTimer();
            startBreathTimer();
        }
    }
}

// Toggle between CO2 and O2 tables
function toggleTableType() {
    console.log('Toggling table type');
    tableType = tableType === 'co2' ? 'o2' : 'co2';
    
    // Update UI to show selected table type
    tableTypeToggle = document.getElementById('table-type-toggle');
    if (tableTypeToggle) {
        tableTypeToggle.textContent = tableType.toUpperCase() + ' Table';
    }
    
    // Update table settings for the selected type
    updateTableSettings();
    
    // Reset timer if running
    if (isBreathTimerRunning) {
        resetBreathTimer();
        startBreathTimer();
    }
}

// Update breath hold and rest times based on level and table type
function updateTableSettings() {
    console.log('Updating table settings for', tableType, 'level', currentLevel);
    if (tableType === 'co2') {
        // CO2 Tables: fixed breath hold, increasing respiratory strain
        breathHoldTime = 60; // 1 minute hold for all levels
        breathRestTime = Math.max(90 - (currentLevel * 5), 10); // Decreasing rest time with level
        breathCycles = 8; // Standard 8 cycles
    } else {
        // O2 Tables: increasing breath hold, fixed recovery
        breathHoldTime = 60 + (currentLevel * 15); // Increasing hold time with level
        breathRestTime = 120; // Fixed 2 minute rest time
        breathCycles = 8; // Standard 8 cycles
    }
    
    // Update display
    updateBreathDisplay();
    
    // Calculate total expected time
    totalTime = (breathHoldTime + breathRestTime) * breathCycles;
}

// Start or pause the breath timer
function toggleBreathTimer() {
    console.log('Toggling breath timer');
    if (isBreathTimerRunning) {
        // Pause timer
        clearInterval(breathTimer);
        isBreathTimerRunning = false;
        
        // Update button text
        startBtn = document.getElementById('breath-start-btn');
        if (startBtn) startBtn.textContent = 'Resume';
    } else {
        // Start timer
        startBreathTimer();
        
        // Update button text
        startBtn = document.getElementById('breath-start-btn');
        if (startBtn) startBtn.textContent = 'Pause';
    }
}

// Start the breath timer
function startBreathTimer() {
    if (isBreathTimerRunning) return;
    
    console.log('Starting breath timer');
    isBreathTimerRunning = true;
    let secondsRemaining = breathPhase === 'hold' ? breathHoldTime : breathRestTime;
    
    // Update timer display immediately
    updateTimerDisplay(secondsRemaining);
    
    breathTimer = setInterval(() => {
        secondsRemaining--;
        
        // Update timer display
        updateTimerDisplay(secondsRemaining);
        
        // Update progress
        elapsedTime++;
        updateProgressDisplay();
        
        if (secondsRemaining <= 0) {
            // Switch phases or end session
            if (breathPhase === 'hold') {
                // Switch to rest phase
                breathPhase = 'rest';
                secondsRemaining = breathRestTime;
                
                // Play sound or notification
                playNotification('rest');
            } else {
                // End of rest phase
                currentCycle++;
                
                if (currentCycle >= breathCycles) {
                    // End of session
                    clearInterval(breathTimer);
                    isBreathTimerRunning = false;
                    playNotification('complete');
                    
                    // Reset for next session
                    resetBreathTimer();
                    return;
                }
                
                // Switch to hold phase
                breathPhase = 'hold';
                secondsRemaining = breathHoldTime;
                
                // Play sound or notification
                playNotification('hold');
            }
            
            // Update display for new phase
            updateBreathDisplay();
        }
    }, 1000);
}

// Reset the breath timer
function resetBreathTimer() {
    console.log('Resetting breath timer');
    // Clear timer
    clearInterval(breathTimer);
    isBreathTimerRunning = false;
    
    // Reset variables
    breathPhase = 'hold';
    currentCycle = 0;
    elapsedTime = 0;
    
    // Update displays
    updateBreathDisplay();
    updateProgressDisplay();
    
    // Update button text
    startBtn = document.getElementById('breath-start-btn');
    if (startBtn) startBtn.textContent = 'Start';
}

// Update the timer display
function updateTimerDisplay(seconds) {
    const timerDisplay = document.getElementById('breath-timer-display');
    if (timerDisplay) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timerDisplay.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Update the breath phase display
function updateBreathDisplay() {
    const phaseDisplay = document.getElementById('breath-phase-display');
    const nextPhaseDisplay = document.getElementById('next-phase-display');
    const cycleDisplay = document.getElementById('cycle-display');
    
    if (phaseDisplay) {
        phaseDisplay.textContent = breathPhase === 'hold' ? 'HOLD BREATH' : 'BREATHE NORMALLY';
    }
    
    if (nextPhaseDisplay) {
        const nextDuration = breathPhase === 'hold' ? breathRestTime : breathHoldTime;
        const nextPhase = breathPhase === 'hold' ? 'Rest' : 'Hold';
        nextPhaseDisplay.textContent = `Next: ${nextPhase} (${formatTime(nextDuration)})`;
    }
    
    if (cycleDisplay) {
        cycleDisplay.textContent = `Cycle ${currentCycle + 1}/${breathCycles}`;
    }
    
    // Update timer display
    updateTimerDisplay(breathPhase === 'hold' ? breathHoldTime : breathRestTime);
}

// Update the progress display
function updateProgressDisplay() {
    const progressBar = document.getElementById('breath-progress-bar');
    const progressPercent = (elapsedTime / totalTime) * 100;
    
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }
}

// Format time in MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Play sound notification for phase changes
function playNotification(type) {
    console.log('Playing notification for', type);
    // If audio available
    const audio = {
        hold: 'hold-notification.mp3',
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
    const container = document.querySelector('.breath-container');
    if (container) {
        container.classList.add('flash');
        setTimeout(() => container.classList.remove('flash'), 500);
    }
}