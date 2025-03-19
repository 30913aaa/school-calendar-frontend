import React, { useState } from 'react';
import useCalendarStore from '../store/calendarStore';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ isOpen, onClose }) => {
  const { language } = useCalendarStore();
  const [keyword, setKeyword] = useState('');
  const [grade, setGrade] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const translations = {
    en: {
      title: 'Advanced Search',
      keyword: 'Keyword',
      grade: 'Grade',
      type: 'Type',
      dateRange: 'Date Range',
      search: 'Search',
      reset: 'Reset',
      cancel: 'Cancel'
    },
    zh: {
      title: '進階搜尋',
      keyword: '關鍵字',
      grade: '年級',
      type: '類別',
      dateRange: '時間範圍',
      search: '查詢',
      reset: '重置',
      cancel: '取消'
    }
  };

  const handleReset = () => {
    setKeyword('');
    setGrade('');
    setType('');
    setStartDate('');
    setEndDate('');
  };

  const handleSearch = () => {
    // Implement search logic here
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">{translations[language].title}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translations[language].keyword}
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder={language === 'zh' ? '搜尋事件標題或描述' : 'Search events...'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translations[language].grade}
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">{language === 'zh' ? '所有年級' : 'All Grades'}</option>
              <option value="grade-1">{language === 'zh' ? '高一' : 'Grade 10'}</option>
              <option value="grade-2">{language === 'zh' ? '高二' : 'Grade 11'}</option>
              <option value="grade-3">{language === 'zh' ? '高三' : 'Grade 12'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translations[language].type}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">{language === 'zh' ? '所有類別' : 'All Types'}</option>
              <option value="important-exam">{language === 'zh' ? '重要考試' : 'Important Exam'}</option>
              <option value="school-activity">{language === 'zh' ? '學校活動' : 'School Activity'}</option>
              <option value="announcement">{language === 'zh' ? '公告' : 'Announcement'}</option>
              <option value="holiday">{language === 'zh' ? '假期' : 'Holiday'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translations[language].dateRange}
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSearch}
              className="flex-1 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
            >
              {translations[language].search}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-200 text-gray-800 p-2 rounded-lg hover:bg-gray-300"
            >
              {translations[language].reset}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 p-2 rounded-lg hover:bg-gray-300"
            >
              {translations[language].cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;