import React from 'react';
import { StationConfig, UserPersonnel, LeaveRequest } from '../types/leave';
import { getCurrentThaiDateTimeString, toThaiDigits } from '../utils/thaiDateUtils';
import { Printer, X, Shield, FileCheck } from 'lucide-react';

interface DutySummaryPrintModalProps {
  stationConfig: StationConfig;
  totalPersonnelCount: number;
  dutyPersonnelCount: number;
  onLeavePersonnelCount: number;
  remainingDutyCount: number;
  currentlyOnLeave: LeaveRequest[];
  onClose: () => void;
}

export const DutySummaryPrintModal: React.FC<DutySummaryPrintModalProps> = ({
  stationConfig,
  totalPersonnelCount,
  dutyPersonnelCount,
  onLeavePersonnelCount,
  remainingDutyCount,
  currentlyOnLeave,
  onClose
}) => {
  const currentThai = getCurrentThaiDateTimeString();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 my-auto print:m-0 print:p-0 print:shadow-none print:w-full font-serif text-black">
        
        {/* Modal Controls (Hidden when printing) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200 no-print">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-red-900" />
            <h3 className="font-bold text-lg text-red-950">
              รายงานสรุปกำลังพลปฏิบัติหน้าที่เสนอผู้กำกับการ
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              พิมพ์ / บันทึก PDF (Print to PDF)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document */}
        <div className="space-y-4 text-sm leading-relaxed select-text">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="flex justify-center mb-2">
              <img 
                src="/assets/aistudio/att.TGdvWeI4dBEqtfWEtx0TjY1ya3T8Gl5qxlKsxDfGhFs_4c676f59.jpeg" 
                alt="Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <div className="font-black text-base sm:text-lg">รายงานสถานภาพกำลังพลปฏิบัติหน้าที่และการลา</div>
            <div className="font-bold text-stone-800">{stationConfig.stationName} {stationConfig.subdivision}</div>
            <div className="text-xs text-stone-600">
              ประจำ{currentThai.fullThaiDateStr} (เวลา {currentThai.timeStr})
            </div>
          </div>

          <hr className="border-stone-400 my-3" />

          {/* Section 1: ยอดสรุปกำลังพล */}
          <div>
            <div className="font-bold text-sm mb-2 underline">๑. ข้อมูลสรุปกำลังพลประจำวัน</div>
            <table className="w-full border-collapse border border-black text-center text-xs sm:text-sm">
              <thead className="bg-stone-100 font-bold">
                <tr>
                  <th className="border border-black p-2">จำนวนข้าราชการตำรวจทั้งหมด</th>
                  <th className="border border-black p-2">กำลังปฏิบัติหน้าที่ (จัดเวร)</th>
                  <th className="border border-black p-2">ข้าราชการตำรวจที่ลา</th>
                  <th className="border border-black p-2 bg-stone-200">เหลือกำลังปฏิบัติหน้าที่จริง</th>
                  <th className="border border-black p-2">ร้อยละความพร้อม</th>
                </tr>
              </thead>
              <tbody className="font-bold">
                <tr>
                  <td className="border border-black p-3 font-mono">{toThaiDigits(totalPersonnelCount)} นาย</td>
                  <td className="border border-black p-3 font-mono text-blue-900">{toThaiDigits(dutyPersonnelCount)} นาย</td>
                  <td className="border border-black p-3 font-mono text-amber-900">{toThaiDigits(onLeavePersonnelCount)} นาย</td>
                  <td className="border border-black p-3 font-mono text-emerald-900 bg-stone-50">{toThaiDigits(remainingDutyCount)} นาย</td>
                  <td className="border border-black p-3 font-mono">
                    {toThaiDigits(dutyPersonnelCount > 0 ? Math.round((remainingDutyCount / dutyPersonnelCount) * 100) : 100)} %
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: รายชื่อผู้ลาประจำวัน */}
          <div className="pt-2">
            <div className="font-bold text-sm mb-2 underline">๒. รายชื่อข้าราชการตำรวจที่ได้รับอนุญาตให้ลาในวันนี้ ({onLeavePersonnelCount} นาย)</div>
            {currentlyOnLeave.length === 0 ? (
              <div className="p-4 border border-dashed border-stone-300 rounded text-center text-stone-500 italic text-xs">
                - ไม่มีข้าราชการตำรวจลาในวันนี้ กำลังพลพร้อมปฏิบัติหน้าที่ครบถ้วน -
              </div>
            ) : (
              <table className="w-full border-collapse border border-black text-left text-xs">
                <thead className="bg-stone-100 text-center font-bold">
                  <tr>
                    <th className="border border-black p-1.5 w-12">ลำดับ</th>
                    <th className="border border-black p-1.5">ยศ - ชื่อ - สกุล</th>
                    <th className="border border-black p-1.5">ตำแหน่ง / สังกัด</th>
                    <th className="border border-black p-1.5">ประเภทการลา</th>
                    <th className="border border-black p-1.5">กำหนดวันลา</th>
                    <th className="border border-black p-1.5">เบอร์โทรติดต่อ</th>
                  </tr>
                </thead>
                <tbody>
                  {currentlyOnLeave.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="border border-black p-2 text-center font-mono">{toThaiDigits(idx + 1)}</td>
                      <td className="border border-black p-2 font-bold">{item.userRank} {item.userFullName}</td>
                      <td className="border border-black p-2">{item.userPosition} ({item.department})</td>
                      <td className="border border-black p-2 font-semibold">
                        {item.leaveType === 'vacation' && 'ลาพักผ่อน'}
                        {item.leaveType === 'sick' && 'ลาป่วย'}
                        {item.leaveType === 'personal' && 'ลากิจส่วนตัว'}
                        {item.leaveType === 'childcare' && 'ลาเลี้ยงดูบุตร'}
                        {item.leaveType === 'maternity' && 'ลาคลอด'}
                        {item.leaveType === 'ordination' && 'ลาอุปสมบท'}
                        {item.leaveType === 'other' && 'ไปราชการ/อื่นๆ'}
                      </td>
                      <td className="border border-black p-2">{item.startDate} ถึง {item.endDate} ({item.totalDays} วัน)</td>
                      <td className="border border-black p-2 font-mono">{item.contactPhone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Section 3: เสนอผู้บังคับบัญชาลงนาม */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-1">
              <div>จึงเรียนมาเพื่อโปรดทราบ</div>
              <div className="pt-5">(ลงชื่อ) ..................................................... ผู้รายงาน</div>
              <div className="pt-1 font-bold">
                ( พ.ต.ท. สมชาย ใจดี )
              </div>
              <div>รอง ผกก.ป.สภ.ศรีสงคราม</div>
              <div>วันที่ {currentThai.dateStr}</div>
            </div>

            <div className="space-y-1">
              <div>ทราบ / อนุญาต</div>
              <div className="pt-5">(ลงชื่อ) ..................................................... ผู้กำกับการ</div>
              <div className="pt-1 font-bold">
                ( {stationConfig.superintendentRank} {stationConfig.superintendentName} )
              </div>
              <div>ผกก.สภ.ศรีสงคราม</div>
              <div>วันที่ .....................................................</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
