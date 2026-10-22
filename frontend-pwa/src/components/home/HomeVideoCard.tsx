import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import TikTokCardMedia from '@/components/home/TikTokCardMedia';
interface HomeVideoCardProps {
  /** Điểm đến (PlaceSummaryDto) hoặc món đặc sản (DishSummaryDto). */
  place: { name: string; coverImageUrl?: string | null; tiktokUrl?: string | null };
  detailPath: string;
  /** Thẻ đang nằm giữa carousel. */
  active: boolean;
  FallbackIcon: LucideIcon;
  /** Nhãn nằm trên tên (thời điểm đẹp của điểm đến, tag của đặc sản...). */
  tag?: ReactNode;
  /** Chữ trên nút xem chi tiết. */
  ctaLabel: string;
}

/**
 * Thẻ trang chủ của điểm đến / đặc sản: chỉ còn khung video TikTok dọc (không có video thì ảnh) — tên, nhãn và nút xem
 * chi tiết nằm gọn ở đáy khung, không còn phần mô tả / giá bên dưới nên thẻ thấp hẳn. Chữ chỉ hiện ở thẻ giữa (thẻ hai
 * bên bị cắt mép màn hình thì chữ thành vụn); vùng chữ để chạm xuyên xuống video, trừ nút.
 */
export default function HomeVideoCard({ place, detailPath, active, FallbackIcon, tag, ctaLabel }: HomeVideoCardProps) {
  return (
    <article className="h-full w-full overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-black/5">
      <TikTokCardMedia
        tiktokUrl={place.tiktokUrl}
        coverUrl={place.coverImageUrl}
        title={place.name}
        active={active}
        FallbackIcon={FallbackIcon}
        overlay={(muteButton) => (
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3.5 pb-3.5 pt-24 transition-opacity duration-300 ${
              active ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {tag}
            <h3 className="mt-1.5 line-clamp-2 text-lg font-extrabold leading-snug text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">
              {place.name}
            </h3>
            <div className="mt-2.5 flex gap-2">
              <Link
                to={detailPath}
                aria-label={`${ctaLabel}: ${place.name}`}
                className="pointer-events-auto flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white text-sm font-extrabold text-[#0a7d64] shadow-sm transition-colors hover:bg-[#edfbf7] active:scale-[0.98]"
              >
                {ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              {/* Nút loa (khi video đang phát) nằm cạnh nút xem chi tiết — góc trên là tên kênh TikTok */}
              {muteButton}
            </div>
          </div>
        )}
      />
    </article>
  );
}
