import React from 'react';
import { LeaveRequest, StationConfig } from '../types/leave';
import { formatThaiDate, toThaiDigits, THAI_MONTHS } from '../utils/thaiDateUtils';
import { Printer, X } from 'lucide-react';

interface OfficialLeavePaperProps {
  request: LeaveRequest;
  stationConfig: StationConfig;
  onClose: () => void;
}

export const OfficialLeavePaper: React.FC<OfficialLeavePaperProps> = ({
  request,
  stationConfig,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Convert date parts for official Thai header
  const reqDate = new Date(request.createdAt);
  const day = reqDate.getDate();
  const month = THAI_MONTHS[reqDate.getMonth()];
  const year = reqDate.getFullYear() + 543;

  const startObj = new Date(request.startDate);
  const endObj = new Date(request.endDate);

  const startFormatted = `${startObj.getDate()} ${THAI_MONTHS[startObj.getMonth()]} ${startObj.getFullYear() + 543}`;
  const endFormatted = `${endObj.getDate()} ${THAI_MONTHS[endObj.getMonth()]} ${endObj.getFullYear() + 543}`;

  // Requirement 27: ผบก.ภ.จว.นครพนม หรือ ผกก.
  const addressedTo = request.addressedToTitle || 'ผู้กำกับการสถานีตำรวจภูธรศรีสงคราม';
  const isProvincial = addressedTo.includes('ผู้บังคับการ');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center p-2 sm:p-4 print:p-0 print:bg-white print:fixed print:inset-0 font-sarabunit9">
      <div 
        className="bg-white text-stone-900 w-full max-w-4xl rounded-xl shadow-2xl p-6 sm:p-10 my-auto print:m-0 print:p-0 print:shadow-none print:w-full print:max-w-none print-page font-sarabunit9"
        style={{ fontFamily: "'TH SarabunIT๙', 'TH Sarabun IT9', 'THSarabunIT9', 'TH Sarabun New', 'Sarabun', serif" }}
      >
        
        {/* Action Header (Hidden when printing) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-red-900">📄 พิมพ์เอกสารใบลาทางราชการ</span>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-mono">{request.requestNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-lg font-bold shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              พิมพ์เอกสาร (Print / PDF)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Content: 1:1 Match with Police Leave Forms */}
        <div className="text-[15px] sm:text-[16px] leading-relaxed text-black select-text">
          
          {/* Header Title */}
          <div className="text-center font-bold text-lg sm:text-xl mb-4">
            {request.leaveType === 'vacation' && 'แบบใบลาพักผ่อน'}
            {(request.leaveType === 'sick' || request.leaveType === 'maternity' || request.leaveType === 'personal') && 'แบบใบลาป่วย ลาคลอด ลากิจส่วนตัว'}
            {request.leaveType === 'childcare' && 'แบบใบลาเพื่อดูแลบุตรและภรรยาหลังคลอด'}
            {request.leaveType === 'ordination' && 'แบบใบลาอุปสมบท'}
            {request.leaveType === 'other' && 'แบบใบลาไปราชการ/อื่นๆ'}
          </div>

          {/* Place and Date */}
          <div className="flex justify-end mb-4">
            <div className="text-right space-y-1">
              <div>เขียนที่ <span className="border-b border-dotted border-stone-700 px-2">{stationConfig.stationName}</span></div>
              <div>วันที่ <span className="border-b border-dotted border-stone-700 px-2">{day}</span> เดือน <span className="border-b border-dotted border-stone-700 px-2">{month}</span> พ.ศ. <span className="border-b border-dotted border-stone-700 px-2">{year}</span></div>
            </div>
          </div>

          {/* Subject & Addressed to */}
          <div className="space-y-1.5 mb-3">
            <div>
              <span className="font-bold">เรื่อง</span>{' '}
              {request.leaveType === 'vacation' && 'ขออนุญาตลาพักผ่อน'}
              {request.leaveType === 'sick' && 'ขออนุญาตลาป่วย'}
              {request.leaveType === 'personal' && 'ขออนุญาตลากิจส่วนตัว'}
              {request.leaveType === 'maternity' && 'ขออนุญาตลาคลอด'}
              {request.leaveType === 'childcare' && 'ขออนุญาตลาเพื่อดูแลบุตรและภรรยาหลังคลอด'}
              {request.leaveType === 'ordination' && 'ขออนุญาตลาอุปสมบท'}
              {request.leaveType === 'other' && 'ขออนุญาตลา'}
            </div>
            <div>
              <span className="font-bold">เรียน</span>{' '}
              <span className="border-b border-dotted border-stone-700 px-2 font-semibold">
                {addressedTo}
              </span>
            </div>
          </div>

          {/* Content by Type */}
          {/* Requirement 28: ในหน้าใบลา ปรับให้ส่วนยศและชื่อ-นามสกุลแยกบรรทัดกัน ยกเว้นในส่วนหัวกระดาษของใบลาแต่ละประเภท ให้คงรูปแบบดั้งเดิมไว้สำหรับการพิมพ์ */}
          <div className="space-y-2 indent-8 text-justify">
            <div>
              ข้าพเจ้า <span className="border-b border-dotted border-stone-700 px-2 font-bold">{request.userRank} {request.userFullName}</span>
              ตำแหน่ง <span className="border-b border-dotted border-stone-700 px-2">{request.userPosition}</span>
            </div>
            <div className="indent-0">
              สังกัด <span className="border-b border-dotted border-stone-700 px-2">{stationConfig.stationName}</span>
              กองบังคับการ <span className="border-b border-dotted border-stone-700 px-2">{stationConfig.subdivision}</span>
              กองบัญชาการ <span className="border-b border-dotted border-stone-700 px-2">{stationConfig.division}</span>
            </div>

            {/* VACATION LEAVE BODY */}
            {request.leaveType === 'vacation' && (
              <>
                <div className="indent-0">
                  มีวันลาพักผ่อนสะสม <span className="border-b border-dotted border-stone-700 px-2">๑๔</span> วันทำการ 
                  มีสิทธิลาพักผ่อนประจำปีนี้อีก <span className="border-b border-dotted border-stone-700 px-2">๑๐</span> วันทำการ 
                  รวมเป็น <span className="border-b border-dotted border-stone-700 px-2">๒๔</span> วันทำการ
                </div>
                <div className="indent-0">
                  ขอลาพักผ่อนตั้งแต่วันที่ <span className="border-b border-dotted border-stone-700 px-2">{startFormatted}</span> 
                  ถึงวันที่ <span className="border-b border-dotted border-stone-700 px-2">{endFormatted}</span> 
                  มีกำหนด <span className="border-b border-dotted border-stone-700 px-2 font-bold">{request.totalDays}</span> วัน
                </div>
              </>
            )}

            {/* SICK / PERSONAL / MATERNITY LEAVE BODY */}
            {(request.leaveType === 'sick' || request.leaveType === 'personal' || request.leaveType === 'maternity') && (
              <>
                <div className="indent-0 flex flex-wrap items-center gap-3">
                  <span>ขออนุญาต</span>
                  <label className="inline-flex items-center gap-1 font-normal">
                    <span className="font-mono text-base">{request.leaveType === 'sick' ? '☑' : '☐'}</span> ลาป่วย
                  </label>
                  <label className="inline-flex items-center gap-1 font-normal">
                    <span className="font-mono text-base">{request.leaveType === 'maternity' ? '☑' : '☐'}</span> ลาคลอด
                  </label>
                  <label className="inline-flex items-center gap-1 font-normal">
                    <span className="font-mono text-base">{request.leaveType === 'personal' ? '☑' : '☐'}</span> ลากิจส่วนตัว
                  </label>
                </div>
                <div className="indent-0">
                  เนื่องจาก <span className="border-b border-dotted border-stone-700 px-2">{request.reason}</span>
                </div>
                <div className="indent-0">
                  ตั้งแต่วันที่ <span className="border-b border-dotted border-stone-700 px-2">{startFormatted}</span> ถึงวันที่ <span className="border-b border-dotted border-stone-700 px-2">{endFormatted}</span> มีกำหนด <span className="border-b border-dotted border-stone-700 px-2 font-bold">{request.totalDays}</span> วัน
                </div>
                <div className="indent-0">
                  ข้าพเจ้าได้ลา <span className="font-mono">☐</span> ป่วย <span className="font-mono">☐</span> คลอด <span className="font-mono">☐</span> กิจส่วนตัว ครั้งสุดท้าย ตั้งแต่วันที่ <span className="border-b border-dotted border-stone-700 px-2">-</span> ถึงวันที่ <span className="border-b border-dotted border-stone-700 px-2">-</span> มีกำหนด <span className="border-b border-dotted border-stone-700 px-2">-</span> วัน
                </div>
              </>
            )}

            {/* CHILDCARE LEAVE BODY */}
            {request.leaveType === 'childcare' && (
              <>
                <div className="indent-0">
                  ภรรยาชื่อ <span className="border-b border-dotted border-stone-700 px-2 font-bold">{request.maternityWifeName || '................................'}</span>
                  คลอดเมื่อ <span className="border-b border-dotted border-stone-700 px-2">{request.childDeliveryDate ? formatThaiDate(request.childDeliveryDate) : '................................'}</span>
                  มีความประสงค์ขอลาเพื่อดูแลบุตรและภรรยาหลังคลอด
                </div>
                <div className="indent-0">
                  ตั้งแต่วันที่ <span className="border-b border-dotted border-stone-700 px-2">{startFormatted}</span> 
                  ถึงวันที่ <span className="border-b border-dotted border-stone-700 px-2">{endFormatted}</span> 
                  มีกำหนด <span className="border-b border-dotted border-stone-700 px-2 font-bold">{request.totalDays}</span> วัน
                </div>
              </>
            )}

            {/* ORDINATION LEAVE BODY */}
            {request.leaveType === 'ordination' && (
              <>
                <div className="indent-0">
                  ข้าพเจ้า <span className="font-mono">☐</span> เคย <span className="font-mono">☐</span> ไม่เคย อุปสมบท บัดนี้มีศรัทธาจะอุปสมบทในพุทธศาสนา ณ วัด <span className="border-b border-dotted border-stone-700 px-2 font-bold">{request.ordinationTemple || '................................'}</span> ตั้งอยู่ ณ <span className="border-b border-dotted border-stone-700 px-2">{request.ordinationTempleAddress || '................................'}</span>
                </div>
                <div className="indent-0">
                  กำหนดอุปสมบท วันที่ <span className="border-b border-dotted border-stone-700 px-2">{request.ordinationDate ? formatThaiDate(request.ordinationDate) : '................................'}</span> และจะจำพรรษา ณ วัด <span className="border-b border-dotted border-stone-700 px-2">{request.residenceTemple || request.ordinationTemple || '................................'}</span>
                </div>
                <div className="indent-0">
                  จึงขอลาอุปสมบท มีกำหนด <span className="border-b border-dotted border-stone-700 px-2 font-bold">{request.totalDays}</span> วัน ตั้งแต่วันที่ <span className="border-b border-dotted border-stone-700 px-2">{startFormatted}</span> ถึงวันที่ <span className="border-b border-dotted border-stone-700 px-2">{endFormatted}</span>
                </div>
              </>
            )}

            {/* Contact info */}
            <div className="indent-0">
              ในระหว่างลาติดต่อข้าพเจ้าได้ที่ <span className="border-b border-dotted border-stone-700 px-2">{request.contactAddress}</span> 
              เบอร์โทรศัพท์ <span className="border-b border-dotted border-stone-700 px-2">{request.contactPhone}</span>
            </div>
          </div>

          {/* Signature of Requester */}
          <div className="flex justify-end my-5">
            <div className="text-center w-72 space-y-1">
              <div>ขอแสดงความนับถือ</div>
              <div className="pt-4">(ลงชื่อ) <span className="border-b border-dotted border-stone-700 px-4 font-bold">{request.userRank}</span></div>
              <div>( <span className="font-bold">{request.userFullName}</span> )</div>
              <div className="text-xs text-stone-700">ตำแหน่ง {request.userPosition}</div>
            </div>
          </div>

          <hr className="border-stone-400 my-4" />

          {/* Two-column lower section: Leave Statistics & Personnel on Duty vs Commander Opinion */}
          <div className="grid grid-cols-2 gap-6 pt-1 text-sm">
            
            {/* Left Column: สถิติการลา & ผู้ลาปฏิบัติหน้าที่ */}
            <div className="space-y-4">
              <div>
                <div className="font-bold mb-1">สถิติการลาในปีงบประมาณนี้</div>
                <table className="w-full border-collapse border border-black text-center text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-stone-50">
                      <th className="border border-black p-1">ลามาแล้ว<br/>(วันทำการ)</th>
                      <th className="border border-black p-1">ลาครั้งนี้<br/>(วันทำการ)</th>
                      <th className="border border-black p-1">รวมเป็น<br/>(วันทำการ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 font-mono">-</td>
                      <td className="border border-black p-2 font-bold font-mono">{toThaiDigits(request.totalDays)}</td>
                      <td className="border border-black p-2 font-bold font-mono">{toThaiDigits(request.totalDays)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Requirement 20, 24, 29 & Image 1: ผู้ลาปฏิบัติหน้าที่ กำลังปฏิบัติหน้าที่... นาย ลา... นาย เหลือกำลังปฏิบัติหน้าที่... นาย */}
              <div className="pt-2 space-y-1.5 text-xs sm:text-[14px]">
                <div>
                  <span>ผู้ลาปฏิบัติหน้าที่</span>{' '}
                  <span className="border-b border-dotted border-black px-4 font-semibold">
                    {request.dutyDepartmentTitle || request.department}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <span>มีกำลังปฏิบัติหน้าที่</span>
                  <span className="border-b border-dotted border-black px-3 font-semibold">
                    {toThaiDigits(request.totalDutyPersonnel || 4)}
                  </span>
                  <span>นาย</span>
                  <span className="ml-2">ลา</span>
                  <span className="border-b border-dotted border-black px-3 font-semibold">
                    {toThaiDigits(request.onLeavePersonnel || 1)}
                  </span>
                  <span>นาย</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>เหลือกำลังปฏิบัติหน้าที่</span>
                  <span className="border-b border-dotted border-black px-4 font-semibold">
                    {toThaiDigits(request.remainingDutyPersonnel || 3)}
                  </span>
                  <span>นาย</span>
                </div>
              </div>

              <div className="pt-3 text-center text-xs sm:text-[14px] space-y-1">
                <div>เพื่อโปรดพิจารณา</div>
                <div className="pt-2">
                  (ลงชื่อ) <span className="border-b border-dotted border-black px-4 font-semibold">{request.userRank} ................................</span>
                </div>
                <div>
                  ตำแหน่ง <span className="border-b border-dotted border-black px-2">{request.userPosition}</span>
                </div>
              </div>
            </div>

            {/* Right Column: ความเห็นผู้บังคับบัญชา & คำสั่ง */}
            <div className="space-y-4">
              <div>
                <div className="font-bold mb-1">ความเห็นของผู้บังคับบัญชา</div>
                <div className="pt-1 text-xs sm:text-[14px] min-h-[40px]">
                  <span className="border-b border-dotted border-black px-2 font-semibold">
                    {request.supervisorComment || 'เห็นควรอนุญาตให้ลาได้'}
                  </span>
                </div>
                <div className="text-center pt-3 text-xs sm:text-[14px] space-y-1">
                  <div>(ลงชื่อ) <span className="border-b border-dotted border-black px-3 font-semibold">{request.supervisorName || '...........................................'}</span></div>
                  <div>ตำแหน่ง สว.อก.สภ.ศรีสงคราม</div>
                  <div>วันที่ <span className="border-b border-dotted border-black px-2">{day} {month} {year}</span></div>
                </div>
              </div>

              <div className="border-t border-stone-400 pt-3">
                <div className="font-bold mb-1 flex items-center gap-4 text-xs sm:text-[14px]">
                  <span>คำสั่ง</span>
                  <span className="inline-flex items-center gap-1"><span className="font-mono text-base">{request.approverDecision === 'approved' || request.status === 'approved' ? '☑' : '☐'}</span> อนุญาต</span>
                  <span className="inline-flex items-center gap-1"><span className="font-mono text-base">{request.approverDecision === 'rejected' || request.status === 'rejected' ? '☑' : '☐'}</span> ไม่อนุญาต</span>
                </div>
                <div className="text-center pt-3 text-xs sm:text-[14px] space-y-1">
                  <div>(ลงชื่อ) <span className="border-b border-dotted border-black px-3 font-semibold">
                    {isProvincial 
                      ? (stationConfig.provincialCommanderRank + ' ' + (request.customCommanderName || stationConfig.provincialCommanderName))
                      : (stationConfig.superintendentRank + ' ' + stationConfig.superintendentName)}
                  </span></div>
                  <div>( <span className="font-semibold">{isProvincial ? (request.customCommanderName || stationConfig.provincialCommanderName) : stationConfig.superintendentName}</span> )</div>
                  <div>ตำแหน่ง {isProvincial ? stationConfig.provincialCommanderTitle : 'ผกก.สภ.ศรีสงคราม'}</div>
                  <div>วันที่ <span className="border-b border-dotted border-black px-2">{day} {month} {year}</span></div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
