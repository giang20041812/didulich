import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Độ trễ (ms) để tạo hiệu ứng so le giữa các phần tử cùng lúc xuất hiện. */
  delay?: number;
  className?: string;
  /** Nhảy cách bao nhiêu px khi hiện (mặc định 24px — nhẹ, không gây choáng). */
  offset?: number;
}

/**
 * Hiệu ứng hiện dần khi cuộn tới (fade + nhấc nhẹ) — nhịp chuyển động kiểu sản phẩm cao cấp.
 * Tự tắt khi người dùng bật "giảm chuyển động" (prefers-reduced-motion): nội dung hiện ngay.
 * Chỉ chạy một lần khi phần tử vào khung nhìn, không lặp lại khi cuộn qua lại.
 */
export default function Reveal({ children, delay = 0, className = '', offset = 24 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)
        || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      // will-change chỉ khi còn chờ hiện: giữ mãi thì mỗi khối thành một layer GPU riêng suốt đời trang, cuộn nặng dần.
      className={`${className} transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible ? 'opacity-100' : 'opacity-0 will-change-[opacity,transform]'
      }`}
      style={{
        transitionDelay: `${delay}ms`,
        transform: visible ? undefined : `translate3d(0, ${offset}px, 0)`,
      }}
    >
      {children}
    </div>
  );
}
