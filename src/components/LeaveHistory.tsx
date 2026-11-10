import React, { useState } from 'react';
import { LeaveRequest, StationConfig, UserPersonnel } from '../types/leave';
import { formatThaiDate, getLeaveTypeLabel } from '../utils/thaiDateUtils';
import { exportLeavesToCSV } from '../utils/exportUtils';
import { LeaveDetailModal } from './LeaveDetailModal';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  WifiOff, 
  CheckCircle2, 
  XCircle, 
  Ban, 
  Clock 
} from 'lucide-react';

interface LeaveHistoryProps {
  leaveRequests: LeaveRequest[];
  currentUser: UserPersonnel;
  stationConfig: StationConfig;
  onCancelRequest: (requestId: string, reason: string) => void;
}

export const LeaveHistory: React.FC<LeaveHistoryProps> = ({
  leaveRequests,
  currentUser,
  stationConfig,
  onCancelRequest
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<number>(stationConfig.currentFiscalYear);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  // Check offline state (Requirement 22)
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  // Filter requests (If personnel role, show only their leaves; if supervisor/admin/commander, show all or filtered)
  const filtered = leaveRequests.filter(req => {
    if (currentUser.role === 'personnel' && req.userId !== currentUser.id) {
      return false;
    }

    const matchesYear = filterYear === 0 ? true : req.fiscalYear === filterYear;
    const matchesType = filterType === 'all' ? true : req.leaveType === filterType;
    const matchesSearch =
      req.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.userFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesYear && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Offline banner if disconnected */}
      {isOffline && (
        <div className="p-3 bg-amber-500 text-stone-950 font-bold rounded-2xl flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-stone-950" />
            <span>โหมดออฟไลน์: กำลังแสดงข้อมูลประวัติการลาจากหน่วยความจำแคชของเครื่อง (Service Worker)</span>
          </div>
          <span className="bg-stone-950 text-white px-2.5 py-0.5 rounded-full text-xs">
            ออฟไลน์
          </span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 text-red-900 rounded-xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">ประวัติการลาข้าราชการตำรวจ</h2>
            <p className="text-xs text-stone-500">
              สถานีตำรวจภูธรศรีสงคราม • ค้นหาย้อนหลังตามชื่อ ประเภทการลา และปีงบประมาณ
            </p>
          </div>
        </div>

        <button
          onClick={() => exportLeavesToCSV(filtered)}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold border border-stone-300 transition-colors"
        >
          <Download className="w-4 h-4 text-red-800" />
          ส่งออก Excel (CSV)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อ, เลขที่ใบลา หรือเหตุผล..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-900"
          >
            <option value="all">ทุกประเภทการลา</option>
            <option value="vacation">ลาพักผ่อน</option>
            <option value="sick">ลาป่วย</option>
            <option value="personal">ลากิจส่วนตัว</option>
            <option value="childcare">ลาเพื่อดูแลบุตรและภรรยา</option>
            <option value="maternity">ลาคลอด</option>
            <option value="ordination">ลาอุปสมบท</option>
            <option value="other">อื่น ๆ</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="w-full py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-900 font-mono"
          >
            <option value={0}>ทุกปีงบประมาณ</option>
            {Array.from({ length: 14 }, (_, i) => 2567 + i).map(year => (
              <option key={year} value={year}>ปีงบประมาณ พ.ศ. {year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-red-900 text-white font-bold border-b border-red-950">
              <tr>
                <th className="p-3 sm:p-4">เลขที่ใบลา</th>
                <th className="p-3 sm:p-4">ยศ - ชื่อ - สกุล</th>
                <th className="p-3 sm:p-4">ประเภทการลา</th>
                <th className="p-3 sm:p-4">ช่วงเวลาลา</th>
                <th className="p-3 sm:p-4">จำนวนวัน</th>
                <th className="p-3 sm:p-4">สถานะ</th>
                <th className="p-3 sm:p-4 text-center">ดูใบลา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-stone-400">
                    ไม่พบข้อมูลประวัติการลา
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="p-3 sm:p-4 font-mono font-bold text-red-950">
                      {req.requestNumber}
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="font-bold text-stone-900">{req.userRank} {req.userFullName}</div>
                      <div className="text-[11px] text-stone-500 font-normal">{req.userPosition}</div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-200">
                        {getLeaveTypeLabel(req.leaveType)}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="font-mono text-xs text-stone-800">
                        {formatThaiDate(req.startDate)} - {formatThaiDate(req.endDate)}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 font-mono font-bold text-red-900">
                      {req.totalDays} วัน
                    </td>
                    <td className="p-3 sm:p-4">
                      {req.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> อนุมัติแล้ว
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          <XCircle className="w-3.5 h-3.5" /> ไม่อนุมัติ
                        </span>
                      )}
                      {req.status === 'cancelled' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-600">
                          <Ban className="w-3.5 h-3.5" /> ยกเลิกแล้ว
                        </span>
                      )}
                      {req.status.startsWith('pending') && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> รอพิจารณา
                        </span>
                      )}
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="px-3 py-1 bg-stone-100 hover:bg-red-900 hover:text-white text-stone-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        รายละเอียด
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Detail Modal */}
      {selectedRequest && (
        <LeaveDetailModal
          request={selectedRequest}
          currentUser={currentUser}
          stationConfig={stationConfig}
          onClose={() => setSelectedRequest(null)}
          onCancel={onCancelRequest}
        />
      )}
    </div>
  );
};
