import type { ReactNode } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, LogIn, Plus, UserRound, type LucideIcon } from 'lucide-react';
import HomeMotifs from '@/components/home/HomeMotifs';
import ExploreFeed from '@/components/experience/ExploreFeed';
import MyJourneysList from '@/components/journey/MyJourneysList';
import VisitedPlaces from '@/components/journey/VisitedPlaces';
import { getCurrentCustomer } from '@/services/authService';
import { installAxiosBoot } from '@/lib/axiosBoot';

// Trang dùng axios (lịch trình — services/journeyService): cài cấu hình (baseURL, hàng đợi / hedge / interceptor)
// trước request đầu tiên.
installAxiosBoot();

/** Tham số của trang tạo lịch trình — đường dẫn cũ /lich-trinh?province=…&tpl=… chuyển sang /lich-trinh/tao. */
const BUILDER_KEYS = ['province', 'checkIn', 'checkOut', 'guests', 'stay', 'forBooking', 'tpl', 'step', 'resume', 'd', 'p', 'an', 'mt'];

type HubTab = 'explore' | 'mine';

const isTraveler = () => getCurrentCustomer()?.role === 'TRAVELER';

function TabButton({ active, onClick, Icon, children }: { active: boolean; onClick: () => void; Icon: LucideIcon; children: ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative -mb-px inline-flex min-h-11 items-center gap-1.5 border-b-2 px-3 text-[15px] font-extrabold transition-colors cursor-pointer ${
        active ? 'border-[var(--color-primary)] text-[var(--color-ink-deep)]' : 'border-transparent text-[#59766e] hover:text-[var(--color-ink-deep)]'
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden /> {children}
    </button>
  );
}

/**
 * Trang "Lịch trình" (/lich-trinh) — gộp trang Trải nghiệm và lối vào trang lên lịch trình: một nút chính "Tạo lịch trình"
 * (sang /lich-trinh/tao) và hai tab — "Khám phá": lịch trình du khách đã đăng công khai; "Của tôi" (?tab=cua-toi): lịch
 * trình đã lưu theo giai đoạn + nơi đã check-in (chưa đăng nhập thì mời đăng nhập). /trai-nghiem, /journeys chuyển về đây.
 */
export default function TripsHubPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  if (BUILDER_KEYS.some((key) => params.has(key))) return <Navigate to={`/lich-trinh/tao?${params.toString()}`} replace />;

  const tab: HubTab = params.get('tab') === 'cua-toi' ? 'mine' : 'explore';
  const setTab = (next: HubTab) => setParams(next === 'mine' ? { tab: 'cua-toi' } : {}, { replace: true });
  const login = () => navigate('/login', {
    state: { returnUrl: '/lich-trinh?tab=cua-toi', message: 'Đăng nhập để xem và quản lý lịch trình của bạn.' },
  });

  return (
    <div className="relative isolate min-h-screen overflow-x-clip pb-16 bg-[linear-gradient(180deg,var(--color-canvas)_0%,#f1faf6_45%,#fbf7ee_100%)]">
      <HomeMotifs variant="journey" className="inset-0" />
      <div className="mx-auto w-full max-w-5xl px-4 pt-5 md:px-8 md:pt-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[28px] font-black leading-tight tracking-tight text-[var(--color-ink-deep)] md:text-[34px]">Lịch trình</h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#59766e] md:text-[15px]">
              Lên lịch trình theo giờ cho chuyến đi, hoặc áp dụng lịch trình du khách đã đi — miễn phí.
            </p>
          </div>
          <Link
            to="/lich-trinh/tao"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0a7d64] px-5 text-[15px] font-extrabold text-white shadow-[0_10px_24px_-12px_rgba(10,125,100,0.8)] transition-colors hover:bg-[#06604a]"
          >
            <Plus className="h-5 w-5" strokeWidth={2.75} aria-hidden /> Tạo lịch trình
          </Link>
        </header>

        <div role="tablist" aria-label="Lịch trình" className="mt-6 flex gap-2 border-b border-[#e3e8dc]">
          <TabButton active={tab === 'explore'} onClick={() => setTab('explore')} Icon={Compass}>Khám phá</TabButton>
          <TabButton active={tab === 'mine'} onClick={() => setTab('mine')} Icon={UserRound}>Của tôi</TabButton>
        </div>

        <div className="mt-5" role="tabpanel">
          {tab === 'explore' ? (
            <ExploreFeed />
          ) : isTraveler() ? (
            <div className="space-y-10">
              <MyJourneysList onExplore={() => setTab('explore')} />
              <VisitedPlaces compact />
            </div>
          ) : (
            <div className="rounded-2xl bg-white px-6 py-10 text-center ring-1 ring-slate-200">
              <p className="text-base font-extrabold text-slate-900">Đăng nhập để xem lịch trình của bạn</p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-600">
                Lịch trình đã lưu, chuyến đang đi và nơi bạn đã check-in nằm ở đây — trên mọi thiết bị.
              </p>
              <button type="button" onClick={login} className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-xl bg-[var(--color-ink-deep)] px-5 text-sm font-bold text-white hover:bg-black cursor-pointer">
                <LogIn className="h-4 w-4" aria-hidden /> Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
