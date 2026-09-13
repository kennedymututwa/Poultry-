import React, { useState } from 'react';
import { CalendarView } from './CalendarView';
import { AttendanceView } from './AttendanceView';
import { TasksView } from './TasksView';
import { ATT_STATUS, BRAND, CYCLE_DAYS, RECORD_STATUSES, SHIFTS, SITES, todayISO } from '../data';
import { attSummary, calcFarm, calcHouse, daysInMonth, fmtDate, getFarmAlerts, houseAge, money, moneyShort, num, shiftTotals, siteName } from '../calc';
import { openCall, openEmail, openWhatsApp } from '../contact';
import { DailyRecord, House, InventoryItem, StaffMember, TaskItem, UserAccount } from '../types';
import {
  ensureVaccines,
  genId,
  getAttendance,
  getCosts,
  getFinance,
  getHouses,
  getInventory,
  getMessages,
  getOrders,
  getRecords,
  getSettings,
  getStaff,
  getTasks,
  saveAttendance,
  saveCosts,
  saveFinance,
  saveHouses,
  saveInventory,
  saveMessages,
  saveOrders,
  saveRecords,
  saveSettings,
  saveStaff,
  saveTasks,
  saveVaccines,
  submitToSheets
} from '../storage';

interface DashboardProps {
  user: UserAccount;
  role: 'admin' | 'supervisor' | 'poulterer';
  section: string;
  onNavigateSection: (sec: string) => void;
  onLogout: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'warn' | 'info') => void;
  onShowModal: (title: string, content: React.ReactNode, wide?: boolean) => void;
  onCloseModal: () => void;
  dark: boolean;
  onToggleDark: () => void;
}

export function DashboardShell({
  user,
  role,
  section,
  onNavigateSection,
  onLogout,
  onToast,
  onShowModal,
  onCloseModal,
  dark,
  onToggleDark
}: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recordFilter, setRecordFilter] = useState<string>('all');
  const [recordShift, setRecordShift] = useState<string>('all');
  const [attMonth, setAttMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [attShift, setAttShift] = useState<'Day' | 'Night'>('Day');
  const [settingsTab, setSettingsTab] = useState<'brand' | 'contact' | 'costs' | 'integrations'>('brand');

  const alerts = getFarmAlerts();
  const alertDueCount = alerts.filter((a) => a.urgent || a.soon).length;

  const houses = getHouses();
  const myHouses = role === 'admin'
    ? houses
    : houses.filter((h) => (role === 'poulterer' ? h.poulterer === user.name : h.supervisor === user.name));

  const scopedRecords = role === 'admin'
    ? getRecords()
    : getRecords().filter((r) => myHouses.some((h) => h.id === r.house));

  const handleApproveRecord = (id: string) => {
    const list = getRecords();
    const target = list.find((r) => r.id === id);
    if (target) {
      target.status = 'Approved';
      target.approvedBy = user.name;
      saveRecords(list);
      submitToSheets('status', {
        ticket_number: id,
        customer_name: user.name,
        phone: '',
        product: 'Record Approved',
        quantity: 0,
        total: 0,
        notes: `Record ${id} approved by ${user.name}`,
        email: user.email,
        address: '',
        delivery_date: todayISO(),
        status: 'Approved'
      });
      onToast(`Record ${id} approved`, 'success');
    }
  };

  const handleRejectRecord = (id: string) => {
    const list = getRecords();
    const target = list.find((r) => r.id === id);
    if (target) {
      target.status = 'Rejected';
      saveRecords(list);
      onToast(`Record ${id} rejected`, 'warn');
    }
  };

  // Emergency Protocol Modal
  const openEmergencyModal = () => {
    onShowModal(
      '🚨 Urgent Farm Emergency Protocol',
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300 font-bold mb-4">
          Follow these steps immediately in case of an emergency (power failure, disease outbreak, extreme temperatures):
        </p>
        <div className="space-y-4">
          <div className="p-3 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <h3 className="font-bold text-red-700 dark:text-red-400">1. Power Failure / Temperature Drop</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              Start the backup generator immediately. Ensure charcoal braziers are lit in the brooder houses. Monitor temperature continuously.
            </p>
          </div>
          <div className="p-3 border border-orange-200 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
            <h3 className="font-bold text-orange-700 dark:text-orange-400">2. Sudden High Mortality</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              Isolate dead birds in sealed bags. Do not move birds between houses. Call the veterinary officer and farm manager immediately.
            </p>
          </div>
          <div className="p-3 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <h3 className="font-bold text-blue-700 dark:text-blue-400">3. Water Supply Failure</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              Check main borehole pump and reserve tanks. Switch to emergency reserve tanks if necessary. Ensure chicks are not without water for more than 30 minutes.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t dark:border-gray-700 mt-6">
          <button onClick={() => { onCloseModal(); openCall('Manager'); }} className="btn bg-red-600 hover:bg-red-700 text-white w-full justify-center">
            📞 Call Farm Manager
          </button>
          <button onClick={() => { onCloseModal(); openWhatsApp(); }} className="btn bg-[#25D366] hover:bg-[#1DA851] text-white w-full justify-center">
            💬 WhatsApp Team Group
          </button>
        </div>
      </div>,
      true
    );
  };

  // Submit Shift Record Modal
  const openNewRecordModal = () => {
    let houseId = myHouses[0]?.id || 'H1';
    let date = todayISO();
    let shift: 'Day' | 'Night' = 'Day';
    let feedBags = 0;
    let charcoal = 0;
    let mortality = 0;
    let slaughter = 0;
    let weightKg = 0;
    let medication = '';
    let notes = '';

    onShowModal(
      'New Shift Record',
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const rec: DailyRecord = {
            id: genId('REC'),
            date,
            house: houseId,
            site: myHouses.find((h) => h.id === houseId)?.site || 'misla',
            shift,
            supervisor: role === 'supervisor' ? user.name : (myHouses.find((h) => h.id === houseId)?.supervisor || ''),
            poulterer: role === 'poulterer' ? user.name : (myHouses.find((h) => h.id === houseId)?.poulterer || ''),
            feedBags,
            charcoal,
            mortality,
            slaughter,
            weightKg,
            medication,
            notes,
            status: 'Submitted',
            createdAt: new Date().toISOString()
          };

          const list = getRecords();
          list.unshift(rec);
          saveRecords(list);

          submitToSheets('record', {
            ticket_number: rec.id,
            customer_name: rec.poulterer || rec.supervisor || user.name,
            phone: user.phone || '',
            product: `Daily record — ${rec.house} (${rec.shift} shift)`,
            quantity: rec.feedBags,
            total: 0,
            notes: `Feed: ${rec.feedBags} bags | Charcoal: ${rec.charcoal} | Mortality: ${rec.mortality} | Slaughter: ${rec.slaughter} | Avg wt: ${rec.weightKg}kg | Meds: ${rec.medication || 'none'} | ${rec.notes}`,
            email: user.email || '',
            address: `${rec.house} · ${rec.shift}`,
            delivery_date: rec.date,
            status: rec.status,
            shift: rec.shift,
            feed: rec.feedBags,
            charcoal: rec.charcoal,
            mortality: rec.mortality,
            slaughter: rec.slaughter
          });

          onCloseModal();
          onToast(`${rec.house} ${shift} shift record submitted`, 'success');
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold mb-1">House</label>
            <select className="input" defaultValue={houseId} onChange={(e) => (houseId = e.target.value)}>
              {myHouses.map((h) => (
                <option key={h.id} value={h.id}>{h.id} — {num(h.birds)} birds</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Shift</label>
            <select className="input" defaultValue={shift} onChange={(e) => (shift = e.target.value as 'Day' | 'Night')}>
              <option value="Day">Day</option>
              <option value="Night">Night</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Date</label>
            <input className="input" type="date" defaultValue={date} onChange={(e) => (date = e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Feed bags used</label>
            <input className="input" type="number" min="0" defaultValue="0" onChange={(e) => (feedBags = parseInt(e.target.value, 10) || 0)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Charcoal (bags)</label>
            <input className="input" type="number" min="0" defaultValue="0" onChange={(e) => (charcoal = parseInt(e.target.value, 10) || 0)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Mortality</label>
            <input className="input" type="number" min="0" defaultValue="0" onChange={(e) => (mortality = parseInt(e.target.value, 10) || 0)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Slaughter</label>
            <input className="input" type="number" min="0" defaultValue="0" onChange={(e) => (slaughter = parseInt(e.target.value, 10) || 0)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Average weight (kg)</label>
            <input className="input" type="number" step="0.1" min="0" defaultValue="2.0" onChange={(e) => (weightKg = parseFloat(e.target.value) || 0)} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-bold mb-1">Medication / Vaccine notes</label>
            <input className="input" placeholder="e.g. Day 10 ND vaccine given" onChange={(e) => (medication = e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-bold mb-1">Shift Notes</label>
            <textarea className="input" rows={2} placeholder="Observations, temperature, ventilation..." onChange={(e) => (notes = e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary flex-1 justify-center">Submit Record</button>
          <button type="button" onClick={onCloseModal} className="btn btn-outline flex-1 justify-center">Cancel</button>
        </div>
      </form>
    );
  };

  const navSections = [
    { id: 'overview', label: 'Overview', emoji: '📊' },
    { id: 'houses', label: 'Houses H1-H7', emoji: '🏠' },
    { id: 'records', label: 'Shift Records', emoji: '📋' },
    { id: 'vaccination', label: 'Vaccination', emoji: '💉' },
    { id: 'calendar', label: 'Farm Calendar', emoji: '🗓️' },
    { id: 'attendance', label: 'Attendance', emoji: '📅' },
    { id: 'tasks', label: 'Tasks', emoji: '✅' },
    ...(role !== 'poulterer'
      ? [
          { id: 'staff', label: 'Team', emoji: '👥' },
          { id: 'inventory', label: 'Feed & Supplies', emoji: '📦' },
          { id: 'costs', label: 'Costs & Losses', emoji: '🧮' }
        ]
      : []),
    ...(role === 'admin'
      ? [
          { id: 'finance', label: 'Income & Expenses', emoji: '💰' },
          { id: 'settings', label: 'Settings', emoji: '⚙️' }
        ]
      : [])
  ];

  return (
    <div className="min-h-screen dash">
      {/* Mobile Drawer */}
      {sidebarOpen && (
        <>
          <aside className="sb fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0B6B3A] text-white p-4" style={{ width: '280px' }}>
            <div className="flex justify-between items-center mb-6">
              <div className="font-bold text-lg">Farmers Fresh</div>
              <button onClick={() => setSidebarOpen(false)} className="text-white text-xl">✕</button>
            </div>
            <nav className="flex-1 space-y-1">
              {navSections.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigateSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`sidebar-link ${section === item.id ? 'active' : ''}`}
                >
                  <span className="mr-2">{item.emoji}</span>
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="pt-4 border-t border-white/20">
              <button onClick={onLogout} className="btn btn-danger w-full justify-center text-xs">
                🚪 Sign Out
              </button>
            </div>
          </aside>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
        </>
      )}

      {/* Main Container */}
      <div className="min-h-screen mn">
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 px-4 md:px-6 py-2 flex justify-between items-center" style={{ minHeight: '52px' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 border rounded-lg text-[#0B6B3A] dark:text-white"
              aria-label="Open menu"
            >
              ☰
            </button>
            <h2 className="font-bold text-lg capitalize">{section.replace(/-/g, ' ')}</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onShowModal(
                  'Farm Notifications',
                  <div className="space-y-3">
                    {alerts.length ? (
                      alerts.slice(0, 8).map((a) => (
                        <div key={a.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                          <div>
                            <div className="font-bold text-sm">{a.title}</div>
                            <div className="text-xs text-gray-500">{a.desc} · {fmtDate(a.date)}</div>
                          </div>
                          <span className={`badge ${a.urgent ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {a.urgent ? 'Urgent' : 'Upcoming'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="ok">No urgent alerts.</div>
                    )}
                  </div>
                );
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative cursor-pointer"
            >
              🔔
              {alertDueCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {alertDueCount}
                </span>
              )}
            </button>

            <button onClick={onToggleDark} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              {dark ? '☀️' : '🌙'}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0B6B3A] text-white flex items-center justify-center font-bold text-xs">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold">{user.name}</div>
                <div className="text-[10px] text-gray-400 capitalize">{role}</div>
              </div>
            </div>

            <button onClick={onLogout} className="btn btn-outline text-xs" style={{ minHeight: '36px', padding: '0.4rem 0.8rem' }}>
              Exit
            </button>
          </div>
        </header>

        <main className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 animate-in" style={{ minHeight: 'calc(100vh - 60px)' }}>
          {section === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black">Welcome, {user.name} 👋</h1>
                  <p className="text-gray-500 text-sm">
                    {role === 'admin' ? 'Farm overview across Misla H1-H7, Makeni, Mboshya & Mungwi.' : `Assigned to ${myHouses.map((h) => h.id).join(', ')}.`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={openNewRecordModal} className="btn btn-primary justify-center">
                    📋 Submit Shift Record
                  </button>
                  <button onClick={() => openWhatsApp()} className="btn justify-center text-white" style={{ background: '#25D366' }}>
                    💬 WhatsApp
                  </button>
                </div>
              </div>

              {/* Stat Tiles */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div 
                  onClick={openEmergencyModal}
                  className="stat-card bg-red-50 dark:bg-red-900/20 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" 
                  style={{ borderLeft: '4px solid #EF4444' }}
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-red-500">Urgent</div>
                  <div className="text-xl font-black text-red-600 mt-1">🚨 Emergency Protocol</div>
                  <div className="text-xs text-red-400 mt-1">Tap for instructions</div>
                </div>

                <div className="stat-card bg-white dark:bg-gray-800" style={{ borderLeft: '4px solid #0B6B3A' }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Birds on feed</div>
                  <div className="text-2xl font-black text-[#0B6B3A] mt-1">{num(myHouses.reduce((a, h) => a + (Number(h.birds) || 0), 0))}</div>
                  <div className="text-xs text-gray-500 mt-1">{myHouses.length} house(s)</div>
                </div>

                <div className="stat-card bg-white dark:bg-gray-800" style={{ borderLeft: '4px solid #F5A623' }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Feed today</div>
                  <div className="text-2xl font-black text-[#F5A623] mt-1">
                    {num(shiftTotals(scopedRecords.filter((r) => r.date === todayISO())).Day.feed + shiftTotals(scopedRecords.filter((r) => r.date === todayISO())).Night.feed)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Bags (Day+Night)</div>
                </div>

                <div className="stat-card bg-white dark:bg-gray-800" style={{ borderLeft: '4px solid #EF4444' }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Mortality</div>
                  <div className="text-2xl font-black text-[#EF4444] mt-1">
                    {num(shiftTotals(scopedRecords.filter((r) => r.date === todayISO())).Day.mortality + shiftTotals(scopedRecords.filter((r) => r.date === todayISO())).Night.mortality)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Loss logged today</div>
                </div>

                <div className="stat-card bg-white dark:bg-gray-800" style={{ borderLeft: '4px solid #2ECC71' }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Slaughter</div>
                  <div className="text-2xl font-black text-[#2ECC71] mt-1">
                    {num(shiftTotals(scopedRecords.filter((r) => r.date === todayISO())).Day.slaughter + shiftTotals(scopedRecords.filter((r) => r.date === todayISO())).Night.slaughter)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Ready today</div>
                </div>
              </div>

              {/* Houses Grid */}
              <div className="card">
                <h3 className="font-bold text-lg mb-4">Houses Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myHouses.map((h) => {
                    const age = houseAge(h);
                    const left = Math.max(0, CYCLE_DAYS - age);
                    return (
                      <div key={h.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-lg">{h.id}</span>
                          <span className="badge bg-green-100 text-green-700">{h.status}</span>
                        </div>
                        <div className="text-sm text-gray-500">{num(h.birds)} birds · Day {age}/{CYCLE_DAYS}</div>
                        <div className="text-xs text-[#0B6B3A] font-bold mt-2">
                          {h.placed ? (left > 0 ? `Ready for sale in ${left} days` : 'Cycle Complete — Ready') : 'Empty'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shift Records Pending Approval (if Supervisor/Admin) */}
              {role !== 'poulterer' && (
                <div className="card">
                  <h3 className="font-bold text-lg mb-3">Shift Records for Review</h3>
                  {scopedRecords.filter((r) => r.status === 'Submitted').length ? (
                    <div className="space-y-2">
                      {scopedRecords.filter((r) => r.status === 'Submitted').map((r) => (
                        <div key={r.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700 flex justify-between items-center flex-wrap gap-2">
                          <div>
                            <div className="font-bold text-sm">{r.house} · {r.shift} Shift ({fmtDate(r.date)})</div>
                            <div className="text-xs text-gray-500">
                              Feed: {r.feedBags} | Charcoal: {r.charcoal} | Mortality: {r.mortality} | Slaughter: {r.slaughter}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleApproveRecord(r.id)} className="btn btn-accent text-xs">
                              ✓ Approve
                            </button>
                            <button onClick={() => handleRejectRecord(r.id)} className="btn btn-danger text-xs">
                              ✕ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">All shift records are approved.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {section === 'records' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <h1 className="text-2xl font-black">Day &amp; Night Shift Records</h1>
                <button onClick={openNewRecordModal} className="btn btn-primary justify-center">
                  + Log Shift Record
                </button>
              </div>

              <div className="card overflow-x-auto">
                <div className="flex gap-2 mb-4 flex-wrap">
                  {['all', 'Submitted', 'Approved', 'Rejected'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setRecordFilter(st)}
                      className={`tab-btn ${recordFilter === st ? 'active' : ''}`}
                    >
                      {st}
                    </button>
                  ))}
                  {['all', 'Day', 'Night'].map((sh) => (
                    <button
                      key={sh}
                      onClick={() => setRecordShift(sh)}
                      className={`tab-btn ${recordShift === sh ? 'active' : ''}`}
                    >
                      {sh === 'all' ? 'All Shifts' : `${sh} Shift`}
                    </button>
                  ))}
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>House</th>
                      <th>Shift</th>
                      <th>Poulterer</th>
                      <th>Feed (bags)</th>
                      <th>Charcoal</th>
                      <th>Mortality</th>
                      <th>Slaughter</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopedRecords
                      .filter((r) => (recordFilter === 'all' || r.status === recordFilter) && (recordShift === 'all' || r.shift === recordShift))
                      .map((r) => (
                        <tr key={r.id}>
                          <td>{fmtDate(r.date)}</td>
                          <td className="font-bold">{r.house}</td>
                          <td><span className="badge bg-blue-100 text-blue-700">{r.shift}</span></td>
                          <td>{r.poulterer || '—'}</td>
                          <td>{num(r.feedBags)}</td>
                          <td>{num(r.charcoal)}</td>
                          <td>{num(r.mortality)}</td>
                          <td>{num(r.slaughter)}</td>
                          <td><span className="badge bg-green-100 text-green-700">{r.status}</span></td>
                          <td>
                            {role !== 'poulterer' && r.status === 'Submitted' && (
                              <button onClick={() => handleApproveRecord(r.id)} className="btn btn-accent text-xs">
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {section === 'vaccination' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-black">Vaccination Schedule (Day 10, 14, 18)</h1>
              <div className="card overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>House</th>
                      <th>Vaccine Name</th>
                      <th>Day</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Given Date</th>
                      <th>Given By</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ensureVaccines().map((v) => (
                      <tr key={v.id}>
                        <td className="font-bold">{v.house}</td>
                        <td>{v.name}</td>
                        <td>Day {v.day}</td>
                        <td>{fmtDate(v.dueDate)}</td>
                        <td><span className={`badge ${v.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{v.status}</span></td>
                        <td>{v.givenDate ? fmtDate(v.givenDate) : '—'}</td>
                        <td>{v.givenBy || '—'}</td>
                        <td>
                          {v.status === 'Pending' && role !== 'poulterer' && (
                            <button
                              onClick={() => {
                                const list = ensureVaccines();
                                const it = list.find((item) => item.id === v.id);
                                if (it) {
                                  it.status = 'Done';
                                  it.givenDate = todayISO();
                                  it.givenBy = user.name;
                                  saveVaccines(list);
                                  onToast('Vaccine recorded as given', 'success');
                                }
                              }}
                              className="btn btn-primary text-xs"
                            >
                              Mark Done
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {section === 'costs' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-black">Costs &amp; Losses</h1>
              <div className="card">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {(() => {
                    const farm = calcFarm(myHouses);
                    return (
                      <>
                        <div className="stat-card bg-gray-50 dark:bg-gray-700">
                          <div className="text-xs text-gray-400">Total Feed Cost</div>
                          <div className="text-xl font-bold">{moneyShort(farm.feedCost)}</div>
                        </div>
                        <div className="stat-card bg-gray-50 dark:bg-gray-700">
                          <div className="text-xs text-gray-400">Charcoal Cost</div>
                          <div className="text-xl font-bold">{moneyShort(farm.charcoalCost)}</div>
                        </div>
                        <div className="stat-card bg-gray-50 dark:bg-gray-700">
                          <div className="text-xs text-gray-400">Mortality Loss</div>
                          <div className="text-xl font-bold text-red-600">{moneyShort(farm.mortalityLoss)}</div>
                        </div>
                        <div className="stat-card bg-gray-50 dark:bg-gray-700">
                          <div className="text-xs text-gray-400">Realised Sales</div>
                          <div className="text-xl font-bold text-green-600">{moneyShort(farm.revenue)}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {section === 'settings' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-black">Settings &amp; Integrations</h1>
              <div className="flex gap-2">
                {(['brand', 'contact', 'costs', 'integrations'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSettingsTab(tab)}
                    className={`tab-btn capitalize ${settingsTab === tab ? 'active' : ''}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {settingsTab === 'integrations' && (
                <div className="card space-y-4">
                  <h3 className="font-bold text-lg">Google Sheets Integration</h3>
                  <p className="text-sm text-gray-500">
                    Connect your Google Apps Script Web App URL to sync all daily shift records, customer orders, and staff updates directly into your Google Sheets spreadsheet.
                  </p>
                  <div>
                    <label className="block text-sm font-bold mb-1">Google Apps Script URL</label>
                    <input
                      className="input"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      defaultValue={getSettings().googleSheetsUrl}
                      onChange={(e) => {
                        const s = getSettings();
                        s.googleSheetsUrl = e.target.value.trim();
                        saveSettings(s);
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        submitToSheets('contact', {
                          ticket_number: 'TEST-' + Date.now(),
                          customer_name: 'Integration Test',
                          notes: 'Test ping from Farmers Fresh dashboard'
                        }, (res) => {
                          if (res?.success) onToast('Google Sheets connection successful!', 'success');
                          else onToast('Google Sheets ping error. Check Web App deployment.', 'error');
                        });
                      }}
                      className="btn btn-primary"
                    >
                      Test Connection
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {section === 'calendar' && <CalendarView />}
          {section === 'attendance' && <AttendanceView role={role} user={user} onToast={onToast} onShowModal={onShowModal} onCloseModal={onCloseModal} />}
          {section === 'tasks' && <TasksView role={role} user={user} onToast={onToast} />}

          {!['overview', 'records', 'vaccination', 'costs', 'settings', 'calendar', 'attendance', 'tasks'].includes(section) && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
              <div className="text-5xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Coming Soon</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">This internal module is currently under development.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
