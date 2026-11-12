-- =============================================================================
-- CLASSIC LUXURY HOTEL BOOKING — NHÀ NGHỈ THA PHƯƠNG
-- MIGRATION 002: ATOMIC BOOKING RPC (RACE CONDITION PROTECTION) & INITIAL SEED
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. FUNCTION: check_room_available_quantity
--    Kiểm tra chính xác số lượng phòng còn trống ở phía Server PostgreSQL
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_room_available_quantity(
  p_room_id UUID,
  p_check_in DATE,
  p_check_out DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_room RECORD;
  v_overlapping_count INTEGER;
BEGIN
  IF p_check_in IS NULL OR p_check_out IS NULL OR p_check_out <= p_check_in THEN
    RETURN 0;
  END IF;

  SELECT id, total_quantity, status, is_published
  INTO v_room
  FROM public.rooms
  WHERE id = p_room_id;

  IF NOT FOUND OR v_room.status <> 'available' OR v_room.is_published = FALSE THEN
    RETURN 0;
  END IF;

  SELECT COUNT(*)::INTEGER
  INTO v_overlapping_count
  FROM public.bookings b
  WHERE b.room_id = p_room_id
    AND b.status IN ('pending', 'confirmed')
    AND b.check_in_date < p_check_out
    AND b.check_out_date > p_check_in;

  RETURN GREATEST(0, v_room.total_quantity - v_overlapping_count);
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. FUNCTION: create_booking_atomic
--    Tạo đơn đặt phòng trong Transaction nguyên tử, sử dụng SELECT ... FOR UPDATE
--    khóa dòng hạng phòng (row-level lock) để chống Race Condition khi nhiều
--    khách cùng đặt 1 phòng vào cùng thời điểm.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_room_id UUID,
  p_guest_name TEXT,
  p_guest_phone TEXT,
  p_guest_email TEXT,
  p_check_in DATE,
  p_check_out DATE,
  p_adults_count INTEGER,
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
  -- 1. Validate dates
  IF p_check_in < CURRENT_DATE THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Ngày nhận phòng không được nằm trong quá khứ.'
    );
  END IF;

  IF p_check_out <= p_check_in THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm.'
    );
  END IF;

  -- 2. Lock the room row with FOR UPDATE to serialize concurrent bookings for this room
  SELECT *
  INTO v_room
  FROM public.rooms
  WHERE id = p_room_id
  FOR UPDATE;

  IF NOT FOUND OR v_room.is_published = FALSE OR v_room.status <> 'available' THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Hạng phòng này hiện không mở đặt trực tuyến.'
    );
  END IF;

  IF p_adults_count > v_room.max_adults THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', format('Hạng phòng "%s" hỗ trợ tối đa %s người lớn.', v_room.name, v_room.max_adults)
    );
  END IF;

  -- 3. Count overlapping active bookings inside the locked transaction
  SELECT COUNT(*)::INTEGER
  INTO v_overlapping_count
  FROM public.bookings b
  WHERE b.room_id = p_room_id
    AND b.status IN ('pending', 'confirmed')
    AND b.check_in_date < p_check_out
    AND b.check_out_date > p_check_in;

  v_available_qty := v_room.total_quantity - v_overlapping_count;

  IF v_available_qty <= 0 THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Rất tiếc, hạng phòng này vừa hết phòng trống trong khoảng ngày quý khách chọn.'
    );
  END IF;

  -- 4. Calculate nights and snapshot price
  v_nights := (p_check_out - p_check_in);
  v_total_amount := v_room.price_per_night * v_nights;

  -- 5. Generate unique booking code TP-YYYY-XXXX
  LOOP
    v_booking_code := 'TP-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' ||
      LPAD((FLOOR(1000 + RANDOM() * 9000))::INTEGER::TEXT, 4, '0');
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.bookings WHERE booking_code = v_booking_code
    );
  END LOOP;

  -- 6. Upsert customer profile
  INSERT INTO public.customers (
    full_name,
    phone,
    email,
    total_bookings,
    total_spent,
    last_booking_date
  )
  VALUES (
    TRIM(p_guest_name),
    TRIM(p_guest_phone),
    LOWER(TRIM(p_guest_email)),
    1,
    v_total_amount,
    p_check_in
  )
  ON CONFLICT (phone, email) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    total_bookings = public.customers.total_bookings + 1,
    total_spent = public.customers.total_spent + EXCLUDED.total_spent,
    last_booking_date = EXCLUDED.last_booking_date,
    updated_at = NOW()
  RETURNING id INTO v_customer_id;

  -- 7. Insert booking record
  INSERT INTO public.bookings (
    booking_code,
    room_id,
    room_name,
    room_code,
    customer_id,
    guest_name,
    guest_phone,
    guest_email,
    check_in_date,
    check_out_date,
    nights_count,
    adults_count,
    children_count,
    price_per_night_snapshot,
    total_amount,
    status,
    payment_status,
    payment_method_label,
    customer_notes,
    is_demo_data
  )
  VALUES (
    v_booking_code,
    v_room.id,
    v_room.name,
    v_room.room_code,
    v_customer_id,
    TRIM(p_guest_name),
    TRIM(p_guest_phone),
    LOWER(TRIM(p_guest_email)),
    p_check_in,
    p_check_out,
    v_nights,
    p_adults_count,
    COALESCE(p_children_count, 0),
    v_room.price_per_night,
    v_total_amount,
    'pending',
    'pay_at_property',
    'Thanh toán trực tiếp tại lễ tân khi nhận phòng',
    COALESCE(TRIM(p_customer_notes), ''),
    FALSE
  )
  RETURNING id INTO v_booking_id;

  -- 8. Insert status history log
  INSERT INTO public.booking_status_history (
    booking_id,
    old_status,
    new_status,
    note,
    changed_by
  )
  VALUES (
    v_booking_id,
    NULL,
    'pending',
    'Khách hàng tạo yêu cầu đặt phòng trực tuyến trên website (Thu tiền trực tiếp khi nhận phòng).',
    'customer'
  );

  -- 9. Insert realtime notification for Admin
  INSERT INTO public.admin_notifications (
    type,
    title,
    message,
    reference_id,
    is_read
  )
  VALUES (
    'new_booking',
    format('Đặt phòng mới: %s', v_booking_code),
    format('Khách %s (%s) đặt %s từ %s đến %s.', TRIM(p_guest_name), TRIM(p_guest_phone), v_room.name, p_check_in, p_check_out),
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

-- -----------------------------------------------------------------------------
-- 3. FUNCTION: lookup_booking_secure
--    Tra cứu booking bảo mật 2 lớp (bắt buộc khớp Mã booking VÀ SĐT/Email)
-- -----------------------------------------------------------------------------
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
  v_history JSONB;
BEGIN
  IF LENGTH(TRIM(COALESCE(p_booking_code, ''))) = 0
     OR LENGTH(TRIM(COALESCE(p_contact_verifier, ''))) = 0 THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Vui lòng nhập đầy đủ Mã đặt phòng và Số điện thoại (hoặc Email) xác thực.'
    );
  END IF;

  SELECT *
  INTO v_booking
  FROM public.bookings b
  WHERE UPPER(b.booking_code) = UPPER(TRIM(p_booking_code))
    AND (
      REGEXP_REPLACE(b.guest_phone, '\s+', '', 'g') = REGEXP_REPLACE(TRIM(p_contact_verifier), '\s+', '', 'g')
      OR LOWER(b.guest_email) = LOWER(TRIM(p_contact_verifier))
    )
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Không tìm thấy đơn đặt phòng hoặc thông tin Số điện thoại / Email xác thực không trùng khớp.'
    );
  END IF;

  SELECT COALESCE(jsonb_agg(h ORDER BY h.created_at DESC), '[]'::jsonb)
  INTO v_history
  FROM public.booking_status_history h
  WHERE h.booking_id = v_booking.id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'booking', to_jsonb(v_booking),
    'history', v_history
  );
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. FUNCTION: request_cancel_booking_secure
--    Khách hàng gửi yêu cầu hủy phòng sau khi đã xác thực Mã booking + SĐT/Email
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.request_cancel_booking_secure(
  p_booking_code TEXT,
  p_contact_verifier TEXT,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
BEGIN
  SELECT *
  INTO v_booking
  FROM public.bookings b
  WHERE UPPER(b.booking_code) = UPPER(TRIM(p_booking_code))
    AND (
      REGEXP_REPLACE(b.guest_phone, '\s+', '', 'g') = REGEXP_REPLACE(TRIM(p_contact_verifier), '\s+', '', 'g')
      OR LOWER(b.guest_email) = LOWER(TRIM(p_contact_verifier))
    )
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Thông tin xác thực không hợp lệ.'
    );
  END IF;

  IF v_booking.status IN ('cancelled', 'completed') THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Đơn đặt phòng này đã hoàn tất hoặc đã hủy trước đó.'
    );
  END IF;

  UPDATE public.bookings
  SET
    status = 'cancelled',
    cancel_requested = TRUE,
    cancel_reason = TRIM(COALESCE(p_reason, 'Khách yêu cầu hủy trực tuyến')),
    updated_at = NOW()
  WHERE id = v_booking.id;

  INSERT INTO public.booking_status_history (
    booking_id,
    old_status,
    new_status,
    note,
    changed_by
  )
  VALUES (
    v_booking.id,
    v_booking.status,
    'cancelled',
    format('Khách hàng gửi yêu cầu hủy phòng. Lý do: %s', TRIM(COALESCE(p_reason, 'Không ghi rõ'))),
    'customer'
  );

  INSERT INTO public.admin_notifications (
    type,
    title,
    message,
    reference_id,
    is_read
  )
  VALUES (
    'cancel_request',
    format('Khách hủy đặt phòng: %s', v_booking.booking_code),
    format('Khách %s đã hủy đơn %s. Lý do: %s', v_booking.guest_name, v_booking.booking_code, TRIM(COALESCE(p_reason, ''))),
    v_booking.id::TEXT,
    FALSE
  );

  RETURN jsonb_build_object('success', TRUE);
END;
$$;

-- Grant execute permissions on public RPCs to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.check_room_available_quantity(UUID, DATE, DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_atomic(UUID, TEXT, TEXT, TEXT, DATE, DATE, INTEGER, INTEGER, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_booking_secure(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_cancel_booking_secure(TEXT, TEXT, TEXT) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 5. INITIAL SEED DATA (THÔNG TIN THỰC TẾ + DỮ LIỆU KHỞI TẠO MINH BẠCH)
-- -----------------------------------------------------------------------------
INSERT INTO public.site_settings (
  id,
  hotel_name,
  tagline,
  sub_tagline,
  logo_text,
  phone_primary,
  email_notification,
  address_text,
  google_maps_embed_url,
  check_in_time,
  check_out_time,
  payment_policy_note,
  cancellation_policy_summary,
  about_title,
  about_description,
  hero_image_url,
  sound_alerts_enabled,
  is_demo_warning_visible
)
VALUES (
  1,
  'Nhà Nghỉ Tha Phương',
  'Không gian nghỉ dưỡng ấm cúng, riêng tư và tiện nghi dành cho bạn',
  'NHÀ NGHỈ THA PHƯƠNG · SẠCH SẼ · RIÊNG TƯ · GIÁ TỐT',
  'THA PHƯƠNG',
  '0944 861 242',
  'huynhduykhanh0406@gmail.com',
  'Đang cập nhật địa chỉ chi tiết (Vui lòng liên hệ 0944 861 242 để được chỉ đường nhanh nhất)',
  '',
  '14:00',
  '12:00',
  'Thanh toán trực tiếp tại quầy lễ tân khi nhận phòng (Tiền mặt hoặc Chuyển khoản ngân hàng). Chưa yêu cầu thanh toán trực tuyến trên website.',
  'Miễn phí hủy hoặc thay đổi lịch đặt phòng khi thông báo trước giờ nhận phòng ít nhất 24 giờ qua số điện thoại 0944 861 242 hoặc trang Tra cứu đặt phòng.',
  'Điểm dừng chân an tâm, sạch sẽ và chu đáo cho mọi hành trình',
  'Nhà Nghỉ Tha Phương mang đến không gian lưu trú gần gũi, kín đáo và sạch sẽ với mức chi phí hợp lý.',
  '/images/rooms/phong-1-giuong/giuong-chinh-1.jpg',
  TRUE,
  TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.page_seo (page_key, page_name, seo_title, meta_description, canonical_path, og_image_url)
VALUES
  ('home', 'Trang chủ', 'Nhà Nghỉ Tha Phương | Đặt Phòng Trực Tuyến Sạch Sẽ, Riêng Tư & Giá Tốt', 'Nhà Nghỉ Tha Phương cung cấp phòng nghỉ 1 giường, 2 giường và 3 giường sạch sẽ, ấm cúng, đầy đủ điều hòa, Wi-Fi, phòng tắm riêng. Đặt giữ phòng online, thanh toán trực tiếp khi nhận phòng.', '/', '/images/rooms/phong-1-giuong/giuong-chinh-1.jpg'),
  ('rooms', 'Danh sách phòng', 'Danh Sách Phòng Nghỉ 1 - 2 - 3 Giường | Nhà Nghỉ Tha Phương', 'Khám phá các hạng phòng đơn 1 giường đôi, phòng 2 giường và phòng gia đình 3 giường tại Nhà Nghỉ Tha Phương.', '/rooms', '/images/rooms/phong-1-giuong/khong-gian-phong.jpg'),
  ('about', 'Giới thiệu', 'Giới Thiệu Không Gian & Dịch Vụ | Nhà Nghỉ Tha Phương', 'Tìm hiểu về không gian lưu trú ấm cúng, tiêu chuẩn vệ sinh sạch sẽ mỗi ngày và sự phục vụ tận tâm 24/7 tại Nhà Nghỉ Tha Phương.', '/about', '/images/rooms/phong-1-giuong/giuong-chinh-2.jpg'),
  ('contact', 'Liên hệ', 'Liên Hệ & Chỉ Đường | Nhà Nghỉ Tha Phương (0944 861 242)', 'Liên hệ lễ tân Nhà Nghỉ Tha Phương qua hotline 0944 861 242 hoặc email huynhduykhanh0406@gmail.com để được tư vấn và hỗ trợ đặt phòng 24/7.', '/contact', '/images/rooms/phong-1-giuong/giuong-chinh-1.jpg'),
  ('booking-lookup', 'Tra cứu đặt phòng', 'Tra Cứu & Quản Lý Đặt Phòng | Nhà Nghỉ Tha Phương', 'Kiểm tra trạng thái đơn đặt phòng tại Nhà Nghỉ Tha Phương bằng mã đặt phòng và số điện thoại/email bảo mật.', '/booking-lookup', '/images/rooms/phong-1-giuong/giuong-chinh-1.jpg'),
  ('faq', 'Câu hỏi thường gặp (FAQ)', 'Câu Hỏi Thường Gặp Khi Đặt Phòng | Nhà Nghỉ Tha Phương', 'Giải đáp thắc mắc về giờ nhận trả phòng, thủ tục giấy tờ, phương thức thanh toán trực tiếp và chính sách hủy phòng tại Nhà Nghỉ Tha Phương.', '/faq', '/images/rooms/phong-1-giuong/giuong-chinh-1.jpg')
ON CONFLICT (page_key) DO NOTHING;
