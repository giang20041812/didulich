import { useState } from 'react';

/**
 * true chỉ ở lần tải đầu (chưa có kết quả nào về). Các lần lọc / sang trang sau trả về false để giữ nguyên
 * thanh công cụ và cột bộ lọc, chỉ lưới thẻ hiện khung chờ. Cập nhật ngay lúc render, không qua effect.
 */
export function useFirstLoad(loading: boolean): boolean {
  const [loaded, setLoaded] = useState(!loading);
  if (!loading && !loaded) setLoaded(true);
  return loading && !loaded;
}
