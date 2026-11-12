import React, { useState, useMemo } from 'react';
import { BedDouble, Phone, MessageSquare } from 'lucide-react';
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
        description="Danh sách các loại phòng nghỉ 1 giường và 2 giường sạch sẽ, tiện nghi tại Nhà Nghỉ Tha Phương."
        canonicalPath="/rooms"
      />

      <section className="pt-28 pb-16 bg-bg-ivory min-h-screen">
        <div className="container-luxury max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              Các Hạng Phòng Nghỉ
            </h1>
            <p className="text-sm sm:text-base text-text-secondary mt-2">
              Chọn loại phòng bạn muốn đặt hoặc liên hệ trực tiếp lễ tân qua Điện thoại / SMS
            </p>

            {/* Nút chọn nhanh loại phòng */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 mt-5 bg-bg-ivory-white p-1.5 rounded-2xl border border-border-default shadow-xs">
              {[
                { key: 'all', label: 'Tất cả hạng phòng' },
                { key: '1_bed', label: 'Phòng 1 Giường Đôi' },
                { key: '2_beds', label: 'Phòng 2 Giường Đôi' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedType(tab.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all inline-flex items-center gap-1.5 ${
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

          {/* Hộp gọi nhanh / nhắn SMS ở cuối danh sách */}
          <div className="mt-10 bg-bg-ivory-white border border-border-default rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-luxury">
            <div>
              <h2 className="text-lg font-extrabold text-text-primary">
                Cần tư vấn chọn phòng trực tiếp?
              </h2>
              <p className="text-sm text-text-secondary mt-0.5">
                Bấm gọi điện hoặc gửi tin nhắn SMS cho lễ tân 24/7: <strong>{settings.phone_primary}</strong>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={`tel:${settings.phone_primary.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-state-success text-white text-sm font-extrabold hover:opacity-95"
              >
                <Phone className="w-4 h-4" /> Gọi điện ngay
              </a>
              <a
                href={`sms:${settings.phone_primary.replace(/\s+/g, '')}?body=Xin%20chao%20Nha%20Nghi%20Tha%20Phuong,%20toi%20muon%20hoi%20phong`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gold text-white text-sm font-extrabold hover:opacity-95"
              >
                <MessageSquare className="w-4 h-4" /> Nhắn tin SMS
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default RoomListPage;
