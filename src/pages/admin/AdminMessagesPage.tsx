import React, { useState } from 'react';
import {
  CheckCircle2,
  Trash2,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PhoneActions } from '@/components/ui/PhoneActions';
import { formatDateTimeVN } from '@/lib/utils';
import type { ContactMessage, ContactMessageStatus } from '@/types';

export const AdminMessagesPage: React.FC = () => {
  const {
    contactMessages,
    updateContactMessageStatus,
    deleteContactMessage,
  } = useHotelData();

  const [statusFilter, setStatusFilter] = useState<'all' | ContactMessageStatus>('all');
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);
  const [messageToResolve, setMessageToResolve] = useState<ContactMessage | null>(null);

  const filtered = contactMessages.filter(
    (m) => statusFilter === 'all' || m.status === statusFilter
  );

  const handleConfirmDelete = () => {
    if (!messageToDelete) return;
    deleteContactMessage(messageToDelete.id);
    setMessageToDelete(null);
  };

  const handleConfirmResolve = () => {
    if (!messageToResolve) return;
    updateContactMessageStatus(messageToResolve.id, 'resolved');
    setMessageToResolve(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-6 shadow-luxury-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-gold-dark">
            HỘP THƯ &amp; LỜI NHẮN KHÁCH HÀNG
          </span>
          <h2 className="font-serif text-2xl font-extrabold text-text-primary mt-1">
            Tin Nhắn Khách Hàng ({filtered.length} tin)
          </h2>
          <p className="text-xs sm:text-sm font-medium text-text-secondary mt-1">
            Bấm trực tiếp nút <strong>Gọi điện</strong> hoặc <strong>Nhắn SMS</strong> bên cạnh số điện thoại của khách để phản hồi ngay.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'unread', 'read', 'resolved'] as const).map((st) => {
            const labels = {
              all: 'Tất cả',
              unread: 'Chưa đọc',
              read: 'Đã xem',
              resolved: 'Đã liên hệ lại',
            };
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-colors ${
                  statusFilter === st
                    ? 'bg-bg-wood-deep text-text-on-dark border-bg-wood-deep'
                    : 'bg-bg-ivory text-text-secondary border-border-default hover:border-brand-gold'
                }`}
              >
                {labels[st]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-12 text-center font-bold text-text-muted">
            Không có tin nhắn nào trong mục này.
          </div>
        ) : (
          filtered.map((msg) => (
            <div
              key={msg.id}
              className={`bg-bg-ivory-white border rounded-2xl p-6 shadow-luxury-sm transition-colors ${
                msg.status === 'unread'
                  ? 'border-brand-gold bg-brand-champagne/15'
                  : 'border-border-default'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-border-default">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-brand-gold-dark" />
                    <h3 className="font-serif text-lg font-extrabold text-text-primary">
                      Khách hàng: {msg.full_name}
                    </h3>
                    {msg.status === 'unread' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-state-warning text-white text-[11px] font-extrabold">
                        Mới • Chưa đọc
                      </span>
                    )}
                    {msg.status === 'resolved' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-state-success/15 text-state-success text-[11px] font-extrabold">
                        Đã phản hồi
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-text-secondary">
                    <span>
                      Số điện thoại: <strong className="text-brand-gold-dark text-sm">{msg.phone}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 text-text-muted">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDateTimeVN(msg.created_at)}
                    </span>
                  </div>

                  <div className="pt-1">
                    <PhoneActions
                      phone={msg.phone}
                      size="sm"
                      smsBody={`Xin chào ${msg.full_name}, Nhà Nghỉ Tha Phương phản hồi tin nhắn của bạn.`}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {msg.status !== 'resolved' && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => setMessageToResolve(msg)}
                      className="rounded-xl font-extrabold"
                    >
                      Xác nhận Đã phản hồi
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMessageToDelete(msg)}
                    className="p-2.5 rounded-xl border border-border-default bg-bg-ivory hover:border-state-danger text-state-danger"
                    title="Xóa tin nhắn"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm font-semibold text-text-primary leading-relaxed pt-4 whitespace-pre-line">
                {msg.message}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Confirm Resolve Message */}
      <ConfirmDialog
        isOpen={Boolean(messageToResolve)}
        title="Xác nhận đã liên hệ phản hồi khách?"
        description="Đánh dấu tin nhắn của khách hàng này là đã được lễ tân gọi điện / nhắn tin hỗ trợ xong:"
        confirmText="Đồng ý Xác nhận"
        cancelText="Quay lại"
        variant="confirm"
        details={
          messageToResolve
            ? [
                { label: 'Khách hàng', value: messageToResolve.full_name },
                { label: 'Số điện thoại', value: messageToResolve.phone },
                { label: 'Nội dung', value: messageToResolve.message },
              ]
            : []
        }
        onConfirm={handleConfirmResolve}
        onCancel={() => setMessageToResolve(null)}
      />

      {/* Confirm Delete Message */}
      <ConfirmDialog
        isOpen={Boolean(messageToDelete)}
        title="Xác nhận XÓA tin nhắn này?"
        description="Bạn có chắc chắn muốn xóa tin nhắn của khách hàng này không? Vui lòng xác nhận lại:"
        confirmText="Đồng ý Xóa"
        cancelText="Giữ lại, không xóa"
        variant="danger"
        details={
          messageToDelete
            ? [
                { label: 'Khách hàng', value: messageToDelete.full_name },
                { label: 'Số điện thoại', value: messageToDelete.phone },
                { label: 'Nội dung', value: messageToDelete.message },
              ]
            : []
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setMessageToDelete(null)}
      />
    </div>
  );
};
