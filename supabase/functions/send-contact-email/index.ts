// =============================================================================
// SUPABASE EDGE FUNCTION: send-contact-email (Resend Email API)
// Gửi thông báo tin nhắn liên hệ mới của khách hàng về email chủ nhà
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
    const { contact, host_email } = await req.json();
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail =
      Deno.env.get('RESEND_FROM_EMAIL') || 'Nhà Nghỉ Tha Phương <onboarding@resend.dev>';
    const targetEmail =
      host_email || Deno.env.get('HOST_NOTIFICATION_EMAIL') || 'minhkhang19012006@gmail.com';

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
          [Nhà Nghỉ Tha Phương] Tin Nhắn Liên Hệ Mới
        </h2>
        <p>Xin chào Chủ nhà, bạn vừa nhận được một tin nhắn mới từ khách hàng trên website:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #E0D5C2; background: #EFE8DA; font-weight: bold; width: 35%;">Họ và tên khách</td>
            <td style="padding: 10px; border: 1px solid #E0D5C2;">${contact.full_name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #E0D5C2; background: #EFE8DA; font-weight: bold;">Số điện thoại</td>
            <td style="padding: 10px; border: 1px solid #E0D5C2;"><strong>${contact.phone}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #E0D5C2; background: #EFE8DA; font-weight: bold;">Email khách</td>
            <td style="padding: 10px; border: 1px solid #E0D5C2;">${contact.email || 'Không cung cấp'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #E0D5C2; background: #EFE8DA; font-weight: bold;">Chủ đề</td>
            <td style="padding: 10px; border: 1px solid #E0D5C2;">${contact.subject || 'Tin nhắn liên hệ'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #E0D5C2; background: #EFE8DA; font-weight: bold;">Nội dung</td>
            <td style="padding: 10px; border: 1px solid #E0D5C2; white-space: pre-line;">${contact.message}</td>
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
        subject: `[Nhà Nghỉ Tha Phương] Tin nhắn mới từ ${contact.full_name} (${contact.phone})`,
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
