export type RoomTypeKey = '1_bed' | '2_beds' | '3_beds' | 'custom';
export type RoomStatus = 'available' | 'occupied' | 'maintenance';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pay_at_property' | 'unpaid' | 'deposit_paid' | 'paid' | 'refunded';
export type ContactMessageStatus = 'unread' | 'read' | 'resolved';

export interface RoomMedia {
  id: string;
  room_id: string;
  media_type: 'image' | 'video';
  url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Amenity {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon_name: string;
  is_featured_home: boolean;
}

export interface Room {
  id: string;
  room_code: string;
  name: string;
  slug: string;
  room_type: RoomTypeKey;
  room_type_label: string;
  bed_count: number;
  max_adults: number;
  max_children: number;
  area_sqm: number;
  price_per_night: number;
  total_quantity: number;
  short_description: string;
  full_description: string;
  policies: string;
  status: RoomStatus;
  is_published: boolean;
  is_featured: boolean;
  is_demo_data: boolean;
  rating: number;
  reviews_count: number;
  media: RoomMedia[];
  amenities: Amenity[];
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_code: string;
  room_id: string;
  room_name?: string;
  room_code?: string;
  customer_id?: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  check_in_date: string;
  check_out_date: string;
  nights_count: number;
  adults_count: number;
  children_count: number;
  price_per_night_snapshot: number;
  total_amount: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method_label: string;
  customer_notes?: string;
  cancel_reason?: string;
  cancel_requested?: boolean;
  internal_admin_notes?: string;
  is_demo_data: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingStatusHistory {
  id: string;
  booking_id: string;
  old_status: BookingStatus | null;
  new_status: BookingStatus;
  note: string;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  total_bookings: number;
  total_spent: number;
  notes?: string;
  last_booking_date?: string;
  created_at: string;
}

export interface Review {
  id: string;
  room_id?: string;
  room_name?: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  stay_date_label?: string;
  is_published: boolean;
  is_demo_data: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  admin_notes?: string;
  created_at: string;
}

export interface AdminNotification {
  id: string;
  type: 'new_booking' | 'cancel_request' | 'new_contact';
  title: string;
  message: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface HotelSettings {
  id: number;
  hotel_name: string;
  tagline: string;
  sub_tagline: string;
  logo_text: string;
  phone_primary: string;
  email_notification: string;
  address_text: string;
  google_maps_embed_url: string;
  check_in_time: string;
  check_out_time: string;
  payment_policy_note: string;
  cancellation_policy_summary: string;
  about_title: string;
  about_description: string;
  about_highlights: string[];
  hero_image_url: string;
  intro_video_url?: string;
  sound_alerts_enabled: boolean;
  is_demo_warning_visible: boolean;
  faqs: FaqItem[];
}

export interface PageSeoConfig {
  page_key: string;
  page_name: string;
  seo_title: string;
  meta_description: string;
  canonical_path: string;
  og_image_url?: string;
}
