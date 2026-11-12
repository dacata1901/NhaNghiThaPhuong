import React, { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  BedDouble,
  Users,
  CheckCircle2,
  Phone,
  MessageSquare,
  ArrowLeft,
  CalendarCheck,
  Clock,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/Button';

export const RoomDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getRoomBySlug, settings } = useHotelData();
  const room = getRoomBySlug(slug || '');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!room) {
    return <Navigate to="/rooms" replace />;
  }

  const images = room.media.length > 0
    ? room.media
    : [
        {
          id: 'default-img',
          room_id: room.id,
          media_type: 'image' as const,
          url: '/images/rooms/phong-1-giuong/giuong-chinh-1.jpg',
          alt_text: room.name,
          is_primary: true,
          sort_order: 1,
        },
      ];

  const currentImage = images[activeImageIdx] || images[0];

  return (
    <>
      <SEOHead
        title={`${room.name} | Nhà Nghỉ Tha Phương`}
        description={room.short_description}
        canonicalPath={`/rooms/${room.slug}`}
      />

      <section className="pt-28 pb-16 bg-bg-ivory min-h-screen">
        <div className="container-luxury max-w-5xl mx-auto">
          <div className="mb-5">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách hạng phòng
            </Link>
          </div>

          <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-6 sm:p-8 shadow-luxury-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <span className="inline-block text-xs font-extrabold px-3 py-1 rounded-xl bg-bg-cream text-brand-gold-dark mb-1.5">
                  Mã phòng: {room.room_code} • {room.room_type_label}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                  {room.name}
                </h1>
              </div>

              <Link to={`/booking?room=${room.slug}`}>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<CalendarCheck className="w-4 h-4" />}
                  className="rounded-2xl font-extrabold"
                >
                  Đặt phòng này ngay
                </Button>
              </Link>
            </div>

            {/* Hình ảnh phòng */}
            <div className="space-y-3 mb-8">
              <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-bg-cream border border-border-default">
                <img
                  src={currentImage.url}
                  alt={currentImage.alt_text || room.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                        activeImageIdx === idx
                          ? 'border-brand-gold scale-[1.02]'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.alt_text}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Thông tin chi tiết */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2.5 rounded-xl bg-bg-ivory border border-border-default text-sm font-bold text-text-primary flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-brand-gold-dark" />
                    {room.bed_count} giường đôi lớn
                  </div>
                  <div className="px-4 py-2.5 rounded-xl bg-bg-ivory border border-border-default text-sm font-bold text-text-primary flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-gold-dark" />
                    Tối đa {room.max_adults} người lớn
                  </div>
                  <div className="px-4 py-2.5 rounded-xl bg-bg-ivory border border-border-default text-sm font-bold text-text-primary flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-gold-dark" />
                    Nhận phòng linh hoạt
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-text-primary mb-2">
                    Giới thiệu hạng phòng
                  </h2>
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                    {room.full_description || room.short_description}
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-text-primary mb-2.5">
                    Tiện nghi có sẵn trong phòng
                  </h2>
                  <div className="grid grid-cols-2 gap-2.5 text-sm font-bold text-text-primary">
                    {[
                      'Điều hòa 2 chiều & Quạt mát',
                      'Wi-Fi tốc độ cao miễn phí',
                      'Tivi màn hình phẳng',
                      'Phòng tắm riêng & Nước nóng Ariston',
                      'Chăn ga gối nệm thay mới mỗi ngày',
                      'Bãi đỗ xe an toàn 24/7',
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-3 rounded-xl bg-bg-ivory border border-border-default"
                      >
                        <CheckCircle2 className="w-4 h-4 text-state-success shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Khung thao tác đặt phòng nhanh bên phải */}
              <div className="lg:col-span-5 bg-bg-ivory border-2 border-brand-gold/60 rounded-2xl p-6 space-y-4">
                <h3 className="text-xl font-extrabold text-text-primary">
                  Đăng Ký Đặt Phòng Này
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Chỉ cần chọn ngày & giờ nhận phòng, nhập Họ tên và Số điện thoại để lễ tân giữ phòng cho bạn.
                </p>

                <Link to={`/booking?room=${room.slug}`} className="block">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    leftIcon={<CalendarCheck className="w-4 h-4" />}
                    className="rounded-xl font-extrabold h-12"
                  >
                    Đặt {room.name}
                  </Button>
                </Link>

                <div className="pt-3 border-t border-border-default space-y-2">
                  <span className="block text-xs font-bold text-text-secondary">
                    Hoặc liên hệ trực tiếp lễ tân 24/7:
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={`tel:${settings.phone_primary.replace(/\s+/g, '')}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-state-success/15 text-state-success text-xs font-extrabold border border-state-success/30 hover:bg-state-success hover:text-white transition-colors"
                    >
                      <Phone className="w-4 h-4" /> Gọi điện
                    </a>
                    <a
                      href={`sms:${settings.phone_primary.replace(/\s+/g, '')}?body=${encodeURIComponent(`Xin chao Nha Nghi Tha Phuong, toi muon dat ${room.name}`)}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-brand-gold/15 text-brand-gold-dark text-xs font-extrabold border border-brand-gold/30 hover:bg-brand-gold hover:text-white transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" /> Nhắn SMS
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default RoomDetailPage;
