# Báo cáo công việc — 16/10/2026

Viết cho chủ dự án. Báo cáo liệt kê những gì đã làm, cách xem thử và những điều cần biết. Hạn chế từ chuyên môn.

> **Việc cần làm khi bạn mở máy:** máy chủ đang chạy ở cổng 8080 là **bản cũ**. Hãy tắt rồi chạy lại để có các tính năng mới.
> Cơ sở dữ liệu trên máy đã được thêm sẵn các bảng mới, nên không phải làm gì thêm.

---

## 1. Hộp "Bạn muốn cung cấp gì?" (giống Airbnb)

- Bấm **"Trở thành nhà cung cấp"** trên thanh trên cùng (máy tính) hoặc trong menu ☰ (điện thoại). Một hộp hiện ra ở giữa màn hình (trên điện thoại thì trượt từ dưới lên).
- Hộp có 3 thẻ, mỗi thẻ có hình 3D: **Homestay** (ngôi nhà), **Trải nghiệm** (lều cắm trại), **Nhà xe** (xe buýt).
- Nút **"Tiếp theo"** chỉ bấm được sau khi đã chọn. Bấm thì mở mẫu đăng ký của đúng loại đó.
- Hình 3D lấy từ bộ biểu tượng miễn phí Fluent Emoji của Microsoft (giấy phép MIT, có ghi nguồn trong thư mục `frontend-pwa/src/assets/fluent`).
- Trước đây "Di chuyển", nay đổi tên thành **"Nhà xe"**. Đường dẫn cũ vẫn mở được.

## 2. Mỗi loại có mẫu đăng ký riêng

Phần chung của cả 3 loại: người đại diện, số điện thoại, mật khẩu, tên cơ sở, địa chỉ. Ngoài ra mỗi loại hỏi thêm:

| Loại | Câu hỏi riêng |
| --- | --- |
| Homestay | Loại nhà (nhà sàn, nhà gỗ, trình tường…), số phòng, số khách tối đa |
| Trải nghiệm | Loại trải nghiệm (trekking, làm nghề, ẩm thực…), thời lượng mỗi lượt, số khách mỗi đoàn, ngôn ngữ hướng dẫn, số thẻ hướng dẫn viên |
| Nhà xe | Loại xe (xe máy, limousine, xe khách…), số xe, tuyến chạy chính, giấy phép kinh doanh vận tải |

- Vào thẳng `/register/partner` (không qua hộp) thì trang hỏi chọn loại hình trước.
- Đang điền có thể bấm "Đổi loại hình".
- Câu trả lời được kiểm tra trên trang và kiểm tra lại ở máy chủ.

## 3. Cả 3 loại đều phải được admin duyệt

Trong trang admin:

- Mục **"Hồ sơ NCC mới"** có thêm bộ lọc **Loại hình**. Mỗi dòng có hình 3D của loại đó.
- Mở một hồ sơ sẽ thấy khung **"Thông tin nhà xe" / "Thông tin trải nghiệm" / "Thông tin homestay"** với đúng các câu trả lời riêng.
- Duyệt xong, đối tác được tạo kèm đúng loại hình.
- Mục **"Đối tác / NCC"** hiện loại hình của từng đối tác và có bộ lọc loại hình.
- Khi admin tự tạo đối tác, có thêm ô chọn loại hình.

## 4. Tài khoản Google chưa có số điện thoại → bắt buộc bổ sung

- Khách đăng nhập mà tài khoản chưa có số điện thoại (thực tế là các tài khoản đăng ký bằng Google trước đây) sẽ thấy hộp **"Bổ sung số điện thoại"**.
- Hộp không tắt được. Lối thoát duy nhất là "Để sau, đăng xuất".
- Số được kiểm tra đúng định dạng và không được trùng với tài khoản khác (kể cả dạng 0… và +84…).
- Tài khoản admin hay nhà cung cấp khi dùng trang khách thì không bị hỏi.

## 5. Cổng đối tác cho nhà xe và nhà cung cấp trải nghiệm

Đăng nhập bằng tài khoản nhà xe hoặc trải nghiệm thì cổng đối tác hiện menu riêng, không còn lịch phòng hay loại phòng:

- **Tổng quan**: số dịch vụ đang hiển thị, chờ duyệt, số combo, yêu cầu đặt mới, số gợi ý đang bật. Mọi con số lấy từ hệ thống.
- **Tuyến xe & dịch vụ** (nhà xe) hoặc **Trải nghiệm của tôi**: đăng từng dịch vụ.
  - Nhà xe khai: loại xe, tuyến (điểm đi → điểm đến), giờ chạy, thời gian đi, số chỗ, giá từ.
  - Trải nghiệm khai: điểm hẹn, thời lượng, số khách mỗi đoàn, ngôn ngữ hướng dẫn, giá từ.
  - Dịch vụ mới và mọi thay đổi đều phải được admin duyệt. Trong lúc chờ duyệt bản sửa, khách vẫn thấy bản cũ.
- **Combo** và **Gợi ý quanh đây** (xem mục 6 và 7).

Chủ homestay vẫn dùng cổng như cũ, có thêm mục Combo và Gợi ý quanh đây.

Sau khi được duyệt, dịch vụ hiện cho khách như sau:

- **Trang "Di chuyển"** hiện đúng loại xe, tuyến, giá của nhà xe đã khai. Trước đây trang tự đoán theo tên và tự đặt giá; nay chỉ còn đoán với dữ liệu cũ chưa khai báo.
- **Trang "Văn hóa"** có thêm mục **"Trải nghiệm bản địa"**. Mục này tự ẩn khi chưa có trải nghiệm nào.

### Tài khoản mẫu để bạn xem thử

Đã tạo sẵn trên cơ sở dữ liệu ở máy. Đăng nhập ở `/portal/login`:

| Loại | Đăng nhập | Mật khẩu |
| --- | --- | --- |
| Nhà xe | `0386000101` hoặc `demo-nhaxe@didulich.test` | `DemoNhaXe@2026` |
| Trải nghiệm | `0386000102` hoặc `demo-trainghiem@didulich.test` | `DemoTraiNghiem@2026` |
| Khách chưa có số điện thoại (để xem hộp ở mục 4) | `demo-khach-chua-sdt@didulich.test` — đăng nhập ở trang khách | `DemoKhach@2026` |

Dữ liệu mẫu đi kèm, tên đều có chữ "(mẫu)":

- 2 dịch vụ nhà xe (limousine Hà Nội – Mù Cang Chải, xe ôm Tú Lệ – Khau Phạ).
- 1 tour trekking.
- 1 combo của admin: "Combo mẫu: Mù Cang Chải 2 ngày 1 đêm".
- 1 combo của nhà xe, đang chờ duyệt.
- 1 yêu cầu đặt combo thử.

Ảnh của dữ liệu mẫu là ảnh minh họa, giống các ảnh có sẵn trên máy bạn. Muốn bỏ thì admin ẩn hoặc xóa trong trang quản trị.

## 6. Gói combo

**Combo gồm:**

- Lịch trình theo từng ngày: giờ, địa điểm, việc làm, ghi chú.
- Giá "từ" mỗi khách và ghi chú giá.
- Số khách mỗi đoàn.
- Mục "Đã bao gồm / Không bao gồm".
- **Ăn uống luôn ghi là không bao gồm.** Thay vào đó trang combo có mục **"Ăn ở đâu?"**:
  - các nhà hàng người tạo combo tự giới thiệu;
  - cộng thêm tối đa 3 nhà hàng hệ thống tự chọn trong vòng 15 km quanh lộ trình, xếp theo đánh giá của khách. Nhà hàng chỉ có 1–2 lượt đánh giá không được xếp lên đầu.

**Trang cho khách:**

- **`/combo`**: danh sách, lọc theo số ngày. Đã thêm mục "Combo" (nhãn "Mới") trên thanh điều hướng.
- **`/combo/<tên>`**: chi tiết, kèm mẫu **"Gửi yêu cầu đặt combo"** (họ tên, số điện thoại, ngày đi, số khách, ghi chú).
  - Chưa thu tiền, chưa giữ chỗ. Người tổ chức gọi lại để chốt.
  - Mỗi máy gửi tối đa 10 yêu cầu mỗi giờ để chống phá.

**Admin** (mục mới **"Combo"**):

- Tạo combo (hiện ngay cho khách), sửa, ẩn/hiện.
- Xóa được combo chưa có ai đặt.
- Duyệt hoặc từ chối combo của nhà cung cấp (bắt buộc ghi lý do khi từ chối).
- Xem yêu cầu đặt và đánh dấu "Đã liên hệ / Đã xong".

Nhà cung cấp cũng tạo được combo. Chi tiết ở báo cáo riêng: [bao-cao-combo-nha-cung-cap.md](bao-cao-combo-nha-cung-cap.md).

## 7. "Gợi ý quanh đây"

Ví dụ: khách đứng trên Sống Lưng Khủng Long → điện thoại hiện thẻ *"Bạn đang ở gần Sống Lưng Khủng Long — Quanh đây có: Trekking Lìm Mông (cách 720 m, từ 350.000 đ/khách)…"*.

**Phía nhà cung cấp** (mục **"Gợi ý quanh đây"** trong cổng đối tác):

- Bật/tắt gợi ý cho từng địa điểm của mình.
- Viết một lời mời ngắn, tối đa 120 ký tự, không được chứa đường link.
- Chọn bán kính 1–30 km.
- Trang cho biết những điểm nổi tiếng nào nằm trong bán kính đó.
- Chỉ địa điểm đã được duyệt và có vị trí trên bản đồ mới bật được.

**Phía khách:**

- Tự bật **"Gợi ý quanh đây"** trong menu ☰. Mặc định là tắt, nên ứng dụng không tự xin vị trí.
- Khi tới gần (trong khoảng 1,5 km) một điểm nổi tiếng, ứng dụng hiện thẻ gợi ý. Mỗi điểm chỉ nhắc một lần mỗi ngày.
- Nếu ứng dụng đang chạy nền và khách đã cho phép thông báo, máy hiện thêm thông báo.

**Riêng tư:** vị trí của khách **không bao giờ gửi lên máy chủ**. Ứng dụng tải danh sách điểm nổi tiếng và các gợi ý về, rồi tự tính khoảng cách ngay trên điện thoại.

**Admin** (mục mới **"Gợi ý quanh đây"**): xem toàn bộ lời mời. **Ẩn** lời mời vi phạm thì phải ghi lý do, nhà cung cấp được báo. Chỉ admin hiện lại được.

## 8. Đã kiểm tra những gì

- **Máy chủ:** 592 bài kiểm tra tự động đều đạt. Trong đó có bài mới cho dịch vụ nhà xe/trải nghiệm, gợi ý quanh đây, combo, chọn nhà hàng, bổ sung số điện thoại.
- **Chạy thật:** một máy chủ thử ở cổng 8081 kết nối cơ sở dữ liệu trên máy (cấu trúc bảng khớp). Đã chạy trọn quy trình:
  1. đăng ký nhà xe và trải nghiệm;
  2. admin duyệt;
  3. nhà cung cấp đăng dịch vụ;
  4. admin duyệt;
  5. bật gợi ý;
  6. tạo combo;
  7. khách gửi yêu cầu đặt.
- **Giao diện:** kiểm tra kiểu dữ liệu không lỗi, đóng gói được. Không có lỗi mới, chỉ còn các cảnh báo cũ.
- **Chụp màn hình bằng trình duyệt chạy ngầm** (máy tính và điện thoại):
  - hộp chọn loại hình, mẫu đăng ký;
  - trang combo;
  - cổng nhà xe;
  - admin duyệt combo và hồ sơ;
  - thẻ gợi ý quanh đây (giả lập đứng ở Sống Lưng Khủng Long);
  - hộp bổ sung số điện thoại.

  Không có lỗi trên trang.
- **Máy chủ thật trên mạng (Supabase):** 3 thay đổi cơ sở dữ liệu mới được viết sẵn và sẽ tự chạy khi triển khai.
  - 013: thông tin dịch vụ;
  - 014: gợi ý quanh đây;
  - 015: combo.

## 9. Những quyết định tôi tự đưa ra (bạn có thể đổi)

- **Lời mời "Gợi ý quanh đây":** hiện ngay khi nhà cung cấp bật, admin ẩn sau nếu vi phạm. Không chờ duyệt trước, vì địa điểm đã được duyệt và lời mời ngắn, không chứa link.
- **Combo:** chỉ nhận **yêu cầu đặt** để gọi lại, chưa thanh toán online, vì giá combo thường phải chốt theo nhóm và ngày.
- **Tài khoản cũ:** tài khoản nhà cung cấp cũ (đăng nhập trước hôm nay) được coi là Homestay. Nếu admin đổi loại hình, đối tác cần đăng xuất rồi đăng nhập lại.
- **Không commit:** chưa commit gì vào git; mọi thay đổi để bạn xem trước.

## 10. Còn lại / gợi ý tiếp theo

- Trang chi tiết của từng tuyến xe/trải nghiệm vẫn dùng trang chi tiết địa điểm chung. Sau này có thể làm trang riêng hiện giờ chạy, số chỗ…
- Kế hoạch các ý tưởng nâng cấp khác: [ke-hoach-y-tuong-nang-cap.md](ke-hoach-y-tuong-nang-cap.md).

---

## Cập nhật: giao diện riêng cho từng loại nhà cung cấp và trang đăng ký mới

**Cổng đối tác: mỗi loại một giao diện**

| | Homestay | Nhà xe | Trải nghiệm |
| --- | --- | --- | --- |
| Màu chủ đạo | Xanh lúa (như cũ) | Xanh chàm | Đỏ đất (màu thổ cẩm) |
| Tên không gian | Không gian chủ homestay | Không gian nhà xe | Không gian trải nghiệm |
| Trang đầu | Lịch phòng | **Bảng điều hành**: dải chỉ số, bảng tuyến đang chạy, việc cần làm | **Tổng quan trải nghiệm**: lời chào, thẻ ảnh trải nghiệm, cột việc cần làm |
| Menu | Hằng ngày / Cơ sở của tôi / Bán thêm / Kết quả | Điều hành / Bán thêm | Trải nghiệm / Bán thêm |
| Danh sách dịch vụ | — | Dạng **bảng tuyến**: điểm đi → điểm đến, ô giờ chạy, loại xe, số chỗ, giá vé | Dạng **thẻ ảnh**: thời lượng, số khách mỗi đoàn, ngôn ngữ, điểm hẹn, giá |

Một số chi tiết khác:

- Đầu menu có thẻ loại hình kèm hình 3D. Trên điện thoại, thanh trên cùng hiện nhãn loại hình.
- Các hộp thoại (sửa dịch vụ, combo…) cũng đổi màu theo loại hình.
- Trang "Tổng quan" của homestay có thêm đầu trang riêng.
- Nút "Thêm tuyến xe" / "Thêm trải nghiệm" / "Tạo combo" ở trang đầu mở thẳng mẫu nhập.
- **Sửa lỗi cũ:** trước đây viền các khung trong cổng đối tác hiện gần màu đen, vì bộ màu thiếu màu "đường kẻ". Nay viền nhạt, đúng ý thiết kế. Phía khách và admin không đổi.

**Trang đăng ký nhà cung cấp làm lại toàn bộ**

- **Thanh trên cùng riêng:** logo, "Đăng ký đối tác", Về trang chủ, Đăng nhập.
- **Máy tính:** cột trái là hình 3D lớn của loại hình, các bước đăng ký có đánh dấu đã xong, và khung "Sau khi được duyệt" (những việc bạn làm được với loại hình đó). Cột phải là mẫu nhập.
- **Điện thoại:** đầu trang gọn ghi "Bước 2/4 · Người đại diện", có thanh tiến trình.
- **Chia 4 bước:**
  1. Chọn loại hình (bỏ qua nếu mở từ hộp chọn);
  2. Người đại diện: tên, số điện thoại, email, mật khẩu;
  3. Thông tin cơ sở: tên, địa chỉ, câu hỏi riêng của loại hình, giới thiệu;
  4. Xem lại & gửi, từng phần có nút "Sửa" quay về đúng bước.
- **Báo lỗi:** báo ngay dưới từng ô, không cho sang bước sau khi còn lỗi. Số điện thoại hoặc email bị trùng thì tự quay về bước 2 và báo dưới ô.
- **Màu** đổi theo loại hình đang đăng ký.
- **Đã gửi / Tra cứu trạng thái:** dùng cùng khung mới, có hình loại hình.

Trang đăng ký của khách du lịch giữ nguyên.

**Đã kiểm tra:**

- 592 bài kiểm tra máy chủ đều đạt.
- Kiểm tra kiểu và đóng gói giao diện không lỗi.
- Đã chụp màn hình cả 3 cổng và các bước đăng ký trên máy tính và điện thoại, không có lỗi trên trang.
