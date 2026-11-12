import React, { useState, useMemo } from 'react';
import { BedDouble, Phone } from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { RoomCard } from '@/components/booking/RoomCard';

export const RoomListPage: React.FC = () => {
  const { rooms, settings } = useHotelData();
  const [selectedType, setSelectedType] = useState<string>('all');

  const publishedRooms = useMemo(
    () => rooms.filter((r) => r.is_published),
    [rooms]
  );

  const filteredRooms = useMemo(() => {
    if (selectedType === 'all') return publishedRooms;
    return publishedRooms.filter((r) => r.room_type === selectedType);
  }, [publishedRooms, selectedType]);

  return (
    <>
      <SEOHead
        title="Các Hạng Phòng Nghỉ | Nhà Nghỉ Tha Phương"
        description="Danh sách các loại phòng nghỉ 1 giường, 2 giường và phòng 3 người sạch sẽ, tiện nghi tại Nhà Nghỉ Tha Phương."
        canonicalPath="/rooms"
      />

      <section className="pt-28 pb-16 bg-bg-ivory min-h-screen">
        <div className="container-luxury max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              Các Loại Phòng Nghỉ
            </h1>
            <p className="text-sm sm:text-base font-medium text-text-secondary mt-2">
              Chọn loại phòng phù hợp (Phòng 1 Người, 2 Người hoặc 3 Người) để đặt giữ phòng nhanh chóng
            </p>

            {/* Nút chọn nhanh loại phòng (bao gồm cả Phòng 3 Người) */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 mt-6 bg-bg-ivory-white p-2 rounded-2xl border border-border-default shadow-xs">
              {[
                { key: 'all', label: 'Tất cả loại phòng' },
                { key: '1_bed', label: 'Phòng Đơn (1–2 Người)' },
                { key: '2_beds', label: 'Phòng Đôi (2 Giường)' },
                { key: '3_beds', label: 'Phòng 3 Người (3 Giường)' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedType(tab.key)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all inline-flex items-center gap-1.5 ${
                    selectedType === tab.key
                      ? 'bg-bg-wood-deep text-brand-gold-light shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <BedDouble className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} layout="list" />
            ))}
          </div>

          {/* Hộp gọi nhanh ở cuối danh sách */}
          <div className="mt-10 bg-bg-ivory-white border border-border-default rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-luxury">
            <div>
              <h2 className="text-lg font-extrabold text-text-primary">
                Cần tư vấn chọn phòng trực tiếp?
              </h2>
              <p className="text-sm font-medium text-text-secondary mt-0.5">
                Bấm gọi điện trực tiếp tới lễ tân 24/7: <strong>{settings.phone_primary}</strong>
              </p>
            </div>
            <a
              href={`tel:${settings.phone_primary.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-state-success text-white text-sm font-extrabold hover:opacity-95"
            >
              <Phone className="w-4 h-4" /> Gọi điện: {settings.phone_primary}
            </a>
          </div>
        </div>
      </section>
    </>
  );
};
export default RoomListPage;
