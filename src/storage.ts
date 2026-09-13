import { BRAND, DEFAULT_COSTS, HOUSES, SEED_FINANCE, SEED_INVENTORY, SEED_ORDERS, SEED_RECORDS, SEED_TASKS, SEED_VACCINES, VACCINE_DAYS, isoOffset, todayISO, STAFF } from './data';
import { AppSettings, AttendanceRecord, ContactMessage, CostSettings, CustomerOrder, DailyRecord, FinanceEntry, House, InventoryItem, StaffMember, TaskItem, UserAccount, VaccineScheduleItem } from './types';

const _memStore: Record<string, string> = {};

export function lsGet(k: string): string | null {
  try {
    const v = window.localStorage.getItem(k);
    if (v !== null) return v;
  } catch {
    // fallback
  }
  return Object.prototype.hasOwnProperty.call(_memStore, k) ? _memStore[k] : null;
}

export function lsSet(k: string, v: string): void {
  _memStore[k] = v;
  try {
    window.localStorage.setItem(k, v);
  } catch {
    // fallback
  }
}

export function lsRemove(k: string): void {
  delete _memStore[k];
  try {
    window.localStorage.removeItem(k);
  } catch {
    // fallback
  }
}

export function tryParse<T>(key: string, fallback: T): T {
  try {
    const raw = lsGet(key);
    if (!raw) return fallback;
    const p = JSON.parse(raw);
    return (p === null || p === undefined) ? fallback : p;
  } catch {
    return fallback;
  }
}

function seed<T>(key: string, data: T[]): T[] {
  const v = tryParse<T[] | null>(key, null);
  if (!v || !v.length) {
    const copy = [...data];
    lsSet(key, JSON.stringify(copy));
    return copy;
  }
  return v;
}

export function getRecords(): DailyRecord[] { return seed('ff_records', SEED_RECORDS); }
export function saveRecords(r: DailyRecord[]): void { lsSet('ff_records', JSON.stringify(r)); }

export function getTasks(): TaskItem[] { return seed('ff_tasks', SEED_TASKS); }
export function saveTasks(t: TaskItem[]): void { lsSet('ff_tasks', JSON.stringify(t)); }

export function getInventory(): InventoryItem[] { return seed('ff_inventory', SEED_INVENTORY); }
export function saveInventory(i: InventoryItem[]): void { lsSet('ff_inventory', JSON.stringify(i)); }

export function getFinance(): FinanceEntry[] { return seed('ff_finance', SEED_FINANCE); }
export function saveFinance(f: FinanceEntry[]): void { lsSet('ff_finance', JSON.stringify(f)); }

export function getOrders(): CustomerOrder[] { return seed('ff_orders', SEED_ORDERS); }
export function saveOrders(o: CustomerOrder[]): void { lsSet('ff_orders', JSON.stringify(o)); }

export function getHouses(): House[] {
  const h = tryParse<House[] | null>('ff_houses', null);
  if (!h || !h.length) {
    const copy = JSON.parse(JSON.stringify(HOUSES));
    lsSet('ff_houses', JSON.stringify(copy));
    return copy;
  }
  return h;
}
export function saveHouses(h: House[]): void { lsSet('ff_houses', JSON.stringify(h)); }

export function getStaff(): StaffMember[] {
  const s = tryParse<StaffMember[] | null>('ff_staff', null);
  if (!s || !s.length) {
    const copy = JSON.parse(JSON.stringify(STAFF));
    lsSet('ff_staff', JSON.stringify(copy));
    return copy;
  }
  return s;
}
export function saveStaff(s: StaffMember[]): void { lsSet('ff_staff', JSON.stringify(s)); }

export function getUsers(): UserAccount[] { return tryParse<UserAccount[]>('ff_users', []); }
export function saveUsers(u: UserAccount[]): void { lsSet('ff_users', JSON.stringify(u)); }

export function getMessages(): ContactMessage[] { return tryParse<ContactMessage[]>('ff_messages', []); }
export function saveMessages(m: ContactMessage[]): void { lsSet('ff_messages', JSON.stringify(m)); }

export function getAttendance(): AttendanceRecord[] { return tryParse<AttendanceRecord[]>('ff_attendance', []); }
export function saveAttendance(a: AttendanceRecord[]): void { lsSet('ff_attendance', JSON.stringify(a)); }

export function getVaccines(): VaccineScheduleItem[] { return tryParse<VaccineScheduleItem[]>('ff_vaccines', []); }
export function saveVaccines(v: VaccineScheduleItem[]): void { lsSet('ff_vaccines', JSON.stringify(v)); }

export function getCosts(): CostSettings {
  const d: CostSettings = { ...DEFAULT_COSTS };
  const s = tryParse<Record<string, unknown> | null>('ff_costs', null);
  if (s) {
    if (typeof s.chickPrice === 'number') d.chickPrice = s.chickPrice;
    if (typeof s.feedBagPrice === 'number') d.feedBagPrice = s.feedBagPrice;
    if (typeof s.charcoalBagPrice === 'number') d.charcoalBagPrice = s.charcoalBagPrice;
    if (typeof s.salePricePerBird === 'number') d.salePricePerBird = s.salePricePerBird;
    if (typeof s.targetWeightKg === 'number') d.targetWeightKg = s.targetWeightKg;
    if (typeof s.cycleDays === 'number') d.cycleDays = s.cycleDays;
  }
  return d;
}
export function saveCosts(c: CostSettings): void { lsSet('ff_costs', JSON.stringify(c)); }

export function getSettings(): AppSettings {
  const d: AppSettings = {
    name: BRAND.name,
    phone: BRAND.phone,
    phone2: BRAND.phone2,
    email: BRAND.email,
    address: BRAND.address,
    city: BRAND.city,
    tagline: BRAND.tagline,
    ceo: BRAND.ceo,
    googleSheetsUrl: ''
  };
  const s = tryParse<Record<string, unknown> | null>('ff_settings', null);
  if (s) {
    if (typeof s.name === 'string') d.name = s.name;
    if (typeof s.phone === 'string') d.phone = s.phone;
    if (typeof s.phone2 === 'string') d.phone2 = s.phone2;
    if (typeof s.email === 'string') d.email = s.email;
    if (typeof s.address === 'string') d.address = s.address;
    if (typeof s.city === 'string') d.city = s.city;
    if (typeof s.tagline === 'string') d.tagline = s.tagline;
    if (typeof s.ceo === 'string') d.ceo = s.ceo;
    if (typeof s.googleSheetsUrl === 'string') d.googleSheetsUrl = s.googleSheetsUrl;
  }
  return d;
}
export function saveSettings(s: AppSettings): void { lsSet('ff_settings', JSON.stringify(s)); }

export function hashPw(p: string): string {
  let h = 0;
  for (let i = 0; i < p.length; i++) {
    h = ((h << 5) - h) + p.charCodeAt(i);
    h |= 0;
  }
  return 'h_' + Math.abs(h).toString(36);
}

export function genId(prefix: string): string {
  return prefix + '-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 900 + 100);
}

export function genCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function makeTicket(): string {
  const d = new Date();
  return 'FF-' + String(d.getFullYear()).slice(-2) + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + Math.floor(1000 + Math.random() * 8999);
}

export function ensureVaccines(): VaccineScheduleItem[] {
  const log = getVaccines();
  const houses = getHouses();
  let changed = false;
  houses.forEach((h) => {
    if (!h.placed) return;
    VACCINE_DAYS.forEach((v) => {
      let exists = false;
      for (let i = 0; i < log.length; i++) {
        if (log[i].house === h.id && log[i].key === v.key && log[i].placed === h.placed) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        const seedDone = SEED_VACCINES[h.id] && SEED_VACCINES[h.id].includes(v.key);
        const due = isoOffset(h.placed, v.day);
        log.push({
          id: genId('VAC'),
          house: h.id,
          site: h.site || 'misla',
          placed: h.placed,
          key: v.key,
          day: v.day,
          name: v.name,
          dueDate: due,
          givenDate: seedDone ? due : '',
          givenBy: seedDone ? (h.supervisor || 'Supervisor') : '',
          status: seedDone ? 'Done' : 'Pending'
        });
        changed = true;
      }
    });
  });
  if (changed) saveVaccines(log);
  return log;
}

export function vaccineState(h: House): VaccineScheduleItem[] {
  const log = ensureVaccines();
  return log.filter((v) => v.house === h.id && (!h.placed || v.placed === h.placed));
}

export function initAdmin(): void {
  const users = getUsers();
  let admin = users.find((u) => u.role === 'admin');
  if (!admin) {
    users.push({
      id: 'USR-ADMIN-001',
      email: BRAND.adminEmail,
      password: hashPw(BRAND.adminPassword),
      role: 'admin',
      name: 'Farm Manager',
      phone: BRAND.phone,
      status: 'active',
      createdAt: new Date().toISOString()
    });
    saveUsers(users);
  } else if (admin.status !== 'active') {
    admin.status = 'active';
    saveUsers(users);
  }
}

// Google Sheets integration
export function getSheetsUrl(): string {
  const s = getSettings();
  return (s && s.googleSheetsUrl) ? s.googleSheetsUrl : '';
}

export function submitToSheets(
  action: string,
  data: Record<string, string | number | undefined | null>,
  callback?: (res: { success: boolean; message?: string; error?: string; reason?: string }) => void
): void {
  const url = getSheetsUrl();
  if (!url) {
    if (callback) callback({ success: false, reason: 'Google Sheets URL not configured' });
    return;
  }
  try {
    const fd = new FormData();
    fd.append('action', action);
    if (data) {
      for (const k in data) {
        if (Object.prototype.hasOwnProperty.call(data, k) && data[k] !== undefined && data[k] !== null) {
          fd.append(k, String(data[k]));
        }
      }
    }
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url + (url.indexOf('?') >= 0 ? '&' : '?') + 'action=' + encodeURIComponent(action), true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (callback) callback(res);
        } catch {
          if (xhr.status === 200 && xhr.responseText) {
            if (callback) callback({ success: true, message: xhr.responseText });
          } else if (callback) {
            callback({ success: false, error: 'Parse error' });
          }
        }
      }
    };
    xhr.onerror = function () {
      submitJson(url, action, data, callback);
    };
    xhr.send(fd);
  } catch {
    submitJson(url, action, data, callback);
  }
}

function submitJson(
  url: string,
  action: string,
  data: Record<string, string | number | undefined | null>,
  callback?: (res: { success: boolean; error?: string }) => void
): void {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (callback) callback(res);
        } catch {
          if (callback) callback(xhr.status === 200 ? { success: true } : { success: false });
        }
      }
    };
    xhr.onerror = function () {
      if (callback) callback({ success: false, error: 'Network error' });
    };
    xhr.send(JSON.stringify({ action: action, data: data }));
  } catch (e2) {
    if (callback) callback({ success: false, error: (e2 as Error).message });
  }
}
