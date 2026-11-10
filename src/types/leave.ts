export type UserRole =
  | 'personnel'   // 👮 บุคลากร (ยื่นลา ดูประวัติ ดูวันลาคงเหลือ)
  | 'supervisor'  // 👮 หัวหน้างาน (ตรวจสอบการลาของผู้ใต้บังคับบัญชา)
  | 'inspector'   // 📋 ผู้ตรวจสอบ (ตรวจสอบเอกสารและความถูกต้อง)
  | 'approver'    // ✍️ ผู้อนุมัติ (อนุมัติ / ไม่อนุมัติ / ส่งกลับแก้ไข)
  | 'admin'       // ⚙️ Admin (จัดการบุคลากร ระบบ และการตั้งค่า)
  | 'commander';  // ⭐ ผู้กำกับ (ดูภาพรวม อนุมัติ และพิมพ์รายงาน)

export type LeaveType =
  | 'vacation'     // ลาพักผ่อน
  | 'sick'         // ลาป่วย
  | 'personal'     // ลากิจส่วนตัว
  | 'maternity'    // ลาคลอด
  | 'childcare'    // ลาเพื่อดูแลบุตรและภรรยาหลังคลอด
  | 'ordination'   // ลาอุปสมบท
  | 'other';       // อื่น ๆ / ไปราชการ / ศึกษา

export type LeaveStatus =
  | 'pending_inspector' // รอตรวจสอบ
  | 'pending_supervisor'// รอหัวหน้างานพิจารณา
  | 'pending_approver'  // รออนุมัติ
  | 'approved'          // อนุมัติแล้ว
  | 'rejected'          // ไม่อนุมัติ
  | 'cancelled'         // ยกเลิกคำขอลา
  | 'revised';          // ส่งกลับแก้ไข

export type LeavePeriod = 'full_day' | 'half_morning' | 'half_afternoon';

// Requirement 21: โครงสร้างสายงานและสายงานย่อยทั้งหมด
export interface DepartmentStructure {
  id: string;
  name: string;
  subDepartments: string[];
}

export const POLICE_DEPARTMENTS: DepartmentStructure[] = [
  {
    id: 'commander',
    name: 'ผกก.',
    subDepartments: ['ผู้กำกับการ', 'รองผู้กำกับการ']
  },
  {
    id: 'suppression',
    name: 'งานป้องกันปราบปราม',
    subDepartments: [
      '2.1 รอง ผกก.ป.',
      '2.2 สวป.',
      '2.3 ร้อยเวรป้องกันปราบปราม',
      '2.4 สายตรวจรถยนต์',
      '2.5 สายตรวจรถจักรยานยนต์',
      '2.6 ประจำวัน',
      '2.7 สิบเวร',
      '2.8 วิทยุ',
      '2.9 ธุรการป้องกันปราบปราม'
    ]
  },
  {
    id: 'investigation_crime',
    name: 'งานสอบสวน',
    subDepartments: [
      '3.1 รอง ผกก.(สอบสวน)',
      '3.2 สว.(สอบสวน)',
      '3.3 สว.สอบสวน(หน.คดี)',
      '3.4 พนักงานสอบสวน',
      '3.5 ผู้ช่วยพนักงานสอบสวน',
      '3.6 เสมียนคดี'
    ]
  },
  {
    id: 'investigation_detective',
    name: 'งานสืบสวน',
    subDepartments: [
      '4.1 รอง ผกก.สส.',
      '4.2 สว.สส.'
    ]
  },
  {
    id: 'administration',
    name: 'งานอำนวยการ',
    subDepartments: [
      '5.1 สว.อก.'
    ]
  },
  {
    id: 'traffic',
    name: 'งานจราจร',
    subDepartments: [
      'งานจราจร (ทั่วไป)',
      'สายตรวจจราจร',
      'เปรียบเทียบปรับ/ธุรการจราจร'
    ]
  }
];

export interface UserPersonnel {
  id: string;
  callsign: string; // เช่น SSK503
  username: string; // เข้าครั้งแรก = callsign
  password: string; // สามารถดูและแก้ไขได้
  rank: string;     // ยศ เช่น พ.ต.อ., พ.ต.ท., ร.ต.อ., ส.ต.ท.
  firstName: string;
  lastName: string;
  position: string; // ตำแหน่ง เช่น ผบ.หมู่(ป.)สภ.ศรีสงคราม
  department: string; // สายงานหลัก
  subDepartment: string; // สายงานย่อย
  role: UserRole;
  phone: string;
  address: string;
  accumulatedVacationDays: number; // วันลาพักผ่อนสะสม
  currentYearVacationDays: number; // สิทธิลาพักผ่อนปีนี้
  failedAttempts: number;
  isLocked: boolean;
  mustChangePasswordFirstLogin: boolean;
  avatarUrl?: string;
  isActive: boolean;
}

export interface LeaveRequest {
  id: string;
  requestNumber: string; // สภ.0068/2569
  fiscalYear: number;    // e.g. 2569, up to 2580
  userId: string;
  userRank: string;
  userFullName: string;
  userPosition: string;
  department: string;
  subDepartment: string;
  leaveType: LeaveType;
  reason: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  totalDays: number;
  period: LeavePeriod;
  isRetroactive?: boolean;
  retroactiveReason?: string;
  contactAddress: string;
  contactPhone: string;

  // Addressed To (Requirement 27)
  addressedToTitle: string; // e.g. "ผู้กำกับการสถานีตำรวจภูธรศรีสงคราม" or "ผู้บังคับการตำรวจภูธรจังหวัดนครพนม"
  customCommanderName?: string; // e.g. "พล.ต.ต. อารักษ์ มะสาธานัง"

  // Special Leave Type Details
  maternityWifeName?: string;
  childDeliveryDate?: string;
  ordinationTemple?: string;
  ordinationTempleAddress?: string;
  ordinationTemplePhone?: string;
  ordinationDate?: string;
  residenceTemple?: string;
  residenceTempleAddress?: string;
  hasOrdainedBefore?: boolean;

  // Last leave history
  lastLeaveType?: LeaveType;
  lastLeaveStartDate?: string;
  lastLeaveEndDate?: string;
  lastLeaveDays?: number;

  // Requirement 20, 24, 29: กำลังปฏิบัติหน้าที่
  dutyDepartmentTitle: string; // ผู้ลาปฏิบัติหน้าที่ [ เช่น งานอำนวยการ ]
  totalDutyPersonnel: number;  // มีกำลังปฏิบัติหน้าที่ ... นาย
  onLeavePersonnel: number;     // ลา ... นาย
  remainingDutyPersonnel: number; // เหลือกำลังปฏิบัติหน้าที่ ... นาย

  // Attachments
  attachmentName?: string;
  attachmentUrl?: string;

  // Workflow / Status
  status: LeaveStatus;
  createdAt: string;
  updatedAt: string;

  // Review Steps
  supervisorComment?: string;
  supervisorName?: string;
  supervisorSignDate?: string;
  
  inspectorComment?: string;
  inspectorName?: string;
  inspectorSignDate?: string;

  approverDecision?: 'approved' | 'rejected';
  rejectionReason?: string;
  approverName?: string;
  approverRank?: string;
  approverSignDate?: string;

  cancelledBy?: string;
  cancelledAt?: string;
  cancellationReason?: string;

  // Audit timeline
  timeline: {
    status: LeaveStatus;
    updatedBy: string;
    timestamp: string;
    comment?: string;
  }[];
}

export interface StationConfig {
  stationName: string; // สถานีตำรวจภูธรศรีสงคราม
  stationNameEn: string; // Si Songkhram Police Station
  subdivision: string; // ตำรวจภูธรจังหวัดนครพนม
  division: string; // ตำรวจภูธรภาค 4
  phone: string; // Requirement 18: เบอร์โทรศัพท์ของสถานีตำรวจ
  address: string;
  currentFiscalYear: number; // เช่น 2569
  superintendentRank: string; // พ.ต.อ.
  superintendentName: string; // ถวิล คำเกษ
  provincialCommanderRank: string; // พล.ต.ต.
  provincialCommanderName: string; // อารักษ์ มะสาธานัง
  provincialCommanderTitle: string; // ผบก.ภ.จว.นครพนม
  minDutyPercentage: number; // ตรวจสอบกำลังพลขั้นต่ำ %
  sessionTimeoutMinutes: number; // หมดเวลาอัตโนมัติ
  delegatedApproverId?: string; // ระบบมอบหมายผู้อนุมัติแทน
  delegatedApproverName?: string;
  delegationReason?: string;
  isFiscalYearLocked?: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'CANCEL' | 'LOGIN' | 'LOGOUT' | 'RESET_PASSWORD';
  targetType: 'LEAVE' | 'USER' | 'CONFIG' | 'AUTH';
  targetId: string;
  details: string;
  ipAddress?: string;
}

export interface HolidayItem {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  isSpecial?: boolean;
}
