import React, { useState, useEffect } from 'react';
import { UserAccount } from './types';
import { initAdmin } from './storage';
import { LoginPage, RegisterPage } from './components/AuthPages';
import { DashboardShell } from './components/Dashboard';

interface Toast {
  id: string;
  msg: string;
  type: 'success' | 'error' | 'warn' | 'info';
}

interface ModalState {
  title: string;
  content: React.ReactNode;
  wide?: boolean;
}

export default function App() {
  const [page, setPage] = useState<string>('login');
  const [user, setUser] = useState<UserAccount | null>(null);
  const [role, setRole] = useState<'admin' | 'supervisor' | 'poulterer'>('poulterer');
  const [dashboardSection, setDashboardSection] = useState<string>('overview');
  const [dark, setDark] = useState<boolean>(false);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    initAdmin();
  }, []);

  const addToast = (msg: string, type: 'success' | 'error' | 'warn' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const showModal = (title: string, content: React.ReactNode, wide: boolean = false) => {
    setModal({ title, content, wide });
  };

  const closeModal = () => {
    setModal(null);
  };

  const handleNavigate = (p: string) => {
    setPage(p);
    window.scrollTo(0, 0);
  };

  const handleLoginSuccess = (loggedInUser: UserAccount) => {
    setUser(loggedInUser);
    setRole(loggedInUser.role);
    setDashboardSection('overview');
    setPage('dashboard');
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    setUser(null);
    setPage('login');
    addToast('You have been signed out', 'info');
    window.scrollTo(0, 0);
  };

  return (
    <div className={`${dark ? 'dark' : ''} min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
      {page === 'dashboard' && user ? (
        <DashboardShell
          user={user}
          role={role}
          section={dashboardSection}
          onNavigateSection={(sec) => {
            setDashboardSection(sec);
            window.scrollTo(0, 0);
          }}
          onLogout={handleLogout}
          onToast={addToast}
          onShowModal={showModal}
          onCloseModal={closeModal}
          dark={dark}
          onToggleDark={() => setDark(!dark)}
        />
      ) : (
        <main>
          {page === 'login' && (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={handleNavigate}
              onToast={addToast}
              onShowModal={showModal}
              onCloseModal={closeModal}
            />
          )}
          {page === 'register' && (
            <RegisterPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={handleNavigate}
              onToast={addToast}
              onShowModal={showModal}
              onCloseModal={closeModal}
            />
          )}
        </main>
      )}

      {/* Modal Root */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className={`modal-box ${modal.wide ? 'max-w-4xl' : ''} animate-in`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
              <h3 className="text-lg font-bold">{modal.title}</h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <div className="p-5">{modal.content}</div>
          </div>
        </div>
      )}

      {/* Toasts Container */}
      <div className="fixed top-5 right-5 z-[200] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast pointer-events-auto ${
              t.type === 'success'
                ? 'bg-[#2ECC71]'
                : t.type === 'error'
                ? 'bg-red-500'
                : t.type === 'warn'
                ? 'bg-[#F5A623]'
                : 'bg-[#0B6B3A]'
            }`}
          >
            {t.type === 'success' ? '✓ ' : t.type === 'error' ? '✕ ' : t.type === 'warn' ? '! ' : 'i '}
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
