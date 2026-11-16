import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mountain, ArrowRight, type LucideIcon } from 'lucide-react';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import CardFrame, { type CardFrameKind } from '@/components/ui/CardFrame';
import { mediaUrl, mediaSrcSet } from '@/lib/mediaUrl';
import { resolvePlacePhoto } from '@/lib/placeImages';

interface CompactPlaceCardProps {
  to: string;
  name: string;
  imageUrl?: string | null;
  FallbackIcon?: LucideIcon;
  location?: string | null;
  /** Mô tả ngắn (1-2 dòng) hiện dưới tên hoặc vị trí như phong cách thẻ hình 3. */
  description?: string | null;
  /** Giá đã định dạng ("350.000đ", "Miễn phí"...). Không có thì thẻ không có dòng giá. */
  price?: string | null;
  priceUnit?: string | null;
  /** Nhãn nhỏ góc trên trái ảnh (mùa đẹp, loại dịch vụ...). */
  badge?: ReactNode;
  /** Nhãn nhỏ góc trên phải ảnh (thời tiết, đánh giá, tag phụ...). */
  secondaryBadge?: ReactNode;
  /** Nút góc trên phải ảnh (vd. lưu yêu thích) — nằm ngoài link để không lồng nút trong thẻ a. */
  action?: ReactNode;
  /** Dòng trạng thái ngắn dưới địa điểm (tạm ngừng, hết phòng...). */
  notice?: ReactNode;
  /**
   * Tiện ích ngắn (vd. "Wifi", "Bếp") hiện dạng chip dưới địa điểm — chỉ từ md, điện thoại ẩn cho thẻ gọn. Truyền mảng (kể
   * cả rỗng) để thẻ chừa sẵn dòng này, các thẻ cùng hàng cao bằng nhau.
   */
  amenities?: string[] | null;
  /** Nhãn nút hành động ở chân thẻ (vd. "Khám phá ngay" kèm mũi tên chuyển động) */
  ctaText?: string | null;
  /** Khách sắp mở chi tiết (hover / chạm / focus) — dùng để tải trước. */
  onIntent?: () => void;
  /** Chế độ thu gọn (compact) kích thước vừa vặn cho danh sách homestay */
  compact?: boolean;
  /** Khung nét mảnh bên ngoài thẻ theo loại thông tin (nhà sàn cho homestay, núi cho điểm đến... — xem CardFrame). */
  frame?: CardFrameKind;
  /** Thuộc tính sizes của ảnh theo bề rộng thẻ thật trong lưới (mặc định: điện thoại 1 thẻ cuộn ngang, từ md 2 cột). Đặt đúng để
   *  trình duyệt không tải / giải mã ảnh to gấp mấy lần khung — ảnh to dễ bị bỏ khỏi bộ nhớ giải mã rồi hiện lại chậm khi cuộn về. */
  sizes?: string;
}

/**
 * Thẻ danh sách gọn cho địa điểm / homestay: ảnh thực tế, tên, địa điểm, (tiện ích) và giá — không mô tả rườm rà.
 * Mọi thẻ trong một hàng cao bằng nhau (giá luôn nằm đáy thẻ).
 * Cả thẻ là một link sang trang chi tiết.
 */
export default function CompactPlaceCard({
  to,
  name,
  imageUrl,
  FallbackIcon = Mountain,
  location,
  description,
  price,
  priceUnit,
  badge,
  secondaryBadge,
  action,
  notice,
  amenities,
  ctaText,
  onIntent,
  compact = false,
  frame,
  sizes = '(max-width: 767px) 86vw, 50vw',
}: CompactPlaceCardProps) {
  // Chỉ dùng ảnh thật của chính địa điểm; ảnh tạm (picsum...) coi như chưa có ảnh.
  const resolvedPhoto = resolvePlacePhoto(imageUrl);
  const src = mediaUrl(resolvedPhoto, 640);

  const priceLine = price ? (
    <p className={`font-extrabold leading-tight text-[#0a7d64] ${compact ? 'text-sm' : 'text-[15px] sm:text-base'}`}>
      {price}
      {priceUnit && <span className="text-xs font-medium text-slate-500"> /{priceUnit}</span>}
    </p>
  ) : null;

  const card = (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-[box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.12)]"
      onPointerEnter={onIntent}
      onTouchStart={onIntent}
      onFocus={onIntent}
    >
      <Link to={to} className="flex flex-1 flex-col focus-visible:outline-none">
        {/* Ảnh: chỉ ảnh + nhãn nhỏ, không chữ đè lên ảnh */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {src ? (
            <img
              src={src}
              srcSet={mediaSrcSet(resolvedPhoto)}
              sizes={sizes}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            />
          ) : (
            <ImagePlaceholder Icon={FallbackIcon} label="Ảnh thực tế đang tải" />
          )}
          {(badge || secondaryBadge) && (
            <div className={`pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 p-2.5 sm:p-3 ${action ? 'pr-12' : ''}`}>
              <div className="min-w-0 max-w-[70%]">{badge}</div>
              <div className="flex shrink-0 items-center gap-1.5">{secondaryBadge}</div>
            </div>
          )}
        </div>

        {/* Nội dung dưới ảnh: nền trắng, chữ tối — không phụ thuộc màu ảnh / nền trang */}
        <div className={`flex flex-1 flex-col gap-1.5 ${compact ? 'p-3' : 'p-4'}`}>
          <h3 className={`line-clamp-1 font-bold leading-snug text-slate-900 group-hover:text-[#0a7d64] transition-colors ${compact ? 'text-sm sm:text-[15px]' : 'text-base sm:text-lg'}`}>
            {name}
          </h3>
          {location && (
            <p className="flex min-w-0 items-center gap-1 text-xs text-slate-500 sm:text-[13px]">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#0a7d64]" />
              <span className="truncate">{location}</span>
            </p>
          )}

          {description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-[13px]">{description}</p>
          )}

          {amenities && !description && (
            <ul className="flex h-[22px] min-w-0 flex-wrap gap-1 overflow-hidden" aria-label="Tiện ích" title={amenities.join(' · ')}>
              {amenities.map((item) => (
                <li
                  key={item}
                  className="shrink-0 whitespace-nowrap rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium leading-tight text-slate-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}

          {notice}

          {ctaText ? (
            <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
              {priceLine ?? <span className="text-xs font-semibold text-[#0a7d64]">Tham quan tự do</span>}
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-slate-700 transition-colors group-hover:text-[#0a7d64]">
                <span>{ctaText}</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#0a7d64] transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          ) : (
            priceLine && <div className="mt-auto pt-1">{priceLine}</div>
          )}
        </div>
      </Link>
      {action && <div className="absolute right-2.5 top-2.5 z-20">{action}</div>}
    </div>
  );

  return frame ? <CardFrame kind={frame}>{card}</CardFrame> : card;
}

/** Nhãn nhỏ trên ảnh thẻ gọn (mùa đẹp, Genius...). */
export function CompactCardBadge({ children, className = 'bg-[#052620]' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs md:text-[11px] ${className}`}>
      {children}
    </span>
  );
}

/** Nhãn kính mờ phong cách hiện đại (thời tiết, đánh giá, loại hình...). */
export function GlassBadge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex max-w-full items-center gap-1 rounded-full bg-black/55 px-2.5 py-0.5 text-[10px] font-semibold text-white/95 border border-white/20 shadow-xs md:text-[11px] ${className}`}>
      {children}
    </span>
  );
}
