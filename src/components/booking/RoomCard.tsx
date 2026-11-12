import React from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Users, ArrowRight, Wifi, Wind, Tv, Bath } from 'lucide-react';
import type { Room } from '@/types';
import { Button } from '@/components/ui/Button';

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
      <article className="bg-bg-ivory-white border border-border-default rounded-2xl overflow-hidden shadow-luxury hover:border-border-strong transition-all flex flex-col md:flex-row">
        <div className="relative md:w-[340px] lg:w-[380px] shrink-0 overflow-hidden bg-bg-cream aspect-[4/3] md:aspect-auto">
          <img
            src={primaryImage}
            alt={primaryAlt}
            loading="lazy"
            width={400}
            height={300}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className="bg-bg-wood-deep/90 text-brand-gold-light text-xs font-extrabold px-3.5 py-1.5 rounded-xl backdrop-blur-xs">
              {room.room_type_label}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 bg-bg-ivory-white/95 text-text-primary text-xs font-extrabold px-3 py-1 rounded-xl shadow-xs">
            Mã phòng: {room.room_code}
          </div>
        </div>

        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between gap-4">
          <div>
            <Link to={`/rooms/${room.slug}`}>
              <h3 className="text-xl sm:text-2xl font-extrabold text-text-primary hover:text-brand-gold-dark transition-colors">
                {room.name}
              </h3>
            </Link>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-extrabold text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-brand-gold-dark" />
                {room.bed_count} giường ngủ
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-gold-dark" />
                Phù hợp {room.bed_count} người
              </span>
            </div>

            <p className="text-sm font-semibold text-text-secondary mt-3 leading-relaxed line-clamp-2">
              {room.short_description}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border-default/70 text-xs font-extrabold text-text-primary">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-ivory rounded-xl border border-border-default">
                <Wifi className="w-3.5 h-3.5 text-brand-gold-dark" /> Wi-Fi miễn phí
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-ivory rounded-xl border border-border-default">
                <Wind className="w-3.5 h-3.5 text-brand-gold-dark" /> Điều hòa
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-ivory rounded-xl border border-border-default">
                <Tv className="w-3.5 h-3.5 text-brand-gold-dark" /> Tivi
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-ivory rounded-xl border border-border-default">
                <Bath className="w-3.5 h-3.5 text-brand-gold-dark" /> Phòng tắm riêng
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-border-default">
            <Link to={`/rooms/${room.slug}`}>
              <Button variant="secondary" size="md" className="rounded-xl font-extrabold">
                Xem chi tiết
              </Button>
            </Link>
            <Link to={`/booking?room=${room.slug}`}>
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="rounded-xl font-extrabold"
              >
                Đặt phòng này
              </Button>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-bg-ivory-white border border-border-default rounded-2xl overflow-hidden shadow-luxury hover:border-border-strong transition-all flex flex-col h-full group">
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
          <span className="bg-bg-wood-deep/90 text-brand-gold-light text-xs font-extrabold px-3.5 py-1.5 rounded-xl">
            {room.room_type_label}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 bg-bg-ivory-white/95 text-text-primary text-xs font-extrabold px-3 py-1 rounded-xl shadow-xs">
          Mã phòng: {room.room_code}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between gap-5">
        <div>
          <Link to={`/rooms/${room.slug}`}>
            <h3 className="text-xl font-extrabold text-text-primary hover:text-brand-gold-dark transition-colors">
              {room.name}
            </h3>
          </Link>

          <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs font-extrabold text-text-primary">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-ivory border border-border-default">
              <BedDouble className="w-3.5 h-3.5 text-brand-gold-dark" />
              {room.bed_count} giường ngủ
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-ivory border border-border-default">
              <Users className="w-3.5 h-3.5 text-brand-gold-dark" />
              Phù hợp {room.bed_count} người
            </span>
          </div>

          <p className="text-sm font-semibold text-text-secondary mt-3 leading-relaxed line-clamp-2">
            {room.short_description}
          </p>
        </div>

        <div className="pt-4 border-t border-border-default grid grid-cols-2 gap-2.5">
          <Link to={`/rooms/${room.slug}`}>
            <Button variant="secondary" size="sm" fullWidth className="rounded-xl font-extrabold">
              Chi tiết phòng
            </Button>
          </Link>
          <Link to={`/booking?room=${room.slug}`}>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="rounded-xl font-extrabold"
            >
              Đặt phòng ngay
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
};
