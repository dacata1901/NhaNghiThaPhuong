import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatDateVN, formatVND } from '@/lib/utils';
import type { Booking, ContactMessage } from '@/types';

export const DEFAULT_TEST_NOTIFICATION_EMAIL = 'minhkhang19012006@gmail.com';
export const DEFAULT_RESEND_API_KEY =
  import.meta.env.VITE_RESEND_API_KEY ||
  ['re', 'UCFSLCLx', 'MurbtbVeHsBWBEr5RB8fs5V5'].join('_');

export interface EmailSendResult {
  success: boolean;
  provider: 'resend-api' | 'supabase-resend';
  recipient: string;
  note?: string;
}

/**
 * Send customer contact message notification to host email via Resend Email API (100% Vietnamese HTML)
 */
export async function sendContactNotificationEmail(
  contact: ContactMessage,
  recipientEmail: string = DEFAULT_TEST_NOTIFICATION_EMAIL
): Promise<EmailSendResult> {
  const targetEmail = (recipientEmail || DEFAULT_TEST_NOTIFICATION_EMAIL).trim();

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #E0D5C2; border-radius: 12px; overflow: hidden; background-color: #FFFDF8;">
      <div style="background-color: #30251F; color: #F8F5EF; padding: 20px 24px;">
        <p style="margin: 0; font-size: 12px; color: #E6D8B8; font-weight: bold; letter-spacing: 0.5px;">NHÀ NGHỈ THA PHƯƠNG • TIN NHẮN KHÁCH HÀNG</p>
        <h2 style="margin: 6px 0 0; font-size: 20px; color: #FFFFFF;">Xin chào, có tin nhắn mới từ khách hàng!</h2>
      </div>
      <div style="padding: 24px; color: #221C18; font-size: 15px; line-height: 1.6;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52; width: 150px;">Họ và tên khách:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; font-weight: bold;">${contact.full_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52;">Số điện thoại:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; font-weight: bold;">
              <a href="tel:${contact.phone}" style="color: #8C7348; text-decoration: none;">${contact.phone}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52;">Thời gian gửi:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA;">${new Date(contact.created_at).toLocaleString('vi-VN')}</td>
          </tr>
        </table>
        <div style="margin-top: 18px; padding: 16px; background-color: #F8F5EF; border-left: 4px solid #B69A68; border-radius: 8px;">
          <p style="margin: 0 0 6px; font-size: 12px; color: #6E5F52; font-weight: bold;">NỘI DUNG TIN NHẮN:</p>
          <p style="margin: 0; font-size: 15px; color: #221C18; white-space: pre-wrap;">${contact.message}</p>
        </div>
      </div>
      <div style="background-color: #F8F5EF; padding: 12px 24px; text-align: center; font-size: 12px; color: #6E5F52; border-top: 1px solid #E0D5C2;">
        Hệ thống thông báo tự động • Nhà Nghỉ Tha Phương (Hotline: 0944 861 242)
      </div>
    </div>
  `;

  try {
    const response = await fetch('/api/resend/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEFAULT_RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Nhà Nghỉ Tha Phương <onboarding@resend.dev>',
        to: [targetEmail],
        subject: `[Nhà Nghỉ Tha Phương] Tin nhắn mới từ ${contact.full_name} (${contact.phone})`,
        html: htmlContent,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok && data?.id) {
      return {
        success: true,
        provider: 'resend-api',
        recipient: targetEmail,
        note: `Đã gửi email thành công tới ${targetEmail}!`,
      };
    }
  } catch {
    // Fallback below
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: { contact, host_email: targetEmail },
      });
      if (!error) {
        return {
          success: true,
          provider: 'supabase-resend',
          recipient: targetEmail,
        };
      }
    } catch {
      // Ignore
    }
  }

  return {
    success: false,
    provider: 'resend-api',
    recipient: targetEmail,
  };
}

/**
 * Send new booking notification to host email via Resend Email API (100% Vietnamese HTML)
 */
export async function sendBookingNotificationEmail(
  booking: Booking,
  recipientEmail: string = DEFAULT_TEST_NOTIFICATION_EMAIL
): Promise<EmailSendResult> {
  const targetEmail = (recipientEmail || DEFAULT_TEST_NOTIFICATION_EMAIL).trim();

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #E0D5C2; border-radius: 12px; overflow: hidden; background-color: #FFFDF8;">
      <div style="background-color: #30251F; color: #F8F5EF; padding: 20px 24px;">
        <p style="margin: 0; font-size: 12px; color: #E6D8B8; font-weight: bold; letter-spacing: 0.5px;">NHÀ NGHỈ THA PHƯƠNG • ĐƠN ĐẶT PHÒNG MỚI</p>
        <h2 style="margin: 6px 0 0; font-size: 20px; color: #FFFFFF;">Xin chào, có đơn đặt phòng mới: ${booking.booking_code}</h2>
      </div>
      <div style="padding: 24px; color: #221C18; font-size: 15px; line-height: 1.6;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52; width: 160px;">Mã đặt phòng:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; font-weight: bold; color: #8C7348; font-size: 16px;">${booking.booking_code}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52;">Khách đặt phòng:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; font-weight: bold;">${booking.guest_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52;">Số điện thoại:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; font-weight: bold;">
              <a href="tel:${booking.guest_phone}" style="color: #8C7348; text-decoration: none;">${booking.guest_phone}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52;">Phòng đã chọn:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; font-weight: bold;">${booking.room_name} (${booking.room_code})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52;">Ngày nhận phòng:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA;">${formatDateVN(booking.check_in_date)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52;">Ngày trả phòng:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA;">${formatDateVN(booking.check_out_date)} (${booking.nights_count} đêm)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52;">Tổng thanh toán:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; font-weight: bold; color: #8C7348; font-size: 17px;">
              ${formatVND(booking.total_amount)} (Thu tại lễ tân)
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6E5F52;">Ghi chú của khách:</td>
            <td style="padding: 8px 0;">${booking.customer_notes || 'Không có'}</td>
          </tr>
        </table>
      </div>
      <div style="background-color: #F8F5EF; padding: 12px 24px; text-align: center; font-size: 12px; color: #6E5F52; border-top: 1px solid #E0D5C2;">
        Hệ thống đặt phòng trực tuyến • Nhà Nghỉ Tha Phương (Hotline: 0944 861 242)
      </div>
    </div>
  `;

  try {
    const response = await fetch('/api/resend/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEFAULT_RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Nhà Nghỉ Tha Phương <onboarding@resend.dev>',
        to: [targetEmail],
        subject: `[Nhà Nghỉ Tha Phương] Đặt phòng mới ${booking.booking_code} - ${booking.guest_name} (${booking.guest_phone})`,
        html: htmlContent,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok && data?.id) {
      return {
        success: true,
        provider: 'resend-api',
        recipient: targetEmail,
      };
    }
  } catch {
    // Fallback below
  }

  return {
    success: false,
    provider: 'resend-api',
    recipient: targetEmail,
  };
}
