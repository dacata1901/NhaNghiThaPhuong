import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  Phone,
  Mail,
  ShieldAlert,
  CheckCircle2,
  Printer,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { PageBanner } from '@/components/common/PageBanner';
import { Button } from '@/components/ui/Button';
import { InputField, TextAreaField } from '@/components/ui/InputField';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { formatDateVN, formatDateTimeVN, formatVND } from '@/lib/utils';
import type { Booking, Room } from '@/types';

export const BookingLookupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    lookupBooking,
    requestCancelBooking,
    bookingHistory,
    settings,
  } = useHotelData();

  const [bookingCode, setBookingCode] = useState(
    searchParams.get('code') || ''
  );
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [foundRoom, setFoundRoom] = useState<Room | undefined>(undefined);

  // Cancel Request Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setCancelSuccess(null);

    const result = lookupBooking(bookingCode, phoneOrEmail);
    if (!result.success || !result.booking) {
      setFoundBooking(null);
      setFoundRoom(undefined);
      setErrorMsg(
        result.error ||
          'Không tìm thấy đơn đặt phòng khớp với thông tin xác thực.'
      );
      return;
    }

    setFoundBooking(result.booking);
    setFoundRoom(result.room);
  };

  const fillSampleBooking = (code: string, phone: string) => {
    setBookingCode(code);
    setPhoneOrEmail(phone);
    setErrorMsg(null);
    const result = lookupBooking(code, phone);
    if (result.success && result.booking) {
      setFoundBooking(result.booking);
      setFoundRoom(result.room);
    }
  };

  const handleConfirmCancelRequest = () => {
    if (!foundBooking) return;
    setCancelError(null);
    const res = requestCancelBooking(
      foundBooking.booking_code,
      phoneOrEmail,
      cancelReason
    );
    if (!res.success) {
      setCancelError(res.error || 'Không thể gửi yêu cầu hủy phòng.');
      return;
    }

    // Refresh lookup state
    const refreshed = lookupBooking(foundBooking.booking_code, phoneOrEmail);
    if (refreshed.booking) {
      setFoundBooking(refreshed.booking);
    }
    setIsCancelModalOpen(false);
    setCancelReason('');
    setCancelSuccess(
      'Đơn đặt phòng của quý khách đã được chuyển sang trạng thái Đã hủy và gửi thông báo tới lễ tân.'
    );
  };

  const historyItems = foundBooking
    ? bookingHistory.filter((h) => h.booking_id === foundBooking.id)
    : [];

  return (
    <>
      <SEOHead
        title="Tra Cứu Đặt Phòng | Nhà Nghỉ Tha Phương"
        description="Tra cứu thông tin đặt phòng trực tuyến bằng Mã đặt phòng và Số điện thoại hoặc Email xác thực tại Nhà Nghỉ Tha Phương."
        canonicalPath="/booking-lookup"
      />

      <PageBanner
        eyebrow="BOOKING VERIFICATION • TRA CỨU ĐẶT PHÒNG"
        title="Kiểm Tra Trạng Thái Đặt Phòng"
        subtitle="Để bảo mật thông tin khách lưu trú, quý khách vui lòng nhập đồng thời Mã đặt phòng và Số điện thoại (hoặc Email) đã dùng khi đặt phòng."
        breadcrumbs={[{ label: 'Tra cứu đặt phòng' }]}
      />

      <section className="py-12 lg:py-16 bg-bg-ivory">
        <div className="container-luxury max-w-4xl">
          {/* Search Form Card */}
          <div className="bg-bg-ivory-white border border-border-default rounded-classic p-6 sm:p-8 shadow-luxury-md">
            <form onSubmit={handleLookup} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField
                  label="Mã đặt phòng (Booking Code)"
                  placeholder="Ví dụ: TP-2026-1001"
                  required
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                />
                <InputField
                  label="Số điện thoại hoặc Email xác thực"
                  placeholder="Ví dụ: 0901234567 hoặc email@gmail.com"
                  required
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="text-xs text-text-secondary flex flex-wrap items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold-dark shrink-0" />
                  <span>Dữ liệu mẫu để kiểm thử nhanh:</span>
                  <button
                    type="button"
                    onClick={() => fillSampleBooking('TP-2026-1001', '0901234567')}
                    className="px-2.5 py-1 rounded-classic bg-bg-cream hover:bg-brand-champagne text-text-primary font-medium border border-border-default transition-colors"
                  >
                    TP-2026-1001 (Đã xác nhận)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillSampleBooking('TP-2026-1002', '0912345678')}
                    className="px-2.5 py-1 rounded-classic bg-bg-cream hover:bg-brand-champagne text-text-primary font-medium border border-border-default transition-colors"
                  >
                    TP-2026-1002 (Chờ xác nhận)
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  leftIcon={<Search className="w-4 h-4" />}
                >
                  Tra cứu ngay
                </Button>
              </div>
            </form>

            {errorMsg && (
              <div className="mt-6 p-4 rounded-classic bg-state-danger/10 border border-state-danger/30 text-state-danger flex items-start gap-3 text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {cancelSuccess && (
              <div className="mt-6 p-4 rounded-classic bg-state-success/10 border border-state-success/30 text-state-success flex items-start gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{cancelSuccess}</span>
              </div>
            )}
          </div>

          {/* Booking Result Card */}
          {foundBooking && (
            <div className="mt-8 bg-bg-ivory-white border border-border-strong rounded-classic p-6 sm:p-8 shadow-luxury-md">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border-default">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold-dark">
                    THÔNG TIN ĐẶT PHÒNG ĐÃ XÁC THỰC
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
                      {foundBooking.booking_code}
                    </h2>
                    <StatusBadge status={foundBooking.status} />
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Ngày tạo đơn: {formatDateTimeVN(foundBooking.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Printer className="w-4 h-4" />}
                    onClick={() => window.print()}
                  >
                    In phiếu
                  </Button>
                  {(foundBooking.status === 'pending' ||
                    foundBooking.status === 'confirmed') && (
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<XCircle className="w-4 h-4" />}
                      onClick={() => setIsCancelModalOpen(true)}
                    >
                      Yêu cầu hủy phòng
                    </Button>
                  )}
                </div>
              </div>

              {/* Room & Stay Info */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-6 border-b border-border-default">
                <div className="md:col-span-5">
                  {foundRoom && (
                    <img
                      src={foundRoom.media[0]?.url}
                      alt={foundBooking.room_name || foundRoom.name}
                      className="w-full h-44 object-cover rounded-classic border border-border-default mb-3"
                    />
                  )}
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-gold-dark">
                    Mã phòng: {foundBooking.room_code || foundRoom?.room_code}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-text-primary mt-0.5">
                    {foundBooking.room_name || foundRoom?.name}
                  </h3>
                  {foundRoom && (
                    <Link
                      to={`/rooms/${foundRoom.slug}`}
                      className="inline-block text-xs text-brand-gold-dark underline mt-1"
                    >
                      Xem chi tiết hạng phòng này →
                    </Link>
                  )}
                </div>

                <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 rounded-classic bg-bg-ivory border border-border-default">
                    <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">
                      Lịch trình lưu trú
                    </span>
                    <p className="text-text-secondary">
                      Nhận phòng:{' '}
                      <strong className="text-text-primary">
                        {formatDateVN(foundBooking.check_in_date)}
                      </strong>{' '}
                      ({settings.check_in_time})
                    </p>
                    <p className="text-text-secondary mt-1">
                      Trả phòng:{' '}
                      <strong className="text-text-primary">
                        {formatDateVN(foundBooking.check_out_date)}
                      </strong>{' '}
                      ({settings.check_out_time})
                    </p>
                    <p className="text-text-secondary mt-1">
                      Số đêm: <strong>{foundBooking.nights_count} đêm</strong> •{' '}
                      {foundBooking.adults_count} người lớn
                      {foundBooking.children_count > 0
                        ? `, ${foundBooking.children_count} trẻ em`
                        : ''}
                    </p>
                  </div>

                  <div className="p-4 rounded-classic bg-bg-ivory border border-border-default">
                    <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">
                      Khách lưu trú & Thanh toán
                    </span>
                    <p className="font-semibold text-text-primary">
                      {foundBooking.guest_name}
                    </p>
                    <p className="text-text-secondary text-xs mt-1">
                      SĐT: {foundBooking.guest_phone}
                    </p>
                    <p className="text-text-secondary text-xs">
                      Email: {foundBooking.guest_email}
                    </p>
                    <div className="mt-3 pt-2 border-t border-border-default">
                      <span className="text-xs text-text-muted block">
                        Tổng tiền ({foundBooking.nights_count} đêm):
                      </span>
                      <span className="font-serif text-xl font-bold text-bg-wood-deep">
                        {formatVND(foundBooking.total_amount)}
                      </span>
                      <span className="block text-[11px] text-state-success font-medium mt-0.5">
                        Thu trực tiếp tại lễ tân khi nhận phòng
                      </span>
                    </div>
                  </div>

                  {foundBooking.customer_notes && (
                    <div className="sm:col-span-2 p-3.5 rounded-classic bg-bg-cream/60 border border-border-default text-xs text-text-secondary">
                      <strong>Ghi chú của khách hàng:</strong> {foundBooking.customer_notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Status History & Cancellation Policy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-sm">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-gold-dark" />
                    Lịch sử cập nhật trạng thái
                  </h4>
                  <div className="space-y-2.5">
                    {historyItems.map((h) => (
                      <div
                        key={h.id}
                        className="p-3 rounded-classic bg-bg-ivory border border-border-default text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <StatusBadge status={h.new_status} />
                          <span className="text-text-muted">
                            {formatDateTimeVN(h.created_at)}
                          </span>
                        </div>
                        {h.note && <p className="text-text-secondary mt-1">{h.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-classic bg-bg-cream/50 border border-border-default flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-2">
                      Chính sách hủy phòng & Hỗ trợ lễ tân
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {settings.cancellation_policy_summary}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border-default flex flex-wrap items-center gap-4 text-xs">
                    <a
                      href={`tel:${settings.phone_primary}`}
                      className="inline-flex items-center gap-1.5 font-semibold text-bg-wood-deep hover:text-brand-gold-dark"
                    >
                      <Phone className="w-3.5 h-3.5 text-brand-gold-dark" />
                      Hotline: {settings.phone_primary}
                    </a>
                    <a
                      href={`mailto:${settings.email_notification}`}
                      className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary"
                    >
                      <Mail className="w-3.5 h-3.5 text-brand-gold-dark" />
                      {settings.email_notification}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Cancel Request Modal matching Figma Frame 6:257 */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Xác Nhận Yêu Cầu Hủy Đặt Phòng"
        subtitle={`Bạn đang yêu cầu hủy đơn đặt phòng mã ${foundBooking?.booking_code || ''}.`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Giữ lại phòng
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancelRequest}
            >
              Xác nhận hủy đặt phòng
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-text-secondary leading-relaxed bg-bg-cream/70 p-3 rounded-classic border border-border-default">
            Lưu ý: Sau khi xác nhận hủy, suất phòng sẽ được mở lại cho khách hàng khác đặt. Quý khách vui lòng cho biết lý do hủy để Nhà Nghỉ Tha Phương hỗ trợ tốt hơn.
          </p>
          <TextAreaField
            label="Lý do hủy đặt phòng"
            placeholder="Ví dụ: Thay đổi lịch trình công tác đột xuất..."
            required
            value={cancelReason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setCancelReason(e.target.value)
            }
            error={cancelError || undefined}
          />
        </div>
      </Modal>
    </>
  );
};
