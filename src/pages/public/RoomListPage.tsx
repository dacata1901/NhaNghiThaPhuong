import React, { useState, useMemo } from 'react';
import { BedDouble } from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { RoomCard } from '@/components/booking/RoomCard';

export const RoomListPage: React.FC = () => {
  const { rooms } = useHotelData();
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
        title="Các Loại Phòng Nghỉ | Nhà Nghỉ Tha Phương"
        description="Danh sách các loại phòng nghỉ 1 người, 2 người và 3 người sạch sẽ, tiện nghi tại Nhà Nghỉ Tha Phương."
        canonicalPath="/rooms"
      />

      <section className="pt-28 pb-16 bg-bg-ivory min-h-screen">
        <div className="container-luxury max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              Các Loại Phòng Nghỉ
            </h1>
            <p className="text-sm sm:text-base font-semibold text-text-secondary mt-2">
              Chọn loại phòng phù hợp theo thứ tự: Phòng 1 Người, Phòng 2 Người hoặc Phòng 3 Người
            </p>

            {/* Nút chọn nhanh loại phòng theo đúng thứ tự 1 -> 2 -> 3 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-6 bg-bg-ivory-white p-2 rounded-2xl border border-border-default shadow-xs w-full max-w-4xl mx-auto">
              {[
                { key: 'all', label: 'Tất cả loại phòng' },
                { key: '1_bed', label: 'Phòng 1 Người (1 Giường)' },
                { key: '2_beds', label: 'Phòng 2 Người (2 Giường)' },
                { key: '3_beds', label: 'Phòng 3 Người (3 Giường)' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedType(tab.key)}
                  className={`h-10 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    selectedType === tab.key
                      ? 'bg-bg-wood-deep text-white shadow-xs'
                      : 'text-text-primary hover:bg-bg-cream/70'
                  }`}
                >
                  <BedDouble className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} layout="list" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
export default RoomListPage;
