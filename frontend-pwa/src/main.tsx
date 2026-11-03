import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Font tự host (@fontsource, subset vietnamese + latin) thay cho Google Fonts: cùng origin, có hash cache
// bất biến, không còn CSS chặn render từ bên thứ 3. Giữ đúng bộ weight cũ để không đổi giao diện.
import '@fontsource/nunito/vietnamese-300.css'
import '@fontsource/nunito/vietnamese-400.css'
import '@fontsource/nunito/vietnamese-500.css'
import '@fontsource/nunito/vietnamese-600.css'
import '@fontsource/nunito/vietnamese-300-italic.css'
import '@fontsource/nunito/vietnamese-400-italic.css'
import '@fontsource/nunito/latin-300.css'
import '@fontsource/nunito/latin-400.css'
import '@fontsource/nunito/latin-500.css'
import '@fontsource/nunito/latin-600.css'
import '@fontsource/nunito/latin-300-italic.css'
import '@fontsource/nunito/latin-400-italic.css'
// Outfit không có subset vietnamese (Google Fonts cũng vậy — chữ tiếng Việt trong Outfit đã rơi về font
// hệ thống từ trước), nên chỉ cần latin + latin-ext cho số/chữ không dấu.
import '@fontsource/outfit/latin-ext-300.css'
import '@fontsource/outfit/latin-ext-400.css'
import '@fontsource/outfit/latin-ext-500.css'
import '@fontsource/outfit/latin-ext-600.css'
import '@fontsource/outfit/latin-ext-700.css'
import '@fontsource/outfit/latin-300.css'
import '@fontsource/outfit/latin-400.css'
import '@fontsource/outfit/latin-500.css'
import '@fontsource/outfit/latin-600.css'
import '@fontsource/outfit/latin-700.css'
import '@fontsource/dancing-script/vietnamese-600.css'
import '@fontsource/dancing-script/vietnamese-700.css'
import '@fontsource/dancing-script/latin-600.css'
import '@fontsource/dancing-script/latin-700.css'
import '@fontsource/playfair-display/vietnamese-600.css'
import '@fontsource/playfair-display/vietnamese-700.css'
import '@fontsource/playfair-display/vietnamese-800.css'
import '@fontsource/playfair-display/latin-600.css'
import '@fontsource/playfair-display/latin-700.css'
import '@fontsource/playfair-display/latin-800.css'
import './styles/globals.css'
import App from './App.tsx'
import { installApiBase } from './lib/apiBase'
import { installRoutePrefetch } from './lib/routePrefetch'
import { initSentryLazy } from './lib/sentry'
import { HERO_SIZES, HERO_SRCSET } from '@/lib/heroImages'

// Ảnh hero trang chủ chỉ được phát hiện sau khi JS chạy xong và React render. Preload ngay khi module này thực thi
// (chỉ khi vào thẳng trang chủ) để ảnh tải song song với JS — cùng srcset/sizes với <img> nên tải đúng một bản.
if (typeof document !== 'undefined' && window.location.pathname === '/' && !document.querySelector('link[rel="preload"][as="image"]')) {
  const preload = document.createElement('link')
  preload.rel = 'preload'
  preload.as = 'image'
  preload.imageSrcset = HERO_SRCSET
  preload.imageSizes = HERO_SIZES
  preload.fetchPriority = 'high'
  document.head.appendChild(preload)
}

// Capture beforeinstallprompt immediately at the earliest possible lifecycle
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as unknown as { __deferredPwaPrompt?: Event }).__deferredPwaPrompt = e;
  });
}

installApiBase()
// Rê chuột / focus vào link nào thì tải trước chunk trang đó — lần đầu vào web chuyển trang gần như tức thì.
installRoutePrefetch()
// Sentry chỉ tải khi đặt VITE_SENTRY_DSN (xem lib/sentry.ts) — không ảnh hưởng lượt tải đầu.
initSentryLazy()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
