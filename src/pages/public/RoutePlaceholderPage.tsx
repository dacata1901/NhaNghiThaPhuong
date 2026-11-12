import React from 'react';
import { Link } from 'react-router-dom';
import { PageBanner } from '@/components/common/PageBanner';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/Button';

interface RoutePlaceholderProps {
  title: string;
  subtitle: string;
  phaseNote: string;
  canonicalPath: string;
  noIndex?: boolean;
}

export const RoutePlaceholderPage: React.FC<RoutePlaceholderProps> = ({
  title,
  subtitle,
  phaseNote,
  canonicalPath,
  noIndex = false,
}) => {
  return (
    <>
      <SEOHead
        title={`${title} | Nhà Nghỉ Tha Phương`}
        description={subtitle}
        canonicalPath={canonicalPath}
        noIndex={noIndex}
      />
      <PageBanner
        eyebrow="NHÀ NGHỈ THA PHƯƠNG"
        title={title}
        subtitle={subtitle}
        breadcrumbs={[{ label: title }]}
      />
      <div className="container-luxury py-16">
        <div className="bg-bg-ivory-white border border-border-default rounded-card p-8 max-w-2xl mx-auto text-center space-y-4 shadow-luxury">
          <span className="text-eyebrow">{phaseNote}</span>
          <h2 className="text-heading-h3 text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Đường dẫn định tuyến (Route) và khung giao diện của trang này đã được cấu hình sẵn trong Giai đoạn 2 và sẽ được hoàn thiện chi tiết ở giai đoạn tiếp theo theo đúng lộ trình phát triển.
          </p>
          <div className="pt-3 flex items-center justify-center gap-3">
            <Link to="/">
              <Button variant="primary" size="sm">
                Về Trang chủ
              </Button>
            </Link>
            <Link to="/design-system">
              <Button variant="secondary" size="sm">
                Xem Design System
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
