import React, { useState } from 'react';
import { LeaveRequest, StationConfig, UserPersonnel } from '../types/leave';
import { formatThaiDate, getLeaveTypeLabel } from '../utils/thaiDateUtils';
import { LeaveDetailModal } from './LeaveDetailModal';
import { 
  Inbox, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Ban, 
  Eye, 
  Filter, 
  Building2,
  Calendar
} from 'lucide-react';

interface ApprovalInboxProps {
  leaveRequests: LeaveRequest[];
  currentUser: UserPersonnel;
  stationConfig: StationConfig;
  onApprove: (requestId: string, comment?: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onCancel: (requestId: string, reason: string) => void;
}

export const ApprovalInbox: React.FC<ApprovalInboxProps> = ({
  leaveRequests,
  currentUser,
  stationConfig,
  onApprove,
  onReject,
  onCancel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  // Role based filtering:
  // If supervisor, focus on their department
  // If commander or admin, see all
  const filtered = leaveRequests.filter(req => {
    // Dept restrictions if not admin or commander
    if (currentUser.role === 'supervisor' && req.department !== currentUser.department) {
      return false;
    }

    const matchesSearch =
      req.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.userFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.userRank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'pending' ? req.status.startsWith('pending') :
      req.status === filterStatus;

    const matchesDept =
      filterDepartment === 'all' ? true : req.department === filterDepartment;

    return matchesSearch && matchesStatus && matchesDept;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 text-red-900 rounded-xl">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">กล่องข้อความพิจารณาและอนุมัติการลา</h2>
              <p className="text-xs text-stone-500">
                รายการคำขอลาที่อยู่ระหว่างรอการตรวจสอบ พิจารณาความเห็น และลงนามคำสั่ง
              </p>
            </div>
          </div>
        </div>

        {/* Quick Count Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-amber-900">
              รอพิจารณา: {leaveRequests.filter(r => r.status.startsWith('pending')).length} รายการ
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อ, ยศ, เลขที่ใบลา..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-900"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="pending">⏳ เฉพาะที่รอพิจารณา</option>
            <option value="approved">✅ อนุมัติแล้ว</option>
            <option value="rejected">❌ ไม่อนุมัติ</option>
            <option value="cancelled">🚫 ยกเลิกแล้ว</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="w-full py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-900"
          >
            <option value="all">สายงานทั้งหมด</option>
            <option value="ผกก.">ผกก.</option>
            <option value="งานป้องกันปราบปราม">งานป้องกันปราบปราม</option>
            <option value="งานสอบสวน">งานสอบสวน</option>
            <option value="งานสืบสวน">งานสืบสวน</option>
            <option value="งานอำนวยการ">งานอำนวยการ</option>
            <option value="งานจราจร">งานจราจร</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-red-900 text-white font-bold border-b border-red-950">
              <tr>
                <th className="p-3 sm:p-4">เลขที่ใบลา</th>
                <th className="p-3 sm:p-4">ยศ - ชื่อ - สกุล</th>
                <th className="p-3 sm:p-4">ตำแหน่ง / สายงาน</th>
                <th className="p-3 sm:p-4">ประเภทการลา</th>
                <th className="p-3 sm:p-4">ช่วงเวลาลา</th>
                <th className="p-3 sm:p-4">สถานะ</th>
                <th className="p-3 sm:p-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-stone-400">
                    ไม่พบรายการคำขอลาในหมวดนี้
                  </td>
                </tr>
              ) : (
                filtered.map((req) => {
                  const isOwner = currentUser.id === req.userId;
                  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'commander';
                  const canCancel = (isOwner || isAdmin) && req.status !== 'cancelled';

                  return (
                    <tr key={req.id} className="hover:bg-red-50/40 transition-colors">
                      <td className="p-3 sm:p-4">
                        <span className="font-mono text-red-900 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          {req.requestNumber}
                        </span>
                        <div className="text-[11px] text-stone-400 mt-1">ปี {req.fiscalYear}</div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="text-stone-900 font-bold">{req.userRank} {req.userFullName}</div>
                        <div className="text-[11px] text-stone-500 font-normal">{req.userPosition}</div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="text-stone-800">{req.department}</div>
                        <div className="text-[11px] text-stone-500 font-normal">{req.subDepartment}</div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-200">
                          {getLeaveTypeLabel(req.leaveType)}
                        </span>
                        <div className="text-[11px] text-stone-500 mt-1">{req.totalDays} วันทำการ</div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-1 text-stone-800">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>{formatThaiDate(req.startDate)}</span>
                        </div>
                        <div className="text-[11px] text-stone-500 font-normal">
                          ถึง {formatThaiDate(req.endDate)}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        {req.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> อนุมัติแล้ว
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                            <XCircle className="w-3.5 h-3.5" /> ไม่อนุมัติ
                          </span>
                        )}
                        {req.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600">
                            <Ban className="w-3.5 h-3.5" /> ยกเลิกคำขอ
                          </span>
                        )}
                        {req.status.startsWith('pending') && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            {req.status === 'pending_approver' ? 'รอ ผกก. อนุมัติ' :
                             req.status === 'pending_supervisor' ? 'รอ หน.งาน' : 'รอตรวจสอบ'}
                          </span>
                        )}
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* View details */}
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors title='ดูรายละเอียด'"
                            title="ดูรายละเอียดใบลา"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick Cancel Button (Requirement 19) */}
                          {canCancel && (
                            <button
                              onClick={() => {
                                const reason = prompt('ระบุเหตุผลในการยกเลิกคำขอลา:');
                                if (reason && reason.trim()) {
                                  onCancel(req.id, reason.trim());
                                }
                              }}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                              title="ยกเลิกคำขอลา"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              ยกเลิกลา
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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
          onApprove={onApprove}
          onReject={onReject}
          onCancel={onCancel}
        />
      )}
    </div>
  );
};
