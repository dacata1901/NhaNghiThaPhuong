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
  Phone,
  MessageSquare,
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

const ARRIVAL_TIME_OPTIONS = [
  'Nhận phòng ngay',
  '08:00 - 10:00',
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00',
  '20:00 - 22:00',
  'Sau 22:00 đêm',
];

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { rooms, settings, createBooking } = useHotelData();

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
  const [arrivalTime, setArrivalTime] = useState<string>('14:00 - 16:00');
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
      `Giờ nhận phòng: ${arrivalTime}`,
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
        adults_count: selectedRoom.max_adults || 2,
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
        <div className="container-luxury max-w-2xl mx-auto">
          {createdBooking && selectedRoom ? (
            /* Màn hình xác nhận sau khi đặt xong */
            <div className="bg-bg-ivory-white border-2 border-brand-gold rounded-2xl p-6 sm:p-8 shadow-luxury-lg text-center">
              <div className="w-14 h-14 rounded-2xl bg-state-success/15 text-state-success flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                Đã Gửi Yêu Cầu Đặt Phòng!
              </h1>
              <p className="text-sm text-text-secondary mt-1.5">
                Cảm ơn <strong>{createdBooking.guest_name}</strong> (<strong>{createdBooking.guest_phone}</strong>). Lễ tân Nhà Nghỉ Tha Phương đã nhận được thông tin đặt phòng của bạn.
              </p>

              <div className="my-5 text-left bg-bg-ivory rounded-2xl p-5 border border-border-default space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary font-medium">Khách đặt phòng:</span>
                  <strong className="text-text-primary font-extrabold">
                    {createdBooking.guest_name}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary font-medium">Số điện thoại:</span>
                  <strong className="text-brand-gold-dark font-extrabold">
                    {createdBooking.guest_phone}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary font-medium">Loại phòng đăng ký:</span>
                  <strong className="text-text-primary font-extrabold">
                    {selectedRoom.name}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary font-medium">Ngày nhận phòng:</span>
                  <strong className="text-text-primary font-extrabold">
                    {formatDateVN(createdBooking.check_in_date)} ({createdBooking.nights_count} đêm)
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary font-medium">Thời gian nhận phòng:</span>
                  <strong className="text-state-success font-extrabold">
                    {arrivalTime}
                  </strong>
                </div>
              </div>

              {/* Nút gọi điện hoặc nhắn SMS trực tiếp cho chủ nhà */}
              <div className="p-4 rounded-2xl bg-bg-cream/60 border border-border-default mb-6">
                <p className="text-xs font-bold text-text-secondary mb-2.5">
                  Bấm để Gọi điện hoặc Nhắn SMS xác nhận nhanh với lễ tân:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={`tel:${settings.phone_primary.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-state-success text-white text-xs font-extrabold hover:opacity-95"
                  >
                    <Phone className="w-4 h-4" /> Gọi: {settings.phone_primary}
                  </a>
                  <a
                    href={`sms:${settings.phone_primary.replace(/\s+/g, '')}?body=${encodeURIComponent(`Toi la ${createdBooking.guest_name} (${createdBooking.guest_phone}) vua dat ${selectedRoom.name} nhan phong luc ${arrivalTime} ngay ${formatDateVN(createdBooking.check_in_date)}`)}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gold text-white text-xs font-extrabold hover:opacity-95"
                  >
                    <MessageSquare className="w-4 h-4" /> Gửi SMS cho Lễ tân
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-4 h-4" />}
                  className="rounded-xl font-bold"
                >
                  In phiếu đặt phòng
                </Button>
                <Link to="/">
                  <Button variant="primary" className="rounded-xl font-bold">
                    Về trang chủ
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* KHUNG ĐẶT PHÒNG ĐƠN GIẢN DUY NHẤT */
            <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-6 sm:p-8 shadow-luxury-lg">
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                  Đăng Ký Đặt Phòng
                </h1>
                <p className="text-sm text-text-secondary mt-1 font-medium">
                  Chọn loại phòng bạn muốn đặt, nhập Tên, Số điện thoại và Giờ nhận phòng
                </p>
              </div>

              {bookingError && (
                <div className="mb-5 p-3.5 rounded-xl bg-state-danger/10 border border-state-danger/30 text-state-danger text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onPreSubmit)} className="space-y-5" noValidate>
                {/* 1. Chọn loại phòng */}
                <div>
                  <label className="block text-sm font-extrabold text-text-primary mb-2.5">
                    1. Bạn muốn đặt phòng nào?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                          className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3.5 ${
                            isSelected
                              ? 'border-brand-gold bg-brand-gold/10 shadow-sm'
                              : 'border-border-default hover:border-brand-gold/50 bg-bg-ivory/60'
                          }`}
                        >
                          <img
                            src={thumb}
                            alt={room.name}
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-extrabold text-sm text-text-primary truncate">
                                {room.name}
                              </span>
                              {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-brand-gold text-white flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-bold text-text-secondary mt-1 block">
                              {room.bed_count} giường đôi • Tối đa {room.max_adults} người
                            </span>
                            <span className="text-[11px] font-bold text-brand-gold-dark mt-0.5 block">
                              Mã phòng: {room.room_code}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Họ tên & Số điện thoại */}
                <div>
                  <label className="block text-sm font-extrabold text-text-primary mb-2.5">
                    2. Thông tin khách đặt phòng
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

                {/* 3. Ngày nhận phòng, Giờ nhận phòng & Số đêm */}
                <div>
                  <label className="block text-sm font-extrabold text-text-primary mb-2.5">
                    3. Ngày &amp; Thời gian nhận phòng
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <span className="text-xs font-bold text-text-secondary mb-1.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-gold-dark" />
                        Ngày đến nhận phòng
                      </span>
                      <input
                        type="date"
                        min={dayjs().format('YYYY-MM-DD')}
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-bg-ivory border border-border-default text-sm font-bold text-text-primary focus:outline-none focus:border-brand-gold"
                      />
                    </div>

                    <div>
                      <span className="text-xs font-bold text-text-secondary mb-1.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-brand-gold-dark" />
                        Thời gian (Giờ) nhận phòng dự kiến
                      </span>
                      <select
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-bg-ivory border border-border-default text-sm font-bold text-text-primary focus:outline-none focus:border-brand-gold"
                      >
                        {ARRIVAL_TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Chọn nhanh số đêm */}
                  <div className="mt-3.5">
                    <span className="block text-xs font-bold text-text-secondary mb-1.5">
                      Thời gian lưu trú dự kiến
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNightsCount(n)}
                          className={`h-10 rounded-xl text-xs sm:text-sm font-extrabold border transition-all ${
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

                {/* Ghi chú ngắn gọn */}
                <div>
                  <input
                    type="text"
                    placeholder="Ghi chú thêm nếu có (Ví dụ: Đi 2 người, cần phòng tầng trệt)..."
                    className="w-full h-11 px-4 rounded-xl bg-bg-ivory border border-border-default text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold"
                    {...register('customer_notes')}
                  />
                </div>

                {/* Nút Đặt Phòng & Gọi / SMS */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    className="h-12 rounded-2xl text-base font-extrabold"
                  >
                    Xác Nhận Đặt Phòng Ngay
                  </Button>

                  <div className="mt-4 pt-4 border-t border-border-default flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-text-secondary">
                      Liên hệ trực tiếp lễ tân 24/7:
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${settings.phone_primary.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-state-success/15 text-state-success font-extrabold border border-state-success/30"
                      >
                        <Phone className="w-3.5 h-3.5" /> Gọi: {settings.phone_primary}
                      </a>
                      <a
                        href={`sms:${settings.phone_primary.replace(/\s+/g, '')}?body=Xin%20chao%20Nha%20Nghi%20Tha%20Phuong,%20toi%20muon%20dat%20phong`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-gold/15 text-brand-gold-dark font-extrabold border border-brand-gold/30"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Nhắn SMS
                      </a>
                    </div>
                  </div>
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
        description="Vui lòng kiểm tra lại thông tin đặt phòng của bạn một lần nữa trước khi gửi cho lễ tân:"
        confirmLabel="Đồng ý đặt phòng"
        cancelLabel="Quay lại sửa"
        details={
          pendingFormValues && selectedRoom
            ? [
                { label: 'Họ và tên khách', value: pendingFormValues.guest_name },
                { label: 'Số điện thoại', value: pendingFormValues.guest_phone },
                { label: 'Loại phòng đặt', value: selectedRoom.name },
                { label: 'Ngày nhận phòng', value: formatDateVN(checkInDate) },
                { label: 'Giờ nhận phòng', value: arrivalTime },
                { label: 'Số đêm ở', value: `${nightsCount} đêm` },
              ]
            : []
        }
      />
    </>
  );
};
export default BookingPage;
