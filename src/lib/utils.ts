import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

export function formatVND(amount: number): string {
  return formatCurrencyVND(amount);
}

export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  return dayjs(dateStr).format('DD/MM/YYYY');
}

export function formatDateTimeVN(dateStr: string): string {
  if (!dateStr) return '';
  return dayjs(dateStr).format('HH:mm - DD/MM/YYYY');
}

export function getDefaultCheckInDate(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function getDefaultCheckOutDate(): string {
  return dayjs().add(1, 'day').format('YYYY-MM-DD');
}

export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = dayjs(checkIn).startOf('day');
  const end = dayjs(checkOut).startOf('day');
  const diff = end.diff(start, 'day');
  return diff > 0 ? diff : 0;
}

export function generateBookingCode(): string {
  const year = dayjs().format('YYYY');
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `TP-${year}-${randomDigits}`;
}
