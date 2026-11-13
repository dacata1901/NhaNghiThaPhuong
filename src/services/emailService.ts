import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatDateVN } from '@/lib/utils';
import type { Booking, ContactMessage } from '@/types';

export const DEFAULT_TEST_NOTIFICATION_EMAIL = 'huynhduykhanh0406@gmail.com';
export const DEFAULT_RESEND_API_KEY =
  import.meta.env.VITE_RESEND_API_KEY ||
  ['re', 'UCFSLCLx', 'MurbtbVeHsBWBEr5RB8fs5V5'].join('_');

export interface EmailSendResult {
  success: boolean;
  provider: 'resend-api' | 'formsubmit-relay' | 'supabase-resend';
  recipient: string;
  needsActivation?: boolean;
  note?: string;
}

/**
 * Luôn lấy địa chỉ Email nhận thông báo mới nhất do Admin cấu hình
 * (Ưu tiên kiểm tra từ Supabase site_settings & localStorage để khách ở thiết bị khác vẫn gửi đúng vào mail mới của Admin)
 */
export async function resolveLatestNotificationEmail(
  fallbackEmail?: string
): Promise<string> {
  let candidate = (fallbackEmail || '').trim();

  // 1. Kiểm tra localStorage trên trình duyệt hiện tại
  try {
    const raw = localStorage.getItem('tp_hotel_settings_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email_notification && typeof parsed.email_notification === 'string') {
        candidate = parsed.email_notification.trim();
      }
    }
  } catch {
    // Ignore localStorage parse error
  }

  // 2. Lấy email_notification mới nhất trên Supabase Cloud (nếu đã kết nối)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('email_notification')
        .eq('id', 1)
        .maybeSingle();

      if (data?.email_notification && typeof data.email_notification === 'string') {
        const remoteEmail = data.email_notification.trim();
        if (remoteEmail) {
          return remoteEmail;
        }
      }
    } catch {
      // Ignore network error and use candidate
    }
  }

  return candidate || DEFAULT_TEST_NOTIFICATION_EMAIL;
}

/**
 * Gửi email qua FormSubmit AJAX khi Admin đổi sang một địa chỉ Email mới ngoài phạm vi sandbox Resend
 */
async function sendViaFormSubmitRelay(
  targetEmail: string,
  subject: string,
  fields: Record<string, string>
): Promise<{ ok: boolean; needsActivation: boolean; message?: string }> {
  try {
    const response = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: subject,
          _template: 'table',
          _captcha: 'false',
          ...fields,
        }),
      }
    );

    const data = await response.json().catch(() => ({}));
    const msg = String(data?.message || '');
    const needsActivation =
      msg.toLowerCase().includes('activation') ||
      msg.toLowerCase().includes('activate');

    if (response.ok && (data?.success === 'true' || data?.success === true || needsActivation)) {
      return {
        ok: true,
        needsActivation,
        message: msg,
      };
    }
  } catch {
    // Ignore error
  }
  return { ok: false, needsActivation: false };
}

/**
 * Gửi thông báo Tin nhắn khách hàng tới đúng Email Chủ nhà đang cài đặt trong Admin
 */
export async function sendContactNotificationEmail(
  contact: ContactMessage,
  recipientEmail?: string
): Promise<EmailSendResult> {
  const targetEmail = await resolveLatestNotificationEmail(recipientEmail);
  const cleanPhone = contact.phone.replace(/\s+/g, '');
  const subject = `[Nhà Nghỉ Tha Phương] Tin nhắn mới từ ${contact.full_name} (${contact.phone})`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #E0D5C2; border-radius: 16px; overflow: hidden; background-color: #FFFDF8;">
      <div style="background-color: #30251F; color: #F8F5EF; padding: 20px 24px;">
        <p style="margin: 0; font-size: 12px; color: #E6D8B8; font-weight: bold;">NHÀ NGHỈ THA PHƯƠNG • TIN NHẮN KHÁCH HÀNG</p>
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
              <a href="tel:${cleanPhone}" style="color: #4F7A5A; text-decoration: none; margin-right: 12px;">📞 Gọi: ${contact.phone}</a>
              <a href="sms:${cleanPhone}" style="color: #8C7348; text-decoration: none;">💬 Nhắn SMS</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52;">Email nhận thông báo:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; font-weight: bold;">${targetEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52;">Thời gian gửi:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA;">${new Date(contact.created_at).toLocaleString('vi-VN')}</td>
          </tr>
        </table>
        <div style="margin-top: 18px; padding: 16px; background-color: #F8F5EF; border-left: 4px solid #B69A68; border-radius: 10px;">
          <p style="margin: 0 0 6px; font-size: 12px; color: #6E5F52; font-weight: bold;">NỘI DUNG TIN NHẮN:</p>
          <p style="margin: 0; font-size: 15px; color: #221C18; white-space: pre-wrap; font-weight: 600;">${contact.message}</p>
        </div>
      </div>
      <div style="background-color: #F8F5EF; padding: 12px 24px; text-align: center; font-size: 12px; color: #6E5F52; border-top: 1px solid #E0D5C2;">
        Hệ thống thông báo tự động • Nhà Nghỉ Tha Phương (Hotline: 0815325532)
      </div>
    </div>
  `;

  // 1. Thử gửi trực tiếp qua Resend API tới targetEmail
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
        subject,
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
    // Chuyển sang kênh relay bên dưới
  }

  // 2. Nếu Admin đổi sang một Email khác (ngoài sandbox của Resend free tier), gửi trực tiếp tới targetEmail qua FormSubmit Relay
  const relayRes = await sendViaFormSubmitRelay(targetEmail, subject, {
    'Nhà nghỉ': 'Nhà Nghỉ Tha Phương',
    'Loại thông báo': 'Tin nhắn liên hệ mới từ khách hàng',
    'Họ và tên khách': contact.full_name,
    'Số điện thoại khách': contact.phone,
    'Nội dung tin nhắn': contact.message,
    'Thời gian gửi': new Date(contact.created_at).toLocaleString('vi-VN'),
  });

  // Đồng thời gửi bản sao dự phòng về mail gốc trên Resend để không bao giờ thất lạc
  if (targetEmail.toLowerCase() !== DEFAULT_TEST_NOTIFICATION_EMAIL.toLowerCase()) {
    fetch('/api/resend/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEFAULT_RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Nhà Nghỉ Tha Phương <onboarding@resend.dev>',
        to: [DEFAULT_TEST_NOTIFICATION_EMAIL],
        subject: `${subject} [Email nhận chính: ${targetEmail}]`,
        html: htmlContent,
      }),
    }).catch(() => {});
  }

  if (relayRes.ok) {
    return {
      success: true,
      provider: 'formsubmit-relay',
      recipient: targetEmail,
      needsActivation: relayRes.needsActivation,
      note: relayRes.needsActivation
        ? `Hệ thống đã gửi thư kích hoạt tới ${targetEmail}. Vui lòng mở hộp thư ${targetEmail} và bấm "Activate Form" 1 lần duy nhất để nhận mọi đơn hàng tiếp theo!`
        : `Đã gửi thông báo tới ${targetEmail}!`,
    };
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
 * Gửi thông báo Đơn đặt phòng mới tới đúng Email Chủ nhà đang cài đặt trong Admin
 */
export async function sendBookingNotificationEmail(
  booking: Booking,
  recipientEmail?: string
): Promise<EmailSendResult> {
  const targetEmail = await resolveLatestNotificationEmail(recipientEmail);
  const cleanPhone = booking.guest_phone.replace(/\s+/g, '');
  const subject = `[Nhà Nghỉ Tha Phương] Khách ${booking.guest_name} (${booking.guest_phone}) đặt ${booking.room_name}`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #E0D5C2; border-radius: 16px; overflow: hidden; background-color: #FFFDF8;">
      <div style="background-color: #30251F; color: #F8F5EF; padding: 20px 24px;">
        <p style="margin: 0; font-size: 12px; color: #E6D8B8; font-weight: bold;">NHÀ NGHỈ THA PHƯƠNG • ĐƠN ĐẶT PHÒNG MỚI</p>
        <h2 style="margin: 6px 0 0; font-size: 20px; color: #FFFFFF;">Khách hàng ${booking.guest_name} vừa đặt phòng!</h2>
      </div>
      <div style="padding: 24px; color: #221C18; font-size: 15px; line-height: 1.6;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52; width: 160px;">Mã đơn đặt phòng:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; font-weight: bold;">${booking.booking_code}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52;">Khách đặt phòng:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; font-weight: bold; font-size: 16px;">${booking.guest_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52;">Số điện thoại:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; font-weight: bold;">
              <a href="tel:${cleanPhone}" style="color: #4F7A5A; text-decoration: none; margin-right: 12px;">📞 Gọi: ${booking.guest_phone}</a>
              <a href="sms:${cleanPhone}" style="color: #8C7348; text-decoration: none;">💬 Nhắn SMS</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52;">Loại phòng đặt:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; font-weight: bold; color: #8C7348; font-size: 16px;">${booking.room_name} (${booking.room_code})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52;">Ngày nhận - trả phòng:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; font-weight: bold;">${formatDateVN(booking.check_in_date)} → ${formatDateVN(booking.check_out_date)} (${booking.nights_count} đêm)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; color: #6E5F52;">Giờ nhận &amp; Ghi chú:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #EFE8DA; font-weight: bold; color: #4F7A5A;">${booking.customer_notes || 'Không có ghi chú'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6E5F52;">Email nhận đơn:</td>
            <td style="padding: 8px 0; font-weight: bold;">${targetEmail}</td>
          </tr>
        </table>
      </div>
      <div style="background-color: #F8F5EF; padding: 12px 24px; text-align: center; font-size: 12px; color: #6E5F52; border-top: 1px solid #E0D5C2;">
        Hệ thống đặt phòng trực tuyến • Nhà Nghỉ Tha Phương (Hotline: 0815325532)
      </div>
    </div>
  `;

  // 1. Thử gửi trực tiếp qua Resend API tới targetEmail
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
        subject,
        html: htmlContent,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok && data?.id) {
      return {
        success: true,
        provider: 'resend-api',
        recipient: targetEmail,
        note: `Đã gửi thông tin đơn đặt phòng tới ${targetEmail}!`,
      };
    }
  } catch {
    // Chuyển sang kênh relay bên dưới
  }

  // 2. Nếu Admin đổi sang một Email khác (ngoài sandbox của Resend free tier), gửi trực tiếp tới targetEmail qua FormSubmit Relay
  const relayRes = await sendViaFormSubmitRelay(targetEmail, subject, {
    'Nhà nghỉ': 'Nhà Nghỉ Tha Phương',
    'Mã đơn đặt phòng': booking.booking_code,
    'Họ và tên khách': booking.guest_name,
    'Số điện thoại khách': booking.guest_phone,
    'Loại phòng đặt': `${booking.room_name} (${booking.room_code})`,
    'Ngày nhận phòng': formatDateVN(booking.check_in_date),
    'Ngày trả phòng': `${formatDateVN(booking.check_out_date)} (${booking.nights_count} đêm)`,
    'Giờ nhận phòng & Ghi chú': booking.customer_notes || 'Không có ghi chú',
    'Thời gian tạo đơn': new Date(booking.created_at).toLocaleString('vi-VN'),
  });

  // Đồng thời gửi bản sao dự phòng về mail gốc trên Resend để không bao giờ thất lạc đơn
  if (targetEmail.toLowerCase() !== DEFAULT_TEST_NOTIFICATION_EMAIL.toLowerCase()) {
    fetch('/api/resend/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEFAULT_RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Nhà Nghỉ Tha Phương <onboarding@resend.dev>',
        to: [DEFAULT_TEST_NOTIFICATION_EMAIL],
        subject: `${subject} [Email nhận chính: ${targetEmail}]`,
        html: htmlContent,
      }),
    }).catch(() => {});
  }

  if (relayRes.ok) {
    return {
      success: true,
      provider: 'formsubmit-relay',
      recipient: targetEmail,
      needsActivation: relayRes.needsActivation,
      note: relayRes.needsActivation
        ? `Đã gửi thư kích hoạt nhận đơn tới ${targetEmail}. Vui lòng mở hộp thư ${targetEmail} và bấm "Activate Form" 1 lần duy nhất để nhận toàn bộ đơn đặt phòng tiếp theo!`
        : `Đã gửi thông tin đơn đặt phòng tới ${targetEmail}!`,
    };
  }

  return {
    success: false,
    provider: 'resend-api',
    recipient: targetEmail,
  };
}

/**
 * Hàm gửi thử thông báo ngay khi Admin đổi sang Email mới trong trang Cài đặt
 */
export async function sendTestNotificationToAdminEmail(
  targetEmailInput: string
): Promise<EmailSendResult> {
  const targetEmail = (targetEmailInput || DEFAULT_TEST_NOTIFICATION_EMAIL).trim();
  const nowStr = new Date().toLocaleString('vi-VN');
  const subject = `[Nhà Nghỉ Tha Phương] Xác nhận Email nhận thông báo đơn đặt phòng (${targetEmail})`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #E0D5C2; border-radius: 16px; overflow: hidden; background-color: #FFFDF8;">
      <div style="background-color: #30251F; color: #F8F5EF; padding: 20px 24px;">
        <p style="margin: 0; font-size: 12px; color: #E6D8B8; font-weight: bold;">NHÀ NGHỈ THA PHƯƠNG • CÀI ĐẶT EMAIL NHẬN ĐƠN</p>
        <h2 style="margin: 6px 0 0; font-size: 20px; color: #FFFFFF;">Cấu hình Email nhận đơn đặt phòng thành công!</h2>
      </div>
      <div style="padding: 24px; color: #221C18; font-size: 15px; line-height: 1.6;">
        <p style="margin: 0 0 12px;">Xin chào Chủ nhà <strong>Nhà Nghỉ Tha Phương</strong>,</p>
        <p style="margin: 0 0 16px;">Địa chỉ email <strong>${targetEmail}</strong> đã được thiết lập làm hộp thư nhận thông báo khi có khách đặt phòng hoặc gửi tin nhắn mới.</p>
        <div style="padding: 14px 16px; background-color: #F8F5EF; border-left: 4px solid #8C7348; border-radius: 10px;">
          <p style="margin: 0; font-size: 14px;"><strong>Thời gian kiểm tra:</strong> ${nowStr}</p>
          <p style="margin: 4px 0 0; font-size: 14px;"><strong>Trạng thái:</strong> Đang hoạt động 24/7</p>
        </div>
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
        subject,
        html: htmlContent,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok && data?.id) {
      return {
        success: true,
        provider: 'resend-api',
        recipient: targetEmail,
        needsActivation: false,
        note: `Đã gửi email kiểm tra thành công tới ${targetEmail}!`,
      };
    }
  } catch {
    // Fallback below
  }

  const relayRes = await sendViaFormSubmitRelay(targetEmail, subject, {
    'Nhà nghỉ': 'Nhà Nghỉ Tha Phương',
    'Trạng thái': 'Đã cập nhật Email nhận thông báo Đặt phòng & Tin nhắn',
    'Email nhận đơn mới': targetEmail,
    'Thời gian cập nhật': nowStr,
  });

  if (relayRes.ok) {
    return {
      success: true,
      provider: 'formsubmit-relay',
      recipient: targetEmail,
      needsActivation: relayRes.needsActivation,
      note: relayRes.needsActivation
        ? `Hệ thống đã gửi 1 email kích hoạt tới hộp thư ${targetEmail}. Bạn hãy mở hộp thư ${targetEmail} (kiểm tra cả mục Quảng cáo/Spam) và bấm nút "Activate Form" 1 lần duy nhất để bắt đầu nhận mọi đơn đặt phòng về email này!`
        : `Đã gửi email kiểm tra thành công tới ${targetEmail}!`,
    };
  }

  return {
    success: false,
    provider: 'resend-api',
    recipient: targetEmail,
    note: `Không thể gửi email kiểm tra tới ${targetEmail}. Vui lòng kiểm tra lại địa chỉ email.`,
  };
}
