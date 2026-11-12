-- =============================================================================
-- CLASSIC LUXURY HOTEL BOOKING — NHÀ NGHỈ THA PHƯƠNG
-- MIGRATION 001: INITIAL POSTGRESQL SCHEMA, CONSTRAINTS, INDEXES, RLS & STORAGE
-- =============================================================================
-- Thông tin thực tế đã xác thực bởi Chủ nhà:
--   Tên thương hiệu : Nhà Nghỉ Tha Phương
--   Số điện thoại   : 0944861242 (0944 861 242)
--   Email nhận TB   : huynhduykhanh0406@gmail.com
--   Thanh toán      : Thu tiền trực tiếp tại lễ tân khi nhận phòng (pay_at_property)
-- =============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. HELPER FUNCTION: AUTO-UPDATE updated_at TIMESTAMP
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Helper function to check if the current authenticated user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    auth.role() = 'authenticated' AND (
      LOWER(auth.jwt() ->> 'email') = 'huynhduykhanh0406@gmail.com'
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    ),
    FALSE
  );
$$;

-- -----------------------------------------------------------------------------
-- 2. TABLE: rooms (Danh sách hạng phòng: 1 giường, 2 giường, 3 giường, tùy chỉnh)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  room_type VARCHAR(32) NOT NULL DEFAULT '1_bed'
    CHECK (room_type IN ('1_bed', '2_beds', '3_beds', 'custom')),
  room_type_label VARCHAR(100) NOT NULL DEFAULT 'Phòng 1 giường',
  bed_count INTEGER NOT NULL DEFAULT 1 CHECK (bed_count >= 1 AND bed_count <= 10),
  max_adults INTEGER NOT NULL DEFAULT 2 CHECK (max_adults >= 1 AND max_adults <= 20),
  max_children INTEGER NOT NULL DEFAULT 1 CHECK (max_children >= 0 AND max_children <= 10),
  area_sqm NUMERIC(6, 1) NOT NULL DEFAULT 22.0 CHECK (area_sqm > 0),
  price_per_night BIGINT NOT NULL CHECK (price_per_night >= 0),
  total_quantity INTEGER NOT NULL DEFAULT 1 CHECK (total_quantity >= 0),
  short_description TEXT NOT NULL DEFAULT '',
  full_description TEXT NOT NULL DEFAULT '',
  policies TEXT NOT NULL DEFAULT '',
  status VARCHAR(32) NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'occupied', 'maintenance')),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_demo_data BOOLEAN NOT NULL DEFAULT FALSE,
  rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0 CHECK (rating >= 1.0 AND rating <= 5.0),
  reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_slug ON public.rooms(slug);
CREATE INDEX IF NOT EXISTS idx_rooms_published_type ON public.rooms(is_published, room_type);

DROP TRIGGER IF EXISTS trg_rooms_updated_at ON public.rooms;
CREATE TRIGGER trg_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 3. TABLE: room_media (Hình ảnh & Video của từng hạng phòng)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.room_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  media_type VARCHAR(16) NOT NULL DEFAULT 'image'
    CHECK (media_type IN ('image', 'video')),
  url TEXT NOT NULL,
  alt_text VARCHAR(300) NOT NULL DEFAULT '',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_media_room_id ON public.room_media(room_id, sort_order);

-- -----------------------------------------------------------------------------
-- 4. TABLE: amenities & room_amenities (Tiện nghi phòng)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  description TEXT DEFAULT '',
  icon_name VARCHAR(64) NOT NULL DEFAULT 'Sparkles',
  is_featured_home BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.room_amenities (
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (room_id, amenity_id)
);

-- -----------------------------------------------------------------------------
-- 5. TABLE: customers (Hồ sơ khách hàng đặt phòng)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  email VARCHAR(180) NOT NULL,
  total_bookings INTEGER NOT NULL DEFAULT 1 CHECK (total_bookings >= 0),
  total_spent BIGINT NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  notes TEXT DEFAULT '',
  last_booking_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (phone, email)
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(LOWER(email));

DROP TRIGGER IF EXISTS trg_customers_updated_at ON public.customers;
CREATE TRIGGER trg_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 6. TABLE: bookings (Đơn đặt phòng trực tuyến)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code VARCHAR(32) NOT NULL UNIQUE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  room_name VARCHAR(200) NOT NULL,
  room_code VARCHAR(32) NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  guest_name VARCHAR(150) NOT NULL,
  guest_phone VARCHAR(32) NOT NULL,
  guest_email VARCHAR(180) NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights_count INTEGER NOT NULL CHECK (nights_count >= 1),
  adults_count INTEGER NOT NULL DEFAULT 1 CHECK (adults_count >= 1),
  children_count INTEGER NOT NULL DEFAULT 0 CHECK (children_count >= 0),
  price_per_night_snapshot BIGINT NOT NULL CHECK (price_per_night_snapshot >= 0),
  total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
  status VARCHAR(32) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status VARCHAR(32) NOT NULL DEFAULT 'pay_at_property'
    CHECK (payment_status IN ('pay_at_property', 'unpaid', 'deposit_paid', 'paid', 'refunded')),
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

CREATE INDEX IF NOT EXISTS idx_bookings_code ON public.bookings(UPPER(booking_code));
CREATE INDEX IF NOT EXISTS idx_bookings_room_dates
  ON public.bookings(room_id, check_in_date, check_out_date)
  WHERE status IN ('pending', 'confirmed');
CREATE INDEX IF NOT EXISTS idx_bookings_status_created
  ON public.bookings(status, created_at DESC);

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.bookings;
CREATE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 7. TABLE: booking_status_history (Lịch sử thay đổi trạng thái mỗi booking)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  old_status VARCHAR(32),
  new_status VARCHAR(32) NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  changed_by VARCHAR(120) DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_history_booking_id
  ON public.booking_status_history(booking_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- 8. TABLE: contact_messages (Tin nhắn liên hệ từ khách hàng)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'unread'
    CHECK (status IN ('unread', 'read', 'resolved')),
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status
  ON public.contact_messages(status, created_at DESC);

DROP TRIGGER IF EXISTS trg_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER trg_contact_messages_updated_at
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 9. TABLE: reviews (Đánh giá khách hàng)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  room_name VARCHAR(200),
  reviewer_name VARCHAR(150) NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  stay_date_label VARCHAR(100) DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo_data BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 10. TABLE: site_settings (Cấu hình hệ thống & nội dung CMS - 1 dòng duy nhất)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hotel_name VARCHAR(200) NOT NULL DEFAULT 'Nhà Nghỉ Tha Phương',
  tagline TEXT NOT NULL DEFAULT 'Không gian nghỉ dưỡng ấm cúng, riêng tư và tiện nghi dành cho bạn',
  sub_tagline VARCHAR(250) NOT NULL DEFAULT 'NHÀ NGHỈ THA PHƯƠNG · SẠCH SẼ · RIÊNG TƯ · GIÁ TỐT',
  logo_text VARCHAR(100) NOT NULL DEFAULT 'THA PHƯƠNG',
  phone_primary VARCHAR(32) NOT NULL DEFAULT '0944 861 242',
  email_notification VARCHAR(180) NOT NULL DEFAULT 'huynhduykhanh0406@gmail.com',
  address_text TEXT NOT NULL DEFAULT 'Đang cập nhật địa chỉ chi tiết (Vui lòng liên hệ 0944 861 242 để được chỉ đường nhanh nhất)',
  google_maps_embed_url TEXT NOT NULL DEFAULT '',
  check_in_time VARCHAR(16) NOT NULL DEFAULT '14:00',
  check_out_time VARCHAR(16) NOT NULL DEFAULT '12:00',
  payment_policy_note TEXT NOT NULL DEFAULT 'Thanh toán trực tiếp tại quầy lễ tân khi nhận phòng (Tiền mặt hoặc Chuyển khoản ngân hàng). Chưa yêu cầu thanh toán trực tuyến trên website.',
  cancellation_policy_summary TEXT NOT NULL DEFAULT 'Miễn phí hủy hoặc thay đổi lịch đặt phòng khi thông báo trước giờ nhận phòng ít nhất 24 giờ qua số điện thoại 0944 861 242 hoặc trang Tra cứu đặt phòng.',
  about_title TEXT NOT NULL DEFAULT 'Điểm dừng chân an tâm, sạch sẽ và chu đáo cho mọi hành trình',
  about_description TEXT NOT NULL DEFAULT 'Nhà Nghỉ Tha Phương mang đến không gian lưu trú gần gũi, kín đáo và sạch sẽ với mức chi phí hợp lý.',
  about_highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  hero_image_url TEXT NOT NULL DEFAULT '/images/rooms/phong-1-giuong/giuong-chinh-1.jpg',
  intro_video_url TEXT DEFAULT '',
  sound_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo_warning_visible BOOLEAN NOT NULL DEFAULT TRUE,
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 11. TABLE: page_seo (Cấu hình SEO cho từng trang)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.page_seo (
  page_key VARCHAR(64) PRIMARY KEY,
  page_name VARCHAR(150) NOT NULL,
  seo_title VARCHAR(250) NOT NULL,
  meta_description TEXT NOT NULL,
  canonical_path VARCHAR(200) NOT NULL,
  og_image_url TEXT DEFAULT '/images/rooms/phong-1-giuong/giuong-chinh-1.jpg',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_page_seo_updated_at ON public.page_seo;
CREATE TRIGGER trg_page_seo_updated_at
BEFORE UPDATE ON public.page_seo
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 12. TABLE: email_logs (Nhật ký gửi email Resend API & chống gửi trùng)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(64) NOT NULL
    CHECK (event_type IN ('new_booking', 'booking_status_update', 'new_contact')),
  reference_id VARCHAR(100) NOT NULL,
  recipient_email VARCHAR(180) NOT NULL,
  subject VARCHAR(300) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'sent', 'failed')),
  provider_message_id VARCHAR(180),
  error_message TEXT,
  idempotency_key VARCHAR(180) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_ref ON public.email_logs(reference_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- 13. TABLE: admin_notifications (Thông báo Realtime cho Admin Dashboard)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(32) NOT NULL
    CHECK (type IN ('new_booking', 'cancel_request', 'new_contact')),
  title VARCHAR(250) NOT NULL,
  message TEXT NOT NULL,
  reference_id VARCHAR(100),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_unread
  ON public.admin_notifications(is_read, created_at DESC);

-- =============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (Khách hàng chỉ được xem dữ liệu công khai)
CREATE POLICY "Public can view published rooms"
  ON public.rooms FOR SELECT
  USING (is_published = TRUE OR public.is_admin());

CREATE POLICY "Public can view room media"
  ON public.room_media FOR SELECT
  USING (TRUE);

CREATE POLICY "Public can view amenities"
  ON public.amenities FOR SELECT
  USING (TRUE);

CREATE POLICY "Public can view room amenities"
  ON public.room_amenities FOR SELECT
  USING (TRUE);

CREATE POLICY "Public can view published reviews"
  ON public.reviews FOR SELECT
  USING (is_published = TRUE OR public.is_admin());

CREATE POLICY "Public can view site settings"
  ON public.site_settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Public can view page seo"
  ON public.page_seo FOR SELECT
  USING (TRUE);

-- Public Insert Policy for Contact Messages
CREATE POLICY "Public can submit contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (
    LENGTH(TRIM(full_name)) >= 2
    AND LENGTH(TRIM(phone)) >= 8
    AND LENGTH(TRIM(message)) >= 10
  );

-- Admin Full Access Policies
CREATE POLICY "Admin full access rooms"
  ON public.rooms FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access room_media"
  ON public.room_media FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access amenities"
  ON public.amenities FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access room_amenities"
  ON public.room_amenities FOR ALL
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

CREATE POLICY "Admin full access reviews"
  ON public.reviews FOR ALL
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

CREATE POLICY "Admin full access email_logs"
  ON public.email_logs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access admin_notifications"
  ON public.admin_notifications FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- 15. SUPABASE STORAGE BUCKETS (room-media & site-assets)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'room-media',
    'room-media',
    TRUE,
    52428800, -- 50MB max per file (supports room photos & short MP4 clips)
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
  ),
  (
    'site-assets',
    'site-assets',
    TRUE,
    20971520, -- 20MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  )
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access on room-media"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('room-media', 'site-assets'));

CREATE POLICY "Admin upload/update/delete on room-media"
  ON storage.objects FOR ALL
  USING (bucket_id IN ('room-media', 'site-assets') AND public.is_admin())
  WITH CHECK (bucket_id IN ('room-media', 'site-assets') AND public.is_admin());

-- =============================================================================
-- 16. SUPABASE REALTIME SUBSCRIPTIONS
-- =============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
