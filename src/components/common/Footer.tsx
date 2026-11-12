import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-wood-deep text-text-on-dark border-t border-brand-gold/25">
      <div className="container-luxury py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Logo tone="light" size="small" hotelName="Nhà Nghỉ Tha Phương" />
            <p className="text-sm text-text-on-dark/75 leading-relaxed">
              Không gian nghỉ dưỡng ấm cúng, sạch sẽ và riêng tư với đầy đủ hạng phòng 1 giường, 2 giường và 3 giường. Đặt phòng trực tuyến nhanh chóng, thu tiền trực tiếp khi nhận phòng.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-brand-gold-light bg-white/5 px-3 py-2 rounded-classic border border-brand-gold/25">
              <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0" />
              <span>Đặt giữ phòng an toàn · Không thu phí trước</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-serif text-base font-semibold tracking-wider uppercase text-brand-gold-light mb-4">
              Liên kết nhanh
            </h3>
            <ul className="space-y-2.5 text-sm text-text-on-dark/80">
              <li>
                <Link to="/" className="hover:text-brand-gold-light transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="hover:text-brand-gold-light transition-colors">
                  Danh sách phòng (1 - 2 - 3 giường)
                </Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-brand-gold-light transition-colors">
                  Đặt phòng trực tuyến
                </Link>
              </li>
              <li>
                <Link to="/booking-lookup" className="hover:text-brand-gold-light transition-colors">
                  Tra cứu mã đặt phòng
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-gold-light transition-colors">
                  Giới thiệu nhà nghỉ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-gold-light transition-colors">
                  Liên hệ & Bản đồ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div>
            <h3 className="font-serif text-base font-semibold tracking-wider uppercase text-brand-gold-light mb-4">
              Chính sách & Hỗ trợ
            </h3>
            <ul className="space-y-2.5 text-sm text-text-on-dark/80">
              <li>
                <Link to="/faq" className="hover:text-brand-gold-light transition-colors">
                  Câu hỏi thường gặp (FAQ)
                </Link>
              </li>
              <li>
                <Link to="/booking-policy" className="hover:text-brand-gold-light transition-colors">
                  Chính sách đặt phòng & lưu trú
                </Link>
              </li>
              <li>
                <Link to="/cancellation-policy" className="hover:text-brand-gold-light transition-colors">
                  Chính sách đổi & hủy phòng
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-brand-gold-light transition-colors">
                  Chính sách bảo mật thông tin
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-gold-light transition-colors">
                  Điều khoản sử dụng website
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-xs text-text-on-dark/50 hover:text-brand-gold-light transition-colors">
                  Cổng Quản trị viên (Admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="font-serif text-base font-semibold tracking-wider uppercase text-brand-gold-light mb-4">
              Thông tin liên hệ
            </h3>
            <ul className="space-y-3 text-sm text-text-on-dark/80">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-brand-gold shrink-0 mt-1" />
                <div>
                  <span className="block text-xs text-text-on-dark/60">Hotline Lễ tân 24/7:</span>
                  <a
                    href="tel:0944861242"
                    className="font-semibold text-text-on-dark hover:text-brand-gold-light"
                  >
                    0944 861 242
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-brand-gold shrink-0 mt-1" />
                <div>
                  <span className="block text-xs text-text-on-dark/60">Email tiếp nhận booking:</span>
                  <a
                    href="mailto:huynhduykhanh0406@gmail.com"
                    className="hover:text-brand-gold-light break-all"
                  >
                    huynhduykhanh0406@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-brand-gold shrink-0 mt-1" />
                <span>Nhận phòng từ 14:00 · Trả phòng trước 12:00</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-1" />
                <span className="text-xs text-text-on-dark/70">
                  Địa chỉ chi tiết được cập nhật tại mục Liên hệ / Quản trị hệ thống.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-on-dark/60">
          <p>
            © {currentYear} Nhà Nghỉ Tha Phương. Bảo lưu mọi quyền.
          </p>
          <p className="text-center sm:text-right">
            * Lưu ý: Giá phòng, diện tích và đánh giá hiển thị mặc định là dữ liệu minh họa có thể chỉnh sửa trong Admin.
          </p>
        </div>
      </div>
    </footer>
  );
};
