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
    
    // Look for sections that mention "breath" or "CO2"
    const sections = document.querySelectorAll('.section');
    if (!sections) return;
    
    for (const section of sections) {
        if (section.textContent.toLowerCase().includes('breath') || 
            section.textContent.toLowerCase().includes('co2') ||
            section.textContent.toLowerCase().includes('o2')) {
            
            // Create breath container if not already present
            if (!section.querySelector('.breath-table-container')) {
                const breathContainer = createBreathUI();
                section.appendChild(breathContainer);
            }
        }
    }
    
    // Add event listeners to all breath containers
    const allLevelUpButtons = document.querySelectorAll('.level-up-btn');
    const allLevelDownButtons = document.querySelectorAll('.level-down-btn');
    const allStartButtons = document.querySelectorAll('.breath-start-btn');
    const allResetButtons = document.querySelectorAll('.breath-reset-btn');
    const allTableToggles = document.querySelectorAll('.table-type-toggle');
    
    allLevelUpButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            changeLevel(1, this.closest('.breath-table-container'));
        });
    });
    
    allLevelDownButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            changeLevel(-1, this.closest('.breath-table-container'));
        });
    });
    
    allStartButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            toggleBreathTimer(this.closest('.breath-table-container'));
        });
    });
    
    allResetButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            resetBreathTimer(this.closest('.breath-table-container'));
        });
    });
    
    allTableToggles.forEach(btn => {
        btn.addEventListener('click', function() {
            toggleTableType(this.closest('.breath-table-container'));
        });
    });
    
    // Initialize all tables
    const allBreathContainers = document.querySelectorAll('.breath-table-container');
    allBreathContainers.forEach(container => {
        updateTableSettings(container);
    });
}

// Create breath UI if not present
function createBreathUI() {
    const breathContainer = document.createElement('div');
    breathContainer.className = 'breath-table-container';
    breathContainer.innerHTML = `
        <div style="padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; background-color: #f8f9fa;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div>
                    <button class="level-down-btn" style="width: 25px; padding: 2px 0;">-</button>
                    <span>Level: <span class="level-display">1</span></span>
                    <button class="level-up-btn" style="width: 25px; padding: 2px 0;">+</button>
                </div>
                <button class="table-type-toggle" style="padding: 2px 5px;">CO2 Table</button>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div>
                    <div class="breath-phase-display" style="font-weight: bold;">HOLD BREATH</div>
                    <div class="breath-timer-display" style="font-size: 1.2rem; font-weight: bold;">1:00</div>
                </div>
                <div>
                    <div class="cycle-display">Cycle 1/8</div>
                    <div class="next-phase-display">Next: Rest (1:30)</div>
                </div>
            </div>
            
            <div style="margin-bottom: 10px;">
                <div style="height: 5px; background: #eee; border-radius: 5px; overflow: hidden;">
                    <div class="breath-progress-bar" style="height: 100%; width: 0%; background: #34495e; transition: width 0.5s;"></div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button class="breath-start-btn" style="flex: 1; padding: 5px; background: #34495e; color: white; border: none; border-radius: 3px;">Start</button>
                <button class="breath-reset-btn" style="flex: 1; padding: 5px; background: #95a5a6; color: white; border: none; border-radius: 3px;">Reset</button>
            </div>
        </div>
    `;
    
    return breathContainer;
}

// Change the difficulty level
function changeLevel(change, container) {
    // Get the level display element in this container
    const levelDisplay = container.querySelector('.level-display');
    if (!levelDisplay) return;
    
    // Read current level from the display
    let level = parseInt(levelDisplay.textContent);
    const newLevel = level + change;
    
    // Validate level bounds
    if (newLevel >= 1 && newLevel <= maxLevel) {
        // Update level display
        levelDisplay.textContent = newLevel;
        
        // Update table settings based on new level
        updateTableSettings(container);
        
        // Reset timer if running
        if (isTimerRunningForContainer(container)) {
            resetBreathTimer(container);
            startBreathTimer(container);
        }
    }
}

// Check if timer is running for this container
function isTimerRunningForContainer(container) {
    // Check if the start button says "Pause"
    const startBtn = container.querySelector('.breath-start-btn');
    return startBtn && startBtn.textContent === 'Pause';
}

// Toggle between CO2 and O2 tables
function toggleTableType(container) {
    const tableToggle = container.querySelector('.table-type-toggle');
    if (!tableToggle) return;
    
    // Toggle the table type
    const currentType = tableToggle.textContent.startsWith('CO2') ? 'co2' : 'o2';
    const newType = currentType === 'co2' ? 'o2' : 'co2';
    
    // Update button text
    tableToggle.textContent = newType.toUpperCase() + ' Table';
    
    // Update table settings for the selected type
    updateTableSettings(container);
    
    // Reset timer if running
    if (isTimerRunningForContainer(container)) {
        resetBreathTimer(container);
        startBreathTimer(container);
    }
}

// Update breath hold and rest times based on level and table type
function updateTableSettings(container) {
    // Get the level and table type from this container
    const levelDisplay = container.querySelector('.level-display');
    const tableToggle = container.querySelector('.table-type-toggle');
    
    if (!levelDisplay || !tableToggle) return;
    
    const level = parseInt(levelDisplay.textContent);
    const type = tableToggle.textContent.startsWith('CO2') ? 'co2' : 'o2';
    
    let holdTime, restTime, cycles;
    
    if (type === 'co2') {
        // CO2 Tables: fixed breath hold, increasing respiratory strain
        holdTime = 60; // 1 minute hold for all levels
        restTime = Math.max(90 - (level * 5), 10); // Decreasing rest time with level
        cycles = 8; // Standard 8 cycles
    } else {
        // O2 Tables: increasing breath hold, fixed recovery
        holdTime = 60 + (level * 15); // Increasing hold time with level
        holdTime = Math.min(holdTime, 240); // Cap at 4 minutes for safety
        restTime = 120; // Fixed 2 minute rest time
        cycles = 8; // Standard 8 cycles
    }
    
    // Store these values in the container's dataset
    container.dataset.holdTime = holdTime;
    container.dataset.restTime = restTime;
    container.dataset.cycles = cycles;
    container.dataset.phase = 'hold';
    container.dataset.cycle = '0';
    container.dataset.totalTime = (holdTime + restTime) * cycles;
    container.dataset.elapsedTime = '0';
    
    // Update display
    updateBreathDisplay(container);
}

// Start or pause the breath timer
function toggleBreathTimer(container) {
    const startBtn = container.querySelector('.breath-start-btn');
    if (!startBtn) return;
    
    if (startBtn.textContent === 'Pause') {
        // Currently running, so pause
        clearInterval(parseInt(container.dataset.timerId));
        startBtn.textContent = 'Resume';
    } else {
        // Not running, so start
        startBreathTimer(container);
        startBtn.textContent = 'Pause';
    }
}

// Start the breath timer
function startBreathTimer(container) {
    const phase = container.dataset.phase || 'hold';
    const holdTime = parseInt(container.dataset.holdTime || 60);
    const restTime = parseInt(container.dataset.restTime || 90);
    
    // Set remaining time based on current phase
    let secondsRemaining = phase === 'hold' ? holdTime : restTime;
    
    // Update timer display immediately
    updateTimerDisplay(container, secondsRemaining);
    
    // Clear any existing timer
    if (container.dataset.timerId) {
        clearInterval(parseInt(container.dataset.timerId));
    }
    
    // Start a new timer
    const timerId = setInterval(() => {
        // Decrement time
        secondsRemaining--;
        
        // Update timer display
        updateTimerDisplay(container, secondsRemaining);
        
        // Update progress
        let elapsedTime = parseInt(container.dataset.elapsedTime || 0) + 1;
        container.dataset.elapsedTime = elapsedTime;
        updateProgressDisplay(container);
        
        if (secondsRemaining <= 0) {
            // Switch phases or end session
            if (container.dataset.phase === 'hold') {
                // Switch to rest phase
                container.dataset.phase = 'rest';
                secondsRemaining = restTime;
                playNotification('rest');
            } else {
                // End of rest phase
                let currentCycle = parseInt(container.dataset.cycle || 0) + 1;
                container.dataset.cycle = currentCycle;
                
                if (currentCycle >= parseInt(container.dataset.cycles || 8)) {
                    // End of session
                    clearInterval(parseInt(container.dataset.timerId));
                    playNotification('complete');
                    
                    // Reset for next session
                    resetBreathTimer(container);
                    return;
                }
                
                // Switch to hold phase
                container.dataset.phase = 'hold';
                secondsRemaining = holdTime;
                playNotification('hold');
            }
            
            // Update display for new phase
            updateBreathDisplay(container);
        }
    }, 1000);
    
    // Store the timer ID
    container.dataset.timerId = timerId;
}

// Reset the breath timer
function resetBreathTimer(container) {
    // Clear timer
    if (container.dataset.timerId) {
        clearInterval(parseInt(container.dataset.timerId));
    }
    
    // Reset variables
    container.dataset.phase = 'hold';
    container.dataset.cycle = '0';
    container.dataset.elapsedTime = '0';
    
    // Update displays
    updateBreathDisplay(container);
    updateProgressDisplay(container);
    
    // Update button text
    const startBtn = container.querySelector('.breath-start-btn');
    if (startBtn) startBtn.textContent = 'Start';
}

// Update the timer display
function updateTimerDisplay(container, seconds) {
    const timerDisplay = container.querySelector('.breath-timer-display');
    if (timerDisplay) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timerDisplay.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Update the breath phase display
function updateBreathDisplay(container) {
    const phaseDisplay = container.querySelector('.breath-phase-display');
    const nextPhaseDisplay = container.querySelector('.next-phase-display');
    const cycleDisplay = container.querySelector('.cycle-display');
    
    const phase = container.dataset.phase || 'hold';
    const cycle = parseInt(container.dataset.cycle || 0);
    const cycles = parseInt(container.dataset.cycles || 8);
    const holdTime = parseInt(container.dataset.holdTime || 60);
    const restTime = parseInt(container.dataset.restTime || 90);
    
    if (phaseDisplay) {
        phaseDisplay.textContent = phase === 'hold' ? 'HOLD BREATH' : 'BREATHE NORMALLY';
    }
    
    if (nextPhaseDisplay) {
        const nextDuration = phase === 'hold' ? restTime : holdTime;
        const nextPhase = phase === 'hold' ? 'Rest' : 'Hold';
        nextPhaseDisplay.textContent = `Next: ${nextPhase} (${formatTime(nextDuration)})`;
    }
    
    if (cycleDisplay) {
        cycleDisplay.textContent = `Cycle ${cycle + 1}/${cycles}`;
    }
    
    // Update timer display
    updateTimerDisplay(container, phase === 'hold' ? holdTime : restTime);
}

// Update the progress display
function updateProgressDisplay(container) {
    const progressBar = container.querySelector('.breath-progress-bar');
    const elapsedTime = parseInt(container.dataset.elapsedTime || 0);
    const totalTime = parseInt(container.dataset.totalTime || 0);
    
    if (progressBar && totalTime > 0) {
        const progressPercent = (elapsedTime / totalTime) * 100;
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
    // Visual notification only
    // We'll skip actual audio playback to keep things simple
    console.log('Notification:', type);
    
    // Change background color of all timers briefly
    const containers = document.querySelectorAll('.breath-table-container');
    containers.forEach(container => {
        const wrapper = container.querySelector('div');
        if (wrapper) {
            const originalBackground = wrapper.style.backgroundColor;
            
            // Change color based on notification type
            if (type === 'hold') {
                wrapper.style.backgroundColor = '#e74c3c20'; // Light red
            } else if (type === 'rest') {
                wrapper.style.backgroundColor = '#2ecc7120'; // Light green
            } else if (type === 'complete') {
                wrapper.style.backgroundColor = '#3498db20'; // Light blue
            }
            
            // Restore original background after 500ms
            setTimeout(() => {
                wrapper.style.backgroundColor = originalBackground;
            }, 500);
        }
    });
}