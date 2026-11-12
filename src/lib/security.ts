/**
 * Security utilities for Nhà Nghỉ Tha Phương
 * - Input sanitization against XSS injection
 * - Rate limiting against spam & brute-force
 * - Strict MIME & file size validation for media uploads
 */

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

/**
 * Strip HTML tags and dangerous control characters from user text inputs
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Validate uploaded image or video file before storage upload
 */
export function validateMediaFile(
  file: File,
  type: 'image' | 'video' = 'image'
): { valid: boolean; error?: string } {
  if (type === 'image') {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc WEBP.',
      };
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return {
        valid: false,
        error: 'Dung lượng ảnh không được vượt quá 10MB.',
      };
    }
  } else {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Chỉ chấp nhận file video định dạng MP4 hoặc WEBM.',
      };
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      return {
        valid: false,
        error: 'Dung lượng video không được vượt quá 50MB.',
      };
    }
  }

  return { valid: true };
}

/**
 * Client-side rate limiter to prevent form spam and brute-force attempts
 */
export function checkActionRateLimit(
  actionKey: string,
  cooldownMs: number = 10000
): { allowed: boolean; remainingSeconds: number } {
  try {
    const storageKey = `nntp_ratelimit_${actionKey}`;
    const lastTime = Number(sessionStorage.getItem(storageKey) || '0');
    const now = Date.now();
    const elapsed = now - lastTime;

    if (elapsed < cooldownMs) {
      return {
        allowed: false,
        remainingSeconds: Math.ceil((cooldownMs - elapsed) / 1000),
      };
    }

    sessionStorage.setItem(storageKey, String(now));
    return { allowed: true, remainingSeconds: 0 };
  } catch {
    return { allowed: true, remainingSeconds: 0 };
  }
}
