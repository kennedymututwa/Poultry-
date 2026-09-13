import React, { useState } from 'react';
import { getTasks, saveTasks, genId } from '../storage';
import { TaskItem, UserAccount } from '../types';

interface Props {
  role: string;
  user: UserAccount;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

export function TasksView({ role, user, onToast }: Props) {
  const [tasks, setTasks] = useState<TaskItem[]>(() => getTasks());
  const [newTask, setNewTask] = useState('');
  
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const t: TaskItem = {
      id: genId('TSK'),
      house: 'H1', // Default or make selectable
      title: newTask.trim(),
      assignedTo: role === 'poulterer' ? user.name : 'All Staff',
      due: new Date().toISOString().split('T')[0],
      status: 'Pending',
      createdBy: user.name
    };
    
    const updated = [t, ...tasks];
    setTasks(updated);
    saveTasks(updated);
    setNewTask('');
    onToast('Task added successfully', 'success');
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'Done' ? 'Pending' : 'Done' };
      }
      return t;
    });
    setTasks(updated);
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    saveTasks(updated);
    onToast('Task removed', 'success');
  };

  const myTasks = role === 'poulterer' 
    ? tasks.filter(t => t.assignedTo === user.name || t.assignedTo === 'All Staff')
    : tasks;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">Daily Tasks</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Track house maintenance, feeding routines, and chores.</p>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={addTask} className="flex gap-2 mb-6">
          <input 
            type="text" 
            className="input flex-1" 
            placeholder="Add a new task..." 
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
          />
          <button type="submit" className="btn btn-primary px-6 shrink-0">Add Task</button>
        </form>

        <div className="space-y-2">
          {myTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tasks assigned.</div>
          ) : (
            myTasks.map(t => (
              <div 
                key={t.id} 
                className={`flex items-center justify-between p-3 border rounded-xl transition ${t.status === 'Done' ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <button 
                    onClick={() => toggleTask(t.id)}
                    className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                      t.status === 'Done' 
                        ? 'bg-[#0B6B3A] border-[#0B6B3A] text-white' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-[#0B6B3A]'
                    }`}
                  >
                    {t.status === 'Done' && <span className="text-sm">✓</span>}
                  </button>
                  <div className={`truncate ${t.status === 'Done' ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-gray-200 font-medium'}`}>
                    {t.title}
                    {role !== 'poulterer' && (
                      <span className="ml-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full not-line-through">
                        {t.assignedTo}
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => deleteTask(t.id)}
                  className="text-gray-400 hover:text-red-500 p-2"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
