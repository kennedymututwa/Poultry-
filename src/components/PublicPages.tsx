import React, { useState } from 'react';
import { BRAND, CYCLE_DAYS, DELIVERY_SLOTS, ORDER_FLOW, ORDER_SIZES, PRODUCTS, SITES } from '../data';
import { getAdminContact, openCall, openEmail, openMaps, openWhatsApp } from '../contact';
import { fmtDate, houseAge, money, moneyShort, num, siteName } from '../calc';
import { CustomerOrder, House } from '../types';
import { getHouses, getMessages, getOrders, getSettings, makeTicket, saveMessages, saveOrders, submitToSheets } from '../storage';

export const LOGO_SVG = (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
    <circle cx="32" cy="32" r="30" fill="#0B6B3A" />
    <circle cx="32" cy="32" r="30" fill="none" stroke="#F5A623" strokeWidth="3" />
    <path d="M32 12c6 0 10 4 10 9 0 3-1 5-3 7l3 4c3 4 5 8 6 12h-9l-3-11-3 11h-9c1-4 3-8 6-12l3-4c-2-2-3-4-3-7 0-5 4-9 10-9z" fill="#F5A623" />
    <path d="M22 55c1-5 5-8 10-8s9 3 10 8z" fill="#fff" />
    <circle cx="38" cy="19" r="1.6" fill="#0B6B3A" />
    <path d="M20 22l-5-3M48 22l5-3" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

interface PublicPagesProps {
  page: string;
  onNavigate: (p: string) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'warn' | 'info') => void;
  onShowModal: (title: string, content: React.ReactNode) => void;
  onCloseModal: () => void;
  selectedProductId?: string;
}

export function PublicHeader({ page, onNavigate }: { page: string; onNavigate: (p: string) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const ac = getAdminContact();
  const navPages = [
    { id: 'home', label: 'Home' },
    { id: 'houses', label: 'Sites & Houses' },
    { id: 'products', label: 'Products' },
    { id: 'order', label: 'Place Order' },
    { id: 'track', label: 'Track Order' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-[#0B6B3A] shadow-lg py-3">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate('home')}
            role="button"
            tabIndex={0}
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1 border-2 border-[#F5A623] shadow-lg overflow-hidden">
              {LOGO_SVG}
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black leading-none text-white tracking-wide uppercase">Farmers Fresh</span>
              <span className="text-[10px] font-bold tracking-widest text-[#F5BC43] uppercase mt-0.5">Poultry Farm</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main navigation">
            <ul className="flex items-center space-x-1" role="menubar">
              {navPages.map((item) => (
                <li key={item.id} role="none">
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`inline-block px-3 py-2 rounded-full font-bold text-sm uppercase tracking-wider transition-all cursor-pointer ${
                      page === item.id ? 'bg-[#F5A623] text-[#03291A]' : 'text-white hover:text-[#F5BC43]'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={ac.telLink}
              onClick={(e) => {
                e.preventDefault();
                openCall();
              }}
              className="hidden lg:flex items-center gap-1.5 text-white font-bold text-xs hover:text-[#F5BC43] cursor-pointer"
              aria-label={`Call ${ac.phone}`}
            >
              📞 {ac.phone}
            </a>
            <button
              onClick={() => onNavigate('login')}
              className="hidden lg:block text-white hover:text-[#F5BC43] font-bold text-sm uppercase cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => onNavigate('order')}
              className="hidden lg:block bg-[#F5A623] text-[#03291A] hover:bg-[#D08E1C] font-bold px-5 py-2 rounded-full text-sm cursor-pointer"
            >
              Order Now
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white text-2xl"
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <nav className="fixed inset-0 z-40 bg-[#0B6B3A] pt-24 px-6 pb-6 overflow-y-auto" aria-label="Mobile navigation">
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,.25)',
              border: '2px solid rgba(255,255,255,.5)',
              color: '#fff',
              fontSize: '22px',
              padding: '10px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              minWidth: '44px',
              minHeight: '44px'
            }}
            aria-label="Close menu"
          >
            ✕
          </button>
          <ul className="flex flex-col space-y-2">
            {navPages.concat([
              { id: 'login', label: 'Staff Login' },
              { id: 'register', label: 'Create Account' }
            ]).map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate(item.id);
                  }}
                  className="block w-full text-left text-xl font-bold py-4 border-b border-white/20 text-white cursor-pointer"
                >
                  {item.label}
                </button>
              </li>
            ))}
            <li style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <a
                href={ac.waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  openWhatsApp();
                }}
                style={{
                  flex: 1,
                  background: '#25D366',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                💬 WhatsApp
              </a>
              <a
                href={ac.telLink}
                onClick={(e) => {
                  e.preventDefault();
                  openCall();
                }}
                style={{
                  flex: 1,
                  background: '#03291A',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                📞 Call Us
              </a>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}

export function FloatingContactButtons() {
  const ac = getAdminContact();
  return (
    <>
      <div style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <a
          href={ac.telLink}
          onClick={(e) => {
            e.preventDefault();
            openCall();
          }}
          style={{
            position: 'relative',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#0B6B3A',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#fff',
            textDecoration: 'none'
          }}
          aria-label={`Call ${ac.phone}`}
        >
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
              background: '#0B6B3A',
              opacity: 0.35
            }}
          />
          📞
        </a>
        <div className="hidden md:block" style={{ background: 'rgba(255,255,255,0.95)', padding: '6px 10px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F5A623', lineHeight: 1 }}>Call Us</div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#0B6B3A', marginTop: '2px', fontFamily: 'monospace' }}>{ac.phone}</div>
        </div>
      </div>

      <a
        href={ac.waLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          openWhatsApp();
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#25D366',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '26px',
          color: '#fff',
          textDecoration: 'none'
        }}
        aria-label="Chat on WhatsApp"
      >
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
            background: '#25D366',
            opacity: 0.25
          }}
        />
        💬
      </a>
    </>
  );
}

export function ContactButtonsComponent({ size }: { size?: 'sm' | 'lg' }) {
  const ac = getAdminContact();
  const big = size === 'lg';
  const pad = big ? 'py-3 px-5 text-sm' : 'py-2.5 px-4 text-xs';

  return (
    <div className="flex gap-2">
      <a
        href={ac.waLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          openWhatsApp();
        }}
        className={`flex-1 flex items-center justify-center gap-2 ${pad} rounded-xl font-bold text-white transition-all hover:scale-105`}
        style={{ background: '#25D366', textDecoration: 'none' }}
        aria-label={`Chat on WhatsApp ${ac.phone}`}
      >
        <span>💬 WhatsApp</span>
      </a>
      <a
        href={ac.telLink}
        onClick={(e) => {
          e.preventDefault();
          openCall();
        }}
        className={`flex-1 flex items-center justify-center gap-2 ${pad} rounded-xl font-bold text-white transition-all hover:scale-105`}
        style={{ background: '#0B6B3A', textDecoration: 'none' }}
        aria-label={`Call ${ac.phone}`}
      >
        <span>📞 {big ? 'Call Us Now' : 'Call Now'}</span>
      </a>
      <a
        href={ac.mailLink}
        onClick={(e) => {
          e.preventDefault();
          openEmail();
        }}
        className={`flex-1 flex items-center justify-center gap-2 ${pad} rounded-xl font-bold text-white transition-all hover:scale-105`}
        style={{ background: '#EA4335', textDecoration: 'none' }}
        aria-label={`Email ${ac.email}`}
      >
        <span>✉️ {big ? 'Email Us' : 'Email'}</span>
      </a>
    </div>
  );
}

export function PublicFooter({ onNavigate }: { onNavigate: (p: string) => void }) {
  const ac = getAdminContact();
  const houses = getHouses();
  const s = getSettings();

  return (
    <footer className="bg-[#03291A] text-gray-300 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1 border-2 border-[#F5A623]">
              {LOGO_SVG}
            </div>
            <div>
              <div className="text-white font-black uppercase tracking-wide">{BRAND.short}</div>
              <div className="text-[10px] text-[#F5BC43] uppercase tracking-widest">{BRAND.sub}</div>
            </div>
          </div>
          <p className="text-sm">{BRAND.tagline}. Poultry farming done properly in {BRAND.city}.</p>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-[#F5BC43]">Our Houses</h4>
          <ul className="space-y-2 text-sm">
            {houses.map((h) => (
              <li key={h.id}>
                <button onClick={() => onNavigate('houses')} className="hover:text-white cursor-pointer text-left">
                  {h.id} — {h.type}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-[#F5BC43]">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[
              { id: 'home', label: 'Home' },
              { id: 'houses', label: 'Sites & Houses' },
              { id: 'products', label: 'Products' },
              { id: 'order', label: 'Place Order' },
              { id: 'track', label: 'Track Order' },
              { id: 'contact', label: 'Contact' },
              { id: 'login', label: 'Staff Login' }
            ].map((p) => (
              <li key={p.id}>
                <button onClick={() => onNavigate(p.id)} className="hover:text-white cursor-pointer text-left">
                  {p.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-[#F5BC43]">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>{ac.name}</li>
            <li>📍 {s.address || BRAND.address}</li>
            <li>
              <a href={ac.telLink} onClick={(e) => { e.preventDefault(); openCall(); }} className="hover:underline">
                📞 {ac.phone} (CEO {s.ceo || BRAND.ceo})
              </a>
            </li>
            {ac.phone2 && (
              <li>
                <a href={`tel:+${ac.phone2.replace(/[^0-9]/g, '')}`} className="hover:underline">
                  📞 {ac.phone2}
                </a>
              </li>
            )}
            <li>
              <a href={ac.mailLink} onClick={(e) => { e.preventDefault(); openEmail(); }} className="hover:underline">
                ✉️ {ac.email}
              </a>
            </li>
            <li>🕠 {BRAND.hours}</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 border-t border-white/10 mt-8 pt-6 text-sm text-center">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved. {BRAND.tagline}.
      </div>
    </footer>
  );
}

export function HomePage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const houses = getHouses();
  const totalBirds = houses.reduce((a, h) => a + (Number(h.birds) || 0), 0);

  return (
    <>
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0B6B3A]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B6B3A] via-[#0B6B3A]/90 to-transparent z-0" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-2xl">
            <span className="inline-block bg-[#F5A623] text-[#03291A] font-bold px-4 py-1.5 rounded-full text-sm mb-6">
              🐔 One of Lusaka's leading chicken suppliers
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              Quality Chicken for <span className="text-[#F5BC43]">Supermarkets &amp; Malls</span>
            </h1>
            <p className="text-lg text-gray-200 mb-8 max-w-xl">
              {num(totalBirds)} broilers growing right now across houses H1 to H7 at our Misla site — supplied from Mungwi Road, Makeni, Mboshya and Misla, and delivered fresh on a 35-day cycle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onNavigate('order')}
                className="bg-[#F5A623] text-[#03291A] font-bold px-8 py-4 rounded-full shadow-lg hover:bg-[#D08E1C] transition text-lg cursor-pointer"
              >
                Place an Order →
              </button>
              <button
                onClick={() => onNavigate('houses')}
                className="border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white hover:text-[#0B6B3A] transition text-lg cursor-pointer"
              >
                Tour Our Houses
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              {[
                [`${num(totalBirds)}`, 'Broilers on feed'],
                ['H1-H7', 'Houses at Misla'],
                ['35', 'Days to maturity'],
                ['4', 'Sites: Misla, Makeni, Mboshya, Mungwi']
              ].map((st, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-4">
                  <div className="text-2xl font-black text-[#F5BC43]">{st[0]}</div>
                  <div className="text-xs text-gray-200 uppercase tracking-wider">{st[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-[#F5A623] font-bold uppercase tracking-widest text-sm">Our houses</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2">Seven Houses, One Standard</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Each house is assigned a poulterer and a supervisor. Every house produces a daily record: feed, charcoal, mortality and slaughter.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {houses.map((h) => (
              <div key={h.id} className="card text-center hover:shadow-lg transition">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#0B6B3A] text-white font-black flex items-center justify-center">
                  {h.id}
                </div>
                <div className="font-bold text-sm">{h.type}</div>
                <div className="text-xs text-gray-500">{num(h.birds)} birds</div>
                <div className="text-[10px] text-gray-400 mt-1">
                  {h.status === 'Active' ? `Day ${houseAge(h)}` : h.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-[#F5A623] font-bold uppercase tracking-widest text-sm">Why Farmers Fresh</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2 mb-4">Farmed properly, recorded every shift.</h2>
            <p className="text-gray-500 mb-6">
              Every house is recorded twice a day — a <strong>day shift</strong> and a <strong>night shift</strong> entry covering feed bags, charcoal, mortality and slaughter. Vaccination is locked to day 10, day 14 and day 18. That discipline is why supermarkets trust our volumes.
            </p>
            <div className="space-y-3">
              {[
                ['📋', 'Day & night shift records: feed bags, charcoal, mortality, slaughter'],
                ['🧑‍💼', 'Supervisors are the mouthpiece — they approve every record'],
                ['💉', 'Vaccination locked to day 10, day 14 and day 18 per flock'],
                ['🚚', 'Deliveries to supermarkets & malls across Lusaka, 6 days a week']
              ].map((f, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                  <span className="text-2xl">{f[0]}</span>
                  <span className="font-medium text-sm">{f[1]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="font-bold text-lg mb-4">How ordering works</h3>
            <div className="space-y-4">
              {[
                ['1', 'Choose your product and quantity', 'See your price instantly'],
                ['2', 'We confirm availability by phone', 'Within 2 working hours'],
                ['3', 'Your order is packed fresh', 'Quality checked before it leaves'],
                ['4', 'Track the order online', 'Use your order number any time']
              ].map((st, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#0B6B3A] text-white font-black flex items-center justify-center flex-shrink-0">
                    {st[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{st[1]}</div>
                    <div className="text-xs text-gray-500">{st[2]}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate('order')} className="btn btn-primary w-full justify-center mt-6 py-3">
              Start Ordering →
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0B6B3A] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-3">Fresh from our houses to your table.</h2>
          <p className="text-gray-200 mb-8">Order on WhatsApp for the fastest response, or place a full order online in under a minute.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => openWhatsApp()}
              className="font-bold px-8 py-4 rounded-full text-lg cursor-pointer"
              style={{ background: '#25D366', color: '#fff', border: 'none' }}
            >
              💬 WhatsApp Us
            </button>
            <button
              onClick={() => openCall()}
              className="bg-[#F5A623] text-[#03291A] font-bold px-8 py-4 rounded-full text-lg cursor-pointer border-none"
            >
              📞 Call the Farm
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export function HousesPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const houses = getHouses();

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-[#F5A623] font-bold uppercase tracking-widest text-sm">Our sites</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2">Misla, Makeni, Mboshya &amp; Mungwi Road</h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Our main broiler site is <strong>Misla</strong>, next to Tiger Company along Mumbwa Road, running seven houses H1 to H7.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {SITES.map((st) => {
            const hs = houses.filter((h) => h.site === st.id);
            const birds = hs.reduce((a, h) => a + (Number(h.birds) || 0), 0);
            return (
              <div key={st.id} className="card text-center hover:shadow-lg transition" style={{ borderLeft: '4px solid #0B6B3A' }}>
                <div className="text-3xl mb-2">📍</div>
                <div className="font-black text-lg">{st.name}</div>
                <div className="text-xs text-gray-500 mb-3">{st.area}</div>
                <div className="text-sm">
                  <strong>{hs.length}</strong> house(s) · <strong>{num(birds)}</strong> birds
                </div>
                <div className="text-[10px] text-gray-400 mt-1">{st.role}</div>
              </div>
            );
          })}
        </div>

        <div className="text-center mb-8">
          <span className="text-[#F5A623] font-bold uppercase tracking-widest text-sm">Misla houses</span>
          <h2 className="text-3xl font-black mt-2">H1 - H7 · Broilers on a 35-day cycle</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((h) => {
            const age = houseAge(h);
            const left = Math.max(0, CYCLE_DAYS - age);
            const prog = Math.min(100, Math.round((age / CYCLE_DAYS) * 100));

            return (
              <div key={h.id} className="card hover:shadow-xl transition" style={{ borderTop: '4px solid #0B6B3A' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-14 h-14 rounded-full bg-[#0B6B3A] text-white font-black flex items-center justify-center text-lg">
                    {h.id}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 uppercase tracking-wider">{h.type}</div>
                    <span className="badge bg-green-100 text-green-700">{h.status}</span>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{h.name}</h3>
                <div className="text-sm text-gray-500 mb-3">
                  {num(h.birds)} of {num(h.capacity)} birds · Day {age} of {CYCLE_DAYS}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div style={{ width: `${prog}%`, background: '#0B6B3A', height: '8px', borderRadius: '9999px' }} />
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  {h.placed ? (left > 0 ? `Ready for sale in ${left} day(s)` : 'Ready for sale — cycle complete') : 'Not yet placed'}
                </div>
                <div className="bg-[#E8F5EE] dark:bg-gray-700 rounded-lg p-3 text-xs space-y-1">
                  <div><strong className="text-[#0B6B3A]">Supervisor:</strong> {h.supervisor || 'Unassigned'}</div>
                  <div><strong className="text-[#0B6B3A]">Poulterer:</strong> {h.poulterer || 'Unassigned'}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 md:p-8 text-center">
          <h3 className="font-bold text-xl mb-2">Stock Farmers Fresh in your store?</h3>
          <p className="text-gray-500 mb-4">
            We supply supermarkets, shopping malls, butcheries and households across Lusaka with consistent weekly volumes of broilers, manure, maize, lemons and oranges.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => onNavigate('contact')} className="btn btn-primary justify-center">
              Request wholesale pricing
            </button>
            <button onClick={() => openWhatsApp()} className="btn justify-center text-white" style={{ background: '#25D366' }}>
              💬 Chat to sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductsPage({ onSelectProduct }: { onSelectProduct: (id: string) => void }) {
  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-[#F5A623] font-bold uppercase tracking-widest text-sm">What we sell</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2">Products &amp; Pricing</h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Guide prices. Bigger volumes get better rates — your final price is confirmed by phone.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((pr) => (
            <div key={pr.id} className="card hover:shadow-xl transition" style={{ borderTop: '4px solid #0B6B3A' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{pr.emoji}</div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">From</div>
                  <div className="text-xl font-black text-[#0B6B3A]">{moneyShort(pr.unit)}</div>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">{pr.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{pr.desc}</p>
              <div className="bg-[#E8F5EE] dark:bg-gray-700 rounded-lg p-3 text-xs mb-4">
                <strong className="text-[#0B6B3A]">Includes:</strong> {pr.includes}
              </div>
              <button onClick={() => onSelectProduct(pr.id)} className="btn btn-primary w-full justify-center">
                Order This →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OrderPage({
  initialProduct,
  onNavigate,
  onToast,
  onShowModal,
  onCloseModal
}: {
  initialProduct?: string;
  onNavigate: (p: string) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'warn' | 'info') => void;
  onShowModal: (title: string, content: React.ReactNode) => void;
  onCloseModal: () => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [productId, setProductId] = useState(initialProduct || 'broiler');
  const [sizeId, setSizeId] = useState('s1');
  const [qty, setQty] = useState(1);
  const [slot, setSlot] = useState(DELIVERY_SLOTS[0]);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedPr = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];
  const selectedSz = ORDER_SIZES.find((s) => s.id === sizeId) || ORDER_SIZES[0];
  const unit = Math.round((selectedPr.unit * selectedSz.mult) * 100) / 100;
  const total = Math.round(unit * qty * 100) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onToast('Please enter your full name', 'error');
      return;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 9) {
      onToast('Please enter a valid phone number', 'error');
      return;
    }
    if (!qty || qty <= 0) {
      onToast('Please enter the quantity', 'error');
      return;
    }

    setSubmitting(true);
    const order: CustomerOrder = {
      id: makeTicket(),
      customer: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      product: selectedPr.name,
      size: selectedSz.name,
      qty,
      unit,
      total,
      address: address.trim(),
      landmark: landmark.trim(),
      date,
      slot,
      notes: notes.trim(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
      source: 'Website'
    };

    const orders = getOrders();
    orders.unshift(order);
    saveOrders(orders);

    submitToSheets('order', {
      ticket_number: order.id,
      customer_name: order.customer,
      phone: order.phone,
      product: order.product,
      quantity: order.qty,
      total: order.total,
      notes: order.notes,
      email: order.email || '',
      address: order.address + (order.landmark ? ` (${order.landmark})` : ''),
      delivery_date: `${order.date} ${order.slot}`,
      status: order.status
    });

    setSubmitting(false);

    onShowModal(
      'Order Received',
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-[#2ECC71] rounded-full flex items-center justify-center mx-auto text-white text-4xl">✓</div>
        <h3 className="text-2xl font-black">Thank you, {order.customer.split(' ')[0]}!</h3>
        <p className="text-gray-500 text-sm">
          Your order has been logged. Our sales desk will call you within <strong>2 working hours</strong> to confirm volumes and delivery.
        </p>
        <div className="bg-[#E8F5EE] dark:bg-gray-700 p-4 rounded-xl">
          <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Your Order Number</div>
          <div className="text-2xl font-black font-mono text-[#0B6B3A]">{order.id}</div>
          <div className="text-xs text-gray-500 mt-2">Use it on the <strong>Track Order</strong> page to follow progress</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-left text-sm space-y-1">
          <div className="flex justify-between"><span className="text-gray-500">Product</span><span className="font-bold">{order.product}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Quantity</span><span className="font-bold">{order.qty} × {money(order.unit)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Collection / delivery</span><span className="font-bold">{fmtDate(order.date)}</span></div>
          <div className="flex justify-between border-t pt-2 mt-2"><span className="text-gray-500">Estimated total</span><span className="font-black text-[#0B6B3A]">{money(order.total)}</span></div>
        </div>
        <div className="hint text-left">
          📧 Orders sync directly with Google Sheets and trigger notifications automatically.
        </div>
        <div className="flex gap-2">
          <button onClick={onCloseModal} className="btn btn-outline flex-1 justify-center">Done</button>
          <button
            onClick={() => {
              openWhatsApp(`Hi Farmers Fresh, I have submitted order ${order.id} for ${order.qty} ${order.product}.`);
              onCloseModal();
            }}
            className="btn flex-1 justify-center text-white"
            style={{ background: '#25D366' }}
          >
            💬 Fast-track on WhatsApp
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-[#F5A623] font-bold uppercase tracking-widest text-sm">Order</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2">Place an Order</h2>
          <p className="text-gray-500 mt-2">Takes less than a minute. You will see your estimated total instantly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card p-6 md:p-8">
              <h3 className="font-bold text-lg mb-4">1. Tell us what you need</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Full name <span className="text-red-500">*</span></label>
                  <input className="input" placeholder="e.g. Chanda Mulenga" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Mobile number <span className="text-red-500">*</span></label>
                  <input className="input" placeholder="+260 97X XXX XXX" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Email address</label>
                  <input className="input" placeholder="you@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Collection / delivery date</label>
                  <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Product <span className="text-red-500">*</span></label>
                  <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)}>
                    {PRODUCTS.map((pr) => (
                      <option key={pr.id} value={pr.id}>{pr.emoji} {pr.name} — {moneyShort(pr.unit)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Order size <span className="text-red-500">*</span></label>
                  <select className="input" value={sizeId} onChange={(e) => setSizeId(e.target.value)}>
                    {ORDER_SIZES.map((sz) => (
                      <option key={sz.id} value={sz.id}>{sz.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Quantity (units) <span className="text-red-500">*</span></label>
                  <input className="input" type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))} required />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Time slot</label>
                  <select className="input" value={slot} onChange={(e) => setSlot(e.target.value)}>
                    {DELIVERY_SLOTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-1">Delivery address</label>
                  <input className="input" placeholder="Plot / market / street" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-1">Nearest landmark</label>
                  <input className="input" placeholder="e.g. Opposite Chawama Main SDA Church" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-1">Notes</label>
                  <textarea className="input" rows={3} placeholder="Anything we should know?" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>

              <div className="estimate-box mt-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-[#F5BC43] font-bold">Estimated total</div>
                    <div className="text-3xl font-black">{money(total)}</div>
                    <div className="text-xs text-gray-300">{money(unit)} per unit</div>
                  </div>
                  <div className="text-xs text-gray-200 max-w-xs">{selectedPr.includes}</div>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn btn-secondary w-full justify-center py-4 mt-6 text-base">
                {submitting ? 'Submitting...' : '📤 Submit Order'}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold mb-3">Prefer to talk?</h3>
              <p className="text-sm text-gray-500 mb-4">Farm office hours: <strong>{BRAND.hours}</strong>.</p>
              <ContactButtonsComponent size="lg" />
            </div>
            <div className="card bg-[#E8F5EE] dark:bg-gray-700">
              <h3 className="font-bold mb-2">Already ordered?</h3>
              <p className="text-sm text-gray-500 mb-3">Track your order from confirmation to delivery with your order number.</p>
              <button onClick={() => onNavigate('track')} className="btn btn-primary w-full justify-center">
                🔎 Track My Order
              </button>
            </div>
            <div className="card">
              <h3 className="font-bold mb-2">Collection point</h3>
              <p className="text-sm text-gray-500">{getSettings().address || BRAND.address}</p>
              <button onClick={() => openMaps()} className="btn btn-outline w-full justify-center mt-3 text-xs">
                Open in Google Maps ↗
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrackPage({ onToast }: { onToast: (msg: string, type?: 'success' | 'error' | 'warn' | 'info') => void }) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<CustomerOrder | null | 'not_found'>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const v = code.trim().toUpperCase();
    if (!v) {
      onToast('Enter your order number (e.g. FF-260905-3312)', 'error');
      return;
    }
    const orders = getOrders();
    const found = orders.find((o) => o.id.toUpperCase() === v);
    if (!found) {
      setResult('not_found');
      onToast('No order found with that number', 'error');
    } else {
      setResult(found);
    }
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <span className="text-[#F5A623] font-bold uppercase tracking-widest text-sm">Order tracking</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2">Track Your Order</h2>
          <p className="text-gray-500 mt-2">Enter the order number from your confirmation message.</p>
        </div>

        <form onSubmit={handleTrack} className="card mb-6">
          <label className="block text-sm font-bold mb-1">Order number</label>
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="FF-260905-3312"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }}>
              🔎 Track
            </button>
          </div>
          <div className="hint mt-3">Lost your order number? Call or WhatsApp us and we will look it up for you.</div>
        </form>

        {result === 'not_found' && (
          <div className="warn">No order found with that number. Please verify your order ticket or contact the farm desk.</div>
        )}

        {result && result !== 'not_found' && (
          <div className="card animate-in">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Order</div>
                <div className="text-xl font-black font-mono text-[#0B6B3A]">{result.id}</div>
              </div>
              <span className="badge bg-green-100 text-green-700">{result.status}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                ['Product', result.product],
                ['Quantity', `${num(result.qty)} units`],
                ['Delivery Date', fmtDate(result.date)],
                ['Total', money(result.total)]
              ].map((f, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-400">{f[0]}</div>
                  <div className="font-bold text-sm mt-0.5">{f[1]}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold mb-3">Progress</h4>
                <div className="tl">
                  {ORDER_FLOW.map((st, idx) => {
                    const currentIdx = ORDER_FLOW.indexOf(result.status as typeof ORDER_FLOW[number]);
                    const cls = idx < currentIdx ? 'done' : idx === currentIdx ? 'current' : '';
                    return (
                      <div key={st} className={`tl-item ${cls}`}>
                        <div className="font-bold text-sm">{st}</div>
                        <div className="text-xs text-gray-500">Order phase {idx + 1}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-3">Order Details</h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <div><strong>Customer:</strong> {result.customer}</div>
                  <div><strong>Phone:</strong> {result.phone}</div>
                  {result.address && <div><strong>Address:</strong> {result.address}</div>}
                  {result.notes && <div><strong>Notes:</strong> {result.notes}</div>}
                  <div className="border-t pt-2 mt-2"><strong>Total:</strong> <span className="text-[#0B6B3A] font-black">{money(result.total)}</span></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openWhatsApp(`Hi Farmers Fresh, I am checking on order ${result.id}.`)}
                    className="btn flex-1 justify-center text-white text-xs"
                    style={{ background: '#25D366' }}
                  >
                    💬 Ask on WhatsApp
                  </button>
                  <button onClick={() => openCall()} className="btn btn-outline flex-1 justify-center text-xs">
                    📞 Call farm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function ContactPage({ onToast }: { onToast: (msg: string, type?: 'success' | 'error' | 'warn' | 'info') => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const s = getSettings();
  const ac = getAdminContact();

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      onToast('Please fill all required fields', 'error');
      return;
    }

    const msg = {
      id: `MSG-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject.trim() || 'General enquiry',
      message: message.trim(),
      status: 'New' as const,
      createdAt: new Date().toISOString()
    };

    const msgs = getMessages();
    msgs.unshift(msg);
    saveMessages(msgs);

    submitToSheets('contact', {
      ticket_number: msg.id,
      customer_name: msg.name,
      phone: msg.phone,
      product: msg.subject,
      quantity: 1,
      total: 0,
      notes: msg.message,
      email: msg.email,
      address: '',
      delivery_date: new Date().toISOString().split('T')[0],
      status: 'New'
    });

    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
    onToast('Message sent! We reply within 2 working hours.', 'success');
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-[#F5A623] font-bold uppercase tracking-widest text-sm">Contact</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2">Talk to the Farm</h2>
          <p className="text-gray-500 mt-3">WhatsApp is the fastest way to reach us — we reply during working hours.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-lg mb-4">Reach us directly</h3>
              <ContactButtonsComponent size="lg" />

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <div className="font-bold">Farm location</div>
                    <div className="text-gray-500">{s.address || BRAND.address}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🕠</span>
                  <div>
                    <div className="font-bold">Working hours</div>
                    <div className="text-gray-500">{BRAND.hours}</div>
                    <div className="text-gray-500">{BRAND.emergency}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">📞</span>
                  <div>
                    <div className="font-bold">CEO — {s.ceo || BRAND.ceo} (direct line)</div>
                    <div className="text-gray-500">
                      <a href={ac.telLink} onClick={(e) => { e.preventDefault(); openCall(); }} className="hover:underline font-bold text-[#0B6B3A]">
                        {ac.phone}
                      </a>
                    </div>
                    {ac.phone2 && <div className="text-gray-500">{ac.phone2}</div>}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">✉️</span>
                  <div>
                    <div className="font-bold">Email</div>
                    <div className="text-gray-500">
                      <a href={ac.mailLink} onClick={(e) => { e.preventDefault(); openEmail(); }} className="hover:underline">
                        {ac.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openMaps()}
                className="text-xs text-[#0B6B3A] font-bold hover:underline mt-4 inline-block cursor-pointer"
              >
                Open in Google Maps ↗
              </button>
            </div>

            <div className="card bg-[#0B6B3A] text-white">
              <h3 className="font-bold mb-2">Wholesale &amp; contracts</h3>
              <p className="text-sm text-gray-200 mb-4">
                Shops, bakeries, hotels and restaurants — ask about weekly standing orders and contract pricing.
              </p>
              <button
                onClick={() => openCall()}
                className="btn w-full justify-center"
                style={{ background: '#F5A623', color: '#03291A' }}
              >
                📞 Speak to sales
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-lg mb-4">Send us a message</h3>
            <form onSubmit={handleMessageSubmit} className="space-y-4">
              <input className="input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input className="input" placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input className="input" placeholder="Phone number e.g. +260 97X XXX XXX" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input className="input" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <textarea className="input" rows={4} placeholder="Your message" value={message} onChange={(e) => setMessage(e.target.value)} required />
              <button type="submit" className="btn btn-primary w-full justify-center py-3">
                Send Message ✈️
              </button>
            </form>

            <div className="mt-6 p-4 bg-[#E8F5EE] dark:bg-gray-700 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span>ℹ️</span>
                <span className="font-bold text-sm text-[#0B6B3A]">Quick contact</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Reach us instantly via WhatsApp, phone call or email. Office hours: <strong>{BRAND.hours}</strong>.
              </p>
              <ContactButtonsComponent size="sm" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
