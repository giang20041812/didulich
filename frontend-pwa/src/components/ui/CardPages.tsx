import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CardPagesProps {
  /** Các thẻ, theo thứ tự. */
  children: ReactNode[];
  /** Số thẻ mỗi trang. */
  perPage: number;
  /** Lưới của một trang (vd "grid grid-cols-4 gap-4" — 8 thẻ thành 2 hàng). */
  pageClassName: string;
  /** Tên vùng cho trình đọc màn hình. */
  label: string;
}

const ARROW = 'flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--color-ink-deep)] shadow-2xs ring-1 ring-slate-200 transition-colors hover:text-[var(--color-primary)] hover:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-[var(--color-ink-deep)] disabled:hover:ring-slate-200 cursor-pointer';

/**
 * Thẻ chia trang: mỗi trang tối đa `perPage` thẻ (lưới pageClassName), vuốt ngang / cuộn ngang bằng touchpad hoặc bấm ‹ ›,
 * chấm trang để sang trang sau. Khung giữ nguyên chiều cao (cao bằng trang đầy nhất), không co lại khi sang trang ít hàng hơn — co khung gây giật. Chỉ
 * một trang thì không có thanh điều khiển.
 */
export default function CardPages({ children, perPage, pageClassName, label }: CardPagesProps) {
  const pages = useMemo(() => {
    const result: ReactNode[][] = [];
    for (let i = 0; i < children.length; i += perPage) result.push(children.slice(i, i + perPage));
    return result;
  }, [children, perPage]);
  const count = pages.length;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [page, setPage] = useState(0);

  /** Khoảng cách giữa hai trang liền nhau (bề rộng trang + khe). */
  const stepOf = (el: HTMLDivElement) => {
    const [first, second] = Array.from(el.children) as HTMLElement[];
    return second && first ? second.offsetLeft - first.offsetLeft : el.clientWidth;
  };
  // Đo vị trí tối đa một lần mỗi khung hình: đọc offsetLeft trong từng sự kiện scroll ép trình duyệt tính lại bố cục liên tục.
  const syncPage = useCallback(() => {
    frame.current = 0;
    const el = scrollerRef.current;
    if (!el) return;
    setPage(Math.max(0, Math.min(count - 1, Math.round(el.scrollLeft / Math.max(1, stepOf(el))))));
  }, [count]);
  const onScroll = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(syncPage);
  }, [syncPage]);
  useEffect(() => {
    syncPage();
    return () => { if (frame.current) cancelAnimationFrame(frame.current); frame.current = 0; };
  }, [syncPage]);

  const goTo = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const target = Math.max(0, Math.min(count - 1, index));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: target * stepOf(el), behavior: reduce ? 'auto' : 'smooth' });
  };

  if (count === 0) return null;

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      {/* Lề 8px quanh khung cuộn: bóng / nhấc thẻ khi rê chuột không bị cắt */}
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="card-pages scrollbar-hide -m-2 flex snap-x snap-mandatory scroll-px-2 items-start gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain p-2"
      >
        {pages.map((cards, index) => (
          <div
            key={index}
            role="group"
            aria-roledescription="slide"
            aria-label={`Trang ${index + 1} / ${count}`}
            className={`w-full shrink-0 snap-start content-start ${pageClassName}`}
          >
            {cards}
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button type="button" onClick={() => goTo(page - 1)} disabled={page === 0} aria-label="Trang trước" className={ARROW}>
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <div className="inline-flex items-center rounded-full bg-slate-900/[0.04] px-1.5 py-0.5">
            {pages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Trang ${index + 1}`}
                aria-current={index === page}
                className="group flex h-6 min-w-5 items-center justify-center px-0.5 cursor-pointer"
              >
                <span className={`block h-1.5 rounded-full transition-all duration-300 ${index === page ? 'w-5 bg-[#0a7d64]' : 'w-1.5 bg-slate-300 group-hover:bg-slate-400'}`} />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => goTo(page + 1)} disabled={page === count - 1} aria-label="Trang sau" className={ARROW}>
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
