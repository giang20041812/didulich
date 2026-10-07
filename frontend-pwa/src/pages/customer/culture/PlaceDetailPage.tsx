import { useState, useEffect } from 'react';
import { useParams, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { fetchPlaceDetail, peekPlaceDetail } from '@/services/placeService';
import { PlaceDetail } from '@/types/homestay';
import { canonicalPlacePath, placeSectionFor } from '@/lib/placeRoutes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import VietmapView from '@/components/map/VietmapView';
import type { VietmapMarkerItem } from '@/types/integrations/vietmap';
import {
  MapPin,
  Star,
  Sparkles,
  ArrowLeft,
  Share2,
  Bookmark,
  CheckCircle2,
  Map as MapIcon,
  Phone,
  Globe,
  Compass,
  Check,
  Flame,
  Info,
  UtensilsCrossed,
  Layers,
  Images,
  Bike,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  Video
} from 'lucide-react';
import { openGoogleMapsDirections } from '@/lib/mapUtils';
import TikTokEmbedPlayer from '@/components/homestay/TikTokEmbedPlayer';
import PlaceHighlights from '@/components/common/PlaceHighlights';
import DetailSection from '@/components/common/DetailSection';
import ImageCarousel from '@/components/common/ImageCarousel';
import { DetailSkeleton } from '@/components/ui/PageSkeleton';



// Dữ liệu Pro / Con / Tip được lấy trực tiếp từ bảng place_highlight qua API backend

/** Đổi sang địa điểm khác (cùng route, khác :identifier) thì dựng lại trang từ đầu. */
export default function PlaceDetailPage() {
  const { identifier } = useParams<{ identifier?: string }>();
  return <PlaceDetailContent key={identifier} identifier={identifier} />;
}

function PlaceDetailContent({ identifier }: { identifier?: string }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Đã xem trước đó (quay lại từ trang khác) thì vẽ ngay từ bộ nhớ, làm mới ở nền.
  const [place, setPlace] = useState<PlaceDetail | null>(() => (identifier ? peekPlaceDetail(identifier) ?? null : null));
  const [loading, setLoading] = useState(() => !(identifier && peekPlaceDetail(identifier)));
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

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
      <div className="w-full min-h-[60vh] bg-[var(--color-canvas)]"><DetailSkeleton label="Đang tải thông tin địa điểm" /></div>
    );
  }

  if (!place) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[var(--color-canvas)] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-amber-600">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-ink-deep)] mb-2">Không tìm thấy địa điểm</h2>
        <p className="text-sm text-[var(--color-muted)] max-w-md mb-6">
          Địa điểm bạn đang tìm kiếm có thể đã bị xóa hoặc không còn tồn tại trên hệ thống.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/destinations')}
          className="rounded-md font-bold px-5"
        >
          Quay lại danh sách điểm đến
        </Button>
      </div>
    );
  }

  const kind = place.categoryKind || 'ATTRACTION';
  // Mở dưới mục sai (link cũ /restaurants/:id, /food/:id cho đặc sản...) thì chuyển về đường dẫn chuẩn của loại địa
  // điểm — header sáng đúng mục, breadcrumb đúng danh sách.
  const canonicalPath = identifier ? canonicalPlacePath(kind, pathname, identifier) : null;
  if (canonicalPath) return <Navigate to={canonicalPath} replace />;
  const needLabel = place.needs === 'adventure' ? 'Khám phá & phiêu lưu' : place.needs === 'enjoy' ? 'Tận hưởng & thư giãn' : null;

  // Ảnh: danh sách URL backend đã sắp (ảnh bìa trước); bản cũ chỉ có media.
  const allImages = place.images && place.images.length > 0
    ? place.images.filter(Boolean)
    : (place.media ?? []).map(m => m.publicUrl).filter(Boolean);

  // Coordinates
  const hasCoordinates = Number.isFinite(place.latitude) && Number.isFinite(place.longitude);
  const lat = hasCoordinates ? place.latitude : 21.8588;
  const lng = hasCoordinates ? place.longitude : 104.0845;
  const addressText = place.address || (place.regionName ? `Khu vực ${place.regionName}, Mù Cang Chải, Yên Bái` : 'Huyện Mù Cang Chải, Tỉnh Yên Bái');
  const tiktokContact = place.contacts.find((contact) => contact.channel === 'TIKTOK' && contact.value);
  // Link TikTok đã hiện thành khung video — không lặp lại như một kênh liên hệ.
  const inquiryContacts = place.contacts.filter((contact) => contact.channel !== 'TIKTOK');

  // Markers for VietMap
  const markers: VietmapMarkerItem[] = [
    {
      id: place.id,
      name: place.name,
      latitude: lat,
      longitude: lng,
      address: addressText,
      coverImageUrl: allImages[0],
      isMain: true,
      kind: kind,
      tagText: place.categoryName || 'Địa điểm khám phá'
    }
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: place.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Link Google Maps lưu ở place_contact (kênh GOOGLE_MAPS); không có thì tìm theo tọa độ.
  const googleMapsUrl = place.contacts?.find(contact => contact.channel === 'GOOGLE_MAPS' && contact.value)?.value
    || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  // Mục điều hướng & breadcrumb theo loại địa điểm (lib/placeRoutes — cùng nguồn với header).
  const section = placeSectionFor(kind);
  const parentRoute = section.path;
  const parentLabel = section.label;
  let categoryIcon = <Compass className="w-4 h-4 text-[var(--color-primary)]" />;
  if (kind === 'RESTAURANT' || kind === 'FOOD') {
    categoryIcon = <UtensilsCrossed className="w-4 h-4 text-[var(--color-coral)]" />;
  } else if (kind === 'TRANSPORT') {
    categoryIcon = <Bike className="w-4 h-4 text-[#3dc9d9]" />;
  } else if (kind === 'SERVICE' || kind === 'PHOTO' || kind === 'RENTAL') {
    categoryIcon = <Layers className="w-4 h-4 text-[var(--color-sun)]" />;
  }

  const hasPrice = typeof place.priceRefMin === 'number';
  const priceDisplay = !hasPrice || place.priceRefMin === 0
    ? 'Miễn phí tham quan'
    : `${(place.priceRefMin as number).toLocaleString('vi-VN')}đ${place.priceUnitNote ? ` /${place.priceUnitNote}` : ''}`;
  const amenityNames = (place.amenityItems?.length ? place.amenityItems.map((item) => item.name) : place.amenities ?? [])
    .filter((name): name is string => typeof name === 'string' && name.trim().length > 0);

  return (
    <div className="w-full flex flex-col min-h-screen bg-gradient-to-b from-[#eef7f3] via-[var(--color-canvas)] to-[var(--color-canvas)]">
      {/* Top Breadcrumb & Actions Bar - ghim ngay dưới Header khi scroll */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-[var(--app-header-offset,88px)] z-20 shadow-xs">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <nav aria-label="Đường dẫn" className="flex min-w-0 items-center gap-2 text-xs md:text-sm text-[var(--color-muted)]">
            <Link to="/" className="hover:text-[var(--color-primary)] transition-colors shrink-0">
              Trang chủ
            </Link>
            <span aria-hidden>/</span>
            <Link to={parentRoute} className="hover:text-[var(--color-primary)] transition-colors shrink-0">
              {parentLabel}
            </Link>
            <span aria-hidden>/</span>
            <span aria-current="page" className="text-[var(--color-ink-deep)] font-semibold truncate">
              {place.name}
            </span>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSaved(!saved)}
              className={`p-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                saved
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Lưu địa điểm"
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-rose-600' : ''}`} />
              <span className="hidden sm:inline">{saved ? 'Đã lưu' : 'Lưu'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Chia sẻ thông tin"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Đã sao chép' : 'Chia sẻ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tiêu đề địa điểm */}
      <section className="max-w-[1240px] mx-auto w-full px-4 md:px-8 pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#0a7d64] to-[#042f2e] p-6 text-white shadow-md md:p-10">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="relative">
            <div className="mb-3.5 flex flex-wrap items-center gap-2">
              <Badge className="bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full ring-1 ring-white/25 flex items-center gap-1.5">
                {categoryIcon}
                <span>{place.categoryName || parentLabel}</span>
              </Badge>
              {needLabel && <Badge className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">{needLabel}</Badge>}

              {place.verification === 'OFFICIAL_VERIFIED' ? (
                <Badge className="bg-emerald-500/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> GPS Đã xác minh
                </Badge>
              ) : (
                <Badge className="bg-cyan-600/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Cộng đồng đề xuất
                </Badge>
              )}

              {place.ratingAvg ? (
                <div className="bg-black/30 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ring-1 ring-white/20">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{place.ratingAvg.toFixed(1)}</span>
                  {place.ratingCount !== undefined && place.ratingCount > 0 && (
                    <span className="text-white/70 font-normal">({place.ratingCount} đánh giá)</span>
                  )}
                </div>
              ) : null}
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
              {place.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{addressText}</span>
              </div>
              {place.altitudeMeters ? (
                <div className="flex items-center gap-2 text-emerald-200">
                  <Compass className="w-4 h-4 shrink-0" />
                  <span>Độ cao {place.altitudeMeters}m</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-[1240px] mx-auto w-full px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3): Description, Pro/Con/Tip, Street Map */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* 1. Mô tả */}
          <DetailSection icon={Sparkles} eyebrow="Giới thiệu" title="Thông tin & mô tả chi tiết" tone="sand">
            <p className="text-[15px] md:text-base text-slate-800 leading-[1.8] whitespace-pre-line">
              {place.description
                || `Địa điểm nổi bật tọa lạc tại khu vực ${place.regionName || 'Mù Cang Chải'}, sở hữu vẻ đẹp hoang sơ kỳ vĩ và cảnh quan đặc trưng của vùng cao Yên Bái. Nơi đây là điểm dừng chân hấp dẫn dành cho du khách muốn trải nghiệm trọn vẹn thiên nhiên và nét sinh hoạt mộc mạc của đồng bào bản địa.`}
            </p>

            {place.suitableDateStart && place.suitableDateEnd && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#0a7d64]/20 bg-white/80 p-3.5 text-sm font-semibold text-[#0a7d64]">
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[var(--color-coral)]" />
                  Thời điểm tham quan đẹp nhất trong năm:
                </span>
                <span className="font-extrabold">
                  {place.suitableDateStart.split('-').reverse().slice(0, 2).join('/')} – {place.suitableDateEnd.split('-').reverse().slice(0, 2).join('/')}
                </span>
              </div>
            )}
          </DetailSection>

          {/* 2. Hình ảnh */}
          {allImages.length > 0 && (
            <DetailSection icon={Images} eyebrow="Thư viện" title="Hình ảnh" tone="white">
              <ImageCarousel
                images={allImages}
                alt={place.name}
                className="h-[240px] rounded-xl border border-slate-200 bg-slate-100 md:h-[380px]"
                imageClassName="h-full w-full object-cover"
              />
            </DetailSection>
          )}

          {tiktokContact && (
            <DetailSection icon={Video} eyebrow="Xem trước chuyến đi" title="Video review" tone="sky">
              <TikTokEmbedPlayer url={tiktokContact.value} placeName={place.name} className="mx-auto" />
            </DetailSection>
          )}

          {/* 2. PRO - TIP - CON (Kinh nghiệm thực tế chuyên sâu từ bảng place_highlight) */}
          <PlaceHighlights highlights={place.highlights} />

          {/* 3. Tiện ích */}
          {amenityNames.length > 0 && (
            <DetailSection icon={CheckCircle2} eyebrow="Có sẵn tại đây" title="Tiện ích & dịch vụ" tone="mint">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenityNames.map((name) => (
                  <div key={name} className="flex items-center gap-2 rounded-xl border border-[#c6e8dc] bg-white p-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                    <span className="font-semibold text-slate-800">{name}</span>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {/* 4. Vị trí & bản đồ */}
          <DetailSection
            icon={MapIcon}
            eyebrow="Vị trí"
            title="Bản đồ & đường đi"
            tone="sky"
            aside={hasCoordinates ? (
              <button
                type="button"
                onClick={() => openGoogleMapsDirections(lat, lng, addressText || place.name)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-blue-700 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors shrink-0 cursor-pointer"
                title="Mở Google Maps để chọn điểm xuất phát"
              >
                <MapIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Chỉ đường Google Maps</span>
              </button>
            ) : undefined}
          >
            <div className="mb-4 rounded-xl border border-[#cddcf5] bg-white p-3.5 text-sm text-slate-700 flex flex-col gap-1.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[var(--color-ink-deep)]">Địa chỉ: </span>
                  <span>{addressText}</span>
                </div>
              </div>

              {place.accessNote && (
                <div className="flex items-start gap-2 pt-1.5 border-t border-slate-100">
                  <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[var(--color-ink-deep)]">Ghi chú tiếp cận: </span>
                    <span className="text-slate-600">{place.accessNote}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full h-[320px] md:h-[400px] rounded-xl overflow-hidden border border-[#cddcf5] relative">
              <VietmapView
                centerLat={lat}
                centerLng={lng}
                zoomLevel={14}
                markers={markers}
                className="w-full h-full"
                mapClassName="min-h-0"
              />
            </div>
          </DetailSection>
        </div>

        {/* Right Column (1/3): Summary Card & Contacts */}
        <div className="flex flex-col gap-6">
          
          <div className="bg-white rounded-2xl border border-slate-200/80 border-t-4 border-t-[#0a7d64] p-6 shadow-xs lg:sticky lg:top-[calc(var(--app-header-offset,72px)+72px)]">
            <h3 className="text-lg font-black text-[var(--color-ink-deep)] pb-3.5 mb-3.5 border-b border-slate-100">
              Thông tin khái quát
            </h3>

            <div className="flex flex-col gap-3 text-xs md:text-sm">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-50">
                <span className="text-slate-500">Mức chi phí tham khảo:</span>
                <span className="font-bold text-base text-amber-600">
                  {priceDisplay}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-50">
                <span className="text-slate-500">Danh mục:</span>
                <span className="font-semibold text-slate-800">
                  {place.categoryName || parentLabel}
                </span>
              </div>

              {needLabel && (
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-50">
                  <span className="text-slate-500">Nhu cầu:</span>
                  <span className="font-semibold text-amber-700">{needLabel}</span>
                </div>
              )}

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-50">
                <span className="text-slate-500">Khu vực:</span>
                <span className="font-semibold text-slate-800">
                  {place.regionName || 'Huyện Mù Cang Chải'}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-50">
                <span className="text-slate-500">Trạng thái:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Đang mở cửa đón khách
                </span>
              </div>
            </div>

            {/* Contacts & Hotline */}
            {inquiryContacts.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] mb-3">
                  Kênh liên hệ hỏi thông tin:
                </h4>
                <div className="flex flex-col gap-2">
                  {inquiryContacts.map((contact, cIdx) => {
                    let icon = <Globe className="w-3.5 h-3.5 text-slate-600" />;
                    let label = contact.value;
                    let href = contact.value;
                    let colorStyle = "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100";

                    if (contact.channel === 'PHONE') {
                      icon = <Phone className="w-3.5 h-3.5 text-emerald-600" />;
                      label = `Hotline tư vấn: ${contact.value}`;
                      href = `tel:${contact.value.replace(/[^0-9+]/g, '')}`;
                      colorStyle = "bg-emerald-50/80 text-emerald-900 border-emerald-200 hover:bg-emerald-100";
                    } else if (contact.channel === 'ZALO') {
                      icon = <MessageCircle className="w-3.5 h-3.5 text-cyan-600" />;
                      label = `Zalo hỗ trợ: ${contact.value}`;
                      href = contact.value.startsWith('http') ? contact.value : `https://zalo.me/${contact.value.replace(/[^0-9]/g, '')}`;
                      colorStyle = "bg-cyan-50/80 text-cyan-900 border-cyan-200 hover:bg-cyan-100";
                    } else if (contact.channel === 'FACEBOOK') {
                      icon = <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />;
                      label = "Fanpage Facebook";
                      href = contact.value.startsWith('http') ? contact.value : `https://facebook.com/${contact.value}`;
                      colorStyle = "bg-indigo-50/80 text-indigo-900 border-indigo-200 hover:bg-indigo-100";
                    } else if (contact.channel === 'GOOGLE_MAPS') {
                      icon = <MapPin className="w-3.5 h-3.5 text-blue-600" />;
                      label = "Vị trí Google Maps";
                      href = contact.value;
                      colorStyle = "bg-blue-50/80 text-blue-900 border-blue-200 hover:bg-blue-100";
                    }

                    return (
                      <a
                        key={cIdx}
                        href={href}
                        target={contact.channel === 'PHONE' ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${colorStyle}`}
                      >
                        {icon}
                        <span className="truncate">{label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Navigation Action Buttons */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5">
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="primary"
                  className="w-full rounded-xl font-bold h-11 bg-[var(--color-primary)] hover:bg-[#086350] text-xs flex items-center justify-center gap-2 shadow-xs"
                >
                  <MapPin className="w-4 h-4" />
                  Mở chỉ đường Google Maps
                </Button>
              </a>

              <Link to={parentRoute}>
                <Button
                  variant="outline"
                  className="w-full rounded-xl font-bold h-11 border-slate-200 hover:bg-slate-50 text-slate-700 text-xs flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {section.backLabel}
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
