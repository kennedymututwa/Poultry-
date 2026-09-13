import { BRAND } from './data';
import { getSettings } from './storage';

export interface AdminContact {
  phone: string;
  phone2?: string;
  email: string;
  name: string;
  waPhone: string;
  waLink: string;
  telLink: string;
  mailLink: string;
  mapsLink: string;
}

export function isMobileDevice(): boolean {
  try {
    if (typeof navigator !== 'undefined') {
      if (navigator.maxTouchPoints > 1) return true;
      return /Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(navigator.userAgent || '');
    }
  } catch {
    // fallback
  }
  return false;
}

export function formatZambianPhone(raw: string): string {
  const digits = String(raw).replace(/[^0-9]/g, '');
  if (digits.length === 9) return '260' + digits;
  if (digits.length === 10 && digits.startsWith('0')) return '260' + digits.substring(1);
  if (digits.startsWith('260')) return digits;
  if (digits.length > 0) return '260' + digits;
  return '260973283009';
}

export function getAdminContact(): AdminContact {
  const s = getSettings();
  const phone = (s && s.phone) ? s.phone : BRAND.phone;
  const phone2 = (s && s.phone2) ? s.phone2 : BRAND.phone2;
  const email = (s && s.email) ? s.email : BRAND.email;
  const name = (s && s.name) ? s.name : BRAND.name;
  const address = (s && s.address) ? s.address : BRAND.address;

  const waPhone = formatZambianPhone(phone);
  const msg = `Hi ${name}, I would like to enquire about your chicken and fresh produce supply.`;

  return {
    phone,
    phone2,
    email,
    name,
    waPhone,
    waLink: `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`,
    telLink: `tel:+${waPhone}`,
    mailLink: `mailto:${email}?subject=${encodeURIComponent(`Enquiry from ${name} website`)}`,
    mapsLink: `https://maps.google.com/?q=${encodeURIComponent(address)}`
  };
}

export function openDirectLink(url: string): void {
  if (!url) return;
  // If running on mobile or handling tel:/mailto:, direct navigation triggers native apps
  if (url.startsWith('tel:') || url.startsWith('mailto:') || isMobileDevice()) {
    try {
      window.location.href = url;
      return;
    } catch {
      // fallback
    }
  }

  try {
    const w = window.open(url, '_blank', 'noopener,noreferrer');
    if (w) {
      w.focus();
      return;
    }
  } catch {
    // fallback
  }

  try {
    const a = document.createElement('a');
    a.href = url;
    if (!url.startsWith('tel:') && !url.startsWith('mailto:')) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    try {
      window.location.href = url;
    } catch {
      // noop
    }
  }
}

export function openWhatsApp(customMsg?: string): void {
  const ac = getAdminContact();
  const url = customMsg
    ? `https://wa.me/${ac.waPhone}?text=${encodeURIComponent(customMsg)}`
    : ac.waLink;
  openDirectLink(url);
}

export function openCall(): void {
  const ac = getAdminContact();
  openDirectLink(ac.telLink);
}

export function openEmail(): void {
  const ac = getAdminContact();
  openDirectLink(ac.mailLink);
}

export function openMaps(): void {
  const ac = getAdminContact();
  openDirectLink(ac.mapsLink);
}
