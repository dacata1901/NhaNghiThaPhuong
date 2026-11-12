import React, { useState } from 'react';
import { Globe, Save, CheckCircle2, Search } from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { Button } from '@/components/ui/Button';
import { InputField, TextAreaField } from '@/components/ui/InputField';
import type { PageSeoConfig } from '@/types';

export const AdminSeoPage: React.FC = () => {
  const { pageSeoList, updatePageSeo } = useHotelData();
  const [selectedKey, setSelectedKey] = useState<string>(
    pageSeoList[0]?.page_key || 'home'
  );
  const [savedToast, setSavedToast] = useState(false);

  const currentSeo =
    pageSeoList.find((p) => p.page_key === selectedKey) || pageSeoList[0];

  const [draft, setDraft] = useState<PageSeoConfig>(currentSeo);

  const handleSelectPage = (seoItem: PageSeoConfig) => {
    setSelectedKey(seoItem.page_key);
    setDraft(seoItem);
    setSavedToast(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePageSeo(draft);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const siteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-ivory-white border border-border-default rounded-classic p-6 shadow-luxury-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold-dark">
            SEARCH ENGINE OPTIMIZATION • QUẢN LÝ SEO
          </span>
          <h2 className="font-serif text-2xl font-bold text-text-primary mt-1">
            Cấu Hình Meta Title, Description & Open Graph Từng Trang
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Tối ưu hiển thị trên kết quả tìm kiếm Google (Google SERP) và thẻ chia sẻ mạng xã hội (Facebook / Zalo).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Page List */}
        <div className="lg:col-span-4 bg-bg-ivory-white border border-border-default rounded-classic p-4 shadow-luxury-sm space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted px-2 block mb-2">
            Chọn trang cần tối ưu SEO
          </span>
          {pageSeoList.map((item) => {
            const isActive = item.page_key === selectedKey;
            return (
              <button
                key={item.page_key}
                type="button"
                onClick={() => handleSelectPage(item)}
                className={`w-full text-left px-4 py-3 rounded-classic text-xs font-medium transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-bg-wood-deep text-text-on-dark font-semibold'
                    : 'bg-bg-ivory hover:bg-bg-cream text-text-primary'
                }`}
              >
                <span>{item.page_name}</span>
                <span className="text-[11px] opacity-75">{item.canonical_path}</span>
              </button>
            );
          })}
        </div>

        {/* Right Editor & Google SERP Preview */}
        <div className="lg:col-span-8 space-y-6">
          {/* Google SERP Live Preview */}
          <div className="bg-bg-ivory-white border border-border-default rounded-classic p-6 shadow-luxury-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-gold-dark flex items-center gap-1.5 mb-3">
              <Search className="w-3.5 h-3.5" />
              Xem trước kết quả hiển thị trên Google (SERP Preview)
            </span>
            <div className="p-5 rounded-classic bg-white border border-border-default">
              <div className="text-xs text-neutral-600 truncate">
                {siteUrl}
                {draft.canonical_path}
              </div>
              <div className="text-lg font-medium text-[#1a0dab] hover:underline mt-0.5 line-clamp-1">
                {draft.seo_title || 'Tiêu đề trang...'}
              </div>
              <div className="text-xs text-neutral-700 mt-1 line-clamp-2 leading-relaxed">
                {draft.meta_description || 'Mô tả trang trên kết quả tìm kiếm Google...'}
              </div>
            </div>
          </div>

          {/* SEO Form */}
          <form
            onSubmit={handleSave}
            className="bg-bg-ivory-white border border-border-default rounded-classic p-6 shadow-luxury-sm space-y-5"
          >
            <div className="flex items-center justify-between border-b border-border-default pb-3">
              <h3 className="font-serif text-xl font-bold text-text-primary flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-gold-dark" />
                Chỉnh sửa SEO: {draft.page_name}
              </h3>
              {savedToast && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-state-success">
                  <CheckCircle2 className="w-4 h-4" />
                  Đã lưu cấu hình SEO
                </span>
              )}
            </div>

            <InputField
              label={`SEO Title (${draft.seo_title.length}/65 ký tự khuyến nghị)`}
              required
              value={draft.seo_title}
              onChange={(e) => setDraft({ ...draft, seo_title: e.target.value })}
            />

            <TextAreaField
              label={`Meta Description (${draft.meta_description.length}/160 ký tự khuyến nghị)`}
              rows={3}
              required
              value={draft.meta_description}
              onChange={(e) =>
                setDraft({ ...draft, meta_description: e.target.value })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Canonical Path"
                value={draft.canonical_path}
                onChange={(e) =>
                  setDraft({ ...draft, canonical_path: e.target.value })
                }
              />
              <InputField
                label="Open Graph Image URL (Ảnh chia sẻ Zalo / Facebook)"
                value={draft.og_image_url || '/images/rooms/phong-1-giuong/giuong-chinh-1.jpg'}
                onChange={(e) =>
                  setDraft({ ...draft, og_image_url: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save className="w-4 h-4" />}
              >
                Lưu cấu hình SEO trang này
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
