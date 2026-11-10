import React, { useState } from 'react';
import { LeaveRequest, StationConfig, UserPersonnel } from '../types/leave';
import { formatThaiDate, getLeaveTypeLabel } from '../utils/thaiDateUtils';
import { OfficialLeavePaper } from './OfficialLeavePaper';
import { 
  X, 
  Printer, 
  Ban, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Phone, 
  MapPin, 
  ShieldAlert,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface LeaveDetailModalProps {
  request: LeaveRequest;
  currentUser: UserPersonnel;
  stationConfig: StationConfig;
  onClose: () => void;
  onApprove?: (requestId: string, comment?: string) => void;
  onReject?: (requestId: string, reason: string) => void;
  onCancel?: (requestId: string, reason: string) => void;
}

export const LeaveDetailModal: React.FC<LeaveDetailModalProps> = ({
  request,
  currentUser,
  stationConfig,
  onClose,
  onApprove,
  onReject,
  onCancel
}) => {
  const [showOfficialPrint, setShowOfficialPrint] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelBox, setShowCancelBox] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [formError, setFormError] = useState('');

  // Permission checks
  const isOwner = currentUser.id === request.userId;
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'commander';
  const canApprove =
    (currentUser.role === 'approver' || currentUser.role === 'commander' || currentUser.role === 'admin' || currentUser.role === 'supervisor') &&
    (request.status === 'pending_approver' || request.status === 'pending_supervisor' || request.status === 'pending_inspector');
  
  // Requirement 19 & 25: ปุ่ม 'ยกเลิกคำขอลา' สำหรับผู้ใช้ที่เป็นเจ้าของคำขอลา หรือผู้ดูแลระบบ
  const canCancel = (isOwner || isAdmin) && request.status !== 'cancelled';

  const handleConfirmCancel = () => {
    setFormError('');
    if (!cancelReason.trim()) {
      setFormError('กรุณาระบุเหตุผลในการยกเลิกคำขอลา');
      return;
    }
    if (onCancel) {
      onCancel(request.id, cancelReason);
      setShowCancelBox(false);
      onClose();
    }
  };

  const handleConfirmReject = () => {
    setFormError('');
    // Requirement 49: ระบุเหตุผลไม่อนุมัติ บังคับกรอกเหตุผล
    if (!rejectReason.trim()) {
      setFormError('⚠️ บังคับกรอกเหตุผลในการไม่อนุมัติ');
      return;
    }
    if (onReject) {
      onReject(request.id, rejectReason);
      setShowRejectBox(false);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-red-900/20">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-red-900 via-rose-950 to-red-900 text-white p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl">
                <FileText className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">รายละเอียดคำขอลา</h3>
                  <span className="text-xs bg-amber-400 text-red-950 px-2.5 py-0.5 rounded-full font-bold">
                    {request.requestNumber}
                  </span>
                </div>
                <p className="text-xs text-red-200 mt-0.5">
                  ปีงบประมาณ {request.fiscalYear} • สถานีตำรวจภูธรศรีสงคราม
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800">
            
            {/* Status Banner */}
            <div className={`p-4 rounded-xl flex items-center justify-between ${
              request.status === 'approved' ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' :
              request.status === 'rejected' ? 'bg-rose-50 border border-rose-200 text-rose-900' :
              request.status === 'cancelled' ? 'bg-stone-100 border border-stone-300 text-stone-700' :
              'bg-amber-50 border border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-3">
                {request.status === 'approved' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                {request.status === 'rejected' && <XCircle className="w-6 h-6 text-rose-600" />}
                {request.status === 'cancelled' && <Ban className="w-6 h-6 text-stone-500" />}
                {request.status.startsWith('pending') && <Clock className="w-6 h-6 text-amber-600 animate-spin" />}
                <div>
                  <div className="font-bold text-base">
                    {request.status === 'approved' && '✅ ได้รับการอนุมัติการลาแล้ว'}
                    {request.status === 'rejected' && '❌ คำขอลาไม่ได้รับการอนุมัติ'}
                    {request.status === 'cancelled' && '🚫 คำขอลานี้ยกเลิกแล้ว'}
                    {request.status === 'pending_approver' && '⏳ รอผู้มีอำนาจลงนามอนุมัติ (ผกก.)'}
                    {request.status === 'pending_supervisor' && '⏳ รอหัวหน้างานพิจารณา'}
                    {request.status === 'pending_inspector' && '⏳ รอผู้ตรวจสอบเอกสาร'}
                  </div>
                  {request.rejectionReason && (
                    <p className="text-xs text-rose-700 mt-1">เหตุผล: {request.rejectionReason}</p>
                  )}
                  {request.cancellationReason && (
                    <p className="text-xs text-stone-600 mt-1">เหตุผลที่ยกเลิก: {request.cancellationReason} (โดย {request.cancelledBy})</p>
                  )}
                </div>
              </div>

              {/* Print Official Button */}
              <button
                onClick={() => setShowOfficialPrint(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold shadow-xs hover:bg-stone-50 text-red-900 transition-colors"
              >
                <Printer className="w-4 h-4 text-red-700" />
                ใบลาฉบับทางการ
              </button>
            </div>

            {/* Officer Information (Requirement 28: ยศ และ ชื่อ-นามสกุล แยกบรรทัดกันในการแสดงผลหน้าจอ) */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-stone-500 font-normal">ยศ</span>
                <div className="text-lg font-black text-red-900">{request.userRank}</div>
                <span className="text-xs text-stone-500 font-normal mt-1 block">ชื่อ - นามสกุล</span>
                <div className="text-base font-bold text-stone-900">{request.userFullName}</div>
              </div>
              <div className="space-y-1">
                <div>
                  <span className="text-xs text-stone-500 font-normal">ตำแหน่ง</span>
                  <div className="text-sm font-bold text-stone-800">{request.userPosition}</div>
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-normal">สายงาน / สายงานย่อย</span>
                  <div className="text-sm font-semibold text-stone-700">{request.department} • {request.subDepartment}</div>
                </div>
              </div>
            </div>

            {/* Leave Details */}
            <div className="space-y-3">
              <h4 className="font-bold text-base text-red-950 flex items-center gap-2 border-b border-stone-200 pb-2">
                <span>📋 ข้อมูลการลา</span>
                <span className="text-xs bg-red-100 text-red-900 px-2 py-0.5 rounded-full font-bold">
                  {getLeaveTypeLabel(request.leaveType)}
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <span className="text-xs text-stone-500">ตั้งแต่วันที่</span>
                  <div className="font-bold text-stone-800">{formatThaiDate(request.startDate)}</div>
                </div>
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <span className="text-xs text-stone-500">ถึงวันที่</span>
                  <div className="font-bold text-stone-800">{formatThaiDate(request.endDate)}</div>
                </div>
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <span className="text-xs text-stone-500">จำนวนวันลา</span>
                  <div className="font-bold text-red-900 text-lg">{request.totalDays} วัน</div>
                  <span className="text-xs text-stone-500 font-normal">
                    {request.period === 'full_day' ? 'เต็มวัน' : request.period === 'half_morning' ? 'ครึ่งวันเช้า' : 'ครึ่งวันบ่าย'}
                  </span>
                </div>
              </div>

              {/* Reason */}
              <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-200">
                <span className="text-xs text-stone-500 font-normal block mb-1">เหตุผลความจำเป็น</span>
                <p className="text-sm text-stone-800 leading-relaxed font-semibold">{request.reason}</p>
              </div>

              {/* Requirement 20 & 29: ผู้ลาปฏิบัติหน้าที่ มีกำลัง... ลา... เหลือ... */}
              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-950 mb-2">
                  <UserCheck className="w-4 h-4 text-amber-700" />
                  <span>กำลังพลปฏิบัติหน้าที่ ณ สายงาน</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-stone-500 block">สายงานปฏิบัติ</span>
                    <span className="font-bold text-stone-800">{request.dutyDepartmentTitle || request.department}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">กำลังปฏิบัติหน้าที่</span>
                    <span className="font-bold text-blue-700 text-sm">{request.totalDutyPersonnel} นาย</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">ลา</span>
                    <span className="font-bold text-amber-700 text-sm">{request.onLeavePersonnel} นาย</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">เหลือกำลังปฏิบัติหน้าที่</span>
                    <span className="font-bold text-emerald-700 text-sm">{request.remainingDutyPersonnel} นาย</span>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="flex flex-col sm:flex-row gap-4 p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-800 shrink-0" />
                  <span><strong className="text-stone-700">ที่ติดต่อระหว่างลา:</strong> {request.contactAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-800 shrink-0" />
                  <span><strong className="text-stone-700">เบอร์โทร:</strong> {request.contactPhone}</span>
                </div>
              </div>

              {/* Attachments if any */}
              {request.attachmentName && (
                <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span>เอกสารแนบ: <strong>{request.attachmentName}</strong></span>
                </div>
              )}
            </div>

            {/* Requirement 51: Timeline การอนุมัติ แสดงว่าใบลาอยู่ที่ใคร ผ่านขั้นตอนไหนแล้ว */}
            <div>
              <h4 className="font-bold text-sm text-red-950 mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-red-800" />
                <span>เส้นทางการพิจารณาและประวัติขั้นตอน (Approval Timeline)</span>
              </h4>
              <div className="space-y-3 relative pl-4 border-l-2 border-red-900/20">
                {request.timeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-red-800 ring-4 ring-white" />
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">
                          {item.status === 'approved' ? 'อนุมัติแล้ว' :
                           item.status === 'rejected' ? 'ไม่อนุมัติ' :
                           item.status === 'cancelled' ? 'ยกเลิกคำขอ' :
                           'ส่งต่อ/ยื่นคำขอ'}
                        </span>
                        <span className="text-stone-400">• {item.timestamp}</span>
                      </div>
                      <div className="text-stone-600 mt-0.5">
                        โดย <span className="font-semibold text-stone-800">{item.updatedBy}</span>
                        {item.comment && <span className="italic ml-2">"{item.comment}"</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reject Form Box if active */}
            {showRejectBox && (
              <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  <span>ระบุเหตุผลในการไม่อนุมัติ (บังคับกรอก)</span>
                </div>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="กรุณาระบุเหตุผลอย่างละเอียด..."
                  className="w-full p-2.5 bg-white border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  rows={2}
                />
                {formError && (
                  <div className="p-2 bg-rose-100 text-rose-800 text-xs rounded-lg font-bold">
                    {formError}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setShowRejectBox(false); setFormError(''); }}
                    className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200 rounded-lg"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleConfirmReject}
                    className="px-4 py-1.5 text-xs bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg shadow-xs"
                  >
                    ยืนยันไม่อนุมัติ
                  </button>
                </div>
              </div>
            )}

            {/* Cancel Form Box if active */}
            {showCancelBox && (
              <div className="p-4 bg-stone-100 border border-stone-300 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-stone-800 font-bold text-sm">
                  <Ban className="w-4 h-4 text-red-700" />
                  <span>ระบุเหตุผลในการยกเลิกคำขอลา</span>
                </div>
                <textarea
                  value={cancelReason}
                  onChange={(e) => { setCancelReason(e.target.value); setFormError(''); }}
                  placeholder="ระบุเหตุผลที่ขอยกเลิกลา เช่น ภารกิจเร่งด่วน, เปลี่ยนแปลงกำหนดการ..."
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-900"
                  rows={2}
                />
                {formError && (
                  <div className="p-2 bg-rose-100 text-rose-800 text-xs rounded-lg font-bold">
                    {formError}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setShowCancelBox(false); setFormError(''); }}
                    className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200 rounded-lg"
                  >
                    ปิด
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    className="px-4 py-1.5 text-xs bg-red-900 hover:bg-red-800 text-white font-bold rounded-lg shadow-xs"
                  >
                    ยืนยันยกเลิกคำขอลา
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer Actions */}
          <div className="bg-stone-100 p-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Requirement 19: ปุ่ม 'ยกเลิกคำขอลา' */}
              {canCancel && !showCancelBox && (
                <button
                  onClick={() => setShowCancelBox(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-bold transition-colors"
                >
                  <Ban className="w-4 h-4 text-rose-600" />
                  ยกเลิกคำขอลา
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Approval Buttons for authorized approvers */}
              {canApprove && !showRejectBox && (
                <>
                  <button
                    onClick={() => setShowRejectBox(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold rounded-xl text-xs transition-colors"
                  >
                    <XCircle className="w-4 h-4 text-rose-700" />
                    ไม่อนุมัติ
                  </button>
                  <button
                    onClick={() => {
                      if (onApprove) {
                        onApprove(request.id, approvalComment);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    อนุมัติคำขอลา
                  </button>
                </>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Official Leave Paper View */}
      {showOfficialPrint && (
        <OfficialLeavePaper
          request={request}
          stationConfig={stationConfig}
          onClose={() => setShowOfficialPrint(false)}
        />
      )}
    </>
  );
};
