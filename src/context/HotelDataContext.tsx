import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import dayjs from 'dayjs';
import type {
  Room,
  Booking,
  Customer,
  ContactMessage,
  HotelSettings,
  PageSeoConfig,
  Review,
  AdminNotification,
  BookingStatus,
  PaymentStatus,
  BookingStatusHistory,
} from '@/types';
import {
  INITIAL_ROOMS,
  INITIAL_BOOKINGS,
  INITIAL_CUSTOMERS,
  INITIAL_CONTACT_MESSAGES,
  INITIAL_HOTEL_SETTINGS,
  INITIAL_PAGE_SEO,
  INITIAL_REVIEWS,
} from '@/constants/seedData';
import { calculateNights, generateBookingCode } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  createBookingAtomicRpc,
  requestCancelBookingSecureRpc,
  fetchInitialSupabaseData,
} from '@/services/supabaseService';
import {
  sendBookingNotificationEmail,
  sendContactNotificationEmail,
  DEFAULT_TEST_NOTIFICATION_EMAIL,
} from '@/services/emailService';

const STORAGE_KEYS = {
  ROOMS: 'tp_hotel_rooms_v1',
  BOOKINGS: 'tp_hotel_bookings_v1',
  BOOKING_HISTORY: 'tp_hotel_booking_history_v1',
  CUSTOMERS: 'tp_hotel_customers_v1',
  MESSAGES: 'tp_hotel_messages_v1',
  SETTINGS: 'tp_hotel_settings_v1',
  SEO: 'tp_hotel_seo_v1',
  REVIEWS: 'tp_hotel_reviews_v1',
  NOTIFICATIONS: 'tp_hotel_notifications_v1',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Play a gentle two-tone chime using Web Audio API when a new booking or message arrives
 */
export function playNotificationChime(enabled: boolean) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.14); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Ignore if browser autoplay policy blocks audio before user interaction
  }
}

export interface CreateBookingPayload {
  room_id: string;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  check_in_date: string;
  check_out_date: string;
  adults_count: number;
  children_count: number;
  customer_notes?: string;
}

interface HotelDataContextValue {
  rooms: Room[];
  bookings: Booking[];
  bookingHistory: BookingStatusHistory[];
  customers: Customer[];
  contactMessages: ContactMessage[];
  settings: HotelSettings;
  pageSeoList: PageSeoConfig[];
  reviews: Review[];
  notifications: AdminNotification[];

  // Room helpers
  getRoomBySlug: (slug: string) => Room | undefined;
  getRoomById: (id: string) => Room | undefined;
  getAvailableQuantityForRoom: (roomId: string, checkIn: string, checkOut: string) => number;
  saveRoom: (room: Room) => void;
  deleteRoom: (roomId: string) => void;

  // Booking helpers
  createBooking: (payload: CreateBookingPayload) => {
    success: boolean;
    booking?: Booking;
    error?: string;
  };
  lookupBooking: (bookingCode: string, phoneOrEmail: string) => {
    success: boolean;
    booking?: Booking;
    room?: Room;
    error?: string;
  };
  requestCancelBooking: (bookingCode: string, phoneOrEmail: string, reason: string) => {
    success: boolean;
    error?: string;
  };
  updateBookingStatus: (
    bookingId: string,
    newStatus: BookingStatus,
    note?: string,
    paymentStatus?: PaymentStatus
  ) => void;
  updateBookingAdminNotes: (bookingId: string, internalNotes: string) => void;

  // Contact helpers
  createContactMessage: (payload: {
    full_name: string;
    email?: string;
    phone: string;
    subject?: string;
    message: string;
  }) => ContactMessage;
  updateContactMessageStatus: (
    id: string,
    status: ContactMessage['status'],
    admin_notes?: string
  ) => void;
  deleteContactMessage: (id: string) => void;

  // Settings & SEO helpers
  updateSettings: (newSettings: HotelSettings) => void;
  updatePageSeo: (updatedSeo: PageSeoConfig) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
}

const HotelDataContext = createContext<HotelDataContextValue | undefined>(undefined);

export const HotelDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>(() =>
    loadFromStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS)
  );
  const [bookings, setBookings] = useState<Booking[]>(() =>
    loadFromStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS)
  );
  const [bookingHistory, setBookingHistory] = useState<BookingStatusHistory[]>(() =>
    loadFromStorage(STORAGE_KEYS.BOOKING_HISTORY, [
      {
        id: 'hist-1',
        booking_id: 'bk-demo-1',
        old_status: 'pending',
        new_status: 'confirmed',
        note: 'Lễ tân đã gọi điện xác nhận lịch lưu trú với khách.',
        created_at: '2026-11-12T09:30:00Z',
      },
    ])
  );
  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadFromStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS)
  );
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() =>
    loadFromStorage(STORAGE_KEYS.MESSAGES, INITIAL_CONTACT_MESSAGES)
  );
  const [settings, setSettings] = useState<HotelSettings>(() => {
    const loaded = loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_HOTEL_SETTINGS);
    if (!loaded.email_notification || loaded.email_notification === 'huynhduykhanh0406@gmail.com') {
      loaded.email_notification = DEFAULT_TEST_NOTIFICATION_EMAIL;
    }
    return loaded;
  });
  const [pageSeoList, setPageSeoList] = useState<PageSeoConfig[]>(() =>
    loadFromStorage(STORAGE_KEYS.SEO, INITIAL_PAGE_SEO)
  );
  const [reviews] = useState<Review[]>(() =>
    loadFromStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS)
  );
  const [notifications, setNotifications] = useState<AdminNotification[]>(() =>
    loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif-1',
        type: 'new_booking',
        title: 'Đặt phòng mới: TP-2026-1002',
        message: 'Khách Trần Hoàng Nam đặt Phòng Đôi 2 Giường Lớn (20/11 - 22/11).',
        reference_id: 'bk-demo-2',
        is_read: false,
        created_at: '2026-11-12T15:20:00Z',
      },
      {
        id: 'notif-2',
        type: 'new_contact',
        title: 'Tin nhắn liên hệ mới',
        message: 'Khách Lê Thu Thảo gửi câu hỏi về đặt 2 phòng dịp cuối tuần.',
        reference_id: 'msg-demo-1',
        is_read: false,
        created_at: '2026-11-12T16:45:00Z',
      },
    ])
  );

  // Synchronous mutex lock to prevent concurrent race condition in client tab
  const bookingMutexRef = useRef<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKING_HISTORY, JSON.stringify(bookingHistory));
  }, [bookingHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(contactMessages));
  }, [contactMessages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SEO, JSON.stringify(pageSeoList));
  }, [pageSeoList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Cross-tab Realtime listener (when customer books in one tab and Admin is open in another tab)
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (e.key === STORAGE_KEYS.BOOKINGS) {
          setBookings(JSON.parse(e.newValue));
        } else if (e.key === STORAGE_KEYS.ROOMS) {
          setRooms(JSON.parse(e.newValue));
        } else if (e.key === STORAGE_KEYS.MESSAGES) {
          setContactMessages(JSON.parse(e.newValue));
        } else if (e.key === STORAGE_KEYS.NOTIFICATIONS) {
          setNotifications(JSON.parse(e.newValue));
          playNotificationChime(settings.sound_alerts_enabled);
        }
      } catch {
        // Ignore parse error
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [settings.sound_alerts_enabled]);

  // Supabase Cloud Initial Sync & Realtime Channel Subscription (when VITE_SUPABASE_URL is configured)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const loadRemoteData = () => {
      fetchInitialSupabaseData().then((remote) => {
        if (!remote) return;
        if (remote.rooms && remote.rooms.length > 0) setRooms(remote.rooms);
        if (remote.settings) setSettings(remote.settings);
        if (remote.pageSeoList && remote.pageSeoList.length > 0) {
          setPageSeoList(remote.pageSeoList);
        }
        if (remote.bookings && remote.bookings.length > 0) {
          setBookings(remote.bookings);
        }
        if (remote.contactMessages && remote.contactMessages.length > 0) {
          setContactMessages(remote.contactMessages);
        }
      });
    };

    loadRemoteData();

    const { data: authSub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        loadRemoteData();
      }
    });

    const channel = supabase
      .channel('hotel-realtime-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
        (payload) => {
          const newNotif = payload.new as AdminNotification;
          setNotifications((prev) => [newNotif, ...prev]);
          playNotificationChime(settings.sound_alerts_enabled);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const inserted = payload.new as Booking;
            setBookings((prev) =>
              prev.some((b) => b.id === inserted.id) ? prev : [inserted, ...prev]
            );
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Booking;
            setBookings((prev) =>
              prev.map((b) => (b.id === updated.id ? updated : b))
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_messages' },
        (payload) => {
          const insertedMsg = payload.new as ContactMessage;
          setContactMessages((prev) =>
            prev.some((m) => m.id === insertedMsg.id) ? prev : [insertedMsg, ...prev]
          );
        }
      )
      .subscribe();

    return () => {
      authSub.subscription.unsubscribe();
      supabase?.removeChannel(channel);
    };
  }, [settings.sound_alerts_enabled]);

  const getRoomBySlug = useCallback(
    (slug: string) => rooms.find((r) => r.slug === slug),
    [rooms]
  );

  const getRoomById = useCallback(
    (id: string) => rooms.find((r) => r.id === id),
    [rooms]
  );

  const getAvailableQuantityForRoom = useCallback(
    (roomId: string, checkIn: string, checkOut: string): number => {
      const room = rooms.find((r) => r.id === roomId);
      if (!room || room.status === 'maintenance' || !room.is_published) return 0;

      const reqStart = dayjs(checkIn).startOf('day');
      const reqEnd = dayjs(checkOut).startOf('day');

      if (!reqStart.isValid() || !reqEnd.isValid() || !reqEnd.isAfter(reqStart)) {
        return room.total_quantity;
      }

      const overlappingBookings = bookings.filter((b) => {
        if (b.room_id !== roomId) return false;
        if (b.status === 'cancelled') return false;
        const bStart = dayjs(b.check_in_date).startOf('day');
        const bEnd = dayjs(b.check_out_date).startOf('day');
        return bStart.isBefore(reqEnd) && bEnd.isAfter(reqStart);
      });

      const available = room.total_quantity - overlappingBookings.length;
      return available > 0 ? available : 0;
    },
    [rooms, bookings]
  );

  const createBooking = useCallback(
    (payload: CreateBookingPayload) => {
      if (bookingMutexRef.current) {
        return {
          success: false,
          error: 'Hệ thống đang xử lý yêu cầu đặt phòng trước đó. Vui lòng đợi trong giây lát.',
        };
      }

      bookingMutexRef.current = true;
      try {
        const room = rooms.find((r) => r.id === payload.room_id);
        if (!room || !room.is_published || room.status !== 'available') {
          return { success: false, error: 'Hạng phòng đã chọn hiện không khả dụng.' };
        }

        const nights = calculateNights(payload.check_in_date, payload.check_out_date);
        if (nights <= 0) {
          return {
            success: false,
            error: 'Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm.',
          };
        }

        const today = dayjs().startOf('day');
        if (dayjs(payload.check_in_date).startOf('day').isBefore(today)) {
          return {
            success: false,
            error: 'Ngày nhận phòng không được nằm trong quá khứ.',
          };
        }

        if (payload.adults_count > room.max_adults) {
          return {
            success: false,
            error: `Hạng phòng "${room.name}" hỗ trợ tối đa ${room.max_adults} người lớn.`,
          };
        }

        const availableQty = getAvailableQuantityForRoom(
          room.id,
          payload.check_in_date,
          payload.check_out_date
        );
        if (availableQty <= 0) {
          return {
            success: false,
            error:
              'Hạng phòng này đã hết phòng trống trong khoảng ngày bạn chọn. Vui lòng chọn ngày hoặc hạng phòng khác.',
          };
        }

        // Price is strictly computed from the authoritative room record (never trusted from client)
        const totalAmount = nights * room.price_per_night;
        const bookingCode = generateBookingCode();
        const nowIso = new Date().toISOString();

        const newBooking: Booking = {
          id: `bk-${Date.now()}`,
          booking_code: bookingCode,
          room_id: room.id,
          room_name: room.name,
          room_code: room.room_code,
          guest_name: payload.guest_name.trim(),
          guest_phone: payload.guest_phone.trim(),
          guest_email: (payload.guest_email || '').trim(),
          check_in_date: payload.check_in_date,
          check_out_date: payload.check_out_date,
          nights_count: nights,
          adults_count: payload.adults_count,
          children_count: payload.children_count,
          price_per_night_snapshot: room.price_per_night,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pay_at_property',
          payment_method_label: 'Thanh toán trực tiếp tại lễ tân khi nhận phòng',
          customer_notes: payload.customer_notes?.trim() || '',
          is_demo_data: false,
          created_at: nowIso,
          updated_at: nowIso,
        };

        setBookings((prev) => [newBooking, ...prev]);

        setBookingHistory((prev) => [
          {
            id: `hist-${Date.now()}`,
            booking_id: newBooking.id,
            old_status: null,
            new_status: 'pending',
            note: 'Khách hàng tạo yêu cầu đặt phòng trực tuyến qua website.',
            created_at: nowIso,
          },
          ...prev,
        ]);

        // Upsert Customer record
        setCustomers((prev) => {
          const existingIdx = prev.findIndex(
            (c) =>
              c.phone.replace(/\s+/g, '') === newBooking.guest_phone.replace(/\s+/g, '') ||
              (newBooking.guest_email &&
                c.email.toLowerCase() === newBooking.guest_email.toLowerCase())
          );
          if (existingIdx >= 0) {
            const updated = [...prev];
            updated[existingIdx] = {
              ...updated[existingIdx],
              full_name: newBooking.guest_name,
              total_bookings: updated[existingIdx].total_bookings + 1,
              total_spent: updated[existingIdx].total_spent + newBooking.total_amount,
              last_booking_date: newBooking.check_in_date,
            };
            return updated;
          }
          return [
            {
              id: `cust-${Date.now()}`,
              full_name: newBooking.guest_name,
              phone: newBooking.guest_phone,
              email: newBooking.guest_email || 'Không cung cấp',
              total_bookings: 1,
              total_spent: newBooking.total_amount,
              last_booking_date: newBooking.check_in_date,
              created_at: nowIso,
            },
            ...prev,
          ];
        });

        // Add Realtime Notification for Admin + play chime
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            type: 'new_booking',
            title: `Đặt phòng mới: ${newBooking.booking_code}`,
            message: `Khách ${newBooking.guest_name} (${newBooking.guest_phone}) đặt ${room.name}.`,
            reference_id: newBooking.id,
            is_read: false,
            created_at: nowIso,
          },
          ...prev,
        ]);
        playNotificationChime(settings.sound_alerts_enabled);

        // Send email notification to settings.email_notification (default: minhkhang19012006@gmail.com)
        sendBookingNotificationEmail(newBooking, settings.email_notification).catch(() => {});

        // If Supabase is configured, also persist via atomic PostgreSQL RPC
        if (isSupabaseConfigured && supabase) {
          createBookingAtomicRpc(payload).catch(() => {});
        }

        return { success: true, booking: newBooking };
      } finally {
        bookingMutexRef.current = false;
      }
    },
    [rooms, getAvailableQuantityForRoom, settings.sound_alerts_enabled, settings.email_notification]
  );

  const lookupBooking = useCallback(
    (bookingCode: string, phoneOrEmail: string) => {
      const cleanCode = bookingCode.trim().toUpperCase();
      const cleanVerifier = phoneOrEmail.trim().toLowerCase().replace(/\s+/g, '');

      if (!cleanCode || !cleanVerifier) {
        return {
          success: false,
          error: 'Vui lòng nhập đầy đủ Mã đặt phòng và Số điện thoại (hoặc Email) xác thực.',
        };
      }

      const found = bookings.find(
        (b) => b.booking_code.toUpperCase() === cleanCode
      );
      if (!found) {
        return {
          success: false,
          error: 'Không tìm thấy mã đặt phòng này. Vui lòng kiểm tra lại mã đặt phòng.',
        };
      }

      const phoneMatch = found.guest_phone.replace(/\s+/g, '') === cleanVerifier;
      const emailMatch = found.guest_email.trim().toLowerCase() === cleanVerifier;

      if (!phoneMatch && !emailMatch) {
        return {
          success: false,
          error: 'Số điện thoại hoặc Email xác thực không khớp với mã đặt phòng này.',
        };
      }

      const room = rooms.find((r) => r.id === found.room_id);
      return { success: true, booking: found, room };
    },
    [bookings, rooms]
  );

  const requestCancelBooking = useCallback(
    (bookingCode: string, phoneOrEmail: string, reason: string) => {
      const res = lookupBooking(bookingCode, phoneOrEmail);
      if (!res.success || !res.booking) {
        return { success: false, error: res.error || 'Không thể xác thực đặt phòng.' };
      }

      if (res.booking.status === 'cancelled' || res.booking.status === 'completed') {
        return {
          success: false,
          error: 'Đơn đặt phòng này đã ở trạng thái hủy hoặc hoàn tất.',
        };
      }

      const nowIso = new Date().toISOString();
      setBookings((prev) =>
        prev.map((b) =>
          b.id === res.booking!.id
            ? {
                ...b,
                cancel_requested: true,
                cancel_reason: reason.trim(),
                status: 'cancelled',
                updated_at: nowIso,
              }
            : b
        )
      );

      setBookingHistory((prev) => [
        {
          id: `hist-${Date.now()}`,
          booking_id: res.booking!.id,
          old_status: res.booking!.status,
          new_status: 'cancelled',
          note: `Khách hàng yêu cầu hủy phòng trực tuyến. Lý do: ${reason.trim()}`,
          created_at: nowIso,
        },
        ...prev,
      ]);

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'cancel_request',
          title: `Khách hủy phòng: ${res.booking!.booking_code}`,
          message: `Khách ${res.booking!.guest_name} đã hủy đơn. Lý do: ${reason.trim()}`,
          reference_id: res.booking!.id,
          is_read: false,
          created_at: nowIso,
        },
        ...prev,
      ]);
      playNotificationChime(settings.sound_alerts_enabled);

      if (isSupabaseConfigured) {
        requestCancelBookingSecureRpc(bookingCode, phoneOrEmail, reason).catch(() => {});
      }

      return { success: true };
    },
    [lookupBooking, settings.sound_alerts_enabled]
  );

  const updateBookingStatus = useCallback(
    (
      bookingId: string,
      newStatus: BookingStatus,
      note?: string,
      paymentStatus?: PaymentStatus
    ) => {
      const nowIso = new Date().toISOString();
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId) return b;
          setBookingHistory((hPrev) => [
            {
              id: `hist-${Date.now()}`,
              booking_id: bookingId,
              old_status: b.status,
              new_status: newStatus,
              note: note || `Quản trị viên cập nhật trạng thái sang ${newStatus}`,
              created_at: nowIso,
            },
            ...hPrev,
          ]);
          return {
            ...b,
            status: newStatus,
            payment_status: paymentStatus || b.payment_status,
            updated_at: nowIso,
          };
        })
      );

      if (isSupabaseConfigured && supabase) {
        supabase
          .from('bookings')
          .update({
            status: newStatus,
            ...(paymentStatus ? { payment_status: paymentStatus } : {}),
          })
          .eq('id', bookingId)
          .then(() => {});
      }
    },
    []
  );

  const updateBookingAdminNotes = useCallback(
    (bookingId: string, internalNotes: string) => {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, internal_admin_notes: internalNotes, updated_at: new Date().toISOString() }
            : b
        )
      );

      if (isSupabaseConfigured && supabase) {
        supabase
          .from('bookings')
          .update({ internal_admin_notes: internalNotes })
          .eq('id', bookingId)
          .then(() => {});
      }
    },
    []
  );

  const saveRoom = useCallback((room: Room) => {
    setRooms((prev) => {
      const exists = prev.some((r) => r.id === room.id);
      if (exists) {
        return prev.map((r) =>
          r.id === room.id ? { ...room, updated_at: new Date().toISOString() } : r
        );
      }
      return [
        ...prev,
        {
          ...room,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const deleteRoom = useCallback((roomId: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
  }, []);

  const createContactMessage = useCallback(
    (payload: {
      full_name: string;
      email?: string;
      phone: string;
      subject?: string;
      message: string;
    }) => {
      const nowIso = new Date().toISOString();
      const newMsg: ContactMessage = {
        id: `msg-${Date.now()}`,
        full_name: payload.full_name.trim(),
        email: (payload.email || '').trim(),
        phone: payload.phone.trim(),
        subject: (payload.subject || 'Tin nhắn liên hệ từ khách hàng').trim(),
        message: payload.message.trim(),
        status: 'unread',
        created_at: nowIso,
      };
      setContactMessages((prev) => [newMsg, ...prev]);
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'new_contact',
          title: `Tin nhắn mới từ ${newMsg.full_name}`,
          message: newMsg.subject,
          reference_id: newMsg.id,
          is_read: false,
          created_at: nowIso,
        },
        ...prev,
      ]);
      playNotificationChime(settings.sound_alerts_enabled);

      // Send email notification to settings.email_notification (default: minhkhang19012006@gmail.com)
      sendContactNotificationEmail(newMsg, settings.email_notification).catch(() => {});

      if (isSupabaseConfigured && supabase) {
        supabase
          .from('contact_messages')
          .insert({
            full_name: newMsg.full_name,
            email: newMsg.email,
            phone: newMsg.phone,
            subject: newMsg.subject,
            message: newMsg.message,
          })
          .then(() => {});
      }

      return newMsg;
    },
    [settings.sound_alerts_enabled, settings.email_notification]
  );

  const updateContactMessageStatus = useCallback(
    (id: string, status: ContactMessage['status'], admin_notes?: string) => {
      setContactMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, status, admin_notes: admin_notes ?? m.admin_notes }
            : m
        )
      );
    },
    []
  );

  const deleteContactMessage = useCallback((id: string) => {
    setContactMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateSettings = useCallback((newSettings: HotelSettings) => {
    setSettings(newSettings);
  }, []);

  const updatePageSeo = useCallback((updatedSeo: PageSeoConfig) => {
    setPageSeoList((prev) =>
      prev.map((item) => (item.page_key === updatedSeo.page_key ? updatedSeo : item))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  const resetDemoData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    setRooms(INITIAL_ROOMS);
    setBookings(INITIAL_BOOKINGS);
    setCustomers(INITIAL_CUSTOMERS);
    setContactMessages(INITIAL_CONTACT_MESSAGES);
    setSettings(INITIAL_HOTEL_SETTINGS);
    setPageSeoList(INITIAL_PAGE_SEO);
  }, []);

  return (
    <HotelDataContext.Provider
      value={{
        rooms,
        bookings,
        bookingHistory,
        customers,
        contactMessages,
        settings,
        pageSeoList,
        reviews,
        notifications,
        getRoomBySlug,
        getRoomById,
        getAvailableQuantityForRoom,
        saveRoom,
        deleteRoom,
        createBooking,
        lookupBooking,
        requestCancelBooking,
        updateBookingStatus,
        updateBookingAdminNotes,
        createContactMessage,
        updateContactMessageStatus,
        deleteContactMessage,
        updateSettings,
        updatePageSeo,
        markAllNotificationsRead,
        resetDemoData,
      }}
    >
      {children}
    </HotelDataContext.Provider>
  );
};

export function useHotelData() {
  const ctx = useContext(HotelDataContext);
  if (!ctx) {
    throw new Error('useHotelData must be used within a HotelDataProvider');
  }
  return ctx;
}
