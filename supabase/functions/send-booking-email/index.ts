// =============================================================================
// SUPABASE EDGE FUNCTION: send-booking-email (Resend Email API)
// Gửi thông báo đơn đặt phòng mới về email chủ nhà và khách hàng (nếu có email)
// =============================================================================
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { booking, host_email } = await req.json();
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail =
      Deno.env.get('RESEND_FROM_EMAIL') || 'Nhà Nghỉ Tha Phương <onboarding@resend.dev>';
    const targetEmail =
      host_email || Deno.env.get('HOST_NOTIFICATION_EMAIL') || 'huynhduykhanh0406@gmail.com';

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing RESEND_API_KEY environment variable in Edge Function.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const htmlBody = `
      <div style="font-family: 'Be Vietnam Pro', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E0D5C2; background: #FFFDF8; padding: 28px; color: #30251F;">
        <h2 style="margin-top: 0; color: #30251F; border-bottom: 2px solid #B69A68; padding-bottom: 12px;">
          [Nhà Nghỉ Tha Phương] Đơn Đặt Phòng Mới: ${booking.booking_code}
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #E0D5C2; background: #EFE8DA; font-weight: bold; width: 35%;">Mã đặt phòng</td>
            <td style="padding: 10px; border: 1px solid #E0D5C2;"><strong>${booking.booking_code}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #E0D5C2; background: #EFE8DA; font-weight: bold;">Khách đặt phòng</td>
            <td style="padding: 10px; border: 1px solid #E0D5C2;">${booking.guest_name} — <strong>${booking.guest_phone}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #E0D5C2; background: #EFE8DA; font-weight: bold;">Hạng phòng</td>
            <td style="padding: 10px; border: 1px solid #E0D5C2;">${booking.room_name} (${booking.room_code})</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #E0D5C2; background: #EFE8DA; font-weight: bold;">Ngày nhận / trả</td>
            <td style="padding: 10px; border: 1px solid #E0D5C2;">${booking.check_in_date} → ${booking.check_out_date} (${booking.nights_count} đêm)</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #E0D5C2; background: #EFE8DA; font-weight: bold;">Tổng tiền</td>
            <td style="padding: 10px; border: 1px solid #E0D5C2;"><strong>${Number(booking.total_amount).toLocaleString('vi-VN')}₫</strong> (Thu trực tiếp tại lễ tân)</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #E0D5C2; background: #EFE8DA; font-weight: bold;">Ghi chú</td>
            <td style="padding: 10px; border: 1px solid #E0D5C2;">${booking.customer_notes || 'Không có'}</td>
          </tr>
        </table>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [targetEmail],
        subject: `[Nhà Nghỉ Tha Phương] Đặt phòng mới ${booking.booking_code} - ${booking.guest_name}`,
        html: htmlBody,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify({ success: res.ok, data }), {
      status: res.ok ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
