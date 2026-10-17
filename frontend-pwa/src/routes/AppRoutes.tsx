import { lazy, Suspense, type ComponentType } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import CustomerRoute from '@/components/layout/CustomerRoute';
import TravelerRoute from '@/components/layout/TravelerRoute';
// Trang chủ nằm trong bundle chính; các trang còn lại tải theo từng route (import trực tiếp, không qua '@/pages',
// để cổng Admin / NCC và thư viện biểu đồ, bản đồ không bị kéo vào lần tải đầu của khách).
// Khung cổng Admin / NCC cũng tải lười: chúng kéo theo axios (lib/axiosBoot) — khách du lịch không cần tải.
import HomePage from '@/pages/home/HomePage';
import { recoverChunkLoad } from '@/lib/chunkRecovery';
import { PageSkeleton } from '@/components/ui/PageSkeleton';

const PartnerLayout = lazy(() => import('@/components/partner/PartnerLayout'));

/** Chỗ chờ chung khi khung / trang chưa tải xong — cùng kiểu con quay của lazyPage. */
function RouteFallback() {
  return (
    <PageSkeleton />
  );
}

/** Bọc một trang tải lười trong Suspense riêng để layout (sidebar, header) không bị gỡ khi chuyển trang. */
function lazyPage(load: () => Promise<{ default: ComponentType }>) {
  const Page = lazy(async () => {
    try {
      return await load();
    } catch (error) {
      // Sau một lần deploy mới, tab đang mở còn giữ tên chunk cũ: tải lại trang đúng một lần để lấy bản mới.
      if (await recoverChunkLoad(error)) {
        return new Promise<{ default: ComponentType }>(() => {});
      }
      throw error;
    }
  });
  return function LazyPage() {
    return (
      <Suspense
        fallback={
          <PageSkeleton />
        }
      >
        <Page />
      </Suspense>
    );
  };
}

const HomestayListPage = lazyPage(() => import('@/pages/customer/homestay/HomestayListPage'));
const HomestayDetailPage = lazyPage(() => import('@/pages/customer/homestay/HomestayDetailPage'));
const FullScreenMapPage = lazyPage(() => import('@/pages/customer/homestay/FullScreenMapPage'));
const BookingPage = lazyPage(() => import('@/pages/customer/booking/BookingPage'));
const UserBookingListPage = lazyPage(() => import('@/pages/customer/booking/UserBookingListPage'));
const UserBookingDetailPage = lazyPage(() => import('@/pages/customer/booking/UserBookingDetailPage'));
const JourneyDetailPage = lazyPage(() => import('@/pages/customer/journey/JourneyDetailPage'));
const SharedJourneyPage = lazyPage(() => import('@/pages/customer/journey/SharedJourneyPage'));
const TripPlannerPage = lazyPage(() => import('@/pages/customer/trip/TripPlannerPage'));
const TripsHubPage = lazyPage(() => import('@/pages/customer/trip/TripsHubPage'));
const QrCheckinPage = lazyPage(() => import('@/pages/customer/stay/QrCheckinPage'));
const CheckinQrPosterPage = lazyPage(() => import('@/pages/portal/CheckinQrPosterPage'));
const CultureFestivalPage = lazyPage(() => import('@/pages/customer/culture/CultureFestivalPage'));
const FestivalDetailPage = lazyPage(() => import('@/pages/customer/culture/FestivalDetailPage'));
const DestinationListPage = lazyPage(() => import('@/pages/customer/culture/DestinationListPage'));
const TravelGuidePage = lazyPage(() => import('@/pages/customer/guide/TravelGuidePage'));
const PlaceDetailPage = lazyPage(() => import('@/pages/customer/culture/PlaceDetailPage'));
const RestaurantListPage = lazyPage(() => import('@/pages/customer/services/RestaurantListPage'));
const SpecialtyListPage = lazyPage(() => import('@/pages/customer/services/SpecialtyListPage'));
const DishDetailPage = lazyPage(() => import('@/pages/customer/services/DishDetailPage'));
const TransportListPage = lazyPage(() => import('@/pages/customer/services/TransportListPage'));
const ComboListPage = lazyPage(() => import('@/pages/customer/combo/ComboListPage'));
const ComboDetailPage = lazyPage(() => import('@/pages/customer/combo/ComboDetailPage'));
const UtilityListPage = lazyPage(() => import('@/pages/customer/services/UtilityListPage'));
const PhotoCreditsPage = lazyPage(() => import('@/pages/customer/PhotoCreditsPage'));
const UnifiedAuthPage = lazyPage(() => import('@/pages/auth/UnifiedAuthPage'));
const UserProfilePage = lazyPage(() => import('@/pages/customer/profile/UserProfilePage'));
const ProviderRegisterPage = lazyPage(() => import('@/pages/auth/ProviderRegisterPage'));
const ProviderSuspendedPage = lazyPage(() => import('@/pages/portal/ProviderSuspendedPage'));
const PartnerCalendarPage = lazyPage(() => import('@/pages/partner/PartnerCalendarPage'));
const PartnerDashboardPage = lazyPage(() => import('@/pages/partner/PartnerDashboardPage'));
const PartnerHomestaysPage = lazyPage(() => import('@/pages/partner/PartnerHomestaysPage'));
const PartnerRoomsPage = lazyPage(() => import('@/pages/partner/PartnerRoomsPage'));
const PartnerBookingsPage = lazyPage(() => import('@/pages/partner/PartnerBookingsPage'));
const PartnerBookingProcessPage = lazyPage(() => import('@/pages/partner/PartnerBookingProcessPage'));
const PartnerReviewsPage = lazyPage(() => import('@/pages/partner/PartnerReviewsPage'));
const PartnerExplorePlacesPage = lazyPage(() => import('@/pages/partner/PartnerExplorePlacesPage'));
const PartnerListingsPage = lazyPage(() => import('@/pages/partner/PartnerListingsPage'));
const PartnerNearbyOffersPage = lazyPage(() => import('@/pages/partner/PartnerNearbyOffersPage'));
const PartnerCombosPage = lazyPage(() => import('@/pages/partner/PartnerCombosPage'));
const PartnerServicesHomePage = lazyPage(() => import('@/pages/partner/PartnerServicesHomePage'));
const PartnerHome = lazyPage(() => import('@/pages/partner/PartnerHome'));
const PartnerHomestayEditPage = lazyPage(() => import('@/pages/partner/PartnerHomestayEditPage'));
const PartnerHomestayCreatePage = lazyPage(() => import('@/pages/partner/PartnerHomestayCreatePage'));
const PartnerProfilePage = lazyPage(() => import('@/pages/partner/PartnerProfilePage'));
const DesignSystemPage = lazyPage(() => import('@/pages/system/DesignSystemPage'));
const DownloadAppPage = lazyPage(() => import('@/pages/system/DownloadAppPage'));
const NotFoundPage = lazyPage(() => import('@/pages/system/NotFoundPage'));

/** Đường dẫn cũ → trang mới, giữ tham số (vd /trai-nghiem?share=1 → /lich-trinh?share=1) hoặc thay bằng search. */
function Moved({ to, search }: { to: string; search?: string }) {
  const location = useLocation();
  return <Navigate to={{ pathname: to, search: search ?? location.search }} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Wrap all customer pages in CustomerRoute */}
      <Route element={<CustomerRoute />}>
        {/* Khung ứng dụng chính với Sidebar Layout */}
        <Route element={<SidebarLayout />}>
          <Route index element={<HomePage />} />
          
          {/* Navigation via Sidebar */}
          <Route path="homestays" element={<HomestayListPage />} />
          <Route path="homestays/:id" element={<HomestayDetailPage />} />
          
          {/* User Bookings Management */}
          <Route element={<TravelerRoute />}>
            <Route path="bookings" element={<UserBookingListPage />} />
            <Route path="my-bookings" element={<UserBookingListPage />} />
            <Route path="bookings/:bookingCode" element={<UserBookingDetailPage />} />
            {/* Một lịch trình đã lưu (danh sách "Của tôi" nằm ở trang Lịch trình) */}
            <Route path="journeys/:id" element={<JourneyDetailPage />} />
          </Route>
          {/* Khách quét mã QR nhận phòng dán tại homestay (chưa đăng nhập vẫn mở được, trang mời đăng nhập) */}
          <Route path="qr/:code" element={<QrCheckinPage />} />
          {/* Lịch trình: tạo mới (nút chính) · Khám phá (lịch trình du khách đăng công khai) · Của tôi (?tab=cua-toi) */}
          <Route path="lich-trinh" element={<TripsHubPage />} />
          <Route path="trai-nghiem" element={<Moved to="/lich-trinh" />} />
          <Route path="journeys" element={<Moved to="/lich-trinh" search="?tab=cua-toi" />} />
          {/* Lịch trình được chia sẻ công khai — ai có link đều xem được */}
          <Route path="j/:token" element={<SharedJourneyPage />} />
          
          <Route path="experiences" element={<CultureFestivalPage />} />
          <Route path="experiences/:slug" element={<FestivalDetailPage />} />
          <Route path="festivals/:slug" element={<FestivalDetailPage />} />
          <Route path="destinations" element={<DestinationListPage />} />
          <Route path="destinations/:identifier" element={<PlaceDetailPage />} />
          <Route path="places/:identifier" element={<PlaceDetailPage />} />
          <Route path="restaurants" element={<RestaurantListPage />} />
          <Route path="restaurants/:identifier" element={<PlaceDetailPage />} />
          <Route path="specialties" element={<SpecialtyListPage />} />
          <Route path="specialties/:identifier" element={<DishDetailPage />} />
          
          {/* Profile / Other standard layout pages */}
          <Route path="profile" element={<UserProfilePage />} />
          
          {/* Keep existing routes but map them properly or leave for later phases */}
          <Route path="culture" element={<CultureFestivalPage />} />
          <Route path="culture/:slug" element={<FestivalDetailPage />} />
          <Route path="explore" element={<CultureFestivalPage />} />
          <Route path="explore/:slug" element={<FestivalDetailPage />} />
          <Route path="food" element={<RestaurantListPage />} />
          <Route path="food/:identifier" element={<PlaceDetailPage />} />
          <Route path="tours" element={<CultureFestivalPage />} />
          <Route path="combo" element={<ComboListPage />} />
          <Route path="combo/:slug" element={<ComboDetailPage />} />
          <Route path="transport" element={<TransportListPage />} />
          <Route path="transport/:identifier" element={<PlaceDetailPage />} />
          <Route path="services" element={<UtilityListPage />} />
          <Route path="services/:identifier" element={<PlaceDetailPage />} />
          <Route path="photo" element={<UtilityListPage />} />
          <Route path="photo/:identifier" element={<PlaceDetailPage />} />
          <Route path="rental" element={<UtilityListPage />} />
          <Route path="rental/:identifier" element={<PlaceDetailPage />} />
          <Route path="design-system" element={<DesignSystemPage />} />
          <Route path="cam-nang" element={<TravelGuidePage />} />
          <Route path="nguon-anh" element={<PhotoCreditsPage />} />
          <Route path="guide" element={<TravelGuidePage />} />
          <Route path="download" element={<DownloadAppPage />} />
          <Route path="tai-app" element={<DownloadAppPage />} />
          <Route path="cai-dat-app" element={<DownloadAppPage />} />
          {/* Bắt mọi đường dẫn không khớp — trước đây URL sai hiện màn hình trắng */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Trang Đặt phòng dùng layout độc lập, chỉ có Logo và Tên */}
        <Route path="booking" element={<BookingPage />} />

        {/* Tạo / sửa lịch trình (khung riêng như trang đặt phòng): mở ra là lịch trình trống theo từng ngày + gợi ý bắt đầu.
            Tạo mới không cần đăng nhập (đăng nhập khi lưu); sửa lịch trình đã lưu thì cần. */}
        <Route path="lich-trinh/tao" element={<TripPlannerPage />} />
        <Route element={<TravelerRoute />}>
          <Route path="lich-trinh/:id" element={<TripPlannerPage />} />
        </Route>

        {/* Dedicated Homestay, Room Availability & Fullscreen Map Routes (No Sidebar for fullscreen) */}
        <Route path="homestay/:slug/map" element={<FullScreenMapPage />} />
        <Route path="map" element={<FullScreenMapPage />} />
      </Route>

      {/* UC-08 & UC-10: Admin & NCC Partner Portal Login, Dashboards & Homestay Management */}
      <Route path="admin/login" element={<UnifiedAuthPage />} />
      <Route path="portal/login" element={<UnifiedAuthPage />} />
      <Route path="login" element={<UnifiedAuthPage />} />
      <Route path="register" element={<UnifiedAuthPage />} />
      <Route path="register/partner" element={<ProviderRegisterPage />} />
      <Route path="portal/suspended" element={<ProviderSuspendedPage />} />
      {/* Tờ in mã QR nhận phòng của một homestay (Admin / NCC) — trang riêng không khung để in cho sạch */}
      <Route path="in-ma-qr/:placeId" element={<CheckinQrPosterPage />} />
      <Route element={<Suspense fallback={<RouteFallback />}><PartnerLayout /></Suspense>}>
        {/* NCC đăng nhập vào thẳng Lịch phòng — việc làm hằng ngày của chủ nhà; Tổng quan chuyển sang /partner/overview. */}
        {/* Nhà xe / trải nghiệm không có lịch phòng: /partner mở Tổng quan dịch vụ (PartnerHome). */}
        <Route path="partner" element={<PartnerHome />} />
        <Route path="partner/calendar" element={<PartnerCalendarPage />} />
        <Route path="partner/services" element={<PartnerServicesHomePage />} />
        <Route path="partner/listings" element={<PartnerListingsPage />} />
        <Route path="partner/nearby" element={<PartnerNearbyOffersPage />} />
        <Route path="partner/combos" element={<PartnerCombosPage />} />
        <Route path="partner/overview" element={<PartnerDashboardPage />} />
        <Route path="partner/homestays" element={<PartnerHomestaysPage />} />
        <Route path="partner/rooms" element={<PartnerRoomsPage />} />
        <Route path="partner/bookings" element={<PartnerBookingsPage />} />
        <Route path="partner/bookings/:id" element={<PartnerBookingProcessPage />} />
        <Route path="partner/reviews" element={<PartnerReviewsPage />} />
        <Route path="partner/explore-places" element={<PartnerExplorePlacesPage />} />
        {/* Đăng Homestay: thông tin + ảnh + loại phòng + gửi duyệt trong một luồng */}
        <Route path="partner/homestay/create" element={<PartnerHomestayCreatePage />} />
        <Route path="partner/homestay/:id/edit" element={<PartnerHomestayEditPage />} />
        <Route path="partner/homestay/:id/rooms" element={<PartnerRoomsPage />} />
        <Route path="partner/profile" element={<PartnerProfilePage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
