import React, { useEffect, useState } from 'react';
import {
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  Sparkles,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHotelData } from '@/context/HotelDataContext';
import { Button } from '@/components/ui/Button';
import { InputField, TextAreaField } from '@/components/ui/InputField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const AdminContentPage: React.FC = () => {
  const { settings, updateSettings } = useHotelData();
  const [draft, setDraft] = useState(settings);
  const [newHighlight, setNewHighlight] = useState('');
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const handleConfirmSave = () => {
    updateSettings({
      ...draft,
      about_highlights: (draft.about_highlights || [])
        .map((h) => h.trim())
        .filter(Boolean),
    });
    setConfirmSaveOpen(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddHighlight = () => {
    const trimmed = newHighlight.trim();
    if (!trimmed) return;
    setDraft({
      ...draft,
      about_highlights: [...(draft.about_highlights || []), trimmed],
    });
    setNewHighlight('');
  };

  const handleUpdateHighlight = (index: number, value: string) => {
    const next = [...(draft.about_highlights || [])];
    next[index] = value;
    setDraft({ ...draft, about_highlights: next });
  };

  const handleRemoveHighlight = (index: number) => {
    setDraft({
      ...draft,
      about_highlights: (draft.about_highlights || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-text-primary">
            Nội dung trang khách hàng
          </h1>
          <p className="text-sm font-medium text-text-secondary mt-1">
            Chỉnh sửa trực tiếp chữ, hình nền Trang Chủ và mục Giới Thiệu mà khách hàng nhìn thấy trên website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-border-default text-xs font-bold text-text-primary hover:border-brand-gold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-gold-dark" />
            <span>Xem Trang Chủ</span>
          </Link>
          <Button
            variant="primary"
            size="md"
            onClick={() => setConfirmSaveOpen(true)}
          >
            <Save className="w-4 h-4" />
            <span>Lưu nội dung</span>
          </Button>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-status-success-bg border border-status-success/30 text-status-success text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Đã lưu nội dung thành công và cập nhật lên trang khách hàng!</span>
        </div>
      )}

      {/* 1. Trang Chủ - Hero Banner */}
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-border-default pb-3">
          <Sparkles className="w-5 h-5 text-brand-gold-dark" />
          <div>
            <h2 className="font-serif text-lg font-extrabold text-text-primary">
              Trang Chủ — Khung Banner đầu trang (Hero)
            </h2>
            <p className="text-xs font-medium text-text-secondary">
              Hiển thị ngay khi khách hàng vừa truy cập vào trang chủ website.
            </p>
          </div>
        </div>

        <InputField
          label="Dòng giới thiệu nhỏ phía trên (Eyebrow)"
          value={draft.sub_tagline || ''}
          onChange={(e) => setDraft({ ...draft, sub_tagline: e.target.value })}
          placeholder="VD: Nhà Nghỉ Tha Phương • Sạch sẽ • Riêng tư • Phục vụ 24/7"
        />

        <InputField
          label="Tiêu đề lớn Trang Chủ"
          value={draft.tagline || ''}
          onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
          placeholder="VD: Không Gian Nghỉ Ngơi Sạch Sẽ, Riêng Tư & Tiện Nghi"
        />

        <div className="space-y-2">
          <InputField
            label="Đường dẫn ảnh nền Banner Trang Chủ (URL hoặc đường dẫn /images/...)"
            value={draft.hero_image_url || ''}
            onChange={(e) => setDraft({ ...draft, hero_image_url: e.target.value })}
            placeholder="/images/rooms/phong-1-giuong/giuong-chinh-1.jpg"
          />
          {draft.hero_image_url && (
            <div className="p-3 rounded-xl bg-bg-ivory border border-border-default flex items-center gap-4">
              <img
                src={draft.hero_image_url}
                alt="Xem trước ảnh nền Trang Chủ"
                className="w-24 h-16 rounded-lg object-cover border border-border-default shrink-0"
              />
              <div className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-brand-gold-dark shrink-0" />
                <span>Ảnh nền xem trước cho Banner đầu Trang Chủ</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Giới Thiệu & Điểm Nổi Bật */}
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default pb-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-brand-gold-dark" />
            <div>
              <h2 className="font-serif text-lg font-extrabold text-text-primary">
                Mục Giới Thiệu & Điểm Nổi Bật
              </h2>
              <p className="text-xs font-medium text-text-secondary">
                Hiển thị ở mục Giới thiệu trên Trang Chủ và trang Giới Thiệu riêng.
              </p>
            </div>
          </div>
          <Link
            to="/gioi-thieu"
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-gold-dark hover:underline"
          >
            <span>Xem trang Giới Thiệu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <InputField
          label="Tiêu đề mục Giới Thiệu"
          value={draft.about_title || ''}
          onChange={(e) => setDraft({ ...draft, about_title: e.target.value })}
          placeholder="VD: Chào mừng đến với Nhà Nghỉ Tha Phương"
        />

        <TextAreaField
          label="Đoạn văn Giới Thiệu chi tiết"
          rows={4}
          value={draft.about_description || ''}
          onChange={(e) => setDraft({ ...draft, about_description: e.target.value })}
          placeholder="Mô tả về không gian, sự sạch sẽ, vị trí và phong cách phục vụ của nhà nghỉ..."
        />

        {/* Điểm nổi bật */}
        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-sm font-bold text-text-primary">
              Các điểm nổi bật ({(draft.about_highlights || []).length})
            </label>
            <p className="text-xs font-medium text-text-secondary">
              Mỗi dòng là một điểm cộng hiển thị kèm dấu tích xanh trên Trang Chủ.
            </p>
          </div>

          <div className="space-y-2.5">
            {(draft.about_highlights || []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                  className="flex-1 h-11 px-3.5 rounded-xl bg-bg-ivory border border-border-default text-sm font-medium text-text-primary focus:outline-none focus:border-brand-gold"
                  placeholder="Nhập điểm nổi bật..."
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHighlight(idx)}
                  className="p-2.5 rounded-xl text-status-danger hover:bg-status-danger-bg border border-transparent hover:border-status-danger/20 transition-colors"
                  title="Xóa dòng này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <input
              type="text"
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddHighlight();
                }
              }}
              placeholder="Thêm điểm nổi bật mới (VD: Nhận & trả phòng linh hoạt 24/7)..."
              className="flex-1 h-11 px-3.5 rounded-xl bg-white border border-border-default text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleAddHighlight}
            >
              <Plus className="w-4 h-4" />
              <span>Thêm dòng</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Save Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="md"
          onClick={() => setConfirmSaveOpen(true)}
        >
          <Save className="w-4 h-4" />
          <span>Lưu tất cả nội dung</span>
        </Button>
      </div>

      <ConfirmDialog
        isOpen={confirmSaveOpen}
        title="Lưu thay đổi nội dung?"
        description="Nội dung Trang Chủ và Trang Giới Thiệu sẽ được cập nhật ngay lập tức cho khách hàng xem."
        confirmText="Lưu thay đổi"
        cancelText="Xem lại"
        variant="confirm"
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmSaveOpen(false)}
      />
    </div>
  );
};
