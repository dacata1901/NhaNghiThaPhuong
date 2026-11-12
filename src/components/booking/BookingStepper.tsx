import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingStepperProps {
  currentStep: 1 | 2 | 3 | 4;
  className?: string;
}

const STEPS = [
  { step: 1, label: 'Chọn phòng & ngày' },
  { step: 2, label: 'Thông tin khách hàng' },
  { step: 3, label: 'Kiểm tra & Xác nhận' },
  { step: 4, label: 'Hoàn tất đặt phòng' },
];

export const BookingStepper: React.FC<BookingStepperProps> = ({
  currentStep,
  className,
}) => {
  return (
    <div className={cn('w-full py-4', className)}>
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {STEPS.map((item, idx) => {
          const isCompleted = item.step < currentStep;
          const isActive = item.step === currentStep;

          return (
            <React.Fragment key={item.step}>
              <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-colors',
                    isCompleted &&
                      'bg-brand-gold border-brand-gold text-text-on-dark',
                    isActive &&
                      'bg-bg-wood-deep border-bg-wood-deep text-text-on-dark ring-4 ring-brand-gold/20',
                    !isCompleted &&
                      !isActive &&
                      'bg-bg-ivory-white border-border-strong text-text-muted'
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : `0${item.step}`}
                </div>
                <span
                  className={cn(
                    'text-[11px] sm:text-xs font-medium uppercase tracking-wider',
                    isActive
                      ? 'text-text-primary font-semibold'
                      : isCompleted
                      ? 'text-brand-gold-dark'
                      : 'text-text-muted'
                  )}
                >
                  {item.label}
                </span>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-[1px] mx-2 sm:mx-4',
                    item.step < currentStep ? 'bg-brand-gold' : 'bg-border-default'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
