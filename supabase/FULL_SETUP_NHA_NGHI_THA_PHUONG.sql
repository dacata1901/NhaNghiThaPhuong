-- =============================================================================
-- BẢN CÀI ĐẶT SUPABASE TOÀN DIỆN (CHỈ CẦN CHẠY 1 LẦN DUY NHẤT)
-- DỰ ÁN: NHÀ NGHỈ THA PHƯƠNG (CLASSIC LUXURY HOTEL BOOKING)
-- Email Quản trị viên (Owner): minhkhang19012006@gmail.com
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. HÀM TỰ ĐỘNG CẬP NHẬT THỜI GIAN updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. HÀM KIỂM TRA QUYỀN ADMIN (CHỦ NHÀ) Ở TẦNG DATABASE POSTGRESQL
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    auth.role() = 'authenticated' AND (
      LOWER(auth.jwt() ->> 'email') IN (
        'minhkhang19012006@gmail.com',
        'admin@nhanghithaphuong.vn',
        'huynhduykhanh0406@gmail.com'
      )
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    ),
    FALSE
  );
$$;

-- 3. BẢNG DANH SÁCH HẠNG PHÒNG (rooms)
CREATE TABLE IF NOT EXISTS public.rooms (
  id VARCHAR(64) PRIMARY KEY,
  room_code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  room_type VARCHAR(32) NOT NULL DEFAULT '1_bed',
  room_type_label VARCHAR(100) NOT NULL DEFAULT 'Phòng 1 giường',
  bed_count INTEGER NOT NULL DEFAULT 1,
  max_adults INTEGER NOT NULL DEFAULT 2,
  max_children INTEGER NOT NULL DEFAULT 1,
  area_sqm NUMERIC(6, 1) NOT NULL DEFAULT 22.0,
  price_per_night BIGINT NOT NULL CHECK (price_per_night >= 0),
  total_quantity INTEGER NOT NULL DEFAULT 1 CHECK (total_quantity >= 0),
  short_description TEXT NOT NULL DEFAULT '',
  full_description TEXT NOT NULL DEFAULT '',
  policies TEXT NOT NULL DEFAULT '',
  status VARCHAR(32) NOT NULL DEFAULT 'available',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo_data BOOLEAN NOT NULL DEFAULT FALSE,
  rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  amenities TEXT[] DEFAULT ARRAY['wifi', 'ac', 'tv', 'bath', 'parking', 'clean', 'bell'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_rooms_updated_at ON public.rooms;
CREATE TRIGGER trg_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. BẢNG HÌNH ẢNH & VIDEO PHÒNG (room_media)
CREATE TABLE IF NOT EXISTS public.room_media (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  room_id VARCHAR(64) NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  media_type VARCHAR(16) NOT NULL DEFAULT 'image',
  url TEXT NOT NULL,
  alt_text VARCHAR(300) NOT NULL DEFAULT '',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BẢNG KHÁCH HÀNG (customers)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(32) NOT NULL UNIQUE,
  email VARCHAR(180) NOT NULL DEFAULT '',
  total_bookings INTEGER NOT NULL DEFAULT 1,
  total_spent BIGINT NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  last_booking_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. BẢNG ĐƠN ĐẶT PHÒNG (bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code VARCHAR(32) NOT NULL UNIQUE,
  room_id VARCHAR(64) NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  room_name VARCHAR(200) NOT NULL,
  room_code VARCHAR(32) NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  guest_name VARCHAR(150) NOT NULL,
  guest_phone VARCHAR(32) NOT NULL,
  guest_email VARCHAR(180) NOT NULL DEFAULT '',
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights_count INTEGER NOT NULL CHECK (nights_count >= 1),
  adults_count INTEGER NOT NULL DEFAULT 2,
  children_count INTEGER NOT NULL DEFAULT 0,
  price_per_night_snapshot BIGINT NOT NULL CHECK (price_per_night_snapshot >= 0),
  total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(32) NOT NULL DEFAULT 'pay_at_property',
  payment_method_label VARCHAR(150) NOT NULL DEFAULT 'Thanh toán trực tiếp tại lễ tân khi nhận phòng',
  customer_notes TEXT DEFAULT '',
  cancel_reason TEXT DEFAULT '',
  cancel_requested BOOLEAN NOT NULL DEFAULT FALSE,
  internal_admin_notes TEXT DEFAULT '',
  is_demo_data BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_booking_dates CHECK (check_out_date > check_in_date)
);

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.bookings;
CREATE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. BẢNG LỊCH SỬ TRẠNG THÁI ĐẶT PHÒNG (booking_status_history)
CREATE TABLE IF NOT EXISTS public.booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  old_status VARCHAR(32),
  new_status VARCHAR(32) NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  changed_by VARCHAR(120) DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. BẢNG TIN NHẮN KHÁCH HÀNG (contact_messages)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL DEFAULT '',
  phone VARCHAR(32) NOT NULL,
  subject VARCHAR(200) NOT NULL DEFAULT 'Tin nhắn khách hàng',
  message TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'unread',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. BẢNG CÀI ĐẶT HỆ THỐNG (site_settings) & SEO (page_seo) & THÔNG BÁO (admin_notifications)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hotel_name VARCHAR(200) NOT NULL DEFAULT 'Nhà Nghỉ Tha Phương',
  tagline TEXT NOT NULL DEFAULT 'Không gian nghỉ dưỡng ấm cúng, riêng tư và tiện nghi dành cho bạn',
  sub_tagline VARCHAR(250) NOT NULL DEFAULT 'Nhà Nghỉ Tha Phương • Sạch sẽ • Riêng tư • Giá tốt',
  logo_text VARCHAR(100) NOT NULL DEFAULT 'Tha Phương',
  phone_primary VARCHAR(32) NOT NULL DEFAULT '0944 861 242',
  email_notification VARCHAR(180) NOT NULL DEFAULT 'minhkhang19012006@gmail.com',
  address_text TEXT NOT NULL DEFAULT 'Đang cập nhật địa chỉ chi tiết (Vui lòng liên hệ 0944 861 242 để được chỉ đường nhanh nhất)',
  google_maps_embed_url TEXT NOT NULL DEFAULT '',
  check_in_time VARCHAR(16) NOT NULL DEFAULT '14:00',
  check_out_time VARCHAR(16) NOT NULL DEFAULT '12:00',
  payment_policy_note TEXT NOT NULL DEFAULT 'Thanh toán trực tiếp tại quầy lễ tân khi nhận phòng.',
  cancellation_policy_summary TEXT NOT NULL DEFAULT 'Miễn phí hủy hoặc đổi lịch khi báo trước giờ nhận phòng ít nhất 24 giờ.',
  about_title TEXT NOT NULL DEFAULT 'Điểm dừng chân an tâm, sạch sẽ và chu đáo cho mọi hành trình',
  about_description TEXT NOT NULL DEFAULT 'Nhà Nghỉ Tha Phương mang đến không gian lưu trú gần gũi, kín đáo và sạch sẽ với mức chi phí hợp lý.',
  about_highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  hero_image_url TEXT NOT NULL DEFAULT '/images/rooms/phong-1-giuong/giuong-chinh-1.jpg',
  intro_video_url TEXT DEFAULT '',
  sound_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo_warning_visible BOOLEAN NOT NULL DEFAULT FALSE,
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.page_seo (
  page_key VARCHAR(64) PRIMARY KEY,
  page_name VARCHAR(150) NOT NULL,
  seo_title VARCHAR(250) NOT NULL,
  meta_description TEXT NOT NULL,
  canonical_path VARCHAR(200) NOT NULL,
  og_image_url TEXT DEFAULT '/images/rooms/phong-1-giuong/giuong-chinh-1.jpg',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(32) NOT NULL DEFAULT 'new_booking',
  title VARCHAR(250) NOT NULL,
  message TEXT NOT NULL,
  reference_id VARCHAR(100),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 10. BẬT KHIÊN BẢO MẬT ROW LEVEL SECURITY (RLS) TÁCH BIỆT USER & ADMIN
-- =============================================================================
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Xóa policy cũ nếu chạy lại script
DROP POLICY IF EXISTS "Public can view published rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public can view room media" ON public.room_media;
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public can view page seo" ON public.page_seo;
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin full access rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admin full access room_media" ON public.room_media;
DROP POLICY IF EXISTS "Admin full access customers" ON public.customers;
DROP POLICY IF EXISTS "Admin full access bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin full access booking_status_history" ON public.booking_status_history;
DROP POLICY IF EXISTS "Admin full access contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin full access site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin full access page_seo" ON public.page_seo;
DROP POLICY IF EXISTS "Admin full access admin_notifications" ON public.admin_notifications;

-- QUYỀN CỦA KHÁCH HÀNG (USER): Chỉ được xem phòng công khai & gửi tin nhắn
CREATE POLICY "Public can view published rooms"
  ON public.rooms FOR SELECT
  USING (is_published = TRUE OR public.is_admin());

CREATE POLICY "Public can view room media"
  ON public.room_media FOR SELECT
  USING (TRUE);

CREATE POLICY "Public can view site settings"
  ON public.site_settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Public can view page seo"
  ON public.page_seo FOR SELECT
  USING (TRUE);

CREATE POLICY "Public can submit contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (
    LENGTH(TRIM(full_name)) >= 2
    AND LENGTH(TRIM(phone)) >= 8
    AND LENGTH(TRIM(message)) >= 2
  );

-- QUYỀN CỦA CHỦ NHÀ (ADMIN): Toàn quyền quản lý khi đăng nhập đúng tài khoản Admin
CREATE POLICY "Admin full access rooms"
  ON public.rooms FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access room_media"
  ON public.room_media FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access customers"
  ON public.customers FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access bookings"
  ON public.bookings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access booking_status_history"
  ON public.booking_status_history FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access contact_messages"
  ON public.contact_messages FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access site_settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access page_seo"
  ON public.page_seo FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access admin_notifications"
  ON public.admin_notifications FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- 11. HÀM ĐẶT PHÒNG NGUYÊN TỬ (ATOMIC TRANSACTION) & TRA CỨU BẢO MẬT 2 LỚP
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_room_id VARCHAR(64),
  p_guest_name TEXT,
  p_guest_phone TEXT,
  p_guest_email TEXT DEFAULT '',
  p_check_in DATE DEFAULT CURRENT_DATE,
  p_check_out DATE DEFAULT (CURRENT_DATE + 1),
  p_adults_count INTEGER DEFAULT 2,
  p_children_count INTEGER DEFAULT 0,
  p_customer_notes TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room RECORD;
  v_overlapping_count INTEGER;
  v_available_qty INTEGER;
  v_nights INTEGER;
  v_total_amount BIGINT;
  v_booking_code VARCHAR(32);
  v_customer_id UUID;
  v_booking_id UUID;
BEGIN
  IF p_check_out <= p_check_in THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm.');
  END IF;

  SELECT * INTO v_room FROM public.rooms WHERE id = p_room_id FOR UPDATE;

  IF NOT FOUND OR v_room.is_published = FALSE OR v_room.status <> 'available' THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Hạng phòng này hiện không mở đặt trực tuyến.');
  END IF;

  SELECT COUNT(*)::INTEGER INTO v_overlapping_count
  FROM public.bookings b
  WHERE b.room_id = p_room_id
    AND b.status IN ('pending', 'confirmed')
    AND b.check_in_date < p_check_out
    AND b.check_out_date > p_check_in;

  v_available_qty := v_room.total_quantity - v_overlapping_count;
  IF v_available_qty <= 0 THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Hạng phòng này vừa hết phòng trống trong ngày bạn chọn.');
  END IF;

  v_nights := (p_check_out - p_check_in);
  v_total_amount := v_room.price_per_night * v_nights;

  LOOP
    v_booking_code := 'TP-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' ||
      LPAD((FLOOR(1000 + RANDOM() * 9000))::INTEGER::TEXT, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.bookings WHERE booking_code = v_booking_code);
  END LOOP;

  INSERT INTO public.customers (full_name, phone, email, total_bookings, total_spent, last_booking_date)
  VALUES (TRIM(p_guest_name), TRIM(p_guest_phone), COALESCE(TRIM(p_guest_email), ''), 1, v_total_amount, p_check_in)
  ON CONFLICT (phone) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      total_bookings = public.customers.total_bookings + 1,
      total_spent = public.customers.total_spent + EXCLUDED.total_spent,
      last_booking_date = EXCLUDED.last_booking_date,
      updated_at = NOW()
  RETURNING id INTO v_customer_id;

  INSERT INTO public.bookings (
    booking_code, room_id, room_name, room_code, customer_id,
    guest_name, guest_phone, guest_email,
    check_in_date, check_out_date, nights_count, adults_count, children_count,
    price_per_night_snapshot, total_amount, status, payment_status, customer_notes
  )
  VALUES (
    v_booking_code, v_room.id, v_room.name, v_room.room_code, v_customer_id,
    TRIM(p_guest_name), TRIM(p_guest_phone), COALESCE(TRIM(p_guest_email), ''),
    p_check_in, p_check_out, v_nights, COALESCE(p_adults_count, 2), COALESCE(p_children_count, 0),
    v_room.price_per_night, v_total_amount, 'pending', 'pay_at_property', COALESCE(TRIM(p_customer_notes), '')
  )
  RETURNING id INTO v_booking_id;

  INSERT INTO public.admin_notifications (type, title, message, reference_id, is_read)
  VALUES (
    'new_booking',
    format('Đặt phòng mới: %s', v_booking_code),
    format('Khách %s (%s) đặt %s (%s đêm).', TRIM(p_guest_name), TRIM(p_guest_phone), v_room.name, v_nights),
    v_booking_id::TEXT,
    FALSE
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'booking_id', v_booking_id,
    'booking_code', v_booking_code,
    'nights_count', v_nights,
    'total_amount', v_total_amount
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.lookup_booking_secure(
  p_booking_code TEXT,
  p_contact_verifier TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
BEGIN
  SELECT * INTO v_booking
  FROM public.bookings b
  WHERE UPPER(b.booking_code) = UPPER(TRIM(p_booking_code))
    AND REGEXP_REPLACE(b.guest_phone, '\s+', '', 'g') = REGEXP_REPLACE(TRIM(p_contact_verifier), '\s+', '', 'g')
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Không tìm thấy đơn đặt phòng hoặc Số điện thoại không khớp.');
  END IF;

  RETURN jsonb_build_object('success', TRUE, 'booking', to_jsonb(v_booking));
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_booking_atomic(VARCHAR, TEXT, TEXT, TEXT, DATE, DATE, INTEGER, INTEGER, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_booking_secure(TEXT, TEXT) TO anon, authenticated;

-- =============================================================================
-- 12. KHỞI TẠO DỮ LIỆU PHÒNG THẬT & CÀI ĐẶT NHÀ NGHỈ THA PHƯƠNG
-- =============================================================================
INSERT INTO public.site_settings (id, hotel_name, phone_primary, email_notification)
VALUES (1, 'Nhà Nghỉ Tha Phương', '0944 861 242', 'minhkhang19012006@gmail.com')
ON CONFLICT (id) DO UPDATE SET email_notification = 'minhkhang19012006@gmail.com';

INSERT INTO public.rooms (
  id, room_code, name, slug, room_type, room_type_label,
  bed_count, max_adults, max_children, area_sqm, price_per_night, total_quantity,
  short_description, full_description, status, is_published, is_featured
)
VALUES
  (
    'room-1-bed',
    'TP-101',
    'Phòng Đơn 1 Giường Đôi (Standard Single)',
    'phong-1-giuong-doi-standard',
    '1_bed',
    'Phòng 1 giường',
    1, 2, 1, 22, 300000, 6,
    'Không gian riêng tư, sạch sẽ với 1 giường đôi êm ái, ốp tường vân gỗ ấm cúng, ghế thư giãn, điều hòa, TV và phòng tắm riêng có bình nóng lạnh.',
    'Phòng 1 giường đôi tại Nhà Nghỉ Tha Phương được thiết kế tối ưu cho cặp đôi, khách đi công tác hoặc du lịch cá nhân cần sự yên tĩnh, sạch sẽ và tiện nghi.',
    'available', TRUE, TRUE
  ),
  (
    'room-2-beds',
    'TP-201',
    'Phòng Đôi 2 Giường Lớn (Deluxe Twin)',
    'phong-2-giuong-doi-deluxe',
    '2_beds',
    'Phòng 2 giường',
    2, 4, 2, 30, 500000, 4,
    'Phòng rộng rãi bố trí 2 giường đôi lớn dành cho nhóm bạn hoặc gia đình 3–4 người, đầy đủ điều hòa, tivi, Wi-Fi tốc độ cao và phòng tắm khép kín.',
    'Hạng phòng 2 giường lớn tại Nhà Nghỉ Tha Phương mang lại sự thoải mái tối đa cho gia đình hoặc nhóm bạn đi du lịch, công tác.',
    'available', TRUE, TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.room_media (id, room_id, media_type, url, alt_text, is_primary, sort_order)
VALUES
  ('m-1-1', 'room-1-bed', 'image', '/images/rooms/phong-1-giuong/giuong-chinh-1.jpg', 'Phòng 1 giường đôi Nhà Nghỉ Tha Phương', TRUE, 1),
  ('m-1-2', 'room-1-bed', 'image', '/images/rooms/phong-1-giuong/khong-gian-phong.jpg', 'Không gian phòng 1 giường đôi', FALSE, 2),
  ('m-1-3', 'room-1-bed', 'image', '/images/rooms/phong-1-giuong/giuong-chinh-2.jpg', 'Cận cảnh giường đôi sạch sẽ', FALSE, 3),
  ('m-1-4', 'room-1-bed', 'image', '/images/rooms/phong-1-giuong/tien-nghi-dieu-hoa-tv.jpg', 'Tiện nghi điều hòa và tivi', FALSE, 4),
  ('m-1-5', 'room-1-bed', 'image', '/images/rooms/phong-1-giuong/phong-tam-rieng-1.jpg', 'Phòng tắm riêng sạch sẽ', FALSE, 5),
  ('m-1-6', 'room-1-bed', 'image', '/images/rooms/phong-1-giuong/phong-tam-rieng-2.jpg', 'Bình nóng lạnh Ariston và vòi sen', FALSE, 6),
  ('m-2-1', 'room-2-beds', 'image', '/images/rooms/phong-1-giuong/khong-gian-phong.jpg', 'Phòng 2 giường đôi rộng rãi', TRUE, 1),
  ('m-2-2', 'room-2-beds', 'image', '/images/rooms/phong-1-giuong/giuong-chinh-1.jpg', 'Giường đôi êm ái tại Nhà Nghỉ Tha Phương', FALSE, 2),
  ('m-2-3', 'room-2-beds', 'image', '/images/rooms/phong-1-giuong/tien-nghi-dieu-hoa-tv.jpg', 'Trang bị đầy đủ điều hòa, quạt mát, TV', FALSE, 3),
  ('m-2-4', 'room-2-beds', 'image', '/images/rooms/phong-1-giuong/phong-tam-rieng-1.jpg', 'Phòng tắm khép kín riêng biệt', FALSE, 4)
ON CONFLICT (id) DO NOTHING;
