// Initialize exercise checkboxes
document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('.custom-checkbox');
    const storedWorkouts = JSON.parse(localStorage.getItem('workoutProgress') || '{}');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Load stored checkbox states for current page
    if (storedWorkouts[currentPage]) {
      const checkedBoxes = storedWorkouts[currentPage];
      checkboxes.forEach((checkbox, index) => {
        if (checkedBoxes.includes(index)) {
          checkbox.checked = true;
        }
      });
    }
    
    // Add event listeners to checkboxes
    checkboxes.forEach((checkbox, index) => {
      checkbox.addEventListener('change', function() {
        saveCheckboxState(currentPage);
      });
    });
    
    // Update completion counter
    updateCompletionCounter();
  });
  
  // Save checkbox states to localStorage
  function saveCheckboxState(page) {
    const checkboxes = document.querySelectorAll('.custom-checkbox');
    const checkedIndices = [];
    
    checkboxes.forEach((checkbox, index) => {
      if (checkbox.checked) {
        checkedIndices.push(index);
      }
    });
    
    const storedWorkouts = JSON.parse(localStorage.getItem('workoutProgress') || '{}');
    storedWorkouts[page] = checkedIndices;
    localStorage.setItem('workoutProgress', JSON.stringify(storedWorkouts));
    
    updateCompletionCounter();
  }
  
  // Update the completion counter
  function updateCompletionCounter() {
    const checkboxes = document.querySelectorAll('.custom-checkbox');
    const total = checkboxes.length;
    const checked = document.querySelectorAll('.custom-checkbox:checked').length;
    const counterElement = document.getElementById('completion-counter');
    
    if (counterElement) {
      const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
      counterElement.textContent = `${checked}/${total} (${percentage}%)`;
      
      // Update progress bar if exists
      const progressBar = document.getElementById('progress-bar-fill');
      if (progressBar) {
        progressBar.style.width = `${percentage}%`;
      }
    }
  }
  
  // Reset all checkboxes on the current page
  function resetCheckboxes() {
    const checkboxes = document.querySelectorAll('.custom-checkbox');
    const currentPage = window.location.pathname.split('/').pop();
    
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    
    const storedWorkouts = JSON.parse(localStorage.getItem('workoutProgress') || '{}');
    storedWorkouts[currentPage] = [];
    localStorage.setItem('workoutProgress', JSON.stringify(storedWorkouts));
    
    updateCompletionCounter();
  }
  
  // Go to today's workout automatically
  function goToToday() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 12 ? 'am' : 'pm';
    
    window.location.href = `${days[today]}_${timeOfDay}.html`;
  }