import React, { useState } from 'react';
import { BRAND, HOUSES, SITES, todayISO } from '../data';
import { genCode, genId, getUsers, hashPw, initAdmin, lsRemove, lsSet, saveUsers, submitToSheets, tryParse } from '../storage';
import { UserAccount } from '../types';
import { LOGO_SVG } from './PublicPages';

interface AuthProps {
  onLoginSuccess: (user: UserAccount) => void;
  onNavigate: (p: string) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'warn' | 'info') => void;
  onShowModal: (title: string, content: React.ReactNode) => void;
  onCloseModal: () => void;
}

export function LoginPage({ onLoginSuccess, onNavigate, onToast }: AuthProps) {
  const [tab, setTab] = useState<'poulterer' | 'staff'>('poulterer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    initAdmin();
    setLoading(true);

    setTimeout(() => {
      const users = getUsers();
      let user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

      // Admin fallback
      if (!user && email.trim().toLowerCase() === BRAND.adminEmail.toLowerCase() && password === BRAND.adminPassword) {
        user = {
          id: 'USR-ADMIN-001',
          email: BRAND.adminEmail,
          password: hashPw(BRAND.adminPassword),
          role: 'admin',
          name: 'Farm Administrator',
          phone: BRAND.phone,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        users.push(user);
        saveUsers(users);
      }

      setLoading(false);

      if (!user) {
        onToast('No account found with this email', 'error');
        return;
      }
      if (user.password !== hashPw(password)) {
        onToast('Incorrect password', 'error');
        return;
      }
      if (user.status === 'suspended') {
        onToast('Account suspended', 'error');
        return;
      }

      onLoginSuccess(user);
      onToast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B6B3A] via-[#084F2A] to-[#03291A] px-4 py-8">
      <div className="w-full max-w-md md:max-w-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 p-2 border-4 border-[#F5A623] shadow-xl">
            {LOGO_SVG}
          </div>
          <h1 className="text-3xl font-black text-white">Welcome Back</h1>
          <p className="text-gray-300 mt-1">Sign in to the {BRAND.short} farm portal</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Sign in as</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTab('poulterer')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm cursor-pointer ${
                    tab === 'poulterer'
                      ? 'border-[#0B6B3A] bg-[#E8F5EE] dark:bg-gray-700 text-[#0B6B3A]'
                      : 'border-gray-200 dark:border-gray-600 text-gray-500'
                  }`}
                >
                  🐔 Poulterer
                </button>
                <button
                  type="button"
                  onClick={() => setTab('staff')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm cursor-pointer ${
                    tab === 'staff'
                      ? 'border-[#0B6B3A] bg-[#E8F5EE] dark:bg-gray-700 text-[#0B6B3A]'
                      : 'border-gray-200 dark:border-gray-600 text-gray-500'
                  }`}
                >
                  🧑‍💼 Supervisor / Admin
                </button>
              </div>
            </div>

            <div className="hint">
              {tab === 'poulterer'
                ? '🐔 Poulterer Login: Submit your shift records (feed, charcoal, mortality) and view your assigned houses.'
                : '🧑‍💼 Supervisor / Admin Login: Approve records, inspect houses H1-H7, manage vaccination schedules and stock.'}
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Email Address</label>
              <input
                className="input"
                placeholder="you@farmersfresh.co.zm"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Password</label>
              <input
                className="input"
                placeholder="Enter password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-3 text-base">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <button onClick={() => onNavigate('register')} className="text-[#0B6B3A] font-bold hover:underline cursor-pointer">
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage({ onLoginSuccess, onNavigate, onToast, onShowModal, onCloseModal }: AuthProps) {
  const [role, setRole] = useState<'poulterer' | 'supervisor'>('poulterer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [house, setHouse] = useState('H1');
  const [site, setSite] = useState('misla');
  const [shift, setShift] = useState('Day');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      onToast('Please fill all required fields', 'error');
      return;
    }
    if (password !== confirmPassword) {
      onToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 8) {
      onToast('Password must be at least 8 characters', 'error');
      return;
    }

    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      onToast('An account with this email already exists', 'error');
      return;
    }

    const newUser: UserAccount = {
      id: genId('USR'),
      email: email.trim().toLowerCase(),
      password: hashPw(password),
      role,
      name: name.trim(),
      phone: phone.trim(),
      house,
      site,
      shift,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    submitToSheets('register', {
      ticket_number: genId('FF-REG'),
      customer_name: newUser.name,
      phone: newUser.phone,
      product: `New ${newUser.role} account`,
      quantity: 1,
      total: 0,
      notes: `House: ${newUser.house} | Shift: ${newUser.shift}`,
      email: newUser.email,
      address: newUser.house,
      delivery_date: todayISO(),
      status: 'Active'
    });

    onLoginSuccess(newUser);
    onToast(`Welcome to Farmers Fresh, ${newUser.name}!`, 'success');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B6B3A] via-[#084F2A] to-[#03291A] px-4 py-8">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 p-1 border-4 border-[#F5A623]">
            {LOGO_SVG}
          </div>
          <h1 className="text-2xl font-black text-white">Create Staff Account</h1>
          <p className="text-gray-300 mt-1">Join {BRAND.short} — houses H1 to H7, supervisors &amp; poulterers</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">I am a... <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('poulterer')}
                  className={`p-4 border-2 rounded-xl text-center transition cursor-pointer ${
                    role === 'poulterer' ? 'border-[#F5A623] bg-[#E8F5EE] dark:bg-gray-700' : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="text-3xl mb-1">🐔</div>
                  <div className="font-bold text-sm">Poulterer</div>
                  <div className="text-xs text-gray-400">Record daily data</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('supervisor')}
                  className={`p-4 border-2 rounded-xl text-center transition cursor-pointer ${
                    role === 'supervisor' ? 'border-[#F5A623] bg-[#E8F5EE] dark:bg-gray-700' : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="text-3xl mb-1">🧑‍💼</div>
                  <div className="font-bold text-sm">Supervisor</div>
                  <div className="text-xs text-gray-400">Manage &amp; approve</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Full Name <span className="text-red-500">*</span></label>
              <input className="input" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Email Address <span className="text-red-500">*</span></label>
              <input className="input" placeholder="your@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Phone Number <span className="text-red-500">*</span></label>
              <input className="input" placeholder="+260 97X XXX XXX" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-1">Assigned House</label>
                <select className="input" value={house} onChange={(e) => setHouse(e.target.value)}>
                  {HOUSES.map((h) => (
                    <option key={h.id} value={h.id}>{h.id} — {h.type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Shift</label>
                <select className="input" value={shift} onChange={(e) => setShift(e.target.value)}>
                  <option value="Day">Day</option>
                  <option value="Night">Night</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Password <span className="text-red-500">*</span></label>
              <input className="input" placeholder="Min 8 characters" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Confirm Password <span className="text-red-500">*</span></label>
              <input className="input" placeholder="Repeat password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-secondary w-full justify-center py-3">
              👤+ Create Account
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <button onClick={() => onNavigate('login')} className="text-[#0B6B3A] font-bold hover:underline cursor-pointer">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
