export interface BrandConfig {
  name: string;
  short: string;
  sub: string;
  tagline: string;
  ceo: string;
  phone: string;
  phone2?: string;
  email: string;
  address: string;
  city: string;
  hours: string;
  emergency: string;
  primary: string;
  secondary: string;
  accent: string;
  adminEmail: string;
  adminPassword: string;
}

export interface Site {
  id: string;
  name: string;
  area: string;
  role: string;
  houses: number;
}

export interface House {
  id: string;
  site: string;
  name: string;
  type: string;
  capacity: number;
  birds: number;
  placed: string;
  supervisor: string;
  poulterer: string;
  status: 'Active' | 'Cleaning' | 'Empty';
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Supervisor' | 'Poulterer' | 'Admin';
  phone: string;
  email: string;
  site: string;
  houses?: string;
  shift: 'Day' | 'Night';
  status: 'Active' | 'On Leave';
  avatar: string;
}

export interface ProductItem {
  id: string;
  emoji: string;
  name: string;
  unit: number;
  desc: string;
  includes: string;
}

export interface OrderSize {
  id: string;
  name: string;
  mult: number;
}

export interface DailyRecord {
  id: string;
  date: string;
  site: string;
  house: string;
  shift: 'Day' | 'Night';
  supervisor: string;
  poulterer: string;
  feedBags: number;
  charcoal: number;
  mortality: number;
  slaughter: number;
  weightKg: number;
  medication: string;
  notes: string;
  status: 'Submitted' | 'Approved' | 'Rejected';
  createdAt?: string;
  approvedBy?: string;
}

export interface TaskItem {
  id: string;
  house: string;
  title: string;
  assignedTo: string;
  due: string;
  status: 'Pending' | 'In Progress' | 'Done';
  createdBy: string;
}

export interface InventoryItem {
  id: string;
  item: string;
  category: string;
  qty: number;
  unit: string;
  minQty: number;
  unitPrice: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface FinanceEntry {
  id: string;
  type: 'Income' | 'Expense';
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface CustomerOrder {
  id: string;
  customer: string;
  phone: string;
  email: string;
  product: string;
  size: string;
  qty: number;
  unit: number;
  total: number;
  address: string;
  landmark: string;
  date: string;
  slot: string;
  notes: string;
  status: 'Pending' | 'Confirmed' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  createdAt: string;
  source: string;
  userId?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'New' | 'Replied';
  createdAt: string;
  repliedAt?: string;
}

export interface VaccineScheduleItem {
  id: string;
  house: string;
  site: string;
  placed: string;
  key: string;
  day: number;
  name: string;
  dueDate: string;
  givenDate: string;
  givenBy: string;
  notes?: string;
  status: 'Pending' | 'Done';
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  day: string | number;
  month: string;
  shift: 'Day' | 'Night';
  status: 'Present' | 'Absent' | 'Half Day' | 'Leave' | 'Off';
  recordedBy?: string;
  startTime?: string;
  endTime?: string;
}

export interface CostSettings {
  chickPrice: number;
  feedBagPrice: number;
  charcoalBagPrice: number;
  salePricePerBird: number;
  targetWeightKg: number;
  cycleDays: number;
}

export interface AppSettings {
  name: string;
  phone: string;
  phone2?: string;
  email: string;
  address: string;
  city: string;
  tagline: string;
  ceo: string;
  googleSheetsUrl: string;
}

export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  role: 'admin' | 'supervisor' | 'poulterer';
  name: string;
  phone?: string;
  house?: string;
  houses?: string;
  site?: string;
  shift?: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
}

export interface FarmAlert {
  id: string;
  type: 'sale' | 'vaccination';
  house: string;
  date: string;
  title: string;
  desc: string;
  days: number;
  urgent: boolean;
  soon: boolean;
}
