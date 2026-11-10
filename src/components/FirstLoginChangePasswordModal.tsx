import React, { useState } from 'react';
import { UserPersonnel } from '../types/leave';
import { KeyRound, ShieldCheck, X } from 'lucide-react';

interface FirstLoginChangePasswordModalProps {
  currentUser: UserPersonnel;
  onUpdatePassword: (newPassword: string, skipFlag: boolean) => void;
  onClose: () => void;
}

export const FirstLoginChangePasswordModal: React.FC<FirstLoginChangePasswordModalProps> = ({
  currentUser,
  onUpdatePassword,
  onClose
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    onUpdatePassword(newPassword, true);
    onClose();
  };

  const handleSkip = () => {
    // User chose not to change now
    onUpdatePassword(currentUser.password, false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-stone-800 space-y-4 border border-red-900/20">
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 bg-red-100 text-red-900 rounded-2xl mb-1">
            <KeyRound className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-red-950">
            ตั้งรหัสผ่านใหม่ (เข้าใช้งานครั้งแรก)
          </h3>
          <p className="text-xs text-stone-500">
            คุณ {currentUser.rank} {currentUser.firstName} {currentUser.lastName} ({currentUser.callsign})
          </p>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
          💡 ข้อแนะนำ: เข้าระบบครั้งแรกสามารถตั้งรหัสผ่านส่วนตัวใหม่เพื่อความปลอดภัย หรือกดข้ามไปใช้งานก่อนได้
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-stone-700 mb-1">รหัสผ่านใหม่ *</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านใหม่"
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-red-900"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">ยืนยันรหัสผ่านใหม่ *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-red-900"
            />
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={handleSkip}
              className="w-1/2 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors"
            >
              ไม่เปลี่ยน (ข้าม)
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-red-900 hover:bg-red-800 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              บันทึกรหัสผ่านใหม่
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
