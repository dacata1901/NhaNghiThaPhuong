import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Send,
  MessageSquare,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/Button';
import { InputField, TextAreaField } from '@/components/ui/InputField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PhoneActions } from '@/components/ui/PhoneActions';
import { DEFAULT_TEST_NOTIFICATION_EMAIL } from '@/services/emailService';

const contactFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Vui lòng nhập họ và tên của bạn.')
    .max(100, 'Họ tên không vượt quá 100 ký tự.'),
  phone: z
    .string()
    .trim()
    .regex(
      /^(0|\+84)[0-9]{8,10}$/,
      'Vui lòng nhập số điện thoại hợp lệ (10–11 chữ số).'
    ),
  message: z
    .string()
    .trim()
    .min(2, 'Vui lòng nhập nội dung tin nhắn.')
    .max(1000, 'Nội dung tối đa 1000 ký tự.'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export const ContactPage: React.FC = () => {
  const { settings, createContactMessage } = useHotelData();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<ContactFormValues | null>(
    null
  );

  const recipientEmail =
    settings.email_notification || DEFAULT_TEST_NOTIFICATION_EMAIL;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    setPendingMessage(values);
  };

  const handleConfirmSend = () => {
    if (!pendingMessage) return;

    createContactMessage({
      full_name: pendingMessage.full_name,
      email: '',
      phone: pendingMessage.phone,
      subject: 'Tin nhắn khách hàng từ Website',
      message: pendingMessage.message,
    });

    setPendingMessage(null);
    setIsSubmitted(true);
    reset();
  };

  return (
    <>
      <SEOHead
        title="Liên Hệ Lễ Tân 24/7 | Nhà Nghỉ Tha Phương"
        description={`Liên hệ đặt phòng hoặc gửi lời nhắn tới Nhà Nghỉ Tha Phương qua số điện thoại ${settings.phone_primary}.`}
        canonicalPath="/contact"
      />

      <section className="pt-28 pb-16 bg-bg-ivory min-h-screen">
        <div className="container-luxury max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              Liên Hệ &amp; Gửi Tin Nhắn
            </h1>
            <p className="text-sm sm:text-base font-medium text-text-secondary mt-2">
              Bấm trực tiếp vào số điện thoại để <strong>Gọi điện</strong> hoặc{' '}
              <strong>Nhắn tin SMS</strong> với lễ tân Nhà Nghỉ Tha Phương
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cột trái: Thông tin liên hệ */}
            <div className="lg:col-span-5 bg-bg-wood-deep text-text-on-dark rounded-2xl p-6 sm:p-8 shadow-luxury-md space-y-6">
              <h2 className="text-xl font-extrabold text-brand-gold-light">
                {settings.hotel_name}
              </h2>

              <div className="space-y-5 text-sm">
                <div className="p-4 rounded-2xl bg-white/10 border border-brand-gold/30 space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-brand-gold-light shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-text-on-dark/80 block">
                        Hotline lễ tân 24/7 (Bấm để Gọi hoặc Nhắn SMS)
                      </span>
                      <a
                        href={`tel:${settings.phone_primary.replace(/\s+/g, '')}`}
                        className="text-xl font-extrabold text-brand-gold-light hover:underline"
                      >
                        {settings.phone_primary}
                      </a>
                    </div>
                  </div>

                  <PhoneActions
                    phone={settings.phone_primary}
                    smsBody="Xin chào Nhà Nghỉ Tha Phương, tôi muốn liên hệ hỏi đặt phòng."
                  />
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand-gold-light shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-text-on-dark/70 block">
                      Email tiếp nhận thông tin
                    </span>
                    <span className="font-bold text-brand-gold-light break-all">
                      {recipientEmail}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-brand-gold-light shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-text-on-dark/70 block">
                      Giờ nhận &amp; trả phòng linh hoạt
                    </span>
                    <span className="font-semibold">
                      Nhận phòng <strong>{settings.check_in_time}</strong> • Trả phòng{' '}
                      <strong>{settings.check_out_time}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-gold-light shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-text-on-dark/70 block">
                      Địa chỉ
                    </span>
                    <span className="font-semibold">{settings.address_text}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Khung gửi tin nhắn */}
            <div className="lg:col-span-7 bg-bg-ivory-white border border-border-default rounded-2xl p-6 sm:p-8 shadow-luxury-md">
              <div className="mb-6">
                <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-gold-dark" />
                  Gửi Lời Nhắn Tới Lễ Tân
                </h2>
                <p className="text-xs font-medium text-text-secondary mt-1">
                  Điền họ tên và số điện thoại, lễ tân sẽ gọi điện hoặc nhắn tin phản hồi ngay.
                </p>
              </div>

              {isSubmitted && (
                <div className="mb-5 p-4 rounded-2xl bg-state-success/10 border border-state-success/30 text-state-success flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold">
                      Đã gửi lời nhắn thành công tới lễ tân!
                    </p>
                    <p className="text-xs font-medium text-text-secondary mt-0.5">
                      Lễ tân Nhà Nghỉ Tha Phương sẽ liên hệ lại với bạn qua số điện thoại trong ít phút.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Họ và tên của bạn"
                    placeholder="Ví dụ: Nguyễn Văn An"
                    required
                    error={errors.full_name?.message}
                    {...register('full_name')}
                  />

                  <InputField
                    label="Số điện thoại liên hệ"
                    type="tel"
                    placeholder="Ví dụ: 0944861242"
                    required
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                </div>

                <TextAreaField
                  label="Nội dung lời nhắn / Yêu cầu"
                  placeholder="Nhập câu hỏi hoặc yêu cầu đặt phòng của bạn..."
                  rows={3}
                  required
                  error={errors.message?.message}
                  {...register('message')}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isSubmitting}
                  leftIcon={<Send className="w-4 h-4" />}
                  className="h-12 font-extrabold rounded-xl"
                >
                  Kiểm Tra &amp; Gửi Tin Nhắn
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <ConfirmDialog
        isOpen={Boolean(pendingMessage)}
        title="Xác nhận gửi lời nhắn"
        description="Vui lòng kiểm tra lại số điện thoại của bạn để lễ tân liên hệ lại chính xác:"
        confirmText="Xác nhận Gửi ngay"
        cancelText="Quay lại chỉnh sửa"
        variant="confirm"
        details={
          pendingMessage
            ? [
                { label: 'Họ và tên', value: pendingMessage.full_name },
                { label: 'Số điện thoại', value: pendingMessage.phone },
                { label: 'Nội dung', value: pendingMessage.message },
              ]
            : []
        }
        onConfirm={handleConfirmSend}
        onCancel={() => setPendingMessage(null)}
      />
    </>
  );
};
export default ContactPage;
