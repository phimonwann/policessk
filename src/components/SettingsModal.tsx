import React, { useState } from 'react';
import { StationConfig, UserPersonnel } from '../types/leave';
import { 
  X, 
  Settings, 
  Save, 
  Phone, 
  Building, 
  UserCheck, 
  Calendar, 
  Download, 
  Upload, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface SettingsModalProps {
  stationConfig: StationConfig;
  allPersonnel: UserPersonnel[];
  onSaveConfig: (updated: StationConfig) => void;
  onBackup: () => void;
  onRestore: (jsonData: string) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  stationConfig,
  allPersonnel,
  onSaveConfig,
  onBackup,
  onRestore,
  onClose
}) => {
  const [formData, setFormData] = useState<StationConfig>({ ...stationConfig });
  const [successMsg, setSuccessMsg] = useState(false);
  const [restoreError, setRestoreError] = useState('');

  // Requirement 4: รองรับปีงบประมาณจนถึง 2580
  const fiscalYears: number[] = [];
  for (let y = 2567; y <= 2580; y++) {
    fiscalYears.push(y);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        onRestore(content);
        onClose();
      } catch {
        setRestoreError('ไฟล์สำรองไม่ถูกต้อง ไม่สามารถกู้คืนได้');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-red-900/20">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 via-rose-950 to-red-900 text-white p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Settings className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold">ตั้งค่าระบบทั่วไป (System Settings)</h3>
              <p className="text-xs text-red-200">
                สถานีตำรวจภูธรศรีสงคราม • กำหนดค่าข้อมูลหน่วยงานและผู้มีอำนาจ
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

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800">
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              บันทึกการตั้งค่าระบบเรียบร้อยแล้ว
            </div>
          )}

          {/* Section: ข้อมูลสถานีตำรวจและเบอร์โทรศัพท์ (Requirement 18) */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-red-950 flex items-center gap-2 border-b border-stone-200 pb-2">
              <Building className="w-4 h-4 text-red-800" />
              <span>ข้อมูลสถานีตำรวจและช่องทางการติดต่อ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ชื่อสถานีตำรวจ (ไทย)
                </label>
                <input
                  type="text"
                  value={formData.stationName}
                  onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                  required
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ชื่อสถานีภาษาอังกฤษ
                </label>
                <input
                  type="text"
                  value={formData.stationNameEn}
                  onChange={(e) => setFormData({ ...formData, stationNameEn: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900"
                />
              </div>

              {/* Requirement 18: ช่อง input สำหรับแก้ไขเบอร์โทรศัพท์ของสถานีตำรวจ */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-red-700" />
                  <span>เบอร์โทรศัพท์สถานีตำรวจ (Phone Number)</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="เช่น 042-577191"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900 font-mono"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  จะนำไปบันทึกใน StationConfig และแสดงผลในส่วนการตั้งค่ารวมถึงหัวเอกสาร
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-red-700" />
                  <span>ปีงบประมาณปัจจุบัน (พ.ศ.)</span>
                </label>
                <select
                  value={formData.currentFiscalYear}
                  onChange={(e) => setFormData({ ...formData, currentFiscalYear: Number(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900 font-mono"
                >
                  {fiscalYears.map((year) => (
                    <option key={year} value={year}>
                      ปีงบประมาณ พ.ศ. {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ที่ตั้ง / ที่อยู่สถานีตำรวจ
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900"
                />
              </div>
            </div>
          </div>

          {/* Section: ผู้บังคับบัญชา และผู้มีอำนาจลงนาม (Requirement 3, 27) */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-red-950 flex items-center gap-2 border-b border-stone-200 pb-2">
              <UserCheck className="w-4 h-4 text-red-800" />
              <span>ผู้บังคับบัญชาและผู้อนุมัติคำขอลา</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Requirement 3: แก้ไขชื่อ ผกก. */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ยศ ผกก.
                </label>
                <input
                  type="text"
                  value={formData.superintendentRank}
                  onChange={(e) => setFormData({ ...formData, superintendentRank: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ชื่อ - นามสกุล ผู้กำกับการ (ผกก.สภ.ศรีสงคราม)
                </label>
                <input
                  type="text"
                  value={formData.superintendentName}
                  onChange={(e) => setFormData({ ...formData, superintendentName: e.target.value })}
                  required
                  placeholder="เช่น ถวิล คำเกษ"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900 font-bold"
                />
              </div>

              {/* Requirement 27: ผู้บังคับการตำรวจภูธรจังหวัดนครพนม */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ยศ ผบก.ภ.จว.นครพนม
                </label>
                <input
                  type="text"
                  value={formData.provincialCommanderRank}
                  onChange={(e) => setFormData({ ...formData, provincialCommanderRank: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ชื่อ - นามสกุล ผบก.ภ.จว.นครพนม
                </label>
                <input
                  type="text"
                  value={formData.provincialCommanderName}
                  onChange={(e) => setFormData({ ...formData, provincialCommanderName: e.target.value })}
                  placeholder="เช่น อารักษ์ มะสาธานัง"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section: ผู้ปฏิบัติราชการแทน / ผู้อนุมัติแทน (Requirement 50) */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-red-950 flex items-center gap-2 border-b border-stone-200 pb-2">
              <ShieldCheck className="w-4 h-4 text-red-800" />
              <span>การมอบหมายผู้อนุมัติแทน (กรณี ผกก. ไปราชการ/ไม่อยู่)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  เลือกผู้ปฏิบัติราชการแทน
                </label>
                <select
                  value={formData.delegatedApproverId || ''}
                  onChange={(e) => {
                    const sel = allPersonnel.find(p => p.id === e.target.value);
                    setFormData({
                      ...formData,
                      delegatedApproverId: e.target.value,
                      delegatedApproverName: sel ? `${sel.rank} ${sel.firstName} ${sel.lastName}` : ''
                    });
                  }}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900"
                >
                  <option value="">-- ไม่มี (ผกก. อนุมัติเอง) --</option>
                  {allPersonnel.filter(p => p.role === 'admin' || p.role === 'supervisor' || p.role === 'approver').map(p => (
                    <option key={p.id} value={p.id}>
                      {p.rank} {p.firstName} {p.lastName} ({p.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  เหตุผลความจำเป็นในการมอบหมาย
                </label>
                <input
                  type="text"
                  value={formData.delegationReason || ''}
                  onChange={(e) => setFormData({ ...formData, delegationReason: e.target.value })}
                  placeholder="เช่น ติดราชการด่วนที่ ภ.จว.นครพนม"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900"
                />
              </div>
            </div>
          </div>

          {/* Section: ปิดปีงบประมาณ & กำลังพลขั้นต่ำ (Requirement 39 & 72) */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-red-950 flex items-center gap-2 border-b border-stone-200 pb-2">
              <Lock className="w-4 h-4 text-red-800" />
              <span>การควบคุมระบบและกำลังพล</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  กำลังพลขั้นต่ำที่ต้องคงไว้ (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="95"
                  value={formData.minDutyPercentage}
                  onChange={(e) => setFormData({ ...formData, minDutyPercentage: Number(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900 font-mono"
                />
                <span className="text-[11px] text-stone-500">แจ้งเตือนหากมีกำลังพลลาเกินสัดส่วนนี้</span>
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFiscalYearLocked || false}
                    onChange={(e) => setFormData({ ...formData, isFiscalYearLocked: e.target.checked })}
                    className="w-4 h-4 rounded text-red-800 focus:ring-red-900"
                  />
                  <span className="text-sm font-bold text-stone-800">
                    🔒 ล็อกปีงบประมาณ (ห้ามแก้ไขย้อนหลัง)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section: สำรองและกู้คืนข้อมูล (Requirement 61 & 62) */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-red-950 flex items-center gap-2 border-b border-stone-200 pb-2">
              <Download className="w-4 h-4 text-red-800" />
              <span>สำรองข้อมูลและกู้คืนระบบ (Backup & Restore)</span>
            </h4>

            {restoreError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{restoreError}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onBackup}
                className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold border border-stone-300 transition-colors"
              >
                <Download className="w-4 h-4 text-red-800" />
                สำรองข้อมูลทั้งหมด (Backup JSON)
              </button>

              <label className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold border border-stone-300 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-red-800" />
                <span>กู้คืนข้อมูลจากไฟล์ (Restore JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-bold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-red-900 hover:bg-red-800 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              บันทึกการตั้งค่า
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
