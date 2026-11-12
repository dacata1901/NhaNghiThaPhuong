import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type {
  Room,
  Booking,
  ContactMessage,
  HotelSettings,
  PageSeoConfig,
} from '@/types';
import type { CreateBookingPayload } from '@/context/HotelDataContext';

/**
 * Upload a room photo or video file to Supabase Storage bucket `room-media`
 */
export async function uploadRoomMediaToSupabase(
  file: File,
  roomCode: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Chưa cấu hình VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.',
    };
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const safeRoomCode = roomCode.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const filePath = `${safeRoomCode}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('room-media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data } = supabase.storage.from('room-media').getPublicUrl(filePath);
  return { success: true, url: data.publicUrl };
}

/**
 * Call the PostgreSQL atomic RPC `create_booking_atomic` to prevent race conditions
 */
export async function createBookingAtomicRpc(
  payload: CreateBookingPayload
): Promise<{
  success: boolean;
  booking_id?: string;
  booking_code?: string;
  nights_count?: number;
  total_amount?: number;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase chưa được cấu hình.',
    };
  }

  const { data, error } = await supabase.rpc('create_booking_atomic', {
    p_room_id: payload.room_id,
    p_guest_name: payload.guest_name,
    p_guest_phone: payload.guest_phone,
    p_guest_email: payload.guest_email || '',
    p_check_in: payload.check_in_date,
    p_check_out: payload.check_out_date,
    p_adults_count: payload.adults_count,
    p_children_count: payload.children_count,
    p_customer_notes: payload.customer_notes || '',
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as {
    success: boolean;
    booking_id?: string;
    booking_code?: string;
    nights_count?: number;
    total_amount?: number;
    error?: string;
  };
}

/**
 * Call the PostgreSQL dual-factor verification RPC `lookup_booking_secure`
 */
export async function lookupBookingSecureRpc(
  bookingCode: string,
  contactVerifier: string
): Promise<{
  success: boolean;
  booking?: Booking;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase chưa được cấu hình.' };
  }

  const { data, error } = await supabase.rpc('lookup_booking_secure', {
    p_booking_code: bookingCode,
    p_contact_verifier: contactVerifier,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as {
    success: boolean;
    booking?: Booking;
    error?: string;
  };
}

/**
 * Call the PostgreSQL cancellation RPC `request_cancel_booking_secure`
 */
export async function requestCancelBookingSecureRpc(
  bookingCode: string,
  contactVerifier: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase chưa được cấu hình.' };
  }

  const { data, error } = await supabase.rpc('request_cancel_booking_secure', {
    p_booking_code: bookingCode,
    p_contact_verifier: contactVerifier,
    p_reason: reason,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as { success: boolean; error?: string };
}

/**
 * Fetch initial public data from Supabase when configured
 */
export async function fetchInitialSupabaseData(): Promise<{
  rooms?: Room[];
  settings?: HotelSettings;
  pageSeoList?: PageSeoConfig[];
  bookings?: Booking[];
  contactMessages?: ContactMessage[];
} | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const [roomsRes, settingsRes, seoRes] = await Promise.all([
      supabase
        .from('rooms')
        .select('*, media:room_media(*)')
        .order('created_at', { ascending: true }),
      supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('page_seo').select('*'),
    ]);

    return {
      rooms: (roomsRes.data as Room[] | null) || undefined,
      settings: (settingsRes.data as HotelSettings | null) || undefined,
      pageSeoList: (seoRes.data as PageSeoConfig[] | null) || undefined,
    };
  } catch {
    return null;
  }
}
