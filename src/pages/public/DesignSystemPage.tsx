import React, { useState } from 'react';
import { PageBanner } from '@/components/common/PageBanner';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Logo } from '@/components/ui/Logo';
import { BookingStepper } from '@/components/booking/BookingStepper';
import { BookingSearchForm } from '@/components/booking/BookingSearchForm';
import { RoomCard } from '@/components/booking/RoomCard';
import { INITIAL_ROOMS } from '@/constants/seedData';
import { useToast } from '@/context/ToastContext';

const COLOR_SWATCHES = [
  { group: 'Màu nền (Backgrounds)', items: [
    { name: 'bg/ivory', hex: '#F8F5EF' },
    { name: 'bg/ivory-white', hex: '#FFFDF8' },
    { name: 'bg/cream', hex: '#EFE8DA' },
    { name: 'bg/beige', hex: '#E3D6BD' },
    { name: 'bg/wood', hex: '#4A3426' },
    { name: 'bg/wood-deep', hex: '#30251F' },
  ]},
  { group: 'Màu thương hiệu & trạng thái', items: [
    { name: 'brand/gold', hex: '#B69A68' },
    { name: 'brand/gold-light', hex: '#E6D8B8' },
    { name: 'brand/gold-dark', hex: '#8C7348' },
    { name: 'state/success', hex: '#4F7A5A' },
    { name: 'state/warning', hex: '#C48A2B' },
    { name: 'state/danger', hex: '#A8493D' },
  ]},
];

export const DesignSystemPage: React.FC = () => {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <>
      <SEOHead
        title="Design System (Figma Page 1) | Nhà Nghỉ Tha Phương"
        description="Hệ thống thiết kế giao diện Classic Luxury của Nhà Nghỉ Tha Phương đồng bộ từ Figma."
        canonicalPath="/design-system"
        noIndex={true}
      />

      <PageBanner
        eyebrow="FIGMA DESIGN SYSTEM (PAGE 1 - ID 0:1)"
        title="Hệ thống Thiết kế & Thành phần UI"
        subtitle="Tổng hợp đầy đủ Bảng màu, Typography, Buttons, Inputs, Status Badges, Stepper, Modal và Room Cards đã được khởi tạo trong Giai đoạn 2."
        breadcrumbs={[{ label: 'Design System' }]}
      />

      <div className="container-luxury py-12 space-y-12">
        {/* 1. Colors */}
        <section className="bg-bg-ivory-white border border-border-default rounded-card p-6 sm:p-8 shadow-luxury space-y-6">
          <h2 className="text-heading-h3">1. Color Styles (Variables "Colors")</h2>
          {COLOR_SWATCHES.map((group) => (
            <div key={group.group} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                {group.group}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {group.items.map((swatch) => (
                  <div
                    key={swatch.name}
                    className="border border-border-default rounded-card overflow-hidden bg-bg-ivory"
                  >
                    <div
                      className="h-16 w-full border-b border-border-default"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-text-primary">{swatch.name}</p>
                      <p className="text-[11px] text-text-muted font-mono">{swatch.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* 2. Typography */}
        <section className="bg-bg-ivory-white border border-border-default rounded-card p-6 sm:p-8 shadow-luxury space-y-4">
          <h2 className="text-heading-h3">2. Typography (Playfair Display & Inter)</h2>
          <div className="space-y-3 divide-y divide-border-default/60">
            <div className="pt-3">
              <span className="text-xs text-text-muted block">Display/Hero Playfair</span>
              <p className="text-display-hero">Nhà Nghỉ Tha Phương</p>
            </div>
            <div className="pt-3">
              <span className="text-xs text-text-muted block">Heading/H1 Playfair</span>
              <p className="text-heading-h1">Phòng nghỉ sang trọng & ấm cúng</p>
            </div>
            <div className="pt-3">
              <span className="text-xs text-text-muted block">Heading/H2 Playfair</span>
              <p className="text-heading-h2">Tiện ích nổi bật</p>
            </div>
            <div className="pt-3">
              <span className="text-xs text-text-muted block">Price Playfair 28 SemiBold</span>
              <p className="text-price text-brand-gold-dark">300.000₫ / đêm</p>
            </div>
          </div>
        </section>

        {/* 3. Buttons & Status Badges */}
        <section className="bg-bg-ivory-white border border-border-default rounded-card p-6 sm:p-8 shadow-luxury space-y-6">
          <h2 className="text-heading-h3">3. Buttons, Inputs, Badges & Modal</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="dark">Dark Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button variant="primary" isLoading>
              Đang xử lý
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                showToast({
                  type: 'success',
                  title: 'Kiểm tra Toast thành công!',
                  message: 'Hệ thống thông báo của Nhà Nghỉ Tha Phương đã hoạt động.',
                })
              }
            >
              Thử Toast Notification
            </Button>
            <Button variant="dark" onClick={() => setCancelModalOpen(true)}>
              Mở Modal Hủy Phòng (Figma 6:257)
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <StatusBadge status="confirmed" />
            <StatusBadge status="pending" />
            <StatusBadge status="cancelled" />
            <StatusBadge status="available" />
            <StatusBadge status="occupied" />
            <StatusBadge status="pay_at_property" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <InputField label="Default Input" placeholder="Nhập họ và tên..." />
            <InputField
              label="Input có ghi chú"
              placeholder="0944 861 242"
              helperText="Số điện thoại nhận mã đặt phòng"
            />
            <InputField
              label="Error State Input"
              defaultValue="Email không hợp lệ"
              error="Vui lòng nhập đúng định dạng email"
            />
          </div>
        </section>

        {/* 4. Booking Stepper & Form */}
        <section className="bg-bg-ivory-white border border-border-default rounded-card p-6 sm:p-8 shadow-luxury space-y-6">
          <h2 className="text-heading-h3">4. Booking Stepper & Search Form</h2>
          <BookingStepper currentStep={2} />
          <BookingSearchForm layout="horizontal" />
        </section>

        {/* 5. Room Card List Layout */}
        <section className="space-y-4">
          <h2 className="text-heading-h3">5. Room Card (List Layout — Dùng ảnh thực tế Phòng 1 Giường)</h2>
          <RoomCard room={INITIAL_ROOMS[0]} layout="list" />
        </section>
      </div>

      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Yêu cầu hủy đặt phòng"
        subtitle="Mã đặt phòng mẫu: TP-2026-1001"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setCancelModalOpen(false)}>
              Đóng
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setCancelModalOpen(false);
                showToast({
                  type: 'info',
                  title: 'Đã gửi yêu cầu hủy phòng mẫu',
                  message: 'Lễ tân sẽ liên hệ xác nhận với quý khách.',
                });
              }}
            >
              Gửi yêu cầu hủy
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Vui lòng cho biết lý do bạn muốn hủy đặt phòng để Nhà Nghỉ Tha Phương hỗ trợ nhanh nhất:
          </p>
          <InputField label="Lý do hủy phòng" placeholder="Ví dụ: Thay đổi lịch trình công tác..." />
        </div>
      </Modal>
    </>
  );
};
