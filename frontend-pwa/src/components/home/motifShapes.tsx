import type { ReactNode } from 'react';

/**
 * Kho hình vẽ nét mảnh cho họa tiết nền (HomeMotifs). Mỗi hình là một hàm trả về các nét SVG trong khung 260 × 220, chỉ dùng
 * <path> / <circle> / <ellipse> (HomeMotifs đo độ dài từng nét để vẽ dần; <rect> sẽ không được vẽ dần). Nét là currentColor.
 */

/** Mỗi hình vẽ trong khung 260 × 220. Nét là currentColor, mờ bằng opacity của nhóm bao ngoài. */
const SUN_RAYS = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);

export const MOTIFS = {
  /** Hai đỉnh núi phủ tuyết, mặt trời và đám mây. */
  mountains: () => (
    <>
      <path d="M-10 190 L52 98 Q60 86 68 98 L96 136 L126 102 Q134 92 142 102 L214 190" />
      <path d="M47 106 Q54 100 60 108 Q66 100 73 106" />
      <path d="M119 114 Q126 108 133 116 Q140 108 147 114" />
      <path d="M-10 190 Q 130 186 270 190" />
      <circle cx="205" cy="52" r="19" />
      {SUN_RAYS.map((a, i) => (
        <path key={i} d={`M${205 + Math.cos(a) * 27} ${52 + Math.sin(a) * 27} L${205 + Math.cos(a) * 36} ${52 + Math.sin(a) * 36}`} />
      ))}
      <path d="M24 46 C 10 46, 10 30, 25 30 C 28 16, 48 14, 54 27 C 67 23, 77 36, 66 46 Z" />
    </>
  ),
  /** Ruộng bậc thang (các đường đồng mức bậc thang) và chiếc nón lá. */
  terraces: () => (
    <>
      {[50, 82, 114, 146].map((y, i) => (
        <path key={y} d={`M-10 ${y} C 50 ${y - 26 + i * 4}, 110 ${y + 30 - i * 4}, 270 ${y - 10}`} />
      ))}
      <path d="M178 190 Q 212 132 246 190 Q 212 202 178 190 Z" />
      <path d="M194 176 Q 212 184 230 176" />
    </>
  ),
  /** Nhà sàn: mái cong, thân nhà bo góc, cửa vòm, cột và cầu thang. */
  house: () => (
    <>
      <path d="M8 100 Q 70 90 120 34 Q 170 90 232 100" />
      <path d="M120 34 Q 114 26 108 22 M120 34 Q 126 26 132 22" />
      <path d="M42 102 V146 Q42 152 48 152 H192 Q198 152 198 146 V102" />
      <path d="M26 152 Q 120 158 214 152" />
      <path d="M106 152 V126 Q106 112 120 112 Q134 112 134 126 V152" />
      <circle cx="70" cy="124" r="11" />
      <circle cx="170" cy="124" r="11" />
      <path d="M52 156 Q51 182 52 206 M92 156 Q91 182 92 206 M148 156 Q149 182 148 206 M188 156 Q189 182 188 206" />
      <path d="M112 156 L96 206 M130 156 L114 206 M107 170 H125 M102 184 H120 M98 198 H116" />
      <path d="M-10 207 Q 60 203 130 207 T 270 206" />
    </>
  ),
  /** Dây đèn lồng giăng từ mép vào. */
  lanterns: () => (
    <>
      <path d="M-10 20 Q 120 60 270 14" />
      {([[60, 34], [130, 38], [200, 30]] as const).map(([x, y]) => (
        <g key={x}>
          <path d={`M${x} ${y} V ${y + 10}`} />
          <path d={`M${x - 6} ${y + 10} H ${x + 6} M${x - 6} ${y + 46} H ${x + 6}`} />
          <ellipse cx={x} cy={y + 28} rx="12" ry="17" />
          <path d={`M${x - 5} ${y + 12} Q ${x - 7} ${y + 28} ${x - 5} ${y + 44} M${x + 5} ${y + 12} Q ${x + 7} ${y + 28} ${x + 5} ${y + 44}`} />
          <path d={`M${x} ${y + 46} V ${y + 58} M${x - 3} ${y + 58} H ${x + 3}`} />
        </g>
      ))}
    </>
  ),
  /** Bụi tre: thân có đốt và lá. */
  bamboo: () => (
    <>
      {([[40, 0], [78, 36], [110, 78]] as const).map(([x, top]) => (
        <g key={x}>
          <path d={`M${x} ${top} V 220`} />
          {Array.from({ length: Math.floor((220 - top) / 40) }, (_, i) => top + 30 + i * 40).map((y) => (
            <path key={y} d={`M${x - 5} ${y} H ${x + 5}`} />
          ))}
        </g>
      ))}
      {([[40, 62, -35], [40, 142, 30], [78, 100, -30], [78, 180, 35], [110, 130, -30], [110, 40 + 78, 40]] as const).map(([x, y, r], i) => (
        <path key={i} d="M0 0 C 8 -9, 26 -9, 40 0 C 26 9, 8 9, 0 0 Z" transform={`translate(${x} ${y}) rotate(${r})`} />
      ))}
    </>
  ),
  /** Bát phở nghi ngút khói kèm đôi đũa cong nhẹ. */
  bowl: () => (
    <>
      <path d="M48 120 Q 120 134 192 120 C 190 172, 160 194, 120 194 C 80 194, 50 172, 48 120 Z" />
      <path d="M94 200 Q 120 205 146 200" />
      <path d="M58 124 C 78 104, 98 136, 120 114 S 162 134, 182 114" />
      <path d="M92 98 C 82 82, 102 72, 92 54 M120 94 C 110 76, 130 66, 120 46 M148 98 C 138 82, 158 72, 148 54" />
      <path d="M150 114 Q 200 82 236 38 M164 118 Q 208 90 242 50" />
    </>
  ),
  /** Bông lúa chín cong nặng hạt. */
  rice: () => (
    <>
      <path d="M118 220 C 122 150, 130 92, 176 30" />
      {Array.from({ length: 7 }, (_, i) => {
        const t = 0.3 + i * 0.1;
        // điểm và hướng tiếp tuyến trên đường cong bậc ba (118,220) (122,150) (130,92) (176,30)
        const u = 1 - t;
        const x = u * u * u * 118 + 3 * u * u * t * 122 + 3 * u * t * t * 130 + t * t * t * 176;
        const y = u * u * u * 220 + 3 * u * u * t * 150 + 3 * u * t * t * 92 + t * t * t * 30;
        const dx = 3 * u * u * (122 - 118) + 6 * u * t * (130 - 122) + 3 * t * t * (176 - 130);
        const dy = 3 * u * u * (150 - 220) + 6 * u * t * (92 - 150) + 3 * t * t * (30 - 92);
        const a = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <g key={i}>
            {/* hạt mọc xen hai bên thân, xoè đều quanh hướng thân để bông không bị lệch */}
            <ellipse cx="11" cy="0" rx="11" ry="4.5" transform={`translate(${x} ${y}) rotate(${a - 32})`} />
            <ellipse cx="11" cy="0" rx="11" ry="4.5" transform={`translate(${x} ${y}) rotate(${a + 32})`} />
          </g>
        );
      })}
      {/* hạt ngọn nối tiếp hướng thân ở đầu mút (tiếp tuyến tại t = 1: (46, -62)) */}
      <ellipse cx="11" cy="0" rx="11" ry="4.5" transform="translate(176 30) rotate(-53)" />
      <path d="M120 210 C 90 188, 60 190, 30 206 M120 210 C 150 188, 180 190, 210 206" />
    </>
  ),
  /** Quả ớt cong có cuống. */
  chili: () => (
    <>
      <path d="M62 62 C 130 40, 200 96, 218 190 C 186 134, 110 92, 62 62 Z" />
      <path d="M62 62 C 46 70, 36 58, 44 46 C 54 44, 64 50, 62 62 Z" />
      <path d="M44 46 C 38 36, 40 26, 48 18" />
      <path d="M104 64 C 140 72, 176 104, 198 150" />
    </>
  ),
  /** La bàn với kim chỉ bắc. */
  compass: () => (
    <>
      <circle cx="120" cy="110" r="76" />
      <circle cx="120" cy="110" r="62" />
      {Array.from({ length: 16 }, (_, i) => (i * Math.PI) / 8).map((a, i) => (
        <path key={i} d={`M${120 + Math.cos(a) * 62} ${110 + Math.sin(a) * 62} L${120 + Math.cos(a) * (i % 4 === 0 ? 50 : 56)} ${110 + Math.sin(a) * (i % 4 === 0 ? 50 : 56)}`} />
      ))}
      <path d="M120 54 Q 134 110 120 166 Q 106 110 120 54 Z" />
      <path d="M120 54 Q 131 82 132 110 H108 Q 109 82 120 54 Z" fill="currentColor" fillOpacity="0.4" />
      <circle cx="120" cy="110" r="5" />
    </>
  ),
  /** Đường đi nét đứt dẫn tới ghim vị trí. */
  route: () => (
    <>
      <path d="M-10 204 C 50 134, 110 212, 150 142 S 190 94, 200 74" strokeDasharray="3 9" />
      <path d="M200 74 C 188 56, 182 48, 182 38 a18 18 0 0 1 36 0 c0 10 -6 18 -18 36 z" />
      <circle cx="200" cy="38" r="6" />
    </>
  ),
  /** Lều trại bo đỉnh với lá cờ nhỏ. */
  tent: () => (
    <>
      <path d="M24 190 Q 24 186 28 180 L112 70 Q 120 60 128 70 L212 180 Q 216 186 216 190 Z" />
      <path d="M120 100 Q 104 150 92 190 M120 100 Q 136 150 148 190" />
      <path d="M120 62 V 36 Q 134 38 144 44 Q 134 48 120 52" />
      <path d="M-10 190 Q 130 186 270 190 M60 202 Q 80 200 100 202 M150 206 Q 178 203 206 206" />
    </>
  ),
  // ---- Hình bổ sung: mỗi trang / phần dùng bộ riêng nên không lặp hình (xem LAYOUT trong HomeMotifs) ----
  // -- Thiên nhiên / điểm đến --
  /** Biển mây: hai đỉnh núi nhô lên khỏi các lớp mây, mặt trời nhỏ. */
  cloudSea: () => (
    <>
      <path d="M10 150 L86 66 Q94 58 102 66 L140 108 L164 84 Q170 78 176 84 L250 150" />
      <path d="M-6 152 C 14 132, 44 132, 58 148 C 72 128, 104 128, 118 148 C 134 130, 164 130, 178 148 C 194 132, 224 132, 238 150 C 248 142, 258 144, 266 150" />
      <path d="M18 176 C 50 162, 80 186, 110 172 S 170 162, 198 174 S 238 178, 256 170" />
      <path d="M44 198 C 76 188, 110 206, 140 196 S 196 190, 228 198" />
      <circle cx="204" cy="42" r="15" />
    </>
  ),
  /** Dù lượn bay trên đỉnh núi (đèo Khau Phạ). */
  paraglider: () => (
    <>
      <path d="M66 74 Q 130 18 194 74 Q 130 58 66 74 Z" />
      <path d="M66 74 L 124 126 M 194 74 L 136 126 M 98 64 L 127 126 M 162 64 L 133 126" />
      <circle cx="130" cy="118" r="6" />
      <path d="M130 126 V150 M130 134 L121 143 M130 134 L139 143 M130 150 L123 166 M130 150 L137 166" />
      <path d="M-6 208 L56 172 Q62 168 68 172 L102 196 L148 166 Q154 162 160 166 L266 208" />
    </>
  ),
  /** Ba cây thông trên đồi. */
  pine: () => (
    <>
      {([[70, 1], [128, 1.3], [188, 0.9]] as const).map(([x, k]) => (
        <g key={x} transform={`translate(${x} ${176 - 92 * k}) scale(${k})`}>
          <path d="M0 0 L-16 24 H-7 L-22 48 H-9 L-26 74 H26 L9 48 H22 L7 24 H16 Z" />
          <path d="M0 74 V92" />
        </g>
      ))}
      <path d="M-6 178 Q 130 170 266 178" />
    </>
  ),
  /** Đàn chim bay. */
  birds: () => (
    <>
      {([[34, 70, 1], [100, 34, 1.5], [170, 84, 1.2], [76, 128, 0.9], [200, 150, 0.8]] as const).map(([x, y, k]) => (
        <path key={x} d="M0 0 Q 9 -12 18 0 Q 27 -12 36 0" transform={`translate(${x} ${y}) scale(${k})`} />
      ))}
      <path d="M-6 200 Q 60 192 130 198 T 266 196" />
    </>
  ),
  /** Cầu treo bắc qua suối. */
  bridge: () => (
    <>
      <path d="M-6 142 H266" />
      <path d="M70 142 V70 M190 142 V70 M64 70 H76 M184 70 H196" />
      <path d="M-6 122 Q 36 102 70 70 Q 130 134 190 70 Q 224 102 266 122" />
      {Array.from({ length: 7 }, (_, i) => {
        const x = 82 + i * 16;
        const t = (x - 70) / 120;
        const y = (1 - t) * (1 - t) * 70 + 2 * t * (1 - t) * 134 + t * t * 70;
        return <path key={x} d={`M${x} ${y.toFixed(1)} V142`} />;
      })}
      <path d="M-6 178 Q 14 170 34 178 T 74 178 T 114 178 T 154 178 T 194 178 T 234 178 T 274 178" />
      <path d="M20 196 Q 40 188 60 196 T 100 196 T 140 196 T 180 196 T 220 196" />
    </>
  ),
  /** Con đèo quanh co giữa các sườn núi. */
  pass: () => (
    <>
      <path d="M70 200 C 150 180, 70 152, 150 132 C 220 114, 120 94, 160 56" />
      <path d="M112 200 C 192 184, 120 160, 186 136 C 250 118, 160 98, 186 56" />
      <path d="M91 200 C 171 182, 95 156, 168 134 C 234 116, 140 96, 173 56" strokeDasharray="4 8" />
      <path d="M-6 160 L 28 112 Q 34 104 40 112 L 64 144 L 84 110" />
      <circle cx="214" cy="48" r="13" />
    </>
  ),
  /** Cành hoa ban / hoa mận nở. */
  flower: () => (
    <>
      <path d="M26 204 C 70 172, 110 152, 150 112 S 210 62, 238 40" />
      {([[96, 152, 1], [152, 108, 1.25], [198, 66, 1], [58, 186, 0.8], [226, 46, 0.7]] as const).map(([x, y, k], n) => (
        <g key={n} transform={`translate(${x} ${y}) scale(${k})`}>
          {Array.from({ length: 5 }, (_, i) => (
            <path key={i} d="M0 0 C -9 -10, -9 -24, 0 -28 C 9 -24, 9 -10, 0 0 Z" transform={`rotate(${i * 72})`} />
          ))}
          <circle r="3.5" />
        </g>
      ))}
      <path d="M120 128 q -6 -16 -18 -18 M170 84 q -4 -14 -16 -18" />
    </>
  ),

  // -- Lưu trú --
  /** Đống lửa trại với tia lửa. */
  campfire: () => (
    <>
      <path d="M72 182 L188 200 M188 182 L72 200" />
      <path d="M130 172 C 100 162, 96 130, 122 104 C 120 126, 134 128, 138 110 C 160 130, 166 158, 130 172 Z" />
      <path d="M130 168 C 118 162, 118 146, 130 136 C 142 146, 142 162, 130 168 Z" />
      <path d="M60 204 a9 6 0 0 1 18 0 M182 204 a9 6 0 0 1 18 0" />
      <circle cx="98" cy="92" r="2.5" />
      <circle cx="164" cy="82" r="2" />
      <circle cx="146" cy="62" r="2.5" />
      <path d="M112 76 l 4 -8 M174 106 l 6 -6" />
    </>
  ),
  /** Giường có gối và chăn. */
  bed: () => (
    <>
      <path d="M44 172 V96 H56 V172 M216 172 V124 H204 V172" />
      <path d="M44 144 H216" />
      <path d="M56 144 V122 Q56 114 64 114 H98 Q106 114 106 122 V144" />
      <path d="M106 144 V130 Q150 118 204 128 V144" />
      <path d="M118 134 Q 150 126 190 134" />
      <path d="M30 174 H230" />
      <path d="M160 52 a14 14 0 1 0 10 24 a11 11 0 0 1 -10 -24 Z" />
      <path d="M92 60 l 0 10 M87 65 h 10" />
    </>
  ),
  /** Ấm trà bốc khói. */
  teapot: () => (
    <>
      <path d="M84 138 C 84 104, 156 104, 156 138 C 156 162, 84 162, 84 138 Z" />
      <path d="M100 112 Q120 96 140 112 M120 96 V90 M114 90 H126" />
      <path d="M156 128 C 172 126, 178 114, 190 106 C 194 114, 184 134, 156 142" />
      <path d="M84 124 C 56 120, 56 152, 86 150" />
      <path d="M96 162 H144" />
      <path d="M110 82 C 102 72, 118 64, 108 52 M130 82 C 122 72, 138 64, 128 52" />
      <path d="M60 196 H204 M178 196 C 178 178, 214 178, 214 196" />
    </>
  ),
  /** Ô cửa sổ vòm có rèm và trăng. */
  window: () => (
    <>
      <path d="M76 190 V84 Q76 38 130 38 Q184 38 184 84 V190 Z" />
      <path d="M130 38 V190 M76 112 H184" />
      <path d="M76 56 Q 102 96 82 176 M96 48 Q 118 96 100 176" />
      <path d="M154 60 a15 15 0 1 0 10 27 a12 12 0 0 1 -10 -27 Z" />
      <path d="M62 190 H198 M68 200 H192" />
    </>
  ),
  /** Đèn dầu thắp sáng. */
  lamp: () => (
    <>
      <path d="M96 190 H164 L156 164 H104 Z" />
      <path d="M108 146 C 96 114, 112 98, 114 76 H146 C 148 98, 164 114, 152 146 Z" />
      <path d="M130 138 C 120 126, 124 114, 130 104 C 136 114, 140 126, 130 138 Z" />
      <path d="M110 76 H150 M118 68 H142 M104 164 C 98 152, 106 146, 108 146 M156 164 C 162 152, 154 146, 152 146" />
      <path d="M130 40 V52 M96 54 L104 62 M164 54 L156 62 M78 88 H92 M168 88 H182" />
    </>
  ),

  // -- Ẩm thực / đặc sản --
  /** Cá suối nướng. */
  fish: () => (
    <>
      <path d="M48 112 C 80 76, 152 76, 186 112 C 152 148, 80 148, 48 112 Z" />
      <path d="M186 112 L 226 84 Q 216 112 226 140 Z" />
      <circle cx="82" cy="104" r="4" />
      <path d="M104 90 Q 114 112 104 134" />
      <path d="M112 82 Q 132 60 152 82 M122 142 Q 136 158 152 142" />
      <path d="M128 100 q 8 6 0 12 M144 100 q 8 6 0 12 M160 104 q 6 4 0 8" />
      <circle cx="34" cy="88" r="3" />
      <circle cx="26" cy="72" r="2" />
    </>
  ),
  /** Vò rượu ngô và chén nhỏ. */
  wineJar: () => (
    <>
      <path d="M92 84 C 70 100, 66 168, 96 186 H164 C 194 168, 190 100, 168 84 Z" />
      <path d="M100 84 V70 H160 V84" />
      <path d="M94 70 Q 130 46 166 70" />
      <path d="M104 80 H156" />
      <path d="M82 134 q 7 -9 14 0 t 14 0 t 14 0 t 14 0 t 14 0 t 14 0 t 14 0" />
      <path d="M82 154 H178" />
      <path d="M192 176 H228 C 228 196, 192 196, 192 176 Z" />
      <path d="M210 196 V202 M200 204 H220" />
    </>
  ),
  /** Bắp ngô với lá bao. */
  corn: () => (
    <>
      <path d="M130 38 C 162 56, 166 122, 130 152 C 94 122, 98 56, 130 38 Z" />
      <path d="M130 44 V148 M115 54 V138 M145 54 V138 M104 80 H156 M102 104 H158 M106 128 H154" />
      <path d="M130 152 C 94 152, 66 120, 60 70 C 88 92, 108 122, 130 152" />
      <path d="M130 152 C 166 152, 194 120, 200 70 C 172 92, 152 122, 130 152" />
      <path d="M130 152 V200" />
    </>
  ),
  /** Cành chè Shan tuyết với búp non. */
  teaLeaf: () => (
    <>
      <path d="M56 196 C 90 156, 130 122, 194 58" />
      {([[84, 164], [108, 142], [132, 120], [158, 96]] as const).map(([x, y]) => (
        <g key={x}>
          <path d="M0 0 C 10 -12, 30 -12, 42 0 C 30 12, 10 12, 0 0 Z M2 0 H38" transform={`translate(${x} ${y}) rotate(-105) scale(0.9)`} />
          <path d="M0 0 C 10 -12, 30 -12, 42 0 C 30 12, 10 12, 0 0 Z M2 0 H38" transform={`translate(${x} ${y}) rotate(-5) scale(0.9)`} />
        </g>
      ))}
      <path d="M0 0 C 6 -8, 20 -8, 28 0 C 20 8, 6 8, 0 0 Z" transform="translate(194 58) rotate(-62)" />
    </>
  ),
  /** Chiếc gùi đan của người vùng cao. */
  basket: () => (
    <>
      <path d="M78 72 H182 L166 178 Q 130 192 94 178 Z" />
      <path d="M72 72 H188" />
      <path d="M82 98 H178 M86 124 H174 M90 150 H170" />
      <path d="M104 72 L 112 184 M130 72 V188 M156 72 L 148 184" />
      <path d="M78 72 C 38 92, 38 152, 76 170 M182 72 C 222 92, 222 152, 184 170" />
    </>
  ),
  /** Cơm lam: ba ống tre nướng. */
  comLam: () => (
    <>
      {([[84, 70, 128], [130, 48, 150], [176, 82, 118]] as const).map(([x, top, h]) => (
        <g key={x}>
          <path d={`M${x - 15} ${top} V${top + h} Q ${x} ${top + h + 7} ${x + 15} ${top + h} V${top}`} />
          <ellipse cx={x} cy={top} rx="15" ry="5" />
          <path d={`M${x - 15} ${top + h * 0.45} Q ${x} ${top + h * 0.45 + 7} ${x + 15} ${top + h * 0.45}`} />
          <path d={`M${x} ${top - 5} C ${x - 6} ${top - 20}, ${x - 20} ${top - 22}, ${x - 26} ${top - 14}`} />
        </g>
      ))}
      <path d="M52 206 H208" />
    </>
  ),
  /** Xiên thịt nướng trên bếp than. */
  skewers: () => (
    <>
      {([-34, 0, 34] as const).map((dy) => (
        <g key={dy} transform={`translate(130 104) rotate(-28) translate(0 ${dy})`}>
          <path d="M-96 0 H100" />
          {[-62, -28, 6, 40].map((x) => (
            <path key={x} d={`M${x} -9 h24 q7 0 7 7 v4 q0 7 -7 7 h-24 q-7 0 -7 -7 v-4 q0 -7 7 -7 Z`} />
          ))}
        </g>
      ))}
      <path d="M40 196 H220" />
      <path d="M70 196 C 66 186, 78 182, 74 172 M130 196 C 126 186, 138 182, 134 172 M190 196 C 186 186, 198 182, 194 172" />
    </>
  ),
  /** Nồi lẩu nghi ngút khói. */
  pot: () => (
    <>
      <path d="M64 112 H196 V150 Q 196 180 166 180 H94 Q 64 180 64 150 Z" />
      <path d="M56 112 H204" />
      <path d="M64 124 H44 Q 36 124 36 132 M196 124 H216 Q 224 124 224 132" />
      <path d="M80 112 C 80 92, 104 92, 104 112 M110 112 C 112 86, 140 86, 142 112 M148 112 C 150 96, 176 96, 178 112" />
      <path d="M96 76 C 88 66, 104 58, 96 46 M130 70 C 122 60, 138 52, 130 40 M164 76 C 156 66, 172 58, 164 46" />
      <path d="M86 180 L 76 198 M174 180 L 184 198" />
    </>
  ),
  /** Bánh chưng buộc lạt. */
  banhChung: () => (
    <>
      <path d="M70 58 H190 Q 196 58 196 64 V 176 Q 196 182 190 182 H70 Q 64 182 64 176 V64 Q 64 58 70 58 Z" />
      <path d="M122 58 V182 M138 58 V182 M64 111 H196 M64 127 H196" />
      <path d="M64 58 L 90 84 M196 58 L 170 84 M64 182 L 90 156 M196 182 L 170 156" />
      <circle cx="130" cy="119" r="6" />
      <path d="M76 196 H184" />
    </>
  ),

  // -- Hành trình / tiện ích --
  /** Ba lô du lịch. */
  backpack: () => (
    <>
      <path d="M82 82 Q 82 48 130 48 Q 178 48 178 82 V 172 Q 178 186 164 186 H96 Q 82 186 82 172 Z" />
      <path d="M112 50 Q 112 34 130 34 Q 148 34 148 50" />
      <path d="M96 128 H164 V172 Q 164 178 158 178 H102 Q 96 178 96 172 Z" />
      <path d="M96 142 H164 M122 128 V142" />
      <path d="M92 98 Q 130 114 168 98" />
      <path d="M82 92 C 60 102, 58 150, 82 160 M178 92 C 200 102, 202 150, 178 160" />
    </>
  ),
  /** Cột biển chỉ đường. */
  signpost: () => (
    <>
      <path d="M130 36 V198" />
      <path d="M134 54 H196 L214 68 L196 82 H134 Z" />
      <path d="M126 98 H66 L48 112 L66 126 H126 Z" />
      <path d="M134 142 H190 L206 154 L190 166 H134 Z" />
      <path d="M146 68 H184 M118 112 H78 M146 154 H178" />
      <path d="M96 198 H164 M104 198 q 4 -10 8 0 M150 198 q 4 -8 8 0" />
    </>
  ),
  /** Điện thoại có ghim vị trí và sóng. */
  phone: () => (
    <>
      <path d="M98 40 H162 Q 172 40 172 50 V 190 Q 172 200 162 200 H98 Q 88 200 88 190 V50 Q 88 40 98 40 Z" />
      <path d="M98 62 H162 V 172 H98 Z" />
      <path d="M120 50 H140" />
      <circle cx="130" cy="186" r="5" />
      <path d="M130 140 C 116 122, 112 114, 112 108 a18 18 0 0 1 36 0 c0 6 -4 14 -18 32 z" />
      <circle cx="130" cy="108" r="6" />
      <path d="M188 54 Q 208 74 188 94 M200 44 Q 228 74 200 104" />
      <path d="M72 54 Q 52 74 72 94 M60 44 Q 32 74 60 104" />
    </>
  ),
  /** Vali kéo. */
  suitcase: () => (
    <>
      <path d="M54 84 H206 Q 214 84 214 92 V 176 Q 214 184 206 184 H54 Q 46 184 46 176 V92 Q 46 84 54 84 Z" />
      <path d="M104 84 V66 Q 104 58 112 58 H148 Q 156 58 156 66 V84" />
      <path d="M84 84 V184 M176 84 V184" />
      <path d="M118 116 H142 V 130 H118 Z" />
      <circle cx="130" cy="158" r="13" />
      <circle cx="70" cy="196" r="6" />
      <circle cx="190" cy="196" r="6" />
    </>
  ),
  /** Hộp cứu thương. */
  firstAid: () => (
    <>
      <path d="M52 90 H208 Q 216 90 216 98 V 176 Q 216 184 208 184 H52 Q 44 184 44 176 V98 Q 44 90 52 90 Z" />
      <path d="M100 90 V 72 Q 100 64 108 64 H152 Q 160 64 160 72 V 90" />
      <path d="M118 112 H142 V 128 H158 V 148 H142 V 164 H118 V 148 H102 V 128 H118 Z" />
      <path d="M62 90 V184 M198 90 V184" />
    </>
  ),

  // -- Văn hóa --
  /** Khèn Mông: chùm ống khèn với hộp âm. */
  khen: () => (
    <>
      <path d="M104 150 C 104 130, 156 130, 156 150 C 156 176, 104 176, 104 150 Z" />
      <path d="M130 176 V196 Q 130 204 122 204 H 112" />
      <path d="M110 140 L 82 34 M118 136 L 102 22 M126 134 L 126 16 M134 134 L 150 22 M142 136 L 172 34 M150 140 L 180 52" />
      <path d="M96 82 H 164 M92 56 H 168" />
    </>
  ),
  /** Dải thổ cẩm hoa văn thoi kèm tua rua. */
  brocade: () => (
    <>
      <path d="M40 70 H220 V150 H40 Z" />
      <path d="M40 84 H220 M40 136 H220" />
      {[66, 104, 142, 180].map((x) => (
        <g key={x}>
          <path d={`M${x - 17} 110 L ${x} 92 L ${x + 17} 110 L ${x} 128 Z`} />
          <path d={`M${x - 7} 110 L ${x} 102 L ${x + 7} 110 L ${x} 118 Z`} />
        </g>
      ))}
      {Array.from({ length: 10 }, (_, i) => 52 + i * 18).map((x) => (
        <path key={x} d={`M${x} 150 V 170`} />
      ))}
    </>
  ),
  /** Chiếc ô / dù hoa nan nan. */
  parasol: () => (
    <>
      <path d="M30 112 C 40 52, 220 52, 230 112 Q 214 126 198 112 Q 182 126 166 112 Q 148 126 130 112 Q 112 126 94 112 Q 78 126 62 112 Q 46 126 30 112 Z" />
      <path d="M130 62 L 62 112 M130 62 L 94 112 M130 62 V 112 M130 62 L 166 112 M130 62 L 198 112" />
      <path d="M130 62 V 48" />
      <path d="M130 112 V 178 Q 130 196 114 196 Q 100 196 100 184" />
    </>
  ),

  // -- Di chuyển --
  /** Xe máy nhìn nghiêng: yên, chắn bùn, càng trước, tay lái, đèn pha. */
  motorbike: () => (
    <>
      <circle cx="66" cy="166" r="26" />
      <circle cx="206" cy="166" r="26" />
      <circle cx="66" cy="166" r="5" />
      <circle cx="206" cy="166" r="5" />
      <path d="M76 110 Q 76 100 88 100 H 136 Q 148 100 148 110 Z" />
      <path d="M38 152 Q 44 124 82 122 H 112" />
      <path d="M148 112 Q 164 110 176 96" />
      <path d="M148 110 L 150 126 M76 110 L 82 122" />
      <path d="M66 166 L 106 144 H 140 L 150 126" />
      <path d="M104 144 H 140 V 162 H 104 Z" />
      <path d="M206 166 L 182 92" />
      <path d="M170 90 H 198 M184 92 L 178 80" />
      <path d="M170 90 a 7 7 0 0 1 -12 4" />
      <path d="M100 168 L 46 176" />
    </>
  ),
  /** Xe khách. */
  bus: () => (
    <>
      <path d="M38 82 Q 38 68 52 68 H196 Q 212 68 220 88 L 230 134 V 166 H38 Z" />
      <path d="M52 84 H84 V114 H52 Z M94 84 H126 V114 H94 Z M136 84 H168 V114 H136 Z M178 84 H198 Q 206 84 210 98 L 214 114 H178 Z" />
      <path d="M38 132 H230" />
      <path d="M64 166 a18 18 0 0 1 36 0 M162 166 a18 18 0 0 1 36 0" />
      <circle cx="82" cy="168" r="14" />
      <circle cx="180" cy="168" r="14" />
      <path d="M56 60 H188 M70 60 q 10 -14 22 0 M112 60 q 14 -18 30 0" />
      <path d="M20 190 H250" />
    </>
  ),
} satisfies Record<string, () => ReactNode>;

export type MotifName = keyof typeof MOTIFS;
