import type { ReactNode } from 'react';

/**
 * Khung nét mảnh bên ngoài thẻ, mỗi loại thông tin một kiểu (cùng nét với họa tiết nền trang chủ — HomeMotifs):
 * - house (homestay): mái nhà sàn cong, đôi sừng chéo ở đỉnh; cột sàn dưới chân.
 * - mountain (điểm đến): dãy núi nhô sau thẻ; ruộng bậc thang dưới chân.
 * - food (nhà hàng): khói nghi ngút bốc lên; đế bát dưới chân.
 * - specialty (đặc sản, quà): nơ buộc quà trên đầu thẻ.
 * - transport (di chuyển): đường đi nét đứt tới ghim vị trí; mặt đường dưới chân.
 * - service (dịch vụ, cắm trại): mái lều có cờ; cọc lều hai góc.
 * - culture (lễ hội, trải nghiệm): dây đèn lồng; dải hoa văn thổ cẩm dưới chân.
 *
 * Hình kéo giãn theo bề ngang thẻ (preserveAspectRatio="none") giữ nét đều nhờ non-scaling-stroke; chi tiết không được
 * méo (khói, nơ, đèn, cờ, ghim) là SVG cỡ cố định đặt theo %. Rê chuột: thẻ và khung cùng nhấc lên.
 */
export type CardFrameKind = 'house' | 'mountain' | 'food' | 'specialty' | 'transport' | 'service' | 'culture';

/** Nhấc cùng nhịp với thẻ khi rê chuột (thẻ: transition transform duration-500). */
const LIFT = 'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/frame:-translate-y-1.5';
/** Lớp SVG kéo giãn trên đầu thẻ, vươn quá hai mép 6px như mái hiên. */
const TOP = `pointer-events-none absolute -left-1.5 -right-1.5 top-0 z-10 w-[calc(100%+0.75rem)] overflow-visible ${LIFT}`;
/** Nét chung: thuộc tính stroke trên <g>; vector-effect không kế thừa nên đặt riêng từng hình (NS). */
const STROKE = { stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const NS = { vectorEffect: 'non-scaling-stroke' } as const;

/** Dải SVG kéo giãn dưới chân thẻ (chừa lề hai bên theo `inset`). */
function Base({ height, inset = 'px-[8%]', children }: { height: number; inset?: string; children: ReactNode }) {
  return (
    <div aria-hidden className={`pointer-events-none ${inset} ${LIFT}`}>
      <svg viewBox={`0 0 200 ${height}`} preserveAspectRatio="none" className="block w-full overflow-visible" style={{ height }}>
        <g {...STROKE} fill="none">{children}</g>
      </svg>
    </div>
  );
}

const FRAMES: Record<CardFrameKind, { tone: string; pad: string; top: ReactNode; bottom?: ReactNode }> = {
  house: {
    tone: 'text-[#0a7d64]',
    pad: 'pt-[32px]',
    top: (
      <svg viewBox="0 0 200 34" preserveAspectRatio="none" className={`${TOP} h-[34px]`}>
        <g {...STROKE}>
          <path {...NS} d="M0 33 Q 58 29 100 6 Q 142 29 200 33 Z" fill="currentColor" fillOpacity="0.1" strokeOpacity="0.6" />
          <path {...NS} d="M100 6 L 92 0 M100 6 L 108 0" fill="none" strokeOpacity="0.6" />
          <path {...NS} d="M80 22 Q 100 13 120 22" fill="none" strokeOpacity="0.3" />
        </g>
      </svg>
    ),
    bottom: (
      <div aria-hidden className={`pointer-events-none flex justify-between px-[12%] ${LIFT}`}>
        {[0, 1].map((side) => (
          <span key={side} className="flex gap-2.5">
            <span className="h-2 w-[3px] rounded-b-full bg-current opacity-30" />
            <span className="h-2 w-[3px] rounded-b-full bg-current opacity-30" />
          </span>
        ))}
      </div>
    ),
  },
  mountain: {
    tone: 'text-[#0a7d64]',
    pad: 'pt-[32px]',
    top: (
      <svg viewBox="0 0 200 34" preserveAspectRatio="none" className={`${TOP} h-[34px]`}>
        <g {...STROKE}>
          <path {...NS} d="M0 33 L 34 18 Q 38 15 42 18 L 58 27 L 92 5 Q 100 0 108 5 L 144 25 L 158 16 Q 162 13 166 16 L 200 33 Z" fill="currentColor" fillOpacity="0.1" strokeOpacity="0.6" />
          <path {...NS} d="M86 10 Q 93 14 100 9 Q 107 14 114 10" fill="none" strokeOpacity="0.35" />
        </g>
      </svg>
    ),
    bottom: (
      <Base height={11}>
        <path {...NS} d="M0 3 Q 50 9 100 5 T 200 3" strokeOpacity="0.35" />
        <path {...NS} d="M24 10 Q 100 5 176 10" strokeOpacity="0.25" />
      </Base>
    ),
  },
  food: {
    tone: 'text-[#a8641a]',
    pad: 'pt-[30px]',
    top: (
      <svg viewBox="0 0 60 32" className={`pointer-events-none absolute left-1/2 top-0 z-10 h-8 w-[60px] -translate-x-1/2 overflow-visible ${LIFT}`}>
        <g {...STROKE} fill="none" strokeOpacity="0.55">
          <path d="M18 30 C 11 22, 25 16, 18 4" />
          <path d="M30 30 C 23 21, 37 14, 30 0" />
          <path d="M42 30 C 35 22, 49 16, 42 4" />
        </g>
      </svg>
    ),
    bottom: (
      <Base height={6} inset="px-[30%]">
        <path {...NS} d="M0 1 Q 100 9 200 1" strokeOpacity="0.45" />
      </Base>
    ),
  },
  specialty: {
    tone: 'text-[#a8641a]',
    pad: 'pt-[22px]',
    top: (
      <svg viewBox="0 0 48 30" className={`pointer-events-none absolute left-1/2 top-0 z-10 h-[30px] w-12 -translate-x-1/2 overflow-visible ${LIFT}`}>
        <g {...STROKE} strokeOpacity="0.6">
          <path d="M24 16 C 14 3, 1 7, 5 16 C 1 25, 14 27, 24 16 Z" fill="currentColor" fillOpacity="0.14" />
          <path d="M24 16 C 34 3, 47 7, 43 16 C 47 25, 34 27, 24 16 Z" fill="currentColor" fillOpacity="0.14" />
          <circle cx="24" cy="16" r="3" fill="currentColor" fillOpacity="0.3" />
          <path d="M22 19 L 17 29 M26 19 L 31 29" fill="none" />
        </g>
      </svg>
    ),
  },
  transport: {
    tone: 'text-[#1d4f6b]',
    pad: 'pt-[24px]',
    top: (
      <>
        <svg viewBox="0 0 200 22" preserveAspectRatio="none" className={`${TOP} h-[22px]`}>
          <g {...STROKE} fill="none">
            <path {...NS} d="M0 21 C 50 4, 110 24, 184 10" strokeOpacity="0.55" strokeDasharray="2 6" />
          </g>
        </svg>
        <svg viewBox="0 0 20 26" className={`pointer-events-none absolute -right-1 -top-1.5 z-10 h-[26px] w-5 overflow-visible ${LIFT}`}>
          <g {...STROKE} strokeOpacity="0.65">
            <path d="M10 24 C 5 17, 2 13, 2 9 a8 8 0 0 1 16 0 c0 4 -3 8 -8 15 z" fill="currentColor" fillOpacity="0.12" />
            <circle cx="10" cy="9" r="2.8" fill="none" />
          </g>
        </svg>
      </>
    ),
    bottom: (
      <Base height={9} inset="px-0">
        <path {...NS} d="M0 2 H 200" strokeOpacity="0.3" />
        <path {...NS} d="M10 7 H 190" strokeOpacity="0.4" strokeDasharray="6 7" />
      </Base>
    ),
  },
  service: {
    tone: 'text-[#0a7d64]',
    pad: 'pt-[30px]',
    top: (
      <>
        <svg viewBox="0 0 200 32" preserveAspectRatio="none" className={`${TOP} h-8`}>
          <g {...STROKE}>
            <path {...NS} d="M0 31 L 96 9 Q 100 8 104 9 L 200 31 Z" fill="currentColor" fillOpacity="0.1" strokeOpacity="0.6" />
            <path {...NS} d="M100 9 L 88 31 M100 9 L 112 31" fill="none" strokeOpacity="0.3" />
          </g>
        </svg>
        <svg viewBox="0 0 18 14" className={`pointer-events-none absolute left-1/2 -top-1 z-10 h-3.5 w-[18px] overflow-visible ${LIFT}`}>
          <g {...STROKE} strokeOpacity="0.6">
            <path d="M0 13 V 1 Q 8 0 14 4 Q 8 7 0 7" fill="currentColor" fillOpacity="0.2" />
          </g>
        </svg>
      </>
    ),
    bottom: (
      <div aria-hidden className={`pointer-events-none flex justify-between px-[4%] ${LIFT}`}>
        <span className="h-2.5 w-[3px] origin-top rotate-[25deg] rounded-b-full bg-current opacity-35" />
        <span className="h-2.5 w-[3px] origin-top -rotate-[25deg] rounded-b-full bg-current opacity-35" />
      </div>
    ),
  },
  culture: {
    tone: 'text-[#a8641a]',
    pad: 'pt-[36px]',
    top: (
      <>
        <svg viewBox="0 0 200 14" preserveAspectRatio="none" className={`${TOP} h-3.5`}>
          <g {...STROKE} fill="none">
            <path {...NS} d="M0 2 Q 100 16 200 2" strokeOpacity="0.5" />
          </g>
        </svg>
        {/* Đèn treo đúng điểm trên dây võng: y(x) của đường cong bậc hai ở 20% / 50% / 80% bề ngang */}
        {([['left-[20%]', 'top-[6px]'], ['left-1/2', 'top-[8px]'], ['left-[80%]', 'top-[6px]']] as const).map(([x, y]) => (
          <svg key={x} viewBox="0 0 14 22" className={`pointer-events-none absolute ${x} ${y} z-10 h-[26px] w-4 -translate-x-1/2 overflow-visible text-[#c2410c] ${LIFT}`}>
            <g {...STROKE} strokeWidth="1.3" strokeOpacity="0.7">
              <path d="M7 0 V 3 M4 3 H 10 M4 17 H 10 M7 17 V 21" fill="none" />
              <ellipse cx="7" cy="10" rx="5.5" ry="7" fill="currentColor" fillOpacity="0.2" />
            </g>
          </svg>
        ))}
      </>
    ),
    bottom: (
      <Base height={6} inset="px-[18%]">
        <path {...NS} d={`M0 5 ${Array.from({ length: 20 }, (_, i) => `L ${i * 10 + 5} 1 L ${i * 10 + 10} 5`).join(' ')}`} strokeOpacity="0.4" />
      </Base>
    ),
  },
};

export default function CardFrame({ kind, children }: { kind: CardFrameKind; children: ReactNode }) {
  const { tone, pad, top, bottom } = FRAMES[kind];
  return (
    <div className={`group/frame relative flex h-full flex-col ${pad}`}>
      {/* Màu khung chỉ áp cho phần trang trí (display: contents vẫn truyền color xuống), không lan vào chữ trong thẻ. */}
      <div aria-hidden className={`contents ${tone}`}>{top}</div>
      {/* Thẻ giãn hết phần còn lại (các thẻ cùng hàng cao bằng nhau) và nhấc cùng khung khi rê chuột vào bất cứ đâu trong khung. */}
      <div className="flex min-h-0 flex-1 flex-col *:flex-1 group-hover/frame:*:-translate-y-1.5">{children}</div>
      {bottom && <div aria-hidden className={`contents ${tone}`}>{bottom}</div>}
    </div>
  );
}
