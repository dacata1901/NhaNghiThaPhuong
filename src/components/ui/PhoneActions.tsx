import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneActionsProps {
  phone: string;
  smsBody?: string;
  size?: 'sm' | 'md';
  showNumber?: boolean;
  className?: string;
}

export const PhoneActions: React.FC<PhoneActionsProps> = ({
  phone,
  smsBody,
  size = 'sm',
  showNumber = true,
  className,
}) => {
  const cleanPhone = phone.replace(/\s+/g, '');
  const smsHref = smsBody
    ? `sms:${cleanPhone}?body=${encodeURIComponent(smsBody)}`
    : `sms:${cleanPhone}`;

  return (
    <div className={cn('inline-flex flex-wrap items-center gap-2', className)}>
      <a
        href={`tel:${cleanPhone}`}
        title={`Gọi điện tới ${phone}`}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 font-bold rounded-xl transition-all bg-state-success/15 text-state-success hover:bg-state-success hover:text-white border border-state-success/30 whitespace-nowrap',
          size === 'sm' ? 'h-8 min-w-[116px] px-3 text-xs' : 'h-9 min-w-[128px] px-3.5 text-sm'
        )}
      >
        <Phone className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>{phone}</span>
      </a>
      <a
        href={smsHref}
        title={`Nhắn tin SMS tới ${phone}`}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 font-bold rounded-xl transition-all bg-brand-gold/15 text-brand-gold-dark hover:bg-brand-gold hover:text-white border border-brand-gold/30 whitespace-nowrap',
          size === 'sm' ? 'h-8 min-w-[100px] px-3 text-xs' : 'h-9 min-w-[112px] px-3.5 text-sm'
        )}
      >
        <MessageSquare className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        Nhắn SMS
      </a>
    </div>
  );
};
