import { Minus, Plus } from 'lucide-react';

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max?: number;
  onChange: (value: number) => void;
  /** Dòng phụ dưới nhãn (vd "Còn 3 phòng trống"). */
  hint?: string;
}

/** Ô tăng / giảm số lượng (phòng, khách) với nút đủ lớn để bấm bằng ngón tay trên điện thoại. */
export default function Stepper({ label, value, min, max, onChange, hint }: StepperProps) {
  const button = 'flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer';
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
      <div className="min-w-0">
        <div className="text-sm font-bold text-slate-800">{label}</div>
        {hint && <div className="truncate text-[11px] font-medium text-[var(--color-muted)]">{hint}</div>}
      </div>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Giảm ${label.toLowerCase()}`} className={button}>
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-7 text-center text-base font-black text-[var(--color-ink-deep)]" aria-live="polite">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} disabled={max != null && value >= max} aria-label={`Tăng ${label.toLowerCase()}`} className={button}>
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
