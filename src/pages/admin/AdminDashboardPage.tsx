import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  CalendarCheck,
  BedDouble,
  Clock,
  CheckCircle2,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { formatVND, formatDateVN } from '@/lib/utils';

export const AdminDashboardPage: React.FC = () => {
  const {
    rooms,
    bookings,
    updateBookingStatus,
    getAvailableQuantityForRoom,
  } = useHotelData();

  const stats = useMemo(() => {
    const validBookings = bookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'completed'
    );
    const totalRevenue = validBookings.reduce((sum, b) => sum + b.total_amount, 0);

    const pendingCount = bookings.filter((b) => b.status === 'pending').length;
    const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;

    const totalRoomsPhysical = rooms.reduce((sum, r) => sum + r.total_quantity, 0);
    const todayStr = dayjs().format('YYYY-MM-DD');
    const tomorrowStr = dayjs().add(1, 'day').format('YYYY-MM-DD');

    const availableRoomsToday = rooms.reduce(
      (sum, r) => sum + getAvailableQuantityForRoom(r.id, todayStr, tomorrowStr),
      0
    );

    return {
      totalRevenue,
      pendingCount,
      confirmedCount,
      totalRoomsPhysical,
      availableRoomsToday,
    };
  }, [rooms, bookings, getAvailableQuantityForRoom]);

  return (
    <div className="space-y-6">
      {/* Simple Top Bar */}
      <div className="bg-bg-ivory-white border border-border-default rounded-classic p-5 shadow-luxury-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            Bảng Theo Dõi Nhanh Cho Chủ Nhà
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Quản lý nhanh đơn đặt phòng mới và tình trạng phòng trống trong ngày.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/admin/rooms">
            <Button variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Quản lý phòng &amp; ảnh
            </Button>
          </Link>
          <Link to="/admin/bookings">
            <Button variant="primary" size="sm">
              Xem tất cả đặt phòng ({bookings.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-ivory-white border border-border-default rounded-classic p-5 shadow-luxury-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-text-secondary mb-2">
            <span>Đơn chờ xác nhận</span>
            <Clock className="w-4 h-4 text-state-warning" />
          </div>
          <p className="text-3xl font-bold text-state-warning">
            {stats.pendingCount} đơn
          </p>
          <p className="text-xs text-text-muted mt-1">
            Cần gọi xác nhận với khách
          </p>
        </div>

        <div className="bg-bg-ivory-white border border-border-default rounded-classic p-5 shadow-luxury-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-text-secondary mb-2">
            <span>Đơn đã xác nhận</span>
            <CheckCircle2 className="w-4 h-4 text-state-success" />
          </div>
          <p className="text-3xl font-bold text-state-success">
            {stats.confirmedCount} đơn
          </p>
          <p className="text-xs text-text-muted mt-1">
            Đã giữ phòng cho khách
          </p>
        </div>

        <div className="bg-bg-ivory-white border border-border-default rounded-classic p-5 shadow-luxury-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-text-secondary mb-2">
            <span>Phòng trống hôm nay</span>
            <BedDouble className="w-4 h-4 text-brand-gold-dark" />
          </div>
          <p className="text-3xl font-bold text-text-primary">
            {stats.availableRoomsToday} / {stats.totalRoomsPhysical}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Tổng số phòng sẵn sàng đón khách
          </p>
        </div>

        <div className="bg-bg-ivory-white border border-border-default rounded-classic p-5 shadow-luxury-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-text-secondary mb-2">
            <span>Tổng tiền đơn xác nhận</span>
            <TrendingUp className="w-4 h-4 text-brand-gold-dark" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-bg-wood-deep">
            {formatVND(stats.totalRevenue)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Thu trực tiếp khi khách nhận phòng
          </p>
        </div>
      </div>

      {/* Recent Bookings Table with Quick Confirm/Cancel */}
      <div className="bg-bg-ivory-white border border-border-default rounded-classic p-5 sm:p-6 shadow-luxury-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-brand-gold-dark" />
            Danh sách đơn đặt phòng mới nhất
          </h3>
          <Link
            to="/admin/bookings"
            className="text-xs font-semibold text-brand-gold-dark hover:underline"
          >
            Mở trang quản lý chi tiết &amp; Xuất Excel →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-default text-xs uppercase tracking-wider text-text-muted bg-bg-ivory">
                <th className="py-3 px-4">Mã đơn</th>
                <th className="py-3 px-4">Khách hàng &amp; SĐT</th>
                <th className="py-3 px-4">Phòng đặt</th>
                <th className="py-3 px-4">Ngày nhận / trả</th>
                <th className="py-3 px-4">Tổng tiền</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Duyệt nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {bookings.slice(0, 10).map((bk) => (
                <tr key={bk.id} className="hover:bg-bg-ivory/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-bg-wood-deep">
                    {bk.booking_code}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-text-primary">{bk.guest_name}</div>
                    <a
                      href={`tel:${bk.guest_phone}`}
                      className="text-xs text-brand-gold-dark font-medium hover:underline"
                    >
                      {bk.guest_phone}
                    </a>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-text-primary">{bk.room_name}</div>
                    <div className="text-xs text-text-muted">Mã: {bk.room_code}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-text-secondary">
                    {formatDateVN(bk.check_in_date)} → {formatDateVN(bk.check_out_date)}
                    <span className="block text-text-muted">({bk.nights_count} đêm)</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-text-primary">
                    {formatVND(bk.total_amount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={bk.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {bk.status === 'pending' ? (
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            updateBookingStatus(
                              bk.id,
                              'confirmed',
                              'Chủ nhà xác nhận đơn đặt phòng.'
                            )
                          }
                        >
                          Xác nhận
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            updateBookingStatus(
                              bk.id,
                              'cancelled',
                              'Chủ nhà hủy đơn đặt phòng.'
                            )
                          }
                        >
                          Hủy
                        </Button>
                      </div>
                    ) : (
                      <Link
                        to="/admin/bookings"
                        className="text-xs font-medium text-brand-gold-dark hover:underline"
                      >
                        Chi tiết →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
