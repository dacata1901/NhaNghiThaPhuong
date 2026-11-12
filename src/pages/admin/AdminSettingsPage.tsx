import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  BellRing,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { Button } from '@/components/ui/Button';
import { InputField, TextAreaField } from '@/components/ui/InputField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useHotelData();
  const [draft, setDraft] = useState(settings);
  const [savedToast, setSavedToast] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmSaveOpen(true);
  };

  const handleConfirmSave = () => {
    updateSettings(draft);
    setConfirmSaveOpen(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setConfirmResetOpen(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleRequestSave} className="space-y-6">
        {/* Header */}
        <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-6 shadow-luxury-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-gold-dark">
              CÀI ĐẶT THÔNG TIN NHÀ NGHỈ
            </span>
            <h2 className="font-serif text-2xl font-extrabold text-text-primary mt-1">
              Thông Tin Liên Hệ &amp; Email Nhận Thông Báo
            </h2>
            <p className="text-xs sm:text-sm font-medium text-text-secondary mt-1">
              Quản lý tên nhà nghỉ, số điện thoại lễ tân, địa chỉ email nhận đơn đặt phòng mới.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedToast && (
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-state-success bg-state-success/10 px-3.5 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                Đã lưu cài đặt thành công!
              </span>
            )}
            <Button
              type="submit"
              variant="primary"
              leftIcon={<Save className="w-4 h-4" />}
              className="rounded-xl font-extrabold"
            >
              Lưu cài đặt
            </Button>
          </div>
        </div>

        {/* Brand & Contact Config */}
        <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-6 shadow-luxury-sm space-y-5">
          <h3 className="font-serif text-xl font-extrabold text-text-primary border-b border-border-default pb-3">
            1. Thông Tin Nhà Nghỉ &amp; Số Điện Thoại Lễ Tân
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField
              label="Tên Nhà Nghỉ"
              required
              value={draft.hotel_name}
              onChange={(e) => setDraft({ ...draft, hotel_name: e.target.value })}
            />
            <InputField
              label="Số điện thoại Lễ tân 24/7 (Hotline Gọi & SMS)"
              required
              leftIcon={<Phone className="w-4 h-4" />}
              value={draft.phone_primary}
              onChange={(e) =>
                setDraft({ ...draft, phone_primary: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField
              label="Email Chủ nhà nhận thông báo Đặt phòng & Tin nhắn"
              type="email"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              value={draft.email_notification}
              onChange={(e) =>
                setDraft({ ...draft, email_notification: e.target.value })
              }
            />
            <InputField
              label="Đường dẫn bản đồ Google Maps (Nếu có)"
              placeholder="Ví dụ: https://www.google.com/maps/embed?pb=..."
              leftIcon={<MapPin className="w-4 h-4" />}
              value={draft.google_maps_embed_url}
              onChange={(e) =>
                setDraft({ ...draft, google_maps_embed_url: e.target.value })
              }
            />
          </div>

          <TextAreaField
            label="Địa chỉ hiển thị trên Website & Phiếu đặt phòng"
            rows={2}
            value={draft.address_text}
            onChange={(e) => setDraft({ ...draft, address_text: e.target.value })}
          />
        </div>

        {/* Realtime Notification Switch */}
        <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-6 shadow-luxury-sm space-y-4">
          <h3 className="font-serif text-xl font-extrabold text-text-primary flex items-center gap-2 border-b border-border-default pb-3">
            <BellRing className="w-5 h-5 text-brand-gold-dark" />
            2. Chuông Báo Khi Có Khách Đặt Phòng Mới
          </h3>

          <label className="flex items-start gap-3 p-4 rounded-2xl bg-bg-ivory border border-border-default cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4"
              checked={draft.sound_alerts_enabled}
              onChange={(e) =>
                setDraft({ ...draft, sound_alerts_enabled: e.target.checked })
              }
            />
            <div className="text-xs sm:text-sm">
              <span className="font-extrabold text-text-primary block">
                Bật âm thanh chuông báo khi có đơn đặt phòng hoặc tin nhắn mới
              </span>
              <span className="font-medium text-text-secondary">
                Khi trang Quản trị đang mở, hệ thống sẽ phát âm báo ngay khi khách hàng gửi yêu cầu đặt phòng mới.
              </span>
            </div>
          </label>
        </div>
      </form>

      {/* Reset Data Utility */}
      <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-6 shadow-luxury-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-extrabold text-text-primary">
            Khôi phục dữ liệu mặc định ban đầu
          </h3>
          <p className="text-xs font-medium text-text-secondary mt-0.5">
            Đặt lại danh sách phòng và cài đặt về trạng thái khởi tạo ban đầu.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          leftIcon={<RotateCcw className="w-4 h-4" />}
          onClick={() => setConfirmResetOpen(true)}
          className="rounded-xl font-bold"
        >
          Khôi phục mặc định
        </Button>
      </div>

      {/* Confirm Save Settings */}
      <ConfirmDialog
        isOpen={confirmSaveOpen}
        title="Xác nhận lưu cài đặt Nhà Nghỉ?"
        description="Vui lòng kiểm tra lại thông tin liên hệ trước khi lưu:"
        confirmText="Đồng ý Lưu"
        cancelText="Quay lại"
        variant="confirm"
        details={[
          { label: 'Tên nhà nghỉ', value: draft.hotel_name },
          { label: 'Số điện thoại Hotline', value: draft.phone_primary },
          { label: 'Email nhận thông báo', value: draft.email_notification },
        ]}
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmSaveOpen(false)}
      />

      {/* Confirm Reset Demo Data */}
      <ConfirmDialog
        isOpen={confirmResetOpen}
        title="Xác nhận khôi phục dữ liệu mặc định?"
        description="Toàn bộ thay đổi tạm trên trình duyệt sẽ được đưa về trạng thái ban đầu. Bạn có chắc chắn muốn thực hiện không?"
        confirmText="Đồng ý Khôi phục"
        cancelText="Hủy bỏ"
        variant="danger"
        onConfirm={handleConfirmReset}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
};
