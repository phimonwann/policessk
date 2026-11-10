import { LeaveRequest, UserPersonnel } from '../types/leave';
import { formatThaiDate, getLeaveTypeLabel } from './thaiDateUtils';

// Export leave requests to Excel (CSV with UTF-8 BOM for Thai language)
export function exportLeavesToCSV(requests: LeaveRequest[], filename = 'รายงานการลา_สภ.ศรีสงคราม.csv') {
  const headers = [
    'เลขที่ใบลา',
    'ปีงบประมาณ',
    'ยศ-ชื่อ-สกุล',
    'ตำแหน่ง',
    'สายงาน',
    'ประเภทการลา',
    'เหตุผลการลา',
    'ตั้งแต่วันที่',
    'ถึงวันที่',
    'จำนวนวัน',
    'ช่วงเวลา',
    'สถานะ',
    'เบอร์โทรศัพท์ติดต่อ',
    'ผู้อนุมัติ'
  ];

  const rows = requests.map(r => [
    `"${r.requestNumber}"`,
    `"${r.fiscalYear}"`,
    `"${r.userRank} ${r.userFullName}"`,
    `"${r.userPosition}"`,
    `"${r.department} / ${r.subDepartment}"`,
    `"${getLeaveTypeLabel(r.leaveType)}"`,
    `"${(r.reason || '').replace(/"/g, '""')}"`,
    `"${formatThaiDate(r.startDate)}"`,
    `"${formatThaiDate(r.endDate)}"`,
    `"${r.totalDays}"`,
    `"${r.period === 'full_day' ? 'เต็มวัน' : r.period === 'half_morning' ? 'ครึ่งวันเช้า' : 'ครึ่งวันบ่าย'}"`,
    `"${r.status === 'approved' ? 'อนุมัติแล้ว' : r.status === 'rejected' ? 'ไม่อนุมัติ' : r.status === 'cancelled' ? 'ยกเลิก' : 'รอพิจารณา'}"`,
    `"${r.contactPhone}"`,
    `"${r.approverName || '-'}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export personnel roster to CSV
export function exportPersonnelToCSV(personnel: UserPersonnel[], filename = 'บัญชีรายชื่อข้าราชการตำรวจ_สภ.ศรีสงคราม.csv') {
  const headers = [
    'นามเรียกขาน',
    'ยศ',
    'ชื่อ',
    'นามสกุล',
    'ตำแหน่ง',
    'สายงานหลัก',
    'สายงานย่อย',
    'สิทธิ์การใช้งาน',
    'เบอร์โทรศัพท์',
    'วันลาพักผ่อนสะสม',
    'สิทธิลาพักผ่อนปีนี้'
  ];

  const rows = personnel.map(p => [
    `"${p.callsign}"`,
    `"${p.rank}"`,
    `"${p.firstName}"`,
    `"${p.lastName}"`,
    `"${p.position}"`,
    `"${p.department}"`,
    `"${p.subDepartment}"`,
    `"${p.role}"`,
    `"${p.phone}"`,
    `"${p.accumulatedVacationDays}"`,
    `"${p.currentYearVacationDays}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Backup entire system state as JSON file
export function backupSystemData(data: Record<string, unknown>, filename = `backup_ssk_police_${new Date().toISOString().slice(0,10)}.json`) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
