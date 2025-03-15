let allEvents = [];
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0-11
let currentLang = 'en';

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

async function loadEvents() {
  try {
    const response = await fetch('http://localhost:3000/api/events', { cache: 'no-store' });
    if (!response.ok) throw new Error('Network response was not ok');
    allEvents = await response.json();
  } catch (error) {
    console.error('無法讀取事件資料：', error);
    allEvents = [];
  }
  renderPage();
}


let selectedDate = null; // 追蹤當前選中的日期

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
      cell.innerHTML = `<span class="date">${dayCounter}</span><div class="events"></div>`;
      if (currentYear === today.getFullYear() && currentMonth === today.getMonth() && dayCounter === today.getDate()) {
        cell.classList.add('current');
      }

      // 檢查是否為選中日期
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
      if (dateStr === selectedDate) {
        cell.classList.add('selected');
      }

      // 添加點擊事件
      cell.addEventListener('click', () => {
        selectedDate = dateStr; // 更新選中日期
        renderCalendar(); // 重新渲染日曆以更新高亮
        renderEventListForDate(selectedDate); // 渲染該日期的事件
      });

      const events = getEventsForDay(dayCounter);
      console.log(`日期 ${dayCounter} 的事件：`, events);
      const eventDiv = cell.querySelector('.events');
      events.forEach(event => {
        const icon = document.createElement('i');
        icon.className = `fa ${event.type === 'activity' ? 'fa-book' : event.type === 'announcement' ? 'fa-megaphone' : 'fa-star'}`;
        icon.style.color = `var(--event-${event.type})`;
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
  console.log(`日期 ${dateStr} 的事件：`, events);

  events.forEach(event => {
    const li = document.createElement('li');
    const dateRange = event.end && event.start !== event.end ? `${event.start} - ${event.end}` : event.start;
    li.innerHTML = `
      <details>
        <summary>
          <span class="event-date">${dateRange}</span>
          <span class="event-title">${event.title[currentLang]}</span>
        </summary>
        <p class="event-description">${event.description[currentLang]}</p>
      </details>
    `;
    eventList.appendChild(li);
  });
}
function renderEventList() {
  const eventList = document.querySelector('#event-list ul');
  eventList.innerHTML = '';
  const monthEvents = getEventsForMonth();
  console.log('本月事件：', monthEvents);
  monthEvents.forEach(event => {
    const li = document.createElement('li');
    const dateRange = event.end && event.start !== event.end ? `${event.start} - ${event.end}` : event.start;
    li.innerHTML = `
      <details>
        <summary>
          <span class="event-date">${dateRange}</span>
          <span class="event-title">${event.title[currentLang]}</span>
        </summary>
        <p class="event-description">${event.description[currentLang]}</p>
      </details>
    `;
    eventList.appendChild(li);
  });
}

// 更新文本
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
    const end = event.end ? new Date(event.end) : start; // 如果 end 不存在，則使用 start
    return date >= start && date <= end;
  });
}

function getEventsForMonth() {
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  return allEvents.filter(event => {
    const start = new Date(event.start);
    const end = event.end ? new Date(event.end) : start; // 如果 end 不存在，則使用 start
    return start <= lastDay && end >= firstDay;
  }).sort((a, b) => new Date(a.start) - new Date(b.start));
}

// 渲染頁面
function renderPage() {
  renderCalendar();
  renderEventList();
  updateTexts();
}

// 事件監聽
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

// 初始化
loadEvents();