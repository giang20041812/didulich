import React from 'react';
import CardPages from '@/components/ui/CardPages';

interface FramerSwipeCardStackProps {
  children: React.ReactNode[];
  className?: string;
  gridClassName?: string;
  /**
   * Từ md: mỗi trang tối đa N thẻ (lưới gridClassName), vuốt / bấm ‹ › sang trang sau — vd 8 thẻ = 2 hàng × 4 cột. Bỏ trống
   * = một lưới hết mọi thẻ.
   */
  perPage?: number;
  /** Tên vùng thẻ cho trình đọc màn hình. */
  label?: string;
  /** Điện thoại: bề rộng mỗi cột thẻ (mỗi cột xếp 2 thẻ chồng dọc). */
  mobileColumnClassName?: string;
}

/**
 * Máy tính / tablet: lưới thẻ (hoặc từng trang perPage thẻ). Điện thoại: không băng chuyền — mỗi cột 2 thẻ, cuộn ngang
 * để xem các cột tiếp theo.
 */
export const FramerSwipeCardStack: React.FC<FramerSwipeCardStackProps> = ({
  children,
  className = '',
  gridClassName = 'md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6',
  perPage,
  label = 'Danh sách thẻ',
  mobileColumnClassName = 'auto-cols-[44%]',
}) => {
  if (children.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      {perPage ? (
        <div className="hidden md:block">
          <CardPages perPage={perPage} pageClassName={gridClassName} label={label}>{children}</CardPages>
        </div>
      ) : (
        <div className={`hidden md:grid ${gridClassName}`}>
          {children}
        </div>
      )}
      <div
        className={`md:hidden grid grid-flow-col grid-rows-2 ${mobileColumnClassName} gap-3 overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-px-4 -mx-4 px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        role="region"
        aria-label={label}
      >
        {children.map((child, index) => (
          <div key={index} className="min-w-0 snap-start">{child}</div>
        ))}
      </div>
    </div>
  );
};

export default FramerSwipeCardStack;
