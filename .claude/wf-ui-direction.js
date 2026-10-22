export const meta = {
  name: 'ui-audit-and-direction',
  description: 'Audit every screen of the Đi Du Lịch frontend and pick a unified visual direction',
  phases: [
    { title: 'Audit', detail: 'one auditor per product area, screenshots + source' },
    { title: 'Direction', detail: '3 competing design-system proposals' },
    { title: 'Judge', detail: '3 judges with different lenses score the proposals' },
    { title: 'Synthesize', detail: 'final design spec + disjoint implementation plan' },
    { title: 'Critique', detail: 'completeness check of the plan' },
  ],
}

const FE = '/Users/lebahuy/Desktop/DiDuLicj-main/frontend-pwa'
const SCRATCH = '/private/tmp/claude-501/-Users-lebahuy-Desktop-DiDuLicj-main/13b473a0-046a-4f46-917f-251cc8e83641/scratchpad'
const SHOTS = SCRATCH + '/shots'
const BASE = SHOTS + '/baseline'
const DESIGN = SCRATCH + '/design'

const CONTEXT = `
PROJECT
- "Đi Du Lịch": homestay booking + cultural tourism web app (PWA) for Mù Cang Chải / Tây Bắc (Yên Bái, Vietnam). All UI copy is Vietnamese.
- Three audiences: travelers (customer site: home, homestay listing/detail/booking, culture, food, transport, services), partners/NCC = homestay owners (portal under /partner), admins (/admin).
- Frontend: ${FE} — React 19, Vite 8 (rolldown), Tailwind CSS v4 with tokens in src/styles/globals.css (@theme + :root), lucide-react icons, framer-motion, radix primitives, recharts, leaflet/vietmap maps. Routes: src/routes/AppRoutes.tsx (pages lazy-loaded). Design docs: README-design-system.md, src/design/tokens.json, /design-system showcase page.
- A local Vite dev server with HMR is running at http://localhost:5199, talking to the LIVE backend https://viettrek-api.vercel.app (Supabase). The live DB only has demo data: 10 homestays with NO photos, no attractions/festivals/cuisine/restaurant/transport records, demo accounts. So many sections render empty — judge empty states as part of UX, and design components for the populated case from the code.

SCREENSHOTS (baseline, before any change)
- Folder ${BASE}: "<route>--desktop.png" (1440px wide) and "<route>--mobile.png" (390px wide at 2x), plus readable slices "<route>--<viewport>--p1.png", "--p2.png"... Prefer the slices (full pages are downscaled too much to read). ${BASE}/index.json lists final URLs and console errors per shot.
- Route names and paths are in ${SHOTS}/routes.json.
- To capture more: node ${SHOTS}/shoot.mjs http://localhost:5199 <outDir> <route1,route2> [desktop|mobile|both]  (logs demo accounts in automatically for admin/partner/traveler routes, then slices). For interaction states (open dropdown, mobile menu, modal) you may write a small playwright-core script in ${SHOTS} (copy the launch code from shoot.mjs: system Chrome at /Applications/Google Chrome.app/Contents/MacOS/Google Chrome, headless). Use a unique outDir under ${SHOTS}/audit-<yourarea>.

HARD RULES
- This is an AUDIT/DESIGN phase: do NOT modify any file under ${FE} or anywhere in the repo. You may only write files inside ${SCRATCH}.
- Never submit forms or click buttons that create/change data on the live backend (booking, register, cancel, review, approve, save...). Viewing, opening menus, dropdowns and non-submitting modals is fine.
- Measured baseline facts (whole src/): 1179 hardcoded hex colors in classNames (e.g. text-[#...]), 1134 gray-* and 609 slate-* utility uses (two neutral palettes mixed), 'text-xs' used 1027 times (lots of 12px or smaller text), font-bold 870x. Fonts: body uses Nunito (Google Fonts) with base weight 600; index.html also loads Outfit, Be Vietnam Pro, Dancing Script; main.tsx imports @fontsource Inter and Plus Jakarta Sans. Brand colors in globals.css (#10b981 emerald) contradict README/tokens.json (#048C73 deep teal); @theme and :root define different values for the same tokens. The admin/partner portals are branded "VietTrack" while the customer site is "Đi Du Lịch".
- Content honesty: flag (do not invent) things like certification/legal badges in the footer (ISO 9001, "Đã đăng ký Bộ Công Thương", Green Travel), payment logos, "Nhận ưu đãi 25%", and stock photos that do not depict the place (e.g. Hạ Long Bay behind a Mù Cang Chải homestay page, Western food on the Tây Bắc food page). Listing images must never be stock photos presented as a specific property.
`

const AUDIT_SCHEMA = {
  type: 'object',
  properties: {
    area: { type: 'string' },
    summary: { type: 'string', description: 'overall assessment of this area in 3-6 sentences' },
    strengths: { type: 'array', items: { type: 'string' } },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'short unique id like HOME-3' },
          severity: { type: 'string', enum: ['critical', 'major', 'minor'] },
          category: { type: 'string', enum: ['visual', 'layout', 'responsive', 'ux-flow', 'content', 'accessibility', 'performance', 'consistency', 'bug'] },
          screen: { type: 'string', description: 'screenshot file name that shows it' },
          evidence: { type: 'string' },
          location: { type: 'string', description: 'file:line' },
          fix: { type: 'string', description: 'concrete fix' },
        },
        required: ['id', 'severity', 'category', 'evidence', 'fix'],
      },
    },
    redesign_plan: { type: 'array', items: { type: 'string' }, description: 'ordered, concrete steps to make this area beautiful and easy to use' },
    shared_needs: { type: 'array', items: { type: 'string' }, description: 'things this area needs from shared UI primitives / layout / tokens' },
    files_owned: { type: 'array', items: { type: 'string' }, description: 'files (relative to frontend-pwa/) this area would edit' },
    content_decisions_for_owner: { type: 'array', items: { type: 'string' }, description: 'content/business questions only the site owner can answer' },
  },
  required: ['area', 'summary', 'issues', 'redesign_plan', 'files_owned'],
}

const AREAS = [
  { key: 'foundation', title: 'Design-system foundation and cross-page consistency',
    routes: 'sample slices from ALL routes (at least home, homestays, homestay-detail, booking, login, admin-dashboard, partner-dashboard, restaurants, culture), both viewports',
    files: 'src/styles/globals.css, src/design/tokens.json, src/components/ui/* (button, input, card, badge, checkbox, switch, modal, skeleton, CardSkeleton, logo, price-slider, SakuraBlossomIcon, FramerSwipeCardStack), index.html, src/main.tsx, README-design-system.md, src/pages/system/DesignSystemPage.tsx, src/lib/cn.ts',
    focus: 'tokens (colors, neutrals, radius, shadows, spacing, type scale), fonts and weights, readability of Vietnamese diacritics, contrast, primitive component quality and coverage (what primitives are missing that pages re-implement ad hoc), consistency between customer site and portals, brand naming.' },
  { key: 'shell', title: 'Customer site shell: header, nav, search hub, footer, mobile bottom nav, PWA banners',
    routes: 'home, homestays, homestay-detail, culture, restaurants, destinations, download (both viewports)',
    files: 'src/components/layout/* (Header, Footer, SidebarLayout, AppShell, SearchHub, ScrollToTop, CustomerRoute, TravelerRoute, etc.), src/components/pwa/*, src/components/common/*, src/components/customer/*, src/lib/routeUtils.ts',
    focus: 'navigation clarity on desktop and mobile (top tabs cut off on mobile, bottom nav), header crowding, hero/search placement (search box pushes content below the fold on detail pages), footer content honesty, PWA install prompts overlapping content, page header imagery.' },
  { key: 'home', title: 'Home page',
    routes: 'home (both viewports)',
    files: 'src/pages/home/HomePage.tsx (and read src/services/homeService.ts, src/types/home.ts)',
    focus: 'first impression, hero readability (brush-script subtitle), section order, empty sections (destinations, specialties) that show only a heading or a dashed box, homestay cards without photos, value-proposition block, mobile carousel UX.' },
  { key: 'discovery', title: 'Homestay listing, filters and map',
    routes: 'homestays, map',
    files: 'src/pages/customer/homestay/HomestayListPage.tsx, src/pages/customer/homestay/FullScreenMapPage.tsx, src/components/map/*',
    focus: 'filter/sort UX, card design and information hierarchy (price, location, rating, availability), no-photo placeholders, map/list switching, mobile filters (sheet), result counts, loading/empty/error states. Note the map shows a 403 from a tile/API key in console.' },
  { key: 'homestay-detail', title: 'Homestay detail page',
    routes: 'homestay-detail, place-detail',
    files: 'src/pages/customer/homestay/HomestayDetailPage.tsx, src/components/homestay/*',
    focus: 'gallery without photos, header info, room cards with two full month calendars per room (very long page), sticky booking bar, policies, reviews, nearby section that is empty, mobile layout, conversion path to booking.' },
  { key: 'booking', title: 'Booking flow and my bookings',
    routes: 'booking, my-bookings, booking-detail',
    files: 'src/pages/customer/booking/BookingPage.tsx, UserBookingListPage.tsx, UserBookingDetailPage.tsx, src/components/booking/*',
    focus: 'checkout clarity (steps, summary, price breakdown, trust, errors), form UX and validation, mobile checkout, booking status communication, cancel/edit/review modals (inspect code; do not submit).' },
  { key: 'culture', title: 'Culture, festivals, destinations, place detail',
    routes: 'culture, festival-detail-missing, destinations, place-detail',
    files: 'src/pages/customer/culture/* (CultureFestivalPage, FestivalDetailPage, DestinationListPage, PlaceDetailPage)',
    focus: 'editorial storytelling, empty and not-found states, imagery honesty, card/list patterns shared with discovery pages.' },
  { key: 'services', title: 'Food, transport, services listing pages and app download page',
    routes: 'restaurants, transport, services, download',
    files: 'src/pages/customer/services/* (RestaurantListPage, TransportListPage, UtilityListPage), src/pages/system/DownloadAppPage.tsx',
    focus: 'these three list pages duplicate a big filter sidebar + hero pattern with no data; consistency with homestay listing; empty states; hero photo relevance.' },
  { key: 'auth', title: 'Login, registration, partner registration, suspended page',
    routes: 'login, register, register-partner, provider-suspended',
    files: 'src/pages/portal/*, src/pages/auth/*, src/components/auth/*, src/config/authImages.ts',
    focus: 'form layout, trust, clarity of which account type logs in where, Google sign-in placement, validation messages, mobile, disabled-button contrast.' },
  { key: 'admin-core', title: 'Admin portal: shell, overview and moderation queues',
    routes: 'admin-dashboard, admin-places, admin-changes, admin-applications, admin-reviews',
    files: 'src/pages/admin/AdminDashboardPage.tsx, src/components/admin/{AdminSidebar, AdminCommandPalette, AdminNotificationBell, OverviewPanel, PlacesPanel, PlaceQuickPreview, PlaceShowcaseSections, ChangeRequestsPanel, ProviderApplicationsPanel, ReviewsPanel, StatusBadge, StatusFilter, AdminFilters, NoticeDialog, OverlayPortal, Avatar}.tsx and admin *.ts meta files',
    focus: 'information density vs readability, dashboard hierarchy, queues, tables, drawers, status colors, mobile admin, brand consistency (VietTrack vs Đi Du Lịch).' },
  { key: 'admin-ops', title: 'Admin portal: partners, accounts, staff, bookings, activity, finance',
    routes: 'admin-providers, admin-accounts, admin-admins, admin-bookings, admin-activity, admin-finance',
    files: 'src/components/admin/{ProvidersPanel, AccountsPanel, AccountDetailDrawer, AdminStaffPanel, CreateTravelerModal, BookingsPanel, BookingDetailDrawer, ActivityPanel, CashflowPanel, ReportsPanel}.tsx',
    focus: 'data tables (sorting, filtering, pagination, row actions), drawers, forms/modals, charts, empty states, mobile.' },
  { key: 'partner', title: 'Partner (homestay owner) portal',
    routes: 'partner-dashboard, partner-homestays, partner-rooms, partner-bookings, partner-booking-process, partner-reviews, partner-homestay-edit, partner-homestay-create, partner-profile',
    files: 'src/pages/partner/*, src/components/partner/*',
    focus: 'owners are often non-technical, on phones: task clarity (what needs my action now), booking processing flow, room/price/calendar editing, homestay edit form length and sections, charts (a fully red donut when only cancellations exist), mobile.' },
]

function auditPrompt(a) {
  return `${CONTEXT}

YOUR AREA: ${a.title}
Screens to study (slices in ${BASE}): ${a.routes}
Source files you own for this audit: ${a.files}
Focus: ${a.focus}

Do a thorough, senior product-designer + frontend-engineer audit of this area so the team can make it genuinely beautiful and give travelers / owners / admins the best UX.
1. Look at every slice of your screens on BOTH desktop and mobile. Capture extra states if useful (menus, filters, modals, hover not needed).
2. Read your source files fully and connect what you see to code (file:line).
3. Report issues ranked by user impact (critical = blocks or badly confuses users or looks broken; major = clearly unpolished or hurts conversion/readability; minor = polish). Include accessibility (contrast, tap targets >= 44px on mobile, focus, labels), responsiveness, loading/empty/error states, content honesty, performance of images.
4. Write a concrete, ordered redesign plan for this area (layout, hierarchy, components, states, copy tweaks). Keep all existing features and API calls; this is a UI/UX redesign, not a behavior change. Be specific enough that an engineer can implement without guessing.
5. List what you need from shared primitives/tokens/layout, and the exact files this area would edit.
Return the structured result.`
}

const PROPOSAL_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    concept: { type: 'string', description: 'the idea in 2-4 sentences' },
    spec_path: { type: 'string', description: 'absolute path of the markdown spec you wrote' },
    key_differentiators: { type: 'array', items: { type: 'string' } },
  },
  required: ['name', 'concept', 'spec_path'],
}


const BRAND = `
BRAND INPUTS FIXED BY THE OWNER (these override anything in the baseline code or docs; every proposal, judge and the final spec MUST use them)
- BRAND NAME: the brand is now "Đi Mù Cang Chải" (the "Đi" monogram + the words "Mù Cang Chải"). Use it in the header, page <title>s ("<page> · Đi Mù Cang Chải"), PWA manifest (name "Đi Mù Cang Chải", short_name "Mù Cang Chải"), footer, auth pages and both portals ("Đi Mù Cang Chải · Quản trị", "Đi Mù Cang Chải · Đối tác"). Replace "Đi Du Lịch", "VietTrack", "DuLichSo" in visible UI copy.
- LOGO (owner-supplied lockup: the "Đi" monogram — a serif Đ whose bowl holds rice terraces, mountains and a rising sun, with a flowing green-to-gold "i" — above the wordmark "Mù Cang Chải" in a bold geometric sans, dark forest). Assets already in the repo (all transparent WebP; never retype the wordmark in another font — use the image):
  frontend-pwa/src/assets/brand/logo-di-160.webp / logo-di-320.webp = monogram only (square). Use for the compact header, mobile, favicon-like spots, avatars/placeholders.
  frontend-pwa/src/assets/brand/logo-wordmark-dark.webp (693x112 source, forest text for light backgrounds) and logo-wordmark-light.webp (cream text for dark/forest backgrounds) = "Mù Cang Chải" wordmark only.
  => Horizontal lockup for headers/portal sidebars = monogram + wordmark side by side (wordmark height about 38% of the monogram height, gap about 12-16px), built in a Logo component with props like variant ("horizontal" | "stacked" | "mark") and tone ("dark" | "light").
  frontend-pwa/src/assets/brand/logo-lockup-stacked-480.webp = the full stacked lockup exactly as the owner designed it (auth pages, footer, splash/empty-state hero, download page).
  Sources (never import into the UI): logo-lockup-source.png (owner's 1080px PNG on white) and logo-di-source.svg (1.1 MB raster-in-SVG).
  public/ icons already regenerated from the monogram: favicon.ico (16/32/48), favicon-32.png, apple-touch-icon.png, pwa-192x192.png, pwa-512x512.png, pwa-maskable-192x192.png, pwa-maskable-512x512.png (warm cream plate). ALREADY DONE AND LIVE: src/components/ui/logo.tsx was rewritten and exports Logo (variant 'horizontal' | 'stacked' | 'mark', tone 'dark' | 'light', size = monogram height), LogoMark (size, plate = cream tile for photo/dark backgrounds, alt), LogoWordmark (height, tone), BRAND_NAME, plus legacy aliases VietTrackLogo/VietTrackLogoMark/DiDuLichLogo* still imported by existing pages. The header (plate + light wordmark over the hero, plain mark + dark wordmark when solid), customer side menu, footer (stacked lockup), admin/partner sidebars ('Mù Cang Chải'), visible 'Đi Du Lịch' copy, index.html title/meta/favicons and the PWA manifest (name, icons incl. maskable, theme #043D32, background #F7F5ED) were already switched; public/favicon.svg deleted. Keep this component API (the foundation may restyle it); areas should migrate legacy alias usages in their files to Logo/LogoMark.
  The monogram is dark green: on photos or Primary Forest / gradient surfaces put it on a Warm Cream (#F7F5ED) rounded plate and use the light wordmark; keep clear space >= 25% of the monogram size; minimum monogram size 28px, wordmark minimum height 14px.
  Preview of the lockups on white / cream / forest: ${SCRATCH}/brand/lockup-preview.png
- FONTS (two owner-supplied families; together they replace every existing font):
  1) HEADER / DISPLAY font = "DT Phudu" (by Dương Trần, SIL OFL 1.1 — free for web; license file must ship: frontend-pwa/src/assets/fonts/dt-phudu/OFL-LICENSE.txt). WOFF2 files in frontend-pwa/src/assets/fonts/dt-phudu/: dt-phudu-light.woff2 (200), dt-phudu-regular.woff2 (400), dt-phudu-medium.woff2 (500), dt-phudu-bold.woff2 (700), dt-phudu-black.woff2 (900). Full Vietnamese; ₫ missing.
     IMPORTANT: it is an ALL-CAPS condensed display face — lowercase input renders as capitals. Use it for headings (hero, h1, h2, h3, card titles if short), short UI labels (buttons, nav tabs, chips/badges, overlines, table column headers), KPI numbers and prices. Never for sentences, descriptions, long names that wrap to 3+ lines, form input text or body copy. Keep headings short; allow slight letter-spacing at small sizes; line-height about 1.05-1.2.
     Specimen: ${SCRATCH}/brand/phudu-specimen.png
  2) TEXT font = "Ganh Type" (owner-supplied; WOFF2 in frontend-pwa/src/assets/fonts/ganh-type/: ganh-type-regular.woff2 = 400, ganh-type-italic.woff2 = 400 italic, ganh-type-thin.woff2 = 100, ganh-type-thin-italic.woff2 = 100 italic). Geometric sans, full Vietnamese, ₫ missing. ONLY weights 100 and 400 exist — never request a heavier weight for it (faux bold is forbidden). Use it for all running text: body, descriptions, lists, form inputs and help text, table cells, captions, footer, Thin 100 only at >= 32px (elegant subtitles/quotes). Minimum sizes: body 16px, secondary 14px, captions/meta 13px (nothing smaller). Emphasis inside Ganh text comes from color, size, or switching to a short Phudu label — not from bold.
     Specimen: ${SCRATCH}/brand/ganh-specimen.png
  Font stacks must end with system fallbacks that contain ₫ (e.g. system-ui, -apple-system, "Segoe UI", Roboto, sans-serif) so the đồng sign renders. Default is NO third web font; propose one only if you can show a concrete failure of Ganh Type in dense portal tables at 14px, and justify its cost.
  Remove Nunito, Outfit, Be Vietnam Pro, Dancing Script, Inter and Plus Jakarta Sans (Google Fonts link in index.html, @fontsource imports in main.tsx and the package.json deps if unused). Self-host via @font-face in src/styles/globals.css with font-display: swap; preload only the one or two faces used above the fold.
- COLORS = the owner's official palette "Brand màu ĐI Mù Cang Chải" (exact hex values — use them verbatim as the anchor tokens; do not re-pick):
  Primary Forest   #043D32  primary actions, header/brand surfaces, links on light (12.22:1 on white, 11.19:1 on cream; white text on it 12.22:1)
  Hover xanh       #0A5444  hover/pressed state of primary (white text 8.88:1)
  Terrace Green    #4F7D2A  secondary green: success, eco tags, secondary buttons, icons (4.88:1 on white = OK for text; 4.47:1 on cream = large text/icons only; white text on it 4.88:1)
  Golden Rice      #F2B51D  accent: highlights, ratings/stars, badges, promo, CTA on dark surfaces. NEVER as text or thin icons on white/cream (1.84:1 / 1.69:1). Text on it must be Text chính #16302B (7.64:1) or Primary Forest (6.63:1).
  Hover vàng       #D99A08  hover/pressed of gold elements (Forest text on it 4.99:1, Text chính 5.75:1)
  Warm Cream       #F7F5ED  page canvas / warm section backgrounds
  White            #FFFFFF  cards, inputs, sheets, table surfaces
  Text chính       #16302B  primary text (14.08:1 on white, 12.90:1 on cream)
  Text phụ         #68746F  secondary text (4.87:1 on white = OK; 4.46:1 on cream = just below AA for normal-size text → on cream use it only for >= 18.5px or on white cards, or add a derived token such as #616F6A = 4.82:1 on cream for small secondary text there)
  Border           #E2E7E3  dividers and card outlines (decorative). It is only 1.25:1 on white, so interactive component boundaries (inputs, selects, checkboxes, outline buttons) need a derived border of >= 3:1, e.g. #86918C (3.26:1 on white) or #808B86 (3.53:1 white / 3.23:1 cream); focus ring = Primary Forest 2px + offset.
  Derived gold for text on light (if ever needed): #8B7016 (4.74:1 white) — or avoid gold text entirely.
  BRAND GRADIENT (owner-defined, use verbatim): linear-gradient(110deg, #043D32 0%, #4F7D2A 52%, #F2B51D 100%). Use it for signature moments only: hero/banner bands, the logo plate or header accent line, primary promo/CTA banners, progress/step indicators, section dividers, illustrated no-photo placeholders. Text placed on it must stay over the dark-green part or sit on a scrim/card — white text fails on the gold end and dark text fails on the forest end. Never use it behind body text or as a default button fill (a single solid Primary Forest button is the default primary action; a gradient CTA may be used at most once per screen if its label sits over the green part).
  Build tints/shades (50-950) from these anchors for states, subtle backgrounds (e.g. forest-50, terrace-50, rice-50 for tinted chips/alerts) and charts; semantic: success = Terrace Green family, warning = Golden Rice family (dark text), danger = a muted brick red that harmonizes (define and verify >= 4.5:1), info = a desaturated teal/forest tint. One neutral family only (derived from Text chính/Text phụ/Border); no gray-*/slate-* defaults.
  Retire the old emerald #10b981, aqua #06b6d4 and coral #f97316.
- Portals (admin/partner) use the same brand: use the same "Đi Mù Cang Chải" brand and Logo component (see BRAND NAME).
- Owner-side notes to surface in the final report: the Ganh Type files carry OS/2 fsType=4 (preview & print embedding) and no license text — the owner must confirm its license allows web embedding. DT Phudu is SIL OFL 1.1 (fine; keep the license file with the fonts).
`


const DEFAULTS = `
DEFAULT PRODUCT DECISIONS FOR THIS REDESIGN (apply them in the spec and plan; also list each one in owner_decisions so the owner can confirm or reverse later):
1. Honesty first. Remove invented numbers and claims from the UI: the synthesized strike-through "original" price (base x 1.25), invented scarcity ("Chỉ còn N phòng" not coming from real availability), invented free-cancellation defaults, unverifiable badges and claims (ISO 9001, Green Travel Certified, "Đã đăng ký Bộ Công Thương", payment-gateway logos, "Nhận ưu đãi 25%" newsletter with no backend, "Đồng hành 24/7", "Bảo hiểm" and similar). Replace value propositions with true ones derived from real features (local homestays run by families, price per night set by the owner and shown before booking, direct contact with the owner, listings reviewed by the admin team, pay-at-property if that is what checkout does).
2. No stock photos that do not show the place (Hạ Long Bay, Western food, generic hotel rooms, hotlinked Unsplash in page headers). Page headers use the brand graphic language (brand gradient, terrace-contour lines, monogram) or the single on-brand terraced-field hero image (src/assets/hero-home.webp) where a photo is essential.
3. Listings/places without photos get a branded illustrated placeholder (brand gradient or cream + terrace-contour lines + monogram + place initial/name) that is obviously not a photo and never looks like a broken image.
4. Empty data: never show a lone heading or a dashed "no data" box on the home page — hide the section or show one compact, useful teaser linking to a working page. Listing pages get friendly empty states with a next step.
5. Developer/QA artifacts are never shown to travelers: VietMap API-key banners, the "Full Screen Map Viewer"/QA scenario UI on /map, and hardcoded fallback data presented as real. When the map key is missing show a neutral "Bản đồ đang được cập nhật" state (list still works). /map becomes a traveler-facing overview (list + map when available) without fake data.
6. "Yêu thích" that does not persist anything: hide it until a real wishlist exists (do not claim "Đã lưu").
7. Prices and policies shown to travelers must come from real data: per-night amounts from the quote/room data (weekend nights at weekendPrice exactly as the backend quotes them; never print "basePrice x nights" when the total differs); cancellation terms from the homestay's published policy, otherwise "Chủ nhà chưa công bố chính sách hủy — vui lòng liên hệ trước khi đặt".
8. Privacy/security bugs found by the audits are fixed as part of this work: e.g. the hardcoded third-party email fallback in the bookings list, unescaped HTML strings passed to Leaflet divIcon/bindPopup (escape or build DOM nodes), modals that are not portaled above the fixed header.
9. Positioning copy: the product is about Mù Cang Chải / Tây Bắc, not "du lịch Việt Nam" in general.
10. Scope: frontend only. Backend/API contracts, routes and data models stay unchanged; front-end logic that produces wrong or misleading output IS in scope and must be fixed.
`

const DIRECTIONS = [
  { key: 'terrace-editorial', angle: 'Premium editorial travel built on the logo: generous whitespace on warm cream, photography-first layouts (honest illustrated placeholders when no photo), DT Phudu headlines at confident sizes with Ganh Type body, Primary Forest + Golden Rice used sparingly, brand gradient for signature moments like a high-end travel magazine that still books rooms.' },
  { key: 'booking-clarity', angle: 'Conversion-first clarity in the spirit of the best booking products, wearing the new brand: calm white/cream surfaces, Primary Forest as the single strong action color, Golden Rice only for highlights/ratings, brand gradient only for one hero/banner moment, strict 8pt spacing, predictable components, dense-but-readable cards, obvious primary actions, excellent mobile ergonomics. DT Phudu headings kept short, Ganh Type text; minimal decoration.' },
  { key: 'tay-bac-identity', angle: 'Distinct local identity that extends the logo story: terrace-contour lines, the brand gradient as a recurring sunrise-over-terraces motif, Golden Rice accents and brocade-inspired geometric dividers as subtle graphic language (echoing the logo linework), deep forest dark sections, warm cream canvas; human and handmade but never kitschy; must stay readable and fast.' },
]

function proposalPrompt(d) {
  return `${CONTEXT}

You are one of three senior brand/product designers competing to define the visual direction for the redesign.
YOUR ANGLE: ${d.angle}

${BRAND}
${DEFAULTS}
Look at the logo itself before designing: ${SCRATCH}/brand/logo-render-white.png and logo-render-dark.png, and the font specimen ${SCRATCH}/brand/ganh-specimen.png.

Constraints for every proposal:
- Follow the BRAND INPUTS above exactly (logo, DT Phudu headers + Ganh Type text, logo palette). Proposals differ in layout, surfaces, density, graphic language and component styling — not in these anchors.
- Body weight 400/500 (not 600).
- All text/background pairs used for text must meet WCAG 2.1 AA (4.5:1 normal, 3:1 large/UI). Compute contrast ratios (write and run a tiny node or python script) and include them.
- Must be implementable in Tailwind v4 via tokens in src/styles/globals.css @theme (one source of truth, no :root duplicates) and must work for BOTH the customer site and the dense admin/partner portals.
- Honest imagery: define a non-photographic placeholder style for places without photos (no stock photos pretending to be a property).

Study the baseline screenshots first (at least home, homestays, homestay-detail, booking, login, admin-dashboard, partner-dashboard, restaurants; both viewports) and read src/styles/globals.css, src/components/ui/*, README-design-system.md.

Write a complete, implementation-ready design-system spec as markdown to ${DESIGN}/proposal-${d.key}.md containing: concept; full color token table (name, hex, usage, contrast results) including neutrals, brand scale, semantic success/warning/danger/info, surfaces, borders, focus ring, chart palette; typography (families, loading, type scale with sizes/line-heights/weights for display, h1-h4, body, small, caption, overline, numerals; mobile scale); spacing & layout grid, container widths, section rhythm; radius; elevation/shadows; iconography; imagery & placeholder recipe; motion; component specs with states (button variants/sizes, input/select/textarea, checkbox/radio/switch, chip/tag/badge, tabs/segmented, card variants incl. listing card, section header, breadcrumb, pagination, table, drawer/modal/sheet, toast/alert, empty/loading/error states, date picker styling, stepper); page patterns (customer header/nav/footer + mobile bottom nav, hero, listing page, detail page, checkout, auth, portal shell + sidebar + dashboard KPI + table page); do/don't list; migration notes for this codebase. Create ${DESIGN} if missing. Then return the structured summary.`
}

const JUDGE_SCHEMA = {
  type: 'object',
  properties: {
    lens: { type: 'string' },
    scores: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          proposal: { type: 'string' },
          score: { type: 'number', description: '0-10' },
          strengths: { type: 'array', items: { type: 'string' } },
          weaknesses: { type: 'array', items: { type: 'string' } },
        },
        required: ['proposal', 'score', 'strengths', 'weaknesses'],
      },
    },
    winner: { type: 'string' },
    graft: { type: 'array', items: { type: 'string' }, description: 'best ideas from the other proposals to graft onto the winner' },
    rationale: { type: 'string' },
  },
  required: ['lens', 'scores', 'winner', 'graft', 'rationale'],
}

const LENSES = [
  { key: 'traveler-beauty', text: 'Traveler delight and conversion: which direction will make Vietnamese and foreign travelers find it beautiful, trustworthy and easy to book on a phone? Consider first impression, hierarchy, photography/placeholder strategy, emotional fit with Mù Cang Chải / Tây Bắc.' },
  { key: 'readability-a11y', text: 'Readability and accessibility: Vietnamese diacritics at small sizes, font choices and weights, contrast (re-check the numbers), tap targets, focus states, motion safety, dense portal tables readable for non-technical homestay owners.' },
  { key: 'feasibility-consistency', text: 'Engineering feasibility and system consistency: can it be migrated in this codebase (Tailwind v4 tokens, ~37k lines of TSX with 1179 hardcoded hex and mixed gray/slate) within one focused redesign, does one system serve both the customer site and the admin/partner portals, performance cost (fonts, images).' },
]

phase('Audit')
const auditsP = parallel(AREAS.map(a => () => agent(auditPrompt(a), { label: `audit:${a.key}`, phase: 'Audit', schema: AUDIT_SCHEMA })))

phase('Direction')
const proposalsP = parallel(DIRECTIONS.map(d => () => agent(proposalPrompt(d), { label: `direction:${d.key}`, phase: 'Direction', schema: PROPOSAL_SCHEMA })))

const proposals = (await proposalsP).filter(Boolean)
log(`${proposals.length} direction proposals ready`)

phase('Judge')
const proposalList = proposals.map(p => `- ${p.name}: ${p.concept}\n  spec: ${p.spec_path}`).join('\n')
const judgesP = parallel(LENSES.map(l => () => agent(`${CONTEXT}

${BRAND}
You are an independent design-review judge. LENS: ${l.text}
Also penalize any proposal that deviates from the BRAND INPUTS (exact owner palette hex values and gradient rules, logo usage, DT Phudu only for headers/short labels because it is all-caps, Ganh Type weights 100/400 only and >= 13px, logo palette).

Three competing design-system proposals (read each spec file completely, and compare against the baseline screenshots in ${BASE}):
${proposalList}

Score each 0-10 under your lens only, list concrete strengths/weaknesses, verify at least 5 of the contrast claims per proposal yourself (compute them), pick a winner, and list the best ideas from the losers worth grafting onto the winner.`, { label: `judge:${l.key}`, phase: 'Judge', schema: JUDGE_SCHEMA })))

const [audits, judges] = await Promise.all([auditsP, judgesP])
const goodAudits = audits.filter(Boolean)
const goodJudges = judges.filter(Boolean)
log(`${goodAudits.length}/${AREAS.length} audits, ${goodJudges.length} judges done`)

const auditsPath = `${DESIGN}/audits.json`
const judgesPath = `${DESIGN}/judges.json`

phase('Synthesize')
const SYNTH_SCHEMA = {
  type: 'object',
  properties: {
    spec_path: { type: 'string' },
    plan_path: { type: 'string' },
    chosen_direction: { type: 'string' },
    design_summary: { type: 'string' },
    owner_decisions: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } },
  },
  required: ['spec_path', 'plan_path', 'chosen_direction', 'design_summary'],
}
const synth = await agent(`${CONTEXT}

${BRAND}
${DEFAULTS}
You are the design lead. Produce the FINAL design system and the implementation plan for the redesign. The BRAND INPUTS above are mandatory; the foundation task list must include wiring them: @font-face for the DT Phudu and Ganh Type WOFF2 files (ship OFL-LICENSE.txt), removing old fonts from index.html and main.tsx, new Logo component (variants horizontal/stacked/mark, tones dark/light) using the monogram + wordmark WebP assets, brand rename to "Đi Mù Cang Chải" in index.html title/meta and the PWA manifest, index.html favicon/apple-touch links (drop favicon.svg), vite.config.ts PWA manifest icons incl. maskable ones + theme_color/background_color from the new palette, renaming "Đi Du Lịch" / "VietTrack" / "DuLichSo" in visible copy (each owning area does the rename in its own files).

INPUTS
- Proposals (read fully): 
${proposalList}
- Judge verdicts (JSON): ${JSON.stringify(goodJudges)}
- Area audits (JSON): ${JSON.stringify(goodAudits)}

STEP 1 — write the audits and verdicts to disk for later phases: ${auditsPath} and ${judgesPath} (exact JSON above).

STEP 2 — write ${DESIGN}/DESIGN-SPEC.md: the single final design system, based on the judges' consensus winner with the best grafts. It must be implementation-ready and self-contained (engineers will only read this file plus their task): exact tokens (hex values with verified contrast), Tailwind v4 @theme token names and how to use them in classes, fonts and how to load them (and which existing font imports to remove), type scale, spacing, radius, shadows, component specs with states, page patterns for every page type in the app (customer + portals, desktop + mobile), placeholder recipe for missing photos, empty/loading/error state patterns, motion, accessibility rules, copy tone, and a migration cheat-sheet mapping common old classes (text-[#...], gray-*/slate-*, text-xs misuse, font-semibold body text, rounded-* choices) to the new tokens.

STEP 3 — write ${DESIGN}/PLAN.json with this shape:
{
  "foundation": { "owned_files": [...], "tasks": [...] },          // tokens, fonts, ui primitives, new shared primitives the areas need (e.g. EmptyState, PlaceholderImage, SectionHeader, PageHeader, Chip, Tabs, Sheet, DataTable styling...), README-design-system.md, DesignSystemPage
  "areas": [ { "key", "title", "routes": [route names from routes.json], "owned_files": [...], "tasks": [ ordered, concrete, referencing audit issue ids ] } ],
  "unassigned_issue_ids": [...],
  "owner_decisions": [...]
}
Rules for PLAN.json: owned_files must be DISJOINT across foundation and all areas (every file edited by exactly one owner; list concrete paths relative to frontend-pwa/, verify each exists with ls; new files the foundation creates must be listed too). Areas may only USE foundation primitives, not edit them. Every critical and major audit issue must map to a task or be listed in unassigned_issue_ids with a reason. Keep the same area keys as the audits where sensible (shell, home, discovery, homestay-detail, booking, culture, services, auth, admin-core, admin-ops, partner). Backend/API contracts, routes and data models must not change; front-end bugs and honesty problems from the audits (see DEFAULT PRODUCT DECISIONS) MUST be turned into tasks. Apply the DEFAULT PRODUCT DECISIONS as tasks and list each of them (plus any other open business question from the audits) in owner_decisions.

Return the structured summary.`, { label: 'synthesize', phase: 'Synthesize', schema: SYNTH_SCHEMA })

phase('Critique')
const CRITIC_SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    overlapping_files: { type: 'array', items: { type: 'string' } },
    missing_files: { type: 'array', items: { type: 'string' } },
    uncovered_issues: { type: 'array', items: { type: 'string' } },
    spec_gaps: { type: 'array', items: { type: 'string' } },
    contrast_errors: { type: 'array', items: { type: 'string' } },
    fixes_applied: { type: 'array', items: { type: 'string' } },
  },
  required: ['ok', 'overlapping_files', 'uncovered_issues', 'spec_gaps', 'fixes_applied'],
}
const critic = synth ? await agent(`${CONTEXT}

${BRAND}
${DEFAULTS}
You are the completeness critic for the redesign plan. Also verify the spec follows the BRAND INPUTS exactly (the owner's exact palette hex values incl. hover colors and the brand gradient with its text rules, DT Phudu for headers/short labels only, Ganh Type only at 100/400 and >= 13px, no third web font unless justified, logo usage rules) and that PLAN.json assigns every brand-wiring task. Files: ${DESIGN}/DESIGN-SPEC.md, ${DESIGN}/PLAN.json, ${auditsPath}.
Check, with scripts where possible:
1. owned_files are disjoint across foundation and all areas; every listed existing file exists under ${FE} (new files must be owned by foundation or an area and clearly marked new).
2. Every file under ${FE}/src that is likely to need visual changes (all pages/*, components/*, styles) is owned by someone; list unowned ones.
3. Every critical/major audit issue id appears in some task or in unassigned_issue_ids.
4. The spec is implementation-ready: exact tokens, component states, patterns for every route in ${SHOTS}/routes.json, mobile rules, empty/loading/error patterns, migration cheat-sheet. Recompute contrast for all text color pairs in the token table.
Then FIX what you can directly by editing DESIGN-SPEC.md and PLAN.json (you may only edit files under ${DESIGN}). Report what you changed and what remains.`, { label: 'critic', phase: 'Critique', schema: CRITIC_SCHEMA }) : null

return { proposals, judges: goodJudges.map(j => ({ lens: j.lens, winner: j.winner, scores: j.scores.map(s => `${s.proposal}: ${s.score}`) })), synth, critic, auditCount: goodAudits.length, issueCount: goodAudits.reduce((n, a) => n + a.issues.length, 0) }
