import { lazy, Suspense, type ComponentType } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import CustomerRoute from '@/components/layout/CustomerRoute';
import TravelerRoute from '@/components/layout/TravelerRoute';
// Trang chủ nằm trong bundle chính; các trang còn lại tải theo từng route (import trực tiếp, không qua '@/pages',
// để cổng Admin / NCC và thư viện biểu đồ, bản đồ không bị kéo vào lần tải đầu của khách).
// Khung cổng Admin / NCC cũng tải lười: chúng kéo theo axios (lib/axiosBoot) — khách du lịch không cần tải.
import { recoverChunkLoad } from '@/lib/chunkRecovery';
import { PageSkeleton } from '@/components/ui/PageSkeleton';


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

const DesignSystemPage = lazyPage(() => import('@/pages/system/DesignSystemPage'));
const DownloadAppPage = lazyPage(() => import('@/pages/system/DownloadAppPage'));
const NotFoundPage = lazyPage(() => import('@/pages/system/NotFoundPage'));


export function AppRoutes() {
  return (
    <Routes>
      {/* Wrap all customer pages in CustomerRoute */}
      <Route element={<CustomerRoute />}>
        {/* Khung ứng dụng chính với Sidebar Layout */}
        <Route element={<SidebarLayout />}>
          
          
          {/* User Bookings Management */}
          <Route element={<TravelerRoute />}>
          </Route>
          
          
          
          <Route path="design-system" element={<DesignSystemPage />} />
          <Route path="download" element={<DownloadAppPage />} />
          <Route path="tai-app" element={<DownloadAppPage />} />
          <Route path="cai-dat-app" element={<DownloadAppPage />} />
          {/* Bắt mọi đường dẫn không khớp — trước đây URL sai hiện màn hình trắng */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>


        <Route element={<TravelerRoute />}>
        </Route>

      </Route>

    </Routes>
  );
}

export default AppRoutes;
