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

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useHotelData();
  const [draft, setDraft] = useState(settings);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(draft);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleResetDemo = () => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn khôi phục toàn bộ dữ liệu phòng, đặt phòng và cài đặt về trạng thái mặc định ban đầu không?'
      )
    ) {
      resetDemoData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Header */}
        <div className="bg-bg-ivory-white border border-border-default rounded-classic p-6 shadow-luxury-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold-dark">
              SYSTEM CONFIGURATION • CÀI ĐẶT HỆ THỐNG
            </span>
            <h2 className="font-serif text-2xl font-bold text-text-primary mt-1">
              Cấu Hình Thông Tin Liên Hệ, Email Thông Báo & Bản Đồ
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Quản lý tên thương hiệu, hotline lễ tân, địa chỉ email nhận thông báo đặt phòng mới và liên kết Google Maps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedToast && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-state-success bg-state-success/10 px-3 py-2 rounded-classic">
                <CheckCircle2 className="w-4 h-4" />
                Đã lưu cài đặt hệ thống!
              </span>
            )}
            <Button
              type="submit"
              variant="primary"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Lưu cài đặt
            </Button>
          </div>
        </div>

        {/* Brand & Contact Config */}
        <div className="bg-bg-ivory-white border border-border-default rounded-classic p-6 shadow-luxury-sm space-y-5">
          <h3 className="font-serif text-xl font-bold text-text-primary border-b border-border-default pb-3">
            1. Thông Tin Thương Hiệu & Liên Hệ Lễ Tân
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField
              label="Tên Nhà Nghỉ / Khách Sạn"
              required
              value={draft.hotel_name}
              onChange={(e) => setDraft({ ...draft, hotel_name: e.target.value })}
            />
            <InputField
              label="Chữ hiển thị trên Logo"
              required
              value={draft.logo_text}
              onChange={(e) => setDraft({ ...draft, logo_text: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField
              label="Số điện thoại Lễ tân 24/7 (Hotline)"
              required
              leftIcon={<Phone className="w-4 h-4" />}
              value={draft.phone_primary}
              onChange={(e) =>
                setDraft({ ...draft, phone_primary: e.target.value })
              }
            />
            <InputField
              label="Email Chủ nhà nhận thông báo Booking & Liên hệ mới"
              type="email"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              value={draft.email_notification}
              onChange={(e) =>
                setDraft({ ...draft, email_notification: e.target.value })
              }
            />
          </div>

          <TextAreaField
            label="Địa chỉ chi tiết hiển thị trên Website & Phiếu đặt phòng"
            rows={2}
            value={draft.address_text}
            onChange={(e) => setDraft({ ...draft, address_text: e.target.value })}
          />

          <InputField
            label="Đường dẫn nhúng Google Maps (Iframe Embed SRC URL)"
            placeholder="Ví dụ: https://www.google.com/maps/embed?pb=..."
            leftIcon={<MapPin className="w-4 h-4" />}
            helperText="Copy đường dẫn src trong mã nhúng Google Maps và dán vào đây để bản đồ hiển thị tự động trên Trang chủ & Trang liên hệ."
            value={draft.google_maps_embed_url}
            onChange={(e) =>
              setDraft({ ...draft, google_maps_embed_url: e.target.value })
            }
          />
        </div>

        {/* Realtime Notification & Demo Banner Switches */}
        <div className="bg-bg-ivory-white border border-border-default rounded-classic p-6 shadow-luxury-sm space-y-4">
          <h3 className="font-serif text-xl font-bold text-text-primary flex items-center gap-2 border-b border-border-default pb-3">
            <BellRing className="w-5 h-5 text-brand-gold-dark" />
            2. Tùy Chọn Thông Báo Thời Gian Thực (Realtime) & Nhãn Dữ Liệu
          </h3>

          <label className="flex items-start gap-3 p-4 rounded-classic bg-bg-ivory border border-border-default cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={draft.sound_alerts_enabled}
              onChange={(e) =>
                setDraft({ ...draft, sound_alerts_enabled: e.target.checked })
              }
            />
            <div className="text-xs sm:text-sm">
              <span className="font-semibold text-text-primary block">
                Bật âm thanh chuông báo khi có đơn đặt phòng hoặc tin nhắn mới
              </span>
              <span className="text-text-secondary">
                Khi trang Quản trị đang mở, hệ thống sẽ phát âm báo nhẹ ngay khi khách hàng gửi yêu cầu đặt phòng mới.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-classic bg-bg-ivory border border-border-default cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={draft.is_demo_warning_visible}
              onChange={(e) =>
                setDraft({ ...draft, is_demo_warning_visible: e.target.checked })
              }
            />
            <div className="text-xs sm:text-sm">
              <span className="font-semibold text-text-primary block">
                Hiển thị chú thích &ldquo;Giá tham khảo minh họa&rdquo; trên thẻ phòng
              </span>
              <span className="text-text-secondary">
                Bạn có thể tắt tùy chọn này sau khi đã cập nhật bảng giá chính thức của tất cả các phòng.
              </span>
            </div>
          </label>
        </div>
      </form>

      {/* Reset Data Utility */}
      <div className="bg-bg-ivory-white border border-border-default rounded-classic p-6 shadow-luxury-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-text-primary">
            Khôi phục dữ liệu mẫu ban đầu
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Đặt lại danh sách phòng, đơn đặt phòng mẫu và cài đặt về trạng thái khởi tạo ban đầu.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          leftIcon={<RotateCcw className="w-4 h-4" />}
          onClick={handleResetDemo}
        >
          Khôi phục dữ liệu mặc định
        </Button>
      </div>
    </div>
  );
};
