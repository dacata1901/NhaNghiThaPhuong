import React, { useState } from 'react';
import { Save, Plus, Trash2, CheckCircle2, FileText, HelpCircle } from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { Button } from '@/components/ui/Button';
import { InputField, TextAreaField } from '@/components/ui/InputField';
import type { FaqItem } from '@/types';

export const AdminContentPage: React.FC = () => {
  const { settings, updateSettings } = useHotelData();

  const [draft, setDraft] = useState(settings);
  const [savedToast, setSavedToast] = useState(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(draft);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleAddFaq = () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    const item: FaqItem = {
      id: `faq-${Date.now()}`,
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
    };
    setDraft({
      ...draft,
      faqs: [...draft.faqs, item],
    });
    setNewFaqQuestion('');
    setNewFaqAnswer('');
  };

  const handleDeleteFaq = (id: string) => {
    setDraft({
      ...draft,
      faqs: draft.faqs.filter((f) => f.id !== id),
    });
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6">
      {/* Header */}
      <div className="bg-bg-ivory-white border border-border-default rounded-classic p-6 shadow-luxury-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold-dark">
            CONTENT MANAGEMENT SYSTEM • QUẢN LÝ NỘI DUNG WEBSITE
          </span>
          <h2 className="font-serif text-2xl font-bold text-text-primary mt-1">
            Biên Tập Nội Dung Trang Chủ, Giới Thiệu & FAQ
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Mọi thay đổi tại đây sẽ cập nhật ngay lập tức trên giao diện Website khách hàng mà không cần sửa code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedToast && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-state-success bg-state-success/10 px-3 py-2 rounded-classic">
              <CheckCircle2 className="w-4 h-4" />
              Đã lưu nội dung thành công!
            </span>
          )}
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Lưu toàn bộ thay đổi
          </Button>
        </div>
      </div>

      {/* Hero & Intro Section */}
      <div className="bg-bg-ivory-white border border-border-default rounded-classic p-6 shadow-luxury-sm space-y-5">
        <h3 className="font-serif text-xl font-bold text-text-primary flex items-center gap-2 border-b border-border-default pb-3">
          <FileText className="w-5 h-5 text-brand-gold-dark" />
          1. Banner Trang Chủ & Giới Thiệu Nhà Nghỉ
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputField
            label="Dòng chữ Eyebrow trên Hero Banner"
            value={draft.sub_tagline}
            onChange={(e) => setDraft({ ...draft, sub_tagline: e.target.value })}
          />
          <InputField
            label="Thông điệp Tagline chính"
            value={draft.tagline}
            onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputField
            label="Đường dẫn Ảnh nền Hero Trang chủ"
            value={draft.hero_image_url}
            onChange={(e) => setDraft({ ...draft, hero_image_url: e.target.value })}
          />
          <InputField
            label="Link Video Giới thiệu (MP4 / YouTube - Tùy chọn)"
            placeholder="Để trống nếu chưa có video"
            value={draft.intro_video_url || ''}
            onChange={(e) => setDraft({ ...draft, intro_video_url: e.target.value })}
          />
        </div>

        <InputField
          label="Tiêu đề phần Giới thiệu Nhà Nghỉ"
          value={draft.about_title}
          onChange={(e) => setDraft({ ...draft, about_title: e.target.value })}
        />

        <TextAreaField
          label="Đoạn văn mô tả Giới thiệu Nhà Nghỉ Tha Phương"
          rows={3}
          value={draft.about_description}
          onChange={(e) => setDraft({ ...draft, about_description: e.target.value })}
        />
      </div>

      {/* Policies Summary */}
      <div className="bg-bg-ivory-white border border-border-default rounded-classic p-6 shadow-luxury-sm space-y-5">
        <h3 className="font-serif text-xl font-bold text-text-primary border-b border-border-default pb-3">
          2. Chính Sách Thanh Toán & Hủy Phòng Hiển Thị Cho Khách
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputField
            label="Giờ nhận phòng tiêu chuẩn (Check-in)"
            value={draft.check_in_time}
            onChange={(e) => setDraft({ ...draft, check_in_time: e.target.value })}
          />
          <InputField
            label="Giờ trả phòng tiêu chuẩn (Check-out)"
            value={draft.check_out_time}
            onChange={(e) => setDraft({ ...draft, check_out_time: e.target.value })}
          />
        </div>

        <TextAreaField
          label="Ghi chú phương thức thanh toán (Mặc định: Thu tiền trực tiếp tại lễ tân)"
          rows={2}
          value={draft.payment_policy_note}
          onChange={(e) => setDraft({ ...draft, payment_policy_note: e.target.value })}
        />

        <TextAreaField
          label="Tóm tắt chính sách đổi & hủy phòng"
          rows={2}
          value={draft.cancellation_policy_summary}
          onChange={(e) =>
            setDraft({ ...draft, cancellation_policy_summary: e.target.value })
          }
        />
      </div>

      {/* FAQ Management */}
      <div className="bg-bg-ivory-white border border-border-default rounded-classic p-6 shadow-luxury-sm space-y-5">
        <h3 className="font-serif text-xl font-bold text-text-primary flex items-center gap-2 border-b border-border-default pb-3">
          <HelpCircle className="w-5 h-5 text-brand-gold-dark" />
          3. Quản Lý Câu Hỏi Thường Gặp (FAQ — {draft.faqs.length} câu hỏi)
        </h3>

        <div className="space-y-3">
          {draft.faqs.map((faq, idx) => (
            <div
              key={faq.id}
              className="p-4 rounded-classic bg-bg-ivory border border-border-default space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => {
                    const updated = [...draft.faqs];
                    updated[idx] = { ...faq, question: e.target.value };
                    setDraft({ ...draft, faqs: updated });
                  }}
                  className="flex-1 font-serif font-bold text-text-primary bg-bg-ivory-white px-3 py-1.5 rounded-classic border border-border-default text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteFaq(faq.id)}
                  className="p-1.5 text-state-danger hover:bg-state-danger/10 rounded-classic"
                  title="Xóa câu hỏi này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                rows={2}
                value={faq.answer}
                onChange={(e) => {
                  const updated = [...draft.faqs];
                  updated[idx] = { ...faq, answer: e.target.value };
                  setDraft({ ...draft, faqs: updated });
                }}
                className="w-full text-xs text-text-secondary bg-bg-ivory-white px-3 py-2 rounded-classic border border-border-default"
              />
            </div>
          ))}
        </div>

        {/* Add new FAQ */}
        <div className="p-4 rounded-classic bg-bg-cream/60 border border-border-default space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-primary block">
            Thêm câu hỏi thường gặp mới
          </span>
          <InputField
            placeholder="Nhập câu hỏi mới..."
            value={newFaqQuestion}
            onChange={(e) => setNewFaqQuestion(e.target.value)}
          />
          <TextAreaField
            rows={2}
            placeholder="Nhập câu trả lời chi tiết..."
            value={newFaqAnswer}
            onChange={(e) => setNewFaqAnswer(e.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleAddFaq}
          >
            Thêm vào danh sách FAQ
          </Button>
        </div>
      </div>
    </form>
  );
};
