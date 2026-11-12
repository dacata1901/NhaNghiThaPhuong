import React, { useState } from 'react';
import {
  Mail,
  Phone,
  CheckCircle2,
  Trash2,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { Button } from '@/components/ui/Button';
import { formatDateTimeVN } from '@/lib/utils';
import type { ContactMessageStatus } from '@/types';

export const AdminMessagesPage: React.FC = () => {
  const {
    contactMessages,
    updateContactMessageStatus,
    deleteContactMessage,
  } = useHotelData();

  const [statusFilter, setStatusFilter] = useState<'all' | ContactMessageStatus>('all');

  const filtered = contactMessages.filter(
    (m) => statusFilter === 'all' || m.status === statusFilter
  );

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tin nhắn của "${name}" không?`)) {
      deleteContactMessage(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-ivory-white border border-border-default rounded-classic p-6 shadow-luxury-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold-dark">
            INBOX & INQUIRIES • QUẢN LÝ TIN NHẮN LIÊN HỆ
          </span>
          <h2 className="font-serif text-2xl font-bold text-text-primary mt-1">
            Hộp Thư Khách Hàng ({filtered.length} tin nhắn)
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Xem nội dung tin nhắn gửi từ trang Liên hệ, đánh dấu đã đọc / đã xử lý và liên hệ phản hồi khách hàng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'unread', 'read', 'resolved'] as const).map((st) => {
            const labels = {
              all: 'Tất cả',
              unread: 'Chưa đọc',
              read: 'Đã xem',
              resolved: 'Đã phản hồi',
            };
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-2 rounded-classic text-xs font-semibold uppercase tracking-wider border transition-colors ${
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
          <div className="bg-bg-ivory-white border border-border-default rounded-classic p-12 text-center text-text-muted">
            Không có tin nhắn nào trong mục này.
          </div>
        ) : (
          filtered.map((msg) => (
            <div
              key={msg.id}
              className={`bg-bg-ivory-white border rounded-classic p-6 shadow-luxury-sm transition-colors ${
                msg.status === 'unread'
                  ? 'border-brand-gold bg-brand-champagne/15'
                  : 'border-border-default'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-border-default">
                <div>
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-brand-gold-dark" />
                    <h3 className="font-serif text-lg font-bold text-text-primary">
                      {msg.subject}
                    </h3>
                    {msg.status === 'unread' && (
                      <span className="px-2 py-0.5 rounded bg-state-warning text-white text-[10px] font-bold uppercase">
                        Mới • Chưa đọc
                      </span>
                    )}
                    {msg.status === 'read' && (
                      <span className="px-2 py-0.5 rounded bg-state-info/15 text-state-info text-[10px] font-bold uppercase">
                        Đã đọc
                      </span>
                    )}
                    {msg.status === 'resolved' && (
                      <span className="px-2 py-0.5 rounded bg-state-success/15 text-state-success text-[10px] font-bold uppercase">
                        Đã phản hồi
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary mt-1.5">
                    <span>
                      Người gửi: <strong className="text-text-primary">{msg.full_name}</strong>
                    </span>
                    <a
                      href={`tel:${msg.phone}`}
                      className="inline-flex items-center gap-1 text-brand-gold-dark font-semibold hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {msg.phone}
                    </a>
                    <a
                      href={`mailto:${msg.email}`}
                      className="inline-flex items-center gap-1 hover:text-text-primary"
                    >
                      <Mail className="w-3.5 h-3.5 text-brand-gold-dark" />
                      {msg.email}
                    </a>
                    <span className="inline-flex items-center gap-1 text-text-muted">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDateTimeVN(msg.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {msg.status === 'unread' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateContactMessageStatus(msg.id, 'read')}
                    >
                      Đánh dấu Đã đọc
                    </Button>
                  )}
                  {msg.status !== 'resolved' && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => updateContactMessageStatus(msg.id, 'resolved')}
                    >
                      Đánh dấu Đã phản hồi
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(msg.id, msg.full_name)}
                    className="p-2 rounded-classic border border-border-default bg-bg-ivory hover:border-state-danger text-state-danger"
                    title="Xóa tin nhắn"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-text-primary leading-relaxed pt-4 whitespace-pre-line">
                {msg.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
