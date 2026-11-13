import { useCallback, useEffect, useRef, useState } from 'react';
import { haversineKm, type LatLng } from '@/lib/distance';

export type PositionState =
  | { status: 'locating' }
  | { status: 'ready'; position: LatLng; /** Sai số (mét) trình duyệt báo; null = không rõ. */ accuracyM: number | null }
  | { status: 'error'; reason: 'denied' | 'unavailable' };

/**
 * Vị trí lấy được gần nhất trong tab: mở "Gần tôi" ở mục khác không hỏi lại trình duyệt. Chỉ giữ ngắn (2 phút) vì khách đang
 * đi trên đường — vị trí cũ hơn thì sai lệch cả km và còn gây ra danh sách "gần tôi" lệch.
 */
let lastFix: { position: LatLng; accuracyM: number | null; at: number } | null = null;
const FIX_TTL_MS = 2 * 60_000;

const freshFix = () => (lastFix && Date.now() - lastFix.at < FIX_TTL_MS ? lastFix : null);

/** Khách di chuyển dưới ngưỡng này (km) thì giữ nguyên vị trí cũ, tránh danh sách nhảy liên tục vì GPS rung. */
const MIN_MOVE_KM = 0.05;
/** Sai số lớn hơn mức này coi là vị trí gần đúng theo trạm phát sóng / IP — vẫn dùng được nhưng sẽ được GPS thật thay thế. */
const COARSE_ACCURACY_M = 3000;

/**
 * Vị trí hiện tại của khách — chỉ dùng trên máy, không gửi lên máy chủ. Lấy theo hai bước để chạy được cả vùng núi sóng yếu
 * (Mù Cang Chải): (1) vị trí nhanh theo Wi-Fi / trạm phát sóng; nếu không có thì (2) chip GPS (độ chính xác cao, chờ lâu hơn).
 * Sau đó theo dõi liên tục (watchPosition): khách di chuyển thì danh sách "Gần tôi" tự cập nhật, và vị trí gần đúng ban đầu được
 * GPS thật thay thế khi có.
 *
 * live = false: chỉ lấy một lần, không theo dõi liên tục.
 *
 * Gọi khi khách đã bấm "Gần tôi" (trình duyệt hỏi quyền ngay lúc đó); retry() để hỏi lại sau khi khách bật quyền vị trí.
 */
export function useCurrentPosition({ live = true }: { live?: boolean } = {}) {
  const [state, setState] = useState<PositionState>(() => {
    const fix = freshFix();
    return fix ? { status: 'ready', position: fix.position, accuracyM: fix.accuracyM } : { status: 'locating' };
  });
  const watchId = useRef<number | null>(null);
  const alive = useRef(true);

  const stopWatch = useCallback(() => {
    if (watchId.current !== null && 'geolocation' in navigator) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
  }, []);

  const accept = useCallback((pos: GeolocationPosition) => {
    if (!alive.current) return;
    const position = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    const accuracyM = Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : null;
    lastFix = { position, accuracyM, at: Date.now() };
    setState((prev) => {
      if (prev.status !== 'ready') return { status: 'ready', position, accuracyM };
      // Vị trí tốt hơn (sai số nhỏ hơn đáng kể) luôn được nhận; ngược lại chỉ nhận khi khách thật sự đã di chuyển.
      const better = accuracyM !== null && (prev.accuracyM === null || accuracyM < prev.accuracyM * 0.7);
      const moved = haversineKm(prev.position, position) >= MIN_MOVE_KM;
      return better || moved ? { status: 'ready', position, accuracyM } : prev;
    });
  }, []);

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'error', reason: 'unavailable' });
      return;
    }
    stopWatch();
    const fail = (error: GeolocationPositionError) => {
      if (!alive.current) return;
      // Đã có vị trí từ trước thì giữ nguyên, chỉ báo lỗi khi chưa có gì để hiển thị.
      setState((prev) => (prev.status === 'ready' ? prev : { status: 'error', reason: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable' }));
    };
    const startWatch = () => {
      // live = false: chỉ lấy một lần (vd. gợi ý theo giờ ở trang chủ) để không tốn pin khi khách không xem danh sách.
      if (!alive.current || !live) return;
      stopWatch();
      watchId.current = navigator.geolocation.watchPosition(accept, () => undefined, { enableHighAccuracy: true, maximumAge: 10_000, timeout: 60_000 });
    };

    // Bước 1: vị trí nhanh (Wi-Fi / trạm phát sóng). Vùng núi không có thì sang bước 2 thay vì báo lỗi ngay.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        accept(pos);
        startWatch();
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          fail(error);
          return;
        }
        // Bước 2: chip GPS — ngoài trời mất 10–40 giây mới bắt được vệ tinh.
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            accept(pos);
            startWatch();
          },
          fail,
          { enableHighAccuracy: true, timeout: 45_000, maximumAge: 0 },
        );
      },
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: FIX_TTL_MS },
    );
  }, [accept, live, stopWatch]);

  // Lần đầu: hỏi ngay (kể cả khi đã có vị trí lưu — vẫn theo dõi tiếp để cập nhật theo thời gian thực).
  useEffect(() => {
    alive.current = true;
    request();
    return () => {
      alive.current = false;
      stopWatch();
    };
  }, [request, stopWatch]);

  const retry = useCallback(() => {
    setState({ status: 'locating' });
    request();
  }, [request]);

  return { state, retry };
}

/** Vị trí chỉ gần đúng (theo trạm phát sóng / IP): giao diện nên nhắc khách bật GPS để chính xác hơn. */
export const isCoarse = (state: PositionState) => state.status === 'ready' && state.accuracyM !== null && state.accuracyM > COARSE_ACCURACY_M;
