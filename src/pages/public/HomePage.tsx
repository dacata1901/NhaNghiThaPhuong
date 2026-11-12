import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Phone,
  MapPin,
  Wifi,
  Wind,
  Tv,
  Bath,
  Car,
  Sparkles,
  BellRing,
  Armchair,
  Star,
  HelpCircle,
  Palette,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { BookingSearchForm } from '@/components/booking/BookingSearchForm';
import { RoomCard } from '@/components/booking/RoomCard';

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
  const { settings, rooms: allRooms, reviews: allReviews } = useHotelData();
  const rooms = allRooms.filter((r) => r.is_published);
  const reviews = allReviews.filter((r) => r.is_published);

  const [activeGalleryImage, setActiveGalleryImage] = useState<string | null>(null);

  const allRoomPhotos = allRooms[0]?.media || [];

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
        title="Nhà Nghỉ Tha Phương | Đặt Phòng Sạch Sẽ, Riêng Tư & Giá Tốt"
        description={settings.about_description}
        canonicalPath="/"
        ogImage={settings.hero_image_url}
        jsonLd={jsonLd}
      />

      {/* 1. HERO SECTION matching Figma Homepage – Desktop 1440 (7:100) */}
      <section className="relative min-h-[680px] lg:min-h-[780px] flex flex-col justify-between bg-bg-wood-deep text-text-on-dark pt-28 pb-12 overflow-hidden">
        <img
          src={settings.hero_image_url}
          alt="Không gian phòng nghỉ thực tế tại Nhà Nghỉ Tha Phương"
          width={1440}
          height={880}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-wood-deep/85 via-bg-wood-deep/65 to-bg-wood-deep/95" />

        <div className="container-luxury relative z-10 my-auto py-12 flex flex-col items-center text-center">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-brand-gold-light mb-4 px-4 py-1.5 border border-brand-gold/35 rounded-classic bg-bg-wood-deep/40">
            {settings.sub_tagline}
          </span>
          <h1 className="text-display-hero text-text-on-dark max-w-4xl">
            Không Gian Nghỉ Ngơi Sạch Sẽ, Riêng Tư &amp; Trọn Vẹn
          </h1>
          <p className="text-base sm:text-lg text-text-on-dark/85 max-w-2xl mt-5 leading-relaxed">
            {settings.tagline}. Đặt giữ phòng trực tuyến nhanh chóng – Thanh toán trực tiếp tại lễ tân khi nhận phòng.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link to="/rooms">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Khám phá các hạng phòng
              </Button>
            </Link>
            <a href="tel:0944861242">
              <Button
                variant="overlay"
                size="lg"
                leftIcon={<Phone className="w-4 h-4" />}
              >
                Gọi đặt nhanh: 0944 861 242
              </Button>
            </a>
          </div>
        </div>

        {/* Booking Form on Hero */}
        <div className="container-luxury relative z-20 mt-6">
          <BookingSearchForm layout="horizontal" />
        </div>
      </section>

      {/* 2. ABOUT SECTION matching Figma (7:187) with actual room photos */}
      <section className="py-16 sm:py-24 bg-bg-ivory border-b border-border-default">
        <div className="container-luxury grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="/images/rooms/phong-1-giuong/giuong-chinh-1.jpg"
                alt="Phòng ngủ sạch sẽ tại Nhà Nghỉ Tha Phương"
                loading="lazy"
                width={320}
                height={400}
                className="w-full h-64 sm:h-80 object-cover rounded-card border border-border-default shadow-luxury"
              />
              <div className="bg-bg-wood-deep text-text-on-dark p-5 rounded-card border border-brand-gold/30">
                <p className="font-serif text-2xl font-semibold text-brand-gold-light">
                  24/7
                </p>
                <p className="text-xs text-text-on-dark/80 mt-1">
                  Lễ tân hỗ trợ nhận & trả phòng linh hoạt, chu đáo
                </p>
              </div>
            </div>
            <div className="space-y-4 pt-6">
              <div className="bg-bg-cream p-5 rounded-card border border-border-strong">
                <p className="font-serif text-xl font-semibold text-text-primary">
                  Thu trực tiếp
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Đặt giữ phòng online 0đ · Thanh toán khi nhận phòng
                </p>
              </div>
              <img
                src="/images/rooms/phong-1-giuong/khong-gian-phong.jpg"
                alt="Không gian nội thất ốp gỗ ấm cúng Nhà Nghỉ Tha Phương"
                loading="lazy"
                width={320}
                height={400}
                className="w-full h-64 sm:h-80 object-cover rounded-card border border-border-default shadow-luxury"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <SectionHeading
              align="left"
              eyebrow="GIỚI THIỆU NHÀ NGHỈ THA PHƯƠNG"
              title={settings.about_title}
              subtitle={settings.about_description}
            />

            <ul className="space-y-3 pt-2">
              {settings.about_highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-text-primary">
                  <CheckCircle2 className="w-5 h-5 text-brand-gold-dark shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link to="/about">
                <Button variant="secondary">Tìm hiểu thêm</Button>
              </Link>
              <Link to="/design-system">
                <Button variant="ghost" leftIcon={<Palette className="w-4 h-4" />}>
                  Xem Design System (Figma)
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED ROOMS SECTION matching Figma (7:220) */}
      <section className="py-16 sm:py-24 bg-bg-cream/50 border-b border-border-default">
        <div className="container-luxury">
          <SectionHeading
            eyebrow="PHÒNG NỔI BẬT"
            title="Lựa chọn phòng của bạn"
            subtitle="Ba hạng phòng 1 – 2 – 3 giường với thiết kế ấm cúng, đầy đủ tiện nghi. Hình ảnh phòng 1 giường là ảnh chụp thực tế tại Nhà Nghỉ Tha Phương (Giá và diện tích đang để mức minh họa)."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} layout="grid" />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/rooms">
              <Button variant="secondary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Xem tất cả các loại phòng
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. AMENITIES SECTION matching Figma (7:397) */}
      <section className="py-16 sm:py-24 bg-bg-ivory border-b border-border-default">
        <div className="container-luxury">
          <SectionHeading
            eyebrow="TIỆN ÍCH & DỊCH VỤ"
            title="Mọi thứ bạn cần cho kỳ nghỉ thoải mái"
            subtitle="Tất cả các phòng tại Nhà Nghỉ Tha Phương đều được trang bị đầy đủ tiện nghi thiết yếu và vệ sinh sạch sẽ mỗi ngày."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {(allRooms[0]?.amenities || []).map((amenity) => {
              const IconComp = ICON_MAP[amenity.icon_name] || Sparkles;
              return (
                <div
                  key={amenity.id}
                  className="bg-bg-ivory-white border border-border-default rounded-card p-6 hover:border-brand-gold transition-colors shadow-luxury"
                >
                  <div className="w-11 h-11 rounded-classic bg-bg-cream border border-border-strong flex items-center justify-center text-brand-gold-dark mb-4">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-text-primary">
                    {amenity.name}
                  </h3>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                    {amenity.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. REAL PHOTO GALLERY SECTION matching Figma (7:452) */}
      <section className="py-16 sm:py-24 bg-bg-ivory-white border-b border-border-default">
        <div className="container-luxury">
          <SectionHeading
            eyebrow="HÌNH ẢNH THỰC TẾ"
            title="Khám phá không gian Nhà Nghỉ Tha Phương"
            subtitle="Bộ 6 hình ảnh chụp thực tế phòng nghỉ 1 giường đôi, khu vực điều hòa - TV, ghế thư giãn và phòng tắm riêng có bình nóng lạnh. Nhấp vào ảnh để xem kích thước lớn."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {allRoomPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActiveGalleryImage(photo.url)}
                className="group relative aspect-[4/3] overflow-hidden rounded-card border border-border-default bg-bg-cream text-left focus:outline-none"
              >
                <img
                  src={photo.url}
                  alt={photo.alt_text}
                  loading="lazy"
                  width={420}
                  height={315}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-wood-deep/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-xs text-text-on-dark font-medium">
                    {photo.alt_text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Gallery */}
      {activeGalleryImage && (
        <div
          className="fixed inset-0 z-50 bg-bg-wood-deep/90 flex items-center justify-center p-4"
          onClick={() => setActiveGalleryImage(null)}
        >
          <img
            src={activeGalleryImage}
            alt="Ảnh phóng to Nhà Nghỉ Tha Phương"
            className="max-w-full max-h-[88vh] object-contain rounded-card border border-brand-gold/40"
          />
        </div>
      )}

      {/* 6. REVIEWS SECTION matching Figma (7:500) */}
      <section className="py-16 sm:py-24 bg-bg-cream/60 border-b border-border-default">
        <div className="container-luxury">
          <SectionHeading
            eyebrow="ĐÁNH GIÁ KHÁCH HÀNG"
            title="Khách hàng nói gì về chúng tôi"
            subtitle="Nội dung đánh giá dưới đây đang là dữ liệu minh họa cho giao diện (Có thể quản lý trong Admin Dashboard)."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-bg-ivory-white border border-border-default rounded-card p-6 shadow-luxury flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-1 text-brand-gold mb-3">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-brand-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-text-primary italic leading-relaxed">
                    “{rev.comment}”
                  </p>
                </div>
                <div className="pt-4 border-t border-border-default/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-primary">
                    {rev.reviewer_name}
                  </span>
                  <span className="text-text-muted">{rev.room_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ & CONTACT PREVIEW SECTION */}
      <section className="py-16 sm:py-24 bg-bg-ivory border-b border-border-default">
        <div className="container-luxury grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6">
            <SectionHeading
              align="left"
              eyebrow="CÂU HỎI THƯỜNG GẶP"
              title="Thông tin hữu ích trước khi lưu trú"
            />
            <div className="space-y-3 pt-2">
              {settings.faqs.slice(0, 4).map((faq) => (
                <div
                  key={faq.id}
                  className="bg-bg-ivory-white border border-border-default rounded-card p-5"
                >
                  <h3 className="font-serif text-base font-semibold text-text-primary flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-brand-gold-dark shrink-0 mt-1" />
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed pl-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-bg-ivory-white border border-border-default rounded-card p-6 sm:p-8 shadow-luxury flex flex-col justify-between gap-6">
            <div>
              <span className="text-eyebrow">LIÊN HỆ & VỊ TRÍ</span>
              <h3 className="text-heading-h3 text-text-primary mt-2">
                Hỗ trợ đặt phòng 24/7
              </h3>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                Quý khách cần hỏi phòng trống gấp, nhận phòng sớm hoặc hỏi đường đi, vui lòng liên hệ trực tiếp với chúng tôi:
              </p>

              <div className="space-y-4 mt-6 text-sm">
                <div className="p-4 bg-bg-ivory rounded-classic border border-border-default flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand-gold-dark shrink-0" />
                  <div>
                    <span className="text-xs text-text-muted block">Số điện thoại Lễ tân:</span>
                    <a href="tel:0944861242" className="font-serif text-lg font-semibold text-text-primary hover:text-brand-gold-dark">
                      0944 861 242
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-bg-ivory rounded-classic border border-border-default flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-text-muted block">Địa chỉ & Bản đồ:</span>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {settings.address_text}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/booking" className="flex-1">
                <Button variant="primary" fullWidth>
                  Đặt phòng ngay
                </Button>
              </Link>
              <Link to="/contact" className="flex-1">
                <Button variant="secondary" fullWidth>
                  Gửi lời nhắn
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CTA BANNER matching Figma (7:567) */}
      <section className="py-16 sm:py-20 bg-bg-wood text-text-on-dark text-center">
        <div className="container-luxury max-w-3xl space-y-5">
          <h2 className="text-heading-h2 text-text-on-dark">
            Sẵn sàng cho kỳ nghỉ của bạn tại Nhà Nghỉ Tha Phương?
          </h2>
          <p className="text-sm sm:text-base text-text-on-dark/80">
            Đặt giữ phòng trực tuyến chỉ trong 4 bước đơn giản · Thu tiền trực tiếp khi nhận phòng.
          </p>
          <div className="pt-2">
            <Link to="/booking">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Đặt phòng ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
