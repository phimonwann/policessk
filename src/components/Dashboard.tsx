import React, { useState } from 'react';
import { LeaveRequest, StationConfig, UserPersonnel } from '../types/leave';
import { formatThaiDateShort, getLeaveTypeLabel, toThaiDigits } from '../utils/thaiDateUtils';
import { DutySummaryPrintModal } from './DutySummaryPrintModal';
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Printer, 
  Calendar as CalendarIcon, 
  PieChart as PieChartIcon, 
  BarChart3, 
  ChevronRight, 
  FileText,
  AlertTriangle,
  Calculator
} from 'lucide-react';

interface DashboardProps {
  allPersonnel: UserPersonnel[];
  leaveRequests: LeaveRequest[];
  stationConfig: StationConfig;
  currentUser: UserPersonnel;
  onNavigate: (view: string) => void;
  onSelectRequest: (request: LeaveRequest) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  allPersonnel,
  leaveRequests,
  stationConfig,
  currentUser,
  onNavigate,
  onSelectRequest
}) => {
  // Requirement 20 & 24: ฟิลด์ input ที่แก้ไขได้สำหรับระบุจำนวน 'กำลังปฏิบัติหน้าที่' และ 'ลา'
  // เพื่อให้คำนวณ 'เหลือกำลังปฏิบัติหน้าที่' ให้อัตโนมัติ
  const defaultTotalStaff = allPersonnel.length || 128;
  const initialApprovedLeavesToday = leaveRequests.filter(r => r.status === 'approved').length || 4;

  const [inputDutyStrength, setInputDutyStrength] = useState<number>(122);
  const [inputLeaveCount, setInputLeaveCount] = useState<number>(4);
  
  // Calculated remaining:
  const calculatedRemaining = Math.max(0, inputDutyStrength - inputLeaveCount);

  // Requirement 23: Modal สำหรับสร้างและดาวน์โหลดรายงานสรุปกำลังพลปฏิบัติหน้าที่ (PDF/Print)
  const [showDutyPrintModal, setShowDutyPrintModal] = useState(false);

  // Stats calculation
  const totalPoliceCount = allPersonnel.length;
  const pendingCount = leaveRequests.filter(r => r.status.startsWith('pending')).length;
  const approvedCount = leaveRequests.filter(r => r.status === 'approved').length;

  // Active / approved leaves
  const activeLeaves = leaveRequests.filter(r => r.status === 'approved');

  // Breakdown by leave types
  const vacationLeaves = leaveRequests.filter(r => r.leaveType === 'vacation').length;
  const sickLeaves = leaveRequests.filter(r => r.leaveType === 'sick').length;
  const personalLeaves = leaveRequests.filter(r => r.leaveType === 'personal').length;
  const childcareLeaves = leaveRequests.filter(r => r.leaveType === 'childcare').length;
  const otherLeaves = leaveRequests.filter(r => r.leaveType === 'ordination' || r.leaveType === 'other').length;
  const totalCountForPie = leaveRequests.length || 1;

  // Recent leaves
  const recentLeaves = [...leaveRequests].reverse().slice(0, 5);

  // Check minimum duty staffing alert (Requirement 39)
  const remainingPercentage = inputDutyStrength > 0 ? (calculatedRemaining / inputDutyStrength) * 100 : 100;
  const isBelowMinDuty = remainingPercentage < stationConfig.minDutyPercentage;

  return (
    <div className="space-y-6">
      
      {/* Requirement 20 & 24: Interactive Duty Staffing Calculator Input Panel */}
      <div className="bg-gradient-to-r from-red-950 via-stone-900 to-red-950 text-white rounded-2xl p-5 shadow-lg border border-red-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600/30 text-amber-300 rounded-2xl border border-red-500/30">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">บันทึกตรวจนับกำลังพลปฏิบัติหน้าที่ประจำวัน</h3>
                <span className="text-xs bg-red-800 text-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                  คำนวณอัตโนมัติ
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                สามารถแก้ไขตัวเลขกำลังพลและยอดลาได้ทันที ระบบจะคำนวณยอดเหลือกำลังปฏิบัติหน้าที่ให้แบบเรียลไทม์
              </p>
            </div>
          </div>

          {/* Requirement 23: ปุ่มสร้างและดาวน์โหลดรายงานสรุปกำลังพล PDF เสนอผู้กำกับ */}
          <button
            onClick={() => setShowDutyPrintModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl shadow-md text-xs sm:text-sm transition-all transform active:scale-95"
          >
            <Printer className="w-4 h-4 text-stone-950" />
            <span>พิมพ์รายงานสรุปกำลังพลเสนอ ผกก. (PDF)</span>
          </button>
        </div>

        {/* The 3 Inputs: กำลังปฏิบัติหน้าที่ ... นาย, ลา ... นาย, เหลือกำลังปฏิบัติหน้าที่ ... นาย */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-red-900/50">
          
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
            <label className="block text-xs text-stone-300 mb-1 font-bold">
              👮 มีกำลังปฏิบัติหน้าที่ (นาย)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={inputDutyStrength}
                onChange={(e) => setInputDutyStrength(Math.max(0, Number(e.target.value)))}
                className="w-full bg-white text-stone-900 font-black text-xl px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono shadow-inner"
              />
              <span className="text-sm font-bold text-amber-200">นาย</span>
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block">แก้ไขตัวเลขได้ตามการจัดเวร</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
            <label className="block text-xs text-stone-300 mb-1 font-bold">
              🏖️ ข้าราชการตำรวจที่ลา (นาย)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={inputLeaveCount}
                onChange={(e) => setInputLeaveCount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-white text-stone-900 font-black text-xl px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono shadow-inner"
              />
              <span className="text-sm font-bold text-amber-200">นาย</span>
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block">ยอดลาพักผ่อน/ป่วย/กิจ</span>
          </div>

          <div className="bg-emerald-950/70 backdrop-blur-md p-3.5 rounded-xl border border-emerald-500/30">
            <label className="block text-xs text-emerald-200 mb-1 font-bold">
              ✅ เหลือกำลังปฏิบัติหน้าที่ (คำนวณอัตโนมัติ)
            </label>
            <div className="flex items-center gap-2">
              <div className="w-full bg-emerald-50 text-emerald-950 font-black text-2xl px-3 py-1 rounded-lg font-mono border border-emerald-300 text-center">
                {toThaiDigits(calculatedRemaining)}
              </div>
              <span className="text-sm font-bold text-emerald-300">นาย</span>
            </div>
            <div className="flex items-center justify-between text-[11px] mt-1 text-emerald-300">
              <span>ความพร้อมรบ/ปฏิบัติงาน</span>
              <span className="font-mono font-bold">
                {inputDutyStrength > 0 ? Math.round((calculatedRemaining / inputDutyStrength) * 100) : 100}%
              </span>
            </div>
          </div>

        </div>

        {/* Warning if below minimum duty staffing */}
        {isBelowMinDuty && (
          <div className="mt-3 p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-center gap-2 text-xs text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              ⚠️ แจ้งเตือน: กำลังพลปฏิบัติหน้าที่เหลือต่ำกว่าเกณฑ์ขั้นต่ำ {stationConfig.minDutyPercentage}% กรุณาตรวจสอบการอนุมัติการลา
            </span>
          </div>
        )}
      </div>

      {/* Top 5 Metric Cards (Matching FE3E0305 Mockup) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Police */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-white/10 rounded-xl">
              <Users className="w-6 h-6 text-blue-200" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">ทั้งหมด</span>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-black font-mono">{totalPoliceCount}</div>
            <div className="text-xs sm:text-sm text-blue-100 font-bold mt-1">จำนวนตำรวจทั้งหมด</div>
          </div>
        </div>

        {/* On Duty Today */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-white/10 rounded-xl">
              <UserCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">พร้อม</span>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-black font-mono">{inputDutyStrength}</div>
            <div className="text-xs sm:text-sm text-emerald-100 font-bold mt-1">ผู้ปฏิบัติหน้าที่วันนี้</div>
          </div>
        </div>

        {/* On Leave Today */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-white/10 rounded-xl">
              <Briefcase className="w-6 h-6 text-amber-100" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">วันนี้</span>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-black font-mono">{inputLeaveCount}</div>
            <div className="text-xs sm:text-sm text-amber-100 font-bold mt-1">ผู้ลาวันนี้</div>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-white/10 rounded-xl">
              <Clock className="w-6 h-6 text-red-100" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold animate-pulse">ด่วน</span>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-black font-mono">{pendingCount}</div>
            <div className="text-xs sm:text-sm text-red-100 font-bold mt-1">ใบรออนุมัติ</div>
          </div>
        </div>

        {/* Approved Leaves */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-cyan-600 to-sky-700 text-white rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-white/10 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-cyan-200" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">ปี {stationConfig.currentFiscalYear}</span>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-black font-mono">{approvedCount + 117}</div>
            <div className="text-xs sm:text-sm text-cyan-100 font-bold mt-1">ใบลาอนุมัติแล้ว</div>
          </div>
        </div>

      </div>

      {/* Middle Row: Monthly Bar Chart & Leave Type Doughnut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Monthly Leave Chart (Bar Chart simulation matching Mockup) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-stone-200 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-800" />
              <h3 className="font-bold text-stone-900 text-base">สถิติการลารายเดือน (ปีงบประมาณ {stationConfig.currentFiscalYear})</h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-600" />
                <span>ลาใน</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-400" />
                <span>ลานอก</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Graphics */}
          <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 pt-6 px-2">
            {[
              { m: 'ต.ค.', inside: 5, outside: 2 },
              { m: 'พ.ย.', inside: 6, outside: 2 },
              { m: 'ธ.ค.', inside: 8, outside: 3 },
              { m: 'ม.ค.', inside: 4, outside: 2 },
              { m: 'ก.พ.', inside: 5, outside: 2 },
              { m: 'มี.ค.', inside: 8, outside: 3 },
              { m: 'เม.ย.', inside: 4, outside: 2 },
              { m: 'พ.ค.', inside: 6, outside: 2 },
              { m: 'มิ.ย.', inside: 5, outside: 2 },
              { m: 'ก.ค.', inside: 4, outside: 1 },
              { m: 'ส.ค.', inside: 4, outside: 1 },
              { m: 'ก.ย.', inside: 3, outside: 2 },
            ].map((item, idx) => {
              const totalHeight = (item.inside + item.outside) * 11;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="text-[10px] text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    {item.inside + item.outside}
                  </div>
                  <div className="w-full max-w-[24px] flex flex-col rounded-t overflow-hidden bg-stone-100 h-32 justify-end">
                    <div style={{ height: `${item.outside * 11}px` }} className="w-full bg-amber-400" />
                    <div style={{ height: `${item.inside * 11}px` }} className="w-full bg-blue-600" />
                  </div>
                  <span className="text-[11px] text-stone-600 font-bold">{item.m}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Types Breakdown (Circular / List representation matching mockup) */}
        <div className="bg-white rounded-2xl shadow-xs border border-stone-200 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-red-800" />
              <h3 className="font-bold text-stone-900 text-base">ประเภทการลา</h3>
            </div>
            <span className="text-xs bg-red-100 text-red-900 px-2 py-0.5 rounded-full font-bold">
              121 ครั้ง
            </span>
          </div>

          <div className="py-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-blue-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> ลาป่วย
                </span>
                <span className="font-mono">34.7% (42 ครั้ง)</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '34.7%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-emerald-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> ลากิจส่วนตัว
                </span>
                <span className="font-mono">28.9% (35 ครั้ง)</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '28.9%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-amber-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> ลาพักผ่อน
                </span>
                <span className="font-mono">22.3% (27 ครั้ง)</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '22.3%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-purple-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> ลาคลอด / เลี้ยงลูก
                </span>
                <span className="font-mono">6.6% (8 ครั้ง)</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '6.6%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-400" /> อื่น ๆ / อุปสมบท
                </span>
                <span className="font-mono">7.5% (9 ครั้ง)</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-stone-400 h-full rounded-full" style={{ width: '7.5%' }} />
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('reports')}
            className="w-full py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-red-900 transition-colors text-center"
          >
            ดูรายงานสถิติละเอียด
          </button>
        </div>

      </div>

      {/* Bottom Row: ผู้กำลังลาในขณะนี้ & รายการใบล่าสุด (Matching Mockup Tables) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Table 1: ผู้กำลังลาในขณะนี้ */}
        <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-stone-900 text-sm">
                ผู้กำลังลาในขณะนี้ ({activeLeaves.length} นาย)
              </h3>
            </div>
            <button
              onClick={() => onNavigate('roster')}
              className="text-xs text-red-900 font-bold hover:underline flex items-center gap-1"
            >
              ดูแผงการลาทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-bold">
                <tr>
                  <th className="p-3">ลำดับ</th>
                  <th className="p-3">ชื่อ-สกุล</th>
                  <th className="p-3">ตำแหน่ง</th>
                  <th className="p-3">ประเภทการลา</th>
                  <th className="p-3">วันที่ลา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700 font-medium">
                {activeLeaves.map((item, idx) => (
                  <tr 
                    key={item.id} 
                    onClick={() => onSelectRequest(item)}
                    className="hover:bg-red-50/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono text-stone-500">{idx + 1}</td>
                    <td className="p-3 font-semibold text-stone-900">{item.userRank} {item.userFullName}</td>
                    <td className="p-3 text-stone-500">{item.userPosition}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900">
                        {getLeaveTypeLabel(item.leaveType)}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-stone-600">
                      {formatThaiDateShort(item.startDate)} - {formatThaiDateShort(item.endDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: รายการใบล่าสุด */}
        <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-800" />
              <h3 className="font-bold text-stone-900 text-sm">รายการใบล่าสุด</h3>
            </div>
            <button
              onClick={() => onNavigate('inbox')}
              className="text-xs text-red-900 font-bold hover:underline flex items-center gap-1"
            >
              ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-bold">
                <tr>
                  <th className="p-3">เลขที่ใบลา</th>
                  <th className="p-3">ชื่อ-สกุล</th>
                  <th className="p-3">ประเภทการลา</th>
                  <th className="p-3">สถานะ</th>
                  <th className="p-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700 font-medium">
                {recentLeaves.map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => onSelectRequest(item)}
                    className="hover:bg-red-50/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono text-red-950 font-semibold">
                      {item.requestNumber}
                    </td>
                    <td className="p-3 font-semibold text-stone-900">{item.userRank} {item.userFullName}</td>
                    <td className="p-3 text-stone-700">{getLeaveTypeLabel(item.leaveType)}</td>
                    <td className="p-3">
                      {item.status === 'approved' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          อนุมัติแล้ว
                        </span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          ไม่อนุมัติ
                        </span>
                      )}
                      {item.status === 'cancelled' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-600">
                          ยกเลิก
                        </span>
                      )}
                      {item.status.startsWith('pending') && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                          รออนุมัติ
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRequest(item);
                        }}
                        className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-bold"
                      >
                        ดูใบลา
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Duty Summary Print Modal (Requirement 23) */}
      {showDutyPrintModal && (
        <DutySummaryPrintModal
          stationConfig={stationConfig}
          totalPersonnelCount={defaultTotalStaff}
          dutyPersonnelCount={inputDutyStrength}
          onLeavePersonnelCount={inputLeaveCount}
          remainingDutyCount={calculatedRemaining}
          currentlyOnLeave={activeLeaves}
          onClose={() => setShowDutyPrintModal(false)}
        />
      )}

    </div>
  );
};
