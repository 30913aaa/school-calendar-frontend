let allEvents = [];
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let currentLang = 'zh';

const translations = {
  en: {
    title: 'School Calendar',
    prev: 'Previous Month',
    next: 'Next Month',
    today: 'Today',
    hideEvents: 'Hide Events',
    showEvents: 'Show Events',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: Array.from({ length: 12 }, (_, i) => new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(2025, i)))
  },
  zh: {
    title: '學校日曆',
    prev: '上個月',
    next: '下個月',
    today: '今天',
    hideEvents: '隱藏事件',
    showEvents: '顯示事件',
    days: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    months: Array.from({ length: 12 }, (_, i) => new Intl.DateTimeFormat('zh', { month: 'long' }).format(new Date(2025, i)))
  }
};

async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`請求失敗，重試 ${i + 1}/${retries} 次...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function loadEvents() {
  try {
    const [eventsData, historyData] = await Promise.all([
      fetchWithRetry('https://school-calendar-backend.onrender.com/api/events'),
      fetchWithRetry('https://school-calendar-backend.onrender.com/api/history')
    ]);
    allEvents = eventsData;
    console.log('加載的事件資料：', allEvents);
    const history = historyData;
    allEvents.forEach(event => {
      event.revisionHistory = history.find(h => h.eventId === event.id)?.revisions || [];
    });
  } catch (error) {
    console.error('無法讀取事件資料：', error);
    allEvents = [];
  }
  renderPage();
}

let selectedDate = null;

function renderCalendar() {
  const calendarGrid = document.querySelector('.calendar-grid');
  calendarGrid.innerHTML = '';
  translations[currentLang].days.forEach(day => {
    const header = document.createElement('div');
    header.className = 'day-header';
    header.textContent = day;
    calendarGrid.appendChild(header);
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date();
  let dayCounter = 1;

  for (let i = 0; i < 42; i++) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    if (i >= firstDay && dayCounter <= daysInMonth) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
      cell.innerHTML = `<span class="date">${dayCounter}</span><div class="events"></div>`;
      if (currentYear === today.getFullYear() && currentMonth === today.getMonth() && dayCounter === today.getDate()) {
        cell.classList.add('current');
      }
      if (dateStr === selectedDate) {
        cell.classList.add('selected');
      }
      if (getEventsForDay(dayCounter).some(e => e.type === 'important-exam')) {
        cell.querySelector('.date').style.color = 'red';
      }

      cell.addEventListener('click', () => {
        selectedDate = dateStr;
        renderCalendar();
        renderEventListForDate(selectedDate);
      });

      const events = getEventsForDay(dayCounter);
      const eventDiv = cell.querySelector('.events');
      events.forEach(event => {
        const icon = document.createElement('i');
        icon.className = `fa ${event.type === 'important-exam' ? 'fa-graduation-cap' : 
                          event.type === 'school-activity' ? 'fa-book' : 
                          event.type === 'announcement' ? 'fa-megaphone' : 'fa-star'}`;
        icon.style.color = `var(--event-${event.type.replace('-', '')})`;
        eventDiv.appendChild(icon);
      });
      dayCounter++;
    } else {
      cell.classList.add('inactive');
    }
    calendarGrid.appendChild(cell);
  }
}

function renderEventListForDate(dateStr) {
  const eventList = document.querySelector('#event-list ul');
  eventList.innerHTML = '';
  const date = new Date(dateStr);
  const events = allEvents.filter(event => {
    const start = new Date(event.start);
    const end = event.end ? new Date(event.end) : start;
    return date >= start && date <= end;
  });
  console.log(`選擇日期 ${dateStr} 的事件：`, events);

  events.forEach(event => {
    const li = document.createElement('li');
    const shortDate = event.end && event.start !== event.end ? 
      `${event.start.slice(5).replace('-', '/')} - ${event.end.slice(5).replace('-', '/')}` : 
      event.start.slice(5).replace('-', '/');
    li.innerHTML = `
      <details>
        <summary>
          <span class="event-date">${shortDate}</span>
          <span class="event-title">${event.title[currentLang]}</span>
          <span class="event-tags">
            ${Array.isArray(event.grade) ? event.grade.map(g => `<span class="tag grade-${g}">${g.replace('grade-', '高').replace('all-grades', '全年級')}</span>`).join('') : '<span class="tag grade-all-grades">全年級</span>'}
            <span class="tag type-${event.type}">${event.type === 'important-exam' ? '重要考試' : event.type === 'school-activity' ? '學校活動' : event.type === 'announcement' ? '公告' : '假期'}</span>
          </span>
        </summary>
        <p class="event-description">${event.description[currentLang]}</p>
        ${event.link ? `<a href="${event.link}" target="_blank">查看詳情</a>` : ''}
        <div class="revision-history">
          <h4>修訂歷程</h4>
          ${event.revisionHistory.map(r => `
            <p>${new Date(r.date).toLocaleString()} - ${r.action}: ${r.details}</p>
          `).join('')}
        </div>
      </details>
    `;
    eventList.appendChild(li);
  });
}

function renderEventList(eventsToDisplay) {
  const eventList = document.querySelector('#event-list ul');
  eventList.innerHTML = '';
  console.log('即將渲染的事件：', eventsToDisplay);
  eventsToDisplay.forEach(event => {
    const li = document.createElement('li');
    const shortDate = event.end && event.start !== event.end ? 
      `${event.start.slice(5).replace('-', '/')} - ${event.end.slice(5).replace('-', '/')}` : 
      event.start.slice(5).replace('-', '/');
    li.innerHTML = `
      <details>
        <summary>
          <span class="event-date">${shortDate}</span>
          <span class="event-title">${event.title[currentLang]}</span>
          <span class="event-tags">
            ${Array.isArray(event.grade) ? event.grade.map(g => `<span class="tag grade-${g}">${g.replace('grade-', '高').replace('all-grades', '全年級')}</span>`).join('') : '<span class="tag grade-all-grades">全年級</span>'}
            <span class="tag type-${event.type}">${event.type === 'important-exam' ? '重要考試' : event.type === 'school-activity' ? '學校活動' : event.type === 'announcement' ? '公告' : '假期'}</span>
          </span>
        </summary>
        <p class="event-description">${event.description[currentLang]}</p>
        ${event.link ? `<a href="${event.link}" target="_blank">查看詳情</a>` : ''}
        <div class="revision-history">
          <h4>修訂歷程</h4>
          ${event.revisionHistory.map(r => `
            <p>${new Date(r.date).toLocaleString()} - ${r.action}: ${r.details}</p>
          `).join('')}
        </div>
      </details>
    `;
    eventList.appendChild(li);
  });
}

function searchEvents() {
  const gradeFilter = document.getElementById('search-grade').value;
  const typeFilter = document.getElementById('search-type').value;
  const monthFilter = document.getElementById('search-month').value;

  let filteredEvents = allEvents;

  if (gradeFilter) {
    filteredEvents = filteredEvents.filter(event => Array.isArray(event.grade) && event.grade.includes(gradeFilter));
  }

  if (typeFilter) {
    filteredEvents = filteredEvents.filter(event => event.type === typeFilter);
  }

  if (monthFilter !== '') {
    const month = parseInt(monthFilter);
    filteredEvents = filteredEvents.filter(event => {
      const startMonth = new Date(event.start).getMonth();
      const endMonth = event.end ? new Date(event.end).getMonth() : startMonth;
      return startMonth <= month && endMonth >= month;
    });
  }

  renderEventList(filteredEvents);
}

function updateTexts() {
  document.getElementById('title').textContent = translations[currentLang].title;
  document.getElementById('prev-month').textContent = translations[currentLang].prev;
  document.getElementById('next-month').textContent = translations[currentLang].next;
  document.getElementById('today').textContent = translations[currentLang].today;
  document.getElementById('current-month').textContent = `${translations[currentLang].months[currentMonth]} ${currentYear}`;
  const toggleBtn = document.getElementById('toggle-events');
  toggleBtn.textContent = document.getElementById('event-list').classList.contains('visible') ?
    translations[currentLang].hideEvents : translations[currentLang].showEvents;
}

function getEventsForDay(day) {
  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const date = new Date(dateStr);
  return allEvents.filter(event => {
    const start = new Date(event.start);
    const end = event.end ? new Date(event.end) : start;
    return date >= start && date <= end;
  });
}

function getEventsForMonth() {
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  return allEvents.filter(event => {
    const start = new Date(event.start);
    const end = event.end ? new Date(event.end) : start;
    return start <= lastDay && end >= firstDay;
  }).sort((a, b) => new Date(a.start) - new Date(b.start));
}

function renderPage() {
  renderCalendar();
  renderEventList(getEventsForMonth());
  updateTexts();
}

document.getElementById('prev-month').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderPage();
});

document.getElementById('next-month').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderPage();
});

document.getElementById('today').addEventListener('click', () => {
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  renderPage();
});

document.getElementById('toggle-events').addEventListener('click', () => {
  const eventList = document.getElementById('event-list');
  eventList.classList.toggle('visible');
  updateTexts();
});

document.getElementById('language').addEventListener('change', (e) => {
  currentLang = e.target.value;
  renderPage();
});

document.getElementById('search-btn').addEventListener('click', () => {
  searchEvents();
});

// 初始化
loadEvents();