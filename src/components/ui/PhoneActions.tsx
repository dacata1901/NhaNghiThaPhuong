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
    <div className={cn('inline-flex flex-wrap items-center gap-1.5', className)}>
      {showNumber && (
        <span className="font-extrabold text-text-primary mr-1">{phone}</span>
      )}
      <a
        href={`tel:${cleanPhone}`}
        title={`Gọi điện tới ${phone}`}
        className={cn(
          'inline-flex items-center gap-1 font-bold rounded-xl transition-all bg-state-success/15 text-state-success hover:bg-state-success hover:text-white border border-state-success/30',
          size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'
        )}
      >
        <Phone className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        Gọi điện
      </a>
      <a
        href={smsHref}
        title={`Nhắn tin SMS tới ${phone}`}
        className={cn(
          'inline-flex items-center gap-1 font-bold rounded-xl transition-all bg-brand-gold/15 text-brand-gold-dark hover:bg-brand-gold hover:text-white border border-brand-gold/30',
          size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'
        )}
      >
        <MessageSquare className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        Nhắn SMS
      </a>
    </div>
  );
};
