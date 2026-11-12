import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Calendar, Users, BedDouble, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface BookingSearchFormProps {
  layout?: 'horizontal' | 'stacked';
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  initialRoomType?: string;
  onSearch?: (params: {
    checkIn: string;
    checkOut: string;
    guests: number;
    roomType: string;
  }) => void;
  className?: string;
}

export const BookingSearchForm: React.FC<BookingSearchFormProps> = ({
  layout = 'horizontal',
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
  initialRoomType = 'all',
  onSearch,
  className,
}) => {
  const navigate = useNavigate();
  const today = dayjs().format('YYYY-MM-DD');
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

  const [checkIn, setCheckIn] = useState(initialCheckIn || today);
  const [checkOut, setCheckOut] = useState(initialCheckOut || tomorrow);
  const [guests, setGuests] = useState(initialGuests);
  const [roomType, setRoomType] = useState(initialRoomType);

  const handleCheckInChange = (val: string) => {
    setCheckIn(val);
    if (dayjs(checkOut).isSame(dayjs(val)) || dayjs(checkOut).isBefore(dayjs(val))) {
      setCheckOut(dayjs(val).add(1, 'day').format('YYYY-MM-DD'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ checkIn, checkOut, guests, roomType });
      return;
    }
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
      type: roomType,
    });
    navigate(`/rooms?${params.toString()}`);
  };

  const isStacked = layout === 'stacked';

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'bg-bg-ivory-white border border-border-default rounded-card shadow-luxury-lg p-4 sm:p-6',
        className
      )}
    >
      <div
        className={cn(
          'grid gap-4 items-end',
          isStacked
            ? 'grid-cols-1'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
        )}
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-secondary flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-gold-dark" />
            Ngày nhận phòng
          </label>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => handleCheckInChange(e.target.value)}
            className="w-full bg-bg-ivory text-text-primary text-sm px-3.5 py-2.5 rounded-classic border border-border-default focus:outline-none focus:border-brand-gold"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-secondary flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-gold-dark" />
            Ngày trả phòng
          </label>
          <input
            type="date"
            min={dayjs(checkIn).add(1, 'day').format('YYYY-MM-DD')}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-bg-ivory text-text-primary text-sm px-3.5 py-2.5 rounded-classic border border-border-default focus:outline-none focus:border-brand-gold"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-secondary flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-gold-dark" />
            Số lượng khách
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full bg-bg-ivory text-text-primary text-sm px-3.5 py-2.5 rounded-classic border border-border-default focus:outline-none focus:border-brand-gold"
          >
            <option value={1}>1 khách</option>
            <option value={2}>2 khách</option>
            <option value={3}>3 khách</option>
            <option value={4}>4 khách</option>
            <option value={5}>5 - 6 khách</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-secondary flex items-center gap-1.5">
            <BedDouble className="w-3.5 h-3.5 text-brand-gold-dark" />
            Loại phòng
          </label>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full bg-bg-ivory text-text-primary text-sm px-3.5 py-2.5 rounded-classic border border-border-default focus:outline-none focus:border-brand-gold"
          >
            <option value="all">Tất cả loại phòng</option>
            <option value="1_bed">Phòng 1 giường</option>
            <option value="2_beds">Phòng 2 giường</option>
            <option value="3_beds">Phòng 3 giường</option>
          </select>
        </div>

        <div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            leftIcon={<Search className="w-4 h-4" />}
            className="h-[42px]"
          >
            Tìm phòng trống
          </Button>
        </div>
      </div>
    </form>
  );
};
