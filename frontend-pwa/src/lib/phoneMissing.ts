import { useEffect, useState } from 'react';

/** Phiên khách đang đăng nhập mà chưa có số điện thoại (đọc localStorage, không gọi mạng). */
export function phoneMissing(): boolean {
  try {
    if (!localStorage.getItem('traveler_token')) return false;
    const user = JSON.parse(localStorage.getItem('traveler_user') ?? '{}') as { phone?: string | null };
    return !user.phone;
  } catch {
    return false;
  }
}

export function usePhoneMissing(): boolean {
  const [missing, setMissing] = useState(phoneMissing);
  useEffect(() => {
    const sync = () => setMissing(phoneMissing());
    window.addEventListener('auth_change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('auth_change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return missing;
}
