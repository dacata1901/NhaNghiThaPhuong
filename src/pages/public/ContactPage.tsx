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
  Sparkles,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/Button';
import { InputField, TextAreaField } from '@/components/ui/InputField';
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

  const recipientEmail =
    settings.email_notification || DEFAULT_TEST_NOTIFICATION_EMAIL;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      message: '',
    },
  });

  const handleFillSampleTestMessage = () => {
    setValue('full_name', 'Khang Lê Minh');
    setValue('phone', '0944861242');
    setValue(
      'message',
      'Xin chào Nhà Nghỉ Tha Phương, tôi muốn hỏi phòng trống tối nay. Đây là tin nhắn gửi qua Resend (giao diện tiếng Việt 100%).'
    );
  };

  const onSubmit = (values: ContactFormValues) => {
    createContactMessage({
      full_name: values.full_name,
      email: '',
      phone: values.phone,
      subject: 'Tin nhắn khách hàng từ Website',
      message: values.message,
    });

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
            <p className="text-sm sm:text-base text-text-secondary mt-2">
              Gửi câu hỏi trực tiếp tới lễ tân Nhà Nghỉ Tha Phương ({recipientEmail})
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cột trái: Thông tin liên hệ */}
            <div className="lg:col-span-5 bg-bg-wood-deep text-text-on-dark rounded-2xl p-6 sm:p-8 shadow-luxury-md space-y-5">
              <h2 className="text-xl font-bold">{settings.hotel_name}</h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-brand-gold-light shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-text-on-dark/70 block">
                      Hotline lễ tân 24/7
                    </span>
                    <a
                      href={`tel:${settings.phone_primary}`}
                      className="text-lg font-extrabold text-brand-gold-light hover:underline"
                    >
                      {settings.phone_primary}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand-gold-light shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-text-on-dark/70 block">
                      Email nhận thông báo (Resend)
                    </span>
                    <span className="font-semibold text-brand-gold-light break-all">
                      {recipientEmail}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-brand-gold-light shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-text-on-dark/70 block">
                      Giờ nhận &amp; trả phòng
                    </span>
                    <span>
                      Nhận phòng <strong>{settings.check_in_time}</strong> • Trả phòng{' '}
                      <strong>{settings.check_out_time}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-gold-light shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-text-on-dark/70 block">Địa chỉ</span>
                    <span>{settings.address_text}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Khung gửi tin nhắn */}
            <div className="lg:col-span-7 bg-bg-ivory-white border border-border-default rounded-2xl p-6 sm:p-8 shadow-luxury-md">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <div>
                  <h2 className="text-xl font-extrabold text-text-primary">
                    Gửi Tin Nhắn Khách Hàng
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Đã kết nối trực tiếp Resend Email API (Giao diện thư tiếng Việt 100%)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFillSampleTestMessage}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-gold/15 text-brand-gold-dark hover:bg-brand-gold/25"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Điền nhanh nội dung Test
                </button>
              </div>

              {isSubmitted && (
                <div className="mb-5 p-4 rounded-xl bg-state-success/10 border border-state-success/30 text-state-success flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">
                      Đã gửi email thành công qua Resend tới {recipientEmail}!
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Hãy kiểm tra hộp thư <strong>{recipientEmail}</strong> để xem mẫu email tiếng Việt mới của Nhà Nghỉ Tha Phương.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Họ và tên của bạn"
                    placeholder="Ví dụ: Khang Lê Minh"
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
                  label="Nội dung tin nhắn"
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
                  className="h-12 font-bold"
                >
                  Gửi Tin Nhắn Ngay
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default ContactPage;
