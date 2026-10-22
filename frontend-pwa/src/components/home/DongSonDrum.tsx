import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * Mặt trống đồng Đông Sơn vẽ bằng SVG, có chuyển động: lúc cuộn tới thì các nét "được vẽ" dần quanh vòng tròn (từ ngôi sao
 * giữa ra vành ngoài), xong thì các vành hoa văn xoay chậm ngược chiều nhau — đàn chim Lạc bay ngược chiều kim đồng hồ như
 * trên mặt trống thật, ngôi sao giữa tỏa sáng nhịp nhàng.
 *
 * Hiệu năng: mỗi vành xoay là một thẻ <svg> riêng nên trình duyệt chỉ xoay lớp đã vẽ sẵn (compositor), không vẽ lại SVG
 * mỗi khung hình. Ra khỏi màn hình thì dừng hẳn; prefers-reduced-motion thì hiện tĩnh. CSS: globals.css (.dongson).
 */

/** Tọa độ cực → Descartes (tâm 0,0; góc độ, 0° hướng lên, chiều kim đồng hồ). */
function polar(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [+(r * Math.cos(a)).toFixed(2), +(r * Math.sin(a)).toFixed(2)];
}

/** Nét vẽ được: pathLength=1 để CSS vẽ dần bằng stroke-dashoffset; `delay` (ms) lệch dần quanh vòng cho cảm giác nét tay. */
function ink(delay: number): { pathLength: number; className: string; style: CSSProperties } {
  return { pathLength: 1, className: 'drum-ink', style: { transitionDelay: `${Math.round(delay)}ms` } };
}

const STAR_POINTS = 14;

/** Ngôi sao 14 cánh ở tâm + hoa văn lông công (chữ V) giữa các cánh. */
function Sun() {
  const pts = Array.from({ length: STAR_POINTS * 2 }, (_, i) => polar(i % 2 === 0 ? 34 : 12, (i * 180) / STAR_POINTS));
  const star = `M${pts.map(([x, y]) => `${x} ${y}`).join(' L')} Z`;
  return (
    <>
      <path d={star} fill="currentColor" className="drum-ink drum-fill" pathLength={1} />
      {Array.from({ length: STAR_POINTS }, (_, i) => {
        const mid = ((i + 0.5) * 360) / STAR_POINTS;
        const [ax, ay] = polar(20, mid - 6);
        const [bx, by] = polar(27, mid);
        const [cx, cy] = polar(20, mid + 6);
        return <path key={i} d={`M${ax} ${ay} L${bx} ${by} L${cx} ${cy}`} {...ink(500 + i * 40)} />;
      })}
      <circle r="4" {...ink(200)} />
    </>
  );
}

/** Vành vòng tròn có chấm giữa, nối nhau bằng tiếp tuyến chéo — hoa văn đặc trưng của trống đồng. */
function TangentCircles({ radius, count, size, delay }: { radius: number; count: number; size: number; delay: number }) {
  const step = 360 / count;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const deg = i * step;
        const [x, y] = polar(radius, deg);
        const [ax, ay] = polar(radius + size, deg + step * 0.18);
        const [bx, by] = polar(radius - size, deg + step * 0.82);
        const d = delay + (i * 900) / count;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={size} {...ink(d)} />
            <circle cx={x} cy={y} r={size * 0.28} fill="currentColor" className="drum-ink drum-fill" pathLength={1} style={{ transitionDelay: `${Math.round(d)}ms` }} />
            <path d={`M${ax} ${ay} L${bx} ${by}`} {...ink(d + 60)} />
          </g>
        );
      })}
    </>
  );
}

/** Vành vạch răng lược (các gạch ngắn hướng tâm). */
function Ticks({ inner, outer, count, delay }: { inner: number; outer: number; count: number; delay: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const deg = (i * 360) / count;
        const [ax, ay] = polar(inner, deg);
        const [bx, by] = polar(outer, deg);
        return <path key={i} d={`M${ax} ${ay} L${bx} ${by}`} {...ink(delay + (i * 900) / count)} />;
      })}
    </>
  );
}

/** Vành răng cưa chạy một vòng liền (vẽ một nét quanh trống). */
function Zigzag({ inner, outer, count, delay }: { inner: number; outer: number; count: number; delay: number }) {
  const pts = Array.from({ length: count * 2 + 1 }, (_, i) => polar(i % 2 === 0 ? inner : outer, (i * 180) / count));
  return <path d={`M${pts.map(([x, y]) => `${x} ${y}`).join(' L')}`} {...ink(delay)} className="drum-ink drum-ink-slow" />;
}

/**
 * Chim Lạc cách điệu (mỏ dài, mào lông, cánh giương, đuôi dài). Khung riêng: bay theo trục +x, bụng (chân) quay ra vành
 * ngoài.
 */
const BIRD = [
  'M-10 0 C -4 -5, 6 -5, 10 -1 C 6 3, -4 3, -10 0 Z',
  'M10 -1 C 12 -4, 14 -6, 17 -6 L 31 -2.5 L 16 -3.5',
  'M16 -6 C 14 -11, 10 -13, 5 -14 M17 -6 C 17 -11, 15 -14, 11 -17',
  'M-1 -3 C -3 -10, -9 -14, -16 -15 M3 -3 C 1 -9, -3 -12, -8 -13',
  'M-10 0 C -16 2, -22 4, -29 8 M-10 0 C -16 0, -22 0, -28 2 M-10 0 C -15 -2, -20 -3, -26 -5',
  'M1 2 L 3 7 M5 2 L 7 7',
];

function Birds({ radius, count, delay }: { radius: number; count: number; delay: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const deg = (i * 360) / count;
        const d = delay + i * 140;
        // Đặt chim ở vị trí `deg` trên vòng, xoay để đầu chim hướng ngược chiều kim đồng hồ.
        return (
          <g key={i} transform={`rotate(${deg}) translate(0 ${-radius}) rotate(180)`}>
            {BIRD.map((p, k) => <path key={k} d={p} {...ink(d + k * 50)} />)}
            <circle cx="15.5" cy="-4.5" r="0.9" fill="currentColor" stroke="none" />
          </g>
        );
      })}
    </>
  );
}

/** Các vòng tròn đồng tâm phân chia vành (không xoay — xoay vòng tròn cũng không khác gì). */
const RINGS = [40, 52, 64, 100, 112, 123, 127];

interface Layer {
  /** Thời gian một vòng (giây); âm = ngược chiều kim đồng hồ. 0 = đứng yên. */
  spin: number;
  render: () => ReactNode;
}

const LAYERS: Layer[] = [
  { spin: 0, render: () => RINGS.map((r, i) => <circle key={r} r={r} {...ink(i * 120)} className="drum-ink drum-ink-slow" />) },
  { spin: 160, render: () => <Sun /> },
  { spin: -110, render: () => <><TangentCircles radius={46} count={22} size={5} delay={700} /><Ticks inner={54} outer={62} count={84} delay={1000} /></> },
  { spin: -70, render: () => <Birds radius={82} count={8} delay={1300} /> },
  { spin: 140, render: () => <><Zigzag inner={102} outer={110} count={56} delay={1700} /><TangentCircles radius={117.5} count={44} size={3.6} delay={1900} /></> },
];

/** `draw`: ép bắt đầu vẽ (phần chứa nó vừa tới); không thì trống tự vẽ khi lên tới 65% phía trên màn hình. */
export default function DongSonDrum({ className = '', draw = false }: { className?: string; draw?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  // Trình duyệt không có IntersectionObserver: vẽ và xoay luôn.
  const noObserver = typeof window !== 'undefined' && !('IntersectionObserver' in window);
  const [inView, setInView] = useState(noObserver);
  const [seenDrawn, setDrawn] = useState(noObserver);
  const drawn = seenDrawn || draw;

  useEffect(() => {
    const el = ref.current;
    if (!el || noObserver) return undefined;
    // Xoay chỉ khi đang trong màn hình; còn "vẽ" chỉ bắt đầu khi trống lên tới 65% phía trên màn hình — màn hình cao thì
    // trống có thể đã nằm sẵn ở mép dưới lúc mới mở trang, vẽ ngay lúc đó khách chưa kịp thấy.
    const seen = new IntersectionObserver((entries) => setInView(entries.some((entry) => entry.isIntersecting)), { threshold: 0.12 });
    const draw = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setDrawn(true);
      draw.disconnect();
    }, { threshold: 0.25, rootMargin: '0px 0px -35% 0px' });
    seen.observe(el);
    draw.observe(el);
    return () => {
      seen.disconnect();
      draw.disconnect();
    };
  }, [noObserver]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`dongson ${drawn ? 'is-drawn' : ''} ${className}`}
      data-paused={inView ? undefined : ''}
    >
      <div className="drum-glow" />
      {LAYERS.map(({ spin, render }, i) => (
        <svg
          key={i}
          viewBox="-130 -130 260 260"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`drum-layer ${spin ? 'drum-spin' : ''}`}
          style={spin ? ({ '--spin': `${Math.abs(spin)}s`, animationDirection: spin < 0 ? 'reverse' : 'normal' } as CSSProperties) : undefined}
        >
          {render()}
        </svg>
      ))}
    </div>
  );
}
