import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useHotelData } from '@/context/HotelDataContext';

export const Footer: React.FC = () => {
  const { settings } = useHotelData();
  const currentYear = new Date().getFullYear();
  const cleanPhone = settings.phone_primary.replace(/\s+/g, '');

  return (
    <footer className="bg-bg-wood-deep text-text-on-dark border-t border-brand-gold/25">
      <div className="container-luxury py-12 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Logo tone="light" size="small" hotelName={settings.hotel_name} />
            <p className="text-sm font-medium text-text-on-dark/80 leading-relaxed">
              Không gian nghỉ ngơi ấm cúng, sạch sẽ và riêng tư với đầy đủ tiện nghi. Đặt giữ phòng trực tuyến đơn giản, thuận tiện.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-gold-light bg-white/5 px-3.5 py-2 rounded-xl border border-brand-gold/25">
              <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0" />
              <span>Đặt giữ phòng nhanh chóng · Hỗ trợ 24/7</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-base font-extrabold text-brand-gold-light mb-4">
              Liên kết nhanh
            </h3>
            <ul className="space-y-2.5 text-sm font-semibold text-text-on-dark/85">
              <li>
                <Link to="/" className="hover:text-brand-gold-light transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="hover:text-brand-gold-light transition-colors">
                  Danh sách loại phòng
                </Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-brand-gold-light transition-colors">
                  Đặt phòng trực tuyến
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-gold-light transition-colors">
                  Giới thiệu nhà nghỉ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-gold-light transition-colors">
                  Liên hệ &amp; Gửi lời nhắn
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div>
            <h3 className="text-base font-extrabold text-brand-gold-light mb-4">
              Chính sách &amp; Hỗ trợ
            </h3>
            <ul className="space-y-2.5 text-sm font-semibold text-text-on-dark/85">
              <li>
                <Link to="/faq" className="hover:text-brand-gold-light transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link to="/booking-policy" className="hover:text-brand-gold-light transition-colors">
                  Chính sách đặt phòng &amp; lưu trú
                </Link>
              </li>
              <li>
                <Link to="/cancellation-policy" className="hover:text-brand-gold-light transition-colors">
                  Chính sách đổi &amp; hủy phòng
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-brand-gold-light transition-colors">
                  Chính sách bảo mật thông tin
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-base font-extrabold text-brand-gold-light mb-4">
              Liên hệ nhanh 24/7
            </h3>
            <ul className="space-y-3.5 text-sm text-text-on-dark/85">
              <li className="space-y-2">
                <span className="block text-xs font-bold text-text-on-dark/70">
                  Số điện thoại Lễ tân ({settings.phone_primary}):
                </span>
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-gold text-text-on-dark font-extrabold text-xs hover:bg-brand-gold-light transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Gọi ngay: {settings.phone_primary}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-brand-gold shrink-0 mt-1" />
                <div>
                  <span className="block text-xs font-bold text-text-on-dark/60">
                    Email tiếp nhận:
                  </span>
                  <a
                    href={`mailto:${settings.email_notification}`}
                    className="font-bold hover:text-brand-gold-light break-all"
                  >
                    {settings.email_notification}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-brand-gold shrink-0 mt-1" />
                <span className="font-semibold">
                  Nhận phòng <strong>{settings.check_in_time}</strong> · Trả phòng{' '}
                  <strong>{settings.check_out_time}</strong>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-1" />
                <span className="text-xs font-semibold text-text-on-dark/80">
                  {settings.address_text}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-text-on-dark/65">
          <p>© {currentYear} {settings.hotel_name}. Bảo lưu mọi quyền.</p>
          <span>Đặt phòng trực tuyến 24/7 · Phục vụ chu đáo</span>
        </div>
      </div>
    </footer>
  );
};
