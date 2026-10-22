# Báo cáo: thay toàn bộ ảnh bằng ảnh thật + làm lại phần đầu trang chủ

Ngày 17/10/2026 · chưa commit.

## Tóm tắt

- **Trước đây ảnh sai ở ba chỗ:**
  - Toàn bộ ảnh trong cơ sở dữ liệu là ảnh ngẫu nhiên `picsum.photos`, nên "Đèo Khau Phạ" có thể hiện ảnh bờ biển hay thành phố.
  - Tệp `lib/placeImages.ts` thay ảnh theo tên địa điểm bằng ảnh Unsplash chung chung nhưng ghi là "100% ảnh thật". Ví dụ: Rừng trúc hiện ảnh bãi biển nhiệt đới, Tà Xùa bị gán vào Sống Lưng Khủng Long.
  - Các trang danh sách và trang đăng nhập dùng ảnh Unsplash không phải Tây Bắc.
- **Bây giờ:** 36 ảnh thật lấy từ Wikimedia Commons và Flickr, đều theo giấy phép cho phép dùng: CC0, phạm vi công cộng, CC BY, CC BY-SA. Mỗi ảnh tôi đã **xem tận mắt** để chắc chụp đúng nơi hoặc đúng món, và ghi tác giả, giấy phép, đường dẫn gốc.
- **Ảnh không còn bị thay theo tên.**
  - Địa điểm nào chưa có ảnh đúng thì hiện ô trống, không mượn ảnh nơi khác. Hiện có 2 nơi như vậy: *Rừng trúc Mồ Dề* và *Đồi Kim Nọi*.
  - Ảnh "khu vực" hoặc "minh họa" đều ghi rõ trong chú thích.
- **Trang chủ** (theo yêu cầu bổ sung: *giữ ảnh cũ*, chỉ thêm chuyển động cho sống động):
  - Ảnh nền vẫn là ảnh ruộng bậc thang cũ. Tôi dựng lại từ bản gốc lớn hơn (`public/images/hero-home.jpg`, 1536 px) để nét hơn bản 1440 px trước đây.
  - Chuyển động bám đúng các chi tiết trong ảnh:
    - cả khung ảnh trôi chậm;
    - mặt trời sáng dịu theo nhịp thở, tia nắng xoay rất chậm;
    - mây trong thung lũng lững lờ trôi;
    - vệt nắng lướt qua ruộng lúa như gió thổi;
    - khóm lúa cao ở góc phải đung đưa;
    - khi cuộn trang, ảnh lùi chậm hơn chữ (tạo chiều sâu).
  - Dòng **"đi khắp mọi nơi"** hiện sau khoảng **3,6 giây**, viết tay ngay dưới chữ "Đi Du Lịch", rồi giữ nguyên.
- **Trang mới `/nguon-anh` ("Nguồn ảnh")**, có link ở chân trang, liệt kê tác giả và giấy phép từng ảnh. Ảnh CC BY và CC BY-SA bắt buộc phải ghi như vậy.

## Trang chủ — chi tiết hiệu ứng

| Thành phần | Cách làm |
|---|---|
| Ảnh nền | Ảnh cũ, hai bản:<br>`hero-home-1536.webp` (bản gốc).<br>`hero-home-2304.webp` (phóng Lanczos + làm nét nhẹ, cho màn hình lớn và điện thoại mật độ cao).<br>Ảnh được tải trước ngay khi mở trang chủ (`main.tsx`). |
| Khung ảnh | Mọi lớp hiệu ứng nằm trong một khung cùng tỉ lệ 3:2 với ảnh, phủ kín phần đầu trang. Nhờ vậy mặt trời, mây, lúa luôn trùng đúng chỗ trong ảnh ở mọi cỡ màn hình.<br>Điện thoại dựng đứng: khung dời sang phải để thấy phần trời nắng và nhà sàn. |
| Ảnh trôi chậm | Phóng to từ 102% lên 109% trong 36 giây, chạy qua lại liên tục. |
| Mặt trời | Quầng sáng ấm ở đúng vị trí mặt trời trong ảnh (88%, 28,5%), sáng lên rồi dịu xuống mỗi 6,5 giây.<br>Tia nắng mờ xoay một vòng trong 140 giây. |
| Mây thung lũng | Hai dải mây trắng mờ trôi ngang trong 34 và 47 giây, đúng chỗ có mây trong ảnh. |
| Gió lướt ruộng lúa | Một vệt sáng mềm lướt ngang phần ruộng lúa, 10 giây một lần. |
| Lúa đung đưa | Khóm lúa cao ở góc phải dưới nghiêng nhẹ quanh gốc (dưới 1 độ), viền hòa vào ảnh nền. |
| Cuộn trang | Ảnh lùi chậm hơn nội dung (30%), tạo chiều sâu. |
| Chữ | Logo, tiêu đề, mô tả và ô tìm kiếm hiện dần, lần lượt cách nhau 0,12 / 0,26 / 0,42 giây. |
| "đi khắp mọi nơi" | Sau 3,6 giây hiện dần trong 1,6 giây: từ nhòe sang rõ, nhích lên 10 px, khoảng cách chữ co lại.<br>Chỗ của dòng này được giữ sẵn từ đầu nên bố cục không bị đẩy. |
| Giảm chuyển động | Người dùng bật "giảm chuyển động" thì mọi lớp đứng yên và không có hiệu ứng cuộn. Dòng "đi khắp mọi nơi" vẫn hiện sau 3,6 giây nhưng chỉ hiện ra, không trượt. |

Đã kiểm tra bằng Chrome không giao diện:
- Khung ảnh phủ kín phần đầu trang ở 1440×900, 1920×1080, 800×900 và điện thoại 390×844.
- Máy tính 1440 px tải bản 1536. Màn 1920 px và điện thoại tải bản 2304.
- Dòng phụ: lúc 1,5 giây còn ẩn, lúc khoảng 6 giây đã hiện hẳn.
- Cuộn 400 px thì ảnh lùi 120 px.
- Bật giảm chuyển động thì không còn chuyển động nào.

## Ảnh đã dùng

Cột "Mức khớp":
- **Đúng nơi / đúng món**: ảnh chụp chính nơi hoặc món đó.
- **Ảnh khu vực**: ảnh cùng xã hoặc huyện, vì chưa có ảnh mở chụp đúng điểm đó.
- **Minh họa**: ảnh món ăn hoặc dịch vụ cùng loại. Ví dụ ảnh xe ôm, hoặc ảnh món gà đen cho một quán gà đen.

### Địa điểm

| Địa điểm | Ảnh bìa (ảnh thật chụp gì — tác giả, giấy phép) | Mức khớp | Số ảnh |
|---|---|---|---|
| Đèo Khau Phạ | Ruộng bậc thang dưới đèo Khau Phạ, Mù Cang Chải — Doan Tuan (Unsplash), [CC0](https://commons.wikimedia.org/wiki/File:Khau_Ph%E1%BA%A1_Pass,_Vietnam_(Unsplash).jpg) | Đúng nơi / đúng món | 4 |
| Đồi Mâm Xôi | Đồi Mâm Xôi ở La Pán Tẩn mùa lúa chín — minhphuc_99kdd, [Public Domain Mark 1.0](https://www.flickr.com/photos/36755450@N05/23563013701/) | Đúng nơi / đúng món | 2 |
| Đồi Móng Ngựa | Ruộng bậc thang ở xã La Pán Tẩn — jihadv, [CC BY 2.0](https://commons.wikimedia.org/wiki/File:Lapantan.jpg) | Ảnh khu vực | 2 |
| Đồi Kim Nọi (Háng Đăng Dề) | Chưa có ảnh có giấy phép mở — hiện ô trống | — | 0 |
| Sống Lưng Khủng Long | Ruộng bậc thang mùa nước đổ ở xã Dế Xu Phình — Gió Đông, [Public domain](https://commons.wikimedia.org/wiki/File:Mu_Cang_Chai_02.JPG) | Ảnh khu vực | 1 |
| Rừng trúc Mồ Dề | Chưa có ảnh có giấy phép mở — hiện ô trống | — | 0 |
| Thung lũng Tú Lệ | Thung lũng Tú Lệ lúc nắng chiều — An Bui (Vietnam Photo Tours), [CC BY 2.0](https://commons.wikimedia.org/wiki/File:Tu_Le,_Yen_Bai.jpg) | Đúng nơi / đúng món | 2 |
| Đồi chè cổ thụ Suối Giàng | Cây chè Shan tuyết cổ thụ ở Suối Giàng — Viethavvh, [Public domain](https://commons.wikimedia.org/wiki/File:Suoi_Giang_tea.JPG) | Đúng nơi / đúng món | 3 |
| Quán Gà Đen A Dế | Canh gà đen (ảnh minh họa món gà xương đen) — Taiyo Fujii, [CC BY 2.0](https://www.flickr.com/photos/84326824@N00/761686172/) | Minh họa (ảnh món, không phải ảnh quán) | 2 |
| Nhà hàng Xôi Tú Lệ | Xôi ngũ sắc của người Thái (chụp ở Sơn La) — Khương Việt Hà, [Public domain](https://commons.wikimedia.org/wiki/File:X%C3%B4i_ng%C5%A9_s%E1%BA%AFc.JPG) | Minh họa (ảnh món, không phải ảnh quán) | 2 |
| Chợ phiên Mù Cang Chải | Gia đình người Mông xuống chợ ở Mù Cang Chải — Vũ Hùng (Panoramio), [CC BY-SA 3.0](https://commons.wikimedia.org/wiki/File:C%E1%BA%A2_NH%C3%80_XU%E1%BB%90NG_CH%E1%BB%A2_-_panoramio.jpg) | Đúng nơi / đúng món | 2 |
| Limousine Hà Nội – Mù Cang Chải (mẫu) | Đường vào thị trấn Mù Cang Chải — Viethavvh, [Public domain](https://commons.wikimedia.org/wiki/File:Mu_Cang_Chai.jpg) | Minh họa (dịch vụ mẫu) | 1 |
| Xe ôm Tú Lệ – Khau Phạ (mẫu) | Xe ôm chở khách (ảnh minh họa) — Bảo Trí Nguyễn, [CC BY 2.0](https://commons.wikimedia.org/wiki/File:B%C3%A1c_xe_%C3%B4m_ch%E1%BB%9F_kh%C3%A1ch.jpg) | Minh họa (dịch vụ mẫu) | 2 |
| Trekking ruộng bậc thang Lìm Mông (mẫu) | Ruộng bậc thang thung lũng Lìm Mông mùa lúa chín — jihadv, [CC BY 2.0](https://commons.wikimedia.org/wiki/File:Limmong1.jpg) | Đúng nơi / đúng món | 2 |
| A Chu Homestay | Thị trấn Mù Cang Chải mùa lúa chín — Khoitran1957, [CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Mu_Cang_Chai_Town_-_Yen_Bai_-_Vietnam.jpg) | Ảnh khu vực (homestay mẫu) | 3 |
| La Pán Tẩn View | Hiên nhà người Mông nhìn ra ruộng bậc thang, xã La Pán Tẩn — Water Alternatives Photos (nguồn: Pixabay), [CC0 1.0](https://www.flickr.com/photos/143925215@N04/33571997038/) | Ảnh khu vực (homestay mẫu) | 3 |
| Tú Lệ Garden Homestay | Thung lũng Tú Lệ nhìn từ khu Nước Nóng, xã Tú Lệ — Dương Quỳnh Mai, [CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Le_Champ_image_-_taken_07042024.jpg) | Ảnh khu vực (homestay mẫu) | 3 |
| Mồ Dề Bamboo House | Sáng sớm ở Mù Cang Chải — Vũ Hùng (Panoramio), [CC BY-SA 3.0](https://commons.wikimedia.org/wiki/File:S%C3%81NG_S%E1%BB%9AM_%E1%BB%9E_M%C3%99_CANG_CH%E1%BA%A2I_-_panoramio.jpg) | Ảnh khu vực (homestay mẫu) | 3 |
| Khau Phạ Cloud Hill | Thung lũng Cao Phạ nhìn từ trên đèo Khau Phạ — Victor311, [CC BY 4.0](https://commons.wikimedia.org/wiki/File:Khau_Ph%E1%BA%A1_nh%C3%ACn_t%E1%BB%AB_tr%C3%AAn_cao.jpg) | Ảnh khu vực (homestay mẫu) | 3 |
| Kim Nọi Retreat (bản nháp) | Đường vào thị trấn Mù Cang Chải — Viethavvh, [Public domain](https://commons.wikimedia.org/wiki/File:Mu_Cang_Chai.jpg) | Ảnh khu vực (homestay mẫu) | 3 |
| Nhà sàn Chế Cu Nha | Ruộng bậc thang xã Chế Cu Nha — Tiên Ông (Panoramio), [CC BY-SA 3.0](https://commons.wikimedia.org/wiki/File:Ch%E1%BA%BF_Cu_Nha,_M%C3%B9_Cang_Ch%E1%BA%A3i,_Y%C3%AAn_B%C3%A1i,_Vietnam_-_panoramio.jpg) | Ảnh khu vực (homestay mẫu) | 3 |

### Món ăn

| Món | Ảnh | Mức khớp |
|---|---|---|
| Cá suối nướng | Cá nướng kiểu Tây Bắc (pa pỉnh tộp) — Phương Huy, [CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Khu_%E1%BA%A9m_th%E1%BB%B1c_B%E1%BA%BFn_Ngh%C3%A9_ng13th8n2023_(c%C3%A1_n%C6%B0%E1%BB%9Bng_T%C3%A2y_B%E1%BA%AFc_Pa_t%E1%BB%89nh_t%E1%BB%99p)_(7).jpg) | Minh họa |
| Cốm Tú Lệ | Cốm non (ảnh minh họa món cốm) — Bình Giang, [Public domain](https://commons.wikimedia.org/wiki/File:Com.JPG) | Minh họa |
| Gà đen Mù Cang Chải | Canh gà đen (ảnh minh họa món gà xương đen) — Taiyo Fujii, [CC BY 2.0](https://www.flickr.com/photos/84326824@N00/761686172/) | Minh họa |
| Thịt lợn bản kẹp que nướng | Lợn bản nướng nguyên con ở Sa Pa (ảnh minh họa món lợn bản nướng) — @felixtriller, [CC BY 2.0](https://www.flickr.com/photos/21480682@N03/5058525120/) | Minh họa |
| Xôi nếp Tú Lệ ngũ sắc | Xôi ngũ sắc của người Thái (chụp ở Sơn La) — Khương Việt Hà, [Public domain](https://commons.wikimedia.org/wiki/File:X%C3%B4i_ng%C5%A9_s%E1%BA%AFc.JPG) | Đúng nơi / đúng món |
| Thắng cố | Chảo thắng cố — Alpha, [CC BY-SA 2.0](https://commons.wikimedia.org/wiki/File:Th%E1%BA%AFng_c%E1%BB%91.jpg) | Đúng nơi / đúng món |

### Lễ hội

| Lễ hội | Ảnh bìa | Mức khớp |
|---|---|---|
| Lễ hội Mùa vàng Mù Cang Chải | Ruộng bậc thang xã Chế Cu Nha mùa lúa chín — Doan Tuan (Unsplash), [CC0](https://commons.wikimedia.org/wiki/File:Terraces_in_Che_Cu_Nha_commune,_Mu_Cang_Chai_(Unsplash).jpg) | Ảnh khu vực |
| Tết của người Mông | Phụ nữ Mông mặc trang phục truyền thống dịp Tết (chụp ở Bắc Hà, Lào Cai) — DTH-BD-NVT, [CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Hmong_women_with_traditional_costume.jpg) | Đúng nơi / đúng món |
| Lễ hội bay dù lượn Khau Phạ | Dù lượn cất cánh từ đèo Khau Phạ, nhìn xuống bản Lìm Mông — Motbit, [CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Nh%E1%BA%A3y_d%C3%B9_l%C6%B0%E1%BB%A3n_t%E1%BB%AB_%C4%91%C3%A8o_Khau_Ph%E1%BA%A1_ng%E1%BA%AFm_b%E1%BA%A3n_L%C3%ACm_m%C3%B4ng.jpg) | Đúng nơi / đúng món |

### Ảnh giao diện (đóng gói trong app, `frontend-pwa/src/assets/photos/`)

| Vị trí | Ảnh | Tệp |
|---|---|---|
| Ảnh đầu trang Điểm đến | Ruộng bậc thang xã La Pán Tẩn trong sương — Văn Ngọc Tăng (Unsplash), [CC0](https://commons.wikimedia.org/wiki/File:La_P%C3%A1n_T%E1%BA%A9n_Agriculture_(Unsplash).jpg) | `banner-destinations.webp` |
| Ảnh đầu trang Văn hóa – Lễ hội | Phụ nữ Mông mặc trang phục truyền thống dịp Tết (chụp ở Bắc Hà, Lào Cai) — DTH-BD-NVT, [CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Hmong_women_with_traditional_costume.jpg) | `banner-culture.webp` |
| Ảnh đầu trang Nhà hàng | Nấu thắng cố ở chợ phiên vùng cao — Zennysmile, [CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Thang_Co_(Cattle_Intestines_Soup).jpg) | `banner-restaurants.webp` |
| Ảnh đầu trang Đặc sản | Xôi nếp đựng trong ép của người Thái — Hà Nghĩa VN, [CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:X%C3%B4i_n%E1%BA%BFp_c%E1%BB%A7a_ng%C6%B0%E1%BB%9Di_Th%C3%A1i_b%E1%BA%A3n_Phe.jpg) | `banner-specialties.webp` |
| Ảnh đầu trang Di chuyển | Quốc lộ 32 vắt qua đèo Khau Phạ (ảnh năm 2005) — Viethavvh, [Public domain](https://commons.wikimedia.org/wiki/File:Khau_Ph%E1%BA%A1.jpg) | `banner-transport.webp` |
| Ảnh đầu trang Tiện ích | Đường vào thị trấn Mù Cang Chải — Viethavvh, [Public domain](https://commons.wikimedia.org/wiki/File:Mu_Cang_Chai.jpg) | `banner-utilities.webp` |
| Ảnh đầu trang Homestay | Thị trấn Mù Cang Chải mùa lúa chín — Khoitran1957, [CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Mu_Cang_Chai_Town_-_Yen_Bai_-_Vietnam.jpg) | `banner-homestays.webp` |
| Ảnh đầu trang Cẩm nang | Thung lũng Tú Lệ lúc nắng chiều — An Bui (Vietnam Photo Tours), [CC BY 2.0](https://commons.wikimedia.org/wiki/File:Tu_Le,_Yen_Bai.jpg) | `banner-guide.webp` |
| Ảnh nền trang đăng nhập / đăng ký | Ruộng bậc thang xã Chế Cu Nha mùa lúa chín — Doan Tuan (Unsplash), [CC0](https://commons.wikimedia.org/wiki/File:Terraces_in_Che_Cu_Nha_commune,_Mu_Cang_Chai_(Unsplash).jpg) | `banner-auth.webp` |

## Những chỗ cần biết

1. **Hai điểm chưa có ảnh:** *Rừng trúc Mồ Dề* và *Đồi Kim Nọi*.
   - Tôi đã tìm trên Wikimedia Commons, Openverse (gom ảnh mở từ Flickr và nhiều nguồn khác) và tìm kiếm web, nhưng không có ảnh nào vừa đúng nơi vừa cho phép dùng.
   - Ảnh trên các trang báo và trang du lịch đều có bản quyền nên không lấy.
   - Giao diện hiện ô trống "chưa có ảnh". Khi nào có ảnh do nhóm tự chụp hoặc chủ dịch vụ tải lên thì thay.
2. **Ảnh khu vực:**
   - *Đồi Móng Ngựa* dùng ảnh ruộng bậc thang La Pán Tẩn.
   - *Sống Lưng Khủng Long* dùng ảnh ruộng bậc thang mùa nước đổ ở xã Dế Xu Phình.
   - Chú thích trong cơ sở dữ liệu ghi rõ "Ảnh khu vực… chưa có ảnh đúng…".
3. **Homestay, quán ăn và dịch vụ "(mẫu)" là dữ liệu thử, không có thật**, nên ảnh của chúng chỉ là ảnh khu vực hoặc minh họa.
   - Ảnh phòng: phòng "view ruộng bậc thang" dùng ảnh cảnh vật khu đó. Phòng gia đình và phòng tập thể dùng ảnh minh họa bên trong một ngôi nhà gỗ người Mông.
   - Khi chủ homestay thật tải ảnh của họ lên, ảnh của họ sẽ được dùng.
4. **Món ăn:** "Thắng cố" và "Xôi ngũ sắc" là ảnh đúng món. Bốn món còn lại là ảnh minh họa cùng món, không chụp ở Mù Cang Chải:
   - cốm non;
   - cá nướng kiểu Tây Bắc;
   - canh gà xương đen;
   - lợn bản nướng ở Sa Pa.
5. **Ảnh lấy trực tiếp từ máy chủ Wikimedia và Flickr.** Đường dẫn được lưu trong cơ sở dữ liệu.
   - Wikimedia chỉ cho tải ảnh thu nhỏ ở các bề rộng chuẩn 330, 500, 960, 1280, 1920 px. `lib/mediaUrl.ts` tự chọn bề rộng vừa đủ: thẻ nhỏ không tải ảnh 1920 px, còn trang chi tiết vẫn nét.
   - Với Flickr, `mediaUrl.ts` chọn các cỡ 320, 640 hoặc 1024 px.
   - Tôi đã thử từng biến thể: 121/121 đường dẫn trả về ảnh.
   - Service worker lưu đệm thêm ảnh từ hai máy chủ này để lần sau mở nhanh hơn.
6. **Toạ độ trong dữ liệu mẫu có vẻ lệch.** Đây là việc riêng, chưa sửa.
   - Ví dụ: ảnh La Pán Tẩn có GPS khoảng 21,78° N, 104,17° E, còn dữ liệu mẫu đặt La Pán Tẩn ở 21,87° N, 104,06° E.
7. **Ảnh nền trang chủ được giữ nguyên ảnh cũ**, chỉ thêm chuyển động. Tệp `src/assets/hero-home.webp` (bản 1440 px cũ) không còn được nạp, vì trang chủ dùng hai bản mới dựng từ cùng ảnh. Có thể xoá; tôi để lại để bạn quyết.

## Áp dụng cho cơ sở dữ liệu

- **MySQL ở máy này:** đã chạy `docs/sql/anh-that-du-lieu-mau.sql`.
  - Kết quả: 36 ảnh, 46 liên kết ảnh địa điểm, 8 ảnh món, 18 ảnh phòng, 3 ảnh bìa lễ hội.
  - Không còn ảnh picsum nào.
  - Trước khi chạy, tôi đã sao lưu 5 bảng ảnh vào thư mục tạm của phiên. Bản này chỉ chứa đường dẫn picsum cũ nên không cần giữ lâu.
- **Cơ sở dữ liệu khác:**
  - Script viết cho MySQL và nhận diện địa điểm theo `slug` hoặc tên, không theo id. Chạy lại nhiều lần vẫn an toàn.
  - Script chỉ xoá liên kết tới ảnh picsum và ảnh `external/*` do chính nó tạo. Ảnh nhà cung cấp tải lên không bị đụng tới.
  - Bản chạy thật (PostgreSQL, ảnh trên Supabase) cần sửa cú pháp trước, và **không nên chạy** nếu ở đó đã có ảnh thật của nhà cung cấp.

## Tệp thay đổi

**Frontend (`frontend-pwa/src`):**

- Thêm mới:
  - `components/home/HeroBackdrop.tsx`: nền hero, các lớp chuyển động và hiệu ứng cuộn.
  - `lib/heroImages.ts`: danh sách bản ảnh hero.
  - `assets/hero-home-1536.webp`, `assets/hero-home-2304.webp`: ảnh cũ dựng lại từ bản gốc.
  - `lib/photoCredits.ts`: dữ liệu trang nguồn ảnh, sinh tự động.
  - `pages/customer/PhotoCreditsPage.tsx`: trang `/nguon-anh`.
  - `assets/photos/*.webp`: 15 ảnh đóng gói.
- Sửa:
  - `pages/home/HomePage.tsx`: hero mới và dòng "đi khắp mọi nơi".
  - `styles/globals.css`: hiệu ứng hero.
  - `main.tsx`: tải trước ảnh hero.
  - `lib/mediaUrl.ts`: chọn cỡ ảnh Commons và Flickr.
  - `lib/placeImages.ts`: viết lại, bỏ thay ảnh theo tên.
  - `components/ui/CompactPlaceCard.tsx`, `pages/customer/homestay/HomestayDetailPage.tsx`: bỏ đoán ảnh.
  - Ảnh đầu trang 8 trang, mỗi trang lấy ảnh tương ứng trong bảng trên:
    - `pages/customer/culture/DestinationListPage.tsx`, `pages/customer/culture/CultureFestivalPage.tsx`
    - `pages/customer/services/RestaurantListPage.tsx`, `pages/customer/services/SpecialtyListPage.tsx`
    - `pages/customer/services/TransportListPage.tsx`, `pages/customer/services/UtilityListPage.tsx`
    - `pages/customer/homestay/HomestayListPage.tsx`, `pages/customer/guide/TravelGuidePage.tsx`
  - `components/auth/AuthShell.tsx`: ảnh trang đăng nhập.
  - `components/booking/BookingReviewModal.tsx`: ảnh khách tải lên bị lỗi thì để trống, không thay bằng ảnh phong cảnh lạ.
  - Ảnh nhỏ đi qua `mediaUrl` với bề rộng phù hợp:
    - `pages/customer/combo/ComboListPage.tsx`, `pages/customer/combo/ComboDetailPage.tsx`
    - `components/nearby/NearbySuggestionWatcher.tsx`, `components/trip/PlaceThumb.tsx`, `components/home/NearMePanel.tsx`
  - `components/layout/Footer.tsx`: thêm link "Nguồn ảnh".
  - `routes/AppRoutes.tsx`: route `/nguon-anh`.

**Cấu hình:** `frontend-pwa/vite.config.ts` thêm hai máy chủ ảnh vào bộ nhớ đệm của service worker.

**Tài liệu:** báo cáo này và `docs/sql/anh-that-du-lieu-mau.sql`.

## Kiểm tra đã chạy

- `tsc` sạch. `oxlint` 0 lỗi; các cảnh báo đều có từ trước, không nằm ở dòng mới sửa. `vite build` thành công.
- Chrome không giao diện, backend thử ở cổng 8081, bản build ở cổng 4174. Đã kiểm tra:
  - trang chủ trên máy tính và điện thoại, cả khi bật giảm chuyển động;
  - danh sách và chi tiết điểm đến: Khau Phạ, Mâm Xôi, Mồ Dề (trang không ảnh vẫn gọn);
  - đặc sản, thắng cố, văn hoá, lễ hội dù lượn, homestay (danh sách và chi tiết);
  - nhà hàng, di chuyển, tiện ích, cẩm nang, đăng nhập, combo, trang nguồn ảnh (máy tính và điện thoại).
- Kết quả: **0 ảnh hỏng, 0 lỗi JavaScript**. Đã tắt hai máy chủ thử sau khi xong. Không đụng tới máy chủ 5173 của bạn.
