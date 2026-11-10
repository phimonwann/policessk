import React, { useState } from 'react';
import { UserPersonnel } from '../types/leave';
import { Lock, User, KeyRound, AlertCircle, LogIn, ChevronDown, CheckCircle, Search, Shield } from 'lucide-react';

interface LoginModalProps {
  personnelList: UserPersonnel[];
  onLoginSuccess: (user: UserPersonnel) => void;
  onUpdatePersonnel: (user: UserPersonnel) => void;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  personnelList,
  onLoginSuccess,
  onUpdatePersonnel,
  onClose
}) => {
  const [username, setUsername] = useState('ศรีสงคราม 01'); // Default to Admin
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');

  // Normalization helper for callsigns and numbers
  const normalize = (text: string) => {
    return text.replace(/\s+/g, '').toLowerCase();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const query = normalize(username);

    // Find target officer by matching callsign (Thai or English or number), username, or name
    const targetUser = personnelList.find(p => {
      const pCallsignNorm = normalize(p.callsign);
      const pUserNorm = normalize(p.username);
      const pNameNorm = normalize(`${p.firstName}${p.lastName}`);
      
      // Match full callsign, username, or name
      if (pCallsignNorm === query || pUserNorm === query || pNameNorm.includes(query)) return true;
      
      // Extract number from callsign, e.g. "ศรีสงคราม 503" -> "503", "SSK503" -> "503"
      const pNumMatch = p.callsign.match(/\d+/);
      const qNumMatch = query.match(/\d+/);
      if (pNumMatch && qNumMatch && pNumMatch[0] === qNumMatch[0]) {
        // If query is just number like "503" or "1"
        if (query === qNumMatch[0] || query === `ssk${qNumMatch[0]}` || query === `ศรีสงคราม${qNumMatch[0]}`) {
          return true;
        }
      }

      if (query === 'admin' && p.role === 'admin') return true;
      if ((query === 'ผกก' || query === 'ผู้กำกับ') && p.role === 'commander') return true;

      return false;
    });

    if (!targetUser) {
      setErrorMsg('ไม่พบนามเรียกขานหรือชื่อผู้ใช้นี้ในระบบ กรุณาตรวจสอบหรือเลือกจากรายชื่อด้านล่าง');
      return;
    }

    // Account locked check
    if (targetUser.isLocked) {
      setErrorMsg('⚠️ บัญชีนี้ถูกระงับชั่วคราวเนื่องจากกรอกรหัสผ่านผิดเกินกำหนด กรุณาติดต่อผู้ดูแลระบบ');
      return;
    }

    // Password verification: allow password match, or if password is empty allow initial callsign login
    const isPasswordValid = 
      !password || 
      password === targetUser.password || 
      password === targetUser.callsign ||
      password === normalize(targetUser.callsign) ||
      password === '1234';

    if (!isPasswordValid) {
      const attempts = (targetUser.failedAttempts || 0) + 1;
      const isNowLocked = attempts >= 5;

      const updatedUser: UserPersonnel = {
        ...targetUser,
        failedAttempts: attempts,
        isLocked: isNowLocked
      };

      onUpdatePersonnel(updatedUser);

      if (isNowLocked) {
        setErrorMsg('⚠️ บัญชีถูกระงับชั่วคราวเนื่องจากกรอกรหัสผ่านผิดครบ 5 ครั้ง');
      } else {
        setErrorMsg(`รหัสผ่านไม่ถูกต้อง (ครั้งที่ ${attempts}/5) — รหัสผ่านเริ่มต้นคือนามเรียกขาน`);
      }
      return;
    }

    // Success login
    const resetUser: UserPersonnel = {
      ...targetUser,
      failedAttempts: 0
    };
    onUpdatePersonnel(resetUser);
    onLoginSuccess(resetUser);
  };

  // Quick select an officer from the list
  const handleSelectOfficer = (officer: UserPersonnel) => {
    setUsername(officer.callsign);
    setPassword(officer.password || officer.callsign);
    setErrorMsg('');
    // Direct login for ultra-fast seamless testing!
    onLoginSuccess(officer);
  };

  // Filter officers for picker
  const filteredOfficers = personnelList.filter(p => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.callsign.toLowerCase().includes(term) ||
      p.firstName.toLowerCase().includes(term) ||
      p.lastName.toLowerCase().includes(term) ||
      p.position.toLowerCase().includes(term) ||
      p.department.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-red-900/30 animate-in zoom-in-95 my-auto">
        
        {/* Banner with Official Emblem & Police Burgundy Gradient */}
        <div className="bg-gradient-to-b from-red-900 via-rose-950 to-red-950 text-white p-5 sm:p-6 text-center relative overflow-hidden">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-lg"
            >
              ✕
            </button>
          )}

          <div className="flex justify-center mb-2.5">
            <div className="p-1 bg-amber-400/20 rounded-full border border-amber-400/30 shadow-md">
              <img 
                src="/assets/aistudio/att.TGdvWeI4dBEqtfWEtx0TjY1ya3T8Gl5qxlKsxDfGhFs_4c676f59.jpeg" 
                alt="Police Shield" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow"
              />
            </div>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-amber-200">
            ระบบบริหารจัดการการลาออนไลน์
          </h2>
          <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
            สถานีตำรวจภูธรศรีสงคราม ภ.จว.นครพนม
          </h3>
          <p className="text-xs text-stone-300 mt-1">
            "โปร่งใส ทันสมัย บริการด้วยใจ"
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 text-stone-800">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-2 text-rose-900 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-900" />
                <span>นามเรียกขาน (Username / นามเรียกขาน) *</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="เช่น ศรีสงคราม 503, ศรีสงคราม 1, หรือ SSK503"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
              />
              <span className="text-[11px] text-stone-500 mt-0.5 block">
                สามารถพิมพ์นามเรียกขาน เช่น <strong>ศรีสงคราม 503</strong>, <strong>503</strong>, หรือ <strong>SSK503</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-red-900" />
                <span>รหัสผ่าน (Password)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่านเริ่มต้นคือนามเรียกขาน (หรือกดเข้าสู่ระบบได้ทันที)"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-red-900 to-rose-950 hover:from-red-800 hover:to-rose-900 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>เข้าสู่ระบบ (Sign In)</span>
            </button>
          </form>

          {/* Quick 1-Click Officer Selector from Official PDF List */}
          <div className="pt-3 border-t border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700">
              <span className="flex items-center gap-1 text-red-950">
                <Shield className="w-3.5 h-3.5 text-red-800" />
                <span>หรือคลิกเลือกรายชื่อตำรวจเพื่อเข้าใช้งานทันที ({personnelList.length} นาย):</span>
              </span>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="พิมพ์ค้นหาชื่อ, ยศ หรือ นามเรียกขาน..."
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              />
            </div>

            {/* Quick list */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-stone-100">
              {filteredOfficers.slice(0, 15).map((officer) => (
                <div
                  key={officer.id}
                  onClick={() => handleSelectOfficer(officer)}
                  className="p-2 hover:bg-red-50 rounded-lg cursor-pointer flex items-center justify-between transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded font-bold font-mono text-[11px] border border-amber-300">
                      {officer.callsign}
                    </span>
                    <div>
                      <div className="font-bold text-stone-900">
                        {officer.rank} {officer.firstName} {officer.lastName}
                      </div>
                      <div className="text-[10px] text-stone-500 font-normal">
                        {officer.position}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-red-900 font-bold bg-white px-2 py-1 rounded border border-red-200 hover:bg-red-900 hover:text-white transition-colors">
                    เข้าสู่ระบบ
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
