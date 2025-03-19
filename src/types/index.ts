export interface Event {
  id: string;
  title: {
    en: string;
    zh: string;
  };
  description: {
    en: string;
    zh: string;
  };
  start: string;
  end?: string;
  type: 'important-exam' | 'school-activity' | 'announcement' | 'holiday';
  grade: string[];
  link?: string;
}

export type Language = 'en' | 'zh';
export type ViewMode = 'month' | 'week' | 'agenda';