import React from 'react';
import { LeaveRequest } from '../types/leave';
import { Bell, CheckCircle2, Clock, X, Eye } from 'lucide-react';
import { formatThaiDateShort, getLeaveTypeLabel } from '../utils/thaiDateUtils';

interface NotificationDropdownProps {
  leaveRequests: LeaveRequest[];
  onSelectRequest: (request: LeaveRequest) => void;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  leaveRequests,
  onSelectRequest,
  onClose
}) => {
  // Pending items and recent actions
  const pendingItems = leaveRequests.filter(r => r.status.startsWith('pending'));
  const recentApproved = leaveRequests.filter(r => r.status === 'approved').slice(-3);

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-stone-800 animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="bg-red-900 text-white p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-300" />
          <h4 className="font-bold text-sm">การแจ้งเตือนคำขอลา (Notifications)</h4>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 text-xs">
        {pendingItems.length === 0 && recentApproved.length === 0 ? (
          <div className="p-6 text-center text-stone-400">
            ไม่มีการแจ้งเตือนใหม่ในขณะนี้
          </div>
        ) : (
          <>
            {pendingItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectRequest(item);
                  onClose();
                }}
                className="p-3 hover:bg-red-50/50 cursor-pointer flex items-start gap-2.5 transition-colors"
              >
                <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 truncate">
                      {item.userRank} {item.userFullName}
                    </span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold font-mono">
                      รออนุมัติ
                    </span>
                  </div>
                  <div className="text-stone-600 truncate mt-0.5">
                    {getLeaveTypeLabel(item.leaveType)} ({item.totalDays} วัน) • {item.department}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1">
                    {formatThaiDateShort(item.startDate)} - {formatThaiDateShort(item.endDate)}
                  </div>
                </div>
              </div>
            ))}

            {recentApproved.map((item) => (
              <div
                key={`app-${item.id}`}
                onClick={() => {
                  onSelectRequest(item);
                  onClose();
                }}
                className="p-3 hover:bg-emerald-50/50 cursor-pointer flex items-start gap-2.5 transition-colors"
              >
                <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 truncate">
                      {item.userRank} {item.userFullName}
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold font-mono">
                      อนุมัติแล้ว
                    </span>
                  </div>
                  <div className="text-stone-600 truncate mt-0.5">
                    {item.requestNumber} • {getLeaveTypeLabel(item.leaveType)}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-stone-50 border-t border-stone-200 text-center">
        <span className="text-[11px] text-stone-500 font-bold">
          คลิกที่รายการเพื่อดูรายละเอียดใบลาและลงนาม
        </span>
      </div>
    </div>
  );
};
