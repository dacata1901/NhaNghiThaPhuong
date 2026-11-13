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
    <footer className="bg-bg-wood-deep text-white border-t border-brand-gold/30">
      <div className="container-luxury pt-12 pb-24 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 items-start">
          {/* Cột 1: Thương hiệu Nhà Nghỉ Tha Phương */}
          <div className="space-y-4">
            <Logo tone="light" size="small" hotelName={settings.hotel_name} />
            <p className="text-sm font-medium text-white/85 leading-relaxed">
              Không gian nghỉ ngơi ấm cúng, sạch sẽ và riêng tư với nhiều lựa chọn phòng nghỉ tiện nghi cho mọi nhu cầu lưu trú. Đặt giữ phòng trực tuyến nhanh gọn, phục vụ 24/7.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold text-brand-gold-light bg-white/10 px-4 py-2 rounded-xl border border-brand-gold/30">
              <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0" />
              <span>Phòng sạch sẽ · Riêng tư · Đón khách 24/7</span>
            </div>
          </div>

          {/* Cột 2: Danh mục trang */}
          <div className="md:mx-auto">
            <h3 className="text-base font-extrabold text-brand-gold-light mb-4 uppercase tracking-wider">
              Danh mục trang
            </h3>
            <ul className="space-y-3 text-sm font-bold text-white/90">
              <li>
                <Link to="/" className="hover:text-brand-gold-light transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="hover:text-brand-gold-light transition-colors">
                  Các loại phòng (Nhiều lựa chọn)
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

          {/* Cột 3: Thông tin Nhà Nghỉ */}
          <div>
            <h3 className="text-base font-extrabold text-brand-gold-light mb-4 uppercase tracking-wider">
              Thông tin liên hệ
            </h3>
            <ul className="space-y-3.5 text-sm text-white/90">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-gold shrink-0" />
                <span className="font-semibold">
                  Lễ tân 24/7:{' '}
                  <a
                    href={`tel:${cleanPhone}`}
                    className="font-extrabold text-brand-gold-light hover:underline"
                  >
                    {settings.phone_primary}
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-gold shrink-0" />
                <span className="font-semibold">
                  Thời gian nhận và trả phòng linh hoạt
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-gold shrink-0" />
                <a
                  href={`mailto:${settings.email_notification}`}
                  className="font-bold hover:text-brand-gold-light break-all"
                >
                  {settings.email_notification}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-1" />
                <span className="text-xs sm:text-sm font-semibold text-white/85">
                  {settings.address_text}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-white/75">
          <p>© {currentYear} {settings.hotel_name}. Bảo lưu mọi quyền.</p>
          <span>Không gian nghỉ ngơi sạch sẽ, riêng tư &amp; tiện nghi</span>
        </div>
      </div>
    </footer>
  );
};
