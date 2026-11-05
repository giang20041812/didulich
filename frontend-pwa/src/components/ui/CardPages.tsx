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

/** Nút ‹ › tròn nằm trong viên thuốc điều khiển; nút "sau" tô gradient xanh làm điểm nhấn. */
const ARROW = 'group/arrow flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer';
const ARROW_GHOST = `${ARROW} text-[var(--color-ink-deep)] hover:bg-slate-900/[0.06] disabled:hover:bg-transparent`;
const ARROW_SOLID = `${ARROW} bg-[linear-gradient(135deg,#0a7d64,#12b886)] text-white shadow-[0_6px_14px_-6px_rgba(10,125,100,0.7)] hover:shadow-[0_10px_20px_-8px_rgba(10,125,100,0.9)] hover:scale-105 disabled:bg-slate-300 disabled:bg-none disabled:shadow-none disabled:hover:scale-100`;
/** Bề rộng một ô trên thanh tiến trình (px) — vạch sáng trượt liền theo vị trí cuộn. */
const SEG = 22;
const pad2 = (n: number) => String(n).padStart(2, '0');

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
  /** Vị trí cuộn tính theo trang (số thực, 0 → count-1): vạch sáng trên thanh tiến trình bám theo khi đang vuốt. */
  const [progress, setProgress] = useState(0);

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
    const exact = Math.max(0, Math.min(count - 1, el.scrollLeft / Math.max(1, stepOf(el))));
    setProgress(exact);
    setPage(Math.round(exact));
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
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-white/90 p-1 shadow-[0_1px_2px_rgba(16,40,34,0.06),0_12px_28px_-14px_rgba(16,40,34,0.35)] ring-1 ring-slate-900/[0.06] backdrop-blur">
            <button type="button" onClick={() => goTo(page - 1)} disabled={page === 0} aria-label="Trang trước" className={ARROW_GHOST}>
              <ChevronLeft className="h-[18px] w-[18px] transition-transform duration-300 group-hover/arrow:-translate-x-0.5" strokeWidth={2.5} aria-hidden />
            </button>

            <div className="flex items-center gap-2.5 px-2">
              <span className="relative block h-5 w-[1.4rem] overflow-hidden text-sm font-extrabold tabular-nums text-[var(--color-ink-deep)]" aria-live="polite">
                <span key={page} className="pager-num absolute inset-0 flex items-center justify-center">{pad2(page + 1)}</span>
              </span>
              {/* Thanh tiến trình: mỗi trang một ô bấm được, vạch gradient trượt liền theo vị trí cuộn */}
              <div className="relative flex items-center" style={{ width: SEG * count }}>
                <span aria-hidden className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-900/[0.08]" />
                <span
                  aria-hidden
                  className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#0a7d64,#12b886,#06b6d4)] shadow-[0_0_10px_rgba(18,184,134,0.55)]"
                  style={{ width: SEG, transform: `translate(${progress * SEG}px, -50%)` }}
                />
                {pages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`Trang ${index + 1}`}
                    aria-current={index === page}
                    className="relative z-10 h-6 cursor-pointer rounded-full"
                    style={{ width: SEG }}
                  />
                ))}
              </div>
              <span className="text-xs font-bold tabular-nums text-slate-400">{pad2(count)}</span>
            </div>

            <button type="button" onClick={() => goTo(page + 1)} disabled={page === count - 1} aria-label="Trang sau" className={ARROW_SOLID}>
              <ChevronRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover/arrow:translate-x-0.5" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
