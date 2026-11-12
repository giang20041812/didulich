import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUp, Plus, Save, Star, X } from 'lucide-react';
import { useAdminPermission } from '@/hooks/useAdminPermission';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { getApiErrorMessage } from '@/lib/apiError';
import { mediaUrl } from '@/lib/mediaUrl';
import { featuredAdminApi, type FeaturedPlace } from '@/services/portalServicesApi';
import type { CategoryKind } from '@/types/admin';
import { FilterSearch, RefreshButton, SegmentedTabs, type SegmentOption } from './AdminFilters';
import { KIND_META, kindMeta } from './placeMeta';
import { StatusBadge } from './StatusBadge';
import { actionButtonClass } from './statusStyles';

/** Thứ tự các loại trên thanh chọn: loại khách hay xem nhất đứng trước. */
const KINDS: CategoryKind[] = ['HOMESTAY', 'RESTAURANT', 'ATTRACTION', 'CULTURE', 'PHOTO', 'RENTAL', 'TRANSPORT', 'SERVICE'];
const MAX_PINNED = 50;

const KIND_OPTIONS: SegmentOption<CategoryKind>[] = KINDS.map((kind) => ({
  value: kind,
  label: KIND_META[kind].label,
  icon: KIND_META[kind].icon,
  tone: 'brand',
}));

const sameOrder = (a: number[], b: number[]) => a.length === b.length && a.every((id, i) => id === b[i]);

function Rating({ place }: { place: FeaturedPlace }) {
  if (place.ratingAvg == null || place.ratingCount === 0) return <span className="text-muted">Chưa có đánh giá</span>;
  return <span className="tabular-nums">★ {Number(place.ratingAvg).toFixed(1)} <span className="text-muted">({place.ratingCount})</span></span>;
}

function PlaceCell({ place }: { place: FeaturedPlace }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="h-11 w-14 shrink-0 overflow-hidden rounded-md bg-canvas">
        {place.coverImageUrl && <img src={mediaUrl(place.coverImageUrl, 200)} alt="" loading="lazy" className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-ink-deep">{place.name}</p>
        <p className="truncate text-[11px] text-muted">{[place.regionName, place.address].filter(Boolean).join(' · ') || 'Chưa có địa chỉ'}</p>
      </div>
    </div>
  );
}

/**
 * Admin — "Địa điểm nổi bật": ghim homestay, nhà hàng, điểm tham quan... uy tín lên đầu danh sách khách thấy (trang chủ, danh sách,
 * "Đề xuất") theo thứ tự Admin sắp. Địa điểm không ghim xếp sau theo đánh giá. Sắp xếp rồi bấm "Lưu thứ tự" mới áp dụng cho khách;
 * mỗi loại có danh sách riêng. Cấp 3 chỉ xem.
 */
export default function FeaturedPlacesPanel({ notify }: { notify: (type: 'success' | 'error', text: string) => void }) {
  const canOperate = useAdminPermission().can('operate');
  const [kind, setKind] = useState<CategoryKind>('HOMESTAY');
  const [saved, setSaved] = useState<FeaturedPlace[]>([]);
  const [draft, setDraft] = useState<FeaturedPlace[]>([]);
  const [candidates, setCandidates] = useState<FeaturedPlace[]>([]);
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebouncedValue(keyword);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  const dirty = useMemo(() => !sameOrder(saved.map((p) => p.id), draft.map((p) => p.id)), [saved, draft]);
  const label = KIND_META[kind].label.toLowerCase();

  const loadPinned = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await featuredAdminApi.list(kind);
      setSaved(list);
      setDraft(list);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không tải được danh sách địa điểm nổi bật.'));
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => { void loadPinned(); }, [loadPinned, reload]);

  // Gợi ý để thêm: lấy lại khi đổi loại / từ khóa, và sau khi lưu (địa điểm đã ghim không còn trong gợi ý).
  useEffect(() => {
    let alive = true;
    featuredAdminApi.candidates(kind, debouncedKeyword.trim())
      .then((list) => { if (alive) setCandidates(list); })
      .catch(() => { if (alive) setCandidates([]); });
    return () => { alive = false; };
  }, [kind, debouncedKeyword, saved]);

  const pinnedIds = useMemo(() => new Set(draft.map((p) => p.id)), [draft]);
  const addable = candidates.filter((p) => !pinnedIds.has(p.id));

  const changeKind = (next: CategoryKind) => {
    if (next === kind) return;
    if (dirty && !window.confirm('Thứ tự vừa sắp chưa được lưu. Đổi sang loại khác sẽ bỏ các thay đổi này. Tiếp tục?')) return;
    setKeyword('');
    setKind(next);
  };

  const move = (index: number, to: number) => {
    if (to < 0 || to >= draft.length) return;
    setDraft((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      if (item) next.splice(to, 0, item);
      return next;
    });
  };
  const remove = (id: number) => setDraft((list) => list.filter((p) => p.id !== id));
  const add = (place: FeaturedPlace) => setDraft((list) => (list.length >= MAX_PINNED ? list : [...list, place]));

  const save = async () => {
    setSaving(true);
    try {
      const list = await featuredAdminApi.save(kind, draft.map((p) => p.id));
      setSaved(list);
      setDraft(list);
      notify('success', list.length > 0 ? `Đã lưu thứ tự ${list.length} ${label} nổi bật.` : `Đã bỏ ghim hết ${label}.`);
    } catch (err) {
      notify('error', getApiErrorMessage(err, 'Không lưu được thứ tự.'));
    } finally {
      setSaving(false);
    }
  };

  const th = 'px-4 py-2.5';
  const iconBtn = `${actionButtonClass('neutral')} disabled:cursor-not-allowed disabled:opacity-40`;

  return (
    <section className="rounded-lg border border-border bg-white shadow-sm">
      <p className="border-b border-border bg-canvas/50 px-4 py-2.5 text-xs text-muted">
        Địa điểm ghim hiện đầu danh sách của khách (trang chủ, trang danh sách, mục "Đề xuất") đúng thứ tự dưới đây; các địa điểm còn lại
        xếp sau theo đánh giá. Mỗi loại có danh sách riêng, tối đa {MAX_PINNED} địa điểm.
      </p>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
        <SegmentedTabs options={KIND_OPTIONS} value={kind} onChange={changeKind} ariaLabel="Loại địa điểm" />
        <div className="ml-auto flex items-center gap-2">
          <RefreshButton loading={loading} onClick={() => setReload((r) => r + 1)} />
          {canOperate && (
            <>
              <button type="button" disabled={!dirty || saving} onClick={() => setDraft(saved)} className={`${actionButtonClass('neutral')} min-h-8 px-3 disabled:opacity-40`}>
                Hoàn tác
              </button>
              <button
                type="button"
                disabled={!dirty || saving}
                onClick={() => { void save(); }}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-white transition-all hover:bg-primary-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Save className="h-3.5 w-3.5" /> {saving ? 'Đang lưu…' : 'Lưu thứ tự'}
              </button>
            </>
          )}
        </div>
      </div>
      {error && <div role="alert" className="border-b border-danger/20 bg-danger/5 px-4 py-2.5 text-xs text-danger">{error}</div>}
      {dirty && <p className="border-b border-sun/30 bg-sun/10 px-4 py-2 text-[11px] font-semibold text-amber-700">Có thay đổi chưa lưu — khách chưa thấy thứ tự mới.</p>}

      <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`}>
        <table className="admin-stack w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-canvas/60 text-[11px] font-semibold uppercase tracking-wide text-muted">
              <th className={`${th} w-16`}>Hạng</th>
              <th className={th}>Địa điểm</th>
              <th className={th}>Đánh giá</th>
              <th className={th}>Trạng thái</th>
              {canOperate && <th className={`${th} text-right`}>Sắp xếp</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {draft.map((place, index) => (
              <tr key={place.id}>
                <td data-label="Hạng" className={th}>
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-sun/20 px-1.5 text-[11px] font-bold text-amber-700 tabular-nums">{index + 1}</span>
                </td>
                <td className={`${th} max-w-[360px]`}><PlaceCell place={place} /></td>
                <td data-label="Đánh giá" className={th}><Rating place={place} /></td>
                <td data-label="Trạng thái" className={th}>
                  {place.visibility === 'PUBLISHED'
                    ? <StatusBadge tone="success">Đang hiển thị</StatusBadge>
                    : <StatusBadge tone="warning">Đang ẩn — khách chưa thấy</StatusBadge>}
                </td>
                {canOperate && (
                  <td className={`${th} text-right`}>
                    <div className="inline-flex flex-wrap justify-end gap-1">
                      <button type="button" aria-label={`Đưa ${place.name} lên đầu`} title="Lên đầu" disabled={index === 0} onClick={() => move(index, 0)} className={iconBtn}><ChevronsUp className="h-3.5 w-3.5" /></button>
                      <button type="button" aria-label={`Đưa ${place.name} lên một hạng`} title="Lên" disabled={index === 0} onClick={() => move(index, index - 1)} className={iconBtn}><ArrowUp className="h-3.5 w-3.5" /></button>
                      <button type="button" aria-label={`Đưa ${place.name} xuống một hạng`} title="Xuống" disabled={index === draft.length - 1} onClick={() => move(index, index + 1)} className={iconBtn}><ArrowDown className="h-3.5 w-3.5" /></button>
                      <button type="button" aria-label={`Bỏ ghim ${place.name}`} title="Bỏ ghim" onClick={() => remove(place.id)} className={actionButtonClass('danger')}><X className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && draft.length === 0 && !error && (
          <div className="flex flex-col items-center gap-1 py-10 text-center text-xs text-muted">
            <Star className="h-5 w-5 text-muted/60" />
            Chưa ghim {label} nào — danh sách của khách đang xếp theo đánh giá.
          </div>
        )}
      </div>

      {canOperate && (
        <div className="border-t border-border">
          <div className="flex flex-wrap items-center gap-2 bg-canvas/40 px-4 py-2.5">
            <span className="text-xs font-semibold text-ink-deep">Thêm {label} vào danh sách nổi bật</span>
            <FilterSearch value={keyword} onChange={setKeyword} placeholder={`Tìm ${label} theo tên hoặc địa chỉ...`} />
          </div>
          {draft.length >= MAX_PINNED && <p className="px-4 py-2 text-[11px] text-amber-700">Đã đủ {MAX_PINNED} địa điểm — bỏ ghim bớt để thêm mới.</p>}
          <ul className="divide-y divide-border/70">
            {addable.map((place) => {
              const Icon = kindMeta(place.kind).icon;
              return (
                <li key={place.id} className="flex items-center gap-3 px-4 py-2">
                  <div className="min-w-0 flex-1"><PlaceCell place={place} /></div>
                  <span className="hidden text-xs sm:block"><Rating place={place} /></span>
                  <Icon className="hidden h-4 w-4 text-muted sm:block" aria-hidden />
                  <button type="button" disabled={draft.length >= MAX_PINNED} onClick={() => add(place)} className={`${actionButtonClass('brand')} disabled:opacity-40`}>
                    <Plus className="h-3.5 w-3.5" /> Ghim
                  </button>
                </li>
              );
            })}
          </ul>
          {addable.length === 0 && <p className="px-4 py-6 text-center text-xs text-muted">{keyword.trim() ? `Không tìm thấy ${label} phù hợp.` : `Không còn ${label} nào đang hiển thị để ghim thêm.`}</p>}
        </div>
      )}
    </section>
  );
}
