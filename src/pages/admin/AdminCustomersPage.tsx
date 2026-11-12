import React, { useState, useMemo } from 'react';
import { Search, Phone, Mail, CalendarCheck, Eye } from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { formatVND, formatDateVN, formatDateTimeVN } from '@/lib/utils';
import type { Customer } from '@/types';

export const AdminCustomersPage: React.FC = () => {
  const { customers, bookings } = useHotelData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const customerBookings = useMemo(() => {
    if (!selectedCustomer) return [];
    return bookings.filter(
      (b) =>
        b.customer_id === selectedCustomer.id ||
        b.guest_phone === selectedCustomer.phone ||
        b.guest_email.toLowerCase() === selectedCustomer.email.toLowerCase()
    );
  }, [selectedCustomer, bookings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-ivory-white border border-border-default rounded-classic p-6 shadow-luxury-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold-dark">
            GUEST DIRECTORY • QUẢN LÝ KHÁCH HÀNG
          </span>
          <h2 className="font-serif text-2xl font-bold text-text-primary mt-1">
            Danh Sách Khách Lưu Trú ({filteredCustomers.length} khách)
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Theo dõi thông tin liên hệ, tổng số lần đặt phòng, tổng chi tiêu và lịch sử đặt phòng của từng khách hàng.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Tìm theo tên khách, SĐT hoặc Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 rounded-classic bg-bg-ivory border border-border-default text-xs sm:text-sm focus:outline-none focus:border-brand-gold"
          />
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-bg-ivory-white border border-border-default rounded-classic shadow-luxury-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-default text-xs uppercase tracking-wider text-text-muted bg-bg-ivory">
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Số lần đặt phòng</th>
                <th className="py-3.5 px-4">Tổng chi tiêu</th>
                <th className="py-3.5 px-4">Lần đặt gần nhất</th>
                <th className="py-3.5 px-4 text-right">Hồ sơ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    Không tìm thấy khách hàng nào khớp với từ khóa.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-bg-ivory/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-serif font-bold text-base text-text-primary">
                        {c.full_name}
                      </div>
                      {c.notes && (
                        <div className="text-xs text-text-muted mt-0.5">{c.notes}</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <a
                        href={`tel:${c.phone}`}
                        className="inline-flex items-center gap-1.5 font-medium text-brand-gold-dark hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {c.phone}
                      </a>
                    </td>
                    <td className="py-4 px-4 text-xs text-text-secondary">
                      <a
                        href={`mailto:${c.email}`}
                        className="inline-flex items-center gap-1.5 hover:text-text-primary"
                      >
                        <Mail className="w-3.5 h-3.5 text-brand-gold-dark" />
                        {c.email}
                      </a>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-classic bg-brand-champagne/40 text-bg-wood-deep text-xs font-bold">
                        <CalendarCheck className="w-3.5 h-3.5" />
                        {c.total_bookings} lần
                      </span>
                    </td>
                    <td className="py-4 px-4 font-serif font-bold text-base text-bg-wood-deep">
                      {formatVND(c.total_spent)}
                    </td>
                    <td className="py-4 px-4 text-xs text-text-secondary">
                      {c.last_booking_date ? formatDateVN(c.last_booking_date) : '—'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedCustomer(c)}
                      >
                        Lịch sử đặt phòng
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Booking History Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={Boolean(selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
          title={`Hồ Sơ Khách Hàng: ${selectedCustomer.full_name}`}
          subtitle={`SĐT: ${selectedCustomer.phone} • Email: ${selectedCustomer.email}`}
          maxWidthClass="max-w-3xl"
          footer={
            <Button variant="primary" onClick={() => setSelectedCustomer(null)}>
              Đóng hồ sơ
            </Button>
          }
        >
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-classic bg-bg-ivory border border-border-default">
              <div>
                <span className="text-xs text-text-muted block">Tổng số lần đặt</span>
                <span className="font-serif text-2xl font-bold text-text-primary">
                  {selectedCustomer.total_bookings} đơn
                </span>
              </div>
              <div>
                <span className="text-xs text-text-muted block">Tổng chi tiêu tích lũy</span>
                <span className="font-serif text-2xl font-bold text-bg-wood-deep">
                  {formatVND(selectedCustomer.total_spent)}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-muted block">Ngày ghi nhận hồ sơ</span>
                <span className="font-medium text-text-primary">
                  {formatDateTimeVN(selectedCustomer.created_at)}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-serif text-base font-bold text-text-primary mb-3">
                Lịch sử các đơn đặt phòng ({customerBookings.length})
              </h4>
              {customerBookings.length === 0 ? (
                <p className="text-xs text-text-muted py-4">
                  Chưa có đơn đặt phòng nào khớp với khách hàng này.
                </p>
              ) : (
                <div className="space-y-3">
                  {customerBookings.map((bk) => (
                    <div
                      key={bk.id}
                      className="p-4 rounded-classic bg-bg-ivory border border-border-default flex flex-wrap items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-base text-bg-wood-deep">
                            {bk.booking_code}
                          </span>
                          <StatusBadge status={bk.status} />
                        </div>
                        <p className="text-xs font-medium text-text-primary mt-1">
                          {bk.room_name} ({bk.room_code})
                        </p>
                        <p className="text-xs text-text-secondary">
                          {formatDateVN(bk.check_in_date)} → {formatDateVN(bk.check_out_date)} (
                          {bk.nights_count} đêm)
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-serif text-lg font-bold text-text-primary block">
                          {formatVND(bk.total_amount)}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          {formatDateTimeVN(bk.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
