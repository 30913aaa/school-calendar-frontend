import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

function Calendar() {
  const [allEvents, setAllEvents] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentLang, setCurrentLang] = useState('en');
  const [showEvents, setShowEvents] = useState(true);

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
    },
  };

  // 從後端獲取事件
  useEffect(() => {
    axios.get('http://localhost:5000/events')
      .then(response => setAllEvents(response.data))
      .catch(error => console.error('無法獲取事件:', error));
  }, []);

  const renderCalendar = () => {
    const calendarGrid = [];
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    let dayCounter = 1;

    translations[currentLang].days.forEach(day => {
      calendarGrid.push(<div className="day-header">{day}</div>);
    });

    for (let i = 0; i < 42; i++) {
      const cell = (
        <div className={`day-cell ${i >= firstDay && dayCounter <= daysInMonth ? '' : 'inactive'} ${currentYear === today.getFullYear() && currentMonth === today.getMonth() && dayCounter === today.getDate() ? 'current' : ''}`}>
          {i >= firstDay && dayCounter <= daysInMonth ? (
            <>
              <span className="date">{dayCounter}</span>
              <div className="events">
                {getEventsForDay(dayCounter).map(event => (
                  <i
                    key={event._id}
                    className={`fa ${event.type === 'activity' ? 'fa-book' : event.type === 'announcement' ? 'fa-megaphone' : 'fa-star'}`}
                    style={{ color: `var(--event-${event.type})` }}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      );
      calendarGrid.push(cell);
      if (i >= firstDay && dayCounter <= daysInMonth) dayCounter++;
    }
    return calendarGrid;
  };

  const renderEventList = () => {
    const monthEvents = getEventsForMonth();
    return monthEvents.map(event => (
      <li key={event._id}>
        <details>
          <summary>
            <span className="event-date">
              {new Date(event.start).toLocaleDateString()} {event.end && event.start !== event.end ? `- ${new Date(event.end).toLocaleDateString()}` : ''}
            </span>
            <span className="event-title">{event.title}</span>
          </summary>
          <p className="event-description">{event.description}</p>
        </details>
      </li>
    ));
  };

  const getEventsForDay = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const date = new Date(dateStr);
    return allEvents.filter(event => {
      const start = new Date(event.start);
      const end = event.end ? new Date(event.end) : start;
      return date >= start && date <= end;
    });
  };

  const getEventsForMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    return allEvents.filter(event => {
      const start = new Date(event.start);
      const end = event.end ? new Date(event.end) : start;
      return start <= lastDay && end >= firstDay;
    }).sort((a, b) => new Date(a.start) - new Date(b.start));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth - 1);
    if (currentMonth < 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth + 1);
    if (currentMonth > 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(new Date().getFullYear());
    setCurrentMonth(new Date().getMonth());
  };

  const handleToggleEvents = () => {
    setShowEvents(!showEvents);
  };

  const handleLanguageChange = (e) => {
    setCurrentLang(e.target.value);
  };

  return (
    <div>
      <header>
        <img src="logo.png" alt="學校標誌" className="logo" />
        <h1>{translations[currentLang].title}</h1>
        <select id="language" onChange={handleLanguageChange} value={currentLang}>
          <option value="en">English</option>
          <option value="zh">中文</option>
        </select>
      </header>

      <nav>
        <button onClick={handlePrevMonth}>{translations[currentLang].prev}</button>
        <span>{`${translations[currentLang].months[currentMonth]} ${currentYear}`}</span>
        <button onClick={handleNextMonth}>{translations[currentLang].next}</button>
        <button onClick={handleToday}>{translations[currentLang].today}</button>
        <button onClick={handleToggleEvents}>
          {showEvents ? translations[currentLang].hideEvents : translations[currentLang].showEvents}
        </button>
      </nav>

      <main className="flex">
        <section id="calendar" className="flex-grow">
          <div className="calendar-grid">{renderCalendar()}</div>
        </section>
        <aside id="event-list" className={showEvents ? 'visible' : ''}>
          <ul className="event-list">{renderEventList()}</ul>
        </aside>
      </main>

      <footer>
        <p>© 2025 School Name</p>
      </footer>
    </div>
  );
}

export default Calendar;