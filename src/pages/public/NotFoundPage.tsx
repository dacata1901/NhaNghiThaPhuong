import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Phone } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="404 - Không Tìm Thấy Trang | Nhà Nghỉ Tha Phương"
        description="Trang quý khách đang tìm kiếm không tồn tại hoặc đã được chuyển sang địa chỉ khác."
        noIndex
      />

      <section className="py-24 lg:py-32 bg-bg-ivory min-h-[70vh] flex items-center">
        <div className="container-luxury max-w-2xl text-center">
          <span className="inline-block px-4 py-1.5 rounded-classic bg-brand-champagne text-brand-gold-dark text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            MÃ LỖI 404 • PAGE NOT FOUND
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-text-primary">
            Không Tìm Thấy Trang Này
          </h1>
          <p className="text-base text-text-secondary mt-4 leading-relaxed">
            Đường dẫn quý khách vừa truy cập không tồn tại hoặc đã được thay đổi. Quý khách có thể quay về Trang chủ hoặc xem danh sách các hạng phòng hiện có tại Nhà Nghỉ Tha Phương.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link to="/">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Home className="w-4 h-4" />}
              >
                Về trang chủ
              </Button>
            </Link>
            <Link to="/rooms">
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<Search className="w-4 h-4" />}
              >
                Xem danh sách phòng
              </Button>
            </Link>
            <a href="tel:0815325532">
              <Button
                variant="outline"
                size="lg"
                leftIcon={<Phone className="w-4 h-4" />}
              >
                Gọi 0815325532
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
};
