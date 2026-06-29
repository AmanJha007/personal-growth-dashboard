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

const defaultSubjects = [
  { name: "Data Structures & Algorithms", code: "CSE2001", color: "var(--accent-primary)" },
  { name: "Object-Oriented Programming", code: "CSE2002", color: "var(--accent-purple)" },
  { name: "Cyber Physical Systems", code: "ECE3005", color: "var(--accent-sky)" },
  { name: "Web Development", code: "Odin Project", color: "var(--accent-teal)" }
];

let subjects = JSON.parse(localStorage.getItem('evolve_subjects'));
if (!subjects) {
  subjects = defaultSubjects;
  localStorage.setItem('evolve_subjects', JSON.stringify(subjects));
}

const subjectsContainer = document.getElementById('subjectsContainer');
const logSubjectSelect = document.getElementById('logSubject');

function renderSubjects() {
  if (!subjectsContainer) return;
  subjectsContainer.innerHTML = '';
  if (logSubjectSelect) logSubjectSelect.innerHTML = '';
  
  subjects.forEach((sub, index) => {
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.innerHTML = `
      <div class="subject-card-header">
        <div>
          <h3 class="subject-name">${sub.name}</h3>
          <span class="subject-code">${sub.code}</span>
        </div>
        <button class="btn-delete" data-index="${index}">X</button>
      </div>
      <div class="progress-bar mt-16">
        <div class="progress-fill" style="width: 0%; background: ${sub.color || 'var(--accent-primary)'};"></div>
      </div>
      <div class="subject-meta mt-16">
        <span>Active</span>
      </div>
    `;
    subjectsContainer.appendChild(card);
    
    if (logSubjectSelect) {
      const option = document.createElement('option');
      option.value = sub.name;
      option.textContent = sub.name;
      logSubjectSelect.appendChild(option);
    }
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.getAttribute('data-index');
      subjects.splice(idx, 1);
      localStorage.setItem('evolve_subjects', JSON.stringify(subjects));
      renderSubjects();
    });
  });
}

if (subjectsContainer) {
  renderSubjects();
}

const addSubjectBtn = document.getElementById('addSubjectBtn');
const newSubjectInput = document.getElementById('newSubjectInput');
if (addSubjectBtn && newSubjectInput) {
  addSubjectBtn.addEventListener('click', () => {
    if (!newSubjectInput.value.trim()) return;
    subjects.push({
      name: newSubjectInput.value.trim(),
      code: "Custom",
      color: "var(--accent-primary)"
    });
    localStorage.setItem('evolve_subjects', JSON.stringify(subjects));
    newSubjectInput.value = '';
    renderSubjects();
  });
}

const logList = document.getElementById('logList');
let logBtn = document.getElementById('logSessionBtn');

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).setHours(0,0,0,0);
}

function calculateWeeklyTime(logs) {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  let totalMinutes = 0;

  logs.forEach(log => {
    const logDate = log.timestamp ? new Date(log.timestamp) : new Date(); 
    if (logDate >= startOfWeek) {
      totalMinutes += log.minutes || 0;
    }
  });

  const hours = Math.floor(totalMinutes / 60);
  const weeklyDisplay = document.getElementById('weeklyStudyTime');
  if (weeklyDisplay) {
    weeklyDisplay.textContent = `${hours}h / 30h Target`;
  }
}

function loadStudyLogs() {
  if (!logList) return;
  logList.innerHTML = '';
  const savedLogs = JSON.parse(localStorage.getItem('evolve_study_logs') || '[]');
  
  calculateWeeklyTime(savedLogs);

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
    
    const logDate = log.timestamp ? new Date(log.timestamp) : new Date();
    dateSpan.textContent = logDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    
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

function saveStudyLog(subject, durationText, minutes) {
  const savedLogs = JSON.parse(localStorage.getItem('evolve_study_logs') || '[]');
  const now = Date.now();
  savedLogs.unshift({ subject, timestamp: now, duration: durationText, minutes: minutes });
  localStorage.setItem('evolve_study_logs', JSON.stringify(savedLogs));
}

if (logBtn) {
  const newLogBtn = logBtn.cloneNode(true);
  logBtn.parentNode.replaceChild(newLogBtn, logBtn);
  
  newLogBtn.addEventListener('click', () => {
    const subjectSelect = document.getElementById('logSubject');
    const durationInput = document.getElementById('logDuration');
    if (!durationInput.value) return;
    
    const minutes = parseInt(durationInput.value);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    
    saveStudyLog(subjectSelect.value, durationText, minutes);
    durationInput.value = '';
    loadStudyLogs();
  });
}

if (logList) {
  if (!localStorage.getItem('evolve_study_logs')) {
     localStorage.setItem('evolve_study_logs', JSON.stringify([]));
  }
  loadStudyLogs();
}