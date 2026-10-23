import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * Mặt trống đồng Đông Sơn (theo bố cục trống Ngọc Lũ) vẽ bằng SVG, có chuyển động: lúc cuộn tới thì các nét "được vẽ" dần
 * từ ngôi sao giữa ra vành ngoài, xong thì các vành hoa văn xoay chậm — người, hươu, chim đều đi ngược chiều kim đồng hồ
 * như trên mặt trống thật, ngôi sao giữa tỏa sáng nhịp nhàng.
 *
 * Từ tâm ra: mặt trời 14 tia xen lông công · hoa văn móc chữ S · hàng hạt · vòng tròn kép chấm giữa nối tiếp tuyến · răng lược ·
 * vành cảnh sinh hoạt chia hai nửa đối xứng (nhà sàn mái thuyền, đoàn người hóa trang lông chim cầm giáo, giã gạo chày
 * đôi) · hàng hạt · vòng tròn tiếp tuyến · răng lược · 10 hươu xen chim mỏ dài · răng lược · 18 chim Lạc bay · vành ngoài.
 *
 * Hình người, thú, chim theo lối đúc nổi Đông Sơn: khối đặc, mũ lông, váy, cánh, đuôi có mép răng cưa; mái nhà khắc gạch
 * song song (mẫu `hatch`); hình nối nhau dày như một đoàn diễu hành.
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

/** Như `ink` nhưng tô nền (`fill` mặc định đặc; truyền url mẫu gạch cho khối thân khắc gạch). */
function solid(delay: number, fill = 'currentColor'): { pathLength: number; className: string; style: CSSProperties; fill: string } {
  return { pathLength: 1, className: 'drum-ink drum-fill', style: { transitionDelay: `${Math.round(delay)}ms` }, fill };
}

/** Chấm đặc (nét + nền) — dùng cho tâm sao, chấm giữa vòng tròn, hàng hạt, đầu người. */
function Dot({ x, y, r, delay }: { x: number; y: number; r: number; delay: number }) {
  return <circle cx={x} cy={y} r={r} {...solid(delay)} />;
}

const STAR_POINTS = 14;

/**
 * Mặt trời 14 tia ở tâm như trống Ngọc Lũ: đĩa tròn đồng tâm, 14 tia nhọn đặc, giữa các tia là ba chữ V lồng nhau (hoa văn
 * lông công) và một vạch dọc.
 */
function Sun({ outer }: { outer: number }) {
  const step = 360 / STAR_POINTS;
  return (
    <>
      <circle r="6.8" {...ink(80)} />
      <circle r="4.4" {...ink(140)} />
      <Dot x={0} y={0} r={2} delay={200} />
      {Array.from({ length: STAR_POINTS }, (_, i) => {
        const deg = i * step;
        const [ax, ay] = polar(7.6, deg - 7.5);
        const [tx, ty] = polar(outer, deg);
        const [cx, cy] = polar(7.6, deg + 7.5);
        const mid = deg + step / 2;
        const d = 300 + i * 45;
        const v = (r: number, w: number) => {
          const [px, py] = polar(r, mid - w);
          const [qx, qy] = polar(r + 3, mid);
          const [rx, ry] = polar(r, mid + w);
          return `M${px} ${py} L${qx} ${qy} L${rx} ${ry}`;
        };
        const [sx, sy] = polar(9.5, mid);
        const [ex, ey] = polar(outer - 1.5, mid);
        return (
          <g key={i}>
            <path d={`M${ax} ${ay} L${tx} ${ty} L${cx} ${cy} Z`} {...solid(d)} />
            <path d={`${v(11, 5.6)} ${v(15, 4.4)} ${v(19, 3.4)}`} strokeWidth={0.6} {...ink(d + 100)} />
            <path d={`M${sx} ${sy} L${ex} ${ey}`} strokeWidth={0.5} {...ink(d + 180)} />
          </g>
        );
      })}
    </>
  );
}

/** Vành vòng tròn có chấm giữa, nối nhau bằng tiếp tuyến chéo — hoa văn đặc trưng của trống đồng. `ring` thêm vòng tròn kép. */
function TangentCircles({ radius, count, size, delay, ring = false }: { radius: number; count: number; size: number; delay: number; ring?: boolean }) {
  const step = 360 / count;
  return (
    <g strokeWidth={0.6}>
      {Array.from({ length: count }, (_, i) => {
        const deg = i * step;
        const [x, y] = polar(radius, deg);
        const [ax, ay] = polar(radius + size, deg + step * 0.18);
        const [bx, by] = polar(radius - size, deg + step * 0.82);
        const d = delay + (i * 900) / count;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={size} {...ink(d)} />
            {ring && <circle cx={x} cy={y} r={size * 0.6} {...ink(d + 30)} />}
            <Dot x={x} y={y} r={size * 0.24} delay={d} />
            <path d={`M${ax} ${ay} L${bx} ${by}`} {...ink(d + 60)} />
          </g>
        );
      })}
    </g>
  );
}

/** Hàng hạt: chấm đặc đều quanh một vòng. */
function Pearls({ radius, count, size, delay }: { radius: number; count: number; size: number; delay: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const [x, y] = polar(radius, (i * 360) / count);
        return <Dot key={i} x={x} y={y} r={size} delay={delay + (i * 900) / count} />;
      })}
    </>
  );
}

/** Vành răng lược (gạch ngắn hướng tâm, hơi xiên như nét khắc) — gộp thành một path, vẽ một lượt quanh trống. */
function Ticks({ inner, outer, count, delay, slant = 0 }: { inner: number; outer: number; count: number; delay: number; slant?: number }) {
  const d = Array.from({ length: count }, (_, i) => {
    const deg = (i * 360) / count;
    const [ax, ay] = polar(inner, deg);
    const [bx, by] = polar(outer, deg + slant);
    return `M${ax} ${ay} L${bx} ${by}`;
  }).join(' ');
  return <path d={d} strokeWidth={0.45} strokeLinecap="butt" {...ink(delay)} className="drum-ink drum-ink-slow" />;
}

/**
 * Một hình trên vành hoa văn, vẽ trong khung riêng: đứng thẳng, đầu hướng ra mép trống (y âm), chân về phía tâm, mặt quay
 * về -x (tức ngược chiều kim đồng hồ khi đặt lên vòng). `w`: bề ngang chiếm chỗ. Theo lối trống thật, hình là khối đặc đúc
 * nổi (`solid`) — mũ lông, váy lông, cánh, đuôi là khối có mép răng cưa thay cho từng sợi lông; `hatch`: khối khắc gạch
 * song song (mái nhà), `bold`: nét đậm (tay chân), `ink`: nét mảnh.
 */
interface Figure {
  w: number;
  ink: string[];
  hatch?: string[];
  solid?: string[];
  bold?: string[];
  dots?: [number, number, number][];
}

/** Nhà sàn mái cong hình thuyền: mái dày khắc gạch, hai đầu mái vút cao có chim đậu, trong nhà hai người ngồi bên ché. */
const HOUSE: Figure = {
  w: 27,
  hatch: ['M-12.4 -9.6 C -9.6 -6.4 -5.6 -6 0 -6 C 5.6 -6 9.6 -6.4 12.4 -9.6 L 10.6 -4.4 C 8 -2.2 4.6 -2 0 -2 C -4.6 -2 -8 -2.2 -10.6 -4.4 Z'],
  solid: [
    'M-1.6 0.8 C -1.6 -0.4 1.6 -0.4 1.6 0.8 L 1.2 3.4 L -1.2 3.4 Z',
    'M-12.4 -9.6 L -15 -10.6 L -13.4 -11.4 L -12.6 -10.6 Z',
    'M12.4 -9.6 L 15 -10.6 L 13.4 -11.4 L 12.6 -10.6 Z',
    'M-5.9 3.4 L -5.9 1.6 C -5.9 0.8 -4.1 0.8 -4.1 1.6 L -4.1 3.4 Z M4.1 3.4 L 4.1 1.6 C 4.1 0.8 5.9 0.8 5.9 1.6 L 5.9 3.4 Z',
  ],
  bold: ['M-7.4 -2.4 L -7.4 9 M-2.6 -2 L -2.6 9 M2.6 -2 L 2.6 9 M7.4 -2.4 L 7.4 9', 'M-10.4 3.6 L 10.4 3.6'],
  ink: [
    'M0 -6 L 0 -8.4 M-1.4 -8.4 L 1.4 -8.4',
    'M-10 4.8 L 10 4.8',
    'M-10 4.8 L -12 9 M-10.6 6.2 L -9.4 6.2 M-11.2 7.6 L -10 7.6',
  ],
  dots: [[-5, 0, 1], [5, 0, 1]],
};

/** Người hóa trang lông chim: mũ lông lớn vắt ra sau, mặt nạ mỏ chim, tay cầm giáo, váy lông dài phía sau, bước đi. */
const WARRIOR: Figure = {
  w: 18,
  solid: [
    'M-1.6 -4.4 C -2 -6.6 -1.4 -8.4 0 -9.8 C -0.4 -8 -0.4 -6.2 -0.6 -4.4 Z',
    'M-1.2 -4.4 C 1 -7.6 4.6 -9.4 9 -9.2 C 5.4 -8.4 2.4 -6.8 -0.2 -3.8 Z',
    'M-0.6 -4 C 2 -6 5.4 -6.8 10 -6.2 C 6 -5.6 3 -4.8 0 -3.2 Z',
    'M-0.2 -3.4 C 2.6 -4 6 -4 9.6 -3 C 6 -2.8 3 -2.6 0 -2.6 Z',
    'M-2.3 -4.3 L -4.4 -3.4 L -2.2 -2.7 Z',
    'M-2.6 -2.6 L 0.6 -2.6 L 1.3 2.4 L -2.1 2.4 Z',
    'M0.9 1.6 C 3.6 0.8 6.6 0.8 10 1.8 C 6.6 1.8 3.6 2.2 1 2.8 Z',
    'M0.8 2.6 C 3.4 3 6 4.2 8.6 6.2 C 5.8 5 3.2 4 0.6 3.4 Z',
    'M-6 -7.6 L -6.9 -9.8 L -5 -8 Z',
  ],
  bold: ['M-2 -1.6 L -4 -0.6 L -4.6 -2.4', 'M-1.4 2.2 L -2.8 5.2 L -2.2 8.6 M0.6 2.2 L 1.6 5.4 L 0.8 8.6'],
  ink: ['M-6 -7.6 L -3.4 3.6', 'M-2.2 8.6 L -3.6 8.6 M0.8 8.6 L -0.6 8.6', 'M0.2 -9.6 L -0.4 -11 M3 -9.8 L 3.2 -11.2'],
  dots: [[-1.2, -3.6, 1.4]],
};

/** Hai người đội lông chim giã gạo chày đôi bên cối. */
const POUNDERS: Figure = {
  w: 21,
  solid: [
    'M-2.4 4.4 L 2.4 4.4 L 1.5 9 L -1.5 9 Z',
    'M-6 -2.2 L -4 4 L -8.2 4 Z',
    'M6 -2.2 L 8.2 4 L 4 4 Z',
    'M-6.4 -4 C -7 -6.4 -9 -7.6 -11 -7.4 L -9.6 -6.6 L -11.6 -5.8 L -9.8 -5 L -11.4 -4 C -9.6 -3.8 -8 -3.6 -6.4 -3.2 Z',
    'M6.4 -4 C 7 -6.4 9 -7.6 11 -7.4 L 9.6 -6.6 L 11.6 -5.8 L 9.8 -5 L 11.4 -4 C 9.6 -3.8 8 -3.6 6.4 -3.2 Z',
  ],
  bold: [
    'M-3.4 -9 L -0.6 4.4 M3.4 -9 L 0.6 4.4',
    'M-5.8 -1.4 L -2.8 -3.6 M-5.6 -0.6 L -2.4 -1.6 M-7 4 L -7.2 9 M-5.4 4 L -5 9',
    'M5.8 -1.4 L 2.8 -3.6 M5.6 -0.6 L 2.4 -1.6 M7 4 L 7.2 9 M5.4 4 L 5 9',
  ],
  ink: [],
  dots: [[-6, -3.2, 1.3], [6, -3.2, 1.3]],
};

/** Hươu đực: thân đặc, cổ dài, gạc nhiều nhánh, chân mảnh. */
const DEER: Figure = {
  w: 18,
  solid: [
    'M-5.6 -1 C -3 -3 3.6 -3 6.2 -1.2 C 7 0.4 5.6 2 3.8 2 C 0.6 2.6 -3 2.4 -5 1.4 C -6 0.6 -6.2 -0.4 -5.6 -1 Z',
    'M-5.6 -0.6 L -7.4 -5.4 L -5.8 -5.9 L -3.8 -1.6 Z',
    'M-7.4 -5.6 L -10.4 -4.6 L -10 -3.8 L -6.2 -4.2 Z',
    'M6.2 -1.2 L 7.8 -2.8 L 7.2 -0.6 Z',
  ],
  bold: ['M-4.4 1.2 L -5.2 4.4 L -4.6 7 M-2.8 1.8 L -3 7 M3 1.8 L 3.4 4.6 L 2.6 7 M4.8 1.2 L 5.6 7', 'M-6.8 -5.6 C -7 -7.4 -6.4 -9 -5 -10'],
  ink: ['M-6.7 -7.2 L -8.6 -8.4 M-6.1 -8.8 L -7.4 -10.4 M-5.6 -9.6 L -3.8 -10.2 M-6.2 -5.8 L -5 -6.8'],
};

/** Chim mỏ dài đứng: mào chùm, cổ cong, thân đặc, đuôi xòe răng cưa. */
const HERON: Figure = {
  w: 21,
  solid: [
    'M-3.6 -0.4 C -1 -3.2 4.2 -3.2 7 0 C 4 2.2 -1 2.2 -3.6 -0.4 Z',
    'M6.6 -0.2 L 10.4 -2.8 L 9.6 -0.6 L 10.8 0.6 L 9.4 1.2 L 10.2 2.6 L 6.4 0.8 Z',
    'M-3.8 -6.8 L -10.4 -5.4 L -3.6 -5.7 Z',
    'M-2.6 -6.8 C -1 -8.8 1 -9.4 3 -9.2 L 1.6 -8.4 L 3.2 -7.8 C 1.2 -7.6 -0.6 -7 -2 -6 Z',
  ],
  bold: ['M-3 -1 C -4.8 -2.4 -4.6 -4.8 -3.2 -6', 'M0.4 1.3 L 0 6.6 M2.4 1.3 L 2.8 6.6'],
  ink: ['M0 6.6 L -1.4 7 M0 6.6 L 0.4 7.2 M2.8 6.6 L 1.4 7 M2.8 6.6 L 3.2 7.2'],
  dots: [[-3, -6.3, 1.2]],
};

/** Chim Lạc bay: mỏ rất dài, mào chùm, cổ vươn, cánh giương có răng lông, đuôi dài xòe, đôi chân duỗi ra sau. */
const LAC_BIRD: Figure = {
  w: 42,
  solid: [
    'M-7 -0.4 C -3 -2.8 5 -2.8 9 -0.8 C 5 1.6 -3 1.8 -7 -0.4 Z',
    'M-3 -1.8 C -2 -5 1 -7.6 5.6 -8.6 L 4.6 -7 L 6.6 -7.2 L 5.2 -5.6 L 7.2 -5.6 L 5.4 -3.8 L 7 -3.6 L 4.2 -1.8 Z',
    'M8.6 -1 C 11 -2.6 13.4 -4 16 -4.8 L 14.6 -2.6 L 16.6 -1.4 L 14.6 -0.4 L 15.8 1.8 C 13 1.2 10.6 0.6 8.6 0 Z',
    'M-6.8 -1 C -9 -2.1 -10.6 -2.9 -12.2 -3.2 L -12.2 -1.9 C -10.6 -1.7 -9 -0.7 -6.8 0.4 Z',
    'M-14 -3 L -26 -1.6 L -14 -1.8 Z',
    'M-12.8 -3.6 C -11.6 -5.8 -9.6 -7 -7 -7.2 L -8.4 -6.2 L -6.8 -5.6 C -8.8 -5.4 -10.6 -4.6 -12 -3.2 Z',
  ],
  bold: ['M1.4 1.2 L 9 4.6 L 13 4.6 M3.4 1 L 10 3 L 14 3'],
  ink: [],
  dots: [[-13, -2.5, 1.4]],
};

/**
 * Vành hoa văn móc (chữ S gãy nối nhau) như vành sát ngôi sao trên trống thật — mỗi móc là một nét gập bốn lần, gộp thành
 * một path.
 */
function Meander({ inner, outer, count, delay }: { inner: number; outer: number; count: number; delay: number }) {
  const h = outer - inner;
  const step = 360 / count;
  const at = (rf: number, af: number, i: number) => polar(inner + rf * h, (i + af) * step).join(' ');
  const d = Array.from({ length: count }, (_, i) =>
    `M${at(0, 0, i)} L${at(1, 0, i)} L${at(1, 0.78, i)} L${at(0.3, 0.78, i)} L${at(0.3, 0.32, i)} L${at(0.66, 0.32, i)}`,
  ).join(' ');
  return <path d={d} strokeWidth={0.5} strokeLinecap="butt" strokeLinejoin="miter" {...ink(delay)} className="drum-ink drum-ink-slow" />;
}

/**
 * Một vành hình: lặp `pattern` `repeat` lần quanh vòng bán kính `radius`, khoảng hở chia đều, mỗi hình phóng `scale`.
 */
function Frieze({ radius, pattern, repeat, scale, delay, hatch }: { radius: number; pattern: Figure[]; repeat: number; scale: number; delay: number; hatch: string }) {
  const items = Array.from({ length: repeat }, () => pattern).flat();
  const circ = 2 * Math.PI * radius;
  const used = items.reduce((sum, f) => sum + f.w * scale, 0);
  const gap = Math.max(0, circ - used) / items.length;
  let at = 0;
  return (
    <>
      {items.map((f, i) => {
        const deg = ((at + (f.w * scale) / 2) / circ) * 360;
        at += f.w * scale + gap;
        const d = delay + (i * 1200) / items.length;
        return (
          <g key={i} transform={`rotate(${deg.toFixed(2)}) translate(0 ${-radius}) scale(${scale})`} strokeWidth={0.8 / scale}>
            {f.hatch?.map((p, k) => <path key={`h${k}`} d={p} {...solid(d, `url(#${hatch})`)} className="drum-ink drum-fill drum-mass" />)}
            {f.solid?.map((p, k) => <path key={`s${k}`} d={p} {...solid(d)} className="drum-ink drum-fill drum-mass" />)}
            {f.bold?.map((p, k) => <path key={`b${k}`} d={p} strokeWidth={1.6 / scale} {...ink(d + 20 + k * 40)} />)}
            {f.ink.map((p, k) => <path key={k} d={p} {...ink(d + 40 + k * 40)} />)}
            {f.dots?.map(([x, y, r], k) => <Dot key={`d${k}`} x={x} y={y} r={r} delay={d + 120} />)}
          </g>
        );
      })}
    </>
  );
}

/** Các vòng tròn đồng tâm phân chia các vành, phần lớn là vòng kép (không xoay — xoay vòng tròn cũng không khác gì). */
const RINGS = [27, 28.2, 32, 34.4, 35.6, 43.2, 44.4, 48, 49.2, 71, 72.2, 74.6, 81.4, 82.6, 86, 87.2, 101, 102.2, 105.6, 106.8, 121, 122.2, 126.6, 127.8];

interface Layer {
  /** Thời gian một vòng (giây); âm = ngược chiều kim đồng hồ. 0 = đứng yên. */
  spin: number;
  /** `hatch`: id mẫu gạch song song (khai báo ở lớp đầu, riêng cho từng trống vì mỗi phần trang có màu riêng). */
  render: (hatch: string) => ReactNode;
}

const LAYERS: Layer[] = [
  {
    spin: 0,
    render: (hatch) => (
      <>
        <defs>
          <pattern id={hatch} width="1.1" height="1.1" patternUnits="userSpaceOnUse" patternTransform="rotate(65)">
            <path d="M0 -1 V3" stroke="currentColor" strokeWidth="0.55" />
          </pattern>
        </defs>
        {RINGS.map((r, i) => <circle key={r} r={r} strokeWidth={0.6} {...ink(i * 70)} className="drum-ink drum-ink-slow" />)}
        <circle r={129.4} strokeWidth={1.4} {...ink(1800)} className="drum-ink drum-ink-slow" />
        <Meander inner={28.8} outer={31.4} count={56} delay={700} />
        <Ticks inner={44.4} outer={48} count={220} delay={1000} slant={-0.6} />
        <Ticks inner={82.6} outer={86} count={360} delay={1600} slant={0.5} />
        <Ticks inner={102.2} outer={105.6} count={420} delay={2000} slant={-0.4} />
        <Ticks inner={122.2} outer={126.6} count={480} delay={2400} slant={0.4} />
      </>
    ),
  },
  { spin: 160, render: () => <><Sun outer={26} /><Pearls radius={33.2} count={64} size={0.5} delay={900} /><TangentCircles radius={39.4} count={36} size={3} delay={900} ring /></> },
  { spin: -120, render: (hatch) => <Frieze radius={60} pattern={[HOUSE, WARRIOR, WARRIOR, WARRIOR, POUNDERS, WARRIOR, WARRIOR, WARRIOR]} repeat={2} scale={1.05} delay={1200} hatch={hatch} /> },
  { spin: 140, render: () => <><Pearls radius={73.4} count={150} size={0.45} delay={1400} /><TangentCircles radius={78} count={80} size={2.4} delay={1500} /></> },
  { spin: -95, render: (hatch) => <Frieze radius={93} pattern={[DEER, HERON, HERON]} repeat={10} scale={0.78} delay={1700} hatch={hatch} /> },
  { spin: -75, render: (hatch) => <Frieze radius={113} pattern={[LAC_BIRD]} repeat={18} scale={0.9} delay={2100} hatch={hatch} /> },
];

/** `draw`: ép bắt đầu vẽ (phần chứa nó vừa tới); không thì trống tự vẽ khi lên tới 65% phía trên màn hình. */
export default function DongSonDrum({ className = '', draw = false }: { className?: string; draw?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const hatch = `drum-hatch${useId().replace(/:/g, '')}`;
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
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`drum-layer ${spin ? 'drum-spin' : ''}`}
          style={spin ? ({ '--spin': `${Math.abs(spin)}s`, animationDirection: spin < 0 ? 'reverse' : 'normal' } as CSSProperties) : undefined}
        >
          {render(hatch)}
        </svg>
      ))}
    </div>
  );
}
