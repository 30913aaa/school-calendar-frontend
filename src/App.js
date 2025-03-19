import React, { useState, useEffect } from 'react';
import './App.css'; // 引入樣式文件
import Header from './components/Header';
import Nav from './components/Nav';
import Calendar from './components/Calendar';
import EventList from './components/EventList';
import EventModal from './components/EventModal';
import SearchPanel from './components/SearchPanel';
import Footer from './components/Footer';

const App = () => {
  // 狀態管理
  const [events, setEvents] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [language, setLanguage] = useState('zh');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState('month');

  // 語言翻譯
  const translations = {
    zh: {
      title: '學校日曆',
      prev: '上個月',
      next: '下個月',
      today: '今天',
      hideEvents: '隱藏事件',
      showEvents: '顯示事件',
      monthView: '月視圖',
      weekView: '週視圖',
      agendaView: '議程視圖',
      noEvents: '無事件',
    },
    en: {
      title: 'School Calendar',
      prev: 'Previous Month',
      next: 'Next Month',
      today: 'Today',
      hideEvents: 'Hide Events',
      showEvents: 'Show Events',
      monthView: 'Month View',
      weekView: 'Week View',
      agendaView: 'Agenda View',
      noEvents: 'No events',
    },
  };

  // 從後端獲取事件數據
  useEffect(() => {
    fetch('https://school-calendar-backend.onrender.com/api/events')
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error('Error fetching events:', error));
  }, []);

  // 導航事件處理
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    setCurrentYear((prev) => (currentMonth === 0 ? prev - 1 : prev));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    setCurrentYear((prev) => (currentMonth === 11 ? prev + 1 : prev));
    setSelectedDate(null);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    );
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleSearchToggle = () => {
    setIsSearchOpen((prev) => !prev);
  };

  return (
    <div className="app">
      <Header
        title={translations[language].title}
        onSearch={handleSearchToggle}
        onLanguageChange={handleLanguageChange}
        language={language}
      />
      <Nav
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
        onToday={handleToday}
        currentMonth={`${currentYear}年 ${translations[language].months?.[currentMonth] || currentMonth + 1}月`}
        translations={translations[language]}
      />
      <main className="flex">
        <Calendar
          events={events}
          currentYear={currentYear}
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          viewMode={viewMode}
          setViewMode={setViewMode}
          translations={translations[language]}
        />
        <EventList events={events} selectedDate={selectedDate} translations={translations[language]} />
      </main>
      {selectedDate && <EventModal event={events.find((e) => e.start === selectedDate)} onClose={() => setSelectedDate(null)} />}
      {isSearchOpen && <SearchPanel onClose={() => setIsSearchOpen(false)} />}
      <Footer />
    </div>
  );
};

export default App;