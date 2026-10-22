import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface CoverflowCarouselProps {
  count: number;
  /** Vẽ thẻ thứ index; active = thẻ đang nằm giữa (thẻ khác bị khóa tương tác, bấm vào thì trượt về giữa). */
  renderSlide: (index: number, active: boolean) => ReactNode;
  /** Số thẻ hiện mỗi bên thẻ giữa trên màn hình lớn (từ 1024px); điện thoại / tablet luôn 1. */
  desktopSideCount?: 1 | 2;
  /** Bề rộng thẻ giữa (phần còn lại hai bên để lộ các thẻ kề). */
  slideClassName?: string;
  /** Tên vùng carousel cho trình đọc màn hình. */
  label: string;
  /**
   * Điện thoại: phủ trắng mờ dần nửa dưới thẻ kề (thẻ có phần chữ bên dưới ảnh). Thẻ chỉ có ảnh / video (chữ chỉ hiện ở
   * thẻ giữa) thì tắt.
   */
  sideFade?: boolean;
}

const SWIPE_DISTANCE = 50;
const SWIPE_VELOCITY = 400;
const SPRING = { type: 'spring', stiffness: 300, damping: 28, mass: 1 } as const;
const NO_SHADOW = 'drop-shadow(0px 0px 0px rgba(15,45,60,0))';

/**
 * Vị trí thẻ theo khoảng cách tới thẻ giữa (x tính theo % bề rộng thẻ): thẻ giữa rõ nét, các thẻ kề thu nhỏ, nghiêng và
 * nằm sau; thẻ ngoài số thẻ hiện mỗi bên thì ẩn hẳn.
 */
function slotFor(offset: number, sideCount: 1 | 2) {
  const side = Math.sign(offset);
  const distance = Math.abs(offset);
  if (distance === 0) {
    return { x: '0%', scale: 1, rotateY: 0, opacity: 1, filter: 'blur(0px) drop-shadow(0px 14px 22px rgba(15,45,60,0.18))' };
  }
  if (sideCount === 1) {
    if (distance === 1) return { x: `${side * 35}%`, scale: 0.85, rotateY: side * -20, opacity: 0.75, filter: `blur(1.5px) ${NO_SHADOW}` };
    return { x: `${side * 60}%`, scale: 0.7, rotateY: side * -40, opacity: 0, filter: `blur(2px) ${NO_SHADOW}` };
  }
  if (distance === 1) return { x: `${side * 78}%`, scale: 0.88, rotateY: side * -14, opacity: 0.92, filter: `blur(0px) ${NO_SHADOW}` };
  if (distance === 2) return { x: `${side * 146}%`, scale: 0.76, rotateY: side * -24, opacity: 0.6, filter: `blur(1px) ${NO_SHADOW}` };
  return { x: `${side * 190}%`, scale: 0.65, rotateY: side * -30, opacity: 0, filter: `blur(2px) ${NO_SHADOW}` };
}

/**
 * Carousel thẻ giữa + thẻ hai bên, xoay vòng. Không có nút mũi tên: thẻ kề lộ hai bên gợi ý vuốt; đổi thẻ bằng vuốt,
 * kéo chuột, bấm thẻ kề, phím ←/→ hoặc chấm trang.
 */
export default function CoverflowCarousel({
  count,
  renderSlide,
  desktopSideCount = 1,
  slideClassName = 'w-[78%] max-w-[360px]',
  label,
  sideFade = true,
}: CoverflowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dragged = useRef(false);
  const reduceMotion = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const sideCount = isDesktop ? desktopSideCount : 1;

  if (count === 0) return null;

  const active = currentIndex % count;
  const transition = reduceMotion ? { duration: 0 } : SPRING;
  const goTo = (index: number) => setCurrentIndex(((index % count) + count) % count);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) goTo(active + 1);
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) goTo(active - 1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(active - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo(active + 1); }
  };

  return (
    <div className="w-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#0a7d64]/40" role="region" aria-roledescription="carousel" aria-label={label} tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="relative overflow-x-clip py-5" style={{ perspective: '1200px' }}>
        <motion.div
          className="grid cursor-grab active:cursor-grabbing"
          drag={count > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 28 }}
          onDragStart={() => { dragged.current = true; }}
          onDragEnd={handleDragEnd}
          onPointerDownCapture={() => { dragged.current = false; }}
          onClickCapture={(e) => {
            if (dragged.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          {Array.from({ length: count }, (_, index) => {
            let offset = index - active;
            // Xoay vòng: thẻ cuối nằm bên trái thẻ đầu.
            if (count > 2) {
              const half = Math.floor(count / 2);
              if (offset > half) offset -= count;
              else if (offset < -half) offset += count;
            }
            const isActive = offset === 0;
            return (
              <motion.div
                key={index}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${count}`}
                className={`relative col-start-1 row-start-1 justify-self-center select-none ${slideClassName} ${
                  Math.abs(offset) > sideCount ? 'pointer-events-none' : isActive ? '' : 'cursor-pointer'
                }`}
                style={{ zIndex: 30 - Math.abs(offset) }}
                initial={false}
                animate={slotFor(offset, sideCount)}
                transition={transition}
                onClick={isActive ? undefined : () => goTo(index)}
              >
                <div inert={!isActive ? true : undefined} className="h-full">
                  {renderSlide(index, isActive)}
                </div>
                {/* Điện thoại: thẻ kề chỉ lộ phần ảnh, phần chữ bị cắt mờ dần vào nền — gợi ý vuốt chứ không thành chữ vụn */}
                {sideCount === 1 && sideFade && (
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-transparent from-45% via-white/85 via-65% to-white transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-100'}`}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Chấm trang: vùng bấm 24px, chấm đang xem kéo dài thành vạch */}
      {count > 1 && (
        <div className="mt-1 flex justify-center">
          <div className="inline-flex items-center rounded-full bg-slate-900/[0.04] px-1.5 py-0.5">
            {Array.from({ length: count }, (_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => goTo(dotIdx)}
                aria-label={`Chuyển tới thẻ ${dotIdx + 1}`}
                aria-current={dotIdx === active}
                className="group flex h-6 min-w-5 items-center justify-center px-0.5 cursor-pointer"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    dotIdx === active ? 'w-5 bg-[#0a7d64]' : 'w-1.5 bg-slate-300 group-hover:bg-slate-400'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
