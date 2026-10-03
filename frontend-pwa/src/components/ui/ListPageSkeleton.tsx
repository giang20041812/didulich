import { Skeleton } from './skeleton';
import { COMPACT_GRID_FULL, COMPACT_GRID_WITH_SIDEBAR } from '@/lib/compactCard';

const bar = 'bg-slate-200 opacity-100';

/** Khung chờ một thẻ gọn (CompactPlaceCard): ảnh 16:10 + tên + địa điểm + giá, cùng bo góc / khoảng đệm với thẻ thật. */
export function CompactCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-xs">
      <Skeleton className={`${bar} aspect-[16/10] w-full shrink-0 rounded-none`} />
      <div className="flex flex-1 flex-col gap-2 p-2.5 sm:p-3">
        <Skeleton className={`${bar} h-3.5 w-4/5 sm:h-4`} />
        <Skeleton className={`${bar} h-3 w-1/2 opacity-70`} />
        <Skeleton className={`${bar} mt-auto h-4 w-1/3`} />
      </div>
    </div>
  );
}

/** Lưới thẻ chờ — cùng lưới với trang thật (có cột bộ lọc: 2 cột; toàn chiều ngang: 2/3/4 cột). */
export function CardGridSkeleton({ count = 6, withSidebar = false }: { count?: number; withSidebar?: boolean }) {
  return (
    <div role="status" aria-busy="true" className={withSidebar ? COMPACT_GRID_WITH_SIDEBAR : COMPACT_GRID_FULL}>
      <span className="sr-only">Đang tải danh sách</span>
      {Array.from({ length: count }, (_, i) => <CompactCardSkeleton key={i} />)}
    </div>
  );
}

function Chip({ w }: { w: string }) {
  return <Skeleton className={`${bar} h-8 shrink-0 rounded-full ${w}`} />;
}

/** Khung chờ thanh công cụ phía trên danh sách: tiêu đề + số kết quả, sắp xếp, hàng chip lọc nhanh. */
export function ToolbarSkeleton({ chips = 5, showSort = true }: { chips?: number; showSort?: boolean }) {
  const widths = ['w-24', 'w-28', 'w-20', 'w-32', 'w-24', 'w-28', 'w-20'];
  return (
    <div
      role="status"
      aria-busy="true"
      className="relative mb-6 overflow-hidden rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-900/[0.06] md:p-5"
    >
      <span className="sr-only">Đang tải bộ lọc</span>
      <div aria-hidden="true">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-3.5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Skeleton className={`${bar} h-6 w-36`} />
            <Skeleton className={`${bar} h-6 w-24 rounded-full`} />
          </div>
          {showSort && (
            <div className="flex items-center gap-2.5">
              <Skeleton className={`${bar} h-9 w-40 rounded-xl`} />
              <Skeleton className={`${bar} h-9 w-32 rounded-xl`} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-hidden pt-3.5">
          <Skeleton className={`${bar} h-4 w-20 shrink-0`} />
          {Array.from({ length: chips }, (_, i) => <Chip key={i} w={widths[i % widths.length]!} />)}
        </div>
      </div>
    </div>
  );
}

/** Khung chờ cột bộ lọc bên trái: tiêu đề + các nhóm (tên nhóm + vài dòng ô chọn) + thanh giá. */
export function FilterPanelSkeleton({ groups = 3, className }: { groups?: number; className?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={`overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-slate-900/[0.06] ${className ?? ''}`}
    >
      <span className="sr-only">Đang tải bộ lọc</span>
      <div aria-hidden="true">
        <div className="flex items-center gap-2 border-b border-slate-100 p-4">
          <Skeleton className={`${bar} h-4 w-4 rounded`} />
          <Skeleton className={`${bar} h-5 w-36`} />
        </div>
        <div className="space-y-5 p-4">
          <div className="space-y-3">
            <Skeleton className={`${bar} h-4 w-24`} />
            <Skeleton className={`${bar} h-2 w-full rounded-full`} />
            <div className="flex justify-between">
              <Skeleton className={`${bar} h-3 w-14`} />
              <Skeleton className={`${bar} h-3 w-14`} />
            </div>
          </div>
          {Array.from({ length: groups }, (_, g) => (
            <div key={g} className="space-y-3 border-t border-slate-100 pt-4">
              <Skeleton className={`${bar} h-4 w-28`} />
              {Array.from({ length: 4 }, (_, r) => (
                <div key={r} className="flex items-center gap-2.5">
                  <Skeleton className={`${bar} h-4 w-4 shrink-0 rounded`} />
                  <Skeleton className={`${bar} h-3.5 ${r % 2 ? 'w-2/5' : 'w-3/5'}`} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Hàng tab / chip ngang (mùa lễ hội, loại dịch vụ…). */
export function TabsSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  const widths = ['w-36', 'w-40', 'w-48', 'w-48'];
  return (
    <div role="status" aria-busy="true" className={`flex items-center gap-2 overflow-hidden ${className ?? ''}`}>
      <span className="sr-only">Đang tải bộ lọc</span>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} aria-hidden="true" className={`${bar} h-9 shrink-0 rounded-full ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}
