import React from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Users, Maximize2, Star, ArrowRight, Wifi, Wind, Tv, Bath } from 'lucide-react';
import type { Room } from '@/types';
import { formatCurrencyVND } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface RoomCardProps {
  room: Room;
  layout?: 'grid' | 'list';
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, layout = 'grid' }) => {
  const primaryImage =
    room.media.find((m) => m.is_primary)?.url ||
    room.media[0]?.url ||
    '/images/rooms/phong-1-giuong/giuong-chinh-1.jpg';

  const primaryAlt =
    room.media.find((m) => m.is_primary)?.alt_text || room.name;

  if (layout === 'list') {
    return (
      <article className="bg-bg-ivory-white border border-border-default rounded-card overflow-hidden shadow-luxury hover:border-border-strong transition-all flex flex-col md:flex-row">
        <div className="relative md:w-[360px] lg:w-[400px] shrink-0 overflow-hidden bg-bg-cream aspect-[4/3] md:aspect-auto">
          <img
            src={primaryImage}
            alt={primaryAlt}
            loading="lazy"
            width={400}
            height={300}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className="bg-bg-wood-deep/85 text-text-on-dark text-[11px] uppercase tracking-wider px-3 py-1 rounded-classic backdrop-blur-xs">
              {room.room_type_label}
            </span>
            <StatusBadge status={room.status} />
          </div>
          <div className="absolute bottom-3 left-3 bg-bg-ivory-white/90 text-text-primary text-[11px] font-medium px-2.5 py-1 rounded-classic">
            Mã: {room.room_code} · {room.media.length} ảnh
          </div>
        </div>

        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-eyebrow">{room.room_type_label}</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary">
                <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                {room.rating.toFixed(1)} ({room.reviews_count} đánh giá minh họa)
              </span>
            </div>

            <Link to={`/rooms/${room.slug}`}>
              <h3 className="text-heading-h3 text-text-primary hover:text-brand-gold-dark transition-colors">
                {room.name}
              </h3>
            </Link>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-brand-gold-dark" />
                {room.bed_count} giường
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-gold-dark" />
                Tối đa {room.max_adults} người lớn
                {room.max_children > 0 ? ` · ${room.max_children} trẻ em` : ''}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-brand-gold-dark" />
                {room.area_sqm} m²
              </span>
            </div>

            <p className="text-sm text-text-secondary mt-3 leading-relaxed line-clamp-2">
              {room.short_description}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border-default/70 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-bg-ivory rounded-classic border border-border-default">
                <Wifi className="w-3.5 h-3.5 text-brand-gold-dark" /> Wi-Fi miễn phí
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-bg-ivory rounded-classic border border-border-default">
                <Wind className="w-3.5 h-3.5 text-brand-gold-dark" /> Điều hòa
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-bg-ivory rounded-classic border border-border-default">
                <Tv className="w-3.5 h-3.5 text-brand-gold-dark" /> Tivi
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-bg-ivory rounded-classic border border-border-default">
                <Bath className="w-3.5 h-3.5 text-brand-gold-dark" /> Phòng tắm riêng
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4 pt-3 border-t border-border-default">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-price text-text-primary">
                  {formatCurrencyVND(room.price_per_night)}
                </span>
                <span className="text-xs text-text-muted">/ đêm</span>
              </div>
              {room.is_demo_data && (
                <p className="text-[11px] text-text-muted mt-0.5">
                  * Giá minh họa · Thu tiền trực tiếp khi nhận phòng
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link to={`/rooms/${room.slug}`}>
                <Button variant="secondary" size="sm">
                  Xem chi tiết
                </Button>
              </Link>
              <Link to={`/booking?room=${room.slug}`}>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Đặt phòng
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Grid Layout (Default matching Figma 5:248 Layout=Grid)
  return (
    <article className="bg-bg-ivory-white border border-border-default rounded-card overflow-hidden shadow-luxury hover:border-border-strong transition-all flex flex-col h-full group">
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-cream">
        <img
          src={primaryImage}
          alt={primaryAlt}
          loading="lazy"
          width={420}
          height={315}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-bg-wood-deep/85 text-text-on-dark text-[11px] uppercase tracking-wider px-3 py-1 rounded-classic">
            {room.room_type_label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={room.status} />
        </div>
        <div className="absolute bottom-3 left-3 bg-bg-ivory-white/90 text-text-primary text-[11px] font-medium px-2.5 py-0.5 rounded-classic">
          Mã: {room.room_code} · {room.media.length} ảnh
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between gap-5">
        <div>
          <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
            <span className="text-eyebrow">{room.room_type_label}</span>
            <span className="inline-flex items-center gap-1 font-medium">
              <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
              {room.rating.toFixed(1)}
            </span>
          </div>

          <Link to={`/rooms/${room.slug}`}>
            <h3 className="font-serif text-xl font-semibold text-text-primary group-hover:text-brand-gold-dark transition-colors line-clamp-1">
              {room.name}
            </h3>
          </Link>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-brand-gold-dark" />
              {room.bed_count} giường
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-brand-gold-dark" />
              {room.max_adults} khách
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-brand-gold-dark" />
              {room.area_sqm} m²
            </span>
          </div>

          <p className="text-sm text-text-secondary mt-3 leading-relaxed line-clamp-2">
            {room.short_description}
          </p>
        </div>

        <div className="pt-4 border-t border-border-default flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-price text-text-primary">
                {formatCurrencyVND(room.price_per_night)}
              </span>
              <span className="text-xs text-text-muted ml-1">/ đêm</span>
            </div>
            {room.is_demo_data && (
              <span className="text-[11px] text-text-muted italic">Giá minh họa</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Link to={`/rooms/${room.slug}`} className="w-full">
              <Button variant="secondary" size="sm" fullWidth>
                Chi tiết
              </Button>
            </Link>
            <Link to={`/booking?room=${room.slug}`} className="w-full">
              <Button variant="primary" size="sm" fullWidth>
                Đặt phòng
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};
