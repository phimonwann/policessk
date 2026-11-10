import React, { useState, useEffect } from 'react';
import { 
  LeaveRequest, 
  LeaveType, 
  LeavePeriod, 
  StationConfig, 
  UserPersonnel, 
  HolidayItem 
} from '../types/leave';
import { 
  calculateBusinessDays, 
  calculateCalendarDays, 
  checkDateOverlap, 
  formatThaiDate, 
  generateRequestNumber 
} from '../utils/thaiDateUtils';
import { 
  X, 
  Send, 
  Calendar, 
  AlertTriangle, 
  Paperclip, 
  FileText, 
  User, 
  Phone, 
  MapPin, 
  ShieldCheck,
  Calculator,
  Clock
} from 'lucide-react';

interface LeaveSubmissionModalProps {
  currentUser: UserPersonnel;
  existingRequests: LeaveRequest[];
  stationConfig: StationConfig;
  holidays: HolidayItem[];
  onSubmit: (newRequest: LeaveRequest) => void;
  onClose: () => void;
}

export const LeaveSubmissionModal: React.FC<LeaveSubmissionModalProps> = ({
  currentUser,
  existingRequests,
  stationConfig,
  holidays,
  onSubmit,
  onClose
}) => {
  const [leaveType, setLeaveType] = useState<LeaveType>('vacation');
  const [startDate, setStartDate] = useState<string>('2026-11-16');
  const [endDate, setEndDate] = useState<string>('2026-11-20');
  const [period, setPeriod] = useState<LeavePeriod>('full_day');
  const [reason, setReason] = useState<string>('');
  const [contactAddress, setContactAddress] = useState<string>(currentUser.address || 'บ้านพักข้าราชการตำรวจ สภ.ศรีสงคราม');
  const [contactPhone, setContactPhone] = useState<string>(currentUser.phone || '061-313-7089');

  // Requirement 27: ผู้บังคับการตำรวจภูธรจังหวัดนครพนม หรือ ผกก.
  const [addressedToTitle, setAddressedToTitle] = useState<string>('ผู้กำกับการสถานีตำรวจภูธรศรีสงคราม');
  const [customCommanderName, setCustomCommanderName] = useState<string>(stationConfig.provincialCommanderName);

  // Requirement 20 & 29: ผู้ลาปฏิบัติหน้าที่ กำลัง... ลา... เหลือ...
  const [dutyDepartmentTitle, setDutyDepartmentTitle] = useState<string>(currentUser.department || 'งานอำนวยการ');
  const [totalDutyPersonnel, setTotalDutyPersonnel] = useState<number>(4);
  const [onLeavePersonnel, setOnLeavePersonnel] = useState<number>(1);
  const remainingDutyPersonnel = Math.max(0, totalDutyPersonnel - onLeavePersonnel);

  // Retroactive leave (Requirement 71)
  const [isRetroactive, setIsRetroactive] = useState<boolean>(false);
  const [retroactiveReason, setRetroactiveReason] = useState<string>('');

  // Special fields
  const [maternityWifeName, setMaternityWifeName] = useState<string>('');
  const [childDeliveryDate, setChildDeliveryDate] = useState<string>('');
  const [ordinationTemple, setOrdinationTemple] = useState<string>('');
  const [ordinationTempleAddress, setOrdinationTempleAddress] = useState<string>('');
  const [ordinationDate, setOrdinationDate] = useState<string>('');
  const [residenceTemple, setResidenceTemple] = useState<string>('');
  const [hasOrdainedBefore, setHasOrdainedBefore] = useState<boolean>(false);

  // Attachment (Requirement 44)
  const [attachmentName, setAttachmentName] = useState<string>('');

  // Overlap and validation states
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Calculate days
  const isContinuousType = leaveType === 'ordination' || leaveType === 'maternity';
  const computedDays = isContinuousType
    ? calculateCalendarDays(startDate, endDate)
    : calculateBusinessDays(startDate, endDate, holidays);

  const finalDays = period !== 'full_day' ? 0.5 : computedDays;

  // Check overlap on change
  useEffect(() => {
    if (!startDate || !endDate) return;

    const overlap = existingRequests.find(r => 
      r.userId === currentUser.id &&
      r.status !== 'cancelled' &&
      r.status !== 'rejected' &&
      checkDateOverlap(startDate, endDate, r.startDate, r.endDate)
    );

    if (overlap) {
      setOverlapWarning(`⚠️ คุณมีคำขอลาซ้ำซ้อนในช่วงวันที่นี้แล้ว (${overlap.requestNumber}: ${formatThaiDate(overlap.startDate)} ถึง ${formatThaiDate(overlap.endDate)})`);
    } else {
      setOverlapWarning(null);
    }

    // Check vacation quota
    if (leaveType === 'vacation') {
      const totalAllowed = currentUser.accumulatedVacationDays + currentUser.currentYearVacationDays;
      if (finalDays > totalAllowed) {
        setQuotaWarning(`⚠️ จำนวนวันลาพักผ่อน (${finalDays} วัน) เกินสิทธิคงเหลือที่มีอยู่ (${totalAllowed} วัน)`);
      } else {
        setQuotaWarning(null);
      }
    } else {
      setQuotaWarning(null);
    }
  }, [startDate, endDate, leaveType, period, existingRequests, currentUser, finalDays]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!reason.trim()) {
      setFormError('กรุณาระบุเหตุผลการลา');
      return;
    }

    if (isRetroactive && !retroactiveReason.trim()) {
      setFormError('กรณีขอยื่นลาย้อนหลัง กรุณาระบุเหตุผลความจำเป็นเร่งด่วน');
      return;
    }

    // Generate request number (Requirement 65)
    const reqNum = generateRequestNumber(existingRequests, stationConfig.currentFiscalYear);

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      requestNumber: reqNum,
      fiscalYear: stationConfig.currentFiscalYear,
      userId: currentUser.id,
      userRank: currentUser.rank,
      userFullName: `${currentUser.firstName} ${currentUser.lastName}`,
      userPosition: currentUser.position,
      department: currentUser.department,
      subDepartment: currentUser.subDepartment,
      leaveType,
      reason: reason.trim(),
      startDate,
      endDate,
      totalDays: finalDays,
      period,
      isRetroactive,
      retroactiveReason: retroactiveReason.trim(),
      contactAddress: contactAddress.trim(),
      contactPhone: contactPhone.trim(),

      addressedToTitle,
      customCommanderName: addressedToTitle.includes('ผู้บังคับการ') ? customCommanderName : undefined,

      dutyDepartmentTitle: dutyDepartmentTitle.trim(),
      totalDutyPersonnel,
      onLeavePersonnel,
      remainingDutyPersonnel,

      maternityWifeName: maternityWifeName.trim() || undefined,
      childDeliveryDate: childDeliveryDate || undefined,
      ordinationTemple: ordinationTemple.trim() || undefined,
      ordinationTempleAddress: ordinationTempleAddress.trim() || undefined,
      ordinationDate: ordinationDate || undefined,
      residenceTemple: residenceTemple.trim() || undefined,
      hasOrdainedBefore,

      attachmentName: attachmentName || (leaveType === 'sick' && finalDays >= 3 ? 'ใบรับรองแพทย์.pdf' : undefined),

      status: 'pending_supervisor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      timeline: [
        {
          status: 'pending_supervisor',
          updatedBy: `${currentUser.rank} ${currentUser.firstName} ${currentUser.lastName}`,
          timestamp: new Date().toLocaleString('th-TH'),
          comment: `ยื่นคำขอ${leaveType === 'vacation' ? 'ลาพักผ่อน' : 'ลา'} (${finalDays} วันทำการ)`
        }
      ]
    };

    onSubmit(newRequest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-red-900/20">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 via-rose-950 to-red-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <FileText className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold">ยื่นใบลาออนไลน์ สภ.ศรีสงคราม</h3>
              <p className="text-xs text-red-200">
                ผู้ยื่น: {currentUser.rank} {currentUser.firstName} {currentUser.lastName} ({currentUser.position})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm text-stone-800">
          
          {/* Form Error Banner */}
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 flex items-center gap-2 font-bold animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Warnings */}
          {overlapWarning && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{overlapWarning}</span>
            </div>
          )}

          {quotaWarning && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{quotaWarning}</span>
            </div>
          )}

          {/* Section 1: ประเภทการลา และ เรียนผู้บังคับบัญชา */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                ประเภทการลา (Leave Type) *
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-bold text-red-950 focus:ring-2 focus:ring-red-900"
              >
                <option value="vacation">🏖️ ลาพักผ่อน (มีวันสะสม ๑๔ วัน, สิทธิปีนี้ ๑๐ วัน)</option>
                <option value="sick">🤒 ลาป่วย (มีอาการเจ็บป่วย/พบแพทย์)</option>
                <option value="personal">💼 ลากิจส่วนตัว (ธุระจำเป็น)</option>
                <option value="childcare">👶 ลาเพื่อดูแลบุตรและภรรยาหลังคลอด</option>
                <option value="maternity">🤰 ลาคลอดบุตร</option>
                <option value="ordination">🙏 ลาอุปสมบท (บวชเรียน)</option>
                <option value="other">📋 ไปราชการ / ลาศึกษา</option>
              </select>
            </div>

            {/* Requirement 27: เพิ่มใบลาเฉพาะผู้กำกับ ผบก.ภ.จว.นครพนม ให้สามารถเปลี่ยนชื่อได้ หรือกรอกชื่อเองได้ */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                เรียน (เสนอใบลาต่อ) *
              </label>
              <select
                value={addressedToTitle}
                onChange={(e) => setAddressedToTitle(e.target.value)}
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-red-900"
              >
                <option value="ผู้กำกับการสถานีตำรวจภูธรศรีสงคราม">
                  ผู้กำกับการสถานีตำรวจภูธรศรีสงคราม (ผกก.สภ.ศรีสงคราม)
                </option>
                <option value="ผู้บังคับการตำรวจภูธรจังหวัดนครพนม">
                  ผู้บังคับการตำรวจภูธรจังหวัดนครพนม (ผบก.ภ.จว.นครพนม)
                </option>
              </select>

              {addressedToTitle.includes('ผู้บังคับการ') && (
                <div className="mt-2">
                  <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                    ชื่อ - นามสกุล ผบก.ภ.จว.นครพนม (กรอกเองหรือแก้ไขได้):
                  </label>
                  <input
                    type="text"
                    value={customCommanderName}
                    onChange={(e) => setCustomCommanderName(e.target.value)}
                    placeholder="เช่น อารักษ์ มะสาธานัง"
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 2: กำหนดวันที่ลา และช่วงเวลา */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-red-800" />
                <span>ตั้งแต่วันที่ *</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-red-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-red-800" />
                <span>ถึงวันที่ *</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-red-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-red-800" />
                <span>ช่วงเวลาการลา *</span>
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as LeavePeriod)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-900 font-bold"
              >
                <option value="full_day">เต็มวัน (Full Day)</option>
                <option value="half_morning">ครึ่งวันเช้า (Morning)</option>
                <option value="half_afternoon">ครึ่งวันบ่าย (Afternoon)</option>
              </select>
            </div>
          </div>

          {/* Summary of days computed automatically */}
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs sm:text-sm font-bold text-red-950">
            <span>คำนวณจำนวนวันลาอัตโนมัติ (หักเสาร์-อาทิตย์ และวันหยุดราชการ):</span>
            <span className="text-base font-black font-mono text-red-900 bg-white px-3 py-1 rounded-lg border border-red-200">
              {finalDays} วันทำการ
            </span>
          </div>

          {/* Section 3: เหตุผลความจำเป็น */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              เหตุผลความจำเป็นในการขอลา *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={2}
              placeholder="ระบุเหตุผลความจำเป็น เช่น พักผ่อนประจำปี, ป่วยมีไข้สูง, ไปติดต่อราชการส่วนตัวที่ต่างจังหวัด..."
              className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-900 text-sm"
            />
          </div>

          {/* Special fields for Childcare or Ordination */}
          {leaveType === 'childcare' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
              <div className="font-bold text-blue-950 text-xs sm:text-sm">
                ข้อมูลการลาเพื่อดูแลบุตรและภรรยาหลังคลอด:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">ภรรยาชื่อ *</label>
                  <input
                    type="text"
                    value={maternityWifeName}
                    onChange={(e) => setMaternityWifeName(e.target.value)}
                    placeholder="ชื่อ - นามสกุลภรรยา"
                    className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">คลอดเมื่อวันที่ *</label>
                  <input
                    type="date"
                    value={childDeliveryDate}
                    onChange={(e) => setChildDeliveryDate(e.target.value)}
                    className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {leaveType === 'ordination' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="font-bold text-emerald-950 text-xs sm:text-sm">
                ข้อมูลการขออนุญาตลาอุปสมบท:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">อุปสมบท ณ วัด *</label>
                  <input
                    type="text"
                    value={ordinationTemple}
                    onChange={(e) => setOrdinationTemple(e.target.value)}
                    placeholder="ชื่อวัดที่จะอุปสมบท"
                    className="w-full p-2 bg-white border border-emerald-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">กำหนดอุปสมบทวันที่ *</label>
                  <input
                    type="date"
                    value={ordinationDate}
                    onChange={(e) => setOrdinationDate(e.target.value)}
                    className="w-full p-2 bg-white border border-emerald-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">ตั้งอยู่ ณ</label>
                  <input
                    type="text"
                    value={ordinationTempleAddress}
                    onChange={(e) => setOrdinationTempleAddress(e.target.value)}
                    placeholder="ตำบล อำเภอ จังหวัด"
                    className="w-full p-2 bg-white border border-emerald-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Requirement 20, 24, 29: ผู้ลาปฏิบัติหน้าที่ มีกำลัง... ลา... เหลือ... ทำเป็นช่องให้กรอก */}
          <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-xs sm:text-sm">
              <Calculator className="w-4 h-4 text-amber-700" />
              <span>ข้อมูลกำลังพลปฏิบัติหน้าที่ประจำสายงาน (ตามแบบฟอร์มทางราชการ)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Requirement 29: ผู้ลาปฏิบัติหน้าที่ ให้ทำช่องไว้กรอกเอง ตามภาพ */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ผู้ลาปฏิบัติหน้าที่ (สายงาน) *
                </label>
                <input
                  type="text"
                  value={dutyDepartmentTitle}
                  onChange={(e) => setDutyDepartmentTitle(e.target.value)}
                  required
                  placeholder="เช่น งานอำนวยการ"
                  className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-red-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  มีกำลังปฏิบัติหน้าที่ (นาย) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalDutyPersonnel}
                  onChange={(e) => setTotalDutyPersonnel(Math.max(1, Number(e.target.value)))}
                  required
                  className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ลา (นาย) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={onLeavePersonnel}
                  onChange={(e) => setOnLeavePersonnel(Math.max(1, Number(e.target.value)))}
                  required
                  className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  เหลือกำลังปฏิบัติหน้าที่
                </label>
                <div className="w-full p-2 bg-stone-100 border border-stone-300 rounded-lg text-xs font-mono font-bold text-emerald-800 text-center">
                  {remainingDutyPersonnel} นาย
                </div>
              </div>
            </div>
          </div>

          {/* Section: Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-800" />
                <span>ในระหว่างลาติดต่อข้าพเจ้าได้ที่ *</span>
              </label>
              <input
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                required
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-red-800" />
                <span>เบอร์โทรศัพท์ติดต่อ *</span>
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs sm:text-sm focus:ring-2 focus:ring-red-900"
              />
            </div>
          </div>

          {/* Requirement 44: แนบเอกสาร ใบรับรองแพทย์ */}
          <div>
            <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-red-800" />
              <span>แนบเอกสารประกอบ (ใบรับรองแพทย์ / หนังสือส่งตัว / หลักฐานอื่น ๆ)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAttachmentName(file.name);
                }}
                className="text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-900 file:text-white hover:file:bg-red-800"
              />
              {attachmentName && (
                <span className="text-xs text-emerald-800 font-bold">
                  ✓ {attachmentName}
                </span>
              )}
            </div>
          </div>

          {/* Requirement 71: ยื่นลาย้อนหลัง */}
          <div className="pt-2 border-t border-stone-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRetroactive}
                onChange={(e) => setIsRetroactive(e.target.checked)}
                className="w-4 h-4 rounded text-red-800 focus:ring-red-900"
              />
              <span className="font-bold text-stone-800 text-xs">
                ยื่นคำขอลาย้อนหลัง (กรณีมีเหตุจำเป็นเร่งด่วน เช่น อุบัติเหตุหรือเจ็บป่วยฉุกเฉิน)
              </span>
            </label>

            {isRetroactive && (
              <div className="mt-2 pl-6">
                <input
                  type="text"
                  value={retroactiveReason}
                  onChange={(e) => setRetroactiveReason(e.target.value)}
                  placeholder="ระบุเหตุผลความจำเป็นที่ต้องยื่นย้อนหลัง..."
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs sm:text-sm font-bold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-red-900 hover:bg-red-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              ส่งใบลาออนไลน์
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
