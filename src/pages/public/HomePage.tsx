import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Phone,
  MessageSquare,
  Wifi,
  Wind,
  Tv,
  Bath,
  Car,
  Sparkles,
  BellRing,
  Armchair,
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

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[560px] lg:min-h-[640px] flex items-center bg-bg-wood-deep text-text-on-dark pt-28 pb-16 overflow-hidden">
        <img
          src={settings.hero_image_url}
          alt="Không gian phòng nghỉ tại Nhà Nghỉ Tha Phương"
          width={1440}
          height={880}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-wood-deep/85 via-bg-wood-deep/65 to-bg-wood-deep/95" />

        <div className="container-luxury relative z-10 py-10 flex flex-col items-center text-center">
          <span className="text-xs sm:text-sm font-bold text-brand-gold-light mb-4 px-4 py-1.5 border border-brand-gold/40 rounded-full bg-bg-wood-deep/50">
            Nhà Nghỉ Tha Phương • Sạch sẽ • Riêng tư • Phục vụ 24/7
          </span>
          <h1 className="text-display-hero text-text-on-dark max-w-4xl font-extrabold">
            Không Gian Nghỉ Ngơi Sạch Sẽ, Riêng Tư &amp; Tiện Nghi
          </h1>
          <p className="text-base sm:text-lg text-text-on-dark/85 max-w-2xl mt-4 leading-relaxed font-medium">
            Đặt giữ phòng trực tuyến cực kỳ đơn giản — Chỉ cần chọn loại phòng, nhập Tên, Số điện thoại và Giờ nhận phòng.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
            <Link to="/booking">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="rounded-2xl font-extrabold px-7"
              >
                Đặt phòng ngay
              </Button>
            </Link>
            <a href="tel:0944861242">
              <Button
                variant="overlay"
                size="lg"
                leftIcon={<Phone className="w-4 h-4" />}
                className="rounded-2xl font-extrabold"
              >
                Gọi điện: 0944 861 242
              </Button>
            </a>
            <a href="sms:0944861242?body=Xin%20chao%20Nha%20Nghi%20Tha%20Phuong,%20toi%20muon%20dat%20phong">
              <Button
                variant="overlay"
                size="lg"
                leftIcon={<MessageSquare className="w-4 h-4" />}
                className="rounded-2xl font-extrabold"
              >
                Nhắn tin SMS
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 2. CÁC LOẠI PHÒNG NGHỈ */}
      <section className="py-16 sm:py-20 bg-bg-ivory border-b border-border-default">
        <div className="container-luxury">
          <SectionHeading
            eyebrow="Chọn hạng phòng phù hợp"
            title="Các Loại Phòng Nghỉ Tại Nhà Nghỉ Tha Phương"
            subtitle="Quý khách bấm chọn loại phòng muốn đặt bên dưới để đăng ký tên, số điện thoại và thời gian nhận phòng."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 max-w-5xl mx-auto">
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
            <span className="text-sm font-bold text-brand-gold-dark">
              Về Nhà Nghỉ Tha Phương
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary leading-tight">
              {settings.about_title}
            </h2>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              {settings.about_description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {settings.about_highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 bg-bg-ivory-white p-3.5 rounded-xl border border-border-default"
                >
                  <CheckCircle2 className="w-4 h-4 text-state-success shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-bold text-text-primary">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {DEFAULT_AMENITIES.slice(0, 8).map((am) => {
              const IconComp = ICON_MAP[am.icon_name] || Sparkles;
              return (
                <div
                  key={am.id}
                  className="bg-bg-ivory-white p-5 rounded-2xl border border-border-default shadow-xs"
                >
                  <div className="w-11 h-11 rounded-xl bg-bg-cream flex items-center justify-center text-brand-gold-dark mb-3.5">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-text-primary mb-1">
                    {am.name}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {am.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. LIÊN HỆ NHANH QUA ĐIỆN THOẠI / SMS */}
      <section className="py-14 bg-bg-wood-deep text-text-on-dark">
        <div className="container-luxury flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Cần Đặt Phòng Hoặc Hỏi Thông Tin Nhanh?
            </h2>
            <p className="text-sm sm:text-base text-text-on-dark/80 mt-1.5">
              Bấm gọi điện hoặc nhắn tin SMS trực tiếp tới số lễ tân 24/7 của Nhà Nghỉ Tha Phương.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a href="tel:0944861242">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Phone className="w-4 h-4" />}
                className="rounded-2xl font-extrabold"
              >
                Gọi: 0944 861 242
              </Button>
            </a>
            <a href="sms:0944861242?body=Xin%20chao%20Nha%20Nghi%20Tha%20Phuong,%20toi%20muon%20dat%20phong">
              <Button
                variant="overlay"
                size="lg"
                leftIcon={<MessageSquare className="w-4 h-4" />}
                className="rounded-2xl font-extrabold"
              >
                Nhắn tin SMS
              </Button>
            </a>
            <Link to="/booking">
              <Button variant="secondary" size="lg" className="rounded-2xl font-extrabold">
                Đặt phòng trực tuyến
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
export default HomePage;
