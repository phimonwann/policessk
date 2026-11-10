import React, { useState } from 'react';
import { UserPersonnel, UserRole, POLICE_DEPARTMENTS } from '../types/leave';
import { exportPersonnelToCSV } from '../utils/exportUtils';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Search, 
  KeyRound, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Download, 
  ShieldCheck, 
  Phone, 
  Lock, 
  Unlock, 
  Edit3,
  X,
  Check
} from 'lucide-react';

interface PersonnelManagementProps {
  personnelList: UserPersonnel[];
  onAddPersonnel: (person: UserPersonnel) => void;
  onUpdatePersonnel: (person: UserPersonnel) => void;
  onDeletePersonnel: (id: string) => void;
}

export const PersonnelManagement: React.FC<PersonnelManagementProps> = ({
  personnelList,
  onAddPersonnel,
  onUpdatePersonnel,
  onDeletePersonnel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<UserPersonnel | null>(null);
  
  // Show/Hide password for admin visibility (Requirement 7)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Requirement 21: สายงานและสายงานย่อย
  const [formDept, setFormDept] = useState('งานป้องกันปราบปราม');
  const currentDeptConfig = POLICE_DEPARTMENTS.find(d => d.name === formDept) || POLICE_DEPARTMENTS[1];

  const [formData, setFormData] = useState<Partial<UserPersonnel>>({
    callsign: '',
    rank: 'ส.ต.ท.',
    firstName: '',
    lastName: '',
    position: 'ผบ.หมู่งานป้องกันปราบปราม',
    department: 'งานป้องกันปราบปราม',
    subDepartment: '2.4 สายตรวจรถยนต์',
    role: 'personnel',
    phone: '',
    address: 'สภ.ศรีสงคราม',
    accumulatedVacationDays: 10,
    currentYearVacationDays: 10,
    isLocked: false,
    mustChangePasswordFirstLogin: true
  });

  const handleOpenAdd = () => {
    setFormData({
      callsign: 'SSK',
      rank: 'ส.ต.ท.',
      firstName: '',
      lastName: '',
      position: 'ผบ.หมู่งานป้องกันปราบปราม',
      department: 'งานป้องกันปราบปราม',
      subDepartment: '2.4 สายตรวจรถยนต์',
      role: 'personnel',
      phone: '',
      address: 'สภ.ศรีสงคราม จ.นครพนม',
      accumulatedVacationDays: 10,
      currentYearVacationDays: 10,
      isLocked: false,
      mustChangePasswordFirstLogin: true
    });
    setFormDept('งานป้องกันปราบปราม');
    setShowAddModal(true);
  };

  const [formError, setFormError] = useState('');

  const handleSavePerson = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.callsign || !formData.firstName || !formData.lastName) {
      setFormError('กรุณากรอกข้อมูลสำคัญ (นามเรียกขาน ชื่อ นามสกุล) ให้ครบถ้วน');
      return;
    }

    if (editingPerson) {
      // Update
      const updated: UserPersonnel = {
        ...editingPerson,
        ...(formData as UserPersonnel)
      };
      onUpdatePersonnel(updated);
      setEditingPerson(null);
    } else {
      // Add new: Initial username and password = callsign (Requirement 6)
      const newPerson: UserPersonnel = {
        id: `usr-${Date.now()}`,
        callsign: formData.callsign.trim().toUpperCase(),
        username: formData.callsign.trim().toUpperCase(),
        password: formData.callsign.trim().toUpperCase(), // Requirement 6: password = callsign
        rank: formData.rank || 'ส.ต.ท.',
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        position: formData.position || 'ผบ.หมู่งานป้องกันปราบปราม',
        department: formDept,
        subDepartment: formData.subDepartment || currentDeptConfig.subDepartments[0],
        role: (formData.role as UserRole) || 'personnel',
        phone: formData.phone || '-',
        address: formData.address || 'สภ.ศรีสงคราม',
        accumulatedVacationDays: Number(formData.accumulatedVacationDays) || 0,
        currentYearVacationDays: Number(formData.currentYearVacationDays) || 10,
        failedAttempts: 0,
        isLocked: false,
        mustChangePasswordFirstLogin: true,
        isActive: true
      };
      onAddPersonnel(newPerson);
      setShowAddModal(false);
    }
  };

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Requirement 31: Reset password to callsign
  const handleResetPassword = (person: UserPersonnel) => {
    onUpdatePersonnel({
      ...person,
      password: person.callsign,
      failedAttempts: 0,
      isLocked: false,
      mustChangePasswordFirstLogin: true
    });
    showToast(`✅ รีเซ็ตรหัสผ่านของ ${person.rank} ${person.firstName} ${person.lastName} เป็น "${person.callsign}" เรียบร้อยแล้ว`);
  };

  // Toggle account lock (Requirement 35)
  const handleToggleLock = (person: UserPersonnel) => {
    onUpdatePersonnel({
      ...person,
      isLocked: !person.isLocked,
      failedAttempts: !person.isLocked ? 0 : person.failedAttempts
    });
  };

  const filteredPersonnel = personnelList.filter(p => {
    const matchesSearch =
      p.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'all' ? true : p.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 text-red-900 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">จัดการข้อมูลข้าราชการตำรวจและบุคลากร</h2>
            <p className="text-xs text-stone-500">
              สถานีตำรวจภูธรศรีสงคราม • ทั้งหมด {personnelList.length} นาย (กำหนดสิทธิ์ รหัสผ่าน และสายงาน)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportPersonnelToCSV(personnelList)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold border border-stone-300 transition-colors"
          >
            <Download className="w-4 h-4 text-red-800" />
            ส่งออก Excel (CSV)
          </button>
          
          {/* Requirement 2: เพิ่มบุคลากร */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            เพิ่มข้าราชการตำรวจ
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหานามเรียกขาน, ชื่อ-นามสกุล, ยศ หรือตำแหน่ง..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-900"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-900 font-semibold text-stone-700"
        >
          <option value="all">แสดงทุกสายงาน ({personnelList.length} นาย)</option>
          {POLICE_DEPARTMENTS.map(d => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Personnel Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-red-900 text-white font-bold border-b border-red-950">
              <tr>
                <th className="p-3 sm:p-4">นามเรียกขาน (Username)</th>
                <th className="p-3 sm:p-4">ยศ - ชื่อ - สกุล</th>
                <th className="p-3 sm:p-4">ตำแหน่ง</th>
                <th className="p-3 sm:p-4">สายงาน / สายงานย่อย</th>
                <th className="p-3 sm:p-4">สิทธิ์ในระบบ</th>
                <th className="p-3 sm:p-4">รหัสผ่าน (แอดมินดูได้)</th>
                <th className="p-3 sm:p-4">สถานะบัญชี</th>
                <th className="p-3 sm:p-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {filteredPersonnel.map((person) => {
                const isPwVisible = visiblePasswords[person.id];
                return (
                  <tr key={person.id} className="hover:bg-red-50/30 transition-colors">
                    {/* Requirement 6: นามเรียกขาน */}
                    <td className="p-3 sm:p-4 font-mono font-bold text-red-950">
                      <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded border border-amber-300">
                        {person.callsign}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="font-bold text-stone-900">{person.rank} {person.firstName} {person.lastName}</div>
                      <div className="text-[11px] text-stone-500 font-normal flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {person.phone || '-'}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-stone-700">
                      {person.position}
                    </td>
                    {/* Requirement 21: โครงสร้างสายงาน */}
                    <td className="p-3 sm:p-4">
                      <div className="text-stone-900 font-bold">{person.department}</div>
                      <div className="text-[11px] text-stone-500 font-normal">{person.subDepartment}</div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        person.role === 'commander' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        person.role === 'admin' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                        person.role === 'approver' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                        person.role === 'supervisor' ? 'bg-teal-100 text-teal-900 border border-teal-300' :
                        person.role === 'inspector' ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {person.role === 'commander' && '⭐ ผกก.'}
                        {person.role === 'admin' && '⚙️ Admin'}
                        {person.role === 'approver' && '✍️ ผู้อนุมัติ'}
                        {person.role === 'supervisor' && '👮 หัวหน้างาน'}
                        {person.role === 'inspector' && '📋 ผู้ตรวจสอบ'}
                        {person.role === 'personnel' && '👮 บุคลากร'}
                      </span>
                    </td>
                    {/* Requirement 7: แอดมินสามารถดูชื่อผู้ใช้ และรหัสผ่านได้ */}
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="bg-stone-100 px-2 py-0.5 rounded text-xs border border-stone-200">
                          {isPwVisible ? person.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(person.id)}
                          className="p-1 text-stone-400 hover:text-stone-700"
                          title={isPwVisible ? 'ซ่อนรหัสผ่าน' : 'ดูรหัสผ่าน'}
                        >
                          {isPwVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      {person.isLocked ? (
                        <button
                          onClick={() => handleToggleLock(person)}
                          className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 hover:bg-rose-100"
                        >
                          <Lock className="w-3 h-3" /> บัญชีถูกระงับ
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Check className="w-3 h-3" /> ปกติ
                        </span>
                      )}
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Reset password (Requirement 31) */}
                        <button
                          onClick={() => handleResetPassword(person)}
                          className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          title="รีเซ็ตรหัสผ่านเป็นนามเรียกขาน"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditingPerson(person);
                            setFormData(person);
                            setFormDept(person.department);
                          }}
                          className="p-1.5 text-stone-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete (Requirement 2) */}
                        <button
                          onClick={() => {
                            onDeletePersonnel(person.id);
                            showToast(`ลบข้อมูล ${person.rank} ${person.firstName} ${person.lastName} ออกจากระบบแล้ว`);
                          }}
                          className="p-1.5 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="ลบบุคลากร"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Personnel Modal */}
      {(showAddModal || editingPerson) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-red-900/20">
            <div className="bg-gradient-to-r from-red-900 via-rose-950 to-red-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {editingPerson ? 'แก้ไขข้อมูลข้าราชการตำรวจ' : 'เพิ่มข้าราชการตำรวจใหม่'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingPerson(null);
                }}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePerson} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 font-bold">
                  ⚠️ {formError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Requirement 6: นามเรียกขาน */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    นามเรียกขาน (Callsign / รหัสประจำตัว) *
                  </label>
                  <input
                    type="text"
                    value={formData.callsign}
                    onChange={(e) => setFormData({ ...formData, callsign: e.target.value.toUpperCase() })}
                    required
                    placeholder="เช่น SSK503"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-red-900"
                  />
                  <span className="text-[11px] text-stone-500">ใช้เป็น Username และ Password เริ่มต้น</span>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    ยศ (Rank) *
                  </label>
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-900 font-semibold"
                  >
                    <option value="พ.ต.อ.">พ.ต.อ.</option>
                    <option value="พ.ต.ท.">พ.ต.ท.</option>
                    <option value="พ.ต.ต.">พ.ต.ต.</option>
                    <option value="ร.ต.อ.">ร.ต.อ.</option>
                    <option value="ร.ต.ท.">ร.ต.ท.</option>
                    <option value="ร.ต.ต.">ร.ต.ต.</option>
                    <option value="ด.ต.">ด.ต.</option>
                    <option value="จ.ส.ต.">จ.ส.ต.</option>
                    <option value="ส.ต.อ.">ส.ต.อ.</option>
                    <option value="ส.ต.ท.">ส.ต.ท.</option>
                    <option value="ส.ต.ต.">ส.ต.ต.</option>
                    <option value="พลฯ">พลฯ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">ชื่อ *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">นามสกุล *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">ตำแหน่ง *</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                    placeholder="เช่น ผบ.หมู่งานป้องกันปราบปราม สภ.ศรีสงคราม"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-900"
                  />
                </div>

                {/* Requirement 21: สายงานหลัก */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">สายงานหลัก *</label>
                  <select
                    value={formDept}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      setFormDept(newDept);
                      const deptConf = POLICE_DEPARTMENTS.find(d => d.name === newDept);
                      setFormData({
                        ...formData,
                        department: newDept,
                        subDepartment: deptConf ? deptConf.subDepartments[0] : ''
                      });
                    }}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-900"
                  >
                    {POLICE_DEPARTMENTS.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Requirement 21: สายงานย่อย */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">สายงานย่อย *</label>
                  <select
                    value={formData.subDepartment}
                    onChange={(e) => setFormData({ ...formData, subDepartment: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-900"
                  >
                    {currentDeptConfig.subDepartments.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                {/* บทบาทและสิทธิ์ */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">บทบาทและสิทธิ์ *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-900"
                  >
                    <option value="personnel">👮 บุคลากร (ยื่นลา ดูประวัติ)</option>
                    <option value="supervisor">👮 หัวหน้างาน (พิจารณาชั้นต้น)</option>
                    <option value="inspector">📋 ผู้ตรวจสอบ (ตรวจเอกสาร)</option>
                    <option value="approver">✍️ ผู้อนุมัติ (พิจารณาลงนาม)</option>
                    <option value="commander">⭐ ผู้กำกับ (ผกก. สภ.ศรีสงคราม)</option>
                    <option value="admin">⚙️ Admin (จัดการระบบ)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="เช่น 081-234-5678"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-red-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">วันลาพักผ่อนสะสม (วัน)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.accumulatedVacationDays}
                    onChange={(e) => setFormData({ ...formData, accumulatedVacationDays: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-red-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">สิทธิลาพักผ่อนปีนี้ (วัน)</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={formData.currentYearVacationDays}
                    onChange={(e) => setFormData({ ...formData, currentYearVacationDays: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-red-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPerson(null);
                  }}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-700 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold shadow-md"
                >
                  {editingPerson ? 'บันทึกการแก้ไข' : 'เพิ่มบุคลากร'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
