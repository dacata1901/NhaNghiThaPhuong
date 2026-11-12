# HƯỚNG DẪN VẬN HÀNH & TRIỂN KHAI THỰC TẾ — NHÀ NGHỈ THA PHƯƠNG

Tài liệu này hướng dẫn Chủ nhà vận hành hàng ngày và đưa website **Nhà Nghỉ Tha Phương** lên Internet (Vercel + GitHub + Supabase + Resend) mà không cần kiến thức lập trình chuyên sâu.

---

## 1. THÔNG TIN CẤU HÌNH ĐÃ TÍCH HỢP SẴN
- **Tên thương hiệu**: Nhà Nghỉ Tha Phương
- **Hotline lễ tân 24/7**: `0944 861 242` (`0944861242`)
- **Email nhận thông báo đặt phòng & tin nhắn**: `minhkhang19012006@gmail.com`
- **Dịch vụ gửi Email**: Resend Email API (Đã cấu hình sẵn giao diện thư HTML tiếng Việt 100%).
- **Chính sách thanh toán**: Thu tiền trực tiếp tại quầy lễ tân khi nhận phòng.

---

## 2. HƯỚNG DẪN QUẢN TRỊ HÀNG NGÀY (ADMIN DASHBOARD)
- **Đường dẫn đăng nhập Quản trị**: `/admin/login` (Ví dụ: `http://localhost:5173/admin/login`)
- **Tài khoản Quản trị mặc định (Local)**:
  - **Email**: `minhkhang19012006@gmail.com` (hoặc `admin@nhanghithaphuong.vn`)
  - **Mật khẩu**: `ThaPhuong@2026`
- **5 chức năng cốt lõi trong Admin**:
  1. **Tổng quan (`/admin`)**: Xem số đơn chờ duyệt, số phòng đang trống, doanh thu thực tế và bấm **Duyệt đơn** chỉ với 1 cú nhấp chuột.
  2. **Quản lý Đặt phòng (`/admin/bookings`)**: Tìm kiếm theo tên/SĐT khách, đổi trạng thái (*Chờ xác nhận → Đã xác nhận → Đã nhận phòng → Hoàn thành*), in phiếu nhận phòng và **Xuất file Excel (`.xlsx`)**.
  3. **Quản lý Phòng nghỉ (`/admin/rooms`)**: Cập nhật giá phòng, số lượng phòng, sửa mô tả, tải ảnh phòng mới lên.
  4. **Tin nhắn khách hàng (`/admin/messages`)**: Xem và đánh dấu đã phản hồi các tin nhắn khách gửi từ trang Liên hệ.
  5. **Cài đặt cơ bản (`/admin/settings`)**: Thay đổi số điện thoại, địa chỉ, giờ nhận/trả phòng, email nhận thông báo và nhúng bản đồ Google Maps.

---

## 3. HƯỚNG DẪN ĐƯA WEBSITE LÊN INTERNET MIỄN PHÍ (VERCEL & GITHUB)

### Bước 1: Đẩy mã nguồn lên GitHub
1. Tạo tài khoản tại [https://github.com](https://github.com) và tạo một Repository mới tên là `nha-nghi-tha-phuong`.
2. Mở Terminal tại thư mục `c:\NhaNghiThaPhuong` và chạy:
   ```bash
   git init
   git add .
   git commit -m "Hoan thien website Nha Nghi Tha Phuong"
   git branch -M main
   git remote add origin https://github.com/<ten-tai-khoan-cua-ban>/nha-nghi-tha-phuong.git
   git push -u origin main
   ```

### Bước 2: Triển khai lên Vercel (Tự động 100%)
1. Truy cập [https://vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub vừa tạo.
2. Bấm **"Add New..." → "Project"** → Chọn kho mã nguồn `nha-nghi-tha-phuong`.
3. Trong mục **Environment Variables** (Biến môi trường), bạn có thể thêm:
   - `VITE_RESEND_API_KEY` = `<Mã Resend API Key của bạn>`
   - *(Tùy chọn khi dùng Supabase Cloud)*:
     - `VITE_SUPABASE_URL` = `<URL dự án Supabase của bạn>`
     - `VITE_SUPABASE_ANON_KEY` = `<Anon Key dự án Supabase của bạn>`
4. Bấm **"Deploy"**. Sau khoảng 1 phút, Vercel sẽ cấp cho bạn đường dẫn website chạy trực tiếp trên Internet (có sẵn chứng chỉ bảo mật HTTPS).

### Bước 3: Kết nối cơ sở dữ liệu đám mây Supabase (Khi cần đồng bộ đa thiết bị)
1. Tạo dự án miễn phí tại [https://supabase.com](https://supabase.com).
2. Vào mục **SQL Editor** trên Supabase, mở lần lượt 2 file trong thư mục `supabase/migrations/` của dự án và bấm **Run**:
   - [`supabase/migrations/001_initial_schema.sql`](file:///c:/NhaNghiThaPhuong/supabase/migrations/001_initial_schema.sql)
   - [`supabase/migrations/002_booking_rpc_and_seed.sql`](file:///c:/NhaNghiThaPhuong/supabase/migrations/002_booking_rpc_and_seed.sql)
3. Copy `Project URL` và `anon public key` trong mục **Project Settings → API** của Supabase dán vào biến môi trường trên Vercel.
