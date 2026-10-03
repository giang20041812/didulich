import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mountain, type LucideIcon } from 'lucide-react';
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
  /** Giá đã định dạng ("350.000đ", "Miễn phí"...). Không có thì thẻ không có dòng giá. */
  price?: string | null;
  priceUnit?: string | null;
  /** Nhãn nhỏ góc trên trái ảnh (mùa đẹp, loại dịch vụ...). */
  badge?: ReactNode;
  /** Nút góc trên phải ảnh (vd. lưu yêu thích) — nằm ngoài link để không lồng nút trong thẻ a. */
  action?: ReactNode;
  /** Dòng trạng thái ngắn dưới địa điểm (tạm ngừng, hết phòng...). */
  notice?: ReactNode;
  /**
   * Tiện ích ngắn (vd. "Wifi", "Bếp") hiện dạng chip dưới địa điểm — chỉ từ md, điện thoại ẩn cho thẻ gọn. Truyền mảng (kể
   * cả rỗng) để thẻ chừa sẵn dòng này, các thẻ cùng hàng cao bằng nhau.
   */
  amenities?: string[] | null;
  /** Khách sắp mở chi tiết (hover / chạm / focus) — dùng để tải trước. */
  onIntent?: () => void;
  /** Chế độ thu gọn (compact) kích thước vừa vặn cho danh sách homestay */
  compact?: boolean;
  /** Khung nét mảnh bên ngoài thẻ theo loại thông tin (nhà sàn cho homestay, núi cho điểm đến... — xem CardFrame). */
  frame?: CardFrameKind;
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
  price,
  priceUnit,
  badge,
  action,
  notice,
  amenities,
  onIntent,
  compact = false,
  frame,
}: CompactPlaceCardProps) {
  // Chỉ dùng ảnh thật của chính địa điểm; ảnh tạm (picsum...) coi như chưa có ảnh.
  const resolvedPhoto = resolvePlacePhoto(imageUrl);
  const src = mediaUrl(resolvedPhoto, 640);

  const card = (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-[#0b5a47] ring-1 ring-emerald-400/20 shadow-[0_1px_2px_rgba(5,36,30,0.2),0_12px_26px_-14px_rgba(5,36,30,0.55)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:ring-emerald-300/50 hover:shadow-[0_2px_4px_rgba(5,36,30,0.2),0_28px_48px_-18px_rgba(5,36,30,0.7)]"
      onPointerEnter={onIntent}
      onTouchStart={onIntent}
      onFocus={onIntent}
    >
      <Link to={to} className="flex flex-1 flex-col">
        <div
          className={`clip-top-2xl relative w-full shrink-0 overflow-hidden bg-slate-100 ${
            compact ? 'aspect-[16/10]' : 'aspect-[4/3]'
          }`}
        >
          {src ? (
            <img
              src={src}
              srcSet={mediaSrcSet(resolvedPhoto)}
              sizes="(max-width: 767px) 50vw, (max-width: 1023px) 45vw, 30vw"
              alt={name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
            />
          ) : (
            <ImagePlaceholder Icon={FallbackIcon} label="Ảnh thực tế đang tải" />
          )}
          {/* Chân ảnh tan vào nền xanh rừng của phần thông tin, kèm quầng sáng ngọc lục bảo */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#0b5a47] via-[#0b5a47]/70 via-35% to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-950/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="pointer-events-none absolute bottom-2 right-2 translate-y-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 opacity-0 shadow-md transition-[opacity,transform] duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            Xem chi tiết →
          </span>
          {badge && (
            <div
              className={`absolute left-2 top-2 ${
                action ? 'max-w-[calc(100%-2.5rem)]' : 'max-w-[calc(100%-0.8rem)]'
              }`}
            >
              {badge}
            </div>
          )}
        </div>

        <div className={`flex flex-1 flex-col gap-1 bg-gradient-to-b from-[#0b5a47] to-[#06281f] bg-origin-border border-t-2 border-transparent transition-colors duration-500 group-hover:border-amber-400 ${compact ? 'p-2.5 sm:p-3' : 'p-3.5 md:p-4'}`}>
          <h3
            className={`font-extrabold leading-snug text-white transition-colors group-hover:text-emerald-200 ${
              compact
                ? 'line-clamp-1 text-xs sm:text-sm'
                : 'line-clamp-2 min-h-[2.5rem] text-sm md:text-[15px]'
            }`}
          >
            {name}
          </h3>
          {location && (
            <p className="flex min-w-0 items-center gap-1 text-[11px] sm:text-xs font-medium text-white/65">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-emerald-300" />
              <span className="truncate">{location}</span>
            </p>
          )}
          {amenities && (
            <ul
              className="hidden flex-wrap content-start gap-1 overflow-hidden pt-0.5 md:flex"
              aria-label="Tiện ích"
            >
              {amenities.slice(0, compact ? 2 : 4).map((item) => (
                <li
                  key={item}
                  className="max-w-full truncate rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold leading-tight text-emerald-100 border border-white/15 transition-colors duration-300 group-hover:border-emerald-300/50 group-hover:bg-white/15"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
          {notice}
          {price && (
            <p
              className={`mt-auto pt-1 font-black leading-tight text-emerald-300 ${
                compact ? 'text-xs sm:text-sm' : 'text-sm md:text-base'
              }`}
            >
              {price}
              {priceUnit && (
                <span className="text-[10px] sm:text-[11px] font-normal text-white/55">
                  {' '}
                  /{priceUnit}
                </span>
              )}
            </p>
          )}
        </div>
      </Link>
      {action && <div className="absolute right-2 top-2 z-10">{action}</div>}
    </div>
  );

  return frame ? <CardFrame kind={frame}>{card}</CardFrame> : card;
}

/** Nhãn nhỏ trên ảnh thẻ gọn. */
export function CompactCardBadge({ children, className = 'bg-[#0a7d64]' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs md:text-[11px] ${className}`}>
      {children}
    </span>
  );
}
