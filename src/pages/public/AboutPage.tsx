import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Clock,
  Phone,
  ArrowRight,
  Wifi,
  Wind,
  Tv,
  Bath,
  Car,
  Armchair,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { PageBanner } from '@/components/common/PageBanner';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';

export const AboutPage: React.FC = () => {
  const { settings, rooms } = useHotelData();
  const realPhotos = rooms[0]?.media || [];

  return (
    <>
      <SEOHead
        title="Giới Thiệu Nhà Nghỉ Tha Phương | Không Gian Lưu Trú Sạch Sẽ & Ấm Cúng"
        description="Tìm hiểu về Nhà Nghỉ Tha Phương – Không gian nghỉ ngơi riêng tư, nội thất ốp gỗ ấm áp, phòng tắm nóng lạnh riêng biệt và dịch vụ tận tâm."
        canonicalPath="/about"
      />

      <PageBanner
        eyebrow="GIỚI THIỆU NHÀ NGHỈ THA PHƯƠNG"
        title="Giới Thiệu Nhà Nghỉ Tha Phương"
        subtitle="Không gian lưu trú ấm cúng, sạch sẽ và riêng tư dành cho khách công tác, du lịch và gia đình."
        breadcrumbs={[{ label: 'Giới thiệu' }]}
      />

      {/* Story Section */}
      <section className="py-16 lg:py-24 bg-bg-ivory">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <SectionHeading
                eyebrow="CHÀO MỪNG QUÝ KHÁCH"
                title={settings.about_title}
                subtitle={settings.about_description}
              />

              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                Tại <strong>{settings.hotel_name}</strong>, chúng tôi hiểu rằng sau mỗi chuyến hành trình dài hay một ngày làm việc bận rộn, điều quý khách cần nhất là một căn phòng thật sự sạch sẽ, yên tĩnh, giường nệm êm ái và đầy đủ tiện nghi thiết yếu như ở chính ngôi nhà của mình.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  '100% ảnh chụp thực tế không gian phòng nghỉ',
                  'Nội thất ốp gỗ sang trọng, sàn gạch vân đá mát mẻ',
                  'Phòng tắm khép kín trang bị bình nóng lạnh Ariston',
                  'Đặt giữ phòng online – Thu tiền trực tiếp tại lễ tân',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2.5 p-3.5 rounded-classic bg-bg-ivory-white border border-border-default"
                  >
                    <CheckCircle2 className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-medium text-text-primary">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link to="/rooms">
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Xem danh sách phòng
                  </Button>
                </Link>
                <a href={`tel:${settings.phone_primary}`}>
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<Phone className="w-4 h-4" />}
                  >
                    Gọi lễ tân: {settings.phone_primary}
                  </Button>
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              {realPhotos.slice(0, 4).map((media, idx) => (
                <div
                  key={media.id}
                  className={`overflow-hidden rounded-classic border border-border-default shadow-luxury-sm ${
                    idx % 2 === 1 ? 'mt-6' : ''
                  }`}
                >
                  <img
                    src={media.url}
                    alt={media.alt_text}
                    className="w-full h-56 sm:h-64 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 lg:py-20 bg-bg-cream/60 border-y border-border-default">
        <div className="container-luxury">
          <SectionHeading
            eyebrow="GIÁ TRỊ PHỤC VỤ"
            title="Cam Kết Chất Lượng Tại Nhà Nghỉ Tha Phương"
            subtitle="Ba tiêu chí cốt lõi giúp khách hàng luôn an tâm lựa chọn lưu trú."
            align="center"
            className="mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-bg-ivory-white border border-border-default rounded-classic p-7 shadow-luxury-sm">
              <div className="w-12 h-12 rounded-classic bg-brand-champagne/60 text-bg-wood-deep flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-text-primary mb-2">
                Vệ Sinh Sạch Sẽ Tuyệt Đối
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Chăn ga gối nệm trắng sạch, khăn tắm và phòng vệ sinh riêng biệt luôn được dọn dẹp, khử khuẩn kỹ lưỡng ngay sau mỗi lượt khách trả phòng.
              </p>
            </div>

            <div className="bg-bg-ivory-white border border-border-default rounded-classic p-7 shadow-luxury-sm">
              <div className="w-12 h-12 rounded-classic bg-brand-champagne/60 text-bg-wood-deep flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-text-primary mb-2">
                Minh Bạch & An Tâm Đặt Phòng
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Khách hàng đặt giữ phòng trực tuyến nhận mã xác nhận ngay lập tức, hoàn toàn không lo rủi ro thanh toán trước vì chỉ thu tiền trực tiếp khi nhận phòng.
              </p>
            </div>

            <div className="bg-bg-ivory-white border border-border-default rounded-classic p-7 shadow-luxury-sm">
              <div className="w-12 h-12 rounded-classic bg-brand-champagne/60 text-bg-wood-deep flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-text-primary mb-2">
                Lễ Tân Hỗ Trợ Chu Đáo 24/7
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Đội ngũ lễ tân thân thiện, hỗ trợ thủ tục nhận/trả phòng nhanh gọn và luôn sẵn sàng giải đáp qua hotline {settings.phone_primary}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Grid */}
      <section className="py-16 lg:py-20 bg-bg-ivory">
        <div className="container-luxury">
          <SectionHeading
            eyebrow="TIỆN NGHI TRONG PHÒNG"
            title="Trang Thiết Bị Thực Tế"
            subtitle="Mỗi phòng nghỉ đều được trang bị đầy đủ tiện ích phục vụ sinh hoạt và nghỉ ngơi."
            align="center"
            className="mb-12"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Wind, label: 'Điều hòa 2 chiều' },
              { icon: Tv, label: 'Tivi màn hình phẳng' },
              { icon: Wifi, label: 'Wi-Fi tốc độ cao' },
              { icon: Bath, label: 'Nóng lạnh Ariston' },
              { icon: Armchair, label: 'Ghế thư giãn êm ái' },
              { icon: Car, label: 'Chỗ đậu xe an toàn' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="p-5 rounded-classic bg-bg-ivory-white border border-border-default text-center flex flex-col items-center gap-3 shadow-luxury-sm"
              >
                <div className="w-10 h-10 rounded-full bg-bg-cream flex items-center justify-center text-brand-gold-dark">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-text-primary">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
