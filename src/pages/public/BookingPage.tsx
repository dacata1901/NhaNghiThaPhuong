import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import {
  CheckCircle2,
  Copy,
  Printer,
  AlertCircle,
  Phone,
  Check,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import {
  formatDateVN,
  formatVND,
  getDefaultCheckInDate,
} from '@/lib/utils';
import type { Booking } from '@/types';

const quickBookingSchema = z.object({
  guest_name: z
    .string()
    .trim()
    .min(2, 'Vui lòng nhập tên của bạn.')
    .max(100, 'Tên không quá 100 ký tự.'),
  guest_phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9]{8,10}$/, 'Số điện thoại gồm 10–11 chữ số.'),
  customer_notes: z.string().max(300).optional(),
});

type QuickBookingFormValues = z.infer<typeof quickBookingSchema>;

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { rooms, settings, getAvailableQuantityForRoom, createBooking } = useHotelData();

  const publishedRooms = useMemo(
    () => rooms.filter((r) => r.is_published && r.status === 'available'),
    [rooms]
  );

  const initialRoomParam = searchParams.get('room') || '';
  const initialMatchedRoom = useMemo(() => {
    if (!initialRoomParam) return publishedRooms[0];
    return (
      publishedRooms.find(
        (r) => r.id === initialRoomParam || r.slug === initialRoomParam
      ) || publishedRooms[0]
    );
  }, [initialRoomParam, publishedRooms]);

  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    initialMatchedRoom?.id || ''
  );
  const [checkInDate, setCheckInDate] = useState(
    searchParams.get('checkIn') || getDefaultCheckInDate()
  );
  const [nightsCount, setNightsCount] = useState<number>(1);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuickBookingFormValues>({
    resolver: zodResolver(quickBookingSchema),
    defaultValues: {
      guest_name: '',
      guest_phone: '',
      customer_notes: '',
    },
  });

  const selectedRoom = useMemo(
    () => publishedRooms.find((r) => r.id === selectedRoomId) || publishedRooms[0],
    [publishedRooms, selectedRoomId]
  );

  const checkOutDate = useMemo(
    () => dayjs(checkInDate).add(nightsCount, 'day').format('YYYY-MM-DD'),
    [checkInDate, nightsCount]
  );

  const availableQty = useMemo(() => {
    if (!selectedRoom) return 0;
    return getAvailableQuantityForRoom(selectedRoom.id, checkInDate, checkOutDate);
  }, [selectedRoom, checkInDate, checkOutDate, getAvailableQuantityForRoom]);

  const totalAmount = (selectedRoom?.price_per_night || 0) * nightsCount;

  const onSubmitQuickBooking = (values: QuickBookingFormValues) => {
    setBookingError(null);

    if (!selectedRoom) {
      setBookingError('Vui lòng chọn phòng.');
      return;
    }
    if (availableQty <= 0) {
      setBookingError(
        `Hạng phòng "${selectedRoom.name}" đã hết phòng trống ngày này. Vui lòng chọn phòng khác hoặc đổi ngày.`
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = createBooking({
        room_id: selectedRoom.id,
        guest_name: values.guest_name,
        guest_phone: values.guest_phone,
        guest_email: '',
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        adults_count: selectedRoom.max_adults || 2,
        children_count: 0,
        customer_notes: values.customer_notes || '',
      });

      setIsSubmitting(false);

      if (!result.success || !result.booking) {
        setBookingError(result.error || 'Có lỗi xảy ra, vui lòng thử lại.');
        return;
      }

      setCreatedBooking(result.booking);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  const handleCopyBookingCode = () => {
    if (!createdBooking) return;
    navigator.clipboard.writeText(createdBooking.booking_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <>
      <SEOHead
        title="Đặt Phòng Nhanh | Nhà Nghỉ Tha Phương"
        description="Đặt phòng cực nhanh tại Nhà Nghỉ Tha Phương chỉ với Tên và Số điện thoại."
        canonicalPath="/booking"
      />

      <section className="pt-28 pb-16 min-h-screen bg-bg-ivory">
        <div className="container-luxury max-w-2xl mx-auto">
          {createdBooking && selectedRoom ? (
            /* Màn hình xác nhận gọn gàng sau khi đặt xong */
            <div className="bg-bg-ivory-white border-2 border-brand-gold rounded-2xl p-6 sm:p-8 shadow-luxury-lg text-center">
              <div className="w-14 h-14 rounded-full bg-state-success/15 text-state-success flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                Đặt Phòng Thành Công!
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Cảm ơn <strong>{createdBooking.guest_name}</strong> ({createdBooking.guest_phone}). Lễ tân đã nhận được yêu cầu giữ phòng của bạn.
              </p>

              <div className="my-5 inline-flex items-center gap-3 bg-bg-cream px-5 py-3 rounded-xl border border-brand-gold">
                <div className="text-left">
                  <span className="text-xs text-text-muted block">Mã đặt phòng</span>
                  <span className="text-xl font-extrabold text-brand-gold-dark">
                    {createdBooking.booking_code}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyBookingCode}
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                >
                  {copiedCode ? 'Đã chép' : 'Sao chép'}
                </Button>
              </div>

              <div className="text-left bg-bg-ivory rounded-xl p-4 border border-border-default space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Phòng đã đặt:</span>
                  <strong className="text-text-primary">{selectedRoom.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Nhận phòng:</span>
                  <strong className="text-text-primary">
                    {formatDateVN(createdBooking.check_in_date)} (từ {settings.check_in_time})
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Số đêm ở:</span>
                  <strong className="text-text-primary">{createdBooking.nights_count} đêm</strong>
                </div>
                <div className="flex justify-between pt-2 border-t border-border-default">
                  <span className="font-semibold text-text-primary">Tổng thanh toán tại lễ tân:</span>
                  <strong className="text-lg font-extrabold text-brand-gold-dark">
                    {formatVND(createdBooking.total_amount)}
                  </strong>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-4 h-4" />}
                >
                  In phiếu
                </Button>
                <Link to="/">
                  <Button variant="primary">Về trang chủ</Button>
                </Link>
              </div>
            </div>
          ) : (
            /* 1 KHUNG ĐẶT PHÒNG SIÊU GỌN DUY NHẤT */
            <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-5 sm:p-8 shadow-luxury-lg">
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                  Đặt Phòng Nhanh
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Chỉ cần chọn phòng, nhập Tên & Số điện thoại — Thanh toán trực tiếp khi nhận phòng
                </p>
              </div>

              {bookingError && (
                <div className="mb-5 p-3.5 rounded-xl bg-state-danger/10 border border-state-danger/30 text-state-danger text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmitQuickBooking)} className="space-y-5" noValidate>
                {/* 1. Chọn phòng (2 thẻ bấm trực tiếp) */}
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">
                    1. Chọn loại phòng
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {publishedRooms.map((room) => {
                      const isSelected = selectedRoom?.id === room.id;
                      const thumb = room.media?.[0]?.url || '';
                      return (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => {
                            setSelectedRoomId(room.id);
                            setBookingError(null);
                          }}
                          className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'border-brand-gold bg-brand-gold/10 shadow-sm'
                              : 'border-border-default hover:border-brand-gold/50 bg-bg-ivory/50'
                          }`}
                        >
                          <img
                            src={thumb}
                            alt={room.name}
                            className="w-16 h-16 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-sm text-text-primary truncate">
                                {room.name}
                              </span>
                              {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-brand-gold text-white flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-text-secondary block">
                              {room.bed_count} giường • Tối đa {room.max_adults} người
                            </span>
                            <span className="text-sm font-extrabold text-brand-gold-dark mt-0.5 block">
                              {formatVND(room.price_per_night)} / đêm
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Họ tên & Số điện thoại */}
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">
                    2. Thông tin người đặt (Không cần Email)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <InputField
                      label="Họ và tên của bạn"
                      placeholder="Ví dụ: Anh Khang"
                      required
                      error={errors.guest_name?.message}
                      {...register('guest_name')}
                    />
                    <InputField
                      label="Số điện thoại liên hệ"
                      type="tel"
                      placeholder="Ví dụ: 0944861242"
                      required
                      error={errors.guest_phone?.message}
                      {...register('guest_phone')}
                    />
                  </div>
                </div>

                {/* 3. Ngày nhận phòng & Số đêm */}
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">
                    3. Ngày nhận phòng & Số đêm ở
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
                    <div>
                      <span className="block text-xs text-text-secondary mb-1">
                        Ngày đến nhận phòng
                      </span>
                      <input
                        type="date"
                        min={dayjs().format('YYYY-MM-DD')}
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-lg bg-bg-ivory border border-border-default text-sm font-medium text-text-primary focus:outline-none focus:border-brand-gold"
                      />
                    </div>

                    <div>
                      <span className="block text-xs text-text-secondary mb-1">
                        Số đêm lưu trú
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setNightsCount(n)}
                            className={`h-11 rounded-lg text-sm font-bold border transition-all ${
                              nightsCount === n
                                ? 'bg-bg-wood-deep text-brand-gold-light border-bg-wood-deep'
                                : 'bg-bg-ivory text-text-primary border-border-default hover:border-brand-gold'
                            }`}
                          >
                            {n} đêm
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ghi chú ngắn gọn */}
                <div>
                  <input
                    type="text"
                    placeholder="Ghi chú thêm nếu có (Ví dụ: Nhận phòng lúc 20h tối)..."
                    className="w-full h-10 px-3.5 rounded-lg bg-bg-ivory border border-border-default text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold"
                    {...register('customer_notes')}
                  />
                </div>

                {/* Tổng tiền & Nút bấm Đặt Phòng Ngay */}
                <div className="pt-3 border-t border-border-default">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm text-text-secondary block">
                        Tổng tiền ({nightsCount} đêm • Trả phòng {formatDateVN(checkOutDate)})
                      </span>
                      <span className="text-xs text-state-success font-semibold">
                        Không cần đặt cọc — Thu trực tiếp tại lễ tân
                      </span>
                    </div>
                    <span className="text-2xl font-extrabold text-brand-gold-dark">
                      {formatVND(totalAmount)}
                    </span>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    className="h-12 text-base font-bold"
                  >
                    Đặt Phòng Ngay
                  </Button>

                  <p className="text-center text-xs text-text-secondary mt-3">
                    Hoặc gọi đặt trực tiếp 24/7:{' '}
                    <a
                      href={`tel:${settings.phone_primary}`}
                      className="font-bold text-brand-gold-dark hover:underline inline-flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> {settings.phone_primary}
                    </a>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
export default BookingPage;
