import type { ReactNode } from 'react';

/**
 * Khung nét mảnh bên ngoài thẻ, mỗi loại thông tin một kiểu (cùng nét với họa tiết nền trang chủ — HomeMotifs):
 * - house (homestay): mái tranh nhà sàn cong, khau cút và hoa văn trám ở đầu hồi; cột sàn có giằng dưới chân.
 * - mountain (điểm đến): dãy núi phủ tuyết nhô sau thẻ, mặt trời và chim bay; ruộng bậc thang dưới chân.
 * - food (nhà hàng): khói nghi ngút bốc lên; đế bát dưới chân.
 * - specialty (đặc sản, quà): ba bông lúa trên đầu thẻ.
 * - transport (di chuyển): đường đi nét đứt tới ghim vị trí; mặt đường dưới chân.
 * - service (dịch vụ, cắm trại): mái lều có cờ; cọc lều hai góc.
 * - culture (lễ hội, trải nghiệm): dây đèn lồng; dải hoa văn thổ cẩm dưới chân.
 *
 * Hình kéo giãn theo bề ngang thẻ (preserveAspectRatio="none") giữ nét đều nhờ non-scaling-stroke; chi tiết không được
 * méo (khói, bông lúa, đèn, cờ, ghim) là SVG cỡ cố định đặt theo %. Rê chuột: thẻ và khung cùng nhấc lên.
 */
export type CardFrameKind = 'house' | 'mountain' | 'food' | 'specialty' | 'transport' | 'service' | 'culture';

/** Nhấc cùng nhịp với thẻ khi rê chuột (thẻ: transition transform duration-500). */
const LIFT = '';
/** Lớp SVG kéo giãn trên đầu thẻ, rộng đúng bằng thẻ. */
const TOP = `pointer-events-none absolute inset-x-0 top-0 z-10 w-full overflow-visible ${LIFT}`;
/** Nét chung: thuộc tính stroke trên <g>; vector-effect không kế thừa nên đặt riêng từng hình (NS). */
const STROKE = { stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const NS = { vectorEffect: 'non-scaling-stroke' } as const;

/** Sợi tranh trên mái nhà sàn: vạch ngắn rủ xuống từ các điểm trên hai đường cong mái (Q 0,33 → 58,29 → 100,6 và đối xứng). */
const THATCH = [0.3, 0.42, 0.54, 0.66, 0.78].flatMap((t) => {
  const x = 2 * t * (1 - t) * 58 + t * t * 100;
  const y = (1 - t) * (1 - t) * 33 + 2 * t * (1 - t) * 29 + t * t * 6;
  const len = Math.min(6, 32 - y);
  return [`M${x.toFixed(1)} ${(y + 1.5).toFixed(1)} v ${len.toFixed(1)}`, `M${(200 - x).toFixed(1)} ${(y + 1.5).toFixed(1)} v ${len.toFixed(1)}`];
}).join(' ');

/** Tám tia mặt trời quanh tâm (8, 8). */
const SUN_RAYS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  return `M${(8 + Math.cos(a) * 5.4).toFixed(1)} ${(8 + Math.sin(a) * 5.4).toFixed(1)} L${(8 + Math.cos(a) * 7.6).toFixed(1)} ${(8 + Math.sin(a) * 7.6).toFixed(1)}`;
}).join(' ');

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
      <>
        <svg viewBox="0 0 200 34" preserveAspectRatio="none" className={`${TOP} h-[34px]`}>
          <g {...STROKE}>
            <path {...NS} d="M0 33 Q 58 29 100 6 Q 142 29 200 33 Z" fill="currentColor" fillOpacity="0.1" strokeOpacity="0.6" />
            {/* Mái tranh: lớp mái trong và các sợi tranh rủ xuống */}
            <path {...NS} d="M22 32 Q 70 26 100 12 Q 130 26 178 32" fill="none" strokeOpacity="0.25" />
            <path {...NS} d={THATCH} fill="none" strokeOpacity="0.3" />
            <path {...NS} d="M80 22 Q 100 13 120 22" fill="none" strokeOpacity="0.3" />
          </g>
        </svg>
        {/* Khau cút (đôi sừng chéo cuộn đầu) và hoa văn trám ở đầu hồi: cỡ cố định để không bị kéo méo */}
        <svg viewBox="0 0 30 24" className={`pointer-events-none absolute left-1/2 -top-1 z-10 h-6 w-[30px] -translate-x-1/2 overflow-visible ${LIFT}`}>
          <g {...STROKE} strokeWidth="1.4" strokeOpacity="0.6" fill="none">
            <path d="M15 11 L 8 4 Q 5 1 3 3.5 Q 2.5 6 5 5.5 M15 11 L 22 4 Q 25 1 27 3.5 Q 27.5 6 25 5.5" />
            <path d="M15 14 L 18 17.5 L 15 21 L 12 17.5 Z" fill="currentColor" fillOpacity="0.2" strokeOpacity="0.45" />
          </g>
        </svg>
      </>
    ),
    bottom: (
      <Base height={11} inset="px-[9%]">
        {/* Dầm sàn, hai cặp cột có giằng chéo */}
        <path {...NS} d="M0 1 H 200" strokeOpacity="0.3" />
        <path {...NS} d="M6 1 V 11 M24 1 V 11 M176 1 V 11 M194 1 V 11" strokeOpacity="0.38" />
        <path {...NS} d="M6 3 L 24 9 M24 3 L 6 9 M176 3 L 194 9 M194 3 L 176 9" strokeOpacity="0.22" />
      </Base>
    ),
  },
  mountain: {
    tone: 'text-[#0a7d64]',
    pad: 'pt-[32px]',
    top: (
      <>
        <svg viewBox="0 0 200 34" preserveAspectRatio="none" className={`${TOP} h-[34px]`}>
          <g {...STROKE}>
            {/* Dãy núi xa ló ra ở hai khe giữa các đỉnh */}
            <path {...NS} d="M48 21 L 62 13 Q 65 11 68 13 L 73 17 M128 16 L 138 10 Q 141 8 144 10 L 152 20" fill="none" strokeOpacity="0.28" />
            <path {...NS} d="M0 33 L 34 18 Q 38 15 42 18 L 58 27 L 92 5 Q 100 0 108 5 L 144 25 L 158 16 Q 162 13 166 16 L 200 33 Z" fill="currentColor" fillOpacity="0.1" strokeOpacity="0.6" />
            {/* Mép tuyết răng cưa trên các đỉnh và gân sườn núi phía khuất nắng */}
            <path {...NS} d="M86 9 L 91 11 L 95 8 L 100 11.5 L 105 8 L 109 11 L 115 9" fill="none" strokeOpacity="0.4" />
            <path {...NS} d="M33 19 L 36 20.5 L 38.5 18.5 L 41 20.5 L 43.5 19 M157 17 L 160 18.5 L 162.5 16.5 L 165 18.5 L 167.5 17" fill="none" strokeOpacity="0.35" />
            <path {...NS} d="M104 9 L 112 17 M110 14 L 120 22 M164 18 L 172 25 M40 20 L 46 25" fill="none" strokeOpacity="0.22" />
          </g>
        </svg>
        {/* Mặt trời nhỏ giữa hai đỉnh và đôi chim bay: cỡ cố định */}
        <svg viewBox="0 0 16 16" className={`pointer-events-none absolute left-[70%] top-0.5 z-10 h-4 w-4 -translate-x-1/2 overflow-visible ${LIFT}`}>
          <g {...STROKE} strokeWidth="1.3" strokeOpacity="0.5" fill="none">
            <circle cx="8" cy="8" r="3.4" fill="currentColor" fillOpacity="0.15" />
            <path d={SUN_RAYS} />
          </g>
        </svg>
        <svg viewBox="0 0 24 10" className={`pointer-events-none absolute left-[20%] -top-0.5 z-10 h-2.5 w-6 -translate-x-1/2 overflow-visible ${LIFT}`}>
          <g {...STROKE} strokeWidth="1.3" strokeOpacity="0.45" fill="none">
            <path d="M1 5 Q 4 1.5 7 5 Q 10 1.5 13 5 M14 9 Q 16 7 18 9 Q 20 7 22 9" />
          </g>
        </svg>
      </>
    ),
    bottom: (
      <Base height={13}>
        {/* Ba bờ ruộng bậc thang, dưới cùng ngắn nhất, xen vài khóm lúa */}
        <path {...NS} d="M0 3 Q 50 9 100 5 T 200 3" strokeOpacity="0.35" />
        <path {...NS} d="M18 8 Q 100 3 182 8" strokeOpacity="0.28" />
        <path {...NS} d="M44 12.5 Q 100 9 156 12.5" strokeOpacity="0.2" />
        <path {...NS} d="M40 6.5 V 4.5 M70 6 V 4 M130 5 V 3 M160 4.5 V 2.5 M86 10 V 8 M118 10 V 8" strokeOpacity="0.3" />
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
      <svg viewBox="0 0 60 30" className={`pointer-events-none absolute left-1/2 top-0 z-10 h-[30px] w-[60px] -translate-x-1/2 overflow-visible ${LIFT}`}>
        {/* Ba bông lúa / cốm — đặc sản Tây Bắc */}
        <g {...STROKE} strokeOpacity="0.6">
          <g transform="translate(30 2)"><>
            <path d="M0 30 V 8" fill="none" />
            <path d="M0 8 q -3 -3 0 -8 q 3 5 0 8 Z" fill="currentColor" fillOpacity="0.2" />
            <path d="M0 15 q -5 -1 -5 -7 q 5 0 5 7 Z M0 15 q 5 -1 5 -7 q -5 0 -5 7 Z" fill="currentColor" fillOpacity="0.2" />
            <path d="M0 22 q -5 -1 -5 -7 q 5 0 5 7 Z M0 22 q 5 -1 5 -7 q -5 0 -5 7 Z" fill="currentColor" fillOpacity="0.2" />
          </></g>
          <g transform="translate(15 8) rotate(-20)"><>
            <path d="M0 30 V 8" fill="none" />
            <path d="M0 8 q -3 -3 0 -8 q 3 5 0 8 Z" fill="currentColor" fillOpacity="0.2" />
            <path d="M0 15 q -5 -1 -5 -7 q 5 0 5 7 Z M0 15 q 5 -1 5 -7 q -5 0 -5 7 Z" fill="currentColor" fillOpacity="0.2" />
            <path d="M0 22 q -5 -1 -5 -7 q 5 0 5 7 Z M0 22 q 5 -1 5 -7 q -5 0 -5 7 Z" fill="currentColor" fillOpacity="0.2" />
          </></g>
          <g transform="translate(45 8) rotate(20)"><>
            <path d="M0 30 V 8" fill="none" />
            <path d="M0 8 q -3 -3 0 -8 q 3 5 0 8 Z" fill="currentColor" fillOpacity="0.2" />
            <path d="M0 15 q -5 -1 -5 -7 q 5 0 5 7 Z M0 15 q 5 -1 5 -7 q -5 0 -5 7 Z" fill="currentColor" fillOpacity="0.2" />
            <path d="M0 22 q -5 -1 -5 -7 q 5 0 5 7 Z M0 22 q 5 -1 5 -7 q -5 0 -5 7 Z" fill="currentColor" fillOpacity="0.2" />
          </></g>
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
  const { tone, bottom } = FRAMES[kind];
  // Đã bỏ phần trang trí trên đầu thẻ (top/pad) và hiệu ứng nhấc lên khi rê chuột.
  return (
    <div className="group/frame relative flex h-full flex-col">
      {/* Thẻ giãn hết phần còn lại (các thẻ cùng hàng cao bằng nhau). */}
      <div className="flex min-h-0 flex-1 flex-col *:flex-1">{children}</div>
      {bottom && <div aria-hidden className={`contents ${tone}`}>{bottom}</div>}
    </div>
  );
}
