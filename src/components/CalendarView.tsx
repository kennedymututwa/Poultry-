import React, { useState } from 'react';
import { getFarmAlerts, fmtDate } from '../calc';
import { getStaff } from '../storage';
import { todayISO } from '../data';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const staff = getStaff();
  const alerts = getFarmAlerts();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const todayMonth = () => {
    const d = new Date();
    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  
  // Pad with empty cells for days before the 1st
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(new Date(year, month, d));
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Day / Night team rotation logic (simplistic)
  const dayStaff = staff.filter(s => s.shift === 'Day' && s.status !== 'On Leave');
  const nightStaff = staff.filter(s => s.shift === 'Night' && s.status !== 'On Leave');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">Calendar &amp; Shifts</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Farm events, rotations, and upcoming shifts.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="btn bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3">←</button>
          <button onClick={todayMonth} className="btn bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Today</button>
          <button onClick={nextMonth} className="btn bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3">→</button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-center mb-4">{monthName}</h2>
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {dayNames.map(d => (
            <div key={d} className="bg-gray-100 dark:bg-gray-800 text-center py-2 text-xs font-bold text-gray-500 uppercase">
              {d}
            </div>
          ))}

          {calendarCells.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="bg-white dark:bg-gray-900 min-h-[100px]" />;
            }
            const iso = date.toISOString().split('T')[0];
            const isToday = iso === todayISO();
            
            // Get events for this day
            const dayAlerts = alerts.filter(a => String(a.date) === iso);
            
            // Simple rotation: Week 1 & 3 (Day staff is Day, Night is Night)
            // Week 2 & 4 (Swap)
            // We can determine week of year
            const weekNum = Math.floor(date.getDate() / 7);
            const isSwapped = weekNum % 2 !== 0; // Simple alternating rotation
            
            const currentDayStaff = isSwapped ? nightStaff : dayStaff;
            const currentNightStaff = isSwapped ? dayStaff : nightStaff;

            return (
              <div key={iso} className={`bg-white dark:bg-gray-900 min-h-[120px] p-2 border-t border-gray-100 dark:border-gray-800 ${isToday ? 'ring-2 ring-inset ring-[#0B6B3A] bg-[#f0faf4] dark:bg-[#03291A]' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[#0B6B3A] text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {date.getDate()}
                  </span>
                </div>
                
                <div className="space-y-1 mt-2">
                  {dayAlerts.map(a => (
                    <div key={a.id} className={`text-[10px] leading-tight p-1 rounded font-medium ${a.type === 'vaccination' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
                      {a.type === 'vaccination' ? '💉' : '🛒'} {a.title}
                    </div>
                  ))}
                  
                  {/* Shift Teams */}
                  <div className="mt-2 text-xs text-gray-700 dark:text-gray-300 leading-tight">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">☀️ Day Shift ({currentDayStaff.length})</div>
                    <div className="truncate">{currentDayStaff.map(s => s.name.split(' ')[0]).join(', ')}</div>
                    
                    <div className="font-semibold text-gray-900 dark:text-gray-100 mt-1">🌙 Night Shift ({currentNightStaff.length})</div>
                    <div className="truncate">{currentNightStaff.map(s => s.name.split(' ')[0]).join(', ')}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
