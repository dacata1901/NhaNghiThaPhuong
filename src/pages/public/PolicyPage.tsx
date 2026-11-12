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
      eyebrow: 'QUY ĐỊNH ĐẶT PHÒNG & LƯU TRÚ',
      title: 'Chính Sách Đặt Phòng & Lưu Trú',
      description:
        'Quy định rõ ràng về thủ tục đặt giữ phòng trực tuyến và giờ nhận/trả phòng tại Nhà Nghỉ Tha Phương.',
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
          heading: '2. Thủ tục nhận phòng & Nội quy lưu trú',
          items: [
            'Quý khách vui lòng xuất trình CCCD/CMND hoặc Hộ chiếu hợp lệ tại quầy lễ tân để đăng ký lưu trú theo quy định.',
            'Giữ gìn vệ sinh chung, không gây ồn ào sau 22:00 và tuyệt đối không mang các chất cấm, chất dễ cháy nổ vào khu vực nhà nghỉ.',
          ],
        },
      ],
    },
    'cancellation-policy': {
      eyebrow: 'QUY ĐỊNH HỦY PHÒNG & ĐỔI LỊCH',
      title: 'Chính Sách Hủy Đặt Phòng & Đổi Lịch',
      description:
        'Hướng dẫn hủy hoặc thay đổi ngày lưu trú thuận tiện cho khách hàng đặt phòng tại Nhà Nghỉ Tha Phương.',
      canonicalPath: '/cancellation-policy',
      sections: [
        {
          heading: '1. Điều kiện hủy hoặc thay đổi đặt phòng',
          items: [
            'Quý khách được miễn phí hủy hoặc đổi ngày lưu trú khi thông báo trước giờ nhận phòng qua số điện thoại lễ tân 0944 861 242.',
          ],
        },
        {
          heading: '2. Quy định giữ phòng ngày nhận phòng',
          items: [
            'Trong trường hợp quý khách đến muộn hơn giờ đã hẹn, vui lòng liên hệ trước với lễ tân để chúng tôi tiếp tục giữ phòng cho quý khách.',
          ],
        },
      ],
    },
    'privacy-policy': {
      eyebrow: 'BẢO MẬT THÔNG TIN KHÁCH HÀNG',
      title: 'Chính Sách Bảo Mật Thông Tin Khách Hàng',
      description:
        'Cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của khách hàng khi đặt phòng trực tuyến tại Nhà Nghỉ Tha Phương.',
      canonicalPath: '/privacy-policy',
      sections: [
        {
          heading: '1. Thông tin chúng tôi thu thập',
          items: [
            'Họ và tên, Số điện thoại và Ghi chú giờ nhận phòng khi quý khách thực hiện đặt phòng hoặc gửi lời nhắn liên hệ.',
            'Thông tin này chỉ phục vụ duy nhất cho việc xác nhận đặt phòng và liên hệ hỗ trợ lưu trú.',
          ],
        },
        {
          heading: '2. Cam kết bảo mật dữ liệu',
          items: [
            'Nhà Nghỉ Tha Phương cam kết tuyệt đối không chia sẻ, mua bán hoặc tiết lộ thông tin khách hàng cho bất kỳ bên thứ ba nào.',
          ],
        },
      ],
    },
    terms: {
      eyebrow: 'ĐIỀU KHOẢN SỬ DỤNG TRANG WEB',
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
