export interface BudgetItem {
  id: string;
  category: string;
  name: string;
  estimated: number;
  actual: number;
  status: "pending" | "paid";
  notes?: string;
}

export interface Guest {
  id: string;
  name: string;
  category: "Family" | "Friends" | "Work" | "Other";
  email: string;
  phone: string;
  dietary: string;
  rsvpStatus: "pending" | "attending" | "declined";
  tableId?: string | null;
}

export interface WeddingTable {
  id: string;
  name: string;
  capacity: number;
}

export interface TaskItem {
  id: string;
  category: string;
  title: string;
  dueDate: string;
  status: "todo" | "in-progress" | "completed";
}

export interface DreamVendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  status: "prospect" | "inquired" | "booked";
  notes?: string;
  contact?: string;
}

export interface RantReview {
  id: string;
  title: string;
  content: string;
  type: "rant" | "review";
  rating?: number;
  mood: string;
  date: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  date: string;
}
