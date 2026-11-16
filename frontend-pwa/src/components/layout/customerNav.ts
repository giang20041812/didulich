import { Home, BedDouble, MapPin, Bus, Compass, Utensils, Layers, Route, type LucideIcon } from 'lucide-react';

export interface CustomerNavItem {
  id: string;
  path: string;
  label: string;
  Icon: LucideIcon;
  /** Đường dẫn khác cũng tính là đang ở mục này. */
  alsoActiveOn?: string[];
  /** Nhãn nhỏ cạnh tên (vd. "Mới") để khách để ý mục vừa ra mắt. */
  badge?: string;
}

/**
 * Điều hướng chính của trang khách — header và sidebar dùng chung để thứ tự, tên gọi luôn khớp nhau:
 * Trang chủ, Lưu trú, Lịch trình, Du lịch, Di chuyển, rồi các mục còn lại.
 */
export const CUSTOMER_NAV: CustomerNavItem[] = [
  { id: 'home', path: '/', label: 'Trang chủ', Icon: Home },
  { id: 'homestays', path: '/homestays', label: 'Lưu trú', Icon: BedDouble },
  // Lịch trình: tạo lịch trình + lịch trình du khách đăng công khai (/j/…) + lịch trình của tôi (/journeys/…).
  { id: 'trips', path: '/lich-trinh', label: 'Lịch trình', Icon: Route, alsoActiveOn: ['/j', '/journeys', '/trai-nghiem'] },
  { id: 'destinations', path: '/destinations', label: 'Du lịch', Icon: MapPin, alsoActiveOn: ['/places'] },
  // Đặc sản: tạm ẩn khỏi menu (route /specialties chuyển về trang chủ trong AppRoutes) — bật lại thì thêm mục này.
  { id: 'transport', path: '/transport', label: 'Di chuyển', Icon: Bus },
  { id: 'culture', path: '/culture', label: 'Văn hóa', Icon: Compass, alsoActiveOn: ['/explore', '/experiences', '/festivals'] },
  { id: 'restaurants', path: '/restaurants', label: 'Nhà hàng', Icon: Utensils, alsoActiveOn: ['/food'] },
  { id: 'services', path: '/services', label: 'Dịch vụ & Tiện ích', Icon: Layers, alsoActiveOn: ['/photo', '/rental'] },
];

/** Mục điều hướng có đang được chọn với đường dẫn hiện tại không. */
export function isCustomerNavActive(item: CustomerNavItem, pathname: string): boolean {
  if (item.path === '/') return pathname === '/';
  return [item.path, ...(item.alsoActiveOn ?? [])].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
