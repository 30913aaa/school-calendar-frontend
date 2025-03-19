import { useState, useEffect } from 'react'; // 引入 useEffect
import Header from './components/Header';
import Navigation from './components/Navigation';
import Calendar from './components/Calendar';
import EventList from './components/EventList';
import SearchPanel from './components/SearchPanel';
import useCalendarStore from './store/calendarStore';

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isEventListVisible, fetchEvents } = useCalendarStore(); // 從 store 中提取 fetchEvents

  // 在組件掛載時獲取事件資料
  useEffect(() => {
    fetchEvents(); // 調用 fetchEvents 來從後端獲取資料
  }, [fetchEvents]); // 依賴 fetchEvents，確保它只在初次渲染時運行

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onSearchClick={() => setIsSearchOpen(true)} />
      <Navigation />
      
      <main className="p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <Calendar />
        </div>
        {isEventListVisible && (
          <EventList />
        )}
      </main>

      <SearchPanel
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <footer className="mt-8 py-4 text-center text-gray-600 border-t bg-white">
        <p>© 2025 學校日曆系統</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:text-gray-900">關於</a>
          <a href="#" className="hover:text-gray-900">使用說明</a>
          <a href="#" className="hover:text-gray-900">意見回饋</a>
        </div>
      </footer>
    </div>
  );
}

export default App;