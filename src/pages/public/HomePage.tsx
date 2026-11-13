import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Wifi,
  Wind,
  Tv,
  Bath,
  Car,
  Sparkles,
  BellRing,
  Armchair,
  BedDouble,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { RoomCard } from '@/components/booking/RoomCard';
import { DEFAULT_AMENITIES } from '@/constants/seedData';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Wifi,
  Wind,
  Tv,
  Bath,
  Car,
  Sparkles,
  BellRing,
  Armchair,
};

export const HomePage: React.FC = () => {
  const { settings, rooms: allRooms } = useHotelData();
  const rooms = allRooms.filter((r) => r.is_published);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: settings.hotel_name,
    description: settings.about_description,
    telephone: settings.phone_primary,
    email: settings.email_notification,
    checkinTime: settings.check_in_time,
    checkoutTime: settings.check_out_time,
  };

  return (
    <>
      <SEOHead
        title="Nhà Nghỉ Tha Phương | Đặt Phòng Sạch Sẽ, Riêng Tư & Tiện Nghi"
        description={settings.about_description}
        canonicalPath="/"
        ogImage={settings.hero_image_url}
        jsonLd={jsonLd}
      />

      {/* 1. KHUNG MỞ ĐẦU (HERO) LỚN RÕ RÀNG */}
      <section className="relative min-h-[660px] lg:min-h-[760px] flex items-center bg-bg-wood-deep text-text-on-dark pt-32 pb-20 overflow-hidden">
        <img
          src={settings.hero_image_url}
          alt="Không gian phòng nghỉ tại Nhà Nghỉ Tha Phương"
          width={1440}
          height={880}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-wood-deep/85 via-bg-wood-deep/65 to-bg-wood-deep/95" />

        <div className="container-luxury relative z-10 py-12 flex flex-col items-center text-center">
          <span className="text-sm sm:text-base font-extrabold text-brand-gold-light mb-5 px-5 py-2 border border-brand-gold/50 rounded-full bg-bg-wood-deep/70 shadow-sm">
            {settings.sub_tagline || 'Nhà Nghỉ Tha Phương • Sạch sẽ • Riêng tư • Phục vụ 24/7'}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl text-white max-w-5xl font-extrabold leading-tight tracking-tight">
            {settings.tagline || 'Không Gian Nghỉ Ngơi Sạch Sẽ, Riêng Tư & Tiện Nghi'}
          </h1>
          <p className="text-base sm:text-xl text-white/90 max-w-3xl mt-6 leading-relaxed font-semibold">
            Đặt giữ phòng trực tuyến nhanh gọn — Có đầy đủ <strong>Phòng 1 Giường, Phòng 2 Giường và Phòng 3 Giường</strong>. Chỉ cần chọn loại phòng, nhập Tên, Số điện thoại và Giờ nhận phòng cụ thể.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[420px] mt-9">
            <Link to="/booking" className="w-full">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="rounded-xl font-extrabold shadow-luxury"
              >
                Đặt phòng ngay
              </Button>
            </Link>
            <Link to="/rooms" className="w-full">
              <Button
                variant="overlay"
                size="lg"
                fullWidth
                leftIcon={<BedDouble className="w-4 h-4" />}
                className="rounded-xl font-extrabold"
              >
                Xem các loại phòng
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CÁC LOẠI PHÒNG NGHỈ (THEO THỨ TỰ: PHÒNG 1 GIƯỜNG -> PHÒNG 2 GIƯỜNG -> PHÒNG 3 GIƯỜNG) */}
      <section className="py-16 sm:py-24 bg-bg-ivory border-b border-border-default">
        <div className="container-luxury">
          <SectionHeading
            eyebrow="Chọn hạng phòng phù hợp"
            title="Các Loại Phòng Nghỉ Tại Nhà Nghỉ Tha Phương"
            subtitle="Quý khách bấm chọn loại phòng muốn đặt bên dưới (Phòng 1 Giường, Phòng 2 Giường hoặc Phòng 3 Giường) để đăng ký tên, số điện thoại và giờ nhận phòng."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} layout="grid" />
            ))}
          </div>
        </div>
      </section>

      {/* 3. GIỚI THIỆU NGẮN GỌN */}
      <section className="py-16 sm:py-20 bg-bg-cream/60 border-b border-border-default">
        <div className="container-luxury grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="/images/rooms/phong-1-giuong/giuong-chinh-1.jpg"
                alt="Phòng nghỉ sạch sẽ tại Nhà Nghỉ Tha Phương"
                loading="lazy"
                className="w-full aspect-[4/5] object-cover rounded-2xl shadow-luxury border border-border-default"
              />
            </div>
            <div className="space-y-4 pt-6">
              <img
                src="/images/rooms/phong-1-giuong/khong-gian-phong.jpg"
                alt="Nội thất phòng ốp gỗ ấm cúng"
                loading="lazy"
                className="w-full aspect-[4/5] object-cover rounded-2xl shadow-luxury border border-border-default"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <span className="text-sm font-extrabold uppercase tracking-wider text-brand-gold-dark">
              Về Nhà Nghỉ Tha Phương
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-text-primary leading-tight">
              {settings.about_title}
            </h2>
            <p className="text-text-secondary text-base sm:text-lg font-semibold leading-relaxed">
              {settings.about_description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {settings.about_highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 bg-bg-ivory-white p-4 rounded-2xl border border-border-default shadow-xs"
                >
                  <CheckCircle2 className="w-5 h-5 text-state-success shrink-0 mt-0.5" />
                  <span className="text-sm font-extrabold text-text-primary">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. TIỆN NGHI PHÒNG NGHỈ */}
      <section className="py-16 sm:py-20 bg-bg-ivory">
        <div className="container-luxury">
          <SectionHeading
            eyebrow="Tiện ích đầy đủ"
            title="Tiện Nghi & Dịch Vụ Chu Đáo"
            subtitle="Mỗi phòng nghỉ đều được chuẩn bị sẵn sàng và vệ sinh sạch sẽ trước khi quý khách nhận phòng."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {DEFAULT_AMENITIES.slice(0, 8).map((am) => {
              const IconComp = ICON_MAP[am.icon_name] || Sparkles;
              return (
                <div
                  key={am.id}
                  className="bg-bg-ivory-white p-6 rounded-2xl border border-border-default shadow-xs"
                >
                  <div className="w-12 h-12 rounded-2xl bg-bg-cream flex items-center justify-center text-brand-gold-dark mb-4">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-text-primary mb-1.5">
                    {am.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-text-secondary leading-relaxed">
                    {am.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};
export default HomePage;
