import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ExternalLink,
  Info,
  Leaf,
  MapPin,
  Share2,
  Soup,
  Sparkles,
  Store,
  UtensilsCrossed,
  Video,
  Images,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DetailSection from '@/components/common/DetailSection';
import ImageCarousel from '@/components/common/ImageCarousel';
import TikTokEmbedPlayer from '@/components/homestay/TikTokEmbedPlayer';
import PlaceHighlights from '@/components/common/PlaceHighlights';
import { fetchDishDetail, peekDishDetail, type DishDetailDto } from '@/services/specialtyService';
import { placeDetailPath } from '@/lib/placeRoutes';
import { DetailSkeleton } from '@/components/ui/PageSkeleton';

const vnd = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

/** Giá tham khảo của món ("50.000 – 80.000đ /phần"); null khi chưa có giá. */
function priceText(dish: DishDetailDto): string | null {
  if (dish.priceRefMin == null || dish.priceRefMin <= 0) return null;
  const max = dish.priceRefMax != null && dish.priceRefMax > dish.priceRefMin ? ` – ${vnd(dish.priceRefMax)}` : '';
  return `${vnd(dish.priceRefMin)}${max}đ${dish.priceUnitNote ? ` /${dish.priceUnitNote}` : ''}`;
}

/** Trang chi tiết món đặc sản (/specialties/:identifier — id hoặc slug). Đổi sang món khác thì dựng lại trang từ đầu. */
export default function DishDetailPage() {
  const { identifier } = useParams<{ identifier?: string }>();
  return <DishDetailContent key={identifier} identifier={identifier} />;
}

function DishDetailContent({ identifier }: { identifier?: string }) {
  const navigate = useNavigate();
  // Đã xem trước đó (quay lại từ trang khác) thì vẽ ngay từ bộ nhớ, làm mới ở nền.
  const [dish, setDish] = useState<DishDetailDto | null>(() => (identifier ? peekDishDetail(identifier) ?? null : null));
  const [loading, setLoading] = useState(() => !(identifier && peekDishDetail(identifier)));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!identifier) return undefined;
    let alive = true;
    fetchDishDetail(identifier)
      .then((data) => {
        if (!alive) return;
        setDish(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [identifier]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] bg-[var(--color-canvas)]"><DetailSkeleton label="Đang tải thông tin đặc sản" /></div>
    );
  }

  if (!dish) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[var(--color-canvas)] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-amber-600">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-ink-deep)] mb-2">Không tìm thấy đặc sản</h2>
        <p className="text-sm text-[var(--color-muted)] max-w-md mb-6">
          Món đặc sản bạn đang tìm có thể đã được gỡ hoặc không còn tồn tại trên hệ thống.
        </p>
        <Button variant="primary" onClick={() => navigate('/specialties')} className="rounded-md font-bold px-5">
          Quay lại danh sách đặc sản
        </Button>
      </div>
    );
  }

  const images = dish.images?.length ? dish.images.filter(Boolean) : dish.coverImageUrl ? [dish.coverImageUrl] : [];
  const region = dish.regionName || 'Mù Cang Chải';
  const price = priceText(dish);
  const tiktokVideo = dish.videoUrl && /tiktok\.com/i.test(dish.videoUrl) ? dish.videoUrl : null;
  const otherVideo = dish.videoUrl && !tiktokVideo ? dish.videoUrl : null;
  const facts = ([
    { label: 'Nguồn gốc', value: dish.origin, Icon: MapPin },
    { label: 'Nguyên liệu', value: dish.ingredients, Icon: Leaf },
    { label: 'Ý nghĩa văn hóa', value: dish.culturalMeaning, Icon: BookOpen },
    { label: 'Cách thưởng thức', value: dish.servingNote, Icon: Soup },
  ] as { label: string; value?: string | null; Icon: LucideIcon }[]).filter((fact) => fact.value?.trim());
  const servedAt = dish.servedAt ?? [];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: dish.name, text: dish.description ?? undefined, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-gradient-to-b from-[#eef7f3] via-[var(--color-canvas)] to-[var(--color-canvas)]">
      {/* Breadcrumb & thao tác — ghim ngay dưới Header khi cuộn */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-[var(--app-header-offset,88px)] z-20 shadow-xs">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <nav aria-label="Đường dẫn" className="flex min-w-0 items-center gap-2 text-xs md:text-sm text-[var(--color-muted)]">
            <Link to="/" className="hover:text-[var(--color-primary)] transition-colors shrink-0">Trang chủ</Link>
            <span aria-hidden>/</span>
            <Link to="/specialties" className="hover:text-[var(--color-primary)] transition-colors shrink-0">Đặc sản địa phương</Link>
            <span aria-hidden>/</span>
            <span aria-current="page" className="text-[var(--color-ink-deep)] font-semibold truncate">{dish.name}</span>
          </nav>
          <button
            onClick={handleShare}
            className="p-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            title="Chia sẻ thông tin"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Đã sao chép' : 'Chia sẻ'}</span>
          </button>
        </div>
      </div>

      {/* Tiêu đề món */}
      <section className="max-w-[1240px] mx-auto w-full px-4 md:px-8 pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#0a7d64] to-[#042f2e] p-6 text-white shadow-md md:p-10">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="relative">
            <div className="mb-3.5 flex flex-wrap items-center gap-2">
              <Badge className="bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full ring-1 ring-white/25 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-amber-300" />
                <span>Đặc sản địa phương</span>
              </Badge>
              {dish.tagBadge && <Badge className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">{dish.tagBadge}</Badge>}
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
              {dish.name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-white/90">
              <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Đặc sản vùng {region}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1240px] mx-auto w-full px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: ảnh, video, mô tả, kinh nghiệm, nơi thưởng thức */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <DetailSection icon={Sparkles} eyebrow="Giới thiệu" title="Về món đặc sản này" tone="sand">
            <p className="text-[15px] md:text-base text-slate-800 leading-[1.8] whitespace-pre-line">
              {dish.description || `Đặc sản của đồng bào vùng cao ${region} — thông tin chi tiết đang được cập nhật.`}
            </p>
            {facts.length > 0 && (
              <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {facts.map(({ label, value, Icon }) => (
                  <div key={label} className="rounded-xl border border-[#f4dfae] bg-white/80 p-3.5">
                    <dt className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-ink-deep)]">
                      <Icon className="w-4 h-4 text-[var(--color-primary)]" />
                      {label}
                    </dt>
                    <dd className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </DetailSection>

          {images.length > 0 && (
            <DetailSection icon={Images} eyebrow="Thư viện" title="Hình ảnh">
              <ImageCarousel
                images={images}
                alt={dish.name}
                className="h-[240px] rounded-xl border border-slate-200 bg-slate-100 md:h-[380px]"
                imageClassName="h-full w-full object-cover"
              />
            </DetailSection>
          )}

          {tiktokVideo && (
            <DetailSection icon={Video} eyebrow="Xem trước" title="Video review" tone="sky">
              <TikTokEmbedPlayer url={tiktokVideo} placeName={dish.name} className="mx-auto" />
            </DetailSection>
          )}

          <PlaceHighlights highlights={dish.highlights} />

          {(dish.whereToEat || servedAt.length > 0) && (
            <DetailSection icon={Store} eyebrow="Ăn ở đâu" title="Nơi thưởng thức & mua" subtitle="Gợi ý nơi ăn hoặc mua món này làm quà" tone="mint">
              {dish.whereToEat && (
                <p className="mb-4 text-[15px] text-slate-800 leading-relaxed whitespace-pre-line">{dish.whereToEat}</p>
              )}
              {servedAt.length > 0 && (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {servedAt.map((place) => (
                    <li key={place.id}>
                      <Link
                        to={placeDetailPath(place.kind, place.id)}
                        className="flex h-full items-start gap-2.5 rounded-xl border border-[#c6e8dc] bg-white p-3 transition-colors hover:border-[var(--color-primary)] hover:bg-[#edfbf7]"
                      >
                        <MapPin className="mt-0.5 w-4 h-4 shrink-0 text-[var(--color-primary)]" />
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-[var(--color-ink-deep)]">
                            {place.name}
                            {place.signature && (
                              <span className="rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-800">Món tủ</span>
                            )}
                          </span>
                          {place.address && <span className="mt-0.5 block text-xs text-[var(--color-muted)]">{place.address}</span>}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </DetailSection>
          )}
        </div>

        {/* Cột phải: thông tin khái quát */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 border-t-4 border-t-[#0a7d64] p-6 shadow-xs lg:sticky lg:top-[calc(var(--app-header-offset,72px)+72px)]">
            <h3 className="text-base font-bold text-[var(--color-ink-deep)] pb-3.5 mb-3.5 border-b border-slate-100">Thông Tin Khái Quát</h3>
            <div className="flex flex-col gap-3 text-xs md:text-sm">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-50">
                <span className="text-slate-500">Danh mục:</span>
                <span className="font-semibold text-slate-800">Đặc sản địa phương</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-50">
                <span className="text-slate-500">Khu vực:</span>
                <span className="font-semibold text-slate-800">{region}</span>
              </div>
              {price && (
                <div className="flex justify-between items-center gap-3 pb-2.5 border-b border-slate-50">
                  <span className="text-slate-500 shrink-0">Giá tham khảo:</span>
                  <span className="font-bold text-right text-amber-600">{price}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5">
              {otherVideo && (
                <a href={otherVideo} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" className="w-full rounded-xl font-bold h-11 bg-[var(--color-primary)] hover:bg-[#086350] text-xs flex items-center justify-center gap-2 shadow-xs">
                    <ExternalLink className="w-4 h-4" />
                    Xem video về món này
                  </Button>
                </a>
              )}
              <Link to="/specialties">
                <Button variant="outline" className="w-full rounded-xl font-bold h-11 border-slate-200 hover:bg-slate-50 text-slate-700 text-xs flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại danh sách đặc sản
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
