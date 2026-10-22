import { useState, useEffect, type ReactNode } from 'react';
import { useParams, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { fetchPlaceDetail, peekPlaceDetail } from '@/services/placeService';
import type { PlaceDetail, PlaceContactItem } from '@/types/homestay';
import { canonicalPlacePath } from '@/lib/placeRoutes';
import { Button } from '@/components/ui/button';
import VietmapView from '@/components/map/VietmapView';
import type { VietmapMarkerItem } from '@/types/integrations/vietmap';
import {
  MapPin,
  Star,
  ArrowLeft,
  Share2,
  Bookmark,
  Check,
  ThumbsUp,
  Lightbulb,
  AlertTriangle,
  Map as MapIcon,
  Phone,
  Globe,
  ExternalLink,
  MessageCircle,
  UtensilsCrossed,
  CalendarDays,
  Info,
  Navigation,
  BookOpen,
} from 'lucide-react';
import { openGoogleMapsDirections } from '@/lib/mapUtils';
import TikTokEmbedPlayer from '@/components/homestay/TikTokEmbedPlayer';
import { DetailSkeleton } from '@/components/ui/PageSkeleton';

/**
 * Trang chi tiết đặc sản (/specialties/:identifier) — bố cục kiểu thẻ món ăn: ảnh + tên + giá tham khảo ở đầu,
 * câu chuyện món ăn, kinh nghiệm thưởng thức (Nên thử / Mẹo / Lưu ý) rồi nơi mua. Các loại địa điểm khác vẫn dùng
 * PlaceDetailPage; mở nhầm một địa điểm không phải đặc sản ở đây thì chuyển về đường dẫn chuẩn của nó.
 */
export default function SpecialtyDetailPage() {
  const { identifier } = useParams<{ identifier?: string }>();
  return <SpecialtyDetailContent key={identifier} identifier={identifier} />;
}

const formatDayMonth = (value?: string) => (value ? value.split('-').reverse().slice(0, 2).join('/') : '');

function contactLink(contact: PlaceContactItem): { icon: ReactNode; label: string; href: string; style: string } {
  const value = contact.value;
  switch (contact.channel) {
    case 'PHONE':
      return { icon: <Phone className="w-4 h-4" />, label: value, href: `tel:${value.replace(/[^0-9+]/g, '')}`, style: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' };
    case 'ZALO':
      return { icon: <MessageCircle className="w-4 h-4" />, label: `Zalo ${value.startsWith('http') ? '' : value}`.trim(), href: value.startsWith('http') ? value : `https://zalo.me/${value.replace(/[^0-9]/g, '')}`, style: 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100' };
    case 'FACEBOOK':
      return { icon: <ExternalLink className="w-4 h-4" />, label: 'Facebook', href: value.startsWith('http') ? value : `https://facebook.com/${value}`, style: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100' };
    case 'GOOGLE_MAPS':
      return { icon: <MapPin className="w-4 h-4" />, label: 'Google Maps', href: value, style: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100' };
    default:
      return { icon: <Globe className="w-4 h-4" />, label: value, href: value, style: 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100' };
  }
}

function SpecialtyDetailContent({ identifier }: { identifier?: string }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Đã xem trước đó (quay lại từ trang khác) thì vẽ ngay từ bộ nhớ, làm mới ở nền.
  const [place, setPlace] = useState<PlaceDetail | null>(() => (identifier ? peekPlaceDetail(identifier) ?? null : null));
  const [loading, setLoading] = useState(() => !(identifier && peekPlaceDetail(identifier)));
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!identifier) return undefined;
    let alive = true;
    fetchPlaceDetail(identifier)
      .then((data) => {
        if (!alive) return;
        setPlace(data);
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

  if (!place) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[var(--color-canvas)] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-amber-600">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-ink-deep)] mb-2">Không tìm thấy đặc sản</h2>
        <p className="text-sm text-[var(--color-muted)] max-w-md mb-6">
          Đặc sản bạn đang tìm có thể đã bị xóa hoặc không còn tồn tại trên hệ thống.
        </p>
        <Button variant="primary" onClick={() => navigate('/specialties')} className="rounded-md font-bold px-5">
          Quay lại danh sách đặc sản
        </Button>
      </div>
    );
  }

  const kind = place.categoryKind || 'ATTRACTION';
  const canonicalPath = identifier ? canonicalPlacePath(kind, pathname, identifier) : null;
  if (canonicalPath) return <Navigate to={canonicalPath} replace />;

  const proList = place.highlights?.filter((h) => h.type === 'PRO').map((h) => h.content) ?? [];
  const tipList = place.highlights?.filter((h) => h.type === 'TIP').map((h) => h.content) ?? [];
  const conList = place.highlights?.filter((h) => h.type === 'CON' || h.type === 'PAIN_POINT').map((h) => h.content) ?? [];
  const experienceGroups = [
    { key: 'pro', title: 'Nên thử', items: proList, icon: <ThumbsUp className="w-4 h-4" />, tone: 'bg-emerald-100 text-emerald-700' },
    { key: 'tip', title: 'Mẹo thưởng thức', items: tipList, icon: <Lightbulb className="w-4 h-4" />, tone: 'bg-amber-100 text-amber-700' },
    { key: 'con', title: 'Lưu ý', items: conList, icon: <AlertTriangle className="w-4 h-4" />, tone: 'bg-rose-100 text-rose-700' },
  ].filter((g) => g.items.length > 0);

  // Ảnh: danh sách URL backend đã sắp (ảnh bìa trước); bản cũ chỉ có media.
  const allImages = place.images && place.images.length > 0
    ? place.images.filter(Boolean)
    : (place.media ?? []).map((m) => m.publicUrl).filter(Boolean);
  const mainImage = allImages[activeImageIndex] || allImages[0];

  const hasCoordinates = Number.isFinite(place.latitude) && Number.isFinite(place.longitude);
  const lat = hasCoordinates ? place.latitude : 21.8588;
  const lng = hasCoordinates ? place.longitude : 104.0845;
  const addressText = place.address || (place.regionName ? `Khu vực ${place.regionName}, Mù Cang Chải, Yên Bái` : 'Huyện Mù Cang Chải, Tỉnh Yên Bái');
  const tiktokContact = place.contacts?.find((c) => c.channel === 'TIKTOK' && c.value);
  const contactLinks = (place.contacts ?? []).filter((c) => c.value && c.channel !== 'TIKTOK').map(contactLink);

  const markers: VietmapMarkerItem[] = [{
    id: place.id,
    name: place.name,
    latitude: lat,
    longitude: lng,
    address: addressText,
    coverImageUrl: allImages[0],
    isMain: true,
    kind,
    tagText: place.categoryName || 'Đặc sản',
  }];

  // Giá đặc sản thay đổi theo mùa và nơi bán: chỉ hiện khi có, ghi rõ là giá tham khảo.
  const priceMin = typeof place.priceRefMin === 'number' && place.priceRefMin > 0 ? place.priceRefMin : null;
  const priceMax = typeof place.priceRefMax === 'number' && place.priceRefMax > (priceMin ?? 0) ? place.priceRefMax : null;
  const priceText = priceMin
    ? `${priceMin.toLocaleString('vi-VN')}đ${priceMax ? ` – ${priceMax.toLocaleString('vi-VN')}đ` : ''}`
    : null;
  const seasonText = place.suitableDateStart && place.suitableDateEnd
    ? `${formatDayMonth(place.suitableDateStart)} – ${formatDayMonth(place.suitableDateEnd)}`
    : 'Quanh năm';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: place.name, text: place.description, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const openDirections = () => openGoogleMapsDirections(lat, lng, addressText || place.name);
  const scrollToShops = () => document.getElementById('noi-mua')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="w-full flex flex-col min-h-screen bg-[var(--color-canvas)]">
      {/* Breadcrumb & thao tác — ghim ngay dưới Header khi cuộn */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-[var(--app-header-offset,88px)] z-20 shadow-xs">
        <div className="max-w-[1180px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <nav aria-label="Đường dẫn" className="flex min-w-0 items-center gap-2 text-xs md:text-sm text-[var(--color-muted)]">
            <Link to="/" className="hover:text-[var(--color-primary)] transition-colors shrink-0">Trang chủ</Link>
            <span aria-hidden>/</span>
            <Link to="/specialties" className="hover:text-[var(--color-primary)] transition-colors shrink-0">Đặc sản</Link>
            <span aria-hidden>/</span>
            <span aria-current="page" className="text-[var(--color-ink-deep)] font-semibold truncate">{place.name}</span>
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSaved(!saved)}
              className={`p-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${saved ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              title="Lưu đặc sản"
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-rose-600' : ''}`} />
              <span className="hidden sm:inline">{saved ? 'Đã lưu' : 'Lưu'}</span>
            </button>
            <button
              onClick={handleShare}
              className="p-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Chia sẻ"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Đã sao chép' : 'Chia sẻ'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto w-full px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6">
        {/* Thẻ món ăn: ảnh bên trái, tên + giá + mùa ngon bên phải */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-[1.15fr_1fr]">
          <div className="flex flex-col">
            <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
              {mainImage ? (
                <img src={mainImage} alt={place.name} className="w-full h-full object-cover transition-opacity duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <UtensilsCrossed className="w-12 h-12" />
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide border-t border-slate-100">
                {allImages.map((img, idx) => (
                  <button
                    key={img + idx}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`Xem ảnh ${idx + 1}`}
                    className={`w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${activeImageIndex === idx ? 'border-[var(--color-primary)]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-3 py-1">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                {place.categoryName || 'Đặc sản địa phương'}
              </span>
              {place.ratingAvg ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-2.5 py-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {place.ratingAvg.toFixed(1)}
                  {place.ratingCount > 0 && <span className="font-medium text-amber-700/80">({place.ratingCount})</span>}
                </span>
              ) : null}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-[var(--color-ink-deep)] leading-tight">
                {place.name}
              </h1>
              <p className="mt-2 text-sm text-[var(--color-muted)] flex items-start gap-1.5">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[var(--color-primary)]" />
                <span>{place.regionName ? `${place.regionName}, Mù Cang Chải` : 'Mù Cang Chải, Yên Bái'}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4">
                <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-muted)]">Giá tham khảo</div>
                <div className={`mt-1 font-black leading-tight ${priceText ? 'text-lg text-amber-600' : 'text-sm text-slate-600'}`}>
                  {priceText ?? 'Tùy nơi bán'}
                </div>
                {priceText && place.priceUnitNote && <div className="text-xs text-slate-500 mt-0.5">/{place.priceUnitNote}</div>}
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4">
                <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-muted)]">Mùa ngon</div>
                <div className="mt-1 text-sm font-black text-[var(--color-primary)] flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 shrink-0" />
                  {seasonText}
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col sm:flex-row gap-2.5 pt-2">
              <Button
                variant="primary"
                onClick={scrollToShops}
                className="flex-1 rounded-xl font-bold h-11 bg-[var(--color-primary)] hover:bg-[#086350] text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <MapPin className="w-4 h-4" />
                Tìm nơi mua
              </Button>
              <Button
                variant="outline"
                onClick={openDirections}
                className="flex-1 rounded-xl font-bold h-11 border-slate-200 hover:bg-slate-50 text-slate-700 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                Chỉ đường
              </Button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Câu chuyện món ăn */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-7 shadow-xs">
              <h2 className="text-lg md:text-xl font-bold text-[var(--color-ink-deep)] flex items-center gap-2 mb-3.5">
                <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
                Câu chuyện món ăn
              </h2>
              <p className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {place.description || `Đặc sản của đồng bào vùng cao ${place.regionName || 'Mù Cang Chải'} — thông tin chi tiết đang được cập nhật.`}
              </p>
            </section>

            {/* Kinh nghiệm thưởng thức */}
            {experienceGroups.length > 0 && (
              <section className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-7 shadow-xs">
                <h2 className="text-lg md:text-xl font-bold text-[var(--color-ink-deep)] mb-4">Kinh nghiệm thưởng thức</h2>
                <div className="flex flex-col divide-y divide-slate-100">
                  {experienceGroups.map((group) => (
                    <div key={group.key} className="flex gap-3.5 py-4 first:pt-0 last:pb-0">
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${group.tone}`}>{group.icon}</span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[var(--color-ink-deep)] mb-1">{group.title}</h3>
                        <ul className="space-y-1.5 text-sm text-slate-700 leading-relaxed">
                          {group.items.map((item, idx) => <li key={idx}>• {item}</li>)}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tiktokContact && (
              <TikTokEmbedPlayer url={tiktokContact.value} placeName={place.name} className="w-full border-0 shadow-none" />
            )}

            {/* Nơi mua & thưởng thức */}
            <section id="noi-mua" className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-7 shadow-xs scroll-mt-40">
              <h2 className="text-lg md:text-xl font-bold text-[var(--color-ink-deep)] flex items-center gap-2 mb-4">
                <MapIcon className="w-5 h-5 text-[var(--color-primary)]" />
                Nơi mua & thưởng thức
              </h2>

              <div className="rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between bg-slate-50/50">
                <div className="min-w-0 text-sm">
                  <div className="font-bold text-[var(--color-ink-deep)] flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <span>{addressText}</span>
                  </div>
                  {place.accessNote && <p className="mt-1.5 pl-6 text-xs text-slate-600">{place.accessNote}</p>}
                </div>
                <button
                  type="button"
                  onClick={openDirections}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Chỉ đường
                </button>
              </div>

              {hasCoordinates && (
                <div className="mt-4 w-full h-[260px] md:h-[320px] rounded-2xl overflow-hidden border border-slate-200">
                  <VietmapView centerLat={lat} centerLng={lng} zoomLevel={15} markers={markers} className="w-full h-full" />
                </div>
              )}
            </section>
          </div>

          {/* Cột phải gọn: liên hệ + quay lại */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-40 lg:self-start">
            {contactLinks.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-[var(--color-ink-deep)] mb-3">Liên hệ hỏi mua</h3>
                <div className="flex flex-col gap-2">
                  {contactLinks.map((c, idx) => (
                    <a
                      key={idx}
                      href={c.href}
                      target={c.href.startsWith('tel:') ? '_self' : '_blank'}
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${c.style}`}
                    >
                      {c.icon}
                      <span className="truncate">{c.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <Link to="/specialties">
              <Button
                variant="outline"
                className="w-full rounded-xl font-bold h-11 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại danh sách đặc sản
              </Button>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
