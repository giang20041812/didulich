/** Thẻ gọn (CompactPlaceCard) của trang chủ và các trang danh sách: lưới và định dạng giá. */

/**
 * Lưới thẻ gọn: trang có cột bộ lọc bên trái / trang toàn chiều ngang. Thẻ cùng hàng cao bằng nhau (stretch): thẻ tự chừa
 * chỗ cho tên 2 dòng và dồn giá xuống đáy. Trang có cột bộ lọc chỉ 2 thẻ/hàng để thẻ không bị bóp nhỏ. `_COLS` là phần
 * cột/khoảng cách (không kèm `grid`) cho FramerSwipeCardStack.
 */
export const COMPACT_GRID_WITH_SIDEBAR_COLS = 'grid-cols-2 gap-3 md:gap-4';
export const COMPACT_GRID_WITH_SIDEBAR = `grid ${COMPACT_GRID_WITH_SIDEBAR_COLS}`;
export const COMPACT_GRID_FULL = 'grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4';

/** Định dạng giá VNĐ; 0 / thiếu trả về fallback. */
export function formatVnd(value: number | null | undefined, fallback: string | null = null): string | null {
  return value != null && value > 0 ? `${value.toLocaleString('vi-VN')}đ` : fallback;
}
