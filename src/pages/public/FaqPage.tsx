import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Phone, ChevronDown, ArrowRight } from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { PageBanner } from '@/components/common/PageBanner';
import { Button } from '@/components/ui/Button';

export const FaqPage: React.FC = () => {
  const { settings } = useHotelData();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: settings.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <>
      <SEOHead
        title="Câu Hỏi Thường Gặp (FAQ) | Nhà Nghỉ Tha Phương"
        description="Giải đáp chi tiết các thắc mắc về quy trình đặt phòng trực tuyến, phương thức thanh toán trực tiếp tại lễ tân và chính sách nhận/trả phòng."
        canonicalPath="/faq"
        jsonLd={faqJsonLd}
      />

      <PageBanner
        eyebrow="FREQUENTLY ASKED QUESTIONS • GIẢI ĐÁP THẮC MẮC"
        title="Câu Hỏi Thường Gặp"
        subtitle="Tổng hợp những câu hỏi phổ biến nhất từ khách hàng khi đặt phòng và lưu trú tại Nhà Nghỉ Tha Phương."
        breadcrumbs={[{ label: 'Câu hỏi thường gặp' }]}
      />

      <section className="py-14 lg:py-20 bg-bg-ivory">
        <div className="container-luxury max-w-3xl">
          <div className="space-y-4">
            {settings.faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq.id}
                  className="bg-bg-ivory-white border border-border-default rounded-classic overflow-hidden shadow-luxury-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-bg-cream/40 transition-colors"
                  >
                    <span className="font-serif text-base sm:text-lg font-bold text-text-primary flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-brand-gold-dark shrink-0" />
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-text-muted shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand-gold-dark' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-2 text-sm text-text-secondary leading-relaxed border-t border-border-default bg-bg-ivory/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-7 rounded-classic bg-bg-cream border border-border-strong text-center space-y-4">
            <h2 className="font-serif text-2xl font-bold text-text-primary">
              Bạn vẫn còn câu hỏi khác?
            </h2>
            <p className="text-sm text-text-secondary max-w-xl mx-auto">
              Đừng ngần ngại gọi trực tiếp tới lễ tân 24/7 hoặc gửi tin nhắn cho chúng tôi để được tư vấn ngay.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a href={`tel:${settings.phone_primary}`}>
                <Button
                  variant="primary"
                  leftIcon={<Phone className="w-4 h-4" />}
                >
                  Gọi lễ tân: {settings.phone_primary}
                </Button>
              </a>
              <Link to="/contact">
                <Button
                  variant="outline"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Gửi câu hỏi trực tuyến
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
