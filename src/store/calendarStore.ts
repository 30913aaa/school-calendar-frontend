import { create } from 'zustand';
import { Event, Language } from '../types';

interface CalendarState {
  currentYear: number;
  currentMonth: number;
  language: Language;
  events: Event[];
  selectedDate: string | null;
  isEventListVisible: boolean;
  setLanguage: (language: Language) => void;
  setSelectedDate: (date: string | null) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  goToToday: () => void;
  toggleEventList: () => void;
  fetchEvents: () => Promise<void>; // 新增 fetchEvents 函數
}

const useCalendarStore = create<CalendarState>((set) => ({
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  language: 'zh' as Language,
  events: [],
  selectedDate: null,
  isEventListVisible: true,

  setLanguage: (language) => set({ language }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  prevMonth: () =>
    set((state) => {
      const newMonth = state.currentMonth === 0 ? 11 : state.currentMonth - 1;
      const newYear = state.currentMonth === 0 ? state.currentYear - 1 : state.currentYear;
      return { currentMonth: newMonth, currentYear: newYear };
    }),
  nextMonth: () =>
    set((state) => {
      const newMonth = state.currentMonth === 11 ? 0 : state.currentMonth + 1;
      const newYear = state.currentMonth === 11 ? state.currentYear + 1 : state.currentYear;
      return { currentMonth: newMonth, currentYear: newYear };
    }),
  goToToday: () =>
    set({
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      selectedDate: new Date().toISOString().split('T')[0],
    }),
  toggleEventList: () => set((state) => ({ isEventListVisible: !state.isEventListVisible })),

  // 新增 fetchEvents 函數，從後端獲取事件資料
  fetchEvents: async () => {
    try {
      const response = await fetch('https://school-calendar-backend.onrender.com/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data: Event[] = await response.json();
      set({ events: data });
    } catch (error) {
      console.error('Error fetching events:', error);
      set({ events: [] }); // 失敗時清空 events
    }
  },
}));

export default useCalendarStore;