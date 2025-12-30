export type TableShape = 'round' | 'rect' | 'square';

export interface Table {
  id: string;
  event_id: string;
  name: string;
  shape: TableShape;
  capacity: number;
  x: number;
  y: number;
  rotation: number;
  // سنقوم بربط المقاعد هنا عند جلب البيانات
  seats?: Seat[]; 
}

export interface Seat {
  id: string;
  table_id: string;
  attendee_id: string | null; // null = مقعد فارغ
  seat_number: number;
  // تفاصيل الضيف للعرض
  attendee?: {
    name: string;
    category: string;
  };
}