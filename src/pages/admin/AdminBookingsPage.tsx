import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Search,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Save,
  Filter,
  Calendar,
  Trash2,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PhoneActions } from '@/components/ui/PhoneActions';
import { TextAreaField } from '@/components/ui/InputField';
import { formatDateVN, formatDateTimeVN } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/types';

export const AdminBookingsPage: React.FC = () => {
  const {
    bookings,
    bookingHistory,
    settings,
    updateBookingStatus,
    updateBookingAdminNotes,
    deleteBooking,
  } = useHotelData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [dateFilter, setDateFilter] = useState('');

  // Detail Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [internalNotesDraft, setInternalNotesDraft] = useState('');
  const [notesSavedToast, setNotesSavedToast] = useState(false);

  // Confirm Dialog State for status changes and deletion
  const [pendingStatusAction, setPendingStatusAction] = useState<{
    booking: Booking;
    newStatus: BookingStatus;
    note: string;
  } | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        b.booking_code.toLowerCase().includes(q) ||
        b.guest_name.toLowerCase().includes(q) ||
        b.guest_phone.toLowerCase().includes(q) ||
        (b.room_name || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

      const matchesDate =
        !dateFilter ||
        b.check_in_date === dateFilter ||
        b.check_out_date === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, searchQuery, statusFilter, dateFilter]);

  const handleOpenDetail = (bk: Booking) => {
    setSelectedBooking(bk);
    setInternalNotesDraft(bk.internal_admin_notes || '');
    setNotesSavedToast(false);
  };

  const handleConfirmStatusUpdate = () => {
    if (!pendingStatusAction) return;
    const { booking, newStatus, note } = pendingStatusAction;
    updateBookingStatus(booking.id, newStatus, note);

    setSelectedBooking((prev) =>
      prev && prev.id === booking.id
        ? {
            ...prev,
            status: newStatus,
          }
        : prev
    );
    setPendingStatusAction(null);
  };

  const handleConfirmDeleteBooking = () => {
    if (!bookingToDelete) return;
    deleteBooking(bookingToDelete.id);
    if (selectedBooking?.id === bookingToDelete.id) {
      setSelectedBooking(null);
    }
    setBookingToDelete(null);
  };

  const handleSaveInternalNotes = () => {
    if (!selectedBooking) return;
    updateBookingAdminNotes(selectedBooking.id, internalNotesDraft);
    setSelectedBooking({
      ...selectedBooking,
      internal_admin_notes: internalNotesDraft,
    });
    setNotesSavedToast(true);
    setTimeout(() => setNotesSavedToast(false), 2500);
  };

  // Export filtered bookings to Excel (.xlsx)
  const handleExportExcel = () => {
    const rows = filteredBookings.map((b, idx) => ({
      STT: idx + 1,
      'Mã Đặt Phòng': b.booking_code,
      'Tên Khách Hàng': b.guest_name,
      'Số Điện Thoại': b.guest_phone,
      'Loại Phòng Muốn Đặt': b.room_name || '',
      'Mã Phòng': b.room_code || '',
      'Ngày Nhận Phòng': formatDateVN(b.check_in_date),
      'Ngày Trả Phòng': formatDateVN(b.check_out_date),
      'Số Đêm': b.nights_count,
      'Giờ Nhận Phòng & Ghi Chú': b.customer_notes || '',
      'Trạng Thái': b.status,
      'Ghi Chú Nội Bộ': b.internal_admin_notes || '',
      'Thời Gian Đăng Ký': formatDateTimeVN(b.created_at),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachDatPhong');
    XLSX.writeFile(
      workbook,
      `DatPhong_NhaNghiThaPhuong_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Print formatted booking slip
  const handlePrintBookingSlip = (bk: Booking) => {
    const printWin = window.open('', '_blank', 'width=820,height=720');
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Phiếu Đặt Phòng ${bk.booking_code} - ${settings.hotel_name}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #221813; padding: 32px; line-height: 1.6; }
          .header { border-bottom: 2px solid #B69A68; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; }
          h1 { margin: 0; font-size: 22px; text-transform: uppercase; }
          .code-box { background: #F8F5EF; border: 1px solid #B69A68; padding: 12px 18px; font-weight: bold; font-size: 18px; border-radius: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #DCD0BA; padding: 10px 12px; text-align: left; font-size: 14px; }
          th { background: #EFE8DA; width: 35%; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>${settings.hotel_name}</h1>
            <div><strong>Số điện thoại lễ tân:</strong> ${settings.phone_primary}</div>
            <div><strong>Địa chỉ:</strong> ${settings.address_text}</div>
          </div>
          <div class="code-box">
            MÃ ĐẶT PHÒNG<br/>${bk.booking_code}
          </div>
        </div>
        <h2>PHIẾU XÁC NHẬN THÔNG TIN ĐẶT PHÒNG</h2>
        <table>
          <tr><th>Họ và tên khách hàng</th><td><strong>${bk.guest_name}</strong></td></tr>
          <tr><th>Số điện thoại liên hệ</th><td><strong>${bk.guest_phone}</strong></td></tr>
          <tr><th>Loại phòng muốn đặt</th><td><strong>${bk.room_name} (${bk.room_code})</strong></td></tr>
          <tr><th>Ngày nhận phòng</th><td><strong>${formatDateVN(bk.check_in_date)}</strong></td></tr>
          <tr><th>Ngày trả phòng dự kiến</th><td><strong>${formatDateVN(bk.check_out_date)}</strong> (${bk.nights_count} đêm)</td></tr>
          <tr><th>Giờ nhận phòng & Ghi chú</th><td><strong>${bk.customer_notes || 'Không có ghi chú'}</strong></td></tr>
        </table>
        <div class="footer">
          <div>
            <strong>Khách lưu trú ký tên</strong><br/><br/><br/>
            (${bk.guest_name})
          </div>
          <div>
            <strong>Lễ tân ${settings.hotel_name}</strong><br/><br/><br/>
            (Ký & ghi rõ họ tên)
          </div>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  const selectedHistory = selectedBooking
    ? bookingHistory.filter((h) => h.booking_id === selectedBooking.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header & Export Excel Bar */}
      <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-6 shadow-luxury-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-gold-dark">
            QUẢN LÝ ĐƠN ĐẶT PHÒNG ĐƠN GIẢN
          </span>
          <h2 className="font-serif text-2xl font-extrabold text-text-primary mt-1">
            Danh Sách Khách Đặt Phòng ({filteredBookings.length} đơn)
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-text-secondary mt-1">
            Bấm trực tiếp vào số điện thoại để <strong>Gọi điện / Nhắn SMS</strong>. Mọi thao tác Xác nhận, Hủy hoặc Xóa đơn đều có bước hỏi lại an toàn.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportExcel}
          className="rounded-xl font-extrabold"
        >
          Xuất danh sách Excel (.xlsx)
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-4 sm:p-5 shadow-luxury-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 relative">
          <input
            type="text"
            placeholder="Tìm theo tên khách, số điện thoại hoặc tên phòng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-9 pr-3.5 rounded-xl bg-bg-ivory border border-border-default text-xs sm:text-sm font-bold text-text-primary focus:outline-none focus:border-brand-gold"
          />
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-gold-dark shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | BookingStatus)}
            className="w-full h-11 px-3 rounded-xl bg-bg-ivory border border-border-default text-xs sm:text-sm font-bold text-text-primary"
          >
            <option value="all">Tất cả trạng thái ({bookings.length})</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận giữ phòng</option>
            <option value="completed">Khách đã nhận phòng / Hoàn thành</option>
            <option value="cancelled">Đã hủy bỏ</option>
          </select>
        </div>

        <div className="md:col-span-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-gold-dark shrink-0" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-bg-ivory border border-border-default text-xs sm:text-sm font-bold text-text-primary"
            title="Lọc theo ngày nhận phòng"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="text-xs font-extrabold text-state-danger hover:underline shrink-0"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-bg-ivory-white border border-border-default rounded-2xl shadow-luxury-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-default text-xs font-extrabold uppercase tracking-wider text-text-primary bg-bg-ivory">
                <th className="py-3.5 px-4">Khách hàng &amp; Gọi / SMS</th>
                <th className="py-3.5 px-4">Phòng muốn đặt</th>
                <th className="py-3.5 px-4">Ngày lưu trú</th>
                <th className="py-3.5 px-4">Giờ nhận phòng &amp; Ghi chú</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center font-bold text-text-muted">
                    Không tìm thấy đơn đặt phòng nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((bk) => (
                  <tr key={bk.id} className="hover:bg-bg-ivory/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-extrabold text-base text-text-primary">
                        {bk.guest_name}
                      </div>
                      <div className="mt-1.5">
                        <PhoneActions
                          phone={bk.guest_phone}
                          size="sm"
                          smsBody={`Xin chào ${bk.guest_name}, Nhà Nghỉ Tha Phương xác nhận đơn đặt ${bk.room_name} ngày ${formatDateVN(bk.check_in_date)}.`}
                        />
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-extrabold text-base text-text-primary">
                        {bk.room_name}
                      </div>
                      <div className="text-xs font-bold text-text-secondary mt-0.5">
                        Mã phòng: <strong>{bk.room_code}</strong>
                      </div>
                      <span className="text-[11px] font-bold text-text-muted block mt-0.5">
                        Mã đơn: {bk.booking_code}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs text-text-secondary">
                      <div>
                        Nhận: <strong className="text-text-primary">{formatDateVN(bk.check_in_date)}</strong>
                      </div>
                      <div>
                        Trả: <strong className="text-text-primary">{formatDateVN(bk.check_out_date)}</strong>
                      </div>
                      <span className="text-brand-gold-dark font-extrabold">
                        ({bk.nights_count} đêm)
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs max-w-xs">
                      {bk.customer_notes ? (
                        <div className="p-2.5 rounded-xl bg-brand-champagne/45 border border-brand-gold/40 font-extrabold text-text-primary">
                          {bk.customer_notes}
                        </div>
                      ) : (
                        <span className="text-text-muted font-semibold">
                          Không có ghi chú
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={bk.status} />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="ml-auto w-[208px] flex flex-col gap-2">
                        {bk.status === 'pending' && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setPendingStatusAction({
                                  booking: bk,
                                  newStatus: 'confirmed',
                                  note: 'Lễ tân đã xác nhận giữ phòng cho khách.',
                                })
                              }
                              className="h-9 inline-flex items-center justify-center gap-1.5 rounded-xl bg-state-success text-white text-xs font-extrabold shadow-sm hover:brightness-95 transition"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Xác nhận</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setPendingStatusAction({
                                  booking: bk,
                                  newStatus: 'cancelled',
                                  note: 'Đơn đặt phòng đã được hủy bỏ.',
                                })
                              }
                              className="h-9 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-state-danger/50 text-state-danger text-xs font-extrabold hover:bg-state-danger hover:text-white transition"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Hủy đơn</span>
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(bk)}
                            className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-xl bg-bg-ivory border border-border-default text-text-primary text-xs font-extrabold hover:border-brand-gold hover:text-brand-gold-dark transition"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Chi tiết</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrintBookingSlip(bk)}
                            className="w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-xl bg-bg-ivory border border-border-default text-text-secondary hover:border-brand-gold hover:text-text-primary transition"
                            title="In phiếu đặt phòng"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setBookingToDelete(bk)}
                            className="w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-xl bg-bg-ivory border border-border-default text-state-danger hover:bg-state-danger hover:text-white hover:border-state-danger transition"
                            title="Xóa đơn đặt phòng này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <Modal
          isOpen={Boolean(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          title={`Chi Tiết Đặt Phòng: ${selectedBooking.guest_name}`}
          subtitle={`Mã đơn: ${selectedBooking.booking_code} • Đăng ký lúc ${formatDateTimeVN(selectedBooking.created_at)}`}
          maxWidthClass="max-w-2xl"
          footer={
            <div className="w-full flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => setBookingToDelete(selectedBooking)}
                className="rounded-xl font-extrabold"
              >
                Xóa đơn này
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  leftIcon={<Printer className="w-4 h-4" />}
                  onClick={() => handlePrintBookingSlip(selectedBooking)}
                  className="rounded-xl font-extrabold"
                >
                  In phiếu đặt phòng
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setSelectedBooking(null)}
                  className="rounded-xl font-extrabold"
                >
                  Đóng cửa sổ
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-sm">
            {/* Guest & Stay Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-bg-ivory border border-border-default">
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-text-muted block">
                  Thông tin khách hàng
                </span>
                <p className="font-serif text-lg font-extrabold text-text-primary">
                  {selectedBooking.guest_name}
                </p>
                <PhoneActions
                  phone={selectedBooking.guest_phone}
                  size="sm"
                  smsBody={`Xin chào ${selectedBooking.guest_name}, Nhà Nghỉ Tha Phương liên hệ về đơn đặt ${selectedBooking.room_name}.`}
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-text-muted block">
                  Phòng &amp; Thời gian nhận phòng
                </span>
                <p className="font-serif text-lg font-extrabold text-text-primary">
                  {selectedBooking.room_name} ({selectedBooking.room_code})
                </p>
                <p className="text-text-secondary font-bold">
                  Nhận: <strong>{formatDateVN(selectedBooking.check_in_date)}</strong> → Trả:{' '}
                  <strong>{formatDateVN(selectedBooking.check_out_date)}</strong> (
                  {selectedBooking.nights_count} đêm)
                </p>
                <div className="pt-1">
                  <StatusBadge status={selectedBooking.status} />
                </div>
              </div>
            </div>

            {selectedBooking.customer_notes && (
              <div className="p-4 rounded-2xl bg-brand-champagne/45 border border-brand-gold/40">
                <span className="text-xs font-extrabold uppercase tracking-wider text-bg-wood-deep block mb-1">
                  Giờ nhận phòng cụ thể &amp; Ghi chú của khách:
                </span>
                <p className="font-extrabold text-text-primary">
                  {selectedBooking.customer_notes}
                </p>
              </div>
            )}

            {/* Workflow Status Actions */}
            <div className="p-4 rounded-2xl bg-bg-cream/60 border border-border-default space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-text-primary block">
                Cập nhật trạng thái đơn đặt phòng (Có bước xác nhận an toàn)
              </span>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={selectedBooking.status === 'confirmed'}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  className="rounded-xl font-extrabold"
                  onClick={() =>
                    setPendingStatusAction({
                      booking: selectedBooking,
                      newStatus: 'confirmed',
                      note: 'Lễ tân đã xác nhận giữ phòng cho khách.',
                    })
                  }
                >
                  Xác nhận Giữ phòng
                </Button>

                <Button
                  variant="dark"
                  size="sm"
                  disabled={selectedBooking.status === 'completed'}
                  className="rounded-xl font-extrabold"
                  onClick={() =>
                    setPendingStatusAction({
                      booking: selectedBooking,
                      newStatus: 'completed',
                      note: 'Khách đã nhận phòng và hoàn tất lưu trú.',
                    })
                  }
                >
                  Khách đã nhận phòng (Hoàn tất)
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  disabled={selectedBooking.status === 'cancelled'}
                  leftIcon={<XCircle className="w-3.5 h-3.5" />}
                  className="rounded-xl font-extrabold"
                  onClick={() =>
                    setPendingStatusAction({
                      booking: selectedBooking,
                      newStatus: 'cancelled',
                      note: 'Đơn đặt phòng đã bị hủy bởi Quản trị viên.',
                    })
                  }
                >
                  Hủy đơn đặt phòng
                </Button>
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-2">
              <TextAreaField
                label="Ghi chú riêng của Chủ nhà (Chỉ Admin thấy)"
                rows={2}
                placeholder="Ví dụ: Đã gọi điện xác nhận, khách hẹn 18:00 tới nhận phòng..."
                value={internalNotesDraft}
                onChange={(e) => setInternalNotesDraft(e.target.value)}
              />
              <div className="flex items-center justify-between">
                {notesSavedToast ? (
                  <span className="text-xs text-state-success font-extrabold">
                    ✓ Đã lưu ghi chú nội bộ
                  </span>
                ) : (
                  <span />
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                  onClick={handleSaveInternalNotes}
                  className="rounded-xl font-extrabold"
                >
                  Lưu ghi chú
                </Button>
              </div>
            </div>

            {/* Booking Status History */}
            <div className="pt-4 border-t border-border-default">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-gold-dark" />
                Lịch sử thao tác ({selectedHistory.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedHistory.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl bg-bg-ivory border border-border-default text-xs flex items-start justify-between gap-4"
                  >
                    <div>
                      <StatusBadge status={h.new_status} />
                      <p className="font-bold text-text-secondary mt-1">{h.note}</p>
                    </div>
                    <span className="text-[11px] font-bold text-text-muted shrink-0">
                      {formatDateTimeVN(h.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog for Status Changes */}
      <ConfirmDialog
        isOpen={Boolean(pendingStatusAction)}
        title={
          pendingStatusAction?.newStatus === 'confirmed'
            ? 'Xác nhận giữ phòng cho khách?'
            : pendingStatusAction?.newStatus === 'completed'
            ? 'Xác nhận khách đã nhận phòng?'
            : 'Xác nhận HỦY bỏ đơn đặt phòng này?'
        }
        description="Vui lòng kiểm tra lại thông tin khách hàng một lần nữa để tránh nhầm lẫn:"
        confirmText={
          pendingStatusAction?.newStatus === 'cancelled'
            ? 'Đồng ý Hủy đơn'
            : 'Đồng ý Xác nhận'
        }
        cancelText="Quay lại"
        variant={
          pendingStatusAction?.newStatus === 'cancelled' ? 'danger' : 'confirm'
        }
        details={
          pendingStatusAction
            ? [
                {
                  label: 'Khách hàng',
                  value: pendingStatusAction.booking.guest_name,
                },
                {
                  label: 'Số điện thoại',
                  value: pendingStatusAction.booking.guest_phone,
                },
                {
                  label: 'Loại phòng',
                  value: pendingStatusAction.booking.room_name || '',
                },
                {
                  label: 'Ngày nhận phòng',
                  value: `${formatDateVN(pendingStatusAction.booking.check_in_date)} (${pendingStatusAction.booking.nights_count} đêm)`,
                },
                ...(pendingStatusAction.booking.customer_notes
                  ? [
                      {
                        label: 'Giờ nhận & Ghi chú',
                        value: pendingStatusAction.booking.customer_notes,
                      },
                    ]
                  : []),
              ]
            : []
        }
        onConfirm={handleConfirmStatusUpdate}
        onCancel={() => setPendingStatusAction(null)}
      />

      {/* Confirmation Dialog for Deleting Booking */}
      <ConfirmDialog
        isOpen={Boolean(bookingToDelete)}
        title="Xác nhận XÓA vĩnh viễn đơn đặt phòng này?"
        description="Đơn đặt phòng sẽ bị xóa khỏi danh sách quản lý. Vui lòng kiểm tra lại thông tin một lần nữa trước khi xóa:"
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
