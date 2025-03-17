// Global variables
let allEvents = [];
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let currentLang = 'zh';
let selectedDate = null;
let viewMode = 'month'; // 'month' or 'list'
let filteredEvents = [];
let showingFilteredResults = false;

// Event cache with placeholder for faster rendering
const eventCache = {
  dayEvents: {},
  monthEvents: {}
};

// Translation object
const translations = {
  en: {
    title: 'School Calendar',
    prev: 'Previous Month',
    next: 'Next Month',
    today: 'Today',
    hideEvents: 'Hide Events',
    showEvents: 'Show Events',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: Array.from({ length: 12 }, (_, i) => new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(2025, i))),
    search: 'Search',
    cancel: 'Cancel',
    all: 'All',
    allGrades: 'All Grades',
    allCategories: 'All Categories',
    allMonths: 'All Months',
    grade1: 'Grade 10',
    grade2: 'Grade 11',
    grade3: 'Grade 12',
    allGradesTag: 'All Grades',
    examType: 'Important Exam',
    activityType: 'School Activity',
    announcementType: 'Announcement',
    holidayType: 'Holiday',
    monthView: 'Month View',
    weekView: 'Week View',
    dayView: 'Day View',
    listView: 'List View',
    noEvents: 'No events found for this period',
    viewMore: 'View More',
    print: 'Print',
    details: 'Details',
    back: 'Back',
    eventDetails: 'Event Details',
    date: 'Date',
    type: 'Type',
    grades: 'Grades',
    description: 'Description',
    filter: 'Filter',
    clearFilters: 'Clear Filters',
    todayEvents: "Today's Events",
    upcomingEvents: 'Upcoming Events',
    searchResults: 'Search Results',
    exportCalendar: 'Export Calendar',
    importantDates: 'Important Dates',
    searchPlaceholder: 'Search events...',
    loading: 'Loading events...',
    error: 'Error loading events'
  },
  zh: {
    title: '學校日曆',
    prev: '上個月',
    next: '下個月',
    today: '今天',
    hideEvents: '隱藏事件',
    showEvents: '顯示事件',
    days: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    months: Array.from({ length: 12 }, (_, i) => new Intl.DateTimeFormat('zh', { month: 'long' }).format(new Date(2025, i))),
    search: '搜尋',
    cancel: '取消',
    all: '全部',
    allGrades: '所有年級',
    allCategories: '所有類別',
    allMonths: '所有月份',
    grade1: '高一',
    grade2: '高二',
    grade3: '高三',
    allGradesTag: '全年級',
    examType: '重要考試',
    activityType: '學校活動',
    announcementType: '公告',
    holidayType: '假期',
    monthView: '月曆視圖',
    weekView: '週曆視圖',
    dayView: '日曆視圖',
    listView: '列表視圖',
    noEvents: '此期間沒有找到事件',
    viewMore: '查看更多',
    print: '列印',
    details: '詳情',
    back: '返回',
    eventDetails: '事件詳情',
    date: '日期',
    type: '類型',
    grades: '年級',
    description: '描述',
    filter: '篩選',
    clearFilters: '清除篩選',
    todayEvents: '今日事件',
    upcomingEvents: '即將到來的事件',
    searchResults: '搜尋結果',
    exportCalendar: '匯出日曆',
    importantDates: '重要日期',
    searchPlaceholder: '搜尋事件...',
    loading: '載入事件中...',
    error: '載入事件錯誤'
  }
};

// Event type mapping for display and colors
const eventTypes = {
  'important-exam': { color: '#e74c3c', icon: 'fas fa-pencil-alt' },
  'school-activity': { color: '#3498db', icon: 'fas fa-school' },
  'announcement': { color: '#f39c12', icon: 'fas fa-bullhorn' },
  'holiday': { color: '#2ecc71', icon: 'fas fa-umbrella-beach' }
};

// Fetch data with retry mechanism
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Request failed (${i + 1}/${retries}):`, error);
      if (i === retries - 1) {
        showToast(translations[currentLang].error, 'error');
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Load events from the server
async function loadEvents() {
  try {
    showLoadingIndicator(true);
    eventCache.dayEvents = {};
    eventCache.monthEvents = {};
    const apiUrl = 'https://school-calendar-backend.onrender.com/api/events';
    const eventsData = await fetchWithRetry(apiUrl);
    allEvents = processEvents(eventsData);
    console.log('Events loaded successfully:', allEvents.length);
    renderPage();
    showLoadingIndicator(false);
  } catch (error) {
    console.error('Failed to load events:', error);
    showLoadingIndicator(false);
    showToast(translations[currentLang].error, 'error');
    allEvents = [];
    renderPage();
  }
}

// Process raw events data
function processEvents(rawEvents) {
  return rawEvents.map(event => {
    if (!Array.isArray(event.grade)) {
      event.grade = event.grade ? event.grade.split(',') : ['all-grades'];
    }
    if (!event.title.en) event.title.en = event.title.zh;
    if (!event.title.zh) event.title.zh = event.title.en;
    if (!event.description.en) event.description.en = event.description.zh;
    if (!event.description.zh) event.description.zh = event.description.en;
    return event;
  });
}

// Display or hide the loading indicator
function showLoadingIndicator(show) {
  let loader = document.getElementById('loading-overlay');
  if (show) {
    loader.style.display = 'flex';
  } else {
    loader.style.display = 'none';
  }
}

// Show a toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  const container = document.getElementById('toast-container') || (() => {
    const cont = document.createElement('div');
    cont.id = 'toast-container';
    document.body.appendChild(cont);
    return cont;
  })();
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Show/hide a panel
function md_ShowPanel(panelId) {
  const panel = document.getElementById(panelId);
  if (panel) panel.style.display = 'block';
  const overlay = document.createElement('div');
  overlay.className = 'panel-overlay';
  overlay.onclick = () => md_HidePanel(panelId);
  overlay.id = `overlay-${panelId}`;
  document.body.appendChild(overlay);
  document.body.classList.add('no-scroll');
  setTimeout(() => {
    const firstInput = panel.querySelector('input, select, button');
    if (firstInput) firstInput.focus();
  }, 100);
}

// Hide a panel
function md_HidePanel(panelId) {
  const panel = document.getElementById(panelId);
  if (panel) panel.style.display = 'none';
  const overlay = document.getElementById(`overlay-${panelId}`);
  if (overlay) overlay.remove();
  document.body.classList.remove('no-scroll');
}

// Render the calendar grid
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
      const dateStr = formatDateString(currentYear, currentMonth + 1, dayCounter);
      const isToday = currentYear === today.getFullYear() &&
                      currentMonth === today.getMonth() &&
                      dayCounter === today.getDate();
      const dateSpan = document.createElement('span');
      dateSpan.className = 'date';
      dateSpan.textContent = dayCounter;
      cell.appendChild(dateSpan);
      const eventsForDay = getEventsForDay(dayCounter);
      if (eventsForDay.length > 0) {
        const indicatorsDiv = document.createElement('div');
        indicatorsDiv.className = 'event-indicators';
        const eventsByType = {};
        eventsForDay.forEach(event => {
          if (!eventsByType[event.type]) eventsByType[event.type] = [];
          eventsByType[event.type].push(event);
        });
        Object.keys(eventsByType).slice(0, 4).forEach(type => {
          const indicator = document.createElement('span');
          indicator.className = `event-indicator ${type}`;
          indicator.style.backgroundColor = eventTypes[type].color;
          indicatorsDiv.appendChild(indicator);
        });
        if (eventsForDay.length > 4) {
          const countIndicator = document.createElement('span');
          countIndicator.className = 'event-count';
          countIndicator.textContent = `+${eventsForDay.length - 3}`;
          indicatorsDiv.appendChild(countIndicator);
        }
        cell.appendChild(indicatorsDiv);
        if (eventsForDay.some(e => e.type === 'important-exam')) {
          dateSpan.style.color = eventTypes['important-exam'].color;
          dateSpan.style.fontWeight = '700';
        }
      }
      if (isToday) {
        cell.classList.add('current');
      }
      if (dateStr === selectedDate) {
        cell.classList.add('selected');
      }
      cell.addEventListener('click', () => {
        document.querySelectorAll('.day-cell.selected').forEach(el => el.classList.remove('selected'));
        cell.classList.add('selected');
        selectedDate = dateStr;
        renderEventListForDate(selectedDate);
        if (window.innerWidth < 768) {
          document.getElementById('event-list').classList.add('visible');
          updateTexts();
        }
      });
      dayCounter++;
    } else {
      cell.classList.add('inactive');
    }
    calendarGrid.appendChild(cell);
  }
  if (!selectedDate) {
    const todayStr = formatDateString(today.getFullYear(), today.getMonth() + 1, today.getDate());
    if (currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
      selectedDate = todayStr;
      renderEventListForDate(selectedDate);
    }
  }
}

// Format a date string in YYYY-MM-DD format
function formatDateString(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Render events for a specific date
function renderEventListForDate(dateStr) {
  const eventList = document.querySelector('#event-list ul');
  eventList.innerHTML = '';
  const date = new Date(dateStr);
  const events = allEvents.filter(event => {
    const start = new Date(event.start);
    const end = event.end ? new Date(event.end) : new Date(event.start);
    return date >= start && date <= end;
  });
  const noEventsDiv = document.getElementById('no-events');
  if (events.length === 0) {
    noEventsDiv.style.display = 'block';
  } else {
    noEventsDiv.style.display = 'none';
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
        </details>
      `;
      eventList.appendChild(li);
    });
  }
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
  showingFilteredResults = false;
  document.getElementById('event-list-title').textContent = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} 事件`;
}

// Search events
function searchEvents() {
  const keyword = document.getElementById('search-keyword').value.trim().toLowerCase();
  const gradeFilter = document.getElementById('search-grade').value;
  const typeFilter = document.getElementById('search-type').value;
  const startDate = document.getElementById('search-start-date').value;
  const endDate = document.getElementById('search-end-date').value;
  let filteredEvents = allEvents;
  if (keyword) {
    filteredEvents = filteredEvents.filter(event =>
      event.title[currentLang].toLowerCase().includes(keyword) ||
      event.description[currentLang].toLowerCase().includes(keyword)
    );
  }
  if (gradeFilter) {
    filteredEvents = filteredEvents.filter(event =>
      Array.isArray(event.grade) &&
      (event.grade.includes(gradeFilter) || event.grade.includes('all-grades'))
    );
  }
  if (typeFilter) {
    filteredEvents = filteredEvents.filter(event => event.type === typeFilter);
  }
  if (startDate) {
    const start = new Date(startDate);
    filteredEvents = filteredEvents.filter(event => {
      const eventEnd = event.end ? new Date(event.end) : new Date(event.start);
      return eventEnd >= start;
    });
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59);
    filteredEvents = filteredEvents.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart <= end;
    });
  }
  renderEventList(filteredEvents);
  md_HidePanel('SearchPanel');
  showNotification(`找到 ${filteredEvents.length} 個符合條件的事件`);
}

// Reset search form
function resetSearch() {
  document.getElementById('search-keyword').value = '';
  document.getElementById('search-grade').value = '';
  document.getElementById('search-type').value = '';
  document.getElementById('search-start-date').value = '';
  document.getElementById('search-end-date').value = '';
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  const notificationMessage = notification.querySelector('.notification-message');
  const notificationIcon = notification.querySelector('.notification-icon');
  notificationMessage.textContent = message;
  notificationIcon.className = 'notification-icon';
  if (type === 'success') {
    notificationIcon.classList.add('fas', 'fa-check-circle');
    notification.style.backgroundColor = '#2ecc71';
  } else if (type === 'error') {
    notificationIcon.classList.add('fas', 'fa-exclamation-circle');
    notification.style.backgroundColor = '#e74c3c';
  } else {
    notificationIcon.classList.add('fas', 'fa-info-circle');
    notification.style.backgroundColor = '#3498db';
  }
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Update texts based on language
function updateTexts() {
  document.getElementById('title').textContent = translations[currentLang].title;
  document.querySelector('#prev-month .button-text').textContent = translations[currentLang].prev;
  document.querySelector('#next-month .button-text').textContent = translations[currentLang].next;
  document.querySelector('#today .button-text').textContent = translations[currentLang].today;
  document.querySelector('#print-calendar .button-text').textContent = translations[currentLang].print;
  const toggleBtn = document.getElementById('toggle-events');
  const buttonText = toggleBtn.querySelector('.button-text');
  buttonText.textContent = document.getElementById('event-list').classList.contains('visible') ?
    translations[currentLang].hideEvents : translations[currentLang].showEvents;
  toggleBtn.setAttribute('aria-label', buttonText.textContent);
  document.getElementById('current-month').textContent = `${translations[currentLang].months[currentMonth]} ${currentYear}`;
  const viewSelectors = document.querySelectorAll('.view-selector button');
  viewSelectors[0].textContent = translations[currentLang].monthView;
  viewSelectors[1].textContent = translations[currentLang].weekView;
  viewSelectors[2].textContent = translations[currentLang].listView;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const filter = btn.getAttribute('data-filter');
    if (filter === 'all') {
      btn.textContent = translations[currentLang].all;
    } else if (filter === 'important-exam') {
      btn.textContent = translations[currentLang].examType;
    } else if (filter === 'school-activity') {
      btn.textContent = translations[currentLang].activityType;
    } else if (filter === 'announcement') {
      btn.textContent = translations[currentLang].announcementType;
    } else if (filter === 'holiday') {
      btn.textContent = translations[currentLang].holidayType;
    }
  });
  if (!selectedDate) {
    document.getElementById('event-list-title').textContent = translations[currentLang].allEvents;
  }
  document.querySelector('#no-events p').textContent = translations[currentLang].noEvents;
}

// Get events for a specific day
function getEventsForDay(day) {
  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  if (eventCache.dayEvents[dateStr]) {
    return eventCache.dayEvents[dateStr];
  }
  const date = new Date(dateStr);
  const events = allEvents.filter(event => {
    const start = new Date(event.start);
    const end = event.end ? new Date(event.end) : new Date(event.start);
    return date >= start && date <= end;
  });
  eventCache.dayEvents[dateStr] = events;
  return events;
}

// Get events for the current month
function getEventsForMonth() {
  const cacheKey = `${currentYear}-${currentMonth}`;
  if (eventCache.monthEvents[cacheKey]) {
    return eventCache.monthEvents[cacheKey];
  }
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const events = allEvents.filter(event => {
    const start = new Date(event.start);
    const end = event.end ? new Date(event.end) : new Date(event.start);
    return start <= lastDay && end >= firstDay;
  }).sort((a, b) => new Date(a.start) - new Date(b.start));
  eventCache.monthEvents[cacheKey] = events;
  return events;
}

// Render event list
function renderEventList(eventsToDisplay) {
  const eventList = document.querySelector('#event-list ul');
  eventList.innerHTML = '';
  const noEventsDiv = document.getElementById('no-events');
  if (!eventsToDisplay || eventsToDisplay.length === 0) {
    noEventsDiv.style.display = 'block';
    return;
  }
  noEventsDiv.style.display = 'none';
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
      </details>
    `;
    eventList.appendChild(li);
  });
  if (eventsToDisplay !== getEventsForMonth()) {
    document.getElementById('event-list-title').textContent = translations[currentLang].searchResults;
  }
}

// Render the page
function renderPage() {
  renderCalendar();
  if (selectedDate) {
    renderEventListForDate(selectedDate);
  } else {
    renderEventList(getEventsForMonth());
  }
  updateTexts();
}

// Switch view
function switchView(view) {
  const calendarGrid = document.querySelector('.calendar-grid');
  const weekView = document.querySelector('.week-view');
  const agendaView = document.querySelector('.agenda-view');
  calendarGrid.style.display = 'none';
  weekView.style.display = 'none';
  agendaView.style.display = 'none';
  if (view === 'month') {
    calendarGrid.style.display = 'grid';
  } else if (view === 'week') {
    weekView.style.display = 'block';
    renderWeekView();
  } else if (view === 'agenda') {
    agendaView.style.display = 'block';
    renderAgendaView();
  }
  document.querySelectorAll('.view-selector button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`.view-selector button[data-view="${view}"]`).classList.add('active');
}

// Render week view
function renderWeekView() {
  const weekView = document.querySelector('.week-view');
  weekView.innerHTML = '';
  const today = new Date(currentYear, currentMonth, selectedDate ? new Date(selectedDate).getDate() : 1);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const weekHeader = document.createElement('div');
  weekHeader.className = 'week-header';
  weekHeader.innerHTML = `<h3>${formatDateString(startOfWeek.getFullYear(), startOfWeek.getMonth() + 1, startOfWeek.getDate())} - ${formatDateString(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6))}</h3>`;
  weekView.appendChild(weekHeader);
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + i);
    const dayContainer = document.createElement('div');
    dayContainer.className = 'week-day-container';
    dayContainer.innerHTML = `
      <div class="week-day-header">
        <span class="week-day-name">${translations[currentLang].days[i]}</span>
        <span class="week-day-date">${dayDate.getDate()}</span>
      </div>
      <div class="week-day-events"></div>
    `;
    const eventsForDay = allEvents.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = event.end ? new Date(event.end) : eventStart;
      return dayDate >= eventStart && dayDate <= eventEnd;
    });
    const eventsContainer = dayContainer.querySelector('.week-day-events');
    if (eventsForDay.length === 0) {
      eventsContainer.innerHTML = '<p class="no-events">無事件</p>';
    } else {
      eventsForDay.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = `week-event ${event.type}`;
        eventElement.style.backgroundColor = eventTypes[event.type].color;
        eventElement.innerHTML = `<span class="week-event-title">${event.title[currentLang]}</span>`;
        eventsContainer.appendChild(eventElement);
      });
    }
    weekView.appendChild(dayContainer);
  }
}

// Render agenda view
function renderAgendaView() {
  const agendaView = document.querySelector('.agenda-view');
  agendaView.innerHTML = '<h3>議程視圖即將推出</h3>';
}

// Show event details
function showEventDetails(event) {
  const modal = document.getElementById('event-modal');
  const modalContent = document.getElementById('event-modal-content');
  const eventDate = event.end && event.start !== event.end ?
    `${event.start} - ${event.end}` : event.start;
  modalContent.innerHTML = `
    <h2>${event.title[currentLang]}</h2>
    <div class="event-meta">
      <p><strong>日期:</strong> ${eventDate}</p>
      <p><strong>類型:</strong>
        <span class="tag type-${event.type}">${event.type === 'important-exam' ? '重要考試' : event.type === 'school-activity' ? '學校活動' : event.type === 'announcement' ? '公告' : '假期'}</span>
      </p>
      <p><strong>年級:</strong>
        ${Array.isArray(event.grade) ? event.grade.map(g => `<span class="tag grade-${g}">${g.replace('grade-', '高').replace('all-grades', '全年級')}</span>`).join('') : '<span class="tag grade-all-grades">全年級</span>'}
      </p>
    </div>
    <div class="event-description-full">
      ${event.description[currentLang]}
    </div>
    ${event.link ? `<a href="${event.link}" target="_blank" class="btn-primary">查看詳情</a>` : ''}
    <button class="btn-secondary close-modal">${translations[currentLang].back}</button>
  `;
  modalContent.querySelector('.close-modal').addEventListener('click', () => {
    modal.classList.remove('visible');
  });
  modal.classList.add('visible');
}

// Handle next month button click
function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  selectedDate = null;
  renderPage();
}

// Handle previous month button click
function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  selectedDate = null;
  renderPage();
}

// Go to today's date
function goToToday() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  selectedDate = formatDateString(currentYear, currentMonth + 1, today.getDate());
  renderPage();
}

// Toggle event list visibility (for mobile)
function toggleEventList() {
  const eventList = document.getElementById('event-list');
  eventList.classList.toggle('visible');
  updateTexts();
}

// Print calendar
function printCalendar() {
  window.print();
}

// Export calendar to iCal format
function exportCalendar() {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//School Calendar//V1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ].join('\r\n');
  allEvents.forEach(event => {
    const startDate = event.start.replace(/-/g, '');
    const endDate = event.end ? event.end.replace(/-/g, '') : startDate;
    icsContent += [
      '\r\nBEGIN:VEVENT',
      `SUMMARY:${event.title[currentLang]}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `DESCRIPTION:${event.description[currentLang].replace(/\n/g, '\\n')}`,
      `CATEGORIES:${event.type}`,
      `UID:${event.id || Math.random().toString(36).substring(2)}@schoolcalendar`,
      'END:VEVENT'
    ].join('\r\n');
  });
  icsContent += '\r\nEND:VCALENDAR';
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'school_calendar.ics';
  link.click();
  URL.revokeObjectURL(link.href);
  showNotification(translations[currentLang].exportCalendar + ' ' + translations[currentLang].success, 'success');
}

// Filter events by type
function filterByType(type) {
  if (type === 'all') {
    showingFilteredResults = false;
    if (selectedDate) {
      renderEventListForDate(selectedDate);
    } else {
      renderEventList(getEventsForMonth());
    }
  } else {
    let eventsToFilter = selectedDate ?
      getEventsForDay(new Date(selectedDate).getDate()) :
      getEventsForMonth();
    filteredEvents = eventsToFilter.filter(event => event.type === type);
    renderEventList(filteredEvents);
    showingFilteredResults = true;
  }
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`.filter-btn[data-filter="${type}"]`).classList.add('active');
}

// Initialize the calendar
function initCalendar() {
  document.getElementById('prev-month').addEventListener('click', prevMonth);
  document.getElementById('next-month').addEventListener('click', nextMonth);
  document.getElementById('today').addEventListener('click', goToToday);
  document.getElementById('toggle-events').addEventListener('click', toggleEventList);
  document.getElementById('print-calendar').addEventListener('click', printCalendar);
  document.getElementById('language').addEventListener('change', function () {
    currentLang = this.value;
    document.documentElement.lang = currentLang;
    renderPage();
    localStorage.setItem('calendar_lang', currentLang);
  });
  document.querySelectorAll('.view-selector button').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      switchView(view);
    });
  });
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      filterByType(filter);
    });
  });
  document.getElementById('search-btn').addEventListener('click', () => {
    md_ShowPanel('SearchPanel');
  });
  document.getElementById('reset-search').addEventListener('click', resetSearch);
  document.getElementById('cancel-search').addEventListener('click', () => {
    md_HidePanel('SearchPanel');
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
      document.getElementById('event-list').classList.remove('visible');
    } else {
      document.getElementById('event-list').classList.add('visible');
    }
    updateTexts();
  });
  const savedLang = localStorage.getItem('calendar_lang');
  if (savedLang && (savedLang === 'en' || savedLang === 'zh')) {
    currentLang = savedLang;
    document.documentElement.lang = currentLang;
    document.getElementById('language').value = currentLang;
  }
  loadEvents();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initCalendar);

// Handle error reporting
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Error:', message, 'at', source, lineno, colno);
  showToast(`錯誤: ${message}`, 'error');
  return true;
};