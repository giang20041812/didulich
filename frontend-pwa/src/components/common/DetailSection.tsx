import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type DetailSectionTone = 'white' | 'mint' | 'sand' | 'sky' | 'ink';

/** Nền luôn trắng, chỉ icon + eyebrow đổi màu theo tone — phân biệt mục mà không cần cả khối màu. */
const TONES: Record<DetailSectionTone, { icon: string; eyebrow: string }> = {
  white: { icon: 'bg-[#0a7d64] text-white', eyebrow: 'text-[#0a7d64]' },
  mint: { icon: 'bg-[#0a7d64] text-white', eyebrow: 'text-[#0a7d64]' },
  sand: { icon: 'bg-[#d97706] text-white', eyebrow: 'text-[#b45309]' },
  sky: { icon: 'bg-[#2f5fb3] text-white', eyebrow: 'text-[#2f5fb3]' },
  ink: { icon: 'bg-[#0a7d64] text-white', eyebrow: 'text-[#0a7d64]' },
};

interface DetailSectionProps {
  id?: string;
  icon?: LucideIcon;
  /** Dòng nhỏ viết hoa phía trên tiêu đề. */
  eyebrow?: string;
  title: string;
  /** Mô tả ngắn dưới tiêu đề. */
  subtitle?: string;
  tone?: DetailSectionTone;
  /** Nút / chip bên phải tiêu đề. */
  aside?: ReactNode;
  className?: string;
  /** Bỏ viền ngoài để layout thanh thoát, phẳng hiện đại. */
  borderless?: boolean;
  children: ReactNode;
}

/**
 * Khối nội dung của trang chi tiết (chỗ nghỉ, địa điểm, lễ hội...): thẻ bo tròn có nền riêng, tiêu đề lớn kèm ô icon —
 * mỗi phần tách bạch, nổi hẳn lên khỏi nền trang thay vì chữ trần trên nền trắng.
 */
export default function DetailSection({
  id, icon: Icon, eyebrow, title, subtitle, tone = 'white', aside, className = '', borderless = false, children,
}: DetailSectionProps) {
  const t = TONES[tone];
  return (
    <section id={id} className={`scroll-mt-36 rounded-2xl ${borderless ? '' : 'border border-slate-200'} bg-white p-4 sm:p-5 ${className}`}>
      <header className="mb-3.5 flex flex-wrap items-start justify-between gap-3 md:mb-4">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg md:h-11 md:w-11 ${t.icon}`}>
              <Icon className="h-5 w-5" aria-hidden />
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && <p className={`text-[11px] font-extrabold uppercase tracking-[0.16em] ${t.eyebrow}`}>{eyebrow}</p>}
            <h2 className="text-xl font-black leading-tight tracking-tight text-[var(--color-ink-deep)] md:text-2xl">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
}
