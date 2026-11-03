import { Link } from 'react-router-dom';
import { Sparkles, Route, Download } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';

/**
 * Section giới thiệu tính năng "Lập Lịch Trình Tự Động Trong 30 Giây Với AI Đi Du Lịch"
 * Hiển thị nổi bật ngoài trang chủ với kiểu chữ Serif sang trọng chuẩn hình mẫu,
 * kèm thẻ xem trước lộ trình thực tế Hà Giang - Cao Nguyên Đá được AI tối ưu.
 */
export default function HomeAiItinerarySection() {
  return (
    <section className="relative isolate py-8 sm:py-12 md:py-16 home-glow-sky">
      <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8">
        <Reveal offset={28}>
          <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#06241c] p-6 sm:p-9 lg:p-12 shadow-2xl ring-1 ring-emerald-500/25">
            {/* Vùng sáng ambient mềm mại tạo chiều sâu */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
              {/* Cột trái: Giới thiệu AI & các bước thực hiện */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                {/* Huy hiệu trợ lý thông minh */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0a3528] px-3.5 py-1 text-xs font-semibold text-amber-300 border border-amber-400/30 shadow-xs mb-3.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span>Trợ Lý Du Lịch Thông Minh</span>
                </div>

                {/* Tiêu đề chính dạng Serif cổ điển chuẩn hình ảnh mẫu */}
                <h2 className="font-bold text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] text-white leading-[1.22] tracking-tight font-editorial">
                  Lập Lịch Trình Tự Động Trong 30 Giây Với{' '}
                  <span className="text-amber-300">AI Đi Du Lịch</span>
                </h2>

                {/* Đoạn mô tả dẫn dắt */}
                <p className="mt-3.5 text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal max-w-xl">
                  Không còn phải đọc hàng chục bài viết rời rạc. Chỉ cần chọn sở thích và thời gian, thuật toán kết hợp kho dữ liệu 10.000+ địa điểm bản địa sẽ vẽ nên hành trình hoàn hảo cho riêng bạn.
                </p>

                {/* Danh sách 3 bước với icon số tròn màu hổ phách */}
                <div className="mt-6 sm:mt-7 space-y-4 sm:space-y-4.5 w-full">
                  {/* Bước 1 */}
                  <div className="flex items-start gap-3 sm:gap-3.5">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 font-extrabold text-slate-950 text-xs sm:text-sm shadow-md mt-0.5">
                      1
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-white">
                        Chọn Phong Cách &amp; Sở Thích
                      </h3>
                      <p className="text-[11px] sm:text-xs text-emerald-100/75 mt-0.5 leading-relaxed">
                        Thích nghỉ dưỡng thảnh thơi, phiêu lưu trekking hay khám phá ẩm thực đường phố sành sỏi.
                      </p>
                    </div>
                  </div>

                  {/* Bước 2 */}
                  <div className="flex items-start gap-3 sm:gap-3.5">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 font-extrabold text-slate-950 text-xs sm:text-sm shadow-md mt-0.5">
                      2
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-white">
                        Nhập Điểm Đến &amp; Số Ngày Dự Kiến
                      </h3>
                      <p className="text-[11px] sm:text-xs text-emerald-100/75 mt-0.5 leading-relaxed">
                        Từ chuyến đi chớp nhoáng 2N1Đ đến hành trình xuyên Việt 15 ngày chi tiết từng giờ.
                      </p>
                    </div>
                  </div>

                  {/* Bước 3 */}
                  <div className="flex items-start gap-3 sm:gap-3.5">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 font-extrabold text-slate-950 text-xs sm:text-sm shadow-md mt-0.5">
                      3
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-white">
                        Nhận Lộ Trình Thông Minh Kèm Bản Đồ
                      </h3>
                      <p className="text-[11px] sm:text-xs text-emerald-100/75 mt-0.5 leading-relaxed">
                        Tích hợp tọa độ GPS, thời gian di chuyển tối ưu và gợi ý đặt phòng, vé tham quan một chạm.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nút CTA tạo lịch trình */}
                <div className="mt-7 sm:mt-8">
                  <Link
                    to="/lich-trinh/tao"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:from-amber-300 hover:to-amber-400 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-slate-950 fill-slate-950" />
                    <span>Trải nghiệm tạo lịch trình miễn phí</span>
                  </Link>
                </div>
              </div>

              {/* Cột phải: Thẻ xem trước lộ trình mẫu AI đã dựng sẵn */}
              <div className="lg:col-span-5 w-full">
                <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-2xl border border-slate-100 text-slate-800 flex flex-col gap-3">
                  {/* Tiêu đề thẻ hành trình */}
                  <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Route className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-[13px] leading-tight truncate">
                          Hành trình: Hà Giang - Cao Nguyên Đá
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium truncate">
                          3 Ngày 2 Đêm · Ngân sách: ~3.200.000đ/người
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-emerald-700 border border-emerald-200/50">
                      AI Tối Ưu
                    </span>
                  </div>

                  {/* Lộ trình từng ngày (N1, N2, N3) */}
                  <div className="space-y-2.5">
                    {/* Ngày 1 */}
                    <div className="rounded-2xl bg-[#f8fafc] p-3 sm:p-3.5 border border-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#064e3b] text-[10px] font-bold text-white">
                            N1
                          </span>
                          <span className="font-bold text-slate-900 text-xs sm:text-[12.5px] truncate">
                            Hà Nội → Quản Bạ → Yên Minh
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium shrink-0">
                          07:00 - 18:30
                        </span>
                      </div>
                      <p className="mt-1.5 pl-7 text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                        Check-in Cổng Trời Quản Bạ, ngắm Núi Đôi Cô Tiên và ăn trưa thắng cố Yên Minh.
                      </p>
                    </div>

                    {/* Ngày 2 */}
                    <div className="rounded-2xl bg-[#f8fafc] p-3 sm:p-3.5 border border-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#064e3b] text-[10px] font-bold text-white">
                            N2
                          </span>
                          <span className="font-bold text-slate-900 text-xs sm:text-[12.5px] truncate">
                            Đồng Văn → Mã Pí Lèng → Nho Quế
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium shrink-0">
                          08:00 - 17:00
                        </span>
                      </div>
                      <p className="mt-1.5 pl-7 text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                        Dinh Vua Mèo, cà phê đèo Mã Pí Lèng ngắm vực Tu Sản, đi thuyền sông Nho Quế.
                      </p>
                    </div>

                    {/* Ngày 3 */}
                    <div className="rounded-2xl bg-[#f8fafc] p-3 sm:p-3.5 border border-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#064e3b] text-[10px] font-bold text-white">
                            N3
                          </span>
                          <span className="font-bold text-slate-900 text-xs sm:text-[12.5px] truncate">
                            Cột Cờ Lũng Cú → Hà Nội
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium shrink-0">
                          08:00 - 21:00
                        </span>
                      </div>
                      <p className="mt-1.5 pl-7 text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                        Chạm tay cờ Tổ quốc điểm cực Bắc, ghé Lô Lô Chải trước khi lên xe về thủ đô.
                      </p>
                    </div>
                  </div>

                  {/* Chân thẻ: Lưu PDF & Chỉnh sửa */}
                  <div className="mt-1 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to="/lich-trinh"
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Lưu vào điện thoại dạng PDF</span>
                    </Link>
                    <Link
                      to="/lich-trinh/tao"
                      className="rounded-full bg-emerald-50 hover:bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800 transition-colors cursor-pointer"
                    >
                      Chỉnh sửa chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

