import React from 'react';
import { cn } from '@/lib/utils';
import type { BookingStatus, PaymentStatus, RoomStatus } from '@/types';

type BadgeVariant =
  | BookingStatus
  | RoomStatus
  | PaymentStatus
  | 'info'
  | 'gold';

interface StatusBadgeProps {
  status: BadgeVariant;
  customLabel?: string;
  className?: string;
}

const STATUS_CONFIG: Record<
  BadgeVariant,
  { label: string; classes: string; dotColor: string }
> = {
  confirmed: {
    label: 'Đã xác nhận',
    classes: 'bg-state-success/12 text-state-success border-state-success/30',
    dotColor: 'bg-state-success',
  },
  pending: {
    label: 'Chờ xác nhận',
    classes: 'bg-state-warning/15 text-state-warning border-state-warning/35',
    dotColor: 'bg-state-warning',
  },
  cancelled: {
    label: 'Đã hủy',
    classes: 'bg-state-danger/12 text-state-danger border-state-danger/30',
    dotColor: 'bg-state-danger',
  },
  completed: {
    label: 'Đã hoàn tất',
    classes: 'bg-state-info/15 text-state-info border-state-info/30',
    dotColor: 'bg-state-info',
  },
  available: {
    label: 'Đang trống',
    classes: 'bg-state-success/12 text-state-success border-state-success/30',
    dotColor: 'bg-state-success',
  },
  occupied: {
    label: 'Đang có khách',
    classes: 'bg-state-warning/15 text-state-warning border-state-warning/35',
    dotColor: 'bg-state-warning',
  },
  maintenance: {
    label: 'Đang bảo trì',
    classes: 'bg-state-danger/12 text-state-danger border-state-danger/30',
    dotColor: 'bg-state-danger',
  },
  pay_at_property: {
    label: 'Thu trực tiếp khi nhận phòng',
    classes: 'bg-brand-gold/15 text-brand-gold-dark border-brand-gold/35',
    dotColor: 'bg-brand-gold-dark',
  },
  unpaid: {
    label: 'Chưa thanh toán',
    classes: 'bg-state-warning/15 text-state-warning border-state-warning/35',
    dotColor: 'bg-state-warning',
  },
  deposit_paid: {
    label: 'Đã đặt cọc',
    classes: 'bg-state-info/15 text-state-info border-state-info/30',
    dotColor: 'bg-state-info',
  },
  paid: {
    label: 'Đã thanh toán',
    classes: 'bg-state-success/12 text-state-success border-state-success/30',
    dotColor: 'bg-state-success',
  },
  refunded: {
    label: 'Đã hoàn tiền',
    classes: 'bg-bg-cream text-text-secondary border-border-strong',
    dotColor: 'bg-text-muted',
  },
  info: {
    label: 'Thông tin',
    classes: 'bg-state-info/12 text-state-info border-state-info/30',
    dotColor: 'bg-state-info',
  },
  gold: {
    label: 'Nổi bật',
    classes: 'bg-brand-gold/15 text-brand-gold-dark border-brand-gold/40',
    dotColor: 'bg-brand-gold',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  customLabel,
  className,
}) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.info;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider rounded-classic border',
        cfg.classes,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dotColor)} />
      {customLabel || cfg.label}
    </span>
  );
};
