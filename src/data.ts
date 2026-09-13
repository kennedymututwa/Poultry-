import { BrandConfig, CostSettings, House, InventoryItem, OrderSize, ProductItem, Site, StaffMember, DailyRecord, TaskItem, FinanceEntry, CustomerOrder } from './types';

export const BRAND: BrandConfig = {
  name: 'Farmers Fresh',
  short: 'Farmers Fresh',
  sub: 'Broiler Production & Fresh Produce',
  tagline: 'Supplying Lusaka with Quality Chicken',
  ceo: 'BIG BOSS',
  phone: '+260 973 283 009',
  phone2: '',
  email: 'kmututwa@gmail.com',
  address: 'Misla, next to Tiger Company, along Mumbwa Road, Lusaka',
  city: 'Lusaka, Zambia',
  hours: '05:30 to 18:00 Monday to Saturday',
  emergency: 'Emergency vet call-out on request',
  primary: '#0B6B3A',
  secondary: '#F5A623',
  accent: '#2ECC71',
  adminEmail: 'admin@farmersfresh.co.zm',
  adminPassword: 'FarmersFresh@2026'
};

export const SITES: Site[] = [
  { id: 'misla', name: 'Misla', area: 'Next to Tiger Company, along Mumbwa Road', role: 'Main broiler site — houses H1 to H7', houses: 7 },
  { id: 'makeni', name: 'Makeni', area: 'Makeni, Lusaka', role: 'Growing site', houses: 0 },
  { id: 'mboshya', name: 'Mboshya', area: 'Mboshya, Lusaka', role: 'Growing site', houses: 0 },
  { id: 'mungwi', name: 'Mungwi Road', area: 'Along Mungwi Road, Lusaka', role: 'Collection & distribution point', houses: 0 }
];

export const CYCLE_DAYS = 35;

export const VACCINE_DAYS = [
  { key: 'd10', day: 10, name: 'Day 10 — First vaccination (Newcastle / ND)' },
  { key: 'd14', day: 14, name: 'Day 14 — Second vaccination (Gumboro / IBD)' },
  { key: 'd18', day: 18, name: 'Day 18 — Third vaccination (ND booster)' }
];

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDaysISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export function isoOffset(base: string, days: number): string {
  try {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export function daysBetween(a: string, b: string): number {
  try {
    return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
  } catch {
    return 0;
  }
}

export const HOUSES: House[] = [
  { id: 'H1', site: 'misla', name: 'House H1', type: 'Broilers', capacity: 6000, birds: 5800, placed: isoOffset(todayISO(), -32), supervisor: 'Supervisor 1', poulterer: 'Worker 1', status: 'Active' },
  { id: 'H2', site: 'misla', name: 'House H2', type: 'Broilers', capacity: 6000, birds: 5750, placed: isoOffset(todayISO(), -25), supervisor: 'Supervisor 1', poulterer: 'Worker 2', status: 'Active' },
  { id: 'H3', site: 'misla', name: 'House H3', type: 'Broilers', capacity: 5000, birds: 4880, placed: isoOffset(todayISO(), -16), supervisor: 'Supervisor 2', poulterer: 'Worker 3', status: 'Active' },
  { id: 'H4', site: 'misla', name: 'House H4', type: 'Broilers', capacity: 5000, birds: 4950, placed: isoOffset(todayISO(), -8), supervisor: 'Supervisor 2', poulterer: 'Worker 4', status: 'Active' },
  { id: 'H5', site: 'misla', name: 'House H5', type: 'Broilers', capacity: 5000, birds: 4900, placed: isoOffset(todayISO(), -3), supervisor: 'Supervisor 1', poulterer: 'Worker 5', status: 'Active' },
  { id: 'H6', site: 'misla', name: 'House H6', type: 'Broilers', capacity: 4000, birds: 0, placed: '', supervisor: 'Supervisor 2', poulterer: '', status: 'Cleaning' },
  { id: 'H7', site: 'misla', name: 'House H7', type: 'Broilers', capacity: 4000, birds: 0, placed: '', supervisor: '', poulterer: '', status: 'Empty' }
];

export const STAFF: StaffMember[] = [
  { id: 'STF-001', name: 'Supervisor 1', role: 'Supervisor', phone: '+260 961 111 222', email: 'sup1@farmersfresh.co.zm', site: 'Misla', shift: 'Day', status: 'Active', avatar: 'S1' },
  { id: 'STF-002', name: 'Supervisor 2', role: 'Supervisor', phone: '+260 962 222 333', email: 'sup2@farmersfresh.co.zm', site: 'Misla', shift: 'Night', status: 'Active', avatar: 'S2' },
  { id: 'STF-003', name: 'Worker 1', role: 'Poulterer', phone: '+260 963 333 444', email: 'w1@farmersfresh.co.zm', site: 'Misla', shift: 'Day', status: 'Active', avatar: 'W1' },
  { id: 'STF-004', name: 'Worker 2', role: 'Poulterer', phone: '+260 964 444 555', email: 'w2@farmersfresh.co.zm', site: 'Misla', shift: 'Day', status: 'Active', avatar: 'W2' },
  { id: 'STF-005', name: 'Worker 3', role: 'Poulterer', phone: '+260 965 555 666', email: 'w3@farmersfresh.co.zm', site: 'Misla', shift: 'Night', status: 'Active', avatar: 'W3' },
  { id: 'STF-006', name: 'Worker 4', role: 'Poulterer', phone: '+260 966 666 777', email: 'w4@farmersfresh.co.zm', site: 'Misla', shift: 'Night', status: 'Active', avatar: 'W4' },
  { id: 'STF-007', name: 'Worker 5', role: 'Poulterer', phone: '+260 967 777 888', email: 'w5@farmersfresh.co.zm', site: 'Misla', shift: 'Day', status: 'On Leave', avatar: 'W5' }
];

export const PRODUCTS: ProductItem[] = [
  { id: 'broiler', emoji: '🐔', name: 'Live Broiler Chicken (per bird)', unit: 120, desc: '35-day broilers, 1.8-2.5kg live weight. Supplied to supermarkets and malls.', includes: 'Crated and delivered on schedule' },
  { id: 'dressed', emoji: '🍗', name: 'Dressed Chicken (per kg)', unit: 38, desc: 'Cleaned, dressed and packed ready for retail shelves.', includes: 'Chilled, packed and labelled' },
  { id: 'crate', emoji: '📦', name: 'Broiler Crate (20 birds)', unit: 2300, desc: 'Wholesale crate of 20 dressed birds — best for shops.', includes: 'Wholesale pricing + scheduled delivery' },
  { id: 'manure', emoji: '🌱', name: 'Chicken Manure (50kg bag)', unit: 80, desc: 'Well-composted organic manure from our broiler houses.', includes: 'Composted 90+ days, ready to apply' },
  { id: 'maize', emoji: '🌽', name: 'Fresh Maize (per dozen)', unit: 45, desc: 'Freshly harvested green maize from our crop fields.', includes: 'Harvested to order' },
  { id: 'lemons', emoji: '🍋', name: 'Lemons (per kg)', unit: 25, desc: 'Fresh, juicy lemons picked from our orchards.', includes: 'Graded and packed' },
  { id: 'oranges', emoji: '🍊', name: 'Oranges (per kg)', unit: 30, desc: 'Sweet, fresh oranges for retail and juicing.', includes: 'Graded and packed' }
];

export const ORDER_SIZES: OrderSize[] = [
  { id: 's1', name: 'Small (1 - 20 units)', mult: 1.00 },
  { id: 's2', name: 'Medium (21 - 100 units)', mult: 0.95 },
  { id: 's3', name: 'Large (101 - 500 units)', mult: 0.90 },
  { id: 's4', name: 'Wholesale (501 - 1,000 units)', mult: 0.85 },
  { id: 's5', name: 'Contract (1,000+ units)', mult: 0.80 }
];

export const DELIVERY_SLOTS = ['Morning (05:30 - 09:00)', 'Mid-day (09:00 - 13:00)', 'Afternoon (13:00 - 18:00)'];
export const ORDER_FLOW = ['Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered'] as const;
export const RECORD_STATUSES = ['Submitted', 'Approved', 'Rejected'] as const;
export const TASK_STATUSES = ['Pending', 'In Progress', 'Done'] as const;
export const SHIFTS = ['Day', 'Night'] as const;
export const ATT_STATUS = ['Present', 'Absent', 'Half Day', 'Leave', 'Off'] as const;

export const DEFAULT_COSTS: CostSettings = {
  chickPrice: 18,
  feedBagPrice: 420,
  charcoalBagPrice: 120,
  salePricePerBird: 120,
  targetWeightKg: 2.0,
  cycleDays: 35
};

export const SEED_RECORDS: DailyRecord[] = [
  { id: 'REC-1001', date: todayISO(), site: 'misla', house: 'H1', shift: 'Day', supervisor: 'Supervisor 1', poulterer: 'Worker 1', feedBags: 18, charcoal: 2, mortality: 6, slaughter: 0, weightKg: 2.1, medication: '', notes: 'Day 32 — birds on target weight.', status: 'Approved' },
  { id: 'REC-1002', date: todayISO(), site: 'misla', house: 'H1', shift: 'Night', supervisor: 'Supervisor 1', poulterer: 'Worker 1', feedBags: 12, charcoal: 3, mortality: 4, slaughter: 0, weightKg: 2.1, medication: '', notes: 'Night round normal.', status: 'Submitted' },
  { id: 'REC-1003', date: todayISO(), site: 'misla', house: 'H3', shift: 'Day', supervisor: 'Supervisor 2', poulterer: 'Worker 3', feedBags: 20, charcoal: 2, mortality: 9, slaughter: 0, weightKg: 1.4, medication: 'Day 16 - routine', notes: 'Watch temperature at night.', status: 'Submitted' },
  { id: 'REC-1004', date: addDaysISO(-1), site: 'misla', house: 'H2', shift: 'Day', supervisor: 'Supervisor 1', poulterer: 'Worker 2', feedBags: 22, charcoal: 2, mortality: 7, slaughter: 120, weightKg: 1.9, medication: '', notes: 'First partial slaughter for a supermarket order.', status: 'Approved' }
];

export const SEED_TASKS: TaskItem[] = [
  { id: 'TSK-001', house: 'H1', title: 'Prepare crates for supermarket run', assignedTo: 'Worker 1', due: todayISO(), status: 'Pending', createdBy: 'Supervisor 1' },
  { id: 'TSK-002', house: 'H3', title: 'Check charcoal levels before night shift', assignedTo: 'Worker 3', due: todayISO(), status: 'In Progress', createdBy: 'Supervisor 2' },
  { id: 'TSK-003', house: 'H6', title: 'Clean and lime house for next placement', assignedTo: 'Worker 4', due: addDaysISO(2), status: 'Done', createdBy: 'Supervisor 2' }
];

export const SEED_INVENTORY: InventoryItem[] = [
  { id: 'INV-001', item: 'Broiler Starter (50kg)', category: 'Feed', qty: 160, unit: 'bags', minQty: 60, unitPrice: 420, status: 'In Stock' },
  { id: 'INV-002', item: 'Broiler Finisher (50kg)', category: 'Feed', qty: 95, unit: 'bags', minQty: 50, unitPrice: 455, status: 'In Stock' },
  { id: 'INV-003', item: 'Charcoal', category: 'Fuel', qty: 26, unit: 'bags', minQty: 30, unitPrice: 120, status: 'Low Stock' },
  { id: 'INV-004', item: 'Vaccines (ND / Gumboro)', category: 'Health', qty: 18, unit: 'vials', minQty: 12, unitPrice: 180, status: 'In Stock' },
  { id: 'INV-005', item: 'Disinfectant', category: 'Health', qty: 8, unit: 'litres', minQty: 15, unitPrice: 180, status: 'Low Stock' },
  { id: 'INV-006', item: 'Crates (20 bird)', category: 'Packaging', qty: 220, unit: 'pieces', minQty: 100, unitPrice: 95, status: 'In Stock' },
  { id: 'INV-007', item: 'Wood Shavings (bedding)', category: 'Bedding', qty: 0, unit: 'bales', minQty: 20, unitPrice: 95, status: 'Out of Stock' }
];

export const SEED_FINANCE: FinanceEntry[] = [
  { id: 'FIN-001', type: 'Income', category: 'Chicken Sales', description: 'Supermarket chain — 400 birds', amount: 48000, date: addDaysISO(-3) },
  { id: 'FIN-002', type: 'Income', category: 'Produce Sales', description: 'Maize + lemons + oranges', amount: 9600, date: addDaysISO(-5) },
  { id: 'FIN-003', type: 'Expense', category: 'Feed', description: 'Broiler finisher — 120 bags', amount: 54600, date: addDaysISO(-6) },
  { id: 'FIN-004', type: 'Expense', category: 'Charcoal', description: 'Charcoal — 40 bags', amount: 4800, date: addDaysISO(-6) },
  { id: 'FIN-005', type: 'Expense', category: 'Chicks', description: 'Day-old chicks — 6,000', amount: 108000, date: addDaysISO(-20) },
  { id: 'FIN-006', type: 'Income', category: 'Manure Sales', description: '40 bags compost', amount: 3200, date: addDaysISO(-2) }
];

export const SEED_ORDERS: CustomerOrder[] = [
  { id: 'FF-260905-3312', customer: 'Shoprite Chawama', phone: '+260 971 234 567', email: 'orders@shoprite.co.zm', product: 'Dressed Chicken (per kg)', size: 'Wholesale (501 - 1,000 units)', qty: 600, unit: 32.3, total: 19380, address: 'Chawama Mall', landmark: 'Along Mumbwa Road', date: todayISO(), slot: 'Morning (05:30 - 09:00)', notes: 'Deliver before 08:00 please.', status: 'Confirmed', createdAt: '2026-09-05T07:20:00Z', source: 'Website' },
  { id: 'FF-260908-7741', customer: 'Mwansa Banda', phone: '+260 972 345 678', email: 'mwansa@gmail.com', product: 'Live Broiler Chicken (per bird)', size: 'Small (1 - 20 units)', qty: 12, unit: 120, total: 1440, address: 'Misla', landmark: 'Next to Tiger Company', date: addDaysISO(2), slot: 'Afternoon (13:00 - 18:00)', notes: '', status: 'Pending', createdAt: '2026-09-08T11:05:00Z', source: 'WhatsApp' },
  { id: 'FF-260902-1180', customer: 'Lusako Phiri', phone: '+260 973 456 789', email: 'lusako@gmail.com', product: 'Fresh Maize (per dozen)', size: 'Medium (21 - 100 units)', qty: 50, unit: 42.75, total: 2137.5, address: 'Plot 8, Misla', landmark: 'Behind the shop', date: addDaysISO(-2), slot: 'Mid-day (09:00 - 13:00)', notes: '', status: 'Delivered', createdAt: '2026-09-02T09:00:00Z', source: 'Website' }
];

export const SEED_VACCINES: Record<string, string[]> = {
  H1: ['d10', 'd14', 'd18'],
  H2: ['d10', 'd14', 'd18'],
  H3: ['d10', 'd14'],
  H4: [],
  H5: []
};
