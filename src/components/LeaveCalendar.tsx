import React, { useState } from 'react';
import { HolidayItem, LeaveRequest, StationConfig, UserPersonnel, POLICE_DEPARTMENTS } from '../types/leave';
import { THAI_MONTHS, THAI_DAYS_SHORT, formatThaiDate, getLeaveTypeLabel } from '../utils/thaiDateUtils';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface LeaveCalendarProps {
  leaveRequests: LeaveRequest[];
  holidays: HolidayItem[];
  stationConfig: StationConfig;
}

export const LeaveCalendar: React.FC<LeaveCalendarProps> = ({
  leaveRequests,
  holidays,
  stationConfig
}) => {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 9 = October
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedDayLeaves, setSelectedDayLeaves] = useState<{ day: number; leaves: LeaveRequest[]; holiday?: HolidayItem } | null>(null);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Days matrix for current month
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= totalDaysInCurrentMonth; d++) {
    days.push(d);
  }

  // Filter requests
  const filteredRequests = leaveRequests.filter(req => {
    if (req.status !== 'approved') return false;
    if (selectedDept !== 'all' && req.department !== selectedDept) return false;
    return true;
  });

  const getDayInfo = (day: number) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${mm}-${dd}`;

    const holiday = holidays.find(h => h.date === dateStr);
    const dayLeaves = filteredRequests.filter(r => dateStr >= r.startDate && dateStr <= r.endDate);

    return { holiday, dayLeaves };
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 text-red-900 rounded-xl">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">ปฏิทินวันลาข้าราชการตำรวจ</h2>
            <p className="text-xs text-stone-500">
              สถานีตำรวจภูธรศรีสงคราม • แสดงภาพรวมการลาแยกตามสายงานและวันหยุดราชการ
            </p>
          </div>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:ring-2 focus:ring-red-900"
          >
            <option value="all">ทุกสายงาน</option>
            {POLICE_DEPARTMENTS.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Header with navigation */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-black text-stone-900">
            เดือน {THAI_MONTHS[currentMonth]} พ.ศ. {currentYear + 543}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-stone-100 rounded-xl text-stone-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-stone-100 rounded-xl text-stone-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Day Names Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-bold">
          {THAI_DAYS_SHORT.map((dayName, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg ${
                idx === 0 || idx === 6 ? 'text-rose-700 bg-rose-50' : 'text-stone-700 bg-stone-50'
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-24 sm:h-28 bg-stone-50/40 rounded-xl" />;
            }

            const { holiday, dayLeaves } = getDayInfo(day);
            const isWeekendDay = (idx % 7 === 0) || (idx % 7 === 6);

            return (
              <div
                key={`day-${day}`}
                onClick={() => setSelectedDayLeaves({ day, leaves: dayLeaves, holiday })}
                className={`h-24 sm:h-28 p-1.5 sm:p-2 border rounded-xl flex flex-col justify-between cursor-pointer transition-all hover:border-red-800 hover:shadow-sm ${
                  holiday ? 'bg-rose-50/70 border-rose-200' :
                  isWeekendDay ? 'bg-stone-50 border-stone-200' : 'bg-white border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs sm:text-sm font-mono font-bold ${
                    holiday || isWeekendDay ? 'text-rose-700' : 'text-stone-900'
                  }`}>
                    {day}
                  </span>
                  {holiday && (
                    <span className="text-[10px] bg-rose-200 text-rose-950 px-1 rounded truncate max-w-[50px] sm:max-w-none">
                      วันหยุด
                    </span>
                  )}
                </div>

                {/* Leaves Dots / Badges */}
                <div className="space-y-1 overflow-hidden">
                  {dayLeaves.slice(0, 2).map((leave) => (
                    <div
                      key={leave.id}
                      className="text-[10px] truncate px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-950 border border-amber-200"
                    >
                      {leave.userRank} {leave.userFullName}
                    </div>
                  ))}
                  {dayLeaves.length > 2 && (
                    <div className="text-[9px] text-stone-500 font-bold pl-1">
                      +{dayLeaves.length - 2} นาย
                    </div>
                  )}
                </div>

                <div className="text-[9px] text-stone-400 text-right">
                  {dayLeaves.length > 0 ? `${dayLeaves.length} นาย` : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Popup for selected day */}
      {selectedDayLeaves && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-base text-stone-900">
                วันที่ {selectedDayLeaves.day} {THAI_MONTHS[currentMonth]} พ.ศ. {currentYear + 543}
              </h4>
              <button
                onClick={() => setSelectedDayLeaves(null)}
                className="text-stone-400 hover:text-stone-800"
              >
                ✕
              </button>
            </div>

            {selectedDayLeaves.holiday && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-bold">
                🏮 {selectedDayLeaves.holiday.name}
              </div>
            )}

            <div>
              <div className="text-xs font-bold text-stone-500 mb-2">
                ข้าราชการตำรวจที่ลา ({selectedDayLeaves.leaves.length} นาย):
              </div>
              {selectedDayLeaves.leaves.length === 0 ? (
                <div className="text-stone-400 text-xs py-3 text-center">ไม่มีผู้ลาในวันนี้</div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedDayLeaves.leaves.map(l => (
                    <div key={l.id} className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs">
                      <div className="font-bold text-stone-900">{l.userRank} {l.userFullName}</div>
                      <div className="text-stone-500">{l.userPosition} • {getLeaveTypeLabel(l.leaveType)}</div>
                      <div className="text-stone-400 font-mono mt-0.5">{l.startDate} ถึง {l.endDate}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedDayLeaves(null)}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 font-bold text-xs rounded-xl"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
