import { useEffect, useRef } from 'react';
import { HERO_FALLBACK_SRC, HERO_SIZES, HERO_SRCSET } from '@/lib/heroImages';

/**
 * Nền hero trang chủ: ảnh ruộng bậc thang cũ, thêm chuyển động bám theo chính các chi tiết trong ảnh.
 *
 * Mọi lớp hiệu ứng nằm trong một "khung" cùng tỉ lệ 16:9 với ảnh và phủ kín vùng hero (như object-fit: cover),
 * nên vị trí theo % luôn trùng với ảnh ở mọi kích thước màn hình:
 * - cả khung trôi chậm (Ken Burns) và trượt nhẹ khi cuộn trang (parallax);
 * - mặt trời ở góc phải (88%, 28,5%) sáng lên rồi dịu xuống, các tia nắng xoay rất chậm;
 * - hai dải mây trong thung lũng (cao 29–38%) lững lờ trôi ngang;
 * - một vệt nắng lướt qua ruộng lúa như gió thổi; khóm lúa cao góc phải đung đưa từ gốc.
 * Người dùng chọn giảm chuyển động: tất cả đứng yên (xem globals.css), không gắn parallax.
 * Màn cảm ứng không gắn parallax: cuộn trên điện thoại chạy ở luồng riêng, transform đặt bằng JS luôn trễ một nhịp nên
 * ảnh nền rung. Hero cuộn khuất thì dừng mọi chuyển động nền (data-paused) cho phần dưới trang cuộn mượt.
 */
export default function HeroBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([entry]) => {
      root.toggleAttribute('data-paused', !entry?.isIntersecting);
    });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      // Chỉ tính khi hero còn trong tầm nhìn; ảnh lùi chậm hơn nội dung (0,25) tạo chiều sâu.
      if (y < window.innerHeight * 1.2) el.style.transform = `translate3d(0, ${(y * 0.25).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="hero-backdrop absolute inset-0 z-0 overflow-hidden bg-[#07362c]">
      <div ref={parallaxRef} className="absolute inset-0 will-change-transform">
        <div className="hero-stage">
          <img
            src={HERO_FALLBACK_SRC}
            srcSet={HERO_SRCSET}
            sizes={HERO_SIZES}
            alt="Ruộng bậc thang mùa lúa chín giữa núi rừng Tây Bắc"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full"
          />
          <img src={HERO_FALLBACK_SRC} srcSet={HERO_SRCSET} sizes={HERO_SIZES} alt="" aria-hidden className="hero-grass" />
          <div className="hero-sun" aria-hidden />
          <div className="hero-rays" aria-hidden />
          <div className="hero-cloud hero-cloud-a" aria-hidden />
          <div className="hero-cloud hero-cloud-b" aria-hidden />
          <div className="hero-breeze" aria-hidden>
            <span />
          </div>
        </div>
      </div>
      {/* Phủ tối: bên trái cho chữ dễ đọc, đỉnh cho header trong suốt, đáy chuyển dần sang xanh rừng đậm để khối tìm kiếm nổi
          lên và mép cong của phần nội dung bên dưới không bị gắt. */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#04241d]/70 via-[#04241d]/25 to-transparent" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-[#062a22]/85" aria-hidden />
    </div>
  );
}
