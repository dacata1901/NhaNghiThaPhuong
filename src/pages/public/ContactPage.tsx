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

      <section className="pt-24 sm:pt-28 pb-16 bg-bg-linen min-h-screen">
        <div className="container-luxury max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-brand-gold-dark bg-brand-champagne/60 px-3.5 py-1.5 rounded-full mb-3">
              Hỗ trợ khách hàng 24/7
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              Liên Hệ &amp; Gửi Tin Nhắn
            </h1>
            <p className="text-sm sm:text-base font-medium text-text-secondary mt-2 max-w-xl mx-auto">
              Bấm trực tiếp vào số điện thoại để <strong>Gọi điện</strong> hoặc{' '}
              <strong>Nhắn tin SMS</strong> với lễ tân {settings.hotel_name}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* Cột trái: Thông tin liên hệ trình bày sáng rõ, tương phản cao */}
            <div className="lg:col-span-5 bg-bg-ivory-white border border-border-default rounded-2xl shadow-luxury-md overflow-hidden">
              <div className="bg-bg-wood-deep px-6 py-5 border-b border-brand-gold/30">
                <h2 className="text-xl font-extrabold text-white">
                  {settings.hotel_name}
                </h2>
                <p className="text-xs font-semibold text-brand-gold-light mt-1">
                  Thông tin liên hệ chính thức &amp; tiếp nhận đặt phòng
                </p>
              </div>

              <div className="p-5 sm:p-6 space-y-4 text-sm">
                {/* Hotline nổi bật */}
                <div className="p-4 rounded-2xl bg-bg-ivory border-2 border-brand-gold/40 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-gold/15 text-brand-gold-dark flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text-secondary block">
                        Hotline lễ tân 24/7
                      </span>
                      <a
                        href={`tel:${settings.phone_primary.replace(/\s+/g, '')}`}
                        className="text-xl font-extrabold text-text-primary hover:text-brand-gold-dark transition-colors"
                      >
                        {settings.phone_primary}
                      </a>
                    </div>
                  </div>

                  <PhoneActions
                    phone={settings.phone_primary}
                    showNumber={false}
                    smsBody="Xin chào Nhà Nghỉ Tha Phương, tôi muốn liên hệ hỏi đặt phòng."
                  />
                </div>

                {/* Email */}
                <div className="p-3.5 rounded-2xl bg-bg-ivory border border-border-default flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-champagne/60 text-brand-gold-dark flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-text-secondary block">
                      Email tiếp nhận thông tin
                    </span>
                    <a
                      href={`mailto:${recipientEmail}`}
                      className="font-extrabold text-text-primary hover:text-brand-gold-dark break-all transition-colors"
                    >
                      {recipientEmail}
                    </a>
                  </div>
                </div>

                {/* Thời gian nhận & trả phòng */}
                <div className="p-3.5 rounded-2xl bg-bg-ivory border border-border-default flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-state-success/15 text-state-success flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-secondary block">
                      Thời gian phục vụ
                    </span>
                    <span className="font-extrabold text-text-primary">
                      Thời gian nhận và trả phòng linh hoạt
                    </span>
                  </div>
                </div>

                {/* Địa chỉ */}
                <div className="p-3.5 rounded-2xl bg-bg-ivory border border-border-default flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-champagne/60 text-brand-gold-dark flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-secondary block">
                      Địa chỉ nhà nghỉ
                    </span>
                    <span className="font-bold text-text-primary leading-relaxed">
                      {settings.address_text}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Khung gửi tin nhắn */}
            <div className="lg:col-span-7 bg-bg-ivory-white border border-border-default rounded-2xl p-6 sm:p-8 shadow-luxury-md">
              <div className="mb-6 pb-4 border-b border-border-default">
                <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-brand-gold/15 text-brand-gold-dark flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </span>
                  Gửi Lời Nhắn Tới Lễ Tân
                </h2>
                <p className="text-xs sm:text-sm font-medium text-text-secondary mt-1.5">
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
                    placeholder="Ví dụ: 0815325532"
                    required
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                </div>

                <TextAreaField
                  label="Nội dung lời nhắn / Yêu cầu"
                  placeholder="Nhập câu hỏi hoặc yêu cầu đặt phòng của bạn..."
                  rows={4}
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
