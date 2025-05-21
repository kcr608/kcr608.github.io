// Workout Timer JS - Sequential workout timer with footer UI

// Global state
let workoutState = {
  exercises: [],            // Array of all exercises
  currentExerciseIndex: -1, // Current exercise index (-1 = not started)
  timerInterval: null,      // Current timer interval
  isResting: false,         // Whether in rest phase
  
  // Timer state
  seconds: 0,               // Current seconds remaining
  phase: 'work',            // 'work' or 'rest'
  
  // Rep counter state
  currentReps: 0,
  targetReps: 0,
  currentSets: 0,
  targetSets: 0,
  
  // Settings
  restTime: 60,             // Default rest time
  showFooter: false         // Whether footer is visible
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeWorkoutTimer);

// Initialize the workout timer
function initializeWorkoutTimer() {
  // Create footer UI
  createFooterUI();
  
  // Create global timer button
  createGlobalTimerButton();
  
  // Parse all exercises from the page
  parseExercises();
}

// Create the footer UI
function createFooterUI() {
  const footer = document.createElement('div');
  footer.id = 'workout-footer';
  footer.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: white;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    padding: 10px;
    display: flex;
    flex-direction: column;
    z-index: 1000;
    transition: transform 0.3s;
    transform: translateY(100%);
  `;
  
  footer.innerHTML = `
    <div id="exercise-title" style="font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 5px;"></div>
    
    <div id="timer-display" style="display: none; text-align: center; font-size: 20px; font-weight: bold; margin: 5px 0;"></div>
    
    <div id="rep-counter" style="display: none; text-align: center; margin: 5px 0;">
      <div style="font-size: 20px; font-weight: bold;">
        <span id="current-reps">0</span>/<span id="target-reps">0</span> reps
        •
        <span id="current-sets">0</span>/<span id="target-sets">0</span> sets
      </div>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-top: 5px;">
      <button id="prev-btn" style="border: none; background: none; font-size: 24px; cursor: pointer;">⏮️</button>
      <button id="start-btn" style="border: none; background: none; font-size: 24px; cursor: pointer;">▶️</button>
      <button id="next-btn" style="border: none; background: none; font-size: 24px; cursor: pointer;">⏭️</button>
      <button id="skip-btn" style="border: none; background: none; font-size: 24px; cursor: pointer;">⏩</button>
      <button id="close-btn" style="border: none; background: none; font-size: 24px; color: #e74c3c; cursor: pointer;">✖️</button>
    </div>
  `;
  
  document.body.appendChild(footer);
  
  // Add event listeners
  document.getElementById('prev-btn').addEventListener('click', previousExercise);
  document.getElementById('start-btn').addEventListener('click', toggleTimer);
  document.getElementById('next-btn').addEventListener('click', nextExercise);
  document.getElementById('skip-btn').addEventListener('click', skipExercise);
  document.getElementById('close-btn').addEventListener('click', hideFooter);
  
  // Add rep counter buttons
  const repCounter = document.getElementById('rep-counter');
  const buttonDiv = document.createElement('div');
  buttonDiv.style.cssText = 'display: flex; justify-content: center; gap: 20px; margin-top: 5px;';
  
  const minusButton = document.createElement('button');
  minusButton.textContent = '−';
  minusButton.style.cssText = 'width: 40px; height: 40px; border-radius: 20px; border: none; background: #e74c3c; color: white; font-size: 20px; cursor: pointer;';
  minusButton.addEventListener('click', decrementReps);
  
  const plusButton = document.createElement('button');
  plusButton.textContent = '+';
  plusButton.style.cssText = 'width: 40px; height: 40px; border-radius: 20px; border: none; background: #2ecc71; color: white; font-size: 20px; cursor: pointer;';
  plusButton.addEventListener('click', incrementReps);
  
  buttonDiv.appendChild(minusButton);
  buttonDiv.appendChild(plusButton);
  repCounter.appendChild(buttonDiv);
}

// Create global timer button
function createGlobalTimerButton() {
  const button = document.createElement('button');
  button.id = 'global-timer-btn';
  button.innerHTML = '⏱️';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 30px;
    border: none;
    background: #3498db;
    color: white;
    font-size: 30px;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 1001;
  `;
  
  button.addEventListener('click', startWorkout);
  document.body.appendChild(button);
}

// Parse all exercises from the page
function parseExercises() {
  const exercises = [];
  
  // Parse exercise cards (warm-up section)
  const exerciseCards = document.querySelectorAll('.exercise-card');
  
  exerciseCards.forEach(card => {
    const nameElement = card.querySelector('.exercise-name');
    const descElement = card.querySelector('p');
    
    if (nameElement && descElement) {
      const name = nameElement.textContent.trim();
      const description = descElement.textContent.trim();
      
      // Check for time-based exercise
      const timeMatch = description.match(/(\d+)\s*(?:minute|min|seconds|second|sec|s)/i);
      
      // Check for rep-based exercise
      const repMatch = description.match(/(\d+)\s*×\s*(\d+)/i);
      
      const exercise = {
        element: card,
        name: name,
        description: description,
        type: 'unknown',
        time: 0,
        reps: 0,
        sets: 1,
        restTime: workoutState.restTime
      };
      
      if (timeMatch) {
        exercise.type = 'timed';
        let seconds = parseInt(timeMatch[1]);
        if (timeMatch[0].toLowerCase().includes('min')) {
          seconds *= 60;
        }
        exercise.time = seconds;
      } else if (repMatch) {
        exercise.type = 'reps';
        exercise.sets = parseInt(repMatch[1]);
        exercise.reps = parseInt(repMatch[2]);
      }
      
      exercises.push(exercise);
    }
  });
  
  // Parse table rows
  const tables = document.querySelectorAll('table');
  
  tables.forEach(table => {
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
        const name = cells[0].textContent.trim();
        
        const exercise = {
          element: row,
          name: name,
          type: 'unknown',
          time: 0,
          reps: 0,
          sets: 1,
          restTime: workoutState.restTime
        };
        
        // Check all cells for data
        for (let i = 1; i < cells.length; i++) {
          const cellText = cells[i].textContent.trim();
          
          // Check for time-based exercise
          const secondsMatch = cellText.match(/(\d+)\s*(?:s|sec|seconds)/i);
          const minutesMatch = cellText.match(/(\d+)\s*(?:min|minute)/i);
          
          if (secondsMatch && !cellText.toLowerCase().includes('rest')) {
            exercise.type = 'timed';
            exercise.time = parseInt(secondsMatch[1]);
          } else if (minutesMatch && !cellText.toLowerCase().includes('rest')) {
            exercise.type = 'timed';
            exercise.time = parseInt(minutesMatch[1]) * 60;
          }
          
          // Check for rest time
          if (cellText.toLowerCase().includes('rest')) {
            const restMatch = cellText.match(/(\d+)\s*(?:s|sec|seconds|min|minute)/i);
            if (restMatch) {
              let restTime = parseInt(restMatch[1]);
              if (restMatch[0].toLowerCase().includes('min')) {
                restTime *= 60;
              }
              exercise.restTime = restTime;
            }
          }
          
          // Check for reps
          const repsMatch = cellText.match(/(\d+)\s*(?:reps|rep)/i);
          if (repsMatch) {
            exercise.type = 'reps';
            exercise.reps = parseInt(repsMatch[1]);
          }
          
          // Check for sets
          const setsMatch = cellText.match(/(\d+)\s*(?:sets|set|×)/i);
          if (setsMatch) {
            exercise.sets = parseInt(setsMatch[1]);
          }
        }
        
        // If still unknown, default to set counter
        if (exercise.type === 'unknown') {
          exercise.type = 'sets';
        }
        
        exercises.push(exercise);
      }
    });
  });
  
  workoutState.exercises = exercises;
}

// Start the workout
function startWorkout() {
  if (workoutState.exercises.length === 0) {
    alert('No exercises found on this page.');
    return;
  }
  
  // Reset workout state
  stopTimer();
  workoutState.currentExerciseIndex = -1;
  workoutState.showFooter = true;
  
  // Show the footer
  const footer = document.getElementById('workout-footer');
  footer.style.transform = 'translateY(0)';
  
  // Hide the global timer button
  const timerBtn = document.getElementById('global-timer-btn');
  if (timerBtn) {
    timerBtn.style.display = 'none';
  }
  
  // Go to first exercise
  nextExercise();
}

// Go to previous exercise
function previousExercise() {
  if (workoutState.currentExerciseIndex <= 0) return;
  
  // Stop current timer
  stopTimer();
  
  // Unhighlight current exercise
  unhighlightCurrentExercise();
  
  // Go to previous exercise
  workoutState.currentExerciseIndex--;
  
  // Set up new exercise
  setupCurrentExercise();
}

// Go to next exercise
function nextExercise() {
  // Stop current timer
  stopTimer();
  
  // Unhighlight current exercise
  unhighlightCurrentExercise();
  
  // Go to next exercise
  workoutState.currentExerciseIndex++;
  
  // Check if we're at the end
  if (workoutState.currentExerciseIndex >= workoutState.exercises.length) {
    // Workout complete
    alert('Workout complete!');
    hideFooter();
    return;
  }
  
  // Set up new exercise
  setupCurrentExercise();
}

// Skip current exercise
function skipExercise() {
  // Check if we're in a rest period between sets
  if (workoutState.isResting) {
    // End the rest period
    stopTimer();
    workoutState.isResting = false;
    
    // Return to rep counter if needed for rep-based exercises
    const exercise = workoutState.exercises[workoutState.currentExerciseIndex];
    if (exercise && (exercise.type === 'reps' || exercise.type === 'sets')) {
      showRepCounter();
    } else {
      // For timed exercises, mark as complete and go to next
      markCurrentExerciseComplete();
      nextExercise();
    }
  } else {
    // Not in a rest period, so skip the entire exercise
    markCurrentExerciseComplete();
    nextExercise();
  }
}


// Set up the current exercise
function setupCurrentExercise() {
  const exercise = workoutState.exercises[workoutState.currentExerciseIndex];
  if (!exercise) return;
  
  // Reset states
  workoutState.isResting = false;
  workoutState.phase = 'work';
  workoutState.currentReps = 0;
  workoutState.currentSets = 0;
  
  // Reset UI
  document.getElementById('exercise-title').textContent = exercise.name;
  document.getElementById('start-btn').textContent = '▶️';
  
  // Set exercise specific values
  if (exercise.type === 'timed') {
    // Timed exercise
    workoutState.seconds = exercise.time;
    showTimer();
    
  } else if (exercise.type === 'reps') {
    // Rep-based exercise
    workoutState.targetReps = exercise.reps;
    workoutState.targetSets = exercise.sets;
    document.getElementById('target-reps').textContent = exercise.reps;
    document.getElementById('target-sets').textContent = exercise.sets;
    document.getElementById('current-reps').textContent = '0';
    document.getElementById('current-sets').textContent = '0';
    showRepCounter();
    
  } else {
    // Set-based exercise
    workoutState.targetSets = exercise.sets;
    workoutState.targetReps = 1; // Just one rep per set
    document.getElementById('target-reps').textContent = '1';
    document.getElementById('target-sets').textContent = exercise.sets;
    document.getElementById('current-reps').textContent = '0';
    document.getElementById('current-sets').textContent = '0';
    showRepCounter();
  }
  
  // Highlight current exercise
  highlightCurrentExercise();
}

// Toggle timer start/pause
function toggleTimer() {
  if (!workoutState.showFooter) return;
  
  const exercise = workoutState.exercises[workoutState.currentExerciseIndex];
  if (!exercise) return;
  
  if (workoutState.timerInterval) {
    // Pause timer
    clearInterval(workoutState.timerInterval);
    workoutState.timerInterval = null;
    document.getElementById('start-btn').textContent = '▶️';
  } else {
    // Start timer
    if (exercise.type === 'timed') {
      // Start countdown
      workoutState.timerInterval = setInterval(updateTimer, 1000);
      document.getElementById('start-btn').textContent = '⏸️';
    }
  }
}

// Update timer
function updateTimer() {
  workoutState.seconds--;
  
  // Update display
  const timerDisplay = document.getElementById('timer-display');
  
  // Show skip button if resting
  const skipText = workoutState.isResting ? ' (Click ⏩ to skip rest)' : '';
  timerDisplay.textContent = (workoutState.isResting ? 'REST: ' : '') + formatTime(workoutState.seconds) + skipText;
  
  // Check if timer is done
  if (workoutState.seconds <= 0) {
    // Stop timer
    clearInterval(workoutState.timerInterval);
    workoutState.timerInterval = null;
    
    if (workoutState.isResting) {
      // Rest complete
      workoutState.isResting = false;
      
      // Return to rep counter if needed
      const exercise = workoutState.exercises[workoutState.currentExerciseIndex];
      if (exercise && (exercise.type === 'reps' || exercise.type === 'sets')) {
        showRepCounter();
      } else {
        // Mark exercise as complete
        markCurrentExerciseComplete();
        nextExercise();
      }
    } else {
      // Work complete
      const exercise = workoutState.exercises[workoutState.currentExerciseIndex];
      
      if (exercise && exercise.restTime > 0) {
        // Start rest time
        workoutState.isResting = true;
        workoutState.seconds = exercise.restTime;
        timerDisplay.textContent = 'REST: ' + formatTime(workoutState.seconds) + ' (Click ⏩ to skip rest)';
        workoutState.timerInterval = setInterval(updateTimer, 1000);
      } else {
        // No rest, mark as complete
        markCurrentExerciseComplete();
        nextExercise();
      }
    }
  }
}

// Stop the current timer
function stopTimer() {
  if (workoutState.timerInterval) {
    clearInterval(workoutState.timerInterval);
    workoutState.timerInterval = null;
  }
}

// Hide the footer
function hideFooter() {
  stopTimer();
  workoutState.showFooter = false;
  
  const footer = document.getElementById('workout-footer');
  footer.style.transform = 'translateY(100%)';
  
  // Show the global timer button again
  const timerBtn = document.getElementById('global-timer-btn');
  if (timerBtn) {
    timerBtn.style.display = 'block';
  }
  
  // Unhighlight current exercise
  unhighlightCurrentExercise();
}

// Highlight current exercise
function highlightCurrentExercise() {
  const exercise = workoutState.exercises[workoutState.currentExerciseIndex];
  if (!exercise || !exercise.element) return;
  
  exercise.element.style.backgroundColor = '#3498db20'; // Light blue
  exercise.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Unhighlight current exercise
function unhighlightCurrentExercise() {
  if (workoutState.currentExerciseIndex < 0) return;
  
  const exercise = workoutState.exercises[workoutState.currentExerciseIndex];
  if (!exercise || !exercise.element) return;
  
  // Only remove highlight if not completed
  if (!exercise.completed) {
    exercise.element.style.backgroundColor = '';
  }
}

// Mark current exercise as complete
function markCurrentExerciseComplete() {
  if (workoutState.currentExerciseIndex < 0) return;
  
  const exercise = workoutState.exercises[workoutState.currentExerciseIndex];
  if (!exercise || !exercise.element) return;
  
  // Mark as completed
  exercise.completed = true;
  exercise.element.style.backgroundColor = '#2ecc7120'; // Light green
  
  // Check the checkbox if it exists
  const checkbox = exercise.element.querySelector('input[type="checkbox"]');
  if (checkbox) {
    checkbox.checked = true;
  }
}

// Show timer UI
function showTimer() {
  document.getElementById('timer-display').style.display = 'block';
  document.getElementById('rep-counter').style.display = 'none';
  
  // Update timer display
  const timerDisplay = document.getElementById('timer-display');
  timerDisplay.textContent = formatTime(workoutState.seconds);
}

// Show rep counter UI
function showRepCounter() {
  document.getElementById('timer-display').style.display = 'none';
  document.getElementById('rep-counter').style.display = 'block';
}

// Format time in MM:SS format
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Increment reps
function incrementReps() {
  const exercise = workoutState.exercises[workoutState.currentExerciseIndex];
  if (!exercise) return;
  
  workoutState.currentReps++;
  document.getElementById('current-reps').textContent = workoutState.currentReps;
  
  // Check if rep set is complete
  if (workoutState.currentReps >= workoutState.targetReps) {
    // Reset reps counter
    workoutState.currentReps = 0;
    document.getElementById('current-reps').textContent = '0';
    
    // Increment sets counter
    workoutState.currentSets++;
    document.getElementById('current-sets').textContent = workoutState.currentSets;
    
    // Check if all sets are complete
    if (workoutState.currentSets >= workoutState.targetSets) {
      // Exercise complete
      markCurrentExerciseComplete();
      nextExercise();
    } else if (exercise.restTime > 0) {
      // Start rest timer
      workoutState.isResting = true;
      workoutState.seconds = exercise.restTime;
      showTimer();
      document.getElementById('timer-display').textContent = 'REST: ' + formatTime(workoutState.seconds);
      workoutState.timerInterval = setInterval(updateTimer, 1000);
    }
  }
}

// Decrement reps
function decrementReps() {
  if (workoutState.currentReps > 0) {
    workoutState.currentReps--;
    document.getElementById('current-reps').textContent = workoutState.currentReps;
  }
}