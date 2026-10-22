import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchFestivalByIdOrSlug } from '@/services/festivalService';
import { FestivalDto } from '@/types/festival';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import VietmapView from '@/components/map/VietmapView';
import type { VietmapMarkerItem } from '@/types/integrations/vietmap';
import {
  Calendar,
  MapPin,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
  Share2,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ThumbsUp,
  Map as MapIcon,
  Compass,
  Check,
  Flame,
  Info,
  Images
} from 'lucide-react';
import { openGoogleMapsDirections } from '@/lib/mapUtils';
import ImageCarousel from '@/components/common/ImageCarousel';
import DetailSection from '@/components/common/DetailSection';
import { DetailSkeleton } from '@/components/ui/PageSkeleton';

// Tọa độ GPS chuẩn cho từng lễ hội tại Mù Cang Chải
const FESTIVAL_COORDINATES: Record<string, { lat: number; lng: number; address: string; accessNote: string }> = {
  'mua-vang-kham-pha-ruong-bac-thang': {
    lat: 21.8485,
    lng: 104.0912,
    address: 'Đồi Mâm Xôi, Xã La Pán Tẩn, Huyện Mù Cang Chải, Tỉnh Yên Bái',
    accessNote: 'Từ Quốc lộ 32 rẽ vào đường liên thôn La Pán Tẩn. Ô tô đỗ tại bãi xe chân đồi, tiếp tục đi bộ hoặc xe ôm bản địa 1.5km lên đồi.'
  },
  'mung-com-moi': {
    lat: 21.7512,
    lng: 104.3184,
    address: 'Bản Lìm Mông, Xã Tú Lệ & Bản Sáng Nhù, Mù Cang Chải, Yên Bái',
    accessNote: 'Đường bê tông liên bản ô tô vào tận nơi. Có bãi đỗ xe tại nhà văn hóa cộng đồng bản.'
  },
  'festival-khen-mong': {
    lat: 21.8588,
    lng: 104.0845,
    address: 'Sân vận động Trung tâm Huyện Mù Cang Chải, Thị trấn Mù Cang Chải, Yên Bái',
    accessNote: 'Ngay trung tâm thị trấn, mặt đường Quốc lộ 32, chỗ đỗ xe máy và ô tô thuận tiện.'
  },
  'hoa-to-day': {
    lat: 21.7925,
    lng: 104.1432,
    address: 'Khu vực rừng hoa Tớ Dày, Xã Púng Luông & Nậm Khắt, Mù Cang Chải, Yên Bái',
    accessNote: 'Đi theo đường tỉnh lộ hướng Nậm Khắt, đường dốc thoai thoải, cảnh quan hai bên đường ngập tràn sắc hoa đỏ thắm.'
  },
  'gau-tao': {
    lat: 21.8650,
    lng: 104.1120,
    address: 'Đồi Gầu Tào truyền thống, Xã Chế Cu Nha, Huyện Mù Cang Chải, Tỉnh Yên Bái',
    accessNote: 'Đường đèo bê tông dốc vừa phải, ô tô gầm cao hoặc xe máy di chuyển dễ dàng.'
  }
};

// Cung cấp bộ PRO - CON - TIP đặc thù sâu sắc cho từng lễ hội
const FESTIVAL_HIGHLIGHTS: Record<string, {
  pros: string[];
  cons: string[];
  tips: string[];
}> = {
  'mua-vang-kham-pha-ruong-bac-thang': {
    pros: [
      'Khung cảnh Di tích Quốc gia ruộng bậc thang vào mùa lúa chín vàng rực rỡ nhất trong năm.',
      'Nhiều hoạt động biểu diễn dù lượn Bay Trên Mùa Vàng tại đèo Khau Phạ cực kỳ mãn nhãn.',
      'Cơ hội gặp gỡ cộng đồng nghệ nhân Mông, Thái và thưởng thức nông sản mới gặt.'
    ],
    cons: [
      'Lượng khách đổ về rất đông vào các dịp cuối tuần tháng 9 - 10, đường QL32 có thể ùn tắc cục bộ.',
      'Đoạn đường xe ôm lên Mâm Xôi dốc đứng và nhiều bụi vào những ngày hanh khô.'
    ],
    tips: [
      'Nên chụp ảnh vào khung giờ vàng 06:30 - 08:30 sáng khi sương sớm còn vờn trên ngọn lúa.',
      'Nên mặc trang phục màu nổi (trắng, đỏ, cam) để tương phản tuyệt đẹp với nền lúa chín vàng.',
      'Chuẩn bị sẵn tiền mặt lẻ để thanh toán phí xe ôm hoặc mua nông sản người dân.'
    ]
  },
  'mung-com-moi': {
    pros: [
      'Không khí đầm ấm, mộc mạc và đậm chất văn hóa gia đình truyền thống vùng cao Tây Bắc.',
      'Được thưởng thức cốm non nếp nương rang giã tay thơm ngào ngạt vừa ra lò.',
      'Trải nghiệm lối sống sinh hoạt mến khách nguyên bản của đồng bào người Thái Trắng và Mông.'
    ],
    cons: [
      'Lễ hội mang tính gia đình và thôn bản, không diễn ra cố định một ngày mà rải rác theo vụ lúa gặt.',
      'Cần có sự dẫn dắt của người dân địa phương hoặc homestay để tham gia đúng nghi lễ trang trọng.'
    ],
    tips: [
      'Hãy thử tự tay cầm chày giã cốm cùng các cô gái Thái để cảm nhận trọn vẹn sự tinh tế của phong tục.',
      'Mua cốm tươi gói lá dong mang về làm quà trong ngày là lựa chọn tuyệt vời nhất.'
    ]
  },
  'festival-khen-mong': {
    pros: [
      'Hội tụ những nghệ nhân thổi khèn điêu luyện nhất khắp các bản làng rẻo cao Tây Bắc.',
      'Các điệu múa khèn quay người, nhảy bước tinh xảo thể hiện tinh thần thượng võ và tài hoa của chàng trai Mông.',
      'Có không gian trưng bày và workshop hướng dẫn kỹ thuật chế tác nhạc cụ truyền thống.'
    ],
    cons: [
      'Khu vực sân khấu trung tâm vào tối khai mạc rất đông khán giả, cần đến sớm để có vị trí quan sát tốt.',
      'Âm thanh nhạc cụ vang rộn cả ngày, du khách nhạy cảm với tiếng ồn nên chọn vị trí ngồi thoáng.'
    ],
    tips: [
      'Gặp gỡ nghệ nhân tại các gian hàng trưng bày vào buổi sáng để được nghe diễn giải chi tiết về các thế khèn.',
      'Tôn trọng không gian biểu diễn, không đi cắt ngang qua trước mặt các nghệ nhân đang thực hiện bài khèn thi tài.'
    ]
  },
  'hoa-to-day': {
    pros: [
      'Cảnh sắc hoa Tớ Dày (đào rừng hoang dã) bung nở đỏ rực cả sườn núi báo hiệu mùa xuân về.',
      'Không gian thanh bình, ít xô bồ hơn mùa lúa chín, khí hậu mùa đông se lạnh trong lành.',
      'Các bản làng người Mông bước vào ngày tết cổ truyền với nhiều trò chơi dân gian rực rỡ sắc màu.'
    ],
    cons: [
      'Mùa hoa nở phụ thuộc nhiều vào thời tiết rét buốt, thời gian rộ hoa chỉ kéo dài từ 2 đến 3 tuần.',
      'Buổi chiều mùa đông sương mù buông sớm, nhiệt độ giảm sâu cần chuẩn bị áo ấm dày.'
    ],
    tips: [
      'Cung đường xã Nậm Khắt và đồi Púng Luông là hai tọa độ có mật độ hoa nở dày và rực rỡ nhất.',
      'Kết hợp chụp ảnh trang phục dân tộc Mông hoa trên nền cành Tớ Dày sẽ cho ra những bức ảnh rất thơ mộng.'
    ]
  },
  'gau-tao': {
    pros: [
      'Lễ hội mùa xuân linh thiêng nhất của đồng bào Mông cầu phúc, cầu mùa màng bội thu và con cái bình an.',
      'Nhiều trò chơi dân gian truyền thống sôi động: bắn nỏ, đánh cù, ném pao, đẩy gậy.',
      'Màu sắc trang phục truyền thống của phụ nữ Mông rực rỡ sắc thổ cẩm trong ngày hội lớn.'
    ],
    cons: [
      'Địa điểm diễn ra ở bãi đồi cao lộng gió, đường đi dốc và đất đỏ nếu gặp sương mù ẩm ướt.',
      'Cần chú ý giữ gìn trật tự và không làm ồn trong thời gian thầy cúng thực hiện nghi lễ dựng cây nêu.'
    ],
    tips: [
      'Hãy tham gia ném pao cùng thanh niên bản địa để trải nghiệm trọn vẹn nét văn hóa giao duyên thanh lịch.',
      'Không bước qua hoặc động chạm vào cây nêu thiêng giữa bãi hội.'
    ]
  }
};

export default function FestivalDetailPage() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const identifier = slug || id || 'mua-vang-kham-pha-ruong-bac-thang';
  const navigate = useNavigate();

  const [festival, setFestival] = useState<FestivalDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchFestivalByIdOrSlug(identifier)
      .then((data) => {
        setFestival(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [identifier]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] bg-[var(--color-canvas)]"><DetailSkeleton label="Đang tải thông tin lễ hội" /></div>
    );
  }

  if (!festival) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[var(--color-canvas)] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-amber-600">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-ink-deep)] mb-2">Không tìm thấy thông tin lễ hội</h2>
        <p className="text-sm text-[var(--color-muted)] max-w-md mb-6">
          Lễ hội bạn đang tìm kiếm có thể đã được cập nhật hoặc không tồn tại. Vui lòng quay lại danh sách để khám phá.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/experiences')}
          className="rounded-md font-bold px-5"
        >
          Quay lại danh sách lễ hội
        </Button>
      </div>
    );
  }

  // Tọa độ & thông tin vị trí
  const geoInfo = FESTIVAL_COORDINATES[festival.slug] || {
    lat: 21.8588,
    lng: 104.0845,
    address: festival.location || 'Huyện Mù Cang Chải, Tỉnh Yên Bái',
    accessNote: 'Đường giao thông liên xã thuận tiện, di chuyển bằng xe máy hoặc ô tô.'
  };

  // Highlights Pro / Con / Tip cho các lễ hội đặc thù
  const highlights = FESTIVAL_HIGHLIGHTS[festival.slug];

  // Markers cho VietMap
  const markers: VietmapMarkerItem[] = [
    {
      id: festival.id,
      name: festival.name,
      latitude: geoInfo.lat,
      longitude: geoInfo.lng,
      address: geoInfo.address,
      coverImageUrl: festival.coverImageUrl,
      isMain: true,
      kind: 'ATTRACTION',
      tagText: festival.highlightTag || 'Lễ hội bản địa'
    }
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: festival.name,
        text: festival.coreValue,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${geoInfo.lat},${geoInfo.lng}`;

  return (
    <div className="w-full flex flex-col min-h-screen bg-gradient-to-b from-[#eef7f3] via-[var(--color-canvas)] to-[var(--color-canvas)]">
      {/* Top Breadcrumb & Navigation - ghim ngay dưới Header khi scroll */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-[var(--app-header-offset,88px)] z-20 shadow-xs">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs md:text-sm text-[var(--color-muted)] truncate">
            <Link to="/" className="hover:text-[var(--color-primary)] transition-colors shrink-0">
              Trang chủ
            </Link>
            <span>/</span>
            <Link to="/experiences" className="hover:text-[var(--color-primary)] transition-colors shrink-0">
              Văn hóa & Lễ hội
            </Link>
            <span>/</span>
            <span className="text-[var(--color-ink-deep)] font-semibold truncate">
              {festival.name}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSaved(!saved)}
              className={`p-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                saved
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Lưu lễ hội"
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-rose-600' : ''}`} />
              <span className="hidden sm:inline">{saved ? 'Đã lưu' : 'Lưu lại'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Chia sẻ thông tin"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Đã chép link' : 'Chia sẻ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tiêu đề lễ hội */}
      <section className="max-w-[1240px] mx-auto w-full px-4 md:px-8 pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#0a7d64] to-[#042f2e] p-6 text-white shadow-md md:p-10">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="relative">
            <div className="mb-3.5 flex flex-wrap items-center gap-2">
              <Badge className="bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full ring-1 ring-white/25">
                {festival.highlightTag || 'Di Sản Văn Hóa'}
              </Badge>
              {festival.isCurrentSeason && (
                <Badge className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  Thời điểm đẹp nhất đang diễn ra
                </Badge>
              )}
              <span className="text-xs font-semibold bg-black/25 px-3 py-1 rounded-full ring-1 ring-white/20">
                {festival.regionName || 'Mù Cang Chải, Yên Bái'}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
              {festival.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Thời gian: <strong>{festival.timeRange || festival.seasonNote}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{festival.location || geoInfo.address}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-[1240px] mx-auto w-full px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3): Content, Pro/Con/Tip, Street Map */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* 1. Ý nghĩa & bản sắc */}
          <DetailSection icon={Sparkles} eyebrow="Bản sắc cốt lõi" title="Ý nghĩa lịch sử & văn hóa" tone="sand">
            <p className="text-[15px] md:text-base text-slate-800 leading-[1.8] whitespace-pre-line">
              {festival.coreValue}
            </p>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#f4dfae] bg-white/80 p-3.5 text-sm text-slate-700">
              <Calendar className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[var(--color-ink-deep)]">Chu kỳ thời gian mùa vụ: </span>
                <span>{festival.seasonNote}</span>
              </div>
            </div>
          </DetailSection>

          {/* 2. Hình ảnh */}
          {festival.coverImageUrl && (
            <DetailSection icon={Images} eyebrow="Thư viện" title="Hình ảnh">
              <ImageCarousel
                images={[festival.coverImageUrl]}
                alt={festival.name}
                className="h-[240px] rounded-xl border border-slate-200 bg-slate-100 md:h-[380px]"
                imageClassName="h-full w-full object-cover"
              />
            </DetailSection>
          )}

          {/* 3. Trải nghiệm đề xuất */}
          <DetailSection icon={Compass} eyebrow="Nên làm gì" title="Trải nghiệm đề xuất & hoạt động tiêu biểu" tone="mint">
            <div className="text-[15px] text-slate-800 leading-[1.8] whitespace-pre-line">
              {festival.suitableExperience}
            </div>

            {festival.activities && festival.activities.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                  Các hoạt động chính
                </h4>
                <div className="flex flex-wrap gap-2">
                  {festival.activities.map((act, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-white text-[var(--color-primary)] text-xs font-bold rounded-lg border border-[#c6e8dc] flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      #{act}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </DetailSection>

          {/* 3. PRO - TIP - CON (Kinh nghiệm thực tế chuyên sâu) */}
          {highlights && (
            <DetailSection
              icon={Lightbulb}
              eyebrow="Kinh nghiệm thực tế"
              title="Ưu điểm • Mẹo hay • Lưu ý"
              subtitle="Ưu điểm, lưu ý chuẩn bị và kinh nghiệm bản địa để chuyến đi trọn vẹn nhất"
              tone="white"
            >

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* PRO: Ưu điểm */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-2.5">
                      <ThumbsUp className="w-4 h-4 text-emerald-600" />
                      <span>Ưu điểm (Pro)</span>
                    </div>
                    <ul className="space-y-2 text-[13px] md:text-sm text-emerald-900 leading-relaxed">
                      {highlights.pros.map((item, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CON: Hạn chế / Điểm lưu ý */}
                <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs uppercase tracking-wider mb-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Lưu ý (Con)</span>
                    </div>
                    <ul className="space-y-2 text-[13px] md:text-sm text-rose-900 leading-relaxed">
                      {highlights.cons.map((item, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-1.5">
                          <span className="text-rose-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* TIP: Pro tip từ người bản địa */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wider mb-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Mẹo hay (Pro Tip)</span>
                    </div>
                    <ul className="space-y-2 text-[13px] md:text-sm text-amber-900 leading-relaxed">
                      {highlights.tips.map((item, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </DetailSection>
          )}

          {/* 4. Lưu ý văn hóa & điều cấm kỵ */}
          <DetailSection icon={ShieldAlert} eyebrow="Ứng xử có văn hóa" title="Quy tắc văn hóa & điều không nên làm" tone="sand">
            <p className="text-[15px] text-slate-800 font-medium leading-relaxed mb-3">
              {festival.etiquetteDont}
            </p>
            <div className="text-sm text-amber-900 bg-white/80 rounded-xl p-3.5 border border-amber-200">
              💡 <strong>Lời khuyên du lịch có trách nhiệm:</strong> Luôn xin phép trước khi chụp ảnh người cao tuổi, không xả rác tại các khu di tích danh thắng và giữ gìn cảnh quan thiên nhiên sạch đẹp.
            </div>
          </DetailSection>

          {/* 5. Vị trí & bản đồ */}
          <DetailSection
            icon={MapIcon}
            eyebrow="Vị trí"
            title="Bản đồ & đường đi"
            tone="sky"
            aside={
              <button
                type="button"
                onClick={() => openGoogleMapsDirections(geoInfo.lat, geoInfo.lng, geoInfo.address || festival.name)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-blue-700 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors shrink-0 cursor-pointer"
                title="Mở Google Maps để chọn điểm xuất phát"
              >
                <MapIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Chỉ đường Google Maps</span>
              </button>
            }
          >
            <div className="mb-4 rounded-xl border border-[#cddcf5] bg-white p-3.5 text-sm text-slate-700 flex flex-col gap-1.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[var(--color-ink-deep)]">Địa chỉ tổ chức: </span>
                  <span>{geoInfo.address}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1.5 border-t border-slate-100">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[var(--color-ink-deep)]">Chỉ dẫn tiếp cận: </span>
                  <span className="text-slate-600">{geoInfo.accessNote}</span>
                </div>
              </div>
            </div>

            <div className="w-full h-[320px] md:h-[400px] rounded-xl overflow-hidden border border-[#cddcf5] relative">
              <VietmapView
                centerLat={geoInfo.lat}
                centerLng={geoInfo.lng}
                zoomLevel={14}
                markers={markers}
                className="w-full h-full"
                mapClassName="min-h-0"
              />
            </div>
          </DetailSection>
        </div>

        {/* Right Column (1/3): Summary Card & Useful Guide */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 border-t-4 border-t-[#0a7d64] p-6 shadow-xs lg:sticky lg:top-[calc(var(--app-header-offset,72px)+72px)]">
            <h3 className="text-lg font-black text-[var(--color-ink-deep)] pb-3.5 mb-3.5 border-b border-slate-100">
              Tóm tắt lễ hội
            </h3>

            <div className="flex flex-col gap-3.5 text-xs md:text-sm">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-50">
                <span className="text-slate-500">Trạng thái:</span>
                <span className="font-bold text-[var(--color-primary)]">
                  {festival.isCurrentSeason ? 'Đang vào mùa nở rộ' : 'Theo lịch thường niên'}
                </span>
              </div>

              <div className="flex justify-between items-start pb-2.5 border-b border-slate-50">
                <span className="text-slate-500 shrink-0">Thời gian tổ chức:</span>
                <span className="font-semibold text-right text-[var(--color-ink-deep)]">
                  {festival.timeRange || festival.seasonNote}
                </span>
              </div>

              <div className="flex justify-between items-start pb-2.5 border-b border-slate-50">
                <span className="text-slate-500 shrink-0">Khu vực:</span>
                <span className="font-semibold text-right text-[var(--color-ink-deep)]">
                  {festival.regionName || 'Mù Cang Chải'}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-50">
                <span className="text-slate-500">Giá vé tham gia:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Miễn phí mở cửa tự do
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Loại hình:</span>
                <span className="font-semibold text-slate-800">Di sản văn hóa phi vật thể</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5">
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="primary"
                  className="w-full rounded-xl font-bold h-11 bg-[var(--color-primary)] hover:bg-[#086350] text-xs flex items-center justify-center gap-2 shadow-xs"
                >
                  <MapPin className="w-4 h-4" />
                  Chỉ đường tới điểm lễ hội
                </Button>
              </a>

              <Link to="/experiences">
                <Button
                  variant="outline"
                  className="w-full rounded-xl font-bold h-11 border-slate-200 hover:bg-slate-50 text-slate-700 text-xs flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Xem tất cả lễ hội khác
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
