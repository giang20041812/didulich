import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { LogoMark } from '@/components/ui/logo';

/** Nền xanh lá rừng đậm, sẫm dần ra mép, ánh nắng vàng ấm ở phía mặt trời mọc. */
const BACKDROP =
  'radial-gradient(ellipse at 72% 78%, rgba(250,190,40,0.22) 0%, rgba(250,190,40,0) 45%), radial-gradient(circle at center, #11452a 0%, #04180d 100%)';

/** Mốc thời gian (ms): icon + chữ hiện xong thì bay về đúng chỗ logo ở hero trang chủ, rồi nền mờ đi. */
const FLY_AT_MS = 950;
const FLY_DURATION_S = 0.55;
/** Không bay được (không ở trang chủ, đã cuộn xuống, chưa có hero) thì đóng sau khoảng này. */
const FALLBACK_DISMISS_MS = 1500;

interface Fly {
  logo: { x: number; y: number; scale: number };
  word: { x: number; y: number; scale: number };
}

const visibleRect = (el: Element | null) => {
  const r = el?.getBoundingClientRect();
  return r && r.width > 0 && r.height > 0 ? r : null;
};

/** Đo chỗ logo và tiêu đề "Du Lịch" của hero trang chủ (đánh dấu data-intro-*) so với vị trí hiện tại của màn chào. */
function measureFly(logoEl: HTMLElement | null, wordEl: HTMLElement | null): Fly | null {
  if (window.location.pathname !== '/' || window.scrollY > 4 || !logoEl || !wordEl) return null;
  const logoTarget = Array.from(document.querySelectorAll('[data-intro-logo] > span'))
    .map(visibleRect)
    .find(Boolean);
  const wordTarget = Array.from(document.querySelectorAll('[data-intro-word]'))
    .map((h1) => {
      // Đo theo vùng chữ (không phải hộp h1, line-height khác) để cùng hệ quy chiếu với <span> của màn chào.
      const range = document.createRange();
      range.selectNodeContents(h1);
      return visibleRect({ getBoundingClientRect: () => range.getBoundingClientRect() } as Element);
    })
    .find(Boolean);
  const logo = visibleRect(logoEl);
  const word = visibleRect(wordEl);
  if (!logoTarget || !wordTarget || !logo || !word) return null;
  return {
    logo: { x: logoTarget.left - logo.left, y: logoTarget.top - logo.top, scale: logoTarget.width / logo.width },
    word: { x: wordTarget.left - word.left, y: wordTarget.top - word.top, scale: wordTarget.height / word.height },
  };
}

const EASE = [0.16, 1, 0.3, 1] as const;

type Pt = readonly [number, number];

/** Toạ độ dưới đây đo trên chính ảnh banner hero (hệ 1280 × 720), nên khi đặt đúng khung ảnh các nét trùng với núi, bậc ruộng, mặt trời thật. */
const W = 1280;
const H = 720;
/** Hero thấp hơn màn hình: kéo vùng tô xuống thêm để phần dưới khung ảnh không bị trống. */
const BELOW = 300;

/** Đường cong mượt (Catmull-Rom → Bézier) đi qua các điểm. */
function curve(pts: readonly Pt[], move = true): string {
  let d = move ? `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}` : '';
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/** Vùng tô từ đường sống núi xuống đáy, kéo hai đầu ra ngoài khung để không có vách đứng. */
const below = (pts: readonly Pt[]) => {
  const full: Pt[] = [[-40, pts[0][1]], ...pts, [W + 40, pts[pts.length - 1][1]]];
  return `${curve(full)}L${W + 40} ${H + BELOW}L-40 ${H + BELOW}Z`;
};

/** Dải giữa hai đường bờ ruộng liên tiếp. */
const bandBetween = (a: readonly Pt[], b: readonly Pt[]) => {
  const back = [...b].reverse();
  return `${curve(a)}L${back[0][0]} ${back[0][1]}${curve(back, false)}Z`;
};

/** Lấy mẫu lại đường gấp khúc thành `n` điểm cách đều theo chỉ số. */
const resample = (pts: readonly Pt[], n: number): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const f = (i / (n - 1)) * (pts.length - 1);
    const i0 = Math.floor(f);
    const i1 = Math.min(i0 + 1, pts.length - 1);
    const t = f - i0;
    return [pts[i0][0] + (pts[i1][0] - pts[i0][0]) * t, pts[i0][1] + (pts[i1][1] - pts[i0][1]) * t] as Pt;
  });

/** Chèn thêm đường bờ ruộng ở giữa mỗi cặp đường liền kề để bậc ruộng dày và mịn hơn. */
const densify = (lines: readonly Pt[][]): Pt[][] => {
  const out: Pt[][] = [];
  lines.forEach((line, i) => {
    out.push([...line]);
    const next = lines[i + 1];
    if (!next) return;
    const a = resample(line, 14);
    const b = resample(next, 14);
    out.push(a.map((p, k) => [(p[0] + b[k][0]) / 2, (p[1] + b[k][1]) / 2] as Pt));
  });
  return out;
};

/** Nội suy `n` đường bờ ruộng nằm giữa đường trên `top` và đường dưới `bottom` (cùng số điểm). */
const contours = (top: readonly Pt[], bottom: readonly Pt[], n: number): Pt[][] =>
  Array.from({ length: n }, (_, k) => {
    const t = n === 1 ? 0 : k / (n - 1);
    return top.map((p, i) => [p[0] + (bottom[i][0] - p[0]) * t, p[1] + (bottom[i][1] - p[1]) * t] as Pt);
  });

const SUN = { x: 1103, y: 210 };

/** Tia nắng toả đủ một vòng 360° quanh mặt trời: mỗi tia gồm 3 lớp nêm chồng nhau (rộng → hẹp) để mép mờ dần, không bị cứng. */
const SHAFT_COUNT = 24;
const SHAFT_LAYERS = [
  { widen: 2.4, opacity: 0.35 },
  { widen: 1.5, opacity: 0.5 },
  { widen: 0.8, opacity: 0.7 },
];
const shaftPath = (layer: number) =>
  Array.from({ length: SHAFT_COUNT }, (_, i) => {
    const mid = (Math.PI * 2 * i) / SHAFT_COUNT + Math.PI / 18;
    const base = (Math.PI * (i % 2 ? 2.2 : 3.4)) / 180;
    const half = base * SHAFT_LAYERS[layer].widen;
    const r = i % 3 === 0 ? 640 : i % 2 ? 420 : 520;
    const at = (a: number, d: number) => `${(SUN.x + Math.cos(a) * d).toFixed(1)} ${(SUN.y + Math.sin(a) * d).toFixed(1)}`;
    return `M${at(mid, 30)}L${at(mid - half, r)}L${at(mid + half, r)}Z`;
  }).join('');
const SHAFT_PATHS = SHAFT_LAYERS.map((_, k) => shaftPath(k));

/** Núi xa phía sau, sườn dốc bên phải chạy lên chỗ mặt trời, đồi xanh bên trái và giữa thung lũng. */
const FAR_RIDGE: Pt[] = [[-10, 188], [40, 185], [80, 174], [110, 180], [170, 168], [215, 169], [250, 178], [300, 195], [340, 200], [400, 198], [430, 197], [470, 208], [520, 210], [580, 205], [620, 212], [670, 225], [700, 235], [740, 225], [790, 220], [830, 232], [880, 230], [930, 240], [1010, 243], [1050, 250]];
const SUN_SLOPE: Pt[] = [[880, 322], [940, 300], [1000, 275], [1060, 245], [1120, 225], [1190, 205], [1290, 188]];
const LEFT_HILL: Pt[] = [[-10, 172], [40, 195], [100, 225], [180, 255], [260, 280], [310, 298]];
const MID_HILL: Pt[] = [[300, 290], [360, 263], [420, 243], [470, 233], [510, 235], [560, 250], [620, 270], [680, 288], [740, 315]];
const RIGHT_HILL: Pt[] = [[690, 392], [760, 360], [850, 330], [940, 318], [1040, 312], [1130, 290], [1200, 262], [1290, 240]];

/** Ruộng bậc thang góc phải phía trên, giữa phải và khối bậc thang lớn phía trước (cuốn dần như cái bát). */
const UPPER_TOP: Pt[] = [[1030, 387], [1080, 363], [1140, 346], [1200, 338], [1290, 334]];
const UPPER_BOTTOM: Pt[] = [[1000, 420], [1060, 402], [1130, 388], [1200, 378], [1290, 372]];
const MID_TOP: Pt[] = [[790, 480], [840, 456], [890, 438], [960, 426], [1040, 428]];
const MID_BOTTOM: Pt[] = [[760, 520], [830, 492], [900, 470], [970, 458], [1050, 458]];
/** Khối bậc thang lớn phía trước: các bờ ruộng đo từng đường trong ảnh, bắt đầu ở sườn trái và cuộn xuống phải như cái bát. */
const FRONT_BASE: Pt[][] = [
  [[640, 590], [700, 550], [770, 515], [830, 486], [880, 466], [960, 470], [1060, 482], [1160, 500], [1230, 520], [1290, 545]],
  [[700, 570], [770, 535], [830, 512], [920, 505], [1020, 512], [1120, 528], [1210, 552], [1290, 580]],
  [[690, 590], [760, 555], [830, 535], [920, 532], [1020, 545], [1120, 565], [1200, 592], [1290, 620]],
  [[680, 610], [750, 580], [830, 565], [930, 572], [1030, 592], [1120, 615], [1200, 640], [1260, 655]],
  [[690, 632], [760, 606], [850, 600], [940, 616], [1030, 640], [1110, 662], [1170, 668]],
  [[720, 655], [800, 640], [890, 648], [970, 668], [1040, 685], [1100, 690]],
  [[700, 690], [800, 700], [900, 702], [1000, 700], [1090, 690], [1170, 668], [1225, 640], [1262, 612], [1290, 598]],
];

/** Kéo dài hai đầu bờ ruộng theo hướng đoạn cuối ra tới mép (và quá mép) màn hình, để bậc thang không dừng giữa chừng. */
const extend = (line: readonly Pt[]): Pt[] => {
  const out: Pt[] = [...line];
  const run = (from: Pt, prev: Pt, front: boolean) => {
    const dx = from[0] - prev[0];
    const dy = from[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const pts: Pt[] = [];
    for (let t = 160; t <= 1600; t += 160) {
      const x = from[0] + ux * t;
      const y = from[1] + uy * t;
      pts.push([x, y]);
      if (x < -120 || x > W + 120 || y > H + 160) break;
    }
    if (front) out.unshift(...pts.reverse());
    else out.push(...pts);
  };
  run(line[0], line[1], true);
  run(line[line.length - 1], line[line.length - 2], false);
  return out;
};

const UPPER = densify(contours(UPPER_TOP, UPPER_BOTTOM, 4).map(extend));
const MID = densify(contours(MID_TOP, MID_BOTTOM, 4).map(extend));
const FRONT = densify(FRONT_BASE.map(extend));

/** Cụm tán cây theo ảnh: rừng bên trái, hàng cây dọc sườn giữa, tán lớn quanh nhà sàn. Mỗi phần tử: x, y, bán kính. */
const TREES: Pt[] = [
  [1068, 418, 30], [1112, 404, 19], [1240, 300, 34], [1258, 332, 22], [1252, 470, 30], [1232, 440, 22], [1180, 420, 14],
  [980, 420, 16], [940, 432, 14], [872, 446, 14], [760, 472, 18], [730, 492, 22], [690, 516, 20], [660, 542, 18],
  [60, 420, 26], [112, 442, 22], [162, 416, 20], [222, 456, 24], [282, 470, 20], [332, 500, 18], [402, 500, 22], [472, 530, 26], [524, 546, 20],
];

/** Bông lúa phía trước: gốc ở đáy khung, ngọn nghiêng tới vị trí bông lúa trong ảnh. */
const STALKS: Pt[] = [[28, 548], [120, 552], [188, 628], [64, 600], [300, 676], [236, 672], [14, 650], [380, 640], [150, 690], [450, 700], [20, 700], [96, 664]];

/** Chim bay nhỏ gần mặt trời và đom đóm / hạt sáng bay lên. */
const BIRDS: Pt[] = [[930, 120], [968, 98], [1010, 130], [880, 90]];
const MOTES = Array.from({ length: 12 }, (_, i) => ({
  x: (i * 173 + 90) % W,
  y: 240 + ((i * 97) % 440),
  r: 1.6 + (i % 3) * 0.9,
  d: 1.8 + (i % 5) * 0.5,
}));

/** Nhà sàn mái cong mềm: mái võng nhẹ vút hai đầu, thân bo góc, cột tròn đầu, cửa sổ toả ánh đèn ấm. Đặt theo hộp (x, y, rộng) của căn nhà trong ảnh. */
function StiltHouse({ x, y, w }: { x: number; y: number; w: number }) {
  const h = w * 0.62;
  const sw = Math.max(1.4, w * 0.026);
  const win = (cx: number, o: number) => (
    <g key={cx}>
      <circle cx={cx} cy={h * 0.45} r={w * 0.13} fill="url(#intro-window-glow)" opacity={o} />
      <rect x={cx - w * 0.07} y={h * 0.385} width={w * 0.14} height={h * 0.13} rx={w * 0.04} fill="#f2d4a0" opacity={o} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <g fill="currentColor" opacity="0.72">
        {/* Thân nhà bo góc */}
        <rect x={w * 0.07} y={h * 0.3} width={w * 0.86} height={h * 0.3} rx={w * 0.05} opacity="0.8" />
        {/* Mái võng nhẹ, hai đầu vút lên */}
        <path d={`M${-w * 0.12} ${h * 0.2}C${w * 0.02} ${h * 0.36} ${w * 0.12} ${h * 0.24} ${w * 0.2} ${h * 0.06}C${w * 0.4} ${-h * 0.02} ${w * 0.6} ${-h * 0.02} ${w * 0.8} ${h * 0.06}C${w * 0.88} ${h * 0.24} ${w * 0.98} ${h * 0.36} ${w * 1.12} ${h * 0.2}C${w * 1.02} ${h * 0.42} ${w * 0.9} ${h * 0.4} ${w * 0.5} ${h * 0.4}C${w * 0.1} ${h * 0.4} ${-w * 0.02} ${h * 0.42} ${-w * 0.12} ${h * 0.2}Z`} />
        <path d={`M${w * 0.1} ${h * 0.6}V${h}M${w * 0.5} ${h * 0.6}V${h}M${w * 0.9} ${h * 0.6}V${h}`} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      </g>
      {/* Nét sáng mảnh dọc sống mái, đón ánh nắng */}
      <path d={`M${w * 0.22} ${h * 0.05}C${w * 0.4} ${-h * 0.01} ${w * 0.6} ${-h * 0.01} ${w * 0.78} ${h * 0.05}`} fill="none" stroke="#ecd2a8" strokeOpacity="0.4" strokeWidth={sw * 0.8} strokeLinecap="round" />
      {win(w * 0.28, 0.85)}
      {win(w * 0.7, 0.6)}
    </g>
  );
}

/** Ruộng bậc thang: dải tô xen vàng lúa chín / xanh mạ, bờ sáng, bóng mờ dưới mỗi bờ. */
function Terraces({ lines, fillOpacity = 1 }: { lines: Pt[][]; fillOpacity?: number }) {
  return (
    <g>
      {lines.slice(0, -1).map((line, k) => (
        <path key={`f${k}`} d={bandBetween(line, lines[k + 1])} fill={k % 2 ? 'url(#intro-paddy-green)' : 'url(#intro-paddy-gold)'} opacity={fillOpacity} />
      ))}
      {lines.map((line, k) => (
        <g key={`l${k}`}>
          <path d={curve(line.map(([x, y]) => [x, y + 4] as Pt))} fill="none" stroke="#04180d" strokeOpacity="0.22" strokeWidth="3" strokeLinecap="round" />
          <path
            d={curve(line)}
            fill="none"
            stroke={k % 2 ? '#9fc07a' : '#e2cd92'}
            strokeOpacity={k % 2 ? 0.45 : 0.6}
            strokeWidth={k % 2 ? 1.5 : 2.2}
            strokeLinecap="round"
          />
        </g>
      ))}
    </g>
  );
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Hộp ảnh hero như khi trang chủ đã dựng xong: hero phủ kín màn hình, ảnh 16:9 phủ-kín căn giữa (đúng công thức của `.hero-stage`
 * trong globals.css). Không đo DOM hero vì lúc màn chào chạy hero chưa đủ cao, đo ra sẽ lệch lên trên. Màn dọc (điện thoại):
 * hero dời tâm ảnh sang phải để thấy nắng và nhà sàn, giống `--hero-focus-x`. Điện thoại: xem chú thích bên dưới.
 */
function heroBox(): Box {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.max(vw, (vh * 16) / 9);
  const height = (width * 9) / 16;
  // Điện thoại (< md): ảnh hero chỉ là thẻ 3:2 chứ không phủ cả màn hình, nên không thể trùng khít. Phóng cảnh cao đúng bằng màn hình
  // và dời sang phải để mặt trời nằm ở ~72% chiều ngang, thấy cả nhà sàn và ruộng bậc thang.
  if (vw < 768) {
    const h = vh;
    const w = Math.max((h * 16) / 9, vw);
    const left = Math.min(0, Math.max(vw - w, vw * 0.72 - w * (SUN.x / W)));
    return { left, top: 0, width: w, height: (w * 9) / 16 };
  }
  const shift = vw < vh ? Math.max(-0.72 * width, vw / 2 - width) : -width / 2;
  return { left: vw / 2 + shift, top: (vh - height) / 2, width, height };
}

/** Sống núi tô gradient (sáng ở đỉnh, tan vào sương phía dưới) + nét sáng ánh nắng ở sườn hướng mặt trời. */
function Ridge({ pts, top, bottom, rim = 0 }: { pts: Pt[]; top: string; bottom: string; rim?: number }) {
  return (
    <g>
      <path d={below(pts)} fill={`url(#${top}-${bottom})`} />
      <path d={curve(pts)} fill="none" stroke="#fde9a8" strokeOpacity={rim} strokeWidth="2.4" strokeLinecap="round" />
      <path d={curve(pts)} fill="none" stroke="#bff0c8" strokeOpacity="0.28" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

/**
 * Cảnh vẽ đúng toạ độ của ảnh banner hero: đặt trùng khít lên khung ảnh nên mặt trời nằm đúng chỗ mặt trời thật, các bờ ruộng
 * bậc thang chạy đúng theo bậc ruộng trong ảnh. Khi nền mờ đi để lộ ảnh, các nét vẫn dính vào đúng chi tiết.
 * Phong cách tranh màu nước mềm: gradient, sương, tia nắng, mây hồng, chim, hạt sáng. Tĩnh (không filter / animation lặp) để không giật.
 */
function Landscape() {
  const [box, setBox] = useState<Box | null>(null);

  useLayoutEffect(() => {
    const update = () => setBox(heroBox());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!box) return null;
  return (
    <motion.svg
      aria-hidden="true"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="pointer-events-none absolute overflow-visible text-[#5aa879]"
      style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
    >
      <defs>
        {/* Không dùng feGaussianBlur: lọc mờ trên SVG phủ cả màn hình làm giật; thay bằng gradient tròn mờ dần ra mép. */}
        <radialGradient id="intro-puff-warm">
          <stop offset="0" stopColor="#f0cfa0" stopOpacity="1" />
          <stop offset="1" stopColor="#f0cfa0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="intro-puff-cool">
          <stop offset="0" stopColor="#cfe3d3" stopOpacity="1" />
          <stop offset="1" stopColor="#cfe3d3" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="intro-tree">
          <stop offset="0" stopColor="#5aa879" stopOpacity="0.55" />
          <stop offset="0.7" stopColor="#5aa879" stopOpacity="0.28" />
          <stop offset="1" stopColor="#5aa879" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="intro-tree-hi">
          <stop offset="0" stopColor="#a9c27c" stopOpacity="0.4" />
          <stop offset="1" stopColor="#a9c27c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="intro-window-glow">
          <stop offset="0" stopColor="#e8b676" stopOpacity="0.55" />
          <stop offset="1" stopColor="#e8b676" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="intro-sun-glow">
          <stop offset="0" stopColor="#f6dcae" stopOpacity="0.55" />
          <stop offset="0.15" stopColor="#e9c088" stopOpacity="0.4" />
          <stop offset="0.4" stopColor="#dba468" stopOpacity="0.16" />
          <stop offset="0.7" stopColor="#cd8a4a" stopOpacity="0.05" />
          <stop offset="1" stopColor="#cd8a4a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="intro-shaft" cx={SUN.x} cy={SUN.y} r="640" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f6dcae" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#e9c088" stopOpacity="0.22" />
          <stop offset="1" stopColor="#dcc27a" stopOpacity="0" />
        </radialGradient>
        {/* Gradient núi: xa nhạt như sương, gần đậm hơn */}
        <linearGradient id="far-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9cc4ac" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#5f9c78" stopOpacity="0.05" />
          <stop offset="1" stopColor="#5f9c78" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="mid-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fa985" stopOpacity="0.3" />
          <stop offset="0.35" stopColor="#3f8a5c" stopOpacity="0.14" />
          <stop offset="1" stopColor="#256b43" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="near-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#80b88a" stopOpacity="0.34" />
          <stop offset="0.4" stopColor="#478f60" stopOpacity="0.18" />
          <stop offset="1" stopColor="#256b43" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="intro-paddy-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a9c27c" stopOpacity="0.1" />
          <stop offset="1" stopColor="#dcc27a" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="intro-paddy-green" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3f8a5c" stopOpacity="0.1" />
          <stop offset="1" stopColor="#86b560" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="intro-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9cbf6a" stopOpacity="0.26" />
          <stop offset="1" stopColor="#3f7f4c" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Mây hồng buổi bình minh + mây lạnh phía trái */}
      <g>
        <ellipse cx="1030" cy="62" rx="150" ry="20" fill="url(#intro-puff-warm)" opacity="0.2" />
        <ellipse cx="1190" cy="96" rx="130" ry="18" fill="url(#intro-puff-warm)" opacity="0.2" />
        <ellipse cx="860" cy="120" rx="110" ry="14" fill="url(#intro-puff-warm)" opacity="0.15" />
        <ellipse cx="190" cy="76" rx="150" ry="16" fill="url(#intro-puff-cool)" opacity="0.14" />
        <ellipse cx="420" cy="132" rx="140" ry="13" fill="url(#intro-puff-cool)" opacity="0.12" />
        <ellipse cx="700" cy="60" rx="120" ry="12" fill="url(#intro-puff-cool)" opacity="0.1" />
      </g>

      {/* Núi xa → sườn nắng */}
      <Ridge pts={FAR_RIDGE} top="far" bottom="haze" rim={0.12} />
      {/* Quầng nắng + tia nắng toả xuống sườn núi */}
      <circle cx={SUN.x} cy={SUN.y} r="380" fill="url(#intro-sun-glow)" style={{ mixBlendMode: 'screen' }} />
      {SHAFT_PATHS.map((d, k) => (
        <path key={k} d={d} fill="url(#intro-shaft)" opacity={SHAFT_LAYERS[k].opacity * 0.3} style={{ mixBlendMode: 'screen' }} />
      ))}
      <Ridge pts={SUN_SLOPE} top="mid" bottom="green" rim={0.5} />
      <circle cx={SUN.x} cy={SUN.y} r="26" fill="#f6e4c4" opacity="0.5" />
      <circle cx={SUN.x} cy={SUN.y} r="16" fill="#f8ecd6" opacity="0.88" />
      <Ridge pts={RIGHT_HILL} top="mid" bottom="green" rim={0.3} />
      <Ridge pts={MID_HILL} top="mid" bottom="green" rim={0.2} />
      <Ridge pts={LEFT_HILL} top="near" bottom="green" rim={0.15} />

      {/* Bậc ruộng nhỏ trên sườn đồi trái, chạy song song với sống đồi */}
      {[1, 2, 3, 4, 5].map((k) => (
        <path
          key={k}
          d={curve(LEFT_HILL.map(([x, y]) => [x + k * 6, y + k * 30] as Pt))}
          fill="none"
          stroke="#9fc07a"
          strokeOpacity={0.24 - k * 0.025}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}

      {/* Biển sương giữa thung lũng, nhiều lớp mờ */}
      <g>
        <ellipse cx="520" cy="338" rx="440" ry="40" fill="url(#intro-puff-cool)" opacity="0.3" />
        <ellipse cx="300" cy="372" rx="260" ry="28" fill="url(#intro-puff-cool)" opacity="0.22" />
        <ellipse cx="820" cy="360" rx="230" ry="28" fill="url(#intro-puff-warm)" opacity="0.22" />
        <ellipse cx="600" cy="320" rx="560" ry="56" fill="url(#intro-puff-cool)" opacity="0.14" />
        <ellipse cx="900" cy="396" rx="150" ry="26" fill="url(#intro-puff-warm)" opacity="0.16" />
      </g>

      <Terraces lines={UPPER} />
      <Terraces lines={MID} />
      <Terraces lines={FRONT} />

      {/* Rừng cây: hai lớp tán, lớp sáng lệch về phía mặt trời */}
      <g>
        {TREES.map(([x, y, r]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={r * 1.2} fill="url(#intro-tree)" />
            <circle cx={x + r * 0.25} cy={y - r * 0.25} r={r * 0.7} fill="url(#intro-tree-hi)" />
          </g>
        ))}
      </g>

      {/* Nhà sàn đúng chỗ trong ảnh */}
      <StiltHouse x={1068} y={424} w={150} />
      <StiltHouse x={790} y={503} w={52} />
      <StiltHouse x={994} y={403} w={40} />
      <StiltHouse x={1192} y={322} w={42} />

      {/* Nền ruộng lúa kéo dài xuống tận đáy màn hình, phía dưới khung ảnh hero */}
      <rect x="-40" y={H - 4} width={W + 80} height={BELOW} fill="url(#intro-ground)" />

      {/* Bông lúa chín phía trước,  */}
      <g fill="none" strokeLinecap="round">
        {STALKS.map(([x, y], i) => {
          const lean = 10 + (i % 4) * 5;
          const baseX = x - 14 - (i % 3) * 8;
          return (
            <g key={i}>
              <path d={`M${baseX} ${H + 6}Q${baseX + 4} ${(H + y) / 2} ${x} ${y}`} stroke="#86b560" strokeOpacity="0.6" strokeWidth="3.2" />
              <path d={`M${baseX + 3} ${H - 30}Q${baseX - 22} ${H - 70} ${baseX - 30 - lean} ${H - 92}`} stroke="#7fcf6a" strokeOpacity="0.5" strokeWidth="2.4" />
              <path d={`M${baseX + 5} ${H - 60}Q${baseX + 28} ${H - 100} ${baseX + 36 + lean} ${H - 120}`} stroke="#7fcf6a" strokeOpacity="0.45" strokeWidth="2.2" />
              {[0, 1, 2, 3, 4].map((g) => (
                <ellipse
                  key={g}
                  cx={x + (g % 2 ? 4 : -2) + g * 0.8}
                  cy={y - 4 - g * 9}
                  rx="3.6"
                  ry="8"
                  fill="#cdb877"
                  stroke="none"
                  opacity={0.78 - g * 0.06}
                  transform={`rotate(${(g % 2 ? 14 : -10) + lean} ${x} ${y - g * 9})`}
                />
              ))}
            </g>
          );
        })}
      </g>

      {/* Chim bay về phía mặt trời */}
      {BIRDS.map(([x, y], i) => (
        <path
          key={i}
          d={`M${x - 10} ${y}Q${x - 5} ${y - 7} ${x} ${y}Q${x + 5} ${y - 7} ${x + 10} ${y}`}
          fill="none"
          stroke="#fde9c0"
          strokeOpacity="0.7"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}

      {/* Hạt sáng như đom đóm */}
      {MOTES.map((m, i) => (
        <circle key={i} cx={m.x} cy={m.y} r={m.r * 1.6} fill="#fff0a8" opacity={0.25 + (i % 3) * 0.12} />
      ))}
    </motion.svg>
  );
}

/** Gió: vài đường uốn lượn kết thúc bằng vòng xoáy, vẽ dần từ trái sang phải. */
const WIND = [
  { d: 'M0 30C60 30 90 10 150 12c40 2 50 26 28 30-18 3-24-16-4-18', top: '14%', left: '8%', w: 190, delay: 0.05, o: 0.5 },
  { d: 'M0 22C50 22 80 40 140 36c46-3 60-26 36-30-20-3-28 16-8 20', top: '24%', left: '62%', w: 180, delay: 0.25, o: 0.4 },
  { d: 'M0 16C40 16 70 4 110 6c30 2 38 18 20 20-12 1-16-10-4-12', top: '36%', left: '70%', w: 130, delay: 0.45, o: 0.3 },
  { d: 'M0 16C40 16 70 28 110 26c30-2 38-18 20-20-12-1-16 10-4 12', top: '70%', left: '4%', w: 130, delay: 0.35, o: 0.28 },
];

function Wind() {
  return (
    <>
      {WIND.map((w) => (
        <svg
          key={w.top + w.left}
          aria-hidden="true"
          viewBox="0 0 190 50"
          className="pointer-events-none absolute text-[#5aa879]"
          style={{ top: w.top, left: w.left, width: w.w, maxWidth: '40vw' }}
        >
          <motion.path
            d={w.d}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: w.o }}
            transition={{ delay: w.delay, duration: 0.9, ease: 'easeOut' }}
          />
        </svg>
      ))}
    </>
  );
}

/** La bàn và đám mây nhỏ ở hai góc trên. */
function Corners() {
  return (
    <>
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        initial={{ opacity: 0, rotate: -90 }}
        animate={{ opacity: 0.4, rotate: 0 }}
        transition={{ duration: 1, ease: EASE }}
        className="pointer-events-none absolute left-5 top-[max(1.25rem,var(--safe-top-min,0px))] h-10 w-10 text-sun sm:left-10 sm:h-14 sm:w-14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <circle cx="24" cy="24" r="20" />
        <path d="M24 4v4M24 40v4M4 24h4M40 24h4" />
        <path d="M24 12l5 12-5 12-5-12z" fill="currentColor" fillOpacity="0.35" />
      </motion.svg>
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 64 24"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 0.25, x: 0 }}
        transition={{ duration: 1.2, ease: EASE }}
        className="pointer-events-none absolute right-5 top-[max(1.5rem,var(--safe-top-min,0px))] h-6 w-16 text-canvas sm:right-10 sm:h-8 sm:w-24"
        fill="currentColor"
      >
        <path d="M8 20a8 8 0 0 1 4-14 11 11 0 0 1 21-2 9 9 0 0 1 14 6 7 7 0 0 1 9 10z" />
      </motion.svg>
    </>
  );
}

/**
 * Màn chào thương hiệu mỗi lần tải / tải lại trang: biểu tượng "Đi" hiện giữa màn hình, rồi gạt sang trái để chữ "Du Lịch"
 * (nét bút lông của hero trang chủ) lộ ra bên phải, ghép thành "Đi Du Lịch". Nền vẽ đúng toạ độ ảnh banner (mặt trời, núi, bậc ruộng trùng khít với ảnh), cùng gió và la bàn.
 * Xong thì biểu tượng và chữ bay về đúng vị trí logo + "Đi Du Lịch" ở hero trang chủ (nếu đang ở trang chủ), nền mờ đi.
 * Tự đóng sau khoảng 1,6 giây hoặc khi khách chạm vào màn hình.
 * Chỉ để trang trí nên ẩn với trình đọc màn hình; khách bật "giảm chuyển động" chỉ thấy hiện / mờ dần.
 */
export default function WelcomeIntro() {
  const [visible, setVisible] = useState(true);
  const [fly, setFly] = useState<Fly | null>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let closeTimer: ReturnType<typeof setTimeout>;
    const flyTimer = setTimeout(() => {
      const measured = measureFly(logoRef.current, wordRef.current);
      if (measured) {
        setFly(measured);
        closeTimer = setTimeout(() => setVisible(false), FLY_DURATION_S * 1000 + 50);
      } else {
        closeTimer = setTimeout(() => setVisible(false), FALLBACK_DISMISS_MS - FLY_AT_MS);
      }
    }, FLY_AT_MS);
    return () => {
      clearTimeout(flyTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  const flyTransition = { duration: FLY_DURATION_S, ease: EASE };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {visible && (
          <motion.div
            key="welcome-intro"
            aria-hidden="true"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setVisible(false)}
            className="fixed inset-0 z-[99999] flex cursor-pointer select-none items-center justify-center overflow-hidden"
          >
            {/* Nền + họa tiết mờ đi khi icon / chữ bay về hero, để lộ trang chủ phía sau. */}
            <motion.div
              animate={{ opacity: fly ? 0 : 1 }}
              transition={{ duration: FLY_DURATION_S, ease: 'easeIn' }}
              className="absolute inset-0 bg-[#04180d]"
              style={{ backgroundImage: BACKDROP }}
            >
              <Corners />
              <Wind />
              <Landscape />
            </motion.div>

            <div className="relative flex items-center px-4">
              <motion.div
                ref={logoRef}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={fly ? { ...fly.logo, opacity: 1, transition: flyTransition } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: EASE }}
                style={{ originX: 0, originY: 0 }}
                className="relative z-10 shrink-0"
              >
                <LogoMark size="clamp(96px, 26vw, 150px)" plate />
              </motion.div>

              {/* Chiều rộng mở dần từ 0: hàng căn giữa nên biểu tượng tự trượt sang trái, chữ lộ ra từ sau nó. */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 'auto' }}
                transition={{ delay: 0.35, duration: 0.5, ease: EASE }}
                className={fly ? 'overflow-visible' : 'overflow-hidden'}
              >
                <motion.p
                  initial={{ x: -40 }}
                  animate={fly ? { ...fly.word, transition: flyTransition } : { x: 0 }}
                  transition={{ delay: 0.35, duration: 0.5, ease: EASE }}
                  style={{ fontFamily: 'var(--font-brush)', originX: 0, originY: 0 }}
                  className="whitespace-nowrap py-2 pl-4 pr-8 text-[clamp(3.25rem,15vw,5rem)] font-bold italic leading-tight text-sun sm:text-8xl"
                >
                  <span ref={wordRef}>Du Lịch</span>
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
