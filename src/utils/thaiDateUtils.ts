import { HolidayItem, LeaveRequest, LeaveType } from '../types/leave';

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
export const THAI_DAYS_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

// Convert Arabic digits to Thai digits
export function toThaiDigits(num: string | number): string {
  const thaiNums = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return String(num).replace(/[0-9]/g, (d) => thaiNums[Number(d)]);
}

// Convert YYYY-MM-DD to Thai readable string
export function formatThaiDate(dateString: string, useThaiDigits = false): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length < 3) return dateString;
  const year = parseInt(parts[0], 10) + 543;
  const month = THAI_MONTHS[parseInt(parts[1], 10) - 1] || '';
  const day = parseInt(parts[2], 10);
  const result = `${day} ${month} พ.ศ. ${year}`;
  return useThaiDigits ? toThaiDigits(result) : result;
}

export function formatThaiDateShort(dateString: string): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length < 3) return dateString;
  const year = (parseInt(parts[0], 10) + 543) % 100;
  const month = THAI_MONTHS_SHORT[parseInt(parts[1], 10) - 1] || '';
  const day = parseInt(parts[2], 10);
  return `${day} ${month} ${year}`;
}

// Live Current Date & Time for Header
export function getCurrentThaiDateTimeString(date = new Date()): {
  dateStr: string;
  timeStr: string;
  fullThaiDateStr: string;
} {
  const day = date.getDate();
  const month = THAI_MONTHS[date.getMonth()];
  const year = date.getFullYear() + 543;
  const dayName = THAI_DAYS[date.getDay()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return {
    dateStr: `${day} ${month} ${year}`,
    timeStr: `${hours}:${minutes}:${seconds} น.`,
    fullThaiDateStr: `วัน${dayName}ที่ ${day} ${month} พ.ศ. ${year}`
  };
}

// Check if a date is a weekend (Saturday or Sunday)
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// Check if a date is an official Thai holiday
export function isOfficialHoliday(dateStr: string, holidays: HolidayItem[]): boolean {
  return holidays.some(h => h.date === dateStr);
}

// Calculate business days between startDate and endDate (excluding weekends and official holidays)
export function calculateBusinessDays(startDateStr: string, endDateStr: string, holidays: HolidayItem[]): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (start > end) return 0;

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    if (!isWeekend(current) && !isOfficialHoliday(dateStr, holidays)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

// Calculate total calendar days (for ordination, maternity etc where continuous days apply)
export function calculateCalendarDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (start > end) return 0;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// Check if two date ranges overlap
export function checkDateOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  return !(end1 < start2 || start1 > end2);
}

// Leave type label helper
export function getLeaveTypeLabel(type: LeaveType): string {
  switch (type) {
    case 'vacation': return 'ลาพักผ่อน';
    case 'sick': return 'ลาป่วย';
    case 'personal': return 'ลากิจส่วนตัว';
    case 'maternity': return 'ลาคลอดบุตร';
    case 'childcare': return 'ลาเพื่อดูแลบุตรและภรรยาหลังคลอด';
    case 'ordination': return 'ลาอุปสมบท';
    case 'other': return 'ไปราชการ/อื่นๆ';
    default: return 'การลา';
  }
}

// Leave code helper for roster/matrix
export function getLeaveTypeCode(type: LeaveType): { code: string; label: string; colorClass: string; bgClass: string } {
  switch (type) {
    case 'vacation':
      return { code: 'พ', label: 'ลาพักผ่อน', colorClass: 'text-amber-900', bgClass: 'bg-yellow-300' };
    case 'sick':
      return { code: 'ป', label: 'ลาป่วย', colorClass: 'text-red-900', bgClass: 'bg-rose-300' };
    case 'personal':
      return { code: 'ก', label: 'ลากิจ', colorClass: 'text-purple-900', bgClass: 'bg-purple-300' };
    case 'childcare':
      return { code: 'ลก', label: 'ลาเลี้ยงลูก', colorClass: 'text-blue-900', bgClass: 'bg-blue-300' };
    case 'ordination':
      return { code: 'อส', label: 'ลาอุปสมบท', colorClass: 'text-emerald-900', bgClass: 'bg-emerald-300' };
    case 'other':
      return { code: 'ปก', label: 'ไปราชการ', colorClass: 'text-stone-900', bgClass: 'bg-stone-300' };
    default:
      return { code: 'ล', label: 'ลา', colorClass: 'text-gray-900', bgClass: 'bg-gray-200' };
  }
}

// Generate new official request number: สภ.XXXX/YYYY
export function generateRequestNumber(existingRequests: LeaveRequest[], currentFiscalYear: number): string {
  const currentYearRequests = existingRequests.filter(r => r.fiscalYear === currentFiscalYear);
  const nextNumber = currentYearRequests.length + 1;
  const padded = String(nextNumber).padStart(4, '0');
  return `สภ.${padded}/${currentFiscalYear}`;
}
