import React, { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  BedDouble,
  Users,
  CheckCircle2,
  ArrowLeft,
  CalendarCheck,
  Clock,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/Button';

export const RoomDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getRoomBySlug } = useHotelData();
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
        title={`${room.name} - Nhà Nghỉ Tha Phương`}
        description={room.short_description}
        canonicalPath={`/rooms/${room.slug}`}
      />

      <section className="py-10 md:py-16 bg-bg-linen min-h-[80vh]">
        <div className="container-luxury max-w-4xl">
          {/* Quay lại */}
          <div className="mb-6">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-brand-gold-dark transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách các loại phòng
            </Link>
          </div>

          <div className="bg-bg-ivory-white rounded-3xl border border-border-default shadow-card overflow-hidden">
            {/* Ảnh phòng */}
            <div className="relative h-72 sm:h-96 md:h-[440px] bg-bg-sand">
              <img
                src={currentImage.url}
                alt={currentImage.alt_text || room.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-bg-ivory-white/95 backdrop-blur-sm text-xs font-extrabold text-text-primary shadow-soft border border-border-default">
                  <BedDouble className="w-3.5 h-3.5 text-brand-gold-dark" />
                  {room.room_type_label}
                </span>
              </div>
            </div>

            {/* Thumbnails nếu có nhiều ảnh */}
            {images.length > 1 && (
              <div className="px-6 pt-4 flex gap-3 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      idx === activeImageIdx
                        ? 'border-brand-gold shadow-soft scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt_text || `${room.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Nội dung chi tiết */}
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-gold-dark">
                    Mã loại phòng: {room.room_code}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary mt-1">
                    {room.name}
                  </h1>
                </div>

                {/* Thông số cơ bản */}
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-bg-linen border border-border-default text-xs font-bold text-text-primary">
                    <BedDouble className="w-4 h-4 text-brand-gold-dark" />
                    {room.bed_count} Giường lớn
                  </span>
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-bg-linen border border-border-default text-xs font-bold text-text-primary">
                    <Users className="w-4 h-4 text-brand-gold-dark" />
                    Tối đa {room.max_adults} người lớn
                    {room.max_children > 0 ? ` + ${room.max_children} trẻ em` : ''}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-bg-linen border border-border-default text-xs font-bold text-text-primary">
                    <Clock className="w-4 h-4 text-brand-gold-dark" />
                    Nhận phòng linh hoạt 24/7
                  </span>
                </div>

                {/* Mô tả */}
                <div className="space-y-2">
                  <h2 className="text-base font-extrabold text-text-primary">
                    Giới thiệu phòng
                  </h2>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {room.full_description || room.short_description}
                  </p>
                </div>

                {/* Tiện nghi có sẵn */}
                <div className="space-y-2.5 pt-2">
                  <h2 className="text-base font-extrabold text-text-primary">
                    Tiện nghi trong phòng
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      'Máy lạnh làm mát nhanh',
                      'Phòng tắm riêng & Nước nóng lạnh',
                      'Wi-Fi tốc độ cao miễn phí',
                      'Chăn ga gối nệm sạch sẽ mỗi ngày',
                      'Tivi màn hình phẳng',
                      'Bãi đỗ xe an toàn miễn phí',
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-xs font-bold text-text-primary bg-bg-ivory px-3 py-2.5 rounded-xl border border-border-default"
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
                  Chỉ cần chọn ngày & giờ nhận phòng cụ thể, nhập Họ tên và Số điện thoại để lễ tân giữ phòng cho bạn.
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default RoomDetailPage;
