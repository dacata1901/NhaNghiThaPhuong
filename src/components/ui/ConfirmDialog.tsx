import React from 'react';
import { AlertTriangle, CheckCircle2, Trash2, X } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  details?: { label: string; value: string }[];
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  cancelText?: string;
  variant?: 'confirm' | 'danger' | 'warning';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  description,
  details,
  confirmLabel,
  confirmText,
  cancelLabel,
  cancelText,
  variant = 'confirm',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleDismiss = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  const finalConfirmLabel = confirmText || confirmLabel || 'Đồng ý xác nhận';
  const finalCancelLabel = cancelText || cancelLabel || 'Hủy bỏ';

  const iconMap = {
    confirm: (
      <div className="w-12 h-12 rounded-2xl bg-state-success/15 text-state-success flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-6 h-6" />
      </div>
    ),
    warning: (
      <div className="w-12 h-12 rounded-2xl bg-state-warning/15 text-state-warning flex items-center justify-center shrink-0">
        <AlertTriangle className="w-6 h-6" />
      </div>
    ),
    danger: (
      <div className="w-12 h-12 rounded-2xl bg-state-danger/15 text-state-danger flex items-center justify-center shrink-0">
        <Trash2 className="w-6 h-6" />
      </div>
    ),
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-wood-deep/60 backdrop-blur-xs animate-fadeIn"
      onClick={handleDismiss}
    >
      <div
        className="bg-bg-ivory-white border border-border-default rounded-2xl shadow-luxury-lg w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              {iconMap[variant]}
              <div>
                <h3 className="text-lg font-extrabold text-text-primary leading-snug">
                  {title}
                </h3>
                <p className="text-sm font-medium text-text-secondary mt-1 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-cream transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {details && details.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-bg-ivory border border-border-default space-y-2 text-sm">
              {details.map((item, idx) => (
                <div key={idx} className="flex justify-between gap-3">
                  <span className="text-text-secondary font-semibold">{item.label}:</span>
                  <strong className="text-text-primary font-extrabold text-right">
                    {item.value}
                  </strong>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleDismiss}
              className="rounded-xl font-bold px-5"
            >
              {finalCancelLabel}
            </Button>
            <Button
              type="button"
              variant={variant === 'danger' ? 'danger' : 'primary'}
              size="md"
              onClick={onConfirm}
              isLoading={isLoading}
              className="rounded-xl font-extrabold px-5"
            >
              {finalConfirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
