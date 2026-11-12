import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, CalendarCheck, XCircle, Phone } from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { PageBanner } from '@/components/common/PageBanner';

export type PolicyPageType =
  | 'privacy-policy'
  | 'terms'
  | 'booking-policy'
  | 'cancellation-policy';

interface PolicyPageProps {
  policyType: PolicyPageType;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ policyType }) => {
  const { settings } = useHotelData();

  const policyContentMap: Record<
    PolicyPageType,
    {
      eyebrow: string;
      title: string;
      description: string;
      canonicalPath: string;
      sections: { heading: string; items: string[] }[];
    }
  > = {
    'booking-policy': {
      eyebrow: 'RESERVATION POLICY • QUY ĐỊNH ĐẶT PHÒNG',
      title: 'Chính Sách Đặt Phòng & Lưu Trú',
      description:
        'Quy định rõ ràng về thủ tục đặt giữ phòng trực tuyến, giờ nhận/trả phòng và phương thức thanh toán tại Nhà Nghỉ Tha Phương.',
      canonicalPath: '/booking-policy',
      sections: [
        {
          heading: '1. Quy định về giờ nhận phòng & trả phòng',
          items: [
            `Giờ nhận phòng tiêu chuẩn: từ ${settings.check_in_time} hằng ngày.`,
            `Giờ trả phòng tiêu chuẩn: trước ${settings.check_out_time} ngày trả phòng.`,
            'Nhận phòng sớm hoặc trả phòng muộn tùy thuộc vào tình trạng phòng thực tế và vui lòng báo trước với lễ tân qua số 0944 861 242.',
          ],
        },
        {
          heading: '2. Phương thức thanh toán trực tiếp tại lễ tân',
          items: [
            'Khi đặt phòng trên website, hệ thống sẽ tạo Mã đặt phòng (Booking Code) để giữ phòng cho quý khách.',
            'Quý khách thanh toán 100% tiền phòng trực tiếp tại quầy lễ tân khi làm thủ tục nhận phòng (bằng tiền mặt hoặc chuyển khoản ngân hàng).',
            'Giá phòng hiển thị tại thời điểm đặt được lưu cố định trong đơn đặt phòng của quý khách.',
          ],
        },
        {
          heading: '3. Thủ tục nhận phòng & Nội quy lưu trú',
          items: [
            'Quý khách vui lòng xuất trình CCCD/CMND hoặc Hộ chiếu hợp lệ tại quầy lễ tân để đăng ký lưu trú theo quy định.',
            'Giữ gìn vệ sinh chung, không gây ồn ào sau 22:00 và tuyệt đối không mang các chất cấm, chất dễ cháy nổ vào khu vực nhà nghỉ.',
          ],
        },
      ],
    },
    'cancellation-policy': {
      eyebrow: 'CANCELLATION POLICY • QUY ĐỊNH HỦY PHÒNG',
      title: 'Chính Sách Hủy Đặt Phòng & Đổi Lịch',
      description:
        'Hướng dẫn hủy hoặc thay đổi ngày lưu trú thuận tiện, minh bạch cho khách hàng đặt phòng tại Nhà Nghỉ Tha Phương.',
      canonicalPath: '/cancellation-policy',
      sections: [
        {
          heading: '1. Điều kiện hủy hoặc thay đổi đặt phòng',
          items: [
            'Quý khách được miễn phí hủy hoặc đổi ngày lưu trú khi thông báo trước giờ nhận phòng tối thiểu 24 giờ.',
            'Quý khách có thể tự gửi yêu cầu hủy trên trang Tra cứu đặt phòng (bằng Mã đặt phòng + Số điện thoại/Email) hoặc gọi trực tiếp hotline 0944 861 242.',
          ],
        },
        {
          heading: '2. Quy định giữ phòng ngày nhận phòng',
          items: [
            'Trong trường hợp quý khách đến muộn hơn 18:00 ngày nhận phòng, vui lòng liên hệ trước với lễ tân để chúng tôi tiếp tục giữ phòng cho quý khách.',
            'Nếu quá thời gian quy định mà lễ tân không thể liên lạc được qua số điện thoại đăng ký, đơn đặt phòng có thể được chuyển sang trạng thái hủy để nhường phòng cho khách khác.',
          ],
        },
      ],
    },
    'privacy-policy': {
      eyebrow: 'PRIVACY POLICY • BẢO MẬT THÔNG TIN',
      title: 'Chính Sách Bảo Mật Thông Tin Khách Hàng',
      description:
        'Cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của khách hàng khi đặt phòng trực tuyến tại Nhà Nghỉ Tha Phương.',
      canonicalPath: '/privacy-policy',
      sections: [
        {
          heading: '1. Thông tin chúng tôi thu thập',
          items: [
            'Họ và tên, Số điện thoại, Địa chỉ Email và Ghi chú đặt phòng khi quý khách thực hiện đặt phòng hoặc gửi biểu mẫu liên hệ.',
            'Thông tin này chỉ phục vụ duy nhất cho việc xác nhận đặt phòng, gửi mã đặt phòng qua email và liên hệ hỗ trợ lưu trú.',
          ],
        },
        {
          heading: '2. Bảo mật tra cứu & lưu trữ dữ liệu',
          items: [
            'Hệ thống tra cứu đặt phòng yêu cầu xác thực đồng thời Mã đặt phòng và Số điện thoại/Email để ngăn chặn người lạ tra cứu trái phép.',
            'Nhà Nghỉ Tha Phương cam kết tuyệt đối không chia sẻ, mua bán hoặc tiết lộ thông tin khách hàng cho bất kỳ bên thứ ba nào.',
          ],
        },
      ],
    },
    terms: {
      eyebrow: 'TERMS OF SERVICE • ĐIỀU KHOẢN SỬ DỤNG',
      title: 'Điều Khoản Sử Dụng Website',
      description:
        'Các điều khoản và quy định áp dụng khi khách hàng truy cập, tra cứu và đặt phòng trên hệ thống website Nhà Nghỉ Tha Phương.',
      canonicalPath: '/terms',
      sections: [
        {
          heading: '1. Trách nhiệm của người đặt phòng',
          items: [
            'Cung cấp chính xác họ tên, số điện thoại liên lạc và email để nhận mã xác nhận đặt phòng.',
            'Không thực hiện các hành vi tạo đơn đặt phòng giả mạo hoặc gửi spam làm ảnh hưởng tới tình trạng phòng trống của khách hàng khác.',
          ],
        },
        {
          heading: '2. Trách nhiệm của Nhà Nghỉ Tha Phương',
          items: [
            'Cung cấp thông tin hình ảnh phòng nghỉ trung thực, rõ ràng và hỗ trợ xác nhận đơn đặt phòng nhanh chóng.',
            'Bảo đảm quyền lợi lưu trú cho khách hàng đã có đơn đặt phòng được xác nhận hợp lệ.',
          ],
        },
      ],
    },
  };

  const current = policyContentMap[policyType];

  const policyTabs: { type: PolicyPageType; label: string; path: string; icon: React.FC<{ className?: string }> }[] = [
    { type: 'booking-policy', label: 'Chính sách đặt phòng', path: '/booking-policy', icon: CalendarCheck },
    { type: 'cancellation-policy', label: 'Chính sách hủy phòng', path: '/cancellation-policy', icon: XCircle },
    { type: 'privacy-policy', label: 'Chính sách bảo mật', path: '/privacy-policy', icon: ShieldCheck },
    { type: 'terms', label: 'Điều khoản sử dụng', path: '/terms', icon: FileText },
  ];

  return (
    <>
      <SEOHead
        title={`${current.title} | Nhà Nghỉ Tha Phương`}
        description={current.description}
        canonicalPath={current.canonicalPath}
      />

      <PageBanner
        eyebrow={current.eyebrow}
        title={current.title}
        subtitle={current.description}
        breadcrumbs={[{ label: current.title }]}
      />

      <section className="py-12 lg:py-16 bg-bg-ivory">
        <div className="container-luxury max-w-4xl">
          {/* Policy Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {policyTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.type === policyType;
              return (
                <Link
                  key={tab.type}
                  to={tab.path}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-classic text-xs sm:text-sm font-medium border transition-colors ${
                    isActive
                      ? 'bg-bg-wood-deep text-text-on-dark border-bg-wood-deep'
                      : 'bg-bg-ivory-white text-text-secondary border-border-default hover:border-brand-gold'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <div className="bg-bg-ivory-white border border-border-default rounded-classic p-6 sm:p-10 shadow-luxury-sm space-y-8">
            {current.sections.map((sec) => (
              <div key={sec.heading} className="space-y-3">
                <h2 className="font-serif text-xl font-bold text-text-primary">
                  {sec.heading}
                </h2>
                <ul className="space-y-2.5 text-sm text-text-secondary leading-relaxed list-disc pl-5">
                  {sec.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="pt-6 border-t border-border-default flex flex-wrap items-center justify-between gap-4 text-xs text-text-secondary">
              <span>
                Đơn vị vận hành: <strong className="text-text-primary">{settings.hotel_name}</strong>
              </span>
              <a
                href={`tel:${settings.phone_primary}`}
                className="inline-flex items-center gap-1.5 font-semibold text-brand-gold-dark hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                Hotline lễ tân: {settings.phone_primary}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
