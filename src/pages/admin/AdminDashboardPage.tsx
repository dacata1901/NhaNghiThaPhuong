import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  MessageSquare,
  Plus,
  Check,
  XCircle,
  Trash2,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PhoneActions } from '@/components/ui/PhoneActions';
import { formatDateVN } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/types';

export const AdminDashboardPage: React.FC = () => {
  const { bookings, contactMessages, updateBookingStatus, deleteBooking } =
    useHotelData();

  const [pendingAction, setPendingAction] = useState<{
    booking: Booking;
    newStatus: BookingStatus;
  } | null>(null);

  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  const stats = useMemo(() => {
    const pendingCount = bookings.filter((b) => b.status === 'pending').length;
    const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
    const unreadMessages = contactMessages.filter((m) => m.status === 'unread').length;

    return {
      pendingCount,
      confirmedCount,
      totalBookings: bookings.length,
      unreadMessages,
    };
  }, [bookings, contactMessages]);

  const handleConfirmAction = () => {
    if (!pendingAction) return;
    const { booking, newStatus } = pendingAction;
    updateBookingStatus(
      booking.id,
      newStatus,
      newStatus === 'confirmed'
        ? 'Chủ nhà đã xác nhận giữ phòng cho khách.'
        : 'Chủ nhà đã hủy đơn đặt phòng.'
    );
    setPendingAction(null);
  };

  const handleConfirmDeleteBooking = () => {
    if (!bookingToDelete) return;
    deleteBooking(bookingToDelete.id);
    setBookingToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-5 sm:p-6 shadow-luxury-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary">
            Bảng Theo Dõi Đặt Phòng Cho Chủ Nhà
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-text-secondary mt-1">
            Xem nhanh <strong>Khách hàng nào</strong> muốn đặt <strong>Phòng nào</strong>,{' '}
            <strong>Giờ nhận phòng cụ thể</strong>, bấm gọi/SMS xác nhận hoặc xóa đơn.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/admin/rooms">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="rounded-xl font-extrabold"
            >
              Quản lý Loại Phòng
            </Button>
          </Link>
          <Link to="/admin/bookings">
            <Button variant="primary" size="sm" className="rounded-xl font-extrabold">
              Tất cả đơn đặt phòng ({bookings.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Simple KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-5 shadow-luxury-sm">
          <div className="flex items-center justify-between text-xs font-extrabold text-text-secondary mb-2 uppercase tracking-wider">
            <span>Đơn chờ xác nhận</span>
            <Clock className="w-5 h-5 text-state-warning" />
          </div>
          <p className="text-3xl font-extrabold text-state-warning">
            {stats.pendingCount} đơn mới
          </p>
          <p className="text-xs font-semibold text-text-muted mt-1">
            Cần bấm Gọi điện hoặc Nhắn SMS xác nhận với khách
          </p>
        </div>

        <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-5 shadow-luxury-sm">
          <div className="flex items-center justify-between text-xs font-extrabold text-text-secondary mb-2 uppercase tracking-wider">
            <span>Đơn đã xác nhận giữ phòng</span>
            <CheckCircle2 className="w-5 h-5 text-state-success" />
          </div>
          <p className="text-3xl font-extrabold text-state-success">
            {stats.confirmedCount} đơn
          </p>
          <p className="text-xs font-semibold text-text-muted mt-1">
            Đã hẹn giờ đón khách nhận phòng
          </p>
        </div>

        <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-5 shadow-luxury-sm">
          <div className="flex items-center justify-between text-xs font-extrabold text-text-secondary mb-2 uppercase tracking-wider">
            <span>Tin nhắn khách hỏi</span>
            <MessageSquare className="w-5 h-5 text-brand-gold-dark" />
          </div>
          <p className="text-3xl font-extrabold text-text-primary">
            {stats.unreadMessages} tin mới
          </p>
          <p className="text-xs font-semibold text-text-muted mt-1">
            Tổng cộng {contactMessages.length} tin nhắn từ khách hàng
          </p>
        </div>
      </div>

      {/* Recent Bookings Table with Call/SMS, Confirm, Cancel & Delete */}
      <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-5 sm:p-6 shadow-luxury-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-brand-gold-dark" />
            Danh sách khách đăng ký đặt phòng mới nhất
          </h3>
          <Link
            to="/admin/bookings"
            className="text-xs font-extrabold text-brand-gold-dark hover:underline"
          >
            Xem toàn bộ &amp; Xuất file Excel →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-default text-xs font-extrabold uppercase tracking-wider text-text-primary bg-bg-ivory">
                <th className="py-3.5 px-4 rounded-tl-xl">Khách hàng &amp; Liên hệ</th>
                <th className="py-3.5 px-4">Phòng muốn đặt</th>
                <th className="py-3.5 px-4">Ngày &amp; Giờ nhận phòng</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right rounded-tr-xl">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center font-bold text-text-muted">
                    Hiện chưa có đơn đặt phòng nào.
                  </td>
                </tr>
              ) : (
                bookings.slice(0, 12).map((bk) => (
                  <tr key={bk.id} className="hover:bg-bg-ivory/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-extrabold text-base text-text-primary">
                        {bk.guest_name}
                      </div>
                      <div className="text-xs font-extrabold text-brand-gold-dark mt-0.5">
                        SĐT: {bk.guest_phone}
                      </div>
                      <div className="mt-2">
                        <PhoneActions
                          phone={bk.guest_phone}
                          size="sm"
                          smsBody={`Xin chào ${bk.guest_name}, Nhà Nghỉ Tha Phương xác nhận yêu cầu đặt ${bk.room_name} ngày ${formatDateVN(bk.check_in_date)}.`}
                        />
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-extrabold text-text-primary text-base">
                        {bk.room_name}
                      </div>
                      <div className="text-xs font-bold text-text-secondary mt-0.5">
                        Mã phòng: <strong>{bk.room_code}</strong>
                      </div>
                      <div className="text-[11px] font-bold text-text-muted mt-0.5">
                        Mã đơn: {bk.booking_code}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs">
                      <div className="font-extrabold text-text-primary">
                        Nhận: {formatDateVN(bk.check_in_date)} → Trả:{' '}
                        {formatDateVN(bk.check_out_date)} ({bk.nights_count} đêm)
                      </div>
                      {bk.customer_notes && (
                        <div className="mt-1.5 p-2.5 rounded-xl bg-brand-champagne/45 border border-brand-gold/40 text-text-primary font-extrabold">
                          {bk.customer_notes}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={bk.status} />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-2">
                        {bk.status === 'pending' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<Check className="w-3.5 h-3.5" />}
                              className="rounded-xl font-extrabold"
                              onClick={() =>
                                setPendingAction({
                                  booking: bk,
                                  newStatus: 'confirmed',
                                })
                              }
                            >
                              Xác nhận
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              leftIcon={<XCircle className="w-3.5 h-3.5" />}
                              className="rounded-xl font-extrabold"
                              onClick={() =>
                                setPendingAction({
                                  booking: bk,
                                  newStatus: 'cancelled',
                                })
                              }
                            >
                              Hủy
                            </Button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => setBookingToDelete(bk)}
                          className="p-2 rounded-xl border border-border-default bg-bg-ivory hover:border-state-danger text-state-danger transition-colors"
                          title="Xóa đơn đặt phòng này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal before confirming/cancelling booking */}
      <ConfirmDialog
        isOpen={Boolean(pendingAction)}
        title={
          pendingAction?.newStatus === 'confirmed'
            ? 'Xác nhận giữ phòng cho khách?'
            : 'Xác nhận HỦY đơn đặt phòng này?'
        }
        description={
          pendingAction?.newStatus === 'confirmed'
            ? 'Vui lòng kiểm tra lại thông tin khách hàng một lần nữa trước khi xác nhận:'
            : 'Bạn có chắc chắn muốn hủy bỏ yêu cầu đặt phòng của khách hàng này không?'
        }
        confirmText={
          pendingAction?.newStatus === 'confirmed'
            ? 'Đồng ý Xác nhận'
            : 'Đồng ý Hủy đơn'
        }
        cancelText="Quay lại"
        variant={pendingAction?.newStatus === 'confirmed' ? 'confirm' : 'danger'}
        details={
          pendingAction
            ? [
                { label: 'Khách hàng', value: pendingAction.booking.guest_name },
                { label: 'Số điện thoại', value: pendingAction.booking.guest_phone },
                { label: 'Phòng đặt', value: pendingAction.booking.room_name || '' },
                {
                  label: 'Ngày nhận phòng',
                  value: `${formatDateVN(pendingAction.booking.check_in_date)} (${pendingAction.booking.nights_count} đêm)`,
                },
                ...(pendingAction.booking.customer_notes
                  ? [
                      {
                        label: 'Giờ nhận & Ghi chú',
                        value: pendingAction.booking.customer_notes,
                      },
                    ]
                  : []),
              ]
            : []
        }
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      />

      {/* Confirmation Modal before deleting booking */}
      <ConfirmDialog
        isOpen={Boolean(bookingToDelete)}
        title="Xác nhận XÓA vĩnh viễn đơn đặt phòng này?"
        description="Đơn đặt phòng này sẽ bị xóa khỏi danh sách. Vui lòng kiểm tra lại thông tin một lần nữa trước khi xóa:"
        confirmText="Đồng ý Xóa đơn"
        cancelText="Giữ lại, không xóa"
        variant="danger"
        details={
          bookingToDelete
            ? [
                { label: 'Mã đơn', value: bookingToDelete.booking_code },
                { label: 'Khách hàng', value: bookingToDelete.guest_name },
                { label: 'Số điện thoại', value: bookingToDelete.guest_phone },
                { label: 'Loại phòng', value: bookingToDelete.room_name || '' },
              ]
            : []
        }
        onConfirm={handleConfirmDeleteBooking}
        onCancel={() => setBookingToDelete(null)}
      />
    </div>
  );
};
