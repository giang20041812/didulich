# Báo cáo kiểm tra và kế hoạch hoàn thiện phần Admin — VietTrek

- **Ngày lập:** 13/10/2026
- **Cập nhật:** 13/10/2026. Đã kiểm tra lại toàn bộ kết luận trên code; các đính chính và bổ sung nằm ở mục 1.6.
- **Nhánh:** `tuyenchuyenvan` (HEAD `6d93412`), có 3 file chưa commit
- **Trạng thái:** Kế hoạch đã được duyệt ngày 13/10/2026. Các câu hỏi đã chốt: Q1–Q5 và Q7 theo đề xuất; Q8 giữ nguyên quyền xem hiện tại của L3; Q4 có sửa script nhập dữ liệu cũ; Q9 viết changeset cho PostgreSQL. **Đợt 1 đã triển khai nhưng chưa commit** (xem mục 10). Còn chờ chốt Q6, cần cho Đợt 5.

---

## 0. Tôi đã kiểm tra những gì, và giới hạn

- **Đã đọc:** 21 controller Admin cùng các service và DTO chính, `SecurityConfig`, JWT, `UserPrincipal`, schema Liquibase v2, luồng đặt phòng và thanh toán, hơn 40 file frontend Admin, routing và `docs/db-v2.md`.
- **Đã chạy** (không sửa mã nguồn, chỉ ghi vào thư mục build đã nằm trong gitignore):
  - `mvn -o test`: 463 test, 0 lỗi. Kết quả này chạy trên working tree, tức là có cả thay đổi chưa commit của bạn.
    - *Đính chính:* bản trước ghi 485 là sai, vì đã cộng cả báo cáo cũ còn sót trong `target/surefire-reports`.
  - `tsc -b`: không có lỗi.
  - `oxlint`: 0 lỗi, 89 cảnh báo (30 cảnh báo nằm trong code Admin).
  - `vite build`: thành công. Build ra một thư mục tạm nên không ghi đè `dist/`. Chunk Admin nặng 344 KB, nén gzip còn 84 KB.
- **Chưa làm:** chạy ứng dụng, kết nối DB thật, thử giao diện trên trình duyệt. Vì vậy ký hiệu ✅ trong bảng nghĩa là luồng code đầy đủ từ UI → API → service → DB (thường có cả unit test). Nó **không** có nghĩa là tôi đã thấy chức năng chạy trên dữ liệu thật.
- `git status` sau khi kiểm tra vẫn chỉ có đúng 3 file bạn đang sửa dở.

---

## 1. Báo cáo hiện trạng

### 1.1 Kiến trúc thực tế

| Lớp | Thực tế |
|---|---|
| Backend | Spring Boot 3.5.16, Java 17, JPA, Liquibase (một changelog v2 cho PostgreSQL/Supabase), Spring Security dùng JWT stateless, BCrypt. Phân tầng controller → service → repository. |
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind 4, React Router 7, axios, recharts, PWA. |
| Admin FE | Một route duy nhất `/admin` → `AdminGuard` → `AdminDashboardPage`. Có 14 mục, chuyển bằng state (mỗi mục không có URL riêng). Panel nằm trong `components/admin/*`. CSS riêng `admin-mobile.css`, `admin-overview.css`, giới hạn trong lớp `.admin-ui`. **Phần Admin đã được cô lập tốt.** |
| Phân quyền | Ba vai trò ADMIN, PROVIDER, TRAVELER. Admin chia 3 cấp: L1 toàn quyền, L2 vận hành, L3 giám sát. Authority `ADMIN_L1..L3` được nạp từ DB ở mỗi request. Phiên bị thu hồi qua `token_version` và `account_session`. |
| Đặt phòng | `PENDING → CONFIRMED → PAID`; từ chối hoặc hủy thì về `CANCELLED`. PAID là trạng thái cuối. Hệ thống không có trạng thái "Hoàn thành". Admin (từ L2) và NCC dùng chung `BookingWorkflowService`. |
| Thanh toán | **Thanh toán diễn ra ngoài hệ thống.** Khách được hướng dẫn "liên hệ Zalo để được hướng dẫn thanh toán" ([BookingPage.tsx:978](../frontend-pwa/src/pages/customer/booking/BookingPage.tsx#L978)). NCC hoặc Admin bấm "Ghi nhận đã thanh toán" thì hệ thống tạo một giao dịch qua cổng MANUAL ([BookingWorkflowService.java:190](../backend-api/src/main/java/com/dulichso/bookingapi/service/BookingWorkflowService.java#L190)). Webhook SePay đang trả 501. **Không có đoạn code nào tạo bản ghi `refund` hay `commission_ledger`.** Tài liệu cũng ghi rõ "chưa xử lý doanh thu / hoa hồng" ([db-v2.md:78](db-v2.md#L78)). |

### 1.2 Các module Admin đang có

| Mục | Tình trạng |
|---|---|
| Tổng quan: KPI, việc cần xử lý, báo cáo có drill-down, xuất xlsx | Có luồng code đầy đủ và có test |
| SOS khẩn cấp và danh bạ đầu mối | Có luồng code đầy đủ |
| Duyệt điểm đến: xác minh, yêu cầu bổ sung, lưu trữ, ẩn, xóa mềm, thao tác hàng loạt | Có luồng code đầy đủ |
| Yêu cầu thay đổi của NCC (có so sánh trước/sau) | Có luồng code đầy đủ |
| Hồ sơ đăng ký NCC: duyệt, từ chối, hàng loạt, mở lại | Có luồng code đầy đủ |
| Kiểm duyệt đánh giá, ảnh check-in, bài "Trải nghiệm" | Có luồng code đầy đủ |
| Đối tác / NCC | Hoạt động, nhưng chưa có màn xem/sửa chi tiết NCC |
| Tài khoản khách và Quản trị viên | Có luồng code đầy đủ |
| Đặt phòng | Hoạt động, nhưng có lỗi B5 và B6 |
| Lịch phòng, Lịch sử xem homestay, Nhật ký hoạt động | Có luồng code đầy đủ (chỉ xem) |
| **Tài chính** | **Chỉ là màn "Tính năng đang phát triển"** |

**API đã có ở backend nhưng không có UI nào gọi:**
- `finance/revenue-summary`, `finance/refunds` (kèm duyệt/từ chối), `finance/cashflow`, `finance/affiliate-links`, `finance/commissions`
- `GET` và `PUT /providers/{id}`
- Bộ lọc `providerId` và `regionId` của `/places`

### 1.3 Lỗi và vấn đề phát hiện

| # | Mức | Vấn đề | Bằng chứng |
|---|---|---|---|
| B1 | **Cao, bảo mật** | Tài khoản ADMIN có `admin_level = NULL` đang được coi là **cấp 1** (fail-open). DB cho phép giá trị NULL. Frontend lại coi NULL là cấp 3, nên hai bên lệch nhau. Một tài khoản Admin nạp bằng SQL mà thiếu cấp sẽ có toàn quyền. | [Account.java:83](../backend-api/src/main/java/com/dulichso/bookingapi/entity/Account.java#L83), [001-identity.sql:42](../backend-api/src/main/resources/db/changelog/v2/001-identity.sql#L42), [adminPermissions.ts:59](../frontend-pwa/src/lib/adminPermissions.ts#L59) |
| B2 | **Cao, tài chính** | Duyệt hoàn tiền chỉ đổi trạng thái `PENDING → PROCESSED`, không xác minh tiền đã thực sự được hoàn. Hiện chưa gây hại vì không có nguồn nào tạo `refund`, nhưng API vẫn đang mở cho L1. | [AdminFinanceService.java:127](../backend-api/src/main/java/com/dulichso/bookingapi/service/AdminFinanceService.java#L127) |
| B3 | Trung bình | Khi từ chối hoàn tiền, lý do từ chối ghi đè lên lý do yêu cầu gốc. | [AdminFinanceService.java:183](../backend-api/src/main/java/com/dulichso/bookingapi/service/AdminFinanceService.java#L183) |
| B4 | Trung bình | Hợp đồng API giữa frontend và backend bị lệch. FE gửi `{note}` nhưng BE bắt buộc `{reason}`, nên request luôn bị 400. FE đọc trường `type` trong khi BE trả `refundType`. Lỗi chưa lộ ra chỉ vì chưa có UI. | [adminService.ts:609](../frontend-pwa/src/services/adminService.ts#L609) |
| B5 | Trung bình | Admin **cấp 3** vẫn thấy các nút Xác nhận, Từ chối, Thanh toán, Hủy, Nhận phòng. Bấm vào thì nhận 403. Đây là nút không có chức năng thật. | [BookingsPanel.tsx:301](../frontend-pwa/src/components/admin/BookingsPanel.tsx#L301), [SecurityConfig.java:103](../backend-api/src/main/java/com/dulichso/bookingapi/security/SecurityConfig.java#L103) |
| B6 | Trung bình | Khi Admin từ chối đơn, hủy đơn hoặc ghi nhận thanh toán, **lý do không bắt buộc**. Nguyên nhân là Admin đang dùng chung dialog của NCC, mà dialog đó cho phép bỏ trống. Ngoài ra, dialog chỉ gửi ghi chú khi từ chối hoặc hủy. Vì vậy khi **ghi nhận thanh toán, Admin không có chỗ nào để nhập chứng từ**. | [AdminBookingController.java:122](../backend-api/src/main/java/com/dulichso/bookingapi/controller/AdminBookingController.java#L122), [BookingDecisionDialog.tsx:75](../frontend-pwa/src/components/partner/BookingDecisionDialog.tsx#L75) |
| B7 | Thấp | Quy tắc mâu thuẫn: comment và mô tả menu ghi "Admin chỉ xem Booking", nhưng code cho phép L2 thao tác trên đơn. | [adminService.ts:564](../frontend-pwa/src/services/adminService.ts#L564), [adminNav.ts:164](../frontend-pwa/src/components/admin/adminNav.ts#L164) |
| B8 | Thấp | Thẻ "Hoàn tiền chờ duyệt" dẫn tới tab Tài chính đang là placeholder. Với L2 và L3, bấm vào không có tác dụng gì. | [OverviewPanel.tsx:71](../frontend-pwa/src/components/admin/OverviewPanel.tsx#L71) |
| B9 | Thấp | Hai màn đếm đơn theo hai định nghĩa khác nhau. "Đặt phòng tháng này" ở Tổng quan đếm cả đơn hủy. "Tổng số đơn" ở Báo cáo thì loại đơn hủy. | [AdminDashboardService.java:82](../backend-api/src/main/java/com/dulichso/bookingapi/service/AdminDashboardService.java#L82), [AdminReportService.java:139](../backend-api/src/main/java/com/dulichso/bookingapi/service/AdminReportService.java#L139) |
| B10 | Thấp | Tổng quan nuốt lỗi khi tính doanh thu (`catch (Exception ignored)`), nên có thể hiện 0đ thay vì báo lỗi. Số hoàn tiền được đếm bằng cách tải cả danh sách. Danh sách refund và commission không phân trang. | [AdminDashboardService.java:113](../backend-api/src/main/java/com/dulichso/bookingapi/service/AdminDashboardService.java#L113) |
| B11 | Chính sách | JWT **của mọi vai trò** (không riêng Admin) **không bao giờ hết hạn**, vì token không mang claim `exp`. Token lưu trong localStorage. Token bị lộ sẽ dùng được cho tới khi người dùng đăng xuất hoặc đổi mật khẩu. Kế hoạch chỉ sửa nhánh ADMIN (Đợt 5). | [JwtAuthenticationFilter.java:31](../backend-api/src/main/java/com/dulichso/bookingapi/security/JwtAuthenticationFilter.java#L31), [JwtUtils.java:17](../backend-api/src/main/java/com/dulichso/bookingapi/security/JwtUtils.java#L17) |
| B12 | Chính sách | Khi đặt lại mật khẩu, Admin tự gõ mật khẩu mới nên Admin biết mật khẩu của người dùng. Lý do thì bị gán cứng ở frontend. | [AdminDashboardPage.tsx:352](../frontend-pwa/src/pages/admin/AdminDashboardPage.tsx#L352) |
| B13 | Chính sách | `audit_log` bị xóa sau 180 ngày, kể cả các thao tác phân quyền và tài chính. Lượt xem homestay cũng được ghi vào bảng này. | [application.yml:142](../backend-api/src/main/resources/application.yml#L142) |
| B14 | Còn thiếu | Không phát hiện đơn PENDING đã quá hạn phản hồi. Hàm `ResponseDeadlineCalculator` có sẵn nhưng Admin không dùng tới. | — |
| B15 | Trung bình (tiềm ẩn) | Khi duyệt hoặc từ chối hoàn tiền, bản ghi được đọc **mà không khóa hàng**. Hai request gửi cùng lúc có thể cùng vượt qua bước kiểm tra `PENDING`. Hiện chưa gây hại vì chưa có bản ghi hoàn tiền nào. | [AdminFinanceService.java:129](../backend-api/src/main/java/com/dulichso/bookingapi/service/AdminFinanceService.java#L129) |

**Về các thay đổi chưa commit của bạn (tôi không đụng vào):**
- HEAD của nhánh đang tham chiếu entity `Traveler`, nhưng entity này đã bị xóa ở commit e5b1735, nên **HEAD không biên dịch được**.
  - Bản sửa của bạn trong [AdminHomestayViewService.java](../backend-api/src/main/java/com/dulichso/bookingapi/service/AdminHomestayViewService.java) và [AdminReviewService.java](../backend-api/src/main/java/com/dulichso/bookingapi/service/AdminReviewService.java) khắc phục lỗi này.
  - Toàn bộ test (463) pass là trên bản đã sửa đó. Khi triển khai, tôi sẽ làm tiếp trên bản của bạn.
- [pom.xml](../backend-api/pom.xml) thêm `mysql-connector-j` và nhắc tới profile `application-mysql.yml`, nhưng **file này không tồn tại**.
  - Tài liệu `db-v2.md` đã chốt bỏ MySQL, và changelog dùng cú pháp chỉ có ở PostgreSQL.
  - Việc này nằm ngoài phạm vi Admin, bạn tự quyết.

### 1.4 Bảo mật và phân quyền

**Điểm tốt, có bằng chứng trong code:**
- Backend tự thực thi quyền. Cấp Admin được đọc từ DB ở mỗi request.
- Khi đổi quyền, khóa tài khoản hoặc đổi định danh, phiên đăng nhập bị thu hồi ngay.
- Không ai tự đổi được quyền hay cấp của chính mình, cũng không tự khóa được mình.
- Luôn giữ ít nhất một Admin L1 còn hoạt động. L2 không thao tác được trên tài khoản Admin.
- Dùng `SELECT … FOR UPDATE` để chống bấm hai lần.
- Audit log ghi trong transaction riêng (`REQUIRES_NEW`), có IP, có dữ liệu trước/sau, có che email và SĐT.
- CORS không cho phép `*`. Có giới hạn tốc độ đăng nhập. Truy vấn có tham số hóa. Mật khẩu băm bằng BCrypt.

**Rủi ro:**
- B1, B2, B11, B12, B13 ở bảng trên.
- Admin cấp 3 xem được SĐT và email khách trong danh sách đơn (`BookingDto`).
- Chưa có test bao trọn ma trận quyền Admin (người chưa đăng nhập, khách, NCC, L1/L2/L3).

### 1.5 File dùng chung cần bảo vệ (không sửa nếu chưa được duyệt riêng)

- **Backend:**
  - `SecurityConfig`, `JwtAuthenticationFilter`, `JwtUtils`, `UserPrincipal`, entity `Account` và các entity khác
  - `BookingWorkflowService`, `BookingServiceImpl`, `BookingNotifier`, `NotificationRecorder`, `PasswordResetService`, `DataRetentionService`
  - **`AdminBookingService`**, vì `BookingDto` của nó được code NCC dùng lại
  - Toàn bộ `Partner*` và `Public*`
  - Các changeset Liquibase đã phát hành (có test kiểm checksum)
  - Các file `application*.yml`
  - `ops/migration/v2/02-import-from-legacy.sql` (script nhập dữ liệu cũ; xem Q4)
- **Frontend:**
  - `routes/AppRoutes.tsx`, `styles/globals.css`, `design/tokens.json`
  - `components/layout|ui|auth|partner/*`, trong đó có `BookingDecisionDialog` mà Admin đang dùng
  - `pages/portal/PortalLoginPage.tsx` (trang đăng nhập chung)
  - `lib/bookingStatus.ts`, `apiError.ts`, `authInterceptor.ts`, `axiosBoot.ts`, `partnerGet.ts`, `dataCache.ts`, `xlsx.ts`
  - `types/booking.ts`
  - **`types/admin.ts`**: code NCC có import file này, nên chỉ được thêm kiểu mới, không được sửa kiểu cũ.
  - **`lib/adminPush.ts`**: được import ở [PartnerNotificationDropdown.tsx:6](../frontend-pwa/src/components/partner/PartnerNotificationDropdown.tsx#L6) và `partnerNotificationService.ts`.

### 1.6 Đính chính và bổ sung sau lần kiểm tra lại

Tôi đã kiểm tra lại độc lập mọi kết luận trên code. Kết quả: B1–B14 đều đúng; có một điểm sai và một số điểm bổ sung dưới đây. Các bảng phía dưới đã được sửa theo.

1. **T4 bị đánh giá sai.** Chức năng này đã có:
   - NCC tạo homestay mới ở dạng nháp.
   - Lần công khai đầu tiên đi qua yêu cầu thay đổi `PUBLISH`, và hệ thống gửi `ADMIN_NEW_CHANGE_REQUEST` cho Admin ([PartnerChangeService.java:142](../backend-api/src/main/java/com/dulichso/bookingapi/service/PartnerChangeService.java#L142), [:219](../backend-api/src/main/java/com/dulichso/bookingapi/service/PartnerChangeService.java#L219)).
   - Đã bỏ hạng mục "xác minh T4" khỏi Đợt 4.
2. **B6 rộng hơn mô tả cũ.** Khi ghi nhận thanh toán, Admin không có ô nào để nhập chứng từ. Muốn bắt buộc chứng từ (Q3) thì phải làm dialog riêng cho Admin.
3. **B15 (mới):** duyệt hoặc từ chối hoàn tiền không khóa bản ghi.
4. **B11 áp dụng cho mọi vai trò.** Kế hoạch vẫn chỉ sửa nhánh ADMIN.
5. **Phạm vi sửa B1 nhỏ hơn dự kiến:**
   - Trong code chạy thật, chỉ `JwtAuthenticationFilter` tạo `UserPrincipal`, và luôn truyền vào `account.effectiveAdminLevel()` ([:172](../backend-api/src/main/java/com/dulichso/bookingapi/security/JwtAuthenticationFilter.java#L172)).
   - Vì vậy **không cần sửa `UserPrincipal`**. 10 file test đang dùng constructor mặc định cấp 1 cũng không bị ảnh hưởng.
   - Admin khởi tạo (`SeedAccountPasswordInitializer`) luôn được gán cấp 1.
   - Nguồn thực tế sinh ra `admin_level = NULL` là script nhập dữ liệu cũ [02-import-from-legacy.sql:93](../ops/migration/v2/02-import-from-legacy.sql#L93). Script này sẽ lỗi nếu chạy lại sau khi thêm ràng buộc CHECK (xem Q4).
6. **`lib/adminPush.ts` dùng chung với NCC.** Đã thêm vào danh sách bảo vệ ở mục 1.5.
7. **`AdminExceptionHandler` chỉ áp cho 12/20 controller Admin**, liệt kê bằng `assignableTypes`.
   - Hiện không gây lỗi: 8 controller còn lại hoặc có handler riêng, hoặc chỉ ném `ResponseStatusException`.
   - **Quy ước:** controller Admin mới phải được thêm vào danh sách này.
8. **`admin-overview.css` có class không nằm dưới `.admin-ui`**, ví dụ `.overview-landscape` ([:17](../frontend-pwa/src/styles/admin-overview.css#L17)).
   - Đã kiểm tra: hiện không trùng với class nào ở trang khách hay NCC. Tôi không sửa file này.
   - CSS viết mới phải nằm dưới `.admin-ui`.
9. **Test ma trận quyền:** dự án chưa có `spring-security-test` và chưa có test MockMvc nào. Sẽ viết bằng `@WebMvcTest` + JWT ký thật + `@MockitoBean AccountRepository`, **không cài thêm thư viện**.
10. **Đã kiểm tra, không thấy vấn đề:**
    - Không có cửa hậu đăng nhập: nhánh "tài khoản QA mẫu" trong `AdminAccountService.me()` là code chết.
    - File xlsx xuất ra không bị chèn công thức, vì ô được ghi dạng `inlineStr`.
    - Mọi danh sách Admin giới hạn tối đa 100 dòng mỗi trang.
    - Audit log tự cắt lý do ở 500 ký tự.
    - Phần Admin không dùng `dangerouslySetInnerHTML` với dữ liệu người dùng.

---

## 2. Bảng đối chiếu yêu cầu

Ký hiệu: ✅ hoàn thiện · 🟡 có một phần · 🔌 có API nhưng chưa có UI · ⚠️ có lỗi · ❌ chưa có · ➖ không áp dụng với mô hình thanh toán hiện tại · ❓ chưa xác minh.
Tên nhóm nằm ở tiêu đề mỗi bảng và ở tiền tố của ID.

**Nhóm 1 — Dashboard**

| ID | Yêu cầu | Hiện trạng | Bằng chứng | Phần thiếu | Đề xuất |
|---|---|---|---|---|---|
| D1 | Tổng khách hàng | ✅ | `getSummary.totalTravelers`, số khách mới 7/30 ngày | — | Giữ nguyên |
| D2 | Tổng NCC | ✅ | total/active/suspended | Con số tổng gồm cả NCC đã chấm dứt | Ghi chú rõ trên thẻ |
| D3 | Tổng homestay | 🟡 | `totalPlaces` đếm mọi loại địa điểm | Không có số homestay riêng | Thêm số đếm loại HOMESTAY (Đợt 3) |
| D4 | Tổng đơn | ✅ | `bookings/summary`, KPI báo cáo | — | — |
| D5 | Đơn chờ / xác nhận / hoàn thành / hủy | 🟡 | 4 trạng thái thật | Không có "hoàn thành" | Định nghĩa trong báo cáo: PAID và đã qua ngày trả phòng (không đổi state machine) |
| D6 | Giao dịch và tình trạng thanh toán | 🟡 | Chỉ có giao dịch MANUAL ở trạng thái SUCCESS | Không có cổng online nên không có giao dịch lỗi | Đợt 2 |
| D7 | Doanh thu theo ngày / tuần / tháng / năm | 🟡 | Báo cáo theo ngày (khoảng ≤62 ngày) hoặc theo tháng | Thiếu tuần và năm | Đợt 3 |
| D8 | Hoa hồng nền tảng | ➖ | `db-v2.md:78` | Chưa có mô hình hoa hồng | Chờ quyết định Q1 |
| D9 / D10 | Top homestay, top NCC | ✅ | topPlaces, topProviders (top 5) | — | — |
| D11 / D12 | Biểu đồ xu hướng, bộ lọc thời gian | ✅ | ReportsPanel | Thẻ KPI cố định ở "tháng này" | Giữ nguyên |
| D13 | Cảnh báo khiếu nại, giao dịch lỗi, đơn có vấn đề | 🟡 | Hàng đợi, SOS, AdminLiveAlerts | Không có khiếu nại, không có cảnh báo đơn quá hạn | Đợt 3 (đơn quá hạn) |
| D14 | Thẻ thống kê dẫn tới trang chi tiết | ⚠️ | `onNavigate`, drill-down | Lỗi B8 | Đợt 2 |

**Nhóm 2 — Tài khoản**

| ID | Yêu cầu | Hiện trạng | Bằng chứng | Phần thiếu | Đề xuất |
|---|---|---|---|---|---|
| A1 | Danh sách Customer, NCC, Admin | ✅ | AccountsPanel, ProvidersPanel, AdminStaffPanel | — | — |
| A2 | Tìm, lọc, phân trang | 🟡 | Khách: phân trang phía server | NCC phân trang ở trình duyệt; Admin cố định size=100 | Chấp nhận được với quy mô hiện tại |
| A3 | Hồ sơ chi tiết | 🟡/🔌 | AccountDetailDrawer | NCC chưa có màn xem/sửa, dù API PUT đã có | Đợt 4 |
| A4 / A5 | Trạng thái, lịch sử hoạt động | ✅ | TravelerActivityPanel, nhật ký lọc theo người thao tác | — | — |
| A6 | Khóa / mở khóa | ✅ | Bắt buộc lý do, thu hồi phiên, khóa NCC thì tự hủy đơn chờ; có test | — | — |
| A7–A9 | Đăng ký NCC, duyệt / từ chối, lý do | ✅ | ProviderApplicationsPanel; có test | — | — |
| A10 | Vai trò và quyền của nhân viên quản trị | 🟡 | 3 cấp cố định | Chưa có ma trận quyền theo từng chức năng | Giữ 3 cấp |
| A11 | Chặn tự nâng quyền | ⚠️ | Không tự đổi được quyền; chỉ L1 được đổi | Lỗi B1 | Đợt 1 (cần Q4) |
| A12 | Bảo vệ Super Admin | ✅ | Luôn còn ≥1 L1; L2 không tác động lên Admin | — | — |
| A13 | Không lộ mật khẩu | 🟡 | BCrypt, không trả hash ra ngoài | Lỗi B12 | Chờ Q5 |

**Nhóm 3 — Homestay**

| ID | Yêu cầu | Hiện trạng | Bằng chứng | Phần thiếu | Đề xuất |
|---|---|---|---|---|---|
| H1 | Danh sách | ✅ | PlacesPanel | — | — |
| H2 | Lọc theo NCC / địa điểm / trạng thái | 🟡/🔌 | Backend có providerId, regionId | UI chưa có bộ lọc NCC và khu vực | Đợt 4 |
| H3 / H4 | Chi tiết; kiểm tra ảnh, tiện nghi, giá, sức chứa | ✅ | PlaceQuickPreview + showcase (ảnh, tiện nghi, chính sách, loại phòng, giá theo mùa) | — | — |
| H5 / H6 | Duyệt / yêu cầu sửa / lưu trữ; ẩn | ✅ | Bắt buộc lý do; có thao tác hàng loạt | — | — |
| H7 | Xử lý vi phạm | 🟡 | Ẩn, lưu trữ, xóa mềm (L1) | Không có hồ sơ vi phạm riêng | Đủ dùng |
| H8 | Lịch sử thay đổi | ✅ | Yêu cầu thay đổi (trước/sau) + nhật ký | — | — |
| H9 | Danh mục khu vực, loại hình, tiện ích | ❌ | Nạp bằng `007-reference-data.sql` | Không có API/UI quản trị | Tùy chọn 7C |

**Nhóm 4 — Đặt phòng**

| ID | Yêu cầu | Hiện trạng | Bằng chứng | Phần thiếu | Đề xuất |
|---|---|---|---|---|---|
| K1–K5 | Xem, tìm (mã / khách / NCC / homestay / ngày), lọc, chi tiết, lịch sử trạng thái | ✅ | AdminBookingController, BookingDetailDrawer | — | — |
| K6 | Kiểm tra trạng thái hợp lệ | ✅ | allowedActions + khóa hàng + 409; có test | — | — |
| K7 | Theo dõi đơn chờ | ✅ | Badge + bộ lọc | — | — |
| K8 / K10 | Đơn treo; NCC không phản hồi | 🟡 | Ghi chú giám sát (ESCALATED); L2 xử lý thay NCC | Không phát hiện đơn quá hạn (B14) | Đợt 3 |
| K9 | Hủy theo chính sách | 🟡 | Hủy được đơn CONFIRMED; đơn PAID không hủy được | Chính sách hủy không dùng để tính phí | Giữ nguyên quy tắc |
| K11 | Lý do và người thực hiện | ⚠️ | Lưu actor, actorId, audit | Lý do không bắt buộc (B6) | Đợt 1 |
| K12 | Chặn thao tác trái quy tắc | ⚠️ | Backend chặn đúng | UI L3 vẫn hiện nút (B5) | Đợt 1 |

**Nhóm 5 — Tài chính**

| ID | Yêu cầu | Hiện trạng | Bằng chứng | Phần thiếu | Đề xuất |
|---|---|---|---|---|---|
| F1 / F2 | Danh sách giao dịch; tìm theo mã | ❌ | Chỉ thấy trong chi tiết từng đơn | Không có API danh sách | Đợt 2 |
| F3 / F4 | Trạng thái thanh toán; đối chiếu với đơn | 🟡 | Index unique cho giao dịch SUCCESS | Chưa có màn đối soát | Đợt 2 |
| F5 | Thanh toán thất bại | ➖ | Không có cổng online | — | — |
| F6 / F7 | Yêu cầu và trạng thái hoàn tiền | ⚠️ | API cho L1 | Không có nguồn tạo yêu cầu; lỗi B2–B4 | Chờ Q1 |
| F8 | Hoa hồng | ➖ | Có API affiliate nhưng chưa ghi bút toán nào | — | Ẩn khỏi UI |
| F9 / F10 | Đối soát với NCC; báo cáo doanh thu | 🔌 | `cashflow`, `revenue-summary` | Không có UI | Đợt 2 |
| F11 / F12 | Xuất báo cáo; giao dịch bất thường | ❌/🟡 | DB chặn 2 giao dịch SUCCESS cho một đơn | — | Đợt 2 |

**Nhóm 6 — Khiếu nại, đánh giá, hỗ trợ**

| ID | Yêu cầu | Hiện trạng | Bằng chứng | Phần thiếu | Đề xuất |
|---|---|---|---|---|---|
| C1–C7 | Tiếp nhận, phân loại, bằng chứng, phân công, xử lý, quyết định | ❌ | Không có bảng/luồng; gần nhất là SOS và ghi chú giám sát đơn | Toàn bộ | Tùy chọn 7A |
| C8 | Đánh giá bị báo cáo | 🟡 | Admin kiểm duyệt mọi đánh giá | Khách/NCC chưa báo cáo được | Giữ nguyên (thêm luồng báo cáo sẽ chạm phía khách/NCC) |
| C9 | Xử lý nội dung vi phạm | ✅ | Giữ / Ẩn / Gỡ / Khôi phục, có lý do | — | — |
| C10 | Thời gian xử lý | ❌ | Có `moderatedAt` | Không đo | Đợt 4 (nhỏ) |

**Nhóm 7 — Khuyến mãi (P1–P8)**

| ID | Yêu cầu | Hiện trạng | Bằng chứng | Phần thiếu | Đề xuất |
|---|---|---|---|---|---|
| P1–P8 | Mã giảm giá, điều kiện áp dụng, giới hạn lượt dùng, bật/tắt, theo dõi | ❌ | Không có bảng hay entity nào | Muốn áp mã thì phải sửa giá trong luồng đặt phòng của khách (vùng bảo vệ) | **Hoãn**, chỉ làm khi bạn duyệt thay đổi phía khách |

**Nhóm 8 — Nội dung**

| ID | Yêu cầu | Hiện trạng | Bằng chứng | Phần thiếu | Đề xuất |
|---|---|---|---|---|---|
| N1 / N2 | Banner, nội dung trang chủ | ❌ | Trang chủ dựng từ dữ liệu điểm đến | Phải tích hợp vào trang của khách | Hoãn |
| N3 / N4 | Khu vực, loại hình lưu trú | ❌ | Nạp bằng SQL; loại hình là enum | — | 7C (khu vực, tiện ích) |
| N5 / N6 | Bài viết, chính sách | ❌/❓ | Nạp bằng SQL; chính sách hủy do NCC đặt | — | Không làm |
| N7 | Kiểm soát trước khi xuất bản | ✅ | Duyệt điểm đến, yêu cầu thay đổi, ẩn bài | — | — |

**Nhóm 9 — Báo cáo**

| ID | Yêu cầu | Hiện trạng | Bằng chứng | Phần thiếu | Đề xuất |
|---|---|---|---|---|---|
| R1 / R2 / R8 / R9 | Doanh thu theo kỳ, đơn theo trạng thái, bộ lọc thời gian, xuất xlsx | ✅ | AdminReportService, reportExport.ts | — | — |
| R3 | Tỷ lệ hủy | 🟡 | Có số đơn hủy | Chưa hiển thị % | Đợt 3 |
| R4 / R5 | Hiệu quả NCC, homestay | 🟡 | Top 5 + lượt xem | Chưa có bảng đầy đủ | Đợt 3 |
| R6 / R7 | Khách quay lại; theo khu vực | 🟡 | Có số khách mới | Chưa có "khách quay lại", chưa có theo khu vực | Đợt 3 |
| R10 | Khớp số liệu với Dashboard | ⚠️ | Lỗi B9 | — | Đợt 3 |

**Nhóm 10 — Thông báo**

| ID | Yêu cầu | Hiện trạng | Bằng chứng | Phần thiếu | Đề xuất |
|---|---|---|---|---|---|
| T1–T3 | Chuông thông báo, push, đơn cần xử lý, đăng ký NCC | ✅ | Các mẫu `ADMIN_NEW_BOOKING`, `_PROVIDER_APPLICATION`, `_SOS`… | — | — |
| T4 | Thông báo duyệt homestay | ✅ | Lần công khai đầu tiên đi qua yêu cầu `PUBLISH` và gửi `ADMIN_NEW_CHANGE_REQUEST` ([PartnerChangeService.java:142](../backend-api/src/main/java/com/dulichso/bookingapi/service/PartnerChangeService.java#L142), [:219](../backend-api/src/main/java/com/dulichso/bookingapi/service/PartnerChangeService.java#L219)) | — | Giữ nguyên |
| T5 / T6 | Giao dịch lỗi, khiếu nại | ➖/❌ | — | — | Theo 7A |
| T7 / T8 | Lịch sử gửi, mẫu email | 🟡/❌ | Bảng `notification` và `notification_template` | Chưa có màn hình | Tùy chọn 7F |

**Nhóm 11 — Bảo mật và nhật ký**

| ID | Yêu cầu | Hiện trạng | Bằng chứng | Phần thiếu | Đề xuất |
|---|---|---|---|---|---|
| S1–S3 | Nhật ký thao tác, lịch sử đăng nhập kèm IP, dữ liệu trước/sau | ✅ | ActivityPanel, AuditLogService | — | — |
| S4 | Lý do cho thao tác nhạy cảm | 🟡 | Phần lớn đã bắt buộc | Còn thiếu ở B6, B12 và khi đổi cấp Admin | Đợt 1 |
| S5 | Phát hiện bất thường | 🟡 | Rate-limit, ghi log DENIED | Chưa có cảnh báo | Tùy chọn |
| S6 / S8 | Phân quyền API, quyền trên từng endpoint | ✅ | SecurityConfig | Chưa có test ma trận quyền | Đợt 1 |
| S7 | Chống truy cập trái phép | ⚠️ | — | Lỗi B1, B11 | Đợt 1, Đợt 5 |
| S9 / S11 | Kiểm tra đầu vào; không ghi bí mật vào log | 🟡/❓ | Bean Validation, che định danh | Chưa rà hết mọi log | Rà trong các file sẽ sửa |
| S10 | Bảo vệ thông tin cá nhân | 🟡 | — | L3 xem được SĐT/email khách | Chờ Q8 |
| S12 | Sao lưu / khôi phục | 🟡 | Script trong `ops/backup` | Nằm ngoài ứng dụng | Không làm trong UI |

**Nhóm 12 — Cấu hình và phân quyền**

| ID | Yêu cầu | Hiện trạng | Bằng chứng | Phần thiếu | Đề xuất |
|---|---|---|---|---|---|
| G1–G4 | Cấu hình nghiệp vụ, chính sách hủy, hoa hồng, thời gian xử lý đơn | ❌/➖ | `app_setting` chỉ dùng nội bộ; chính sách và giờ phản hồi do NCC đặt | — | Hoãn |
| G5 / G7 | Vai trò Admin, bảo vệ thao tác đặc quyền | ✅ | — | — | — |
| G6 | Quyền theo từng chức năng | 🟡 | Cố định trong code | — | Giữ nguyên |
| G8 / G9 | Cấu hình tích hợp, lịch sử đổi cấu hình | ❌/➖ | Biến môi trường | Không nên đưa bí mật lên UI | Không làm |

---

## 3. Quyết định cần bạn chốt (ảnh hưởng trực tiếp tới kế hoạch)

| # | Câu hỏi | Khuyến nghị của tôi |
|---|---|---|
| **Q1** | Màn Tài chính khi khách đang trả tiền ngoài hệ thống? | **A:** Màn chỉ đọc dữ liệu thật: giao dịch đã ghi nhận, dòng tiền theo NCC/homestay, đối soát. Ẩn hoàn tiền, affiliate, hoa hồng vì chưa có nguồn dữ liệu. (B) Xây luồng hoàn tiền thật sẽ phải đổi state machine dùng chung với NCC, nên cần thiết kế riêng. |
| **Q2** | Admin có tiếp tục được thao tác đơn thay NCC không? | **Có**, giữ quyền cho L2 như hiện tại, bắt buộc lý do, và sửa lại mô tả đang ghi "chỉ xem". |
| **Q3** | Admin "Ghi nhận đã thanh toán" có phải ghi chứng từ không? | **Có, bắt buộc** (ví dụ: cách thanh toán, mã chuyển khoản). |
| **Q4** | Sửa B1 bằng changeset `010` không? Changeset này gán `admin_level = 1` cho các ADMIN đang NULL (giữ đúng quyền hiện tại), thêm ràng buộc CHECK, và đổi giá trị dự phòng trong `Account.effectiveAdminLevel()` sang 3. Kèm theo: có thêm `COALESCE(admin_level, 1)` vào `ops/migration/v2/02-import-from-legacy.sql` không, để script không lỗi nếu chạy lại? | **Có.** `Account` là file dùng chung, nhưng thay đổi chỉ tác động tới tài khoản ADMIN. Trước đó cần bạn chạy một truy vấn đọc để xem có tài khoản nào bị ảnh hưởng. Script `ops` nằm ngoài phạm vi Admin nên cần bạn duyệt riêng. |
| **Q5** | Đặt lại mật khẩu bởi Admin | **Tối thiểu:** bắt buộc nhập lý do. Đổi sang gửi OTP qua email sẽ phải chạm `PasswordResetService` dùng chung. |
| **Q6** | Có cho hết hạn phiên Admin (sửa nhánh ADMIN trong `JwtAuthenticationFilter`) và giữ nhật ký của Admin lâu hơn 180 ngày không? | **Có.** Cần bạn chọn thời hạn, ví dụ 12 giờ mỗi phiên, giữ nhật ký Admin 2 năm. |
| **Q7** | Có làm module mới không? | Chỉ làm **7A Khiếu nại phía Admin** (Admin tạo phiếu thay khách, không chạm UI của khách). 7C (danh mục) làm nếu bạn cần. **Hoãn** khuyến mãi, banner, cấu hình. |
| **Q8** | Admin cấp 3 có được xem SĐT và email khách không? | Bạn quyết định. Nếu không, tôi che các trường này cho L3 trong một response riêng của Admin, không sửa `BookingDto` dùng chung. |
| **Q9** | `pom.xml` vừa thêm `mysql-connector-j` và có thư mục `db/changelog-mysql/v2` (đang rỗng). Bạn có định chuyển môi trường dev sang MySQL không? | Bạn quyết định. Changeset `010` dùng cú pháp PostgreSQL như mọi changeset khác. Nếu chuyển dev sang MySQL thì cần thêm bản MySQL tương ứng. |

---

## 4. Kế hoạch triển khai theo đợt

### Đợt 1 — Vá phân quyền và quy tắc thao tác (ưu tiên cao nhất)

- **Mục tiêu:** đóng lỗi B1, B5, B6, B7, B12; thêm test ma trận quyền.
- **Hạng mục:**
  - **B1** (cần Q4):
    - Tạo mới `v2/010-admin-level-not-null.sql` (backfill, CHECK, `--rollback` bằng DROP CONSTRAINT).
    - Thêm một dòng vào `db.changelog.xml` (chỉ nối thêm).
    - Sửa `Account.effectiveAdminLevel()` và giá trị `.orElse(1)` trong `AdminAccountService` sang hướng an toàn.
    - **Không sửa `UserPrincipal`** (xem mục 1.6, điểm 5).
    - Nếu Q4 được duyệt: thêm `COALESCE(admin_level, 1)` vào script nhập dữ liệu cũ.
  - **B5:** ẩn nút thao tác đơn khi `!can('operate')` trong [BookingsPanel.tsx](../frontend-pwa/src/components/admin/BookingsPanel.tsx) và [BookingDetailDrawer.tsx](../frontend-pwa/src/components/admin/BookingDetailDrawer.tsx).
  - **B6:**
    - Backend: bắt buộc lý do trong `AdminBookingMonitorService.act` (service chỉ Admin dùng). **Không sửa `BookingWorkflowService`**, nên NCC không đổi.
    - Frontend: tạo mới `components/admin/AdminBookingDecisionDialog.tsx` và thay import ở 2 file Admin. **Không sửa dialog của NCC.**
      - Lý do bắt buộc khi từ chối hoặc hủy.
      - Khi ghi nhận thanh toán, có ô nhập chứng từ bắt buộc (theo Q3), ví dụ cách thanh toán và mã giao dịch.
      - Chứng từ được lưu vào lịch sử trạng thái và audit log, không thay đổi schema.
  - **B12 / S4:** thêm ô lý do bắt buộc khi đặt lại mật khẩu và khi đổi cấp. Sửa ở `AdminDashboardPage`, `AdminStaffPanel`; backend kiểm tra trong `AdminAccountService`.
  - **B7:** sửa mô tả trong `adminNav.ts` và comment trong `adminService.ts`.
  - **Test:** tạo mới `AdminEndpointAuthorizationTest`.
    - Kiểm các trường hợp: chưa đăng nhập → 401; khách và NCC → 403; L3 bị chặn POST; L2 bị chặn `/accounts/**` và `/finance/**`; ADMIN có cấp NULL không được quyền L1.
    - Cách viết: `@WebMvcTest` + JWT ký thật + `@MockitoBean AccountRepository`. Không cài thêm thư viện.
- **Ảnh hưởng tới Customer/NCC:** không có. Ngoại lệ duy nhất là `Account.java`, và chỉ tác động nhánh ADMIN.
- **Rủi ro:** migration chạy trên DB thật. Cần sao lưu và chạy thử trên DB dev trước.
- **Điều kiện qua đợt:** `mvn test` và `tsc` xanh, test quyền mới xanh.

### Đợt 2 — Màn Tài chính dùng dữ liệu thật (thay placeholder, theo Q1 = A)

- **Backend:**
  - Trong `AdminFinanceController`, thêm `GET /finance/transactions`:
    - Phân trang, tối đa 100 dòng mỗi trang.
    - Lọc theo mã đơn, mã giao dịch, tên/SĐT khách, NCC, trạng thái, khoảng ngày.
  - Thêm `GET /finance/reconciliation`, liệt kê hai loại bất thường:
    - Đơn PAID nhưng không có giao dịch SUCCESS.
    - Giao dịch SUCCESS nhưng đơn không ở trạng thái PAID.
  - Quyền giữ L1 như hiện tại. Thêm DTO vào `AdminFinanceDtos` (file chỉ Admin dùng).
  - Thêm query mới vào `PaymentTransactionRepository` và `BookingRepository`. Chỉ bổ sung, không sửa query cũ.
  - Sửa B3 và B10.
  - Sửa B15: khi duyệt hoặc từ chối hoàn tiền thì khóa bản ghi, bằng một phương thức `findByIdForUpdate` mới trong `RefundRepository` (chỉ bổ sung).
  - Giữ các API hoàn tiền và affiliate nhưng **không đưa lên UI**. Sửa hợp đồng API ở frontend (B4) để không còn bẫy.
- **Frontend:**
  - Tạo mới `components/admin/FinancePanel.tsx` với 4 tab: Thu đã ghi nhận theo tháng · Giao dịch · Theo NCC/Homestay (dùng lại `cashflow`) · Đối soát.
  - Tạo mới `types/finance.ts`.
  - Sửa `adminService.ts`, `AdminDashboardPage.tsx` (thay placeholder), `adminNav.ts` (bỏ nhãn "Sắp có"), `OverviewPanel.tsx` (B8).
  - Xuất xlsx bằng cách gọi `lib/xlsx.ts`, không sửa file đó.
  - Dùng nhãn **"Tiền khách đã thanh toán (ghi nhận thủ công)"**. Không gọi đây là "doanh thu nền tảng".
- **Ảnh hưởng:** không có. Toàn bộ là đọc dữ liệu.
- **Test:** unit test cho các service mới; kiểm L2 và L3 bị 403.

### Đợt 3 — Cảnh báo đơn quá hạn và hoàn thiện báo cáo

- **Đơn quá hạn:** thêm endpoint riêng `GET /admin/bookings/overdue`, tính hạn bằng `ResponseDeadlineCalculator` theo giờ phản hồi của từng homestay. **Không thêm trường vào `BookingDto` dùng chung.** Thêm `overdueBookings` vào `nav-counts`.
- **Báo cáo** (`AdminReportService`):
  - Thêm độ chi tiết theo tuần và năm (mặc định vẫn giữ hành vi cũ).
  - Thêm % tỷ lệ hủy, số khách quay lại, top theo khu vực.
- **Tổng quan** (`AdminDashboardService`): thêm `totalHomestays`; thống nhất nhãn và định nghĩa để hết lệch số (B9).
- **Frontend:** sửa OverviewPanel, BookingsPanel, ReportsPanel, reportExport.

### Đợt 4 — Hoàn thiện NCC, Homestay, Đánh giá

- Thêm drawer chi tiết NCC và chức năng sửa thông tin NCC (API `PUT` đã có, chỉ L2 trở lên).
- Thêm bộ lọc NCC và khu vực vào PlacesPanel. API backend đã hỗ trợ; danh sách khu vực lấy từ API công khai, chỉ đọc.
- Thêm cột "thời gian chờ xử lý" vào ReviewsPanel.
- (Đã bỏ hạng mục "xác minh T4" vì đã xác minh xong; xem mục 1.6.)

### Đợt 5 — Phiên Admin và thời gian lưu nhật ký (cần Q6, chạm file dùng chung)

- `JwtAuthenticationFilter`: **chỉ nhánh ADMIN** bị giới hạn thời hạn phiên, dựa trên các cột đã có `account_session.created_at` hoặc `last_activity_at`. Phiên của khách và NCC không đổi. B11 cũng xảy ra ở khách và NCC, nhưng nằm ngoài phạm vi Admin; tôi chỉ sửa phần đó khi bạn yêu cầu.
- `DataRetentionService`: thêm tham số `audit-log-admin-days`. Mặc định bằng giá trị hiện tại, nên chưa cấu hình thì hành vi không đổi.
- Không thay đổi DB.

### Đợt 6 — Module mới (mỗi module cần bạn duyệt riêng, theo Q7)

- **7A Khiếu nại phía Admin:**
  - Hai bảng mới qua changeset `011`: `support_ticket` (đơn liên quan, NCC, khách, loại, trạng thái, người xử lý, quyết định) và `support_ticket_event` (trao đổi, URL bằng chứng).
  - API `/admin/tickets/**`: đọc từ L3, ghi từ L2. Thêm `TicketsPanel`.
  - Không chạm UI của khách.
- **7C Danh mục khu vực / tiện ích:** CRUD trên các bảng đã có, không cho xóa mục đang được dùng. Dữ liệu này hiển thị ở trang khách, nên cần duyệt.
- **7F Mẫu thông báo:** sửa nội dung mẫu. Đây là nội dung khách và NCC nhận được, nên cần duyệt.

### Đợt 7 — Kiểm thử tổng thể và báo cáo nghiệm thu (Giai đoạn 6)

---

## 5. Kế hoạch frontend Admin

- **Giữ khung hiện có:** sidebar 4 nhóm, header có breadcrumb, chuông và nút làm mới, thanh điều hướng đáy trên mobile, bảng lệnh Ctrl K, NoticeDialog.
- **Panel mới làm theo mẫu sẵn có:**
  - Dùng PanelCard, AdminFilters, phân trang phía server, drawer chi tiết.
  - Thao tác nguy hiểm phải qua dialog xác nhận có lý do.
  - Đủ 4 trạng thái: loading (skeleton), empty, error (có nút thử lại), success.
- Ẩn nút theo `useAdminPermission` để giao diện gọn, nhưng **quyền thật do backend quyết định**.
- CSS mới chỉ thêm vào file CSS của Admin, dưới lớp `.admin-ui`. Không sửa `globals.css` hay tokens. (`admin-overview.css` hiện có class chưa nằm dưới lớp này; giữ nguyên, xem mục 1.6.)
- Không cài thêm thư viện.

## 6. Backend và API (endpoint mới hoặc sửa)

| Endpoint | Method | Quyền | Ghi chú |
|---|---|---|---|
| `/admin/bookings/{id}/reject\|cancel\|pay` | POST (sửa) | L2 | Bắt buộc lý do / chứng từ (400 nếu thiếu); chỉ sửa service Admin |
| `/admin/accounts/{id}/reset-password`, `/admin-level` | PATCH (sửa) | L2 / L1 | Bắt buộc lý do; có audit sẵn |
| `/admin/finance/transactions` | GET (mới) | L1 | Phân trang, chỉ đọc |
| `/admin/finance/reconciliation` | GET (mới) | L1 | Chỉ đọc |
| `/admin/finance/refunds/{id}/reject` | POST (sửa) | L1 | Không ghi đè lý do gốc (B3) |
| `/admin/bookings/overdue` | GET (mới) | L3 | Chỉ đọc |
| `/admin/dashboard/nav-counts`, `/summary`, `/reports/overview` | GET (sửa) | L3 | Chỉ thêm trường hoặc tham số tùy chọn |
| `/admin/tickets/**` | (7A) | L3 đọc / L2 ghi | Chỉ khi được duyệt |

Mọi lỗi trả JSON `{status, message}` qua `AdminExceptionHandler`. Controller Admin mới phải được thêm vào `assignableTypes` của handler này. Mọi thao tác ghi đều được ghi audit.

## 7. Kế hoạch database

- **Đợt 1–5:** không thêm bảng, không thêm index. Các truy vấn mới dùng index đã có (`idx_payment_transaction_status_paid`, `uq_booking_code`).
- **Thay đổi duy nhất:** changeset `010` nếu bạn đồng ý Q4.
  - Backfill giữ nguyên quyền đang có, nên không cần hoàn tác.
  - Rollback bằng DROP CONSTRAINT.
- **Đợt 6:** bảng mới chỉ được tạo khi bạn duyệt. Đặt trong file `v2/011-*.sql`, theo đúng quy ước của dự án (RLS, CHECK cho enum, FK có index, có `--rollback`). Chỉ bổ sung, không sửa bảng cũ.
- **Trước mọi migration:** bạn chạy `ops/backup/backup-postgres.sh`, rồi chạy thử trên DB dev. Tôi sẽ bổ sung `changeset-checksums.txt` để `LiquibaseChangelogRulesTest` vẫn pass.

## 8. Kế hoạch kiểm thử

- **Tự động, sau mỗi đợt:**
  - `mvn -o test` bằng Maven đi kèm IntelliJ, `D:/Intell/plugins/maven/lib/maven3/bin/mvn`
  - `npx tsc -b`, `npx oxlint`, `npx vite build` (build ra thư mục tạm để không ghi đè `dist/`)
  - Unit test cho mọi service được sửa, và test ma trận quyền Admin.
- **Thủ công:** cần bạn cung cấp DB dev cùng các tài khoản L1/L2/L3, NCC và khách.
  - Kịch bản Admin theo từng đợt.
  - Hồi quy phía khách: trang chủ, tìm homestay, chi tiết, đặt phòng, đơn của tôi.
  - Hồi quy phía NCC: đăng nhập, lịch phòng, xử lý đơn, sửa homestay.
  - Nếu không có môi trường này, tôi sẽ ghi rõ phần nào "chưa xác minh", không tuyên bố là không ảnh hưởng.

## 9. Tóm tắt thứ tự các đợt

| Đợt | Nội dung | Chạm file dùng chung | Thay đổi DB | Cần chốt |
|---|---|---|---|---|
| 1 | Vá quyền và bắt buộc lý do / chứng từ | `Account.java`, `db.changelog.xml`; script import cũ (nếu duyệt Q4) | changeset 010 | Q2–Q5, Q9 |
| 2 | Tài chính chỉ đọc | 2 repository (chỉ bổ sung) | Không | Q1 |
| 3 | Đơn quá hạn và báo cáo | repository (chỉ bổ sung) | Không | — |
| 4 | NCC, Homestay, Đánh giá | Không | Không | Q8 |
| 5 | Phiên Admin và nhật ký | `JwtAuthenticationFilter`, `DataRetentionService` | Không | Q6 |
| 6 | Module mới | Tùy module | Có | Q7 |
| 7 | Kiểm thử tổng thể | — | — | — |

---

## 10. Tiến độ triển khai

### Đợt 1: đã làm xong ngày 13/10/2026, chưa commit

| Hạng mục | Kết quả |
|---|---|
| **B1** | - Thêm changeset `v2/010-admin-level-required.sql`: gán cấp 1 cho các ADMIN đang NULL, rồi thêm CHECK để ADMIN bắt buộc có cấp 1–3 và tài khoản khác không có cấp. Có `--rollback`.<br>- `Account.effectiveAdminLevel()`: ADMIN thiếu cấp được coi là cấp 3.<br>- `AdminAccountService`: không xác định được người gọi thì từ chối, không còn mặc định cấp 1.<br>- Script nhập dữ liệu cũ: thêm `COALESCE(admin_level, 1)`. |
| **B5** | `BookingsPanel` và `BookingDetailDrawer` ẩn nút xử lý đơn khi người dùng chưa có quyền `operate` (Admin L3). |
| **B6 / Q3** | - Backend: `AdminBookingMonitorService.act` bắt buộc lý do khi từ chối/hủy và chứng từ khi ghi nhận thanh toán. Tối đa 500 ký tự, thiếu thì trả 400.<br>- Frontend: dialog mới `AdminBookingDecisionDialog` (chọn cách thanh toán + nhập mã giao dịch).<br>- **Không sửa** dialog và quy trình của NCC. |
| **B12 / S4** | Bắt buộc lý do khi đặt lại mật khẩu và khi đổi cấp quản trị, ở cả backend và 3 chỗ trên UI: modal đặt lại mật khẩu, cấp lại mật khẩu cho NCC, đổi cấp quản trị. |
| **B7** | Sửa mô tả mục "Đặt phòng", comment trong `adminService.ts`, và danh sách quyền của cấp 2 trong `LEVEL_META`. |
| **Test mới** | - `AdminEndpointAuthorizationTest`: 3 test, 19 endpoint × 7 loại người gọi.<br>- Thêm 3 test cho `AdminAccountServiceTest` và 2 test cho `AdminBookingMonitorServiceTest`. |

**Kết quả kiểm tra**
- `mvn -o test`: 471 test, 0 lỗi (463 cũ + 8 mới).
- `tsc -b`: 0 lỗi.
- `oxlint`: 0 lỗi, 89 cảnh báo, không có cảnh báo mới.
- `vite build`: thành công. Chunk NCC giữ nguyên 333,02 KB.
- Đã kiểm tra đột biến: trả giá trị dự phòng về cấp 1 thì test B1 lỗi đúng như mong đợi.

**Chưa xác minh**
- Chưa chạy changeset trên PostgreSQL thật, vì máy không có Docker hay psql. CI job "Liquibase + schema" sẽ kiểm khi push.
- Chưa thử giao diện trên trình duyệt.

**Lưu ý**
- `AccountRepository.countActiveLevelOneAdmins()` vẫn đếm NULL như cấp 1. Sau changeset 010 thì DB không còn giá trị NULL, nên không có tác động; tôi không sửa vì đây là query cũ trong file dùng chung.

**Trước khi deploy**
1. Sao lưu DB.
2. Chạy `SELECT id, email FROM account WHERE role = 'ADMIN' AND admin_level IS NULL;` để biết những tài khoản sẽ được gán cấp 1.
