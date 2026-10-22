import React, { useRef, useState } from 'react';
import { motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Carousel vuốt ngang cho điện thoại / tablet — dùng framer-motion nên được tách chunk riêng,
 * chỉ tải khi màn hình nhỏ (FramerSwipeCardStack cài đặt lười, desktop không bao giờ tải framer).
 */

interface SwipeCarouselProps {
  children: React.ReactNode[];
}

/** Bề rộng thẻ giữa trên điện thoại / tablet — phần còn lại hai bên để lộ thẻ trước và sau. */
const CARD_WIDTH = 'w-[78%] max-w-[360px]';
const SWIPE_DISTANCE = 50;
const SWIPE_VELOCITY = 400;

/**
 * Vị trí thẻ theo khoảng cách tới thẻ đang xem (x tính theo % bề rộng thẻ): thẻ giữa rõ nét, hai thẻ kề
 * thu nhỏ, mờ và nằm sau thẻ giữa; các thẻ xa hơn ẩn hẳn.
 */
const slotFor = (offset: number) => {
  const side = Math.sign(offset);
  if (offset === 0) {
    return { x: '0%', scale: 1, rotateY: 0, opacity: 1, filter: 'blur(0px) drop-shadow(0px 14px 22px rgba(15,45,60,0.18))' };
  }
  if (Math.abs(offset) === 1) {
    return { x: `${side * 35}%`, scale: 0.85, rotateY: side * -20, opacity: 0.7, filter: 'blur(1px) drop-shadow(0px 0px 0px rgba(15,45,60,0))' };
  }
  return { x: `${side * 60}%`, scale: 0.7, rotateY: side * -40, opacity: 0, filter: 'blur(2px) drop-shadow(0px 0px 0px rgba(15,45,60,0))' };
};

const SPRING = { type: 'spring', stiffness: 300, damping: 28, mass: 1 } as const;

const SwipeCarousel: React.FC<SwipeCarouselProps> = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dragged = useRef(false);
  const reduceMotion = useReducedMotion();
  const total = children.length;

  if (total === 0) return null;

  const active = currentIndex % total;
  const hasPrev = total > 1;
  const hasNext = total > 1;
  const transition = reduceMotion ? { duration: 0 } : SPRING;

  const goTo = (index: number) => {
    if (index < 0) setCurrentIndex(total - 1);
    else if (index >= total) setCurrentIndex(0);
    else setCurrentIndex(index);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) {
      goTo(active + 1);
    } else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) {
      goTo(active - 1);
    }
  };

  const arrowClass =
    'pointer-events-auto absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg border-2 border-[#0a7d64]/40 bg-white text-[#0a7d64] shadow-md flex items-center justify-center hover:border-[#0a7d64] hover:bg-[#0a7d64] hover:text-white active:scale-90 transition-all cursor-pointer disabled:opacity-0 disabled:pointer-events-none';

  return (
    <>
      <div className="relative overflow-x-clip py-5" style={{ perspective: '1200px' }}>
        <motion.div
          className="grid cursor-grab active:cursor-grabbing"
          drag={total > 1 ? 'x' : false}
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
          {children.map((child, index) => {
            let offset = index - active;
            // Circular offset logic
            if (total > 2) {
              const half = Math.floor(total / 2);
              if (offset > half) offset -= total;
              else if (offset < -half) offset += total;
            }
            const isActive = offset === 0;
            return (
              <motion.div
                key={index}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${total}`}
                className={`col-start-1 row-start-1 justify-self-center select-none ${CARD_WIDTH} ${
                  Math.abs(offset) > 1 ? 'pointer-events-none' : ''
                }`}
                style={{ zIndex: 30 - Math.abs(offset) }}
                initial={false}
                animate={slotFor(offset)}
                transition={transition}
                onClick={isActive ? undefined : () => goTo(index)}
              >
                <div inert={!isActive ? true : undefined} className="h-full">
                  {child}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Nút trái / phải nằm trên mép thẻ giữa */}
        {total > 1 && (
          <div className={`pointer-events-none absolute inset-y-0 left-1/2 z-40 -translate-x-1/2 ${CARD_WIDTH}`}>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={!hasPrev}
              aria-label="Xem thẻ trước"
              className={`${arrowClass} -left-[18px]`}
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={!hasNext}
              aria-label="Xem thẻ tiếp theo"
              className={`${arrowClass} -right-[18px]`}
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>

      {/* Pagination Dots */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {Array.from({ length: total }).map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => goTo(dotIdx)}
              aria-label={`Chuyển tới thẻ ${dotIdx + 1}`}
              aria-current={dotIdx === active}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                dotIdx === active
                  ? 'w-6 bg-[#0a7d64] shadow-xs'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default SwipeCarousel;
