import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  RotateCcw,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useHotelData } from '@/context/HotelDataContext';
import { DEFAULT_AMENITIES } from '@/constants/seedData';
import { PageBanner } from '@/components/common/PageBanner';
import { SEOHead } from '@/components/common/SEOHead';
import { RoomCard } from '@/components/booking/RoomCard';
import { Button } from '@/components/ui/Button';
import { formatCurrencyVND, formatDateVN, cn } from '@/lib/utils';

export const RoomListPage: React.FC = () => {
  const { rooms, getAvailableQuantityForRoom, pageSeoList } = useHotelData();
  const [searchParams, setSearchParams] = useSearchParams();

  const today = dayjs().format('YYYY-MM-DD');
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [minGuests, setMinGuests] = useState<number>(
    Number(searchParams.get('guests')) || 1
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [onlyAvailableByDate, setOnlyAvailableByDate] = useState<boolean>(
    Boolean(searchParams.get('checkIn'))
  );
  const [checkInDate, setCheckInDate] = useState(
    searchParams.get('checkIn') || today
  );
  const [checkOutDate, setCheckOutDate] = useState(
    searchParams.get('checkOut') || tomorrow
  );
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc'>('default');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    const typeParam = searchParams.get('type');
    const guestsParam = searchParams.get('guests');
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');

    if (typeParam) setSelectedType(typeParam);
    if (guestsParam) setMinGuests(Number(guestsParam));
    if (checkInParam) {
      setCheckInDate(checkInParam);
      setOnlyAvailableByDate(true);
    }
    if (checkOutParam) setCheckOutDate(checkOutParam);
  }, [searchParams]);

  const toggleAmenity = (code: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
    );
  };

  const resetFilters = () => {
    setKeyword('');
    setSelectedType('all');
    setMaxPrice(1000000);
    setMinGuests(1);
    setSelectedAmenities([]);
    setOnlyAvailableByDate(false);
    setSortBy('default');
    setSearchParams({});
  };

  const publishedRooms = useMemo(
    () => rooms.filter((r) => r.is_published),
    [rooms]
  );

  const filteredRooms = useMemo(() => {
    return publishedRooms
      .filter((room) => {
        if (keyword.trim()) {
          const q = keyword.toLowerCase();
          const matchName = room.name.toLowerCase().includes(q);
          const matchCode = room.room_code.toLowerCase().includes(q);
          const matchDesc = room.short_description.toLowerCase().includes(q);
          if (!matchName && !matchCode && !matchDesc) return false;
        }

        if (selectedType !== 'all' && room.room_type !== selectedType) {
          return false;
        }

        if (room.price_per_night > maxPrice) {
          return false;
        }

        const totalCapacity = room.max_adults + room.max_children;
        if (room.max_adults < minGuests && totalCapacity < minGuests) {
          return false;
        }

        if (selectedAmenities.length > 0) {
          const roomAmenityCodes = room.amenities.map((a) => a.code);
          const hasAll = selectedAmenities.every((code) =>
            roomAmenityCodes.includes(code)
          );
          if (!hasAll) return false;
        }

        if (onlyAvailableByDate) {
          const avail = getAvailableQuantityForRoom(
            room.id,
            checkInDate,
            checkOutDate
          );
          if (avail <= 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price_per_night - b.price_per_night;
        if (sortBy === 'price_desc') return b.price_per_night - a.price_per_night;
        return 0;
      });
  }, [
    publishedRooms,
    keyword,
    selectedType,
    maxPrice,
    minGuests,
    selectedAmenities,
    onlyAvailableByDate,
    checkInDate,
    checkOutDate,
    sortBy,
    getAvailableQuantityForRoom,
  ]);

  const seoConfig = pageSeoList.find((p) => p.page_key === 'rooms');

  return (
    <>
      <SEOHead
        title={
          seoConfig?.seo_title ||
          'Danh Sách Phòng Nghỉ 1 - 2 - 3 Giường | Nhà Nghỉ Tha Phương'
        }
        description={
          seoConfig?.meta_description ||
          'Khám phá các hạng phòng đơn 1 giường, phòng 2 giường và phòng 3 giường tại Nhà Nghỉ Tha Phương. Giá tốt, sạch sẽ, thanh toán trực tiếp khi nhận phòng.'
        }
        canonicalPath="/rooms"
      />

      <PageBanner
        eyebrow="BỘ SƯU TẬP PHÒNG NGHỈ"
        title="Tìm không gian phù hợp"
        subtitle="Phòng nghỉ riêng tư, sạch sẽ và chỉn chu cho từng hành trình. Đặt giữ phòng trực tuyến – Thu tiền trực tiếp khi nhận phòng."
        breadcrumbs={[{ label: 'Phòng nghỉ' }]}
      />

      <section className="py-12 sm:py-16">
        <div className="container-luxury">
          {/* Quick Date & Availability Toolbar matching Figma (24:526) */}
          <div className="bg-bg-ivory-white border border-border-default rounded-card p-4 sm:p-6 shadow-luxury mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-secondary flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold-dark" />
                  Nhận phòng
                </label>
                <input
                  type="date"
                  min={today}
                  value={checkInDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCheckInDate(val);
                    if (
                      dayjs(checkOutDate).isSame(dayjs(val)) ||
                      dayjs(checkOutDate).isBefore(dayjs(val))
                    ) {
                      setCheckOutDate(dayjs(val).add(1, 'day').format('YYYY-MM-DD'));
                    }
                    setOnlyAvailableByDate(true);
                  }}
                  className="w-full bg-bg-ivory text-sm px-3.5 py-2.5 rounded-classic border border-border-default focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-secondary flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold-dark" />
                  Trả phòng
                </label>
                <input
                  type="date"
                  min={dayjs(checkInDate).add(1, 'day').format('YYYY-MM-DD')}
                  value={checkOutDate}
                  onChange={(e) => {
                    setCheckOutDate(e.target.value);
                    setOnlyAvailableByDate(true);
                  }}
                  className="w-full bg-bg-ivory text-sm px-3.5 py-2.5 rounded-classic border border-border-default focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-secondary block mb-1.5">
                  Số lượng khách
                </label>
                <select
                  value={minGuests}
                  onChange={(e) => setMinGuests(Number(e.target.value))}
                  className="w-full bg-bg-ivory text-sm px-3.5 py-2.5 rounded-classic border border-border-default focus:outline-none focus:border-brand-gold"
                >
                  <option value={1}>Từ 1 khách</option>
                  <option value={2}>Từ 2 khách</option>
                  <option value={3}>Từ 3 khách</option>
                  <option value={4}>Từ 4 khách</option>
                  <option value={5}>Từ 5 - 6 khách</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-secondary block mb-1.5">
                  Tìm theo tên / mã phòng
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="VD: Phòng 1 giường, TP-101..."
                    className="w-full bg-bg-ivory text-sm pl-9 pr-3.5 py-2.5 rounded-classic border border-border-default focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-text-primary cursor-pointer py-2.5 px-3 bg-bg-cream/60 rounded-classic border border-border-strong">
                  <input
                    type="checkbox"
                    checked={onlyAvailableByDate}
                    onChange={(e) => setOnlyAvailableByDate(e.target.checked)}
                    className="rounded border-border-strong text-brand-gold focus:ring-brand-gold"
                  />
                  <span>Chỉ phòng còn trống theo ngày</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Filters matching Figma (24:548) */}
            <aside className="lg:col-span-3 bg-bg-ivory-white border border-border-default rounded-card p-6 shadow-luxury space-y-6">
              <div className="flex items-center justify-between border-b border-border-default pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-gold-dark" />
                  <h2 className="font-serif text-lg font-semibold text-text-primary">
                    Lọc phòng
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-xs text-brand-gold-dark hover:underline"
                >
                  <RotateCcw className="w-3 h-3" /> Đặt lại
                </button>
              </div>

              {/* Filter 1: Room Type */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Loại phòng
                </h3>
                {[
                  { value: 'all', label: 'Tất cả loại phòng' },
                  { value: '1_bed', label: 'Phòng 1 giường' },
                  { value: '2_beds', label: 'Phòng 2 giường' },
                  { value: '3_beds', label: 'Phòng 3 giường' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2.5 text-sm text-text-primary cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="roomType"
                      checked={selectedType === opt.value}
                      onChange={() => setSelectedType(opt.value)}
                      className="text-brand-gold focus:ring-brand-gold"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              {/* Filter 2: Max Price */}
              <div className="space-y-2.5 pt-4 border-t border-border-default">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Mức giá tối đa / đêm
                  </h3>
                  <span className="text-xs font-semibold text-brand-gold-dark">
                    {formatCurrencyVND(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min={200000}
                  max={1000000}
                  step={50000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brand-gold cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-text-muted">
                  <span>200.000₫</span>
                  <span>1.000.000₫</span>
                </div>
              </div>

              {/* Filter 3: Amenities */}
              <div className="space-y-2.5 pt-4 border-t border-border-default">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Tiện nghi
                </h3>
                <div className="space-y-2">
                  {DEFAULT_AMENITIES.slice(0, 6).map((am) => (
                    <label
                      key={am.code}
                      className="flex items-center gap-2.5 text-xs text-text-primary cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(am.code)}
                        onChange={() => toggleAmenity(am.code)}
                        className="rounded border-border-strong text-brand-gold focus:ring-brand-gold"
                      />
                      <span>{am.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* Room List Content */}
            <div className="lg:col-span-9 space-y-6">
              {/* Top Sort & Count Bar */}
              <div className="bg-bg-ivory-white border border-border-default rounded-card px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-text-secondary">
                  Hiển thị{' '}
                  <strong className="text-text-primary font-semibold">
                    {filteredRooms.length}
                  </strong>{' '}
                  lựa chọn phòng phù hợp
                  {onlyAvailableByDate && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-state-success font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Kiểm tra trống từ {formatDateVN(checkInDate)} →{' '}
                      {formatDateVN(checkOutDate)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as 'default' | 'price_asc' | 'price_desc'
                      )
                    }
                    className="bg-bg-ivory text-xs font-medium px-3 py-2 rounded-classic border border-border-default focus:outline-none focus:border-brand-gold"
                  >
                    <option value="default">Sắp xếp: Mặc định</option>
                    <option value="price_asc">Giá: Thấp đến Cao</option>
                    <option value="price_desc">Giá: Cao đến Thấp</option>
                  </select>

                  <div className="hidden sm:flex items-center border border-border-default rounded-classic overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'p-2 transition-colors',
                        viewMode === 'list'
                          ? 'bg-brand-gold text-text-on-dark'
                          : 'bg-bg-ivory text-text-secondary hover:text-text-primary'
                      )}
                      title="Hiển thị dạng danh sách"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'p-2 transition-colors',
                        viewMode === 'grid'
                          ? 'bg-brand-gold text-text-on-dark'
                          : 'bg-bg-ivory text-text-secondary hover:text-text-primary'
                      )}
                      title="Hiển thị dạng lưới"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Rooms Grid or List */}
              {filteredRooms.length === 0 ? (
                <div className="bg-bg-ivory-white border border-border-default rounded-card p-12 text-center space-y-4">
                  <p className="font-serif text-xl text-text-primary">
                    Không tìm thấy phòng phù hợp với bộ lọc hiện tại
                  </p>
                  <p className="text-sm text-text-secondary max-w-md mx-auto">
                    Vui lòng thử điều chỉnh mức giá, số lượng khách hoặc đặt lại bộ lọc để xem toàn bộ các hạng phòng của Nhà Nghỉ Tha Phương.
                  </p>
                  <Button variant="secondary" size="sm" onClick={resetFilters}>
                    Đặt lại bộ lọc
                  </Button>
                </div>
              ) : (
                <div
                  className={cn(
                    viewMode === 'list'
                      ? 'space-y-6'
                      : 'grid grid-cols-1 md:grid-cols-2 gap-6'
                  )}
                >
                  {filteredRooms.map((room) => {
                    const availCount = getAvailableQuantityForRoom(
                      room.id,
                      checkInDate,
                      checkOutDate
                    );
                    return (
                      <div key={room.id} className="relative">
                        <RoomCard room={room} layout={viewMode} />
                        <div className="mt-1.5 flex items-center justify-end gap-2 text-xs text-text-secondary px-1">
                          <span>
                            Tình trạng ({formatDateVN(checkInDate)} -{' '}
                            {formatDateVN(checkOutDate)}):
                          </span>
                          <strong
                            className={
                              availCount > 0 ? 'text-state-success' : 'text-state-danger'
                            }
                          >
                            Còn {availCount}/{room.total_quantity} phòng trống
                          </strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
