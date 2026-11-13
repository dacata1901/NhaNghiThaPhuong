import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import {
  CheckCircle2,
  Printer,
  AlertCircle,
  Check,
  Clock,
  Calendar,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  formatDateVN,
  getDefaultCheckInDate,
} from '@/lib/utils';
import type { Booking } from '@/types';

const quickBookingSchema = z.object({
  guest_name: z
    .string()
    .trim()
    .min(2, 'Vui lòng nhập họ và tên của bạn.')
    .max(100, 'Tên không quá 100 ký tự.'),
  guest_phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9]{8,10}$/, 'Vui lòng nhập số điện thoại hợp lệ (10–11 chữ số).'),
  customer_notes: z.string().max(300).optional(),
});

type QuickBookingFormValues = z.infer<typeof quickBookingSchema>;

const HOURS_24 = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0')
);
const MINUTES_STEP = ['00', '15', '30', '45'];

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { rooms, createBooking } = useHotelData();

  const publishedRooms = useMemo(
    () => rooms.filter((r) => r.is_published),
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
  const [arrivalTime, setArrivalTime] = useState<string>('14:00');
  const [nightsCount, setNightsCount] = useState<number>(1);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingFormValues, setPendingFormValues] =
    useState<QuickBookingFormValues | null>(null);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

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

  const formattedArrivalDetail = useMemo(
    () => `${arrivalTime} — Ngày ${formatDateVN(checkInDate)}`,
    [arrivalTime, checkInDate]
  );

  // Bước 1: Mở hộp thoại xác nhận thông tin trước khi gửi
  const onPreSubmit = (values: QuickBookingFormValues) => {
    setBookingError(null);
    if (!selectedRoom) {
      setBookingError('Vui lòng chọn loại phòng bạn muốn đặt.');
      return;
    }
    setPendingFormValues(values);
  };

  // Bước 2: Khách bấm "Đồng ý xác nhận" trong hộp thoại
  const handleConfirmBooking = () => {
    if (!pendingFormValues || !selectedRoom) return;

    setIsSubmitting(true);
    const combinedNote = [
      `Giờ nhận phòng: ${arrivalTime} (Ngày ${formatDateVN(checkInDate)})`,
      pendingFormValues.customer_notes?.trim() || '',
    ]
      .filter(Boolean)
      .join(' | ');

    setTimeout(() => {
      const result = createBooking({
        room_id: selectedRoom.id,
        guest_name: pendingFormValues.guest_name,
        guest_phone: pendingFormValues.guest_phone,
        guest_email: '',
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        adults_count: selectedRoom.bed_count || 1,
        children_count: 0,
        customer_notes: combinedNote,
      });

      setIsSubmitting(false);
      setPendingFormValues(null);

      if (!result.success || !result.booking) {
        setBookingError(result.error || 'Có lỗi xảy ra, vui lòng thử lại.');
        return;
      }

      setCreatedBooking(result.booking);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  return (
    <>
      <SEOHead
        title="Đặt Phòng Nhanh | Nhà Nghỉ Tha Phương"
        description="Đăng ký đặt phòng nhanh chóng tại Nhà Nghỉ Tha Phương."
        canonicalPath="/booking"
      />

      <section className="pt-28 pb-16 min-h-screen bg-bg-ivory">
        <div className="container-luxury max-w-3xl mx-auto">
          {createdBooking && selectedRoom ? (
            /* Màn hình xác nhận sau khi đặt xong */
            <div className="bg-bg-ivory-white border-2 border-brand-gold rounded-2xl p-6 sm:p-8 shadow-luxury-lg text-center">
              <div className="w-14 h-14 rounded-2xl bg-state-success/15 text-state-success flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                Đã Gửi Yêu Cầu Đặt Phòng!
              </h1>
              <p className="text-sm sm:text-base font-semibold text-text-secondary mt-1.5">
                Cảm ơn <strong>{createdBooking.guest_name}</strong> (<strong>{createdBooking.guest_phone}</strong>). Nhà Nghỉ Tha Phương đã ghi nhận lịch nhận phòng của bạn.
              </p>

              <div className="my-6 text-left bg-bg-ivory rounded-2xl p-5 border border-border-default space-y-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-text-secondary font-semibold">Khách đặt phòng:</span>
                  <strong className="text-text-primary font-extrabold text-right">
                    {createdBooking.guest_name}
                  </strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-text-secondary font-semibold">Số điện thoại:</span>
                  <strong className="text-brand-gold-dark font-extrabold text-right">
                    {createdBooking.guest_phone}
                  </strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-text-secondary font-semibold">Loại phòng đăng ký:</span>
                  <strong className="text-text-primary font-extrabold text-right">
                    {selectedRoom.name} ({selectedRoom.room_code})
                  </strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-text-secondary font-semibold">Thời gian nhận phòng cụ thể:</span>
                  <strong className="text-state-success font-extrabold text-right">
                    Lúc {arrivalTime} — Ngày {formatDateVN(createdBooking.check_in_date)}
                  </strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-text-secondary font-semibold">Số đêm lưu trú:</span>
                  <strong className="text-text-primary font-extrabold text-right">
                    {createdBooking.nights_count} đêm (Trả phòng: {formatDateVN(createdBooking.check_out_date)})
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-4 h-4" />}
                  className="rounded-xl font-extrabold"
                >
                  In phiếu đặt phòng
                </Button>
                <Link to="/" className="w-full">
                  <Button variant="primary" size="md" fullWidth className="rounded-xl font-extrabold">
                    Về trang chủ
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* KHUNG ĐẶT PHÒNG ĐƠN GIẢN, RÕ RÀNG */
            <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-5 sm:p-8 shadow-luxury-lg">
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                  Đăng Ký Đặt Phòng
                </h1>
                <p className="text-sm sm:text-base text-text-secondary mt-1 font-semibold">
                  Chọn loại phòng theo thứ tự (1 Người, 2 Người, 3 Người), nhập Tên, Số điện thoại và Giờ nhận phòng cụ thể
                </p>
              </div>

              {bookingError && (
                <div className="mb-5 p-3.5 rounded-xl bg-state-danger/10 border border-state-danger/30 text-state-danger text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onPreSubmit)} className="space-y-6" noValidate>
                {/* 1. Chọn loại phòng (Theo đúng thứ tự: Phòng 1 Người -> Phòng 2 Người -> Phòng 3 Người) */}
                <div>
                  <label className="block text-sm sm:text-base font-extrabold text-text-primary mb-3">
                    1. Chọn loại phòng bạn muốn đặt:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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
                          className={`p-3.5 rounded-2xl border-2 text-left transition-all flex sm:flex-col items-center sm:items-stretch gap-3 ${
                            isSelected
                              ? 'border-brand-gold bg-brand-gold/15 shadow-sm'
                              : 'border-border-default hover:border-brand-gold/60 bg-bg-ivory/70'
                          }`}
                        >
                          <img
                            src={thumb}
                            alt={room.name}
                            className="w-16 h-16 sm:w-full sm:h-28 rounded-xl object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-extrabold text-sm text-text-primary leading-snug">
                                {room.name}
                              </span>
                              {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-brand-gold text-white flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-bold text-text-secondary mt-1 block">
                              {room.bed_count} giường ngủ • Mã: {room.room_code}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Họ tên & Số điện thoại */}
                <div>
                  <label className="block text-sm sm:text-base font-extrabold text-text-primary mb-3">
                    2. Thông tin khách đặt phòng:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Họ và tên của bạn"
                      placeholder="Ví dụ: Nguyễn Văn An"
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

                {/* 3. Thời gian nhận phòng (Chọn múi giờ 24h thông minh) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-bg-ivory border border-border-default space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-sm sm:text-base font-extrabold text-text-primary">
                      3. Thời gian nhận phòng:
                    </label>
                    <span className="text-xs font-bold text-state-success bg-state-success/10 px-2.5 py-1 rounded-lg">
                      Nhận &amp; trả phòng linh hoạt
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-extrabold text-text-primary mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-brand-gold-dark" />
                        Ngày đến nhận phòng
                      </span>
                      <input
                        type="date"
                        min={dayjs().format('YYYY-MM-DD')}
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-bg-ivory-white border border-border-strong text-sm font-extrabold text-text-primary focus:outline-none focus:border-brand-gold"
                      />
                    </div>

                    <div>
                      <span className="text-xs font-extrabold text-text-primary mb-1.5 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-brand-gold-dark" />
                        Giờ nhận phòng (Hệ 24 giờ)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          aria-label="Giờ nhận phòng (00-23)"
                          value={arrivalTime.split(':')[0] || '14'}
                          onChange={(e) => {
                            const mins = arrivalTime.split(':')[1] || '00';
                            setArrivalTime(`${e.target.value}:${mins}`);
                          }}
                          className="w-full h-11 px-3 rounded-xl bg-bg-ivory-white border border-border-strong text-sm font-extrabold text-text-primary focus:outline-none focus:border-brand-gold cursor-pointer"
                        >
                          {HOURS_24.map((h) => (
                            <option key={h} value={h}>
                              {h} giờ
                            </option>
                          ))}
                        </select>

                        <select
                          aria-label="Phút nhận phòng"
                          value={arrivalTime.split(':')[1] || '00'}
                          onChange={(e) => {
                            const hrs = arrivalTime.split(':')[0] || '14';
                            setArrivalTime(`${hrs}:${e.target.value}`);
                          }}
                          className="w-full h-11 px-3 rounded-xl bg-bg-ivory-white border border-border-strong text-sm font-extrabold text-text-primary focus:outline-none focus:border-brand-gold cursor-pointer"
                        >
                          {MINUTES_STEP.map((m) => (
                            <option key={m} value={m}>
                              {m} phút
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Chọn nhanh số đêm */}
                  <div className="pt-2 border-t border-border-default">
                    <span className="block text-xs font-extrabold text-text-primary mb-2">
                      Số đêm lưu trú dự kiến:
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNightsCount(n)}
                          className={`h-10 rounded-xl text-xs sm:text-sm font-extrabold border transition-all ${
                            nightsCount === n
                              ? 'bg-brand-gold text-white border-brand-gold shadow-xs'
                              : 'bg-bg-ivory-white text-text-primary border-border-default hover:border-brand-gold'
                          }`}
                        >
                          {n} đêm
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Khung tóm tắt thời gian nhận/trả cụ thể */}
                  <div className="p-3 rounded-xl bg-brand-champagne/45 border border-brand-gold/40 text-xs sm:text-sm font-bold text-text-primary flex flex-wrap items-center justify-between gap-2">
                    <span>
                      Nhận phòng: <strong className="text-state-success">{formattedArrivalDetail}</strong>
                    </span>
                    <span>
                      Trả phòng: <strong>{formatDateVN(checkOutDate)} (Linh hoạt)</strong>
                    </span>
                  </div>
                </div>

                {/* Ghi chú ngắn gọn */}
                <div>
                  <input
                    type="text"
                    placeholder="Ghi chú thêm nếu có (Ví dụ: Nhận phòng trễ, cần phòng tầng trệt)..."
                    className="w-full h-11 px-4 rounded-xl bg-bg-ivory border border-border-default text-sm font-semibold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold"
                    {...register('customer_notes')}
                  />
                </div>

                {/* Nút Đặt Phòng */}
                <div className="pt-1">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    className="h-13 rounded-2xl text-base font-extrabold shadow-luxury"
                  >
                    Kiểm Tra &amp; Xác Nhận Đặt Phòng
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Hộp thoại Xác nhận thông tin đặt phòng (Hỏi lại 1 lần nữa cho chắc) */}
      <ConfirmDialog
        isOpen={Boolean(pendingFormValues && selectedRoom)}
        onClose={() => setPendingFormValues(null)}
        onConfirm={handleConfirmBooking}
        isLoading={isSubmitting}
        variant="confirm"
        title="Xác nhận thông tin đặt phòng?"
        description="Vui lòng kiểm tra lại thông tin đặt phòng và giờ nhận phòng cụ thể của bạn một lần nữa:"
        confirmLabel="Đồng ý đặt phòng"
        cancelLabel="Quay lại sửa"
        details={
          pendingFormValues && selectedRoom
            ? [
                { label: 'Họ và tên khách', value: pendingFormValues.guest_name },
                { label: 'Số điện thoại', value: pendingFormValues.guest_phone },
                { label: 'Loại phòng đặt', value: selectedRoom.name },
                {
                  label: 'Thời gian nhận phòng',
                  value: `Lúc ${arrivalTime} — Ngày ${formatDateVN(checkInDate)}`,
                },
                {
                  label: 'Thời gian lưu trú',
                  value: `${nightsCount} đêm (Trả phòng: ${formatDateVN(checkOutDate)})`,
                },
              ]
            : []
        }
      />
    </>
  );
};
export default BookingPage;
