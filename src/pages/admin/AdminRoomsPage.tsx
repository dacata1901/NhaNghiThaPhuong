import React, { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Check,
  BedDouble,
  Users,
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
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
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
  const [newAmenityName, setNewAmenityName] = useState('');

  // Confirm Dialog states for Save / Delete / Toggle Publish
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [roomToTogglePublish, setRoomToTogglePublish] = useState<Room | null>(null);

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
    price_per_night: 0,
    total_quantity: 5,
    short_description:
      'Không gian phòng nghỉ sạch sẽ, thoáng mát, đầy đủ điều hòa, TV và phòng tắm riêng.',
    full_description:
      'Phòng nghỉ được thiết kế ấm cúng, sàn gạch sạch sẽ, trang bị đầy đủ điều hòa, tivi màn hình phẳng và phòng tắm khép kín có bình nóng lạnh Ariston.',
    policies:
      'Nhận phòng linh hoạt 24/7. Vui lòng xuất trình CCCD khi nhận phòng.',
    status: 'available',
    is_published: true,
    is_featured: true,
    is_demo_data: false,
    rating: 5,
    reviews_count: 0,
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
    amenities: DEFAULT_AMENITY_OPTIONS,
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

  const handleConfirmTogglePublish = () => {
    if (!roomToTogglePublish) return;
    saveRoom({
      ...roomToTogglePublish,
      is_published: !roomToTogglePublish.is_published,
      updated_at: new Date().toISOString(),
    });
    setRoomToTogglePublish(null);
  };

  const handleConfirmDeleteRoom = () => {
    if (!roomToDelete) return;
    deleteRoom(roomToDelete.id);
    setRoomToDelete(null);
  };

  // Upload image file
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
            alt_text: `${editingRoom.name}`,
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
            alt_text: `${editingRoom.name}`,
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
      alt_text: `Hình ảnh ${editingRoom.name}`,
      is_primary: editingRoom.media.length === 0,
      sort_order: editingRoom.media.length + 1,
    };
    setEditingRoom({
      ...editingRoom,
      media: [...editingRoom.media, item],
    });
    setNewImageUrl('');
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

  const handleRequestSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    setConfirmSaveOpen(true);
  };

  const handleConfirmSaveRoom = () => {
    if (!editingRoom) return;

    const roomTypeLabelMap: Record<RoomTypeKey, string> = {
      '1_bed': 'Phòng 1 giường',
      '2_beds': 'Phòng 2 giường',
      '3_beds': 'Phòng 3 giường',
      custom: 'Phòng đặc biệt',
    };

    const finalRoom: Room = {
      ...editingRoom,
      slug: editingRoom.slug.trim() || slugifyVN(editingRoom.name),
      room_type_label: roomTypeLabelMap[editingRoom.room_type],
      updated_at: new Date().toISOString(),
    };

    saveRoom(finalRoom);
    setConfirmSaveOpen(false);
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-bg-ivory-white border border-border-default rounded-2xl p-6 shadow-luxury-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-gold-dark">
            QUẢN LÝ LOẠI PHÒNG ĐƠN GIẢN
          </span>
          <h2 className="font-serif text-2xl font-extrabold text-text-primary mt-1">
            Danh Sách Loại Phòng ({rooms.length} loại)
          </h2>
          <p className="text-xs sm:text-sm font-medium text-text-secondary mt-1">
            Thêm hoặc chỉnh sửa tên phòng, số giường, mô tả ngắn và hình ảnh phòng cực kỳ dễ dàng.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
          className="rounded-xl font-extrabold"
        >
          Thêm loại phòng mới
        </Button>
      </div>

      {/* Rooms Grid (No price / no room quantity clutter) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-bg-ivory-white border border-border-default rounded-2xl overflow-hidden shadow-luxury-sm flex flex-col justify-between"
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
                    <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-bg-wood-deep/85 text-brand-gold-light">
                      Đang hiển thị
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-neutral-800/85 text-white">
                      Đang tạm ẩn
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-bg-wood-deep/85 text-text-on-dark text-xs font-bold">
                  {room.media.length} ảnh
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-brand-gold-dark font-extrabold uppercase tracking-wider">
                  <span>
                    Mã: {room.room_code} • {room.room_type_label}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-extrabold text-text-primary mt-1">
                  {room.name}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-text-secondary mt-3 py-2.5 border-y border-border-default">
                  <span className="inline-flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-brand-gold-dark" />
                    <strong>{room.bed_count} giường</strong>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-brand-gold-dark" />
                    <strong>Tối đa {room.max_adults} khách</strong>
                  </span>
                </div>

                <p className="text-xs font-medium text-text-secondary mt-3 line-clamp-2">
                  {room.short_description}
                </p>

                <div className="mt-3 flex justify-end">
                  <Link
                    to={`/rooms/${room.slug}`}
                    className="text-xs font-extrabold text-brand-gold-dark hover:underline inline-flex items-center gap-1"
                  >
                    Xem trên giao diện Khách <ExternalLink className="w-3 h-3" />
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
                className="rounded-xl font-extrabold"
              >
                Sửa thông tin &amp; Ảnh
              </Button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRoomToTogglePublish(room)}
                  className="p-2.5 rounded-xl border border-border-default bg-bg-ivory-white hover:border-brand-gold text-text-secondary hover:text-text-primary transition-colors"
                  title={
                    room.is_published
                      ? 'Ẩn loại phòng này khỏi Website'
                      : 'Hiện loại phòng này trên Website'
                  }
                >
                  {room.is_published ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4 text-state-success" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setRoomToDelete(room)}
                  className="p-2.5 rounded-xl border border-border-default bg-bg-ivory-white hover:border-state-danger text-state-danger transition-colors"
                  title="Xóa loại phòng"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simplified Add / Edit Room Modal */}
      {editingRoom && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Thông Tin Phòng: ${editingRoom.name}`}
          subtitle="Điền ngắn gọn tên phòng, loại giường, mô tả và chọn ảnh phòng."
          maxWidthClass="max-w-2xl"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl font-bold"
              >
                Đóng lại
              </Button>
              <Button
                variant="primary"
                onClick={handleRequestSaveRoom}
                className="rounded-xl font-extrabold"
              >
                Lưu thông tin phòng
              </Button>
            </>
          }
        >
          <form onSubmit={handleRequestSaveRoom} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <InputField
                  label="Tên loại phòng"
                  placeholder="Ví dụ: Phòng Đơn 1 Giường Lớn"
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
                label="Mã ký hiệu phòng"
                placeholder="VD: P101"
                required
                value={editingRoom.room_code}
                onChange={(e) =>
                  setEditingRoom({
                    ...editingRoom,
                    room_code: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-1.5">
                  Loại phòng
                </label>
                <select
                  value={editingRoom.room_type}
                  onChange={(e) => {
                    const rt = e.target.value as RoomTypeKey;
                    const defaultBeds =
                      rt === '1_bed'
                        ? 1
                        : rt === '2_beds'
                        ? 2
                        : rt === '3_beds'
                        ? 3
                        : editingRoom.bed_count;
                    setEditingRoom({
                      ...editingRoom,
                      room_type: rt,
                      bed_count: defaultBeds,
                    });
                  }}
                  className="w-full h-11 px-3 rounded-xl bg-bg-ivory-white border border-border-default text-sm font-bold"
                >
                  <option value="1_bed">Phòng 1 giường</option>
                  <option value="2_beds">Phòng 2 giường</option>
                  <option value="3_beds">Phòng 3 giường</option>
                  <option value="custom">Phòng loại khác</option>
                </select>
              </div>

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
                label="Người lớn tối đa"
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
                label="Trẻ em tối đa"
                type="number"
                min={0}
                max={10}
                value={editingRoom.max_children}
                onChange={(e) =>
                  setEditingRoom({
                    ...editingRoom,
                    max_children: Math.max(0, Number(e.target.value)),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-4 rounded-2xl bg-bg-cream/60 border border-border-default">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-1">
                  Trạng thái đón khách
                </label>
                <select
                  value={editingRoom.status}
                  onChange={(e) =>
                    setEditingRoom({
                      ...editingRoom,
                      status: e.target.value as RoomStatus,
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl bg-bg-ivory-white border border-border-default text-sm font-bold"
                >
                  <option value="available">Đang mở nhận đặt phòng</option>
                  <option value="maintenance">Tạm ngưng nhận khách</option>
                </select>
              </div>

              <label className="inline-flex items-center gap-2.5 cursor-pointer font-extrabold text-sm text-text-primary pt-4 sm:pt-5">
                <input
                  type="checkbox"
                  checked={editingRoom.is_published}
                  onChange={(e) =>
                    setEditingRoom({
                      ...editingRoom,
                      is_published: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                Hiển thị trên Website cho khách chọn
              </label>
            </div>

            <TextAreaField
              label="Mô tả ngắn (hiển thị trên thẻ phòng ở Trang Chủ / Danh sách phòng)"
              rows={2}
              value={editingRoom.short_description}
              onChange={(e) =>
                setEditingRoom({
                  ...editingRoom,
                  short_description: e.target.value,
                })
              }
            />

            <TextAreaField
              label="Giới thiệu phòng (hiển thị ở trang chi tiết phòng)"
              rows={4}
              placeholder="Mô tả chi tiết không gian, nội thất, view phòng..."
              value={editingRoom.full_description}
              onChange={(e) =>
                setEditingRoom({
                  ...editingRoom,
                  full_description: e.target.value,
                })
              }
            />

            <TextAreaField
              label="Lưu ý khi nhận phòng (hiển thị ở trang chi tiết phòng)"
              rows={2}
              placeholder="VD: Thời gian nhận và trả phòng linh hoạt. Vui lòng mang theo CCCD khi nhận phòng."
              value={editingRoom.policies}
              onChange={(e) =>
                setEditingRoom({
                  ...editingRoom,
                  policies: e.target.value,
                })
              }
            />

            {/* Room Amenities Editor (Trong phòng có gì) */}
            <div className="p-4 rounded-2xl bg-bg-ivory border border-border-default space-y-4">
              <div>
                <h4 className="font-serif text-base font-extrabold text-text-primary flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-gold-dark" />
                  Trong phòng có gì? ({(editingRoom.amenities || []).length} tiện nghi)
                </h4>
                <p className="text-xs font-medium text-text-secondary mt-0.5">
                  Chọn nhanh các tiện nghi có sẵn hoặc tự thêm đồ dùng bên trong phòng để hiển thị cho khách xem.
                </p>
              </div>

              {/* Preset quick-toggle chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  'Máy lạnh làm mát nhanh',
                  'Phòng tắm riêng & Nước nóng lạnh',
                  'Wi-Fi tốc độ cao miễn phí',
                  'Tivi màn hình phẳng',
                  'Chăn ga gối nệm sạch sẽ mỗi ngày',
                  'Bãi đỗ xe an toàn miễn phí',
                  'Ghế thư giãn & bàn trà',
                  'Quạt mát',
                  'Tủ quần áo',
                  'Ấm đun nước siêu tốc',
                ].map((presetName) => {
                  const currentList = editingRoom.amenities || [];
                  const isSelected = currentList.some(
                    (a) => a.name.trim().toLowerCase() === presetName.toLowerCase()
                  );
                  return (
                    <button
                      key={presetName}
                      type="button"
                      onClick={() => {
                        const updated = isSelected
                          ? currentList.filter(
                              (a) => a.name.trim().toLowerCase() !== presetName.toLowerCase()
                            )
                          : [
                              ...currentList,
                              {
                                id: `am-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                                code: slugifyVN(presetName),
                                name: presetName,
                                icon_name: 'Check',
                                is_featured_home: true,
                              },
                            ];
                        setEditingRoom({ ...editingRoom, amenities: updated });
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-brand-gold text-text-on-dark border-brand-gold shadow-sm'
                          : 'bg-white text-text-primary border-border-default hover:border-brand-gold/50'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{presetName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom amenity input */}
              {(() => {
                const addCustomAmenity = () => {
                  const trimmed = newAmenityName.trim();
                  if (!trimmed) return;
                  const currentList = editingRoom.amenities || [];
                  if (
                    !currentList.some(
                      (a) => a.name.trim().toLowerCase() === trimmed.toLowerCase()
                    )
                  ) {
                    setEditingRoom({
                      ...editingRoom,
                      amenities: [
                        ...currentList,
                        {
                          id: `am-${Date.now()}`,
                          code: slugifyVN(trimmed),
                          name: trimmed,
                          icon_name: 'Check',
                          is_featured_home: true,
                        },
                      ],
                    });
                  }
                  setNewAmenityName('');
                };

                return (
                  <div className="flex items-stretch gap-2">
                    <input
                      type="text"
                      value={newAmenityName}
                      onChange={(e) => setNewAmenityName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomAmenity();
                        }
                      }}
                      placeholder="Thêm tiện nghi khác (VD: Tủ lạnh mini, Ban công...)"
                      className="flex-1 min-w-0 h-11 px-4 rounded-xl bg-white border border-border-default text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition"
                    />
                    <button
                      type="button"
                      onClick={addCustomAmenity}
                      disabled={!newAmenityName.trim()}
                      className="shrink-0 h-11 inline-flex items-center justify-center gap-1.5 px-4 rounded-xl bg-brand-gold text-white text-sm font-extrabold whitespace-nowrap shadow-sm hover:bg-brand-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm</span>
                    </button>
                  </div>
                );
              })()}

              {/* Active amenities list */}
              {(editingRoom.amenities || []).length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Danh sách đang hiển thị cho khách:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(editingRoom.amenities || []).map((am) => (
                      <div
                        key={am.id}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white border border-border-default text-xs font-bold text-text-primary"
                      >
                        <span className="truncate">{am.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingRoom({
                              ...editingRoom,
                              amenities: (editingRoom.amenities || []).filter(
                                (item) => item.id !== am.id
                              ),
                            })
                          }
                          className="p-1 rounded-lg text-status-danger hover:bg-status-danger-bg transition-colors shrink-0"
                          title="Xóa tiện nghi này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Simple Image Management */}
            <div className="p-4 rounded-2xl bg-bg-ivory border border-border-default space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif text-base font-extrabold text-text-primary flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-brand-gold-dark" />
                    Ảnh phòng ({editingRoom.media.length} ảnh)
                  </h4>
                  <p className="text-xs font-medium text-text-secondary">
                    Bấm nút bên phải để tải ảnh từ điện thoại / máy tính lên.
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gold text-text-on-dark text-xs font-extrabold cursor-pointer hover:bg-brand-gold-dark transition-colors shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span>Tải ảnh lên</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Optional URL input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Hoặc dán đường dẫn ảnh vào đây..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl bg-bg-ivory-white border border-border-default text-xs font-semibold"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddImageUrl}
                  className="rounded-xl font-bold"
                >
                  Thêm ảnh
                </Button>
              </div>

              {/* Media Thumbnails */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {editingRoom.media.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-xl border p-2 bg-bg-ivory-white flex flex-col justify-between ${
                      m.is_primary
                        ? 'border-brand-gold ring-2 ring-brand-gold/30'
                        : 'border-border-default'
                    }`}
                  >
                    <div className="relative h-24 rounded-lg overflow-hidden bg-bg-cream mb-2">
                      <img
                        src={m.url}
                        alt={m.alt_text}
                        className="w-full h-full object-cover"
                      />
                      {m.is_primary && (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-brand-gold text-text-on-dark text-[10px] font-extrabold">
                          Ảnh chính
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      {!m.is_primary ? (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryMedia(m.id)}
                          className="text-brand-gold-dark hover:underline font-extrabold"
                        >
                          Chọn làm ảnh chính
                        </button>
                      ) : (
                        <span className="text-state-success font-extrabold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Ảnh đại diện
                        </span>
                      )}

                      {editingRoom.media.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(m.id)}
                          className="text-state-danger hover:underline font-bold"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Save Room Dialog */}
      <ConfirmDialog
        isOpen={confirmSaveOpen}
        title="Xác nhận lưu thông tin phòng?"
        description="Vui lòng kiểm tra lại thông tin phòng trước khi lưu vào hệ thống:"
        confirmText="Đồng ý Lưu phòng"
        cancelText="Quay lại chỉnh sửa"
        variant="confirm"
        details={
          editingRoom
            ? [
                { label: 'Tên loại phòng', value: editingRoom.name },
                { label: 'Mã phòng', value: editingRoom.room_code },
                { label: 'Số giường', value: `${editingRoom.bed_count} giường` },
                {
                  label: 'Số khách tối đa',
                  value: `${editingRoom.max_adults} khách`,
                },
              ]
            : []
        }
        onConfirm={handleConfirmSaveRoom}
        onCancel={() => setConfirmSaveOpen(false)}
      />

      {/* Confirm Toggle Publish Dialog */}
      <ConfirmDialog
        isOpen={Boolean(roomToTogglePublish)}
        title={
          roomToTogglePublish?.is_published
            ? 'Xác nhận ẨN loại phòng này?'
            : 'Xác nhận HIỂN THỊ loại phòng này?'
        }
        description={
          roomToTogglePublish?.is_published
            ? 'Khi ẩn, khách hàng sẽ tạm thời không thấy loại phòng này trên trang Đặt phòng.'
            : 'Loại phòng này sẽ xuất hiện lại trên Website để khách hàng chọn đặt.'
        }
        confirmText="Đồng ý Thực hiện"
        cancelText="Hủy bỏ"
        variant="warning"
        details={
          roomToTogglePublish
            ? [
                { label: 'Tên phòng', value: roomToTogglePublish.name },
                { label: 'Mã phòng', value: roomToTogglePublish.room_code },
              ]
            : []
        }
        onConfirm={handleConfirmTogglePublish}
        onCancel={() => setRoomToTogglePublish(null)}
      />

      {/* Confirm Delete Room Dialog */}
      <ConfirmDialog
        isOpen={Boolean(roomToDelete)}
        title="Xác nhận XÓA loại phòng này?"
        description="Bạn có chắc chắn muốn xóa loại phòng này khỏi danh sách không? Vui lòng xác nhận lại 1 lần nữa:"
        confirmText="Đồng ý Xóa phòng"
        cancelText="Giữ lại, không xóa"
        variant="danger"
        details={
          roomToDelete
            ? [
                { label: 'Tên loại phòng', value: roomToDelete.name },
                { label: 'Mã phòng', value: roomToDelete.room_code },
              ]
            : []
        }
        onConfirm={handleConfirmDeleteRoom}
        onCancel={() => setRoomToDelete(null)}
      />
    </div>
  );
};
