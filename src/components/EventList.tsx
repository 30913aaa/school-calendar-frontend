import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import useCalendarStore from '../store/calendarStore';
import { Event } from '../types';

const EventList: React.FC = () => {
  const { events, selectedDate, language, isEventListVisible } = useCalendarStore();

  const translations = {
    en: {
      noEvents: 'No events',
      allEvents: 'All Events',
      examType: 'Important Exam',
      activityType: 'School Activity',
      announcementType: 'Announcement',
      holidayType: 'Holiday',
      viewDetails: 'View Details'
    },
    zh: {
      noEvents: '無事件',
      allEvents: '所有事件',
      examType: '重要考試',
      activityType: '學校活動',
      announcementType: '公告',
      holidayType: '假期',
      viewDetails: '查看詳情'
    }
  };

  const getEventsForSelectedDate = (): Event[] => {
    if (!selectedDate) return events;
    return events.filter(event => {
      const start = new Date(event.start);
      const end = event.end ? new Date(event.end) : new Date(event.start);
      const selected = new Date(selectedDate);
      return selected >= start && selected <= end;
    });
  };

  const getEventTypeColor = (type: Event['type']) => {
    const colors = {
      'important-exam': 'var(--event-exam)',
      'school-activity': 'var(--event-activity)',
      'announcement': 'var(--event-announcement)',
      'holiday': 'var(--event-holiday)'
    };
    return colors[type];
  };

  if (!isEventListVisible) return null;

  const currentEvents = getEventsForSelectedDate();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full md:w-80">
      <h2 className="text-xl font-semibold mb-6">
        {selectedDate
          ? new Date(selectedDate).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US')
          : translations[language].allEvents}
      </h2>
      
      {currentEvents.length === 0 ? (
        <p className="text-gray-500 text-center py-4">{translations[language].noEvents}</p>
      ) : (
        <div className="space-y-3">
          {currentEvents.map((event, index) => (
            <details key={index} className="group rounded-lg border border-gray-200 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex-1 pr-4">
                  <div className="font-medium mb-1">{event.title[language]}</div>
                  <div className="text-sm text-gray-500">
                    {event.start === event.end 
                      ? new Date(event.start).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US')
                      : `${new Date(event.start).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US')} - 
                         ${new Date(event.end || event.start).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US')}`}
                  </div>
                </div>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className="text-gray-400 transform transition-transform group-open:rotate-180" 
                />
              </summary>
              <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                <p className="text-sm leading-relaxed">{event.description[language]}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {event.grade.map((grade, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full">
                      {grade.replace('grade-', '高').replace('all-grades', '全年級')}
                    </span>
                  ))}
                  <span
                    className="text-xs px-2.5 py-1 rounded-full text-white shadow-sm"
                    style={{ backgroundColor: getEventTypeColor(event.type) }}
                  >
                    {translations[language][`${event.type}Type` as keyof typeof translations.en]}
                  </span>
                </div>
                {event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-sm inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {translations[language].viewDetails}
                  </a>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;