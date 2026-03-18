(function() {
  // DOM elements
  const habitForm = document.getElementById('habitForm');
  const habitsContainer = document.getElementById('habitsContainer');
  const habitNameInput = document.getElementById('habitName');
  const reminderTimeInput = document.getElementById('reminderTime');

  // Set default time to current time + 1 hour
  window.addEventListener('load', () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15); // Round to nearest 15 min
    now.setSeconds(0);
    
    reminderTimeInput.value = now.toTimeString().slice(0, 5);
    
    loadHabits();
  });

  // Load habits from API
  async function loadHabits() {
    try {
      const response = await fetch('/api/habits');
      const habits = await response.json();
      
      if (habits.length === 0) {
        habitsContainer.innerHTML = '<p class="empty-state">No habits yet. Create one above!</p>';
        return;
      }
      
      habitsContainer.innerHTML = '';
      
      habits.forEach(habit => {
        const habitCard = createHabitCard(habit);
        habitsContainer.appendChild(habitCard);
      });
      
    } catch (error) {
      console.error('Failed to load habits:', error);
      habitsContainer.innerHTML = '<p class="empty-state">Failed to load habits. Please try again.</p>';
    }
  }

  // Create a habit card element
  function createHabitCard(habit) {
    const card = document.createElement('div');
    card.className = 'habit-card';
    card.dataset.id = habit.id;
    
    const header = document.createElement('div');
    header.className = 'habit-header';
    
    const nameEl = document.createElement('h3');
    nameEl.className = 'habit-name';
    nameEl.textContent = habit.name;
    
    const timeEl = document.createElement('span');
    timeEl.className = 'habit-time';
    timeEl.textContent = `Reminder: ${formatTime(habit.reminderTime)}`;
    
    header.appendChild(nameEl);
    header.appendChild(timeEl);
    
    const channelsInfo = document.createElement('div');
    channelsInfo.className = 'channels-info';
    
    habit.reminderChannels.forEach(channel => {
      const badge = document.createElement('span');
      badge.className = 'channel-badge';
      badge.textContent = channel.toUpperCase();
      channelsInfo.appendChild(badge);
    });
    
    const actions = document.createElement('div');
    actions.className = 'habit-actions';
    
    const completeBtn = document.createElement('button');
    completeBtn.className = 'complete-btn';
    completeBtn.textContent = 'Mark Complete';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    
    actions.appendChild(completeBtn);
    actions.appendChild(deleteBtn);
    
    const streakInfo = document.createElement('div');
    streakInfo.className = 'streak-info';
    streakInfo.innerHTML = '🔥 <span class="streak-count">0</span> day streak';
    
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.innerHTML = '<canvas></canvas>';
    
    card.appendChild(header);
    card.appendChild(channelsInfo);
    card.appendChild(actions);
    card.appendChild(streakInfo);
    card.appendChild(chartContainer);
    
    // Load streak and chart data
    loadStreak(habit.id, streakInfo.querySelector('.streak-count'));
    loadChart(habit.id, chartContainer.querySelector('canvas'));
    
    // Event listeners
    completeBtn.addEventListener('click', () => markComplete(habit.id, streakInfo.querySelector('.streak-count')));
    deleteBtn.addEventListener('click', () => deleteHabit(habit.id, card));
    
    return card;
  }

  // Format time from HH:MM to 12-hour format
  function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${period}`;
  }

  // Mark habit as complete
  async function markComplete(habitId, streakElement) {
    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        streakElement.textContent = data.streak;
        
        // Show success feedback
        showFeedback('Habit marked as complete!');
        
        // Update chart
        const card = document.querySelector(`.habit-card[data-id="${habitId}"]`);
        const canvas = card.querySelector('.chart-container canvas');
        loadChart(habitId, canvas);
      } else {
        throw new Error('Failed to mark habit as complete');
      }
    } catch (error) {
      console.error('Error marking habit as complete:', error);
      alert('Failed to mark habit as complete. Please try again.');
    }
  }

  // Delete a habit
  async function deleteHabit(habitId, cardElement) {
    if (!confirm('Are you sure you want to delete this habit?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        cardElement.remove();
        
        // Show empty state if no habits left
        if (document.querySelectorAll('.habit-card').length === 0) {
          habitsContainer.innerHTML = '<p class="empty-state">No habits yet. Create one above!</p>';
        }
        
        showFeedback('Habit deleted');
      } else {
        throw new Error('Failed to delete habit');
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('Failed to delete habit. Please try again.');
    }
  }

  // Load streak count
  async function loadStreak(habitId, element) {
    try {
      // In MVP, we'll simulate streak data
      // In full implementation, this would call an API endpoint
      const streak = Math.floor(Math.random() * 7); // Simulate 0-6 day streak
      element.textContent = streak;
    } catch (error) {
      console.error('Failed to load streak:', error);
    }
  }

  // Load chart data
  async function loadChart(habitId, canvas) {
    try {
      const response = await fetch(`/api/habits/${habitId}/progress`);
      const chartData = await response.json();
      
      // Destroy existing chart if it exists
      const existingChart = Chart.getChart(canvas);
      if (existingChart) {
        existingChart.destroy();
      }
      
      // Create new chart
      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Completed',
            data: chartData.data,
            backgroundColor: '#3498db',
            borderColor: '#2980b9',
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 1,
              ticks: {
                stepSize: 1,
                callback: function(value) {
                  return value === 1 ? 'Yes' : 'No';
                }
              },
              grid: {
                display: false
              }
            },
            x: {
              ticks: {
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 10
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.parsed.y === 1 ? 'Completed' : 'Not completed';
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  }

  // Show feedback message
  function showFeedback(message) {
    let feedbackEl = document.getElementById('completed-feedback');
    
    if (!feedbackEl) {
      feedbackEl = document.createElement('div');
      feedbackEl.id = 'completed-feedback';
      feedbackEl.className = 'completed-feedback';
      feedbackEl.textContent = message;
      document.body.appendChild(feedbackEl);
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        feedbackEl.classList.remove('show');
        setTimeout(() => feedbackEl.remove(), 300);
      }, 3000);
    } else {
      feedbackEl.textContent = message;
    }
    
    // Show feedback
    setTimeout(() => feedbackEl.classList.add('show'), 10);
  }

  // Form submission
  habitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = habitNameInput.value.trim();
    const reminderTime = reminderTimeInput.value;
    
    const reminderChannels = Array.from(
      document.querySelectorAll('input[name="channels"]:checked')
    ).map(cb => cb.value);
    
    // In MVP, get channels from checkboxes
    const channels = [];
    document.querySelectorAll('.channel-input input:checked').forEach(cb => {
      channels.push(cb.value);
    });
    
    if (channels.length === 0) {
      alert('Please select at least one reminder channel');
      return;
    }
    
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          reminderTime,
          reminderChannels: channels
        })
      });
      
      if (response.ok) {
        habitForm.reset();
        loadHabits();
        showFeedback('Habit created!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create habit');
      }
    } catch (error) {
      console.error('Error creating habit:', error);
      alert('Failed to create habit. Please try again.');
    }
  });
})();