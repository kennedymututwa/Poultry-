import { CYCLE_DAYS, SITES, daysBetween, isoOffset, todayISO } from './data';
import { ensureVaccines, getAttendance, getCosts, getHouses, getRecords, getStaff } from './storage';
import { DailyRecord, FarmAlert, House, StaffMember } from './types';

export function money(n: number | string): string {
  const num = Number(n) || 0;
  try {
    return 'ZMW ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch {
    return 'ZMW ' + num.toFixed(2);
  }
}

export function moneyShort(n: number | string): string {
  return 'K ' + (Number(n) || 0).toLocaleString('en-US');
}

export function num(n: number | string): string {
  return (Number(n) || 0).toLocaleString('en-US');
}

export function fmtDate(d: string): string {
  if (!d) return '-';
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(d);
  }
}

export function initialsOf(name: string): string {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .map((w) => w[0] || '')
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export function pct(a: number | string, b: number | string): string {
  if (!b) return '0%';
  return (Math.round(((Number(a) || 0) / (Number(b) || 1)) * 1000) / 10) + '%';
}

export function houseAge(h: House): number {
  return h.placed ? daysBetween(h.placed, todayISO()) : 0;
}

export function daysToSale(h: House): number {
  if (!h.placed) return 0;
  return Math.max(0, CYCLE_DAYS - houseAge(h));
}

export function siteName(id: string): string {
  const found = SITES.find((s) => s.id === id);
  return found ? found.name : id || 'Misla';
}

export function houseTotals(houseId: string): { records: number; feed: number; charcoal: number; mortality: number; slaughter: number } {
  const recs = getRecords().filter((r) => r.house === houseId && r.status !== 'Rejected');
  let feed = 0, charcoal = 0, mortality = 0, slaughter = 0;
  recs.forEach((r) => {
    feed += Number(r.feedBags) || 0;
    charcoal += Number(r.charcoal) || 0;
    mortality += Number(r.mortality) || 0;
    slaughter += Number(r.slaughter) || 0;
  });
  return { records: recs.length, feed, charcoal, mortality, slaughter };
}

export interface HouseCalcResult {
  house: string;
  age: number;
  daysToSale: number;
  placed: number;
  remaining: number;
  feed: number;
  charcoal: number;
  mortality: number;
  slaughter: number;
  feedCost: number;
  charcoalCost: number;
  chickCost: number;
  totalCost: number;
  mortalityLoss: number;
  revenue: number;
  margin: number;
  mortalityRate: string;
  feedPerBird: number;
}

export function calcHouse(h: House): HouseCalcResult {
  const c = getCosts();
  const t = houseTotals(h.id);
  const placed = Number(h.birds) || 0;
  const feedCost = t.feed * c.feedBagPrice;
  const charcoalCost = t.charcoal * c.charcoalBagPrice;
  const chickCost = placed * c.chickPrice;
  const feedPerBird = placed ? (feedCost / placed) : 0;
  const mortalityLoss = t.mortality * (c.chickPrice + feedPerBird);
  const revenue = t.slaughter * c.salePricePerBird;
  const totalCost = feedCost + charcoalCost + chickCost;
  const remaining = Math.max(0, placed - t.mortality - t.slaughter);
  const margin = revenue - totalCost;

  return {
    house: h.id,
    age: houseAge(h),
    daysToSale: daysToSale(h),
    placed,
    remaining,
    feed: t.feed,
    charcoal: t.charcoal,
    mortality: t.mortality,
    slaughter: t.slaughter,
    feedCost,
    charcoalCost,
    chickCost,
    totalCost,
    mortalityLoss,
    revenue,
    margin,
    mortalityRate: pct(t.mortality, placed),
    feedPerBird: placed ? Math.round((t.feed * 50 / placed) * 100) / 100 : 0
  };
}

export interface FarmCalcResult {
  placed: number;
  feed: number;
  charcoal: number;
  mortality: number;
  slaughter: number;
  feedCost: number;
  charcoalCost: number;
  chickCost: number;
  totalCost: number;
  mortalityLoss: number;
  revenue: number;
  margin: number;
  mortalityRate: string;
  rows: HouseCalcResult[];
  remaining: number;
}

export function calcFarm(scopedHouses?: House[]): FarmCalcResult {
  const houses = scopedHouses || getHouses();
  const rows = houses.map(calcHouse);
  const sum: FarmCalcResult = {
    placed: 0,
    feed: 0,
    charcoal: 0,
    mortality: 0,
    slaughter: 0,
    feedCost: 0,
    charcoalCost: 0,
    chickCost: 0,
    totalCost: 0,
    mortalityLoss: 0,
    revenue: 0,
    margin: 0,
    mortalityRate: '0%',
    rows,
    remaining: 0
  };

  rows.forEach((r) => {
    sum.placed += r.placed;
    sum.remaining += r.remaining;
    sum.feed += r.feed;
    sum.charcoal += r.charcoal;
    sum.mortality += r.mortality;
    sum.slaughter += r.slaughter;
    sum.feedCost += r.feedCost;
    sum.charcoalCost += r.charcoalCost;
    sum.chickCost += r.chickCost;
    sum.totalCost += r.totalCost;
    sum.mortalityLoss += r.mortalityLoss;
    sum.revenue += r.revenue;
    sum.margin += r.margin;
  });

  sum.mortalityRate = pct(sum.mortality, sum.placed);
  return sum;
}

export function shiftTotals(list: DailyRecord[]): {
  Day: { feed: number; charcoal: number; mortality: number; slaughter: number };
  Night: { feed: number; charcoal: number; mortality: number; slaughter: number };
} {
  const t = {
    Day: { feed: 0, charcoal: 0, mortality: 0, slaughter: 0 },
    Night: { feed: 0, charcoal: 0, mortality: 0, slaughter: 0 }
  };
  list.forEach((r) => {
    const sh = (r.shift === 'Night') ? 'Night' : 'Day';
    t[sh].feed += Number(r.feedBags) || 0;
    t[sh].charcoal += Number(r.charcoal) || 0;
    t[sh].mortality += Number(r.mortality) || 0;
    t[sh].slaughter += Number(r.slaughter) || 0;
  });
  return t;
}

export function getFarmAlerts(scopedHouses?: House[]): FarmAlert[] {
  const out: FarmAlert[] = [];
  const today = todayISO();
  const houses = scopedHouses || getHouses();

  houses.forEach((h) => {
    if (h.placed && (Number(h.birds) || 0) > 0) {
      const saleDate = isoOffset(h.placed, CYCLE_DAYS);
      const left = daysToSale(h);
      out.push({
        id: h.id + '-sale',
        type: 'sale',
        house: h.id,
        date: saleDate,
        title: `${h.id} ready for sale — day ${CYCLE_DAYS}`,
        desc: `${num(h.birds)} broilers · ${left > 0 ? `in ${left} day(s)` : 'ready now'}`,
        days: left,
        urgent: saleDate <= today,
        soon: left >= 0 && left <= 3
      });
    }
  });

  ensureVaccines().forEach((v) => {
    if (v.status === 'Done') return;
    const dLeft = v.dueDate ? daysBetween(todayISO(), v.dueDate) : 0;
    const overdue = !!(v.dueDate && v.dueDate < todayISO());
    out.push({
      id: v.id,
      type: 'vaccination',
      house: v.house,
      date: v.dueDate,
      title: `${v.name} — ${v.house}`,
      desc: overdue
        ? `OVERDUE by ${Math.abs(daysBetween(v.dueDate, todayISO()))} day(s)`
        : (dLeft === 0 ? 'Due today' : `Due in ${dLeft} day(s)`),
      days: dLeft,
      urgent: overdue,
      soon: !overdue && dLeft <= 2
    });
  });

  out.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return out;
}

export function daysInMonth(ym: string): number {
  const parts = String(ym).split('-');
  const y = parseInt(parts[0], 10), m = parseInt(parts[1], 10);
  if (!y || !m) return 30;
  return new Date(y, m, 0).getDate();
}

export function attSummary(
  month: string,
  shift: 'Day' | 'Night'
): { staff: StaffMember; counts: { Present: number; Absent: number; 'Half Day': number; Leave: number; Off: number }; worked: number }[] {
  const staff = getStaff();
  const all = getAttendance();
  const map: Record<string, string> = {};
  all.forEach((a) => {
    if (a.month === month && a.shift === shift) {
      map[`${a.staffId}|${a.day}`] = a.status;
    }
  });

  return staff.map((s) => {
    const counts = { Present: 0, Absent: 0, 'Half Day': 0, Leave: 0, Off: 0 };
    const days = daysInMonth(month);
    for (let d = 1; d <= days; d++) {
      const st = map[`${s.id}|${d}`];
      if (st && counts[st as keyof typeof counts] !== undefined) {
        counts[st as keyof typeof counts]++;
      }
    }
    return {
      staff: s,
      counts,
      worked: counts.Present + (counts['Half Day'] * 0.5)
    };
  });
}
