import React, { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Video,
  Check,
  BedDouble,
  Users,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHotelData } from '@/context/HotelDataContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { uploadRoomMediaToSupabase } from '@/services/supabaseService';
import { Button } from '@/components/ui/Button';
import { InputField, TextAreaField } from '@/components/ui/InputField';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { formatVND } from '@/lib/utils';
import type { Room, RoomMedia, RoomStatus, RoomTypeKey, Amenity } from '@/types';

const DEFAULT_AMENITY_OPTIONS: Amenity[] = [
  {
    id: 'am-wifi',
    code: 'wifi',
    name: 'Wi-Fi tốc độ cao miễn phí',
    description: 'Kết nối Internet ổn định trong phòng',
    icon_name: 'Wifi',
    is_featured_home: true,
  },
  {
    id: 'am-ac',
    code: 'ac',
    name: 'Điều hòa nhiệt độ 2 chiều',
    description: 'Làm mát nhanh và êm ái',
    icon_name: 'Wind',
    is_featured_home: true,
  },
  {
    id: 'am-tv',
    code: 'tv',
    name: 'Tivi màn hình phẳng treo tường',
    description: 'Giải trí truyền hình sắc nét',
    icon_name: 'Tv',
    is_featured_home: true,
  },
  {
    id: 'am-bath',
    code: 'hot_water',
    name: 'Phòng tắm riêng & Bình nóng lạnh Ariston',
    description: 'Phòng vệ sinh khép kín sạch sẽ, nước nóng 24/7',
    icon_name: 'Bath',
    is_featured_home: true,
  },
  {
    id: 'am-chair',
    code: 'relax_chair',
    name: 'Ghế thư giãn & Bàn đầu giường',
    description: 'Không gian ngồi nghỉ ngơi thoải mái',
    icon_name: 'Armchair',
    is_featured_home: true,
  },
  {
    id: 'am-parking',
    code: 'parking',
    name: 'Bãi đậu xe an toàn miễn phí',
    description: 'Khu vực để xe máy và ô tô có camera an ninh',
    icon_name: 'Car',
    is_featured_home: true,
  },
];

function slugifyVN(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const AdminRoomsPage: React.FC = () => {
  const { rooms, saveRoom, deleteRoom } = useHotelData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const createEmptyRoom = (): Room => ({
    id: `room-${Date.now()}`,
    room_code: `P${Math.floor(100 + Math.random() * 899)}`,
    name: 'Phòng Nghỉ Mới',
    slug: `phong-nghi-${Date.now()}`,
    room_type: '1_bed',
    room_type_label: 'Phòng 1 giường',
    bed_count: 1,
    max_adults: 2,
    max_children: 1,
    area_sqm: 22,
    price_per_night: 300000,
    total_quantity: 3,
    short_description: 'Không gian phòng nghỉ sạch sẽ, đầy đủ điều hòa, TV và phòng tắm riêng.',
    full_description:
      'Phòng nghỉ được thiết kế ấm cúng với nội thất ốp gỗ, sàn gạch vân đá sạch sẽ, trang bị đầy đủ điều hòa, tivi màn hình phẳng và phòng tắm khép kín có bình nóng lạnh Ariston.',
    policies:
      'Nhận phòng từ 14:00, trả phòng trước 12:00. Vui lòng xuất trình CCCD khi nhận phòng.',
    status: 'available',
    is_published: true,
    is_featured: true,
    is_demo_data: false,
    rating: 4.9,
    reviews_count: 10,
    media: [
      {
        id: `med-${Date.now()}`,
        room_id: '',
        media_type: 'image',
        url: '/images/rooms/phong-1-giuong/giuong-chinh-1.jpg',
        alt_text: 'Hình ảnh phòng nghỉ Nhà Nghỉ Tha Phương',
        is_primary: true,
        sort_order: 1,
      },
    ],
    amenities: DEFAULT_AMENITY_OPTIONS.slice(0, 4),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const handleOpenAdd = () => {
    setEditingRoom(createEmptyRoom());
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(JSON.parse(JSON.stringify(room)) as Room);
    setIsModalOpen(true);
  };

  const handleTogglePublish = (room: Room) => {
    saveRoom({
      ...room,
      is_published: !room.is_published,
      updated_at: new Date().toISOString(),
    });
  };

  const handleDeleteRoom = (room: Room) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa hạng phòng "${room.name}" (${room.room_code}) không?`
      )
    ) {
      deleteRoom(room.id);
    }
  };

  // Handle image file upload (uploads to Supabase Storage bucket `room-media` when configured, with local Data URL fallback)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingRoom) return;

    Array.from(files).forEach(async (file) => {
      if (isSupabaseConfigured) {
        const upRes = await uploadRoomMediaToSupabase(file, editingRoom.room_code);
        if (upRes.success && upRes.url) {
          const newMediaItem: RoomMedia = {
            id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            room_id: editingRoom.id,
            media_type: 'image',
            url: upRes.url,
            alt_text: `${editingRoom.name} - ${file.name.replace(/\.[^.]+$/, '')}`,
            is_primary: editingRoom.media.length === 0,
            sort_order: editingRoom.media.length + 1,
          };
          setEditingRoom((prev) =>
            prev ? { ...prev, media: [...prev.media, newMediaItem] } : prev
          );
          return;
        }
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const newMediaItem: RoomMedia = {
            id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            room_id: editingRoom.id,
            media_type: 'image',
            url: reader.result,
            alt_text: `${editingRoom.name} - ${file.name.replace(/\.[^.]+$/, '')}`,
            is_primary: editingRoom.media.length === 0,
            sort_order: editingRoom.media.length + 1,
          };
          setEditingRoom((prev) =>
            prev ? { ...prev, media: [...prev.media, newMediaItem] } : prev
          );
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim() || !editingRoom) return;
    const item: RoomMedia = {
      id: `med-${Date.now()}`,
      room_id: editingRoom.id,
      media_type: 'image',
      url: newImageUrl.trim(),
      alt_text: newImageAlt.trim() || `Hình ảnh ${editingRoom.name}`,
      is_primary: editingRoom.media.length === 0,
      sort_order: editingRoom.media.length + 1,
    };
    setEditingRoom({
      ...editingRoom,
      media: [...editingRoom.media, item],
    });
    setNewImageUrl('');
    setNewImageAlt('');
  };

  const handleAddVideoUrl = () => {
    if (!newVideoUrl.trim() || !editingRoom) return;
    const item: RoomMedia = {
      id: `vid-${Date.now()}`,
      room_id: editingRoom.id,
      media_type: 'video',
      url: newVideoUrl.trim(),
      alt_text: `Video giới thiệu ${editingRoom.name}`,
      is_primary: false,
      sort_order: editingRoom.media.length + 1,
    };
    setEditingRoom({
      ...editingRoom,
      media: [...editingRoom.media, item],
    });
    setNewVideoUrl('');
  };

  const handleSetPrimaryMedia = (mediaId: string) => {
    if (!editingRoom) return;
    const updated = editingRoom.media
      .map((m) => ({
        ...m,
        is_primary: m.id === mediaId,
      }))
      .sort((a, b) => (a.is_primary ? -1 : b.is_primary ? 1 : 0));
    setEditingRoom({ ...editingRoom, media: updated });
  };

  const handleRemoveMedia = (mediaId: string) => {
    if (!editingRoom) return;
    const filtered = editingRoom.media.filter((m) => m.id !== mediaId);
    if (filtered.length > 0 && !filtered.some((m) => m.is_primary)) {
      filtered[0].is_primary = true;
    }
    setEditingRoom({ ...editingRoom, media: filtered });
  };

  const handleToggleAmenity = (amenity: Amenity) => {
    if (!editingRoom) return;
    const exists = editingRoom.amenities.some((a) => a.code === amenity.code);
    const updated = exists
      ? editingRoom.amenities.filter((a) => a.code !== amenity.code)
      : [...editingRoom.amenities, amenity];
    setEditingRoom({ ...editingRoom, amenities: updated });
  };

  const handleSaveRoomModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    const roomTypeLabelMap: Record<RoomTypeKey, string> = {
      '1_bed': 'Phòng 1 giường',
      '2_beds': 'Phòng 2 giường',
      '3_beds': 'Phòng 3 giường',
      custom: 'Phòng đặc biệt / Tùy chỉnh',
    };

    const finalRoom: Room = {
      ...editingRoom,
      slug: editingRoom.slug.trim() || slugifyVN(editingRoom.name),
      room_type_label: roomTypeLabelMap[editingRoom.room_type],
      updated_at: new Date().toISOString(),
    };

    saveRoom(finalRoom);
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-bg-ivory-white border border-border-default rounded-classic p-6 shadow-luxury-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold-dark">
            ROOM INVENTORY • QUẢN LÝ HẠNG PHÒNG
          </span>
          <h2 className="font-serif text-2xl font-bold text-text-primary mt-1">
            Danh Sách Hạng Phòng ({rooms.length} loại phòng)
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Thêm mới, chỉnh sửa giá, sức chứa, trạng thái phòng và tải lên bộ ảnh thực tế cho phòng 1 giường, 2 giường, 3 giường.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Thêm hạng phòng mới
        </Button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-bg-ivory-white border border-border-default rounded-classic overflow-hidden shadow-luxury-sm flex flex-col justify-between"
          >
            <div>
              <div className="relative h-52 bg-bg-cream overflow-hidden">
                <img
                  src={room.media[0]?.url}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <StatusBadge status={room.status} />
                  {room.is_published ? (
                    <span className="px-2.5 py-1 rounded-classic text-[11px] font-semibold bg-bg-wood-deep/85 text-brand-gold-light">
                      Đang công khai
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-classic text-[11px] font-semibold bg-neutral-800/85 text-white">
                      Đang ẩn
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-classic bg-bg-wood-deep/85 text-text-on-dark text-xs font-medium">
                  {room.media.length} ảnh/video
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-brand-gold-dark font-semibold uppercase tracking-wider">
                  <span>
                    Mã: {room.room_code} • {room.room_type_label}
                  </span>
                  <span>Số lượng: {room.total_quantity} phòng</span>
                </div>

                <h3 className="font-serif text-xl font-bold text-text-primary mt-1">
                  {room.name}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary mt-3 py-2.5 border-y border-border-default">
                  <span className="inline-flex items-center gap-1">
                    <BedDouble className="w-3.5 h-3.5 text-brand-gold-dark" />
                    {room.bed_count} giường
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-brand-gold-dark" />
                    Tối đa {room.max_adults} người lớn
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-brand-gold-dark" />
                    {room.area_sqm} m²
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-text-muted block">Giá niêm yết:</span>
                    <span className="font-serif text-2xl font-bold text-bg-wood-deep">
                      {formatVND(room.price_per_night)}
                    </span>
                    <span className="text-xs text-text-muted"> / đêm</span>
                  </div>
                  <Link
                    to={`/rooms/${room.slug}`}
                    target="_blank"
                    className="text-xs text-brand-gold-dark hover:underline inline-flex items-center gap-1"
                  >
                    Xem trên Web <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-bg-ivory border-t border-border-default flex items-center justify-between gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                onClick={() => handleOpenEdit(room)}
              >
                Chỉnh sửa & Ảnh
              </Button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(room)}
                  className="p-2 rounded-classic border border-border-default bg-bg-ivory-white hover:border-brand-gold text-text-secondary hover:text-text-primary transition-colors"
                  title={room.is_published ? 'Ẩn phòng này khỏi Website' : 'Công khai phòng này'}
                >
                  {room.is_published ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4 text-state-success" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRoom(room)}
                  className="p-2 rounded-classic border border-border-default bg-bg-ivory-white hover:border-state-danger text-state-danger transition-colors"
                  title="Xóa hạng phòng"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Room Modal matching Figma Frame 6:256 */}
      {editingRoom && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Cập Nhật Hạng Phòng: ${editingRoom.name}`}
          subtitle="Quản lý thông tin chi tiết, giá phòng, trạng thái, tiện ích và bộ sưu tập hình ảnh/video."
          maxWidthClass="max-w-4xl"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" onClick={handleSaveRoomModal}>
                Lưu thông tin phòng
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveRoomModal} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <InputField
                  label="Tên hạng phòng"
                  required
                  value={editingRoom.name}
                  onChange={(e) =>
                    setEditingRoom({
                      ...editingRoom,
                      name: e.target.value,
                      slug: slugifyVN(e.target.value),
                    })
                  }
                />
              </div>
              <InputField
                label="Mã phòng (Room Code)"
                required
                value={editingRoom.room_code}
                onChange={(e) =>
                  setEditingRoom({ ...editingRoom, room_code: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-1.5">
                  Phân loại phòng
                </label>
                <select
                  value={editingRoom.room_type}
                  onChange={(e) => {
                    const rt = e.target.value as RoomTypeKey;
                    const defaultBeds =
                      rt === '1_bed' ? 1 : rt === '2_beds' ? 2 : rt === '3_beds' ? 3 : editingRoom.bed_count;
                    setEditingRoom({
                      ...editingRoom,
                      room_type: rt,
                      bed_count: defaultBeds,
                    });
                  }}
                  className="w-full h-10 px-3 rounded-classic bg-bg-ivory-white border border-border-default text-sm"
                >
                  <option value="1_bed">Phòng 1 giường</option>
                  <option value="2_beds">Phòng 2 giường</option>
                  <option value="3_beds">Phòng 3 giường</option>
                  <option value="custom">Phòng loại khác (Admin tạo)</option>
                </select>
              </div>

              <InputField
                label="Giá / đêm (VNĐ)"
                type="number"
                min={50000}
                step={10000}
                required
                value={editingRoom.price_per_night}
                onChange={(e) =>
                  setEditingRoom({
                    ...editingRoom,
                    price_per_night: Number(e.target.value),
                  })
                }
              />

              <InputField
                label="Số giường"
                type="number"
                min={1}
                max={6}
                required
                value={editingRoom.bed_count}
                onChange={(e) =>
                  setEditingRoom({
                    ...editingRoom,
                    bed_count: Number(e.target.value),
                  })
                }
              />

              <InputField
                label="Tổng số lượng phòng này"
                type="number"
                min={1}
                max={50}
                required
                value={editingRoom.total_quantity}
                onChange={(e) =>
                  setEditingRoom({
                    ...editingRoom,
                    total_quantity: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <InputField
                label="Sức chứa người lớn"
                type="number"
                min={1}
                max={10}
                value={editingRoom.max_adults}
                onChange={(e) =>
                  setEditingRoom({
                    ...editingRoom,
                    max_adults: Number(e.target.value),
                  })
                }
              />
              <InputField
                label="Trẻ em đi kèm"
                type="number"
                min={0}
                max={5}
                value={editingRoom.max_children}
                onChange={(e) =>
                  setEditingRoom({
                    ...editingRoom,
                    max_children: Number(e.target.value),
                  })
                }
              />
              <InputField
                label="Diện tích (m²)"
                type="number"
                min={10}
                value={editingRoom.area_sqm}
                onChange={(e) =>
                  setEditingRoom({
                    ...editingRoom,
                    area_sqm: Number(e.target.value),
                  })
                }
              />
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-1.5">
                  Trạng thái vận hành
                </label>
                <select
                  value={editingRoom.status}
                  onChange={(e) =>
                    setEditingRoom({
                      ...editingRoom,
                      status: e.target.value as RoomStatus,
                    })
                  }
                  className="w-full h-10 px-3 rounded-classic bg-bg-ivory-white border border-border-default text-sm"
                >
                  <option value="available">Đang trống / Mở đặt phòng</option>
                  <option value="occupied">Đang có khách</option>
                  <option value="maintenance">Đang bảo trì / Tạm khóa</option>
                </select>
              </div>
            </div>

            {/* Visibility & Demo Notice Toggles */}
            <div className="flex flex-wrap items-center gap-6 p-4 rounded-classic bg-bg-cream/60 border border-border-default text-xs">
              <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-text-primary">
                <input
                  type="checkbox"
                  checked={editingRoom.is_published}
                  onChange={(e) =>
                    setEditingRoom({ ...editingRoom, is_published: e.target.checked })
                  }
                />
                Công khai hiển thị trên Website khách hàng
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-text-primary">
                <input
                  type="checkbox"
                  checked={editingRoom.is_featured}
                  onChange={(e) =>
                    setEditingRoom({ ...editingRoom, is_featured: e.target.checked })
                  }
                />
                Hiển thị ở mục Phòng nổi bật Trang chủ
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-text-secondary">
                <input
                  type="checkbox"
                  checked={editingRoom.is_demo_data}
                  onChange={(e) =>
                    setEditingRoom({ ...editingRoom, is_demo_data: e.target.checked })
                  }
                />
                Gắn nhãn &ldquo;Ảnh/Giá minh họa tạm thời&rdquo;
              </label>
            </div>

            {/* Descriptions */}
            <TextAreaField
              label="Mô tả ngắn (Hiển thị ở thẻ phòng)"
              rows={2}
              value={editingRoom.short_description}
              onChange={(e) =>
                setEditingRoom({ ...editingRoom, short_description: e.target.value })
              }
            />

            <TextAreaField
              label="Mô tả chi tiết & Nội thất"
              rows={3}
              value={editingRoom.full_description}
              onChange={(e) =>
                setEditingRoom({ ...editingRoom, full_description: e.target.value })
              }
            />

            {/* Gallery Management (Upload File + Add URL + Video) */}
            <div className="p-5 rounded-classic bg-bg-ivory border border-border-default space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif text-base font-bold text-text-primary flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-brand-gold-dark" />
                    Quản lý Bộ sưu tập Ảnh & Video ({editingRoom.media.length})
                  </h4>
                  <p className="text-xs text-text-secondary">
                    Tải ảnh chụp thực tế từ máy tính hoặc dán đường dẫn ảnh/video. Bấm &ldquo;Đặt làm ảnh chính&rdquo; để chọn ảnh bìa.
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-classic bg-brand-gold text-text-on-dark text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-brand-gold-dark transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Chọn ảnh từ máy tính</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Add by URL */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    placeholder="Dán URL hình ảnh (hoặc /images/...)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full h-9 px-3 rounded-classic bg-bg-ivory-white border border-border-default text-xs"
                  />
                </div>
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    placeholder="Mô tả ảnh chuẩn SEO (alt text)"
                    value={newImageAlt}
                    onChange={(e) => setNewImageAlt(e.target.value)}
                    className="w-full h-9 px-3 rounded-classic bg-bg-ivory-white border border-border-default text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={handleAddImageUrl}
                  >
                    Thêm ảnh
                  </Button>
                </div>
              </div>

              {/* Add Video URL */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-10">
                  <input
                    type="text"
                    placeholder="Dán link Video giới thiệu phòng (MP4 hoặc YouTube embed URL)..."
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    className="w-full h-9 px-3 rounded-classic bg-bg-ivory-white border border-border-default text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    fullWidth
                    leftIcon={<Video className="w-3.5 h-3.5" />}
                    onClick={handleAddVideoUrl}
                  >
                    Thêm Video
                  </Button>
                </div>
              </div>

              {/* Media Thumbnails Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {editingRoom.media.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-classic border p-2 bg-bg-ivory-white flex flex-col justify-between ${
                      m.is_primary ? 'border-brand-gold ring-2 ring-brand-gold/30' : 'border-border-default'
                    }`}
                  >
                    <div className="relative h-24 rounded-classic overflow-hidden bg-bg-cream mb-2">
                      {m.media_type === 'video' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-xs text-text-secondary">
                          <Video className="w-6 h-6 text-brand-gold-dark mb-1" />
                          <span>Video clip</span>
                        </div>
                      ) : (
                        <img
                          src={m.url}
                          alt={m.alt_text}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {m.is_primary && (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-brand-gold text-text-on-dark text-[10px] font-bold">
                          Ảnh bìa chính
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      {!m.is_primary ? (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryMedia(m.id)}
                          className="text-brand-gold-dark hover:underline font-medium"
                        >
                          Đặt làm ảnh chính
                        </button>
                      ) : (
                        <span className="text-state-success font-medium flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Đang chọn
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(m.id)}
                        className="text-state-danger hover:underline"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities Checkboxes */}
            <div className="p-5 rounded-classic bg-bg-ivory border border-border-default space-y-3">
              <h4 className="font-serif text-base font-bold text-text-primary">
                Tiện nghi trang bị trong phòng
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {DEFAULT_AMENITY_OPTIONS.map((am) => {
                  const checked = editingRoom.amenities.some((a) => a.code === am.code);
                  return (
                    <label
                      key={am.code}
                      className={`flex items-center gap-2.5 p-2.5 rounded-classic border text-xs cursor-pointer transition-colors ${
                        checked
                          ? 'border-brand-gold bg-brand-champagne/30 font-semibold text-text-primary'
                          : 'border-border-default bg-bg-ivory-white text-text-secondary'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleAmenity(am)}
                      />
                      <span>{am.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
