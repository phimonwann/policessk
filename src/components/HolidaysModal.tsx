import React, { useState } from 'react';
import { HolidayItem } from '../types/leave';
import { formatThaiDate } from '../utils/thaiDateUtils';
import { Calendar, Plus, Trash2, X, AlertCircle } from 'lucide-react';

interface HolidaysModalProps {
  holidays: HolidayItem[];
  onAddHoliday: (holiday: HolidayItem) => void;
  onDeleteHoliday: (id: string) => void;
  onClose: () => void;
}

export const HolidaysModal: React.FC<HolidaysModalProps> = ({
  holidays,
  onAddHoliday,
  onDeleteHoliday,
  onClose
}) => {
  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');
  const [isSpecial, setIsSpecial] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newName.trim()) return;

    onAddHoliday({
      id: `h-${Date.now()}`,
      date: newDate,
      name: newName.trim(),
      isSpecial
    });

    setNewDate('');
    setNewName('');
    setIsSpecial(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-red-900/20">
        
        <div className="bg-gradient-to-r from-red-900 via-rose-950 to-red-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Calendar className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">กำหนดวันหยุดราชการและวันหยุดพิเศษ</h3>
              <p className="text-xs text-red-200">
                สถานีตำรวจภูธรศรีสงคราม • ใช้สำหรับคำนวณวันทำการอัตโนมัติ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* Add Holiday Form */}
          <form onSubmit={handleAdd} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
            <div className="font-bold text-stone-800 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-red-900" />
              <span>เพิ่มวันหยุดใหม่</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">วันที่ *</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">ชื่อวันหยุด *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="เช่น วันหยุดราชการกรณีพิเศษ..."
                  className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={isSpecial}
                  onChange={(e) => setIsSpecial(e.target.checked)}
                  className="rounded text-red-800"
                />
                <span>เป็นวันหยุดพิเศษ (Special Holiday)</span>
              </label>
              <button
                type="submit"
                className="px-4 py-1.5 bg-red-900 hover:bg-red-800 text-white rounded-lg font-bold text-xs shadow-xs"
              >
                เพิ่มวันหยุด
              </button>
            </div>
          </form>

          {/* Holiday List */}
          <div className="space-y-2">
            <span className="font-bold text-stone-700 block">
              รายการวันหยุดทั้งหมด ({holidays.length} วัน)
            </span>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {holidays.map((h) => (
                <div key={h.id} className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-stone-900">{h.name}</div>
                    <div className="text-[11px] font-mono text-stone-500">
                      {formatThaiDate(h.date)} {h.isSpecial && <span className="text-amber-700 bg-amber-100 px-1 rounded ml-1 font-bold">พิเศษ</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteHoliday(h.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-700 rounded-lg"
                    title="ลบวันหยุด"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 font-bold text-xs rounded-xl"
          >
            ปิด
          </button>
        </div>

      </div>
    </div>
  );
};
