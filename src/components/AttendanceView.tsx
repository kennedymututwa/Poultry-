import React, { useState } from 'react';
import { getStaff, getAttendance, saveAttendance, genId, submitToSheets } from '../storage';
import { attSummary, daysInMonth } from '../calc';
import { ATT_STATUS, SHIFTS } from '../data';
import { UserAccount } from '../types';

interface Props {
  role: string;
  user: UserAccount;
  onToast: (msg: string, type: 'success' | 'error') => void;
  onShowModal: (title: string, content: React.ReactNode) => void;
  onCloseModal: () => void;
}

export function AttendanceView({ role, user, onToast, onShowModal, onCloseModal }: Props) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [shift, setShift] = useState<'Day' | 'Night'>('Day');
  const [refresh, setRefresh] = useState(0);

  const staff = getStaff();
  const myStaff = role === 'poulterer' ? staff.filter(s => s.name === user.name) : staff;

  const days = daysInMonth(month);
  const summary = attSummary(month, shift);
  const allAtt = getAttendance();

  const handleOpenLogShift = () => {
    const ModalContent = () => {
      const d = new Date();
      const currentMonth = d.toISOString().slice(0, 7);
      const currentDay = d.getDate();
      const existing = allAtt.find(a => a.staffId === user.id && a.day === currentDay && a.month === currentMonth);
      
      const [startTime, setStartTime] = useState(existing?.startTime || '');
      const [endTime, setEndTime] = useState(existing?.endTime || '');
      
      const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const all = getAttendance();
        let found = all.find(a => a.staffId === user.id && a.day === currentDay && a.month === currentMonth);
        
        if (!found) {
          found = {
            id: genId('ATT'),
            staffId: user.id,
            day: currentDay,
            month: currentMonth,
            shift: user.shift as 'Day' | 'Night' || shift,
            status: 'Present',
            recordedBy: user.name,
            startTime,
            endTime
          };
          all.push(found);
        } else {
          found.startTime = startTime;
          found.endTime = endTime;
          found.status = 'Present';
        }
        
        saveAttendance(all);
        
        // Save to existing backend storage (Google Sheets) for admin review
        submitToSheets('log_shift', {
          staff_id: user.id,
          staff_name: user.name,
          date: `${currentMonth}-${String(currentDay).padStart(2, '0')}`,
          shift: user.shift || shift,
          start_time: startTime,
          end_time: endTime || 'Not recorded',
          status: 'Present'
        });

        setRefresh(prev => prev + 1);
        onToast('Shift logged successfully', 'success');
        onCloseModal();
      };
      
      return (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Log your start and end times for {currentMonth}-{String(currentDay).padStart(2, '0')}. This is required for supervisor tracking.
          </p>
          <div>
            <label className="block text-sm font-bold mb-1">Start Time</label>
            <input type="time" className="input w-full" value={startTime} onChange={e => setStartTime(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">End Time (Optional)</label>
            <input type="time" className="input w-full" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary w-full justify-center">Save Shift</button>
        </form>
      );
    };
    
    onShowModal('Log My Shift', <ModalContent />);
  };

  const cycleAttendance = (staffId: string, day: number) => {
    if (role === 'poulterer') {
      onToast('Only supervisors and managers can take attendance', 'error');
      return;
    }
    
    let found = allAtt.find(a => a.staffId === staffId && a.day === day && a.month === month && a.shift === shift);
    
    if (!found) {
      found = {
        id: genId('ATT'),
        staffId,
        day,
        month,
        shift,
        status: 'Present',
        recordedBy: user.name
      };
      allAtt.push(found);
    } else {
      const idx = ATT_STATUS.indexOf(found.status);
      found.status = ATT_STATUS[(idx + 1) % ATT_STATUS.length];
      found.recordedBy = user.name;
    }
    
    saveAttendance(allAtt);
    setRefresh(prev => prev + 1); // trigger re-render
  };

  const getStatus = (staffId: string, day: number) => {
    const found = allAtt.find(a => a.staffId === staffId && a.day === day && a.month === month && a.shift === shift);
    return found ? found.status : '-';
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'Absent': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'Half Day': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'Leave': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Off': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      default: return 'bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-600 border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer';
    }
  };

  const statusChar = (status: string) => {
    switch (status) {
      case 'Present': return '✓';
      case 'Absent': return '✕';
      case 'Half Day': return '½';
      case 'Leave': return 'L';
      case 'Off': return 'O';
      default: return '-';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Attendance Register</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Track team presence, leave, and absences.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {role !== 'poulterer' && (
            <button 
              onClick={handleOpenLogShift}
              className="btn bg-[#0B6B3A] hover:bg-[#084F2A] text-white w-full sm:w-auto px-4 shadow-md"
            >
              ⏱️ Log My Shift
            </button>
          )}
          <input 
            type="month" 
            className="input w-full sm:w-auto" 
            value={month} 
            onChange={(e) => setMonth(e.target.value)} 
          />
          <select 
            className="input w-full sm:w-auto" 
            value={shift} 
            onChange={(e) => setShift(e.target.value as 'Day' | 'Night')}
          >
            {SHIFTS.map(s => <option key={s} value={s}>{s} Shift</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {ATT_STATUS.map(st => (
          <div key={st} className="card p-3 text-center">
            <div className="text-sm font-bold text-gray-700 dark:text-gray-300">{st}</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{summary[st] || 0}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="p-2 min-w-[150px] sticky left-0 bg-white dark:bg-gray-800 shadow-[1px_0_0_0_rgba(0,0,0,0.1)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.1)] z-10 text-gray-800 dark:text-gray-200">Staff Member</th>
              {Array.from({ length: days }, (_, i) => i + 1).map(d => (
                <th key={d} className="p-2 min-w-[40px] text-center text-gray-600 dark:text-gray-400 font-medium border-l dark:border-gray-700">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myStaff.filter(s => s.shift === shift).map(member => (
              <tr key={member.id} className="border-b dark:border-gray-700">
                <td className="p-2 sticky left-0 bg-white dark:bg-gray-800 shadow-[1px_0_0_0_rgba(0,0,0,0.1)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.1)] z-10 font-medium text-gray-900 dark:text-gray-100">
                  {member.name}
                  <div className="text-[10px] text-gray-500">{member.role}</div>
                </td>
                {Array.from({ length: days }, (_, i) => i + 1).map(d => {
                  const st = getStatus(member.id, d);
                  return (
                    <td key={d} className="p-1 border-l dark:border-gray-700 text-center">
                      <button 
                        onClick={() => cycleAttendance(member.id, d)}
                        className={`w-8 h-8 rounded border flex items-center justify-center mx-auto text-xs font-bold transition ${statusColor(st)}`}
                        title={st === '-' ? 'Mark Attendance' : st}
                      >
                        {statusChar(st)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
            {myStaff.filter(s => s.shift === shift).length === 0 && (
              <tr>
                <td colSpan={days + 1} className="p-8 text-center text-gray-600 dark:text-gray-400">
                  No staff members assigned to this shift.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {role !== 'poulterer' && (
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 flex items-start gap-3">
          <div className="text-xl">💡</div>
          <div>
            <strong>How to use:</strong> Click on any empty square (-) to mark an employee as <strong>Present</strong>. Click again to cycle through <strong>Absent</strong>, <strong>Half Day</strong>, <strong>Leave</strong>, and <strong>Off</strong>. The records are saved automatically.
          </div>
        </div>
      )}
    </div>
  );
}
