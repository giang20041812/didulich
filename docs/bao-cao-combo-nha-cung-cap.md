# Báo cáo riêng: Nhà cung cấp tự tạo combo

Bạn yêu cầu: "chỉ admin mới thêm được combo; nếu được thì cho phía cung cấp cũng thêm combo, phần này cần báo cáo riêng". Đây là báo cáo đó.

## Tóm tắt

- **Admin** tạo combo thì combo **hiện ngay** cho khách.
- **Nhà cung cấp** (homestay, nhà xe, trải nghiệm) tạo combo thì combo **chờ admin duyệt**. Khách chỉ thấy sau khi admin bấm Duyệt.
- Nhà cung cấp **không thể tự hiện combo**. Nút duyệt chỉ có ở trang admin, và máy chủ cũng chặn.

## Nhà cung cấp làm được gì

Trong cổng đối tác, mục **Combo**:

1. **Tạo combo**, dùng chung mẫu nhập với admin:
   - tên, mô tả, số ngày/đêm, giá từ mỗi khách, số khách mỗi đoàn, ảnh bìa;
   - lịch trình từng ngày (giờ, địa điểm, việc làm, ghi chú);
   - mục đã/không bao gồm, nhà hàng giới thiệu.

   Combo có thể ghép dịch vụ của chính họ với homestay, điểm tham quan, nhà xe khác đang hiển thị trên web. Gửi đi thì trạng thái là **Chờ duyệt**.
2. **Sửa combo:**
   - Combo chưa duyệt hoặc bị từ chối: sửa xong gửi lại, về Chờ duyệt.
   - Combo **đã duyệt**: bản sửa được giữ riêng chờ admin duyệt. **Khách vẫn thấy bản cũ** cho đến khi admin duyệt bản sửa. Gửi bản sửa mới thì thay bản đang chờ.
3. **Tạm ngừng bán / Bán lại** combo đã duyệt mà không cần duyệt, ví dụ khi hết mùa.
4. **Xem yêu cầu đặt** combo của mình. Gọi lại khách theo số điện thoại rồi đánh dấu "Đã liên hệ / Đã xong".

Nhà cung cấp **không** làm được:

- tự duyệt;
- xóa combo;
- xem combo hay yêu cầu đặt của nhà cung cấp khác. Mở combo không phải của mình thì hệ thống báo "Không tìm thấy".

## Admin kiểm soát thế nào

Mục **Combo** trong trang admin:

- **Lọc:** Chờ duyệt (gồm cả combo đang có bản sửa chờ duyệt), Đã duyệt, Bị từ chối, Đang ẩn. Lọc thêm theo nguồn: Admin tạo / Nhà cung cấp.
- **Bấm "Xem":** xem toàn bộ lịch trình mà không cần mở mẫu sửa. Nếu có bản sửa chờ duyệt, hiện bản sửa phía trên và bản đang hiển thị phía dưới để so.
- **Duyệt / Từ chối:**
  - Từ chối bắt buộc ghi lý do 10–500 ký tự. Nhà cung cấp nhận thông báo kèm lý do.
  - **Duyệt bản sửa:** hệ thống kiểm tra lại toàn bộ trước khi áp dụng, ví dụ một địa điểm trong lịch trình đã bị ẩn từ lúc gửi.
- **Sửa trực tiếp** combo của nhà cung cấp: áp dụng ngay, có ghi nhật ký.
- **Ẩn/Hiện:** ẩn thì nhà cung cấp được báo.
- **Xóa:** chỉ xóa được combo chưa có yêu cầu đặt nào. Combo đã có khách đặt chỉ ẩn được, để giữ lịch sử.
- **Nhật ký:** mọi thao tác duyệt, từ chối, ẩn, xóa đều ghi vào mục **Hoạt động** (ai làm, lúc nào, lý do).

## Khi nào khách thấy một combo

Phải đủ cả 4 điều kiện:

1. đã được duyệt;
2. admin không ẩn;
3. nhà cung cấp không tạm ngừng;
4. nhà cung cấp đang hoạt động (không bị khóa).

## Thông báo

| Ai nhận | Khi nào |
| --- | --- |
| Admin | Nhà cung cấp gửi combo mới / bản sửa; khách gửi yêu cầu đặt |
| Nhà cung cấp | Combo được duyệt / bị từ chối (kèm lý do) / bị ẩn / bị xóa; có khách gửi yêu cầu đặt combo của mình |

## Ăn uống và nhà hàng

- Combo luôn ghi "Không bao gồm ăn uống", người tạo không đổi được.
- Nhà cung cấp chọn tối đa 10 nhà hàng để giới thiệu. Hệ thống tự thêm tối đa 3 nhà hàng quanh lộ trình (trong 15 km), xếp theo đánh giá của khách.

## Đã kiểm tra

Bài kiểm tra tự động:

- nhà cung cấp tạo combo thì vào Chờ duyệt;
- sửa combo đã duyệt thì khách vẫn thấy bản cũ;
- không mở được combo của người khác;
- duyệt / từ chối bản sửa;
- điều kiện hiển thị;
- yêu cầu đặt: ngày đi không ở quá khứ, số khách theo combo, số điện thoại;
- không xóa được combo đã có yêu cầu đặt.

Chạy thật trên máy: tài khoản nhà xe mẫu đã tạo "Combo mẫu của nhà xe: Hà Nội – Tú Lệ 2 ngày". Combo đang **Chờ duyệt** để bạn thử bấm Duyệt hoặc Từ chối trong trang admin.

## Nếu bạn muốn tắt quyền tạo combo của nhà cung cấp

Chỉ cần ẩn mục "Combo" trong menu cổng đối tác (`PartnerLayout.tsx`, `PartnerBottomNav.tsx`). Muốn chặn hẳn thì bỏ các đường dẫn `/api/v1/partner/combos` ở máy chủ (`ComboController.java`). Phần admin không bị ảnh hưởng.
