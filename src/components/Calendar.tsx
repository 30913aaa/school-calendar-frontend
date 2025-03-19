import * as React from 'react';
import useCalendarStore from '../store/calendarStore';
import { Event } from '../types';

const Calendar: React.FC = () => {
  const { currentYear, currentMonth, language, events, selectedDate, setSelectedDate } = useCalendarStore();

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDay = (day: number): Event[] => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      const start = new Date(event.start);
      const end = event.end ? new Date(event.end) : new Date(event.start);
      const current = new Date(dateStr);
      return current >= start && current <= end;
    });
  };

  // 定義事件類型與小點顏色的映射
  const getDotColor = (type: Event['type']) => {
    const colors = {
      'important-exam': 'bg-red-500', // 紅色小點
      'school-activity': 'bg-blue-500', // 藍色小點
      'announcement': 'bg-yellow-500', // 
      'holiday': 'bg-green-500', //
    };
    return colors[type];
  };

  const renderCalendarGrid = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    // Add day headers
    const dayNames = language === 'zh' 
      ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    dayNames.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="text-center font-semibold p-2 border-b border-gray-200">
          {day}
        </div>
      );
    });

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 bg-gray-50/50 rounded-lg" />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const eventsForDay = getEventsForDay(day);
      const isSelected = dateStr === selectedDate;
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(dateStr)}
          className={`p-2 border rounded-lg min-h-[100px] cursor-pointer transition-all duration-200
            ${isSelected ? 'bg-blue-50 border-blue-500 shadow-sm' : 'border-gray-200 hover:border-blue-300'}
            ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        >
          <span className={`inline-block font-semibold px-2 py-1 rounded-full mb-1
            ${isToday ? 'bg-blue-500 text-white' : ''}`}>
            {day}
          </span>
          {/* 渲染小點 */}
          {eventsForDay.length > 0 && (
            <div className="flex justify-center gap-1 mt-1">
              {eventsForDay.map((event, index) => (
                <div
                  key={`dot-${index}`}
                  className={`w-2 h-2 rounded-full ${getDotColor(event.type)}`}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Fill remaining cells to complete the grid
    const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;
    for (let i = daysInMonth + firstDay; i < totalCells; i++) {
      days.push(<div key={`empty-end-${i}`} className="p-2 bg-gray-50/50 rounded-lg" />);
    }

    return days;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-7 gap-2">
        {renderCalendarGrid()}
      </div>
    </div>
  );
};

export default Calendar;