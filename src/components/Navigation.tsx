import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCalendarDay, faList, faPrint } from '@fortawesome/free-solid-svg-icons';
import useCalendarStore from '../store/calendarStore';

const Navigation: React.FC = () => {
  const { 
    currentMonth, 
    currentYear, 
    language, 
    prevMonth, 
    nextMonth, 
    goToToday,
    toggleEventList,
    isEventListVisible
  } = useCalendarStore();

  const translations = {
    en: {
      prev: 'Previous Month',
      next: 'Next Month',
      today: 'Today',
      hideEvents: 'Hide Events',
      showEvents: 'Show Events',
      print: 'Print'
    },
    zh: {
      prev: '上個月',
      next: '下個月',
      today: '今天',
      hideEvents: '隱藏事件',
      showEvents: '顯示事件',
      print: '列印'
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <nav className="flex flex-wrap items-center p-4 bg-white shadow-md rounded-xl mb-4 gap-2">
      <button
        onClick={prevMonth}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="mr-2 text-gray-600" />
        <span>{translations[language].prev}</span>
      </button>
      <span className="text-xl font-semibold mx-4 flex-1 text-center">
        {new Date(currentYear, currentMonth).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US', {
          year: 'numeric',
          month: 'long'
        })}
      </span>
      <button
        onClick={nextMonth}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        <span>{translations[language].next}</span>
        <FontAwesomeIcon icon={faChevronRight} className="ml-2 text-gray-600" />
      </button>
      <button 
        onClick={goToToday}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        <FontAwesomeIcon icon={faCalendarDay} className="mr-2 text-blue-600" />
        <span>{translations[language].today}</span>
      </button>
      <button 
        onClick={toggleEventList}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        <FontAwesomeIcon 
          icon={faList} 
          className={`mr-2 ${isEventListVisible ? 'text-red-500' : 'text-green-500'}`} 
        />
        <span>
          {isEventListVisible 
            ? translations[language].hideEvents 
            : translations[language].showEvents}
        </span>
      </button>
      <button 
        onClick={handlePrint}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        <FontAwesomeIcon icon={faPrint} className="mr-2 text-gray-600" />
        <span>{translations[language].print}</span>
      </button>
    </nav>
  );
};

export default Navigation;