// @ts-nocheck — hình học SVG đo tay, bật noUncheckedIndexedAccess sẽ báo hàng chục lỗi chỉ-số-có-thể-undefined không thực tế.
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

/** Làm mượt đường đo tay (trung bình trọng số 1-2-1, giữ hai đầu) để nét không bị gợn lăn tăn mà vẫn bám đúng hình trong ảnh. */
const smooth = (pts: readonly Pt[], passes = 2): Pt[] => {
  let out: Pt[] = [...pts];
  for (let n = 0; n < passes; n += 1) {
    out = out.map((p, i) => {
      const a = out[i - 1];
      const b = out[i + 1];
      return a && b ? ([(a[0] + 2 * p[0] + b[0]) / 4, (a[1] + 2 * p[1] + b[1]) / 4] as Pt) : p;
    });
  }
  return out;
};

/**
 * Vùng tô từ đường sống núi thẳng xuống đáy. Đầu nào của dãy núi nằm trong khung thì không kéo ngang ra mép nữa (trước đây
 * tạo vạch ngang cứng giữa cảnh) mà để FadeX làm tan dần.
 */
const below = (pts: readonly Pt[]) => {
  const first = pts[0];
  const last = pts[pts.length - 1];
  return `${curve(pts)}L${last[0]} ${H + BELOW}L${first[0]} ${H + BELOW}Z`;
};

/** Khoảng tan dần (đơn vị khung 1280) ở đầu một nét / vùng dừng giữa cảnh. */
const FADE = 170;

/**
 * Mặt nạ làm mờ dần theo chiều ngang trong [x0, x1]: đầu nào nằm trong khung thì tan trong khoảng FADE, đầu chạm mép giữ nguyên.
 * Dùng chung cho núi và ruộng bậc thang để không còn chỗ nào bị cắt cụt.
 */
function FadeX({ id, x0, x1 }: { id: string; x0: number; x1: number }) {
  const span = x1 - x0;
  const a = x0 > 0 ? Math.min(0.45, FADE / span) : 0;
  const b = x1 < W ? Math.max(0.55, 1 - FADE / span) : 1;
  return (
    <mask id={id} maskUnits="userSpaceOnUse" x="-80" y="-400" width={W + 160} height={H + BELOW + 480}>
      <linearGradient id={`${id}-g`} x1={x0} x2={x1} y1="0" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fff" stopOpacity={a ? 0 : 1} />
        <stop offset={a} stopColor="#fff" />
        <stop offset={b} stopColor="#fff" />
        <stop offset="1" stopColor="#fff" stopOpacity={b < 1 ? 0 : 1} />
      </linearGradient>
      <rect x="-80" y="-400" width={W + 160} height={H + BELOW + 480} fill={`url(#${id}-g)`} />
    </mask>
  );
}

const xRange = (lines: readonly (readonly Pt[])[]) => {
  const xs = lines.flatMap((l) => l.map((p) => p[0]));
  return [Math.min(...xs), Math.max(...xs)] as const;
};

/** Dải giữa hai đường bờ ruộng liên tiếp. */
const bandBetween = (a: readonly Pt[], b: readonly Pt[]) => {
  const back = [...b].reverse();
  return `${curve(a)}L${back[0][0]} ${back[0][1]}${curve(back, false)}Z`;
};

/** Nội suy `n` đường bờ ruộng nằm giữa đường trên `top` và đường dưới `bottom` (cùng số điểm). */
const contours = (top: readonly Pt[], bottom: readonly Pt[], n: number): Pt[][] =>
  Array.from({ length: n }, (_, k) => {
    const t = n === 1 ? 0 : k / (n - 1);
    return top.map((p, i) => [p[0] + (bottom[i][0] - p[0]) * t, p[1] + (bottom[i][1] - p[1]) * t] as Pt);
  });

const SUN = { x: 1103, y: 210 };

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

const UPPER = contours(UPPER_TOP, UPPER_BOTTOM, 4).map((l) => smooth(l, 1));
const MID = contours(MID_TOP, MID_BOTTOM, 4).map((l) => smooth(l, 1));
const FRONT = FRONT_BASE.map((l) => smooth(l, 1));

/** Vài cánh chim nhỏ bay về phía mặt trời. */
const BIRDS: Pt[] = [[930, 120], [968, 98], [1010, 130]];

/** Ruộng bậc thang: dải tô xen vàng lúa chín / xanh mạ, mỗi bờ chỉ một nét mảnh đều nhau. */
function Terraces({ id, lines }: { id: string; lines: Pt[][] }) {
  const [x0, x1] = xRange(lines);
  return (
    <g mask={`url(#${id})`}>
      <FadeX id={id} x0={x0} x1={x1} />
      {lines.slice(0, -1).map((line, k) => (
        <path key={`f${k}`} d={bandBetween(line, lines[k + 1])} fill={k % 2 ? 'url(#intro-paddy-green)' : 'url(#intro-paddy-gold)'} />
      ))}
      <g fill="none" stroke="#e6d39c" strokeOpacity="0.32" strokeWidth="1.2" strokeLinecap="round">
        {lines.map((line, k) => (
          <path key={`l${k}`} d={curve(line)} />
        ))}
      </g>
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
 * hero dời tâm ảnh sang phải để thấy nắng, giống `--hero-focus-x`. Điện thoại: xem chú thích bên dưới.
 */
function heroBox(): Box {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.max(vw, (vh * 16) / 9);
  const height = (width * 9) / 16;
  // Điện thoại (< md): ảnh hero chỉ là thẻ 3:2 chứ không phủ cả màn hình, nên không thể trùng khít. Phóng cảnh cao đúng bằng màn hình
  // và dời sang phải để mặt trời nằm ở ~72% chiều ngang, thấy rõ ruộng bậc thang.
  if (vw < 768) {
    const h = vh;
    const w = Math.max((h * 16) / 9, vw);
    const left = Math.min(0, Math.max(vw - w, vw * 0.72 - w * (SUN.x / W)));
    return { left, top: 0, width: w, height: (w * 9) / 16 };
  }
  const shift = vw < vh ? Math.max(-0.72 * width, vw / 2 - width) : -width / 2;
  return { left: vw / 2 + shift, top: (vh - height) / 2, width, height };
}

/** Sống núi tô gradient (sáng ở đỉnh, tan vào sương phía dưới) + một nét viền mảnh, sáng hơn ở sườn hướng mặt trời. */
function Ridge({ pts, top, bottom, rim = 0 }: { pts: Pt[]; top: string; bottom: string; rim?: number }) {
  const s = smooth(pts);
  const id = `intro-ridge-${pts[0][0]}-${pts[0][1]}`;
  return (
    <g mask={`url(#${id})`}>
      <FadeX id={id} x0={s[0][0]} x1={s[s.length - 1][0]} />
      <path d={below(s)} fill={`url(#${top}-${bottom})`} />
      <path d={curve(s)} fill="none" stroke="#f6dfa8" strokeOpacity={0.12 + rim * 0.6} strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

/**
 * Cảnh vẽ đúng toạ độ của ảnh banner hero: đặt trùng khít lên khung ảnh nên mặt trời nằm đúng chỗ mặt trời thật, các bờ ruộng
 * bậc thang chạy đúng theo bậc ruộng trong ảnh. Khi nền mờ đi để lộ ảnh, các nét vẫn dính vào đúng chi tiết.
 * Phong cách phẳng, sạch: đường đo tay được làm mượt, mỗi bờ ruộng / sống núi chỉ một nét mảnh, gradient + sương + mây hồng.
 * Tĩnh (không filter / animation lặp) để không giật.
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
        <radialGradient id="intro-sun-halo">
          <stop offset="0.4" stopColor="#fbe6b8" stopOpacity="0.6" />
          <stop offset="1" stopColor="#fbe6b8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="intro-sun-glow">
          <stop offset="0" stopColor="#f6dcae" stopOpacity="0.55" />
          <stop offset="0.15" stopColor="#e9c088" stopOpacity="0.4" />
          <stop offset="0.4" stopColor="#dba468" stopOpacity="0.16" />
          <stop offset="0.7" stopColor="#cd8a4a" stopOpacity="0.05" />
          <stop offset="1" stopColor="#cd8a4a" stopOpacity="0" />
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
          <stop offset="0" stopColor="#9cbf6a" stopOpacity="0" />
          <stop offset="0.3" stopColor="#7fa95c" stopOpacity="0.18" />
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
      {/* Quầng nắng mềm quanh mặt trời */}
      <circle cx={SUN.x} cy={SUN.y} r="380" fill="url(#intro-sun-glow)" style={{ mixBlendMode: 'screen' }} />
      <Ridge pts={SUN_SLOPE} top="mid" bottom="green" rim={0.5} />
      <circle cx={SUN.x} cy={SUN.y} r="34" fill="url(#intro-sun-halo)" />
      <circle cx={SUN.x} cy={SUN.y} r="16" fill="#fbefd6" />
      <Ridge pts={RIGHT_HILL} top="mid" bottom="green" rim={0.3} />
      <Ridge pts={MID_HILL} top="mid" bottom="green" rim={0.2} />
      <Ridge pts={LEFT_HILL} top="near" bottom="green" rim={0.15} />

      {/* Bậc ruộng nhỏ trên sườn đồi trái, chạy song song với sống đồi */}
      <g mask="url(#intro-left-terr)" fill="none" stroke="#9fc07a" strokeWidth="1.1" strokeLinecap="round">
        <FadeX id="intro-left-terr" x0={-10} x1={340} />
        {[1, 2, 3, 4].map((k) => (
          <path key={k} d={curve(smooth(LEFT_HILL.map(([x, y]) => [x + k * 6, y + k * 30] as Pt)))} strokeOpacity={0.16 - k * 0.025} />
        ))}
      </g>

      {/* Biển sương giữa thung lũng, nhiều lớp mờ */}
      <g>
        <ellipse cx="520" cy="338" rx="440" ry="40" fill="url(#intro-puff-cool)" opacity="0.3" />
        <ellipse cx="300" cy="372" rx="260" ry="28" fill="url(#intro-puff-cool)" opacity="0.22" />
        <ellipse cx="820" cy="360" rx="230" ry="28" fill="url(#intro-puff-warm)" opacity="0.22" />
        <ellipse cx="600" cy="320" rx="560" ry="56" fill="url(#intro-puff-cool)" opacity="0.14" />
        <ellipse cx="900" cy="396" rx="150" ry="26" fill="url(#intro-puff-warm)" opacity="0.16" />
      </g>

      <Terraces id="intro-terr-upper" lines={UPPER} />
      <Terraces id="intro-terr-mid" lines={MID} />
      <Terraces id="intro-terr-front" lines={FRONT} />

      {/* Nền ruộng lúa kéo dài xuống tận đáy màn hình, phía dưới khung ảnh hero */}
      <rect x="-40" y={H - 90} width={W + 80} height={BELOW + 90} fill="url(#intro-ground)" />

      {/* Chim bay về phía mặt trời */}
      <g fill="none" stroke="#fde9c0" strokeOpacity="0.55" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        {BIRDS.map(([x, y], i) => (
          <path key={i} d={`M${x - 8} ${y - 2}Q${x - 4} ${y - 5} ${x} ${y}Q${x + 4} ${y - 5} ${x + 8} ${y - 2}`} />
        ))}
      </g>
    </motion.svg>
  );
}

/**
 * Màn chào thương hiệu mỗi lần tải / tải lại trang: biểu tượng "Đi" hiện giữa màn hình, rồi gạt sang trái để chữ "Du Lịch"
 * (nét bút lông của hero trang chủ) lộ ra bên phải, ghép thành "Đi Du Lịch". Nền vẽ đúng toạ độ ảnh banner (mặt trời, núi, bậc ruộng trùng khít với ảnh).
 * Xong thì biểu tượng và chữ bay về đúng vị trí logo + "Đi Du Lịch" ở hero trang chủ (nếu đang ở trang chủ), nền mờ đi.
 * Tự đóng sau khoảng 1,6 giây hoặc khi khách chạm vào màn hình.
 * Chỉ để trang trí nên ẩn với trình đọc màn hình; khách bật "giảm chuyển động" chỉ thấy hiện / mờ dần.
 */
export default function WelcomeIntro() {
  const [visible, setVisible] = useState(true);
  const [fly, setFly] = useState<Fly | null>(null);
  /** Đã bay tới chỗ hero: gỡ màn chào và hiện bản của hero trong cùng một khung hình. */
  const [landed, setLanded] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  // Trong lúc màn chào chạy, ẩn logo + "Du Lịch" của hero (xem .welcome-intro-active trong globals.css) để không có hai bản chồng nhau bị nhòe.
  const hideHero = visible && !landed;
  useLayoutEffect(() => {
    if (!hideHero) return undefined;
    const root = document.documentElement;
    root.classList.add('welcome-intro-active');
    return () => root.classList.remove('welcome-intro-active');
  }, [hideHero]);

  useEffect(() => {
    let closeTimer: ReturnType<typeof setTimeout>;
    const flyTimer = setTimeout(() => {
      const measured = measureFly(logoRef.current, wordRef.current);
      if (measured) {
        setFly(measured);
        closeTimer = setTimeout(() => setLanded(true), FLY_DURATION_S * 1000 + 50);
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

  // Đã bay tới hero: gỡ hẳn màn chào, KHÔNG mờ dần (AnimatePresence sẽ giữ bản chữ cũ đè lên chữ hero thành hai lớp nhòe).
  if (landed) return null;

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
              <Landscape />
            </motion.div>

            <div className="relative flex items-center px-4">
              <motion.div
                ref={logoRef}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={fly ? { ...fly.logo, opacity: 1, transition: flyTransition } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: EASE }}
                style={{ originX: 0, originY: 0 }}
                className="relative z-10 shrink-0 drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
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
                  className="whitespace-nowrap py-2 pl-4 pr-8 text-[clamp(3.25rem,15vw,5rem)] font-bold italic leading-tight text-sun [text-shadow:0_4px_24px_rgba(0,0,0,0.35)] sm:text-8xl"
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
