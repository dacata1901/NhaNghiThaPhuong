import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  BedDouble,
  Users,
  Maximize2,
  Star,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RoomCard } from '@/components/booking/RoomCard';
import {
  formatCurrencyVND,
  calculateNights,
  formatDateVN,
  cn,
} from '@/lib/utils';

export const RoomDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { rooms, getRoomBySlug, getAvailableQuantityForRoom, settings } =
    useHotelData();

  const room = getRoomBySlug(slug || '');

  const today = dayjs().format('YYYY-MM-DD');
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!room) {
    return (
      <div className="container-luxury pt-32 pb-20 text-center space-y-4">
        <h1 className="text-heading-h2 text-text-primary">
          Không tìm thấy thông tin phòng
        </h1>
        <p className="text-sm text-text-secondary">
          Hạng phòng bạn đang tìm không tồn tại hoặc đã ngừng hiển thị.
        </p>
        <Link to="/rooms">
          <Button variant="primary">Xem tất cả phòng</Button>
        </Link>
      </div>
    );
  }

  const nights = calculateNights(checkIn, checkOut);
  const availableCount = getAvailableQuantityForRoom(room.id, checkIn, checkOut);
  const estimatedTotal = (nights > 0 ? nights : 1) * room.price_per_night;

  const relatedRooms = rooms.filter(
    (r) => r.is_published && r.id !== room.id
  );

  const handleBookNow = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      room: room.slug,
      checkIn,
      checkOut,
      guests: String(guests),
    });
    navigate(`/booking?${params.toString()}`);
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HotelRoom',
    name: room.name,
    description: room.full_description,
    identifier: room.room_code,
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: room.max_adults,
    },
    floorSize: {
      '@type': 'QuantitativeValue',
      value: room.area_sqm,
      unitCode: 'MTK',
    },
  };

  return (
    <>
      <SEOHead
        title={`${room.name} (${room.room_code}) | Nhà Nghỉ Tha Phương`}
        description={room.short_description}
        canonicalPath={`/rooms/${room.slug}`}
        ogImage={room.media[0]?.url}
        jsonLd={jsonLd}
      />

      {/* Top Header Strip */}
      <div className="bg-bg-wood-deep text-text-on-dark pt-28 pb-8 border-b border-border-default">
        <div className="container-luxury">
          {/* Breadcrumb matching Figma (24:461) */}
          <nav className="flex flex-wrap items-center gap-2 text-xs text-text-on-dark/70 mb-4">
            <Link to="/" className="hover:text-brand-gold-light">
              Trang chủ
            </Link>
            <span>/</span>
            <Link to="/rooms" className="hover:text-brand-gold-light">
              Phòng nghỉ
            </Link>
            <span>/</span>
            <span className="text-brand-gold-light font-medium">{room.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-light">
                  {room.room_type_label} · Mã phòng: {room.room_code}
                </span>
                <StatusBadge status={room.status} />
              </div>
              <h1 className="text-heading-h1 text-text-on-dark">{room.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-text-on-dark/80">
                <span className="inline-flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-brand-gold" />
                  {room.bed_count} giường
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4 text-brand-gold" />
                  {room.area_sqm} m²
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-brand-gold" />
                  Tối đa {room.max_adults} người lớn
                  {room.max_children > 0 ? ` + ${room.max_children} trẻ em` : ''}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
                  {room.rating.toFixed(1)} ({room.reviews_count} đánh giá minh họa)
                </span>
              </div>
            </div>

            <div className="text-left md:text-right">
              <div className="text-price text-brand-gold-light">
                {formatCurrencyVND(room.price_per_night)}
                <span className="text-xs font-sans font-normal text-text-on-dark/70 ml-1">
                  / đêm
                </span>
              </div>
              {room.is_demo_data && (
                <p className="text-[11px] text-text-on-dark/60 mt-1">
                  * Giá phòng hiện là dữ liệu minh họa
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-10 sm:py-14">
        <div className="container-luxury space-y-12">
          {/* Gallery Grid matching Figma Room Detail (24:456, 24:450, 24:448) */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <button
                type="button"
                onClick={() => setLightboxIndex(0)}
                className="lg:col-span-8 relative aspect-[16/10] rounded-card overflow-hidden border border-border-default bg-bg-cream group text-left"
              >
                <img
                  src={room.media[0]?.url}
                  alt={room.media[0]?.alt_text || room.name}
                  width={850}
                  height={520}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-3 left-3 bg-bg-wood-deep/85 text-text-on-dark text-xs px-3 py-1.5 rounded-classic">
                  Nhấp để xem toàn bộ {room.media.length} ảnh lớn
                </span>
              </button>

              <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
                {room.media.slice(1, 3).map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLightboxIndex(idx + 1)}
                    className="relative aspect-[16/10] rounded-card overflow-hidden border border-border-default bg-bg-cream group"
                  >
                    <img
                      src={item.url}
                      alt={item.alt_text}
                      loading="lazy"
                      width={420}
                      height={250}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Thumbnail Strip if more than 3 photos */}
            {room.media.length > 3 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-1">
                {room.media.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className="relative aspect-[4/3] rounded-classic overflow-hidden border border-border-default hover:border-brand-gold transition-all"
                  >
                    <img
                      src={item.url}
                      alt={item.alt_text}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details + Sticky Booking Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Description, Amenities, Policies */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-bg-ivory-white border border-border-default rounded-card p-6 sm:p-8 shadow-luxury space-y-4">
                <h2 className="text-heading-h3 text-text-primary">
                  Mô tả chi tiết phòng
                </h2>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  {room.full_description}
                </p>
              </div>

              <div className="bg-bg-ivory-white border border-border-default rounded-card p-6 sm:p-8 shadow-luxury space-y-5">
                <h2 className="text-heading-h3 text-text-primary">
                  Tiện nghi trang bị trong phòng
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {room.amenities.map((am) => (
                    <div
                      key={am.id}
                      className="flex items-start gap-3 p-3.5 rounded-classic bg-bg-ivory border border-border-default/80"
                    >
                      <CheckCircle2 className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {am.name}
                        </p>
                        {am.description && (
                          <p className="text-xs text-text-secondary mt-0.5">
                            {am.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Policies & Check-in/Check-out */}
              <div className="bg-bg-ivory-white border border-border-default rounded-card p-6 sm:p-8 shadow-luxury space-y-5">
                <h2 className="text-heading-h3 text-text-primary">
                  Chính sách phòng & Giờ nhận trả phòng
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-bg-ivory rounded-classic border border-border-default flex items-center gap-3">
                    <Clock className="w-5 h-5 text-brand-gold-dark shrink-0" />
                    <div>
                      <span className="text-xs text-text-muted block">
                        Giờ nhận phòng (Check-in):
                      </span>
                      <strong className="text-sm text-text-primary">
                        Từ {settings.check_in_time}
                      </strong>
                    </div>
                  </div>
                  <div className="p-4 bg-bg-ivory rounded-classic border border-border-default flex items-center gap-3">
                    <Clock className="w-5 h-5 text-brand-gold-dark shrink-0" />
                    <div>
                      <span className="text-xs text-text-muted block">
                        Giờ trả phòng (Check-out):
                      </span>
                      <strong className="text-sm text-text-primary">
                        Trước {settings.check_out_time}
                      </strong>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed">
                  {room.policies}
                </p>

                <div className="p-4 bg-bg-cream/60 rounded-classic border border-border-strong flex items-start gap-3 text-xs text-text-primary">
                  <ShieldCheck className="w-5 h-5 text-brand-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <strong>Hình thức thanh toán:</strong> Đặt giữ phòng trực tuyến miễn phí. Quý khách thanh toán trực tiếp tại quầy lễ tân khi nhận phòng.
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Room Booking Panel matching Figma (24:530) */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-bg-ivory-white border border-border-strong rounded-card p-6 sm:p-7 shadow-luxury-lg space-y-5">
              <div className="border-b border-border-default pb-4">
                <span className="text-eyebrow">ĐẶT GIỮ PHÒNG TRỰC TUYẾN</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-price text-text-primary">
                    {formatCurrencyVND(room.price_per_night)}
                  </span>
                  <span className="text-xs text-text-muted">/ đêm · dữ liệu mẫu</span>
                </div>
              </div>

              <form onSubmit={handleBookNow} className="space-y-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-text-secondary flex items-center gap-1.5 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-gold-dark" />
                    Ngày nhận phòng
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCheckIn(val);
                      if (
                        dayjs(checkOut).isSame(dayjs(val)) ||
                        dayjs(checkOut).isBefore(dayjs(val))
                      ) {
                        setCheckOut(dayjs(val).add(1, 'day').format('YYYY-MM-DD'));
                      }
                    }}
                    className="w-full bg-bg-ivory text-sm px-3.5 py-2.5 rounded-classic border border-border-default focus:outline-none focus:border-brand-gold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-text-secondary flex items-center gap-1.5 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-gold-dark" />
                    Ngày trả phòng
                  </label>
                  <input
                    type="date"
                    min={dayjs(checkIn).add(1, 'day').format('YYYY-MM-DD')}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-bg-ivory text-sm px-3.5 py-2.5 rounded-classic border border-border-default focus:outline-none focus:border-brand-gold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-text-secondary block mb-1.5">
                    Số lượng khách
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full bg-bg-ivory text-sm px-3.5 py-2.5 rounded-classic border border-border-default focus:outline-none focus:border-brand-gold"
                  >
                    {Array.from({
                      length: room.max_adults + room.max_children,
                    }).map((_, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {idx + 1} khách
                      </option>
                    ))}
                  </select>
                </div>

                {/* Live Availability Status */}
                <div
                  className={cn(
                    'p-3.5 rounded-classic border text-xs',
                    availableCount > 0
                      ? 'bg-state-success/10 border-state-success/30 text-state-success'
                      : 'bg-state-danger/10 border-state-danger/30 text-state-danger'
                  )}
                >
                  {availableCount > 0 ? (
                    <p className="font-medium">
                      ✓ Còn {availableCount}/{room.total_quantity} phòng trống từ{' '}
                      {formatDateVN(checkIn)} đến {formatDateVN(checkOut)}
                    </p>
                  ) : (
                    <p className="font-medium">
                      ✕ Đã hết phòng trống trong khoảng ngày này. Vui lòng chọn ngày khác.
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="bg-bg-ivory p-4 rounded-classic border border-border-default space-y-2 text-sm">
                  <div className="flex justify-between text-text-secondary">
                    <span>
                      {formatCurrencyVND(room.price_per_night)} ×{' '}
                      {nights > 0 ? nights : 1} đêm
                    </span>
                    <span>{formatCurrencyVND(estimatedTotal)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary text-xs">
                    <span>Phí đặt giữ phòng online</span>
                    <span className="text-state-success font-medium">Miễn phí (0₫)</span>
                  </div>
                  <div className="pt-2 border-t border-border-default flex justify-between font-semibold text-text-primary">
                    <span>Tổng dự kiến (Thu tại lễ tân)</span>
                    <span className="text-brand-gold-dark">
                      {formatCurrencyVND(estimatedTotal)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={availableCount <= 0}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Chọn ngày & Đặt phòng
                </Button>
              </form>

              <div className="pt-3 border-t border-border-default text-center">
                <p className="text-xs text-text-muted mb-2">
                  Cần tư vấn hoặc nhận phòng theo giờ?
                </p>
                <a
                  href="tel:0944861242"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-gold-dark hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" /> Gọi ngay 0944 861 242
                </a>
              </div>
            </aside>
          </div>

          {/* Related Rooms */}
          {relatedRooms.length > 0 && (
            <div className="pt-10 border-t border-border-default space-y-6">
              <h2 className="text-heading-h2 text-text-primary">
                Các hạng phòng khác tại Nhà Nghỉ Tha Phương
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {relatedRooms.map((rel) => (
                  <RoomCard key={rel.id} room={rel} layout="grid" />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-bg-wood-deep/95 flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div className="w-full max-w-5xl flex items-center justify-between text-text-on-dark mb-3">
            <span className="text-xs sm:text-sm">
              Ảnh {lightboxIndex + 1} / {room.media.length}:{' '}
              {room.media[lightboxIndex]?.alt_text}
            </span>
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-classic bg-white/10 hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="relative flex items-center justify-center w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() =>
                setLightboxIndex(
                  (lightboxIndex - 1 + room.media.length) % room.media.length
                )
              }
              className="absolute left-2 p-2.5 rounded-full bg-bg-wood-deep/80 text-white hover:bg-brand-gold transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={room.media[lightboxIndex]?.url}
              alt={room.media[lightboxIndex]?.alt_text}
              className="max-h-[80vh] max-w-full object-contain rounded-card border border-brand-gold/40"
            />

            <button
              type="button"
              onClick={() =>
                setLightboxIndex((lightboxIndex + 1) % room.media.length)
              }
              className="absolute right-2 p-2.5 rounded-full bg-bg-wood-deep/80 text-white hover:bg-brand-gold transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
