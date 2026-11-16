/** Thẻ gọn (CompactPlaceCard) của trang chủ và các trang danh sách: lưới và định dạng giá. */

/**
 * Lưới thẻ danh sách: từ md mỗi hàng 2 thẻ. Điện thoại: 1 thẻ mỗi khung, vuốt ngang (snap) để xem thẻ tiếp theo.
 * Lề âm -mx-4/px-4 khớp lề px-4 của trang để dải cuộn chạm mép màn hình.
 */
export const COMPACT_MOBILE_SCROLL =
  'grid grid-flow-col auto-cols-[86%] gap-3 overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-px-4 -mx-4 px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:snap-start';
/** Phần cột/khoảng cách từ md (không kèm `grid`) cho FramerSwipeCardStack. */
export const COMPACT_GRID_WITH_SIDEBAR_COLS = 'grid-cols-2 gap-4 lg:gap-5';
const COMPACT_GRID_DESKTOP =
  'md:grid-flow-row md:auto-cols-auto md:grid-cols-2 md:gap-4 lg:gap-5 md:overflow-visible md:mx-0 md:px-0 md:pb-0';
export const COMPACT_GRID_WITH_SIDEBAR = `${COMPACT_MOBILE_SCROLL} ${COMPACT_GRID_DESKTOP}`;
export const COMPACT_GRID_FULL = COMPACT_GRID_WITH_SIDEBAR;

/** Định dạng giá VNĐ; 0 / thiếu trả về fallback. */
export function formatVnd(value: number | null | undefined, fallback: string | null = null): string | null {
  return value != null && value > 0 ? `${value.toLocaleString('vi-VN')}đ` : fallback;
}
