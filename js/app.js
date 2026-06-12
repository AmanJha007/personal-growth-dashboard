const sidebarItems = document.querySelectorAll('.sidebar__item[data-target]');
const pageSections = document.querySelectorAll('.page-section');

sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    const target = item.dataset.target;
    sidebarItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    pageSections.forEach(section => {
      section.classList.toggle('active', section.id === target);
    });
    localStorage.setItem('evolve_active_tab', target);
  });
});

const savedTab = localStorage.getItem('evolve_active_tab');
if (savedTab) {
  const tabToActivate = document.querySelector(`.sidebar__item[data-target="${savedTab}"]`);
  if (tabToActivate) tabToActivate.click();
}

function updateDate() {
  const el = document.getElementById('navDate');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
updateDate();

const checkboxes = document.querySelectorAll('input[type="checkbox"]');
checkboxes.forEach((cb, index) => {
  cb.removeAttribute('readonly');
  
  const savedState = localStorage.getItem(`evolve_cb_${index}`);
  if (savedState !== null) {
    cb.checked = savedState === 'true';
    if (cb.checked) {
      cb.closest('.goal-item').classList.add('completed');
    } else {
      cb.closest('.goal-item').classList.remove('completed');
    }
  }

  cb.addEventListener('change', () => {
    localStorage.setItem(`evolve_cb_${index}`, cb.checked);
    if (cb.checked) {
      cb.closest('.goal-item').classList.add('completed');
    } else {
      cb.closest('.goal-item').classList.remove('completed');
    }
  });
});

const logList = document.getElementById('logList');
const logBtn = document.getElementById('logSessionBtn');

function loadStudyLogs() {
  if (!logList) return;
  const savedLogs = JSON.parse(localStorage.getItem('evolve_study_logs') || '[]');
  savedLogs.forEach(log => {
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    const infoDiv = document.createElement('div');
    infoDiv.className = 'log-item-info';
    const subjSpan = document.createElement('div');
    subjSpan.className = 'log-item-subject';
    subjSpan.textContent = log.subject;
    const dateSpan = document.createElement('div');
    dateSpan.className = 'log-item-date';
    dateSpan.textContent = log.date;
    infoDiv.appendChild(subjSpan);
    infoDiv.appendChild(dateSpan);
    const durSpan = document.createElement('span');
    durSpan.className = 'log-item-duration';
    durSpan.textContent = log.duration;
    logItem.appendChild(infoDiv);
    logItem.appendChild(durSpan);
    logList.appendChild(logItem);
  });
}

function saveStudyLog(subject, durationText) {
  const savedLogs = JSON.parse(localStorage.getItem('evolve_study_logs') || '[]');
  savedLogs.unshift({ subject, date: 'Today', duration: durationText });
  localStorage.setItem('evolve_study_logs', JSON.stringify(savedLogs));
}

if (logBtn) {
  logBtn.addEventListener('click', () => {
    const subjectSelect = document.getElementById('logSubject');
    const durationInput = document.getElementById('logDuration');
    if (!durationInput.value) return;
    
    const minutes = parseInt(durationInput.value);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    const infoDiv = document.createElement('div');
    infoDiv.className = 'log-item-info';
    const subjSpan = document.createElement('div');
    subjSpan.className = 'log-item-subject';
    subjSpan.textContent = subjectSelect.value;
    const dateSpan = document.createElement('div');
    dateSpan.className = 'log-item-date';
    dateSpan.textContent = 'Today';
    infoDiv.appendChild(subjSpan);
    infoDiv.appendChild(dateSpan);
    const durSpan = document.createElement('span');
    durSpan.className = 'log-item-duration';
    durSpan.textContent = durationText;
    logItem.appendChild(infoDiv);
    logItem.appendChild(durSpan);
    
    logList.insertBefore(logItem, logList.firstChild);
    saveStudyLog(subjectSelect.value, durationText);
    durationInput.value = '';
  });
}

if (logList) {
  const placeholderLogs = logList.querySelectorAll('.log-item');
  if (localStorage.getItem('evolve_study_logs')) {
      logList.innerHTML = ''; 
  } else {
      const initialLogs = [];
      placeholderLogs.forEach(log => {
          const subject = log.querySelector('.log-item-subject').textContent;
          const date = log.querySelector('.log-item-date').textContent;
          const duration = log.querySelector('.log-item-duration').textContent;
          initialLogs.push({ subject, date, duration });
      });
      localStorage.setItem('evolve_study_logs', JSON.stringify(initialLogs));
      logList.innerHTML = '';
  }
  loadStudyLogs();
}