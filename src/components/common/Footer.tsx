import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useHotelData } from '@/context/HotelDataContext';

export const Footer: React.FC = () => {
  const { settings } = useHotelData();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-wood-deep text-text-on-dark border-t border-brand-gold/25">
      <div className="container-luxury py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Logo tone="light" size="small" hotelName={settings.hotel_name} />
            <p className="text-sm text-text-on-dark/75 leading-relaxed">
              Không gian nghỉ dưỡng ấm cúng, sạch sẽ và riêng tư với đầy đủ tiện nghi. Đặt phòng trực tuyến nhanh chóng, thu tiền trực tiếp tại lễ tân khi nhận phòng.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-brand-gold-light bg-white/5 px-3 py-2 rounded-lg border border-brand-gold/25">
              <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0" />
              <span>Đặt giữ phòng an toàn · Không thu phí trước</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-base font-bold text-brand-gold-light mb-4">
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
                  Danh sách hạng phòng
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
                  Liên hệ &amp; Bản đồ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Policies (Đã ẩn hoàn toàn link /admin khỏi giao diện khách hàng) */}
          <div>
            <h3 className="text-base font-bold text-brand-gold-light mb-4">
              Chính sách &amp; Hỗ trợ
            </h3>
            <ul className="space-y-2.5 text-sm text-text-on-dark/80">
              <li>
                <Link to="/faq" className="hover:text-brand-gold-light transition-colors">
                  Câu hỏi thường gặp (FAQ)
                </Link>
              </li>
              <li>
                <Link to="/policies/booking" className="hover:text-brand-gold-light transition-colors">
                  Chính sách đặt phòng &amp; lưu trú
                </Link>
              </li>
              <li>
                <Link to="/policies/cancellation" className="hover:text-brand-gold-light transition-colors">
                  Chính sách đổi &amp; hủy phòng
                </Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="hover:text-brand-gold-light transition-colors">
                  Chính sách bảo mật thông tin
                </Link>
              </li>
              <li>
                <Link to="/policies/terms" className="hover:text-brand-gold-light transition-colors">
                  Điều khoản sử dụng website
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-base font-bold text-brand-gold-light mb-4">
              Thông tin liên hệ
            </h3>
            <ul className="space-y-3 text-sm text-text-on-dark/80">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-brand-gold shrink-0 mt-1" />
                <div>
                  <span className="block text-xs text-text-on-dark/60">Hotline Lễ tân 24/7:</span>
                  <a
                    href={`tel:${settings.phone_primary}`}
                    className="font-semibold text-text-on-dark hover:text-brand-gold-light"
                  >
                    {settings.phone_primary}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-brand-gold shrink-0 mt-1" />
                <div>
                  <span className="block text-xs text-text-on-dark/60">Email tiếp nhận thông tin:</span>
                  <a
                    href={`mailto:${settings.email_notification}`}
                    className="hover:text-brand-gold-light break-all"
                  >
                    {settings.email_notification}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-brand-gold shrink-0 mt-1" />
                <span>
                  Nhận phòng từ {settings.check_in_time} · Trả phòng trước {settings.check_out_time}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-1" />
                <span className="text-xs text-text-on-dark/70">
                  {settings.address_text}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-on-dark/60">
          <p>© {currentYear} {settings.hotel_name}. Bảo lưu mọi quyền.</p>
          <p className="text-center sm:text-right">
            Đặt phòng trực tuyến 24/7 · Thanh toán trực tiếp tại lễ tân
          </p>
        </div>
      </div>
    </footer>
  );
};
