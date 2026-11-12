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
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { TextAreaField } from '@/components/ui/InputField';
import { formatVND, formatDateVN, formatDateTimeVN } from '@/lib/utils';
import type { Booking, BookingStatus, PaymentStatus } from '@/types';

export const AdminBookingsPage: React.FC = () => {
  const {
    bookings,
    bookingHistory,
    settings,
    updateBookingStatus,
    updateBookingAdminNotes,
  } = useHotelData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [dateFilter, setDateFilter] = useState('');

  // Detail Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [internalNotesDraft, setInternalNotesDraft] = useState('');
  const [statusChangeNote, setStatusChangeNote] = useState('');
  const [notesSavedToast, setNotesSavedToast] = useState(false);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        b.booking_code.toLowerCase().includes(q) ||
        b.guest_name.toLowerCase().includes(q) ||
        b.guest_phone.toLowerCase().includes(q) ||
        b.guest_email.toLowerCase().includes(q);

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
    setStatusChangeNote('');
    setNotesSavedToast(false);
  };

  const handleUpdateStatus = (
    bookingId: string,
    newStatus: BookingStatus,
    defaultNote: string,
    paymentStatus?: PaymentStatus
  ) => {
    const note = statusChangeNote.trim() || defaultNote;
    updateBookingStatus(bookingId, newStatus, note, paymentStatus);
    setStatusChangeNote('');
    // Refresh selectedBooking if open
    setSelectedBooking((prev) =>
      prev && prev.id === bookingId
        ? {
            ...prev,
            status: newStatus,
            payment_status: paymentStatus || prev.payment_status,
          }
        : prev
    );
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
      'Mã Booking': b.booking_code,
      'Tên Khách Hàng': b.guest_name,
      'Số Điện Thoại': b.guest_phone,
      Email: b.guest_email,
      'Hạng Phòng': b.room_name || '',
      'Mã Phòng': b.room_code || '',
      'Ngày Nhận Phòng': formatDateVN(b.check_in_date),
      'Ngày Trả Phòng': formatDateVN(b.check_out_date),
      'Số Đêm': b.nights_count,
      'Người Lớn': b.adults_count,
      'Trẻ Em': b.children_count,
      'Đơn Giá / Đêm (VNĐ)': b.price_per_night_snapshot,
      'Tổng Tiền (VNĐ)': b.total_amount,
      'Trạng Thái Booking': b.status,
      'Trạng Thái Thanh Toán': b.payment_status,
      'Ghi Chú Khách Hàng': b.customer_notes || '',
      'Ghi Chú Nội Bộ': b.internal_admin_notes || '',
      'Thời Gian Tạo': formatDateTimeVN(b.created_at),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachBooking');
    XLSX.writeFile(
      workbook,
      `Booking_NhaNghiThaPhuong_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Print formatted booking slip in a clean popup/print window
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
          body { font-family: Arial, sans-serif; color: #30251F; padding: 32px; line-height: 1.6; }
          .header { border-bottom: 2px solid #B69A68; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; }
          h1 { margin: 0; font-size: 22px; text-transform: uppercase; }
          .code-box { background: #F8F5EF; border: 1px solid #B69A68; padding: 12px 18px; font-weight: bold; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #E0D5C2; padding: 10px 12px; text-align: left; font-size: 14px; }
          th { background: #EFE8DA; width: 35%; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>${settings.hotel_name}</h1>
            <div>Hotline lễ tân: ${settings.phone_primary} | Email: ${settings.email_notification}</div>
            <div>Địa chỉ: ${settings.address_text}</div>
          </div>
          <div class="code-box">
            MÃ ĐẶT PHÒNG<br/>${bk.booking_code}
          </div>
        </div>
        <h2>PHIẾU XÁC NHẬN ĐẶT PHÒNG LƯU TRÚ</h2>
        <table>
          <tr><th>Họ và tên khách hàng</th><td><strong>${bk.guest_name}</strong></td></tr>
          <tr><th>Số điện thoại / Email</th><td>${bk.guest_phone} — ${bk.guest_email}</td></tr>
          <tr><th>Hạng phòng đăng ký</th><td><strong>${bk.room_name} (${bk.room_code})</strong></td></tr>
          <tr><th>Ngày nhận phòng</th><td>${formatDateVN(bk.check_in_date)} (từ ${settings.check_in_time})</td></tr>
          <tr><th>Ngày trả phòng</th><td>${formatDateVN(bk.check_out_date)} (trước ${settings.check_out_time})</td></tr>
          <tr><th>Thời gian & Số khách</th><td>${bk.nights_count} đêm — ${bk.adults_count} người lớn, ${bk.children_count} trẻ em</td></tr>
          <tr><th>Đơn giá tại thời điểm đặt</th><td>${formatVND(bk.price_per_night_snapshot)} / đêm</td></tr>
          <tr><th>TỔNG TIỀN THANH TOÁN</th><td><strong style="font-size:18px;">${formatVND(bk.total_amount)}</strong> (Thu trực tiếp tại lễ tân)</td></tr>
          <tr><th>Ghi chú của khách</th><td>${bk.customer_notes || 'Không có'}</td></tr>
        </table>
        <div class="footer">
          <div>
            <strong>Khách lưu trú ký tên</strong><br/><br/><br/>
            (${bk.guest_name})
          </div>
          <div>
            <strong>Đại diện lễ tân ${settings.hotel_name}</strong><br/><br/><br/>
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
      <div className="bg-bg-ivory-white border border-border-default rounded-classic p-6 shadow-luxury-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold-dark">
            RESERVATION MANAGEMENT • QUẢN LÝ ĐẶT PHÒNG
          </span>
          <h2 className="font-serif text-2xl font-bold text-text-primary mt-1">
            Danh Sách Đơn Đặt Phòng ({filteredBookings.length} đơn)
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Xác nhận, từ chối, đánh dấu hoàn thành, ghi chú nội bộ, in phiếu đặt phòng và xuất báo cáo Excel.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportExcel}
        >
          Xuất file Excel (.xlsx)
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-bg-ivory-white border border-border-default rounded-classic p-4 sm:p-5 shadow-luxury-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 relative">
          <input
            type="text"
            placeholder="Tìm theo mã booking (TP-2026-...), tên khách hoặc SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 rounded-classic bg-bg-ivory border border-border-default text-xs sm:text-sm focus:outline-none focus:border-brand-gold"
          />
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-gold-dark shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | BookingStatus)}
            className="w-full h-10 px-3 rounded-classic bg-bg-ivory border border-border-default text-xs sm:text-sm"
          >
            <option value="all">Tất cả trạng thái ({bookings.length})</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy / Từ chối</option>
          </select>
        </div>

        <div className="md:col-span-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-gold-dark shrink-0" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full h-10 px-3 rounded-classic bg-bg-ivory border border-border-default text-xs sm:text-sm"
            title="Lọc theo ngày nhận hoặc trả phòng"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="text-xs text-state-danger hover:underline shrink-0"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-bg-ivory-white border border-border-default rounded-classic shadow-luxury-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-default text-xs uppercase tracking-wider text-text-muted bg-bg-ivory">
                <th className="py-3.5 px-4">Mã Booking</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Phòng</th>
                <th className="py-3.5 px-4">Nhận / Trả phòng</th>
                <th className="py-3.5 px-4">Tổng tiền</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác quản trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    Không tìm thấy đơn đặt phòng nào khớp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((bk) => (
                  <tr key={bk.id} className="hover:bg-bg-ivory/60 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-serif font-bold text-base text-bg-wood-deep block">
                        {bk.booking_code}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {formatDateTimeVN(bk.created_at)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-text-primary">{bk.guest_name}</div>
                      <div className="text-xs text-text-secondary">{bk.guest_phone}</div>
                      <div className="text-[11px] text-text-muted">{bk.guest_email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-text-primary">{bk.room_name}</div>
                      <div className="text-xs text-text-muted">
                        Mã: {bk.room_code} • {bk.adults_count} người lớn
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-text-secondary">
                      <div>Nhận: <strong>{formatDateVN(bk.check_in_date)}</strong></div>
                      <div>Trả: <strong>{formatDateVN(bk.check_out_date)}</strong></div>
                      <span className="text-brand-gold-dark font-semibold">
                        ({bk.nights_count} đêm)
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-serif font-bold text-base text-text-primary block">
                        {formatVND(bk.total_amount)}
                      </span>
                      <StatusBadge status={bk.payment_status} className="mt-1" />
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={bk.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenDetail(bk)}
                        >
                          Chi tiết
                        </Button>
                        <button
                          type="button"
                          onClick={() => handlePrintBookingSlip(bk)}
                          className="p-2 rounded-classic border border-border-default bg-bg-ivory hover:border-brand-gold text-text-secondary hover:text-text-primary"
                          title="In phiếu đặt phòng"
                        >
                          <Printer className="w-4 h-4" />
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

      {/* Booking Detail & Workflow Modal matching Figma Frame 6:255 */}
      {selectedBooking && (
        <Modal
          isOpen={Boolean(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          title={`Chi Tiết Booking: ${selectedBooking.booking_code}`}
          subtitle={`Tạo lúc ${formatDateTimeVN(selectedBooking.created_at)}`}
          maxWidthClass="max-w-3xl"
          footer={
            <>
              <Button
                variant="secondary"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={() => handlePrintBookingSlip(selectedBooking)}
              >
                In phiếu đặt phòng
              </Button>
              <Button variant="primary" onClick={() => setSelectedBooking(null)}>
                Đóng cửa sổ
              </Button>
            </>
          }
        >
          <div className="space-y-6 text-sm">
            {/* Guest & Stay Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-classic bg-bg-ivory border border-border-default">
              <div>
                <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">
                  Thông tin khách lưu trú
                </span>
                <p className="font-serif text-lg font-bold text-text-primary">
                  {selectedBooking.guest_name}
                </p>
                <p className="text-text-secondary mt-1">
                  Điện thoại:{' '}
                  <a
                    href={`tel:${selectedBooking.guest_phone}`}
                    className="font-semibold text-brand-gold-dark underline"
                  >
                    {selectedBooking.guest_phone}
                  </a>
                </p>
                <p className="text-text-secondary">Email: {selectedBooking.guest_email}</p>
                {selectedBooking.customer_notes && (
                  <p className="text-xs text-text-secondary mt-2 pt-2 border-t border-border-default">
                    <strong>Ghi chú của khách:</strong> {selectedBooking.customer_notes}
                  </p>
                )}
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">
                  Thông tin phòng & Thanh toán
                </span>
                <p className="font-serif text-lg font-bold text-text-primary">
                  {selectedBooking.room_name} ({selectedBooking.room_code})
                </p>
                <p className="text-text-secondary mt-1">
                  Nhận: <strong>{formatDateVN(selectedBooking.check_in_date)}</strong> → Trả:{' '}
                  <strong>{formatDateVN(selectedBooking.check_out_date)}</strong> (
                  {selectedBooking.nights_count} đêm)
                </p>
                <p className="text-text-secondary">
                  Tổng tiền:{' '}
                  <strong className="font-serif text-lg text-bg-wood-deep">
                    {formatVND(selectedBooking.total_amount)}
                  </strong>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={selectedBooking.status} />
                  <StatusBadge status={selectedBooking.payment_status} />
                </div>
              </div>
            </div>

            {/* Workflow Status Actions */}
            <div className="p-4 rounded-classic bg-bg-cream/60 border border-border-default space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-primary block">
                Cập nhật trạng thái xử lý Booking
              </span>

              <input
                type="text"
                placeholder="Nhập ghi chú lý do chuyển trạng thái (tùy chọn)..."
                value={statusChangeNote}
                onChange={(e) => setStatusChangeNote(e.target.value)}
                className="w-full h-9 px-3 rounded-classic bg-bg-ivory-white border border-border-default text-xs"
              />

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={selectedBooking.status === 'confirmed'}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={() =>
                    handleUpdateStatus(
                      selectedBooking.id,
                      'confirmed',
                      'Lễ tân đã xác nhận giữ phòng cho khách.'
                    )
                  }
                >
                  Xác nhận Booking
                </Button>

                <Button
                  variant="dark"
                  size="sm"
                  disabled={selectedBooking.status === 'completed'}
                  onClick={() =>
                    handleUpdateStatus(
                      selectedBooking.id,
                      'completed',
                      'Khách đã nhận phòng, thanh toán trực tiếp tại lễ tân và hoàn tất lưu trú.',
                      'paid'
                    )
                  }
                >
                  Đánh dấu Hoàn thành (Đã thu tiền)
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  disabled={selectedBooking.status === 'cancelled'}
                  leftIcon={<XCircle className="w-3.5 h-3.5" />}
                  onClick={() =>
                    handleUpdateStatus(
                      selectedBooking.id,
                      'cancelled',
                      'Đơn đặt phòng đã bị hủy / từ chối bởi Quản trị viên.'
                    )
                  }
                >
                  Hủy / Từ chối Booking
                </Button>
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-2">
              <TextAreaField
                label="Ghi chú nội bộ dành cho Lễ tân / Chủ nhà (Khách hàng không nhìn thấy)"
                rows={2}
                placeholder="Ví dụ: Khách quen, dự kiến nhận phòng lúc 19:30..."
                value={internalNotesDraft}
                onChange={(e) => setInternalNotesDraft(e.target.value)}
              />
              <div className="flex items-center justify-between">
                {notesSavedToast ? (
                  <span className="text-xs text-state-success font-medium">
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
                >
                  Lưu ghi chú nội bộ
                </Button>
              </div>
            </div>

            {/* Booking Status History */}
            <div className="pt-4 border-t border-border-default">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-gold-dark" />
                Lịch sử thay đổi trạng thái ({selectedHistory.length})
              </h4>
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {selectedHistory.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-classic bg-bg-ivory border border-border-default text-xs flex items-start justify-between gap-4"
                  >
                    <div>
                      <StatusBadge status={h.new_status} />
                      <p className="text-text-secondary mt-1">{h.note}</p>
                    </div>
                    <span className="text-[11px] text-text-muted shrink-0">
                      {formatDateTimeVN(h.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
