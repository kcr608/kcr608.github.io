// Simple cardio difficulty/intensity adjuster
document.addEventListener('DOMContentLoaded', function() {
  setupCardioIntensityControls();
});

// Set up cardio intensity controls on cardio-related sections
function setupCardioIntensityControls() {
  // Find all cardio sections
  const cardioSections = [
    ...document.querySelectorAll('.section h2')
  ].filter(header => 
    header.textContent.includes('CARDIO') || 
    header.textContent.includes('RUNNING') ||
    header.textContent.includes('HIIT') ||
    header.textContent.includes('TRACK') ||
    header.textContent.includes('STEADY STATE')
  ).map(header => header.closest('.section'));
  
  // Add intensity controls to each cardio section
  cardioSections.forEach(section => {
    addIntensityControl(section);
  });
}

// Add an intensity control to a section
function addIntensityControl(section) {
  const sectionTitle = section.querySelector('h2').textContent;
  
  // Create the control element
  const control = document.createElement('div');
  control.className = 'cardio-intensity-control';
  
  control.innerHTML = `
    <div class="intensity-header">
      <span class="intensity-title">Workout Intensity</span>
    </div>
    <div class="intensity-control">
      <button class="intensity-btn minus-btn">-</button>
      <span class="intensity-level">Level <span class="level-value">5</span></span>
      <button class="intensity-btn plus-btn">+</button>
    </div>
    <div class="intensity-effects">
      <div class="effect-item">
        <span class="effect-label">Duration:</span>
        <span class="effect-value duration-value">100%</span>
      </div>
      <div class="effect-item">
        <span class="effect-label">Intensity:</span>
        <span class="effect-value intensity-value">100%</span>
      </div>
      <div class="effect-item">
        <span class="effect-label">Rest:</span>
        <span class="effect-value rest-value">100%</span>
      </div>
    </div>
  `;
  
  // Add the control after the section title
  const sectionHeader = section.querySelector('h2');
  sectionHeader.insertAdjacentElement('afterend', control);
  
  // Add CSS styles for the control
  if (!document.getElementById('cardio-intensity-styles')) {
    const styles = document.createElement('style');
    styles.id = 'cardio-intensity-styles';
    styles.textContent = `
      .cardio-intensity-control {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 12px 15px;
        margin: 10px 0 15px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        font-family: 'Roboto', 'Segoe UI', sans-serif;
      }
      
      .intensity-header {
        margin-bottom: 8px;
      }
      
      .intensity-title {
        font-size: 14px;
        font-weight: 600;
        color: #34495e;
      }
      
      .intensity-control {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        justify-content: center;
      }
      
      .intensity-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background-color: #34495e;
        color: white;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .intensity-level {
        font-size: 15px;
        font-weight: 500;
        color: #34495e;
      }
      
      .level-value {
        font-weight: 600;
      }
      
      .intensity-effects {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: space-between;
        font-size: 13px;
      }
      
      .effect-item {
        background-color: #f0f0f0;
        padding: 4px 8px;
        border-radius: 4px;
        min-width: 80px;
        text-align: center;
      }
      
      .effect-item.modified {
        background-color: #34495e;
        color: white;
      }
      
      @media (max-width: 380px) {
        .intensity-effects {
          flex-direction: column;
          align-items: center;
        }
        
        .effect-item {
          width: 100%;
        }
      }
      
      /* Modified exercises */
      .duration-modified {
        color: #27ae60;
        font-weight: 500;
      }
      
      .intensity-modified {
        color: #e74c3c;
        font-weight: 500;
      }
      
      .rest-modified {
        color: #3498db;
        font-weight: 500;
      }
    `;
    
    document.head.appendChild(styles);
  }
  
  // Add event listeners for the intensity buttons
  const minusBtn = control.querySelector('.minus-btn');
  const plusBtn = control.querySelector('.plus-btn');
  const levelValue = control.querySelector('.level-value');
  
  // Store the original values of time/intensity elements
  storeOriginalValues(section);
  
  minusBtn.addEventListener('click', function() {
    let level = parseInt(levelValue.textContent);
    if (level > 1) {
      level--;
      levelValue.textContent = level;
      updateIntensityEffects(control, level, sectionTitle);
      applyIntensityToWorkout(section, level, sectionTitle);
    }
  });
  
  plusBtn.addEventListener('click', function() {
    let level = parseInt(levelValue.textContent);
    if (level < 10) {
      level++;
      levelValue.textContent = level;
      updateIntensityEffects(control, level, sectionTitle);
      applyIntensityToWorkout(section, level, sectionTitle);
    }
  });
}

// Store original values of time/intensity elements
function storeOriginalValues(section) {
  // Store time elements
  const timeElements = findTimeElements(section);
  timeElements.forEach(el => {
    if (!el.dataset.originalText) {
      el.dataset.originalText = el.textContent;
    }
  });
  
  // Store intensity elements
  const intensityElements = findIntensityElements(section);
  intensityElements.forEach(el => {
    if (!el.dataset.originalText) {
      el.dataset.originalText = el.textContent;
    }
  });
}

// Update the displayed intensity effects
function updateIntensityEffects(control, level, sectionTitle) {
  const durationValue = control.querySelector('.duration-value');
  const intensityValue = control.querySelector('.intensity-value');
  const restValue = control.querySelector('.rest-value');
  
  // Calculate multiplers based on intensity level and workout type
  let durationMultiplier, intensityMultiplier, restMultiplier;
  
  if (isHIITWorkout(sectionTitle)) {
    // For HIIT: higher level means shorter work, less rest, higher intensity
    durationMultiplier = Math.max(0.7, 1.1 - (level - 5) * 0.08); // 110% at level 1, 70% at level 10
    intensityMultiplier = Math.max(0.8, 1 + (level - 5) * 0.1); // 100% at level 5, 150% at level 10
    restMultiplier = Math.max(0.5, 1 - (level - 5) * 0.1); // 100% at level 5, 50% at level 10
  } else {
    // For steady state: higher level means longer duration, higher intensity
    durationMultiplier = Math.max(0.8, 1 + (level - 5) * 0.04); // 100% at level 5, 120% at level 10
    intensityMultiplier = Math.max(0.8, 1 + (level - 5) * 0.06); // 100% at level 5, 130% at level 10
    restMultiplier = 1; // Not applicable for steady state
  }
  
  // Update displayed values
  durationValue.textContent = `${Math.round(durationMultiplier * 100)}%`;
  intensityValue.textContent = `${Math.round(intensityMultiplier * 100)}%`;
  restValue.textContent = `${Math.round(restMultiplier * 100)}%`;
  
  // Highlight modified values
  durationValue.parentElement.classList.toggle('modified', Math.abs(durationMultiplier - 1) > 0.05);
  intensityValue.parentElement.classList.toggle('modified', Math.abs(intensityMultiplier - 1) > 0.05);
  restValue.parentElement.classList.toggle('modified', Math.abs(restMultiplier - 1) > 0.05);
}

// Apply intensity changes to the workout elements
function applyIntensityToWorkout(section, level, sectionTitle) {
  // Calculate multiplers based on intensity level and workout type
  let durationMultiplier, intensityMultiplier, restMultiplier;
  
  if (isHIITWorkout(sectionTitle)) {
    // For HIIT: higher level means shorter work, less rest, higher intensity
    durationMultiplier = Math.max(0.7, 1.1 - (level - 5) * 0.08);
    intensityMultiplier = Math.max(0.8, 1 + (level - 5) * 0.1);
    restMultiplier = Math.max(0.5, 1 - (level - 5) * 0.1);
  } else {
    // For steady state: higher level means longer duration, higher intensity
    durationMultiplier = Math.max(0.8, 1 + (level - 5) * 0.04);
    intensityMultiplier = Math.max(0.8, 1 + (level - 5) * 0.06);
    restMultiplier = 1;
  }
  
  // Apply changes to time elements
  const timeElements = findTimeElements(section);
  timeElements.forEach(el => {
    const originalText = el.dataset.originalText;
    if (!originalText) return;
    
    const timeMatch = originalText.match(/(\d+)\s*(minute|min|seconds|second|sec|s)/i);
    if (!timeMatch) return;
    
    let value = parseInt(timeMatch[1]);
    const unit = timeMatch[2];
    
    // Determine if this is a rest period
    const isRest = originalText.toLowerCase().includes('rest') || 
                  (el.closest('tr') && el.closest('tr').cells[0] && 
                   el.closest('tr').cells[0].textContent.toLowerCase().includes('rest'));
    
    // Apply appropriate multiplier
    if (isRest) {
      value = Math.round(value * restMultiplier);
      el.classList.add('rest-modified');
      el.classList.remove('duration-modified');
    } else {
      value = Math.round(value * durationMultiplier);
      el.classList.add('duration-modified');
      el.classList.remove('rest-modified');
    }
    
    // Update the text
    el.textContent = originalText.replace(
      /(\d+)\s*(minute|min|seconds|second|sec|s)/i,
      `${value} ${unit}`
    );
  });
  
  // Apply changes to intensity elements
  const intensityElements = findIntensityElements(section);
  intensityElements.forEach(el => {
    const originalText = el.dataset.originalText;
    if (!originalText) return;
    
    // Handle percentage ranges like "70-75%"
    const percentRangeMatch = originalText.match(/(\d+)-(\d+)%/);
    if (percentRangeMatch) {
      let min = parseInt(percentRangeMatch[1]);
      let max = parseInt(percentRangeMatch[2]);
      
      // Apply multiplier with limit
      min = Math.min(100, Math.round(min * intensityMultiplier));
      max = Math.min(100, Math.round(max * intensityMultiplier));
      
      // Update the text
      el.textContent = originalText.replace(
        /(\d+)-(\d+)%/,
        `${min}-${max}%`
      );
      
      el.classList.add('intensity-modified');
    }
    
    // Handle single percentages like "70% max HR"
    const percentMatch = originalText.match(/(\d+)%/);
    if (percentMatch && !percentRangeMatch) {
      let percent = parseInt(percentMatch[1]);
      
      // Apply multiplier with limit
      percent = Math.min(100, Math.round(percent * intensityMultiplier));
      
      // Update the text
      el.textContent = originalText.replace(
        /(\d+)%/,
        `${percent}%`
      );
      
      el.classList.add('intensity-modified');
    }
  });
}

// Find elements with time references
function findTimeElements(section) {
  const elements = [];
  
  // Check in table cells
  section.querySelectorAll('td').forEach(td => {
    if (td.textContent.match(/\d+\s*(minute|min|seconds|second|sec|s)/i)) {
      elements.push(td);
    }
  });
  
  // Check in exercise card descriptions
  section.querySelectorAll('.exercise-card p').forEach(p => {
    if (p.textContent.match(/\d+\s*(minute|min|seconds|second|sec|s)/i)) {
      elements.push(p);
    }
  });
  
  return elements;
}

// Find elements with intensity references
function findIntensityElements(section) {
  const elements = [];
  
  // Check in table cells
  section.querySelectorAll('td').forEach(td => {
    if (td.textContent.includes('%')) {
      elements.push(td);
    }
  });
  
  // Check in exercise card descriptions
  section.querySelectorAll('.exercise-card p').forEach(p => {
    if (p.textContent.includes('%')) {
      elements.push(p);
    }
  });
  
  return elements;
}

// Check if a workout is HIIT based on its title
function isHIITWorkout(title) {
  return title.includes('HIIT') || 
         title.includes('INTERVAL') || 
         title.includes('SPRINT') ||
         title.includes('TRACK');
}