/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  UserPersonnel, 
  LeaveRequest, 
  StationConfig, 
  AuditLogItem, 
  HolidayItem 
} from './types/leave';
import { 
  INITIAL_PERSONNEL, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_STATION_CONFIG, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_HOLIDAYS 
} from './data/mockData';
import { getCurrentThaiDateTimeString } from './utils/thaiDateUtils';
import { backupSystemData } from './utils/exportUtils';

// Components
import { Dashboard } from './components/Dashboard';
import { ApprovalInbox } from './components/ApprovalInbox';
import { PersonnelManagement } from './components/PersonnelManagement';
import { MonthlyRoster } from './components/MonthlyRoster';
import { LeaveHistory } from './components/LeaveHistory';
import { LeaveCalendar } from './components/LeaveCalendar';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { SettingsModal } from './components/SettingsModal';
import { LeaveSubmissionModal } from './components/LeaveSubmissionModal';
import { LeaveDetailModal } from './components/LeaveDetailModal';
import { LoginModal } from './components/LoginModal';
import { FirstLoginChangePasswordModal } from './components/FirstLoginChangePasswordModal';
import { NotificationDropdown } from './components/NotificationDropdown';
import { AuditLogModal } from './components/AuditLogModal';
import { HolidaysModal } from './components/HolidaysModal';

// Icons
import {
  LayoutDashboard,
  FileEdit,
  Inbox,
  Users,
  Calendar,
  BarChart2,
  History,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Shield,
  FileCheck,
  CalendarDays,
  Lock
} from 'lucide-react';

export default function App() {
  // Persistence via localStorage
  const [stationConfig, setStationConfig] = useState<StationConfig>(() => {
    const saved = localStorage.getItem('ssk_station_config');
    return saved ? JSON.parse(saved) : INITIAL_STATION_CONFIG;
  });

  const [personnelList, setPersonnelList] = useState<UserPersonnel[]>(() => {
    const saved = localStorage.getItem('ssk_personnel');
    if (!saved) return INITIAL_PERSONNEL;
    try {
      const parsed: UserPersonnel[] = JSON.parse(saved);
      if (parsed.length < INITIAL_PERSONNEL.length) {
        const existingIds = new Set(parsed.map(p => p.id));
        const merged = [...parsed];
        for (const officer of INITIAL_PERSONNEL) {
          if (!existingIds.has(officer.id)) {
            merged.push(officer);
          }
        }
        return merged;
      }
      return parsed;
    } catch {
      return INITIAL_PERSONNEL;
    }
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('ssk_leave_requests');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('ssk_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [holidays, setHolidays] = useState<HolidayItem[]>(() => {
    const saved = localStorage.getItem('ssk_holidays');
    return saved ? JSON.parse(saved) : INITIAL_HOLIDAYS;
  });

  // Current logged in user (Requirement 1 & 6: นามเรียกขาน SSK001 admin by default)
  const [currentUser, setCurrentUser] = useState<UserPersonnel | null>(() => {
    const savedUser = localStorage.getItem('ssk_current_user');
    return savedUser ? JSON.parse(savedUser) : INITIAL_PERSONNEL[0];
  });

  // Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showHolidaysModal, setShowHolidaysModal] = useState(false);
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<LeaveRequest | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Requirement 10: ทำให้เป็นวันที่ เวลา ณ ปัจจุบัน
  const [currentDateTime, setCurrentDateTime] = useState(getCurrentThaiDateTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(getCurrentThaiDateTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('ssk_station_config', JSON.stringify(stationConfig));
  }, [stationConfig]);

  useEffect(() => {
    localStorage.setItem('ssk_personnel', JSON.stringify(personnelList));
  }, [personnelList]);

  useEffect(() => {
    localStorage.setItem('ssk_leave_requests', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('ssk_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('ssk_holidays', JSON.stringify(holidays));
  }, [holidays]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ssk_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ssk_current_user');
    }
  }, [currentUser]);

  // Requirement 36: จัดการเซสชัน ออกจากระบบและหมดเวลาอัตโนมัติเมื่อไม่มีการใช้งาน
  const lastActivityRef = useRef<number>(Date.now());
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    const interval = setInterval(() => {
      if (!currentUser) return;
      const timeoutMs = (stationConfig.sessionTimeoutMinutes || 15) * 60 * 1000;
      if (Date.now() - lastActivityRef.current > timeoutMs) {
        handleLogout();
      }
    }, 30000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      clearInterval(interval);
    };
  }, [currentUser, stationConfig.sessionTimeoutMinutes]);

  // Add Audit Log Helper (Requirement 34)
  const addAuditLog = (
    action: AuditLogItem['action'],
    targetType: AuditLogItem['targetType'],
    targetId: string,
    details: string
  ) => {
    if (!currentUser) return;
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('th-TH'),
      userId: currentUser.id,
      userName: `${currentUser.rank} ${currentUser.firstName} ${currentUser.lastName}`,
      action,
      targetType,
      targetId,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Login handler
  const handleLoginSuccess = (user: UserPersonnel) => {
    setCurrentUser(user);
    setShowLoginModal(false);
    addAuditLog('LOGIN', 'AUTH', user.id, `เข้าสู่ระบบสำเร็จ (${user.callsign})`);
    // Requirement 30: บังคับเปลี่ยนรหัสผ่านครั้งแรก
    if (user.mustChangePasswordFirstLogin) {
      setShowFirstLoginModal(true);
    }
  };

  // Requirement 11: แก้ไขให้กดออกจากระบบได้
  const handleLogout = () => {
    if (currentUser) {
      addAuditLog('LOGOUT', 'AUTH', currentUser.id, `ออกจากระบบ (${currentUser.callsign})`);
    }
    setCurrentUser(null);
    localStorage.removeItem('ssk_current_user');
  };

  // First login password change
  const handleFirstLoginPasswordChange = (newPassword: string, skipFlag: boolean) => {
    if (!currentUser) return;
    const updated: UserPersonnel = {
      ...currentUser,
      password: newPassword,
      mustChangePasswordFirstLogin: !skipFlag
    };
    handleUpdatePersonnel(updated);
    addAuditLog('UPDATE', 'USER', currentUser.id, 'แก้ไขรหัสผ่านใหม่ในการเข้าใช้งานครั้งแรก');
  };

  // Personnel Management Handlers (Requirement 2 & 21)
  const handleAddPersonnel = (person: UserPersonnel) => {
    setPersonnelList(prev => [...prev, person]);
    addAuditLog('CREATE', 'USER', person.id, `เพิ่มข้าราชการตำรวจใหม่: ${person.rank} ${person.firstName} ${person.lastName} (${person.callsign})`);
  };

  const handleUpdatePersonnel = (person: UserPersonnel) => {
    setPersonnelList(prev => prev.map(p => p.id === person.id ? person : p));
    if (currentUser && currentUser.id === person.id) {
      setCurrentUser(person);
    }
    addAuditLog('UPDATE', 'USER', person.id, `แก้ไขข้อมูลข้าราชการตำรวจ: ${person.rank} ${person.firstName} ${person.lastName}`);
  };

  const handleDeletePersonnel = (id: string) => {
    const target = personnelList.find(p => p.id === id);
    setPersonnelList(prev => prev.filter(p => p.id !== id));
    addAuditLog('DELETE', 'USER', id, `ลบข้าราชการตำรวจ: ${target?.rank || ''} ${target?.firstName || ''} ${target?.lastName || ''}`);
  };

  // Leave Actions
  const handleCreateLeaveRequest = (newRequest: LeaveRequest) => {
    setLeaveRequests(prev => [newRequest, ...prev]);
    addAuditLog('CREATE', 'LEAVE', newRequest.id, `ยื่นคำขอลา (${newRequest.requestNumber}): ${newRequest.userRank} ${newRequest.userFullName}`);
  };

  const handleApproveLeave = (requestId: string, comment?: string) => {
    if (!currentUser) return;
    setLeaveRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      return {
        ...req,
        status: 'approved',
        updatedAt: new Date().toISOString(),
        approverDecision: 'approved',
        approverName: `${stationConfig.superintendentRank} ${stationConfig.superintendentName}`,
        approverRank: stationConfig.superintendentRank,
        approverSignDate: new Date().toISOString().slice(0, 10),
        timeline: [
          ...req.timeline,
          {
            status: 'approved',
            updatedBy: `${currentUser.rank} ${currentUser.firstName} ${currentUser.lastName}`,
            timestamp: new Date().toLocaleString('th-TH'),
            comment: comment || 'อนุมัติการลา'
          }
        ]
      };
    }));
    addAuditLog('APPROVE', 'LEAVE', requestId, `อนุมัติคำขอลา`);
  };

  const handleRejectLeave = (requestId: string, reason: string) => {
    if (!currentUser) return;
    setLeaveRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      return {
        ...req,
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date().toISOString(),
        approverDecision: 'rejected',
        approverName: `${stationConfig.superintendentRank} ${stationConfig.superintendentName}`,
        approverRank: stationConfig.superintendentRank,
        approverSignDate: new Date().toISOString().slice(0, 10),
        timeline: [
          ...req.timeline,
          {
            status: 'rejected',
            updatedBy: `${currentUser.rank} ${currentUser.firstName} ${currentUser.lastName}`,
            timestamp: new Date().toLocaleString('th-TH'),
            comment: `ไม่อนุมัติ: ${reason}`
          }
        ]
      };
    }));
    addAuditLog('REJECT', 'LEAVE', requestId, `ไม่อนุมัติคำขอลา: ${reason}`);
  };

  // Requirement 19 & 25: ยกเลิกคำขอลา
  const handleCancelLeave = (requestId: string, reason: string) => {
    if (!currentUser) return;
    setLeaveRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      return {
        ...req,
        status: 'cancelled',
        cancelledBy: `${currentUser.rank} ${currentUser.firstName} ${currentUser.lastName}`,
        cancelledAt: new Date().toISOString(),
        cancellationReason: reason,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...req.timeline,
          {
            status: 'cancelled',
            updatedBy: `${currentUser.rank} ${currentUser.firstName} ${currentUser.lastName}`,
            timestamp: new Date().toLocaleString('th-TH'),
            comment: `ยกเลิกคำขอลา: ${reason}`
          }
        ]
      };
    }));
    addAuditLog('CANCEL', 'LEAVE', requestId, `ยกเลิกคำขอลา: ${reason}`);
  };

  // Backup & Restore
  const handleBackup = () => {
    const backupData = {
      stationConfig,
      personnelList,
      leaveRequests,
      auditLogs,
      holidays,
      backupDate: new Date().toISOString()
    };
    backupSystemData(backupData);
    addAuditLog('CREATE', 'CONFIG', 'backup', 'สำรองข้อมูลระบบทั้งหมด (Backup JSON)');
  };

  const handleRestore = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.stationConfig) setStationConfig(parsed.stationConfig);
      if (parsed.personnelList) setPersonnelList(parsed.personnelList);
      if (parsed.leaveRequests) setLeaveRequests(parsed.leaveRequests);
      if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      if (parsed.holidays) setHolidays(parsed.holidays);
      addAuditLog('UPDATE', 'CONFIG', 'restore', 'กู้คืนข้อมูลระบบจากไฟล์สำรอง (Restore JSON)');
    } catch {
      throw new Error('Invalid JSON format');
    }
  };

  // Pending count for badge
  const pendingCount = leaveRequests.filter(r => r.status.startsWith('pending')).length;

  // Not logged in -> Show Login Modal
  if (!currentUser) {
    return (
      <LoginModal
        personnelList={personnelList}
        onLoginSuccess={handleLoginSuccess}
        onUpdatePersonnel={handleUpdatePersonnel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-100/90 flex flex-col antialiased text-stone-800">
      
      {/* Requirement 8: หน้า web app เป็นสีแดงเลือดหมู ไม่เข้มเกินไปดูสบายตา */}
      {/* Top Main Navigation Header matching FE3E0305 Mockup */}
      <header className="bg-gradient-to-r from-red-900 via-rose-950 to-red-900 text-white shadow-md border-b border-red-950 sticky top-0 z-40 no-print">
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          
          {/* Left: Mobile hamburger + Station Title with Shield Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Requirement 9: โลโก้ตามรูปที่ส่งไป */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <img
                src="/assets/aistudio/att.TGdvWeI4dBEqtfWEtx0TjY1ya3T8Gl5qxlKsxDfGhFs_4c676f59.jpeg"
                alt="Police Shield"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow"
              />
              <div className="leading-tight hidden sm:block">
                <h1 className="text-base sm:text-lg font-black text-amber-200 tracking-wide">
                  ระบบบริหารจัดการการลา
                </h1>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{stationConfig.stationName}</span>
                  <span className="text-[10px] text-amber-300 font-normal">
                    {stationConfig.stationNameEn}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Current Date/Time + Notification + User Profile Badge + Logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Requirement 10: ทำให้เป็นวันที่ เวลา ณ ปัจจุบัน */}
            <div className="hidden md:flex flex-col items-end text-right bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-xs text-amber-200 font-bold font-mono">
                📅 {currentDateTime.dateStr}
              </span>
              <span className="text-[11px] text-stone-200 font-mono">
                🕒 เวลา {currentDateTime.timeStr}
              </span>
            </div>

            {/* Requirement 17: ทำให้ตรงการแจ้งเตือนกดดูได้ */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
                title="การแจ้งเตือนคำขอลา"
              >
                <Bell className="w-5 h-5 text-amber-300" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black animate-pulse shadow-sm">
                    {pendingCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <NotificationDropdown
                  leaveRequests={leaveRequests}
                  onSelectRequest={(req) => setSelectedRequestForDetail(req)}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>

            {/* User Profile Badge (Clickable to switch user) */}
            <div 
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/10 cursor-pointer transition-colors"
              title="คลิกเพื่อสลับผู้ใช้งาน"
            >
              <div className="w-8 h-8 rounded-full bg-amber-400 text-red-950 flex items-center justify-center font-black text-xs shadow-xs">
                {currentUser.rank.slice(0, 2)}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{currentUser.rank} {currentUser.firstName} {currentUser.lastName}</span>
                  <ChevronDown className="w-3 h-3 text-amber-300" />
                </div>
                <div className="text-[10px] text-amber-300">
                  {currentUser.callsign} • {currentUser.role === 'commander' ? 'ผู้กำกับการ' : currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : currentUser.role === 'supervisor' ? 'หัวหน้างาน' : 'บุคลากร'}
                </div>
              </div>
            </div>

            {/* Switch User Button */}
            <button
              onClick={() => setShowLoginModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white rounded-xl text-xs font-bold border border-white/10 transition-colors cursor-pointer"
              title="สลับผู้ใช้งาน"
            >
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>สลับบัญชี</span>
            </button>

            {/* Requirement 11: แก้ไขให้กดออกจากระบบได้ (Direct and reliable, no blocking confirm dialog) */}
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-900/90 hover:bg-rose-800 text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold border border-rose-600/50 cursor-pointer shadow-sm active:scale-95"
              title="ออกจากระบบทันที (Logout)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>

          </div>

        </div>
      </header>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar matching FE3E0305 Mockup */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-stone-900 text-stone-200 shadow-xl flex flex-col justify-between transition-transform duration-300 no-print
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          
          <div className="p-4 space-y-6 overflow-y-auto">
            {/* Station Slogan Card */}
            <div className="p-3 bg-red-950/60 rounded-2xl border border-red-900/40 text-center space-y-1">
              <span className="text-[11px] text-amber-300 font-bold block">
                สภ.ศรีสงคราม ภ.จว.นครพนม
              </span>
              <p className="text-[10px] text-stone-300 italic">
                "รับใช้ประชาชน ด้วยใจ จริงใจ และภักดี"
              </p>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1 text-xs sm:text-sm">
              <button
                onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-400 text-stone-950 shadow-md'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard ภาพรวม</span>
              </button>

              <button
                onClick={() => setShowSubmissionModal(true)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-red-800 to-rose-900 hover:from-red-700 hover:to-rose-800 text-white shadow-md transition-all mt-2 mb-2"
              >
                <FileEdit className="w-4 h-4 text-amber-300" />
                <span>ยื่นใบลาออนไลน์</span>
              </button>

              <button
                onClick={() => { setActiveTab('inbox'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-colors ${
                  activeTab === 'inbox'
                    ? 'bg-amber-400 text-stone-950 shadow-md'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Inbox className="w-4 h-4" />
                  <span>อนุมัติการลา</span>
                </div>
                {pendingCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === 'inbox' ? 'bg-red-900 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {pendingCount}
                  </span>
                )}
              </button>

              {/* Requirement 21 & Personnel management (Admin/Commander/Supervisor) */}
              {(currentUser.role === 'admin' || currentUser.role === 'commander' || currentUser.role === 'supervisor') && (
                <button
                  onClick={() => { setActiveTab('personnel'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-colors ${
                    activeTab === 'personnel'
                      ? 'bg-amber-400 text-stone-950 shadow-md'
                      : 'text-stone-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>ข้อมูลบุคลากร ({personnelList.length})</span>
                </button>
              )}

              {/* Requirement 13 & 15: แผงการลาข้าราชการตำรวจ สภ.ศรีสงคราม */}
              <button
                onClick={() => { setActiveTab('roster'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-colors ${
                  activeTab === 'roster'
                    ? 'bg-amber-400 text-stone-950 shadow-md'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>แผงการลารายเดือน (ทะเบียนคุม)</span>
              </button>

              <button
                onClick={() => { setActiveTab('calendar'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-colors ${
                  activeTab === 'calendar'
                    ? 'bg-amber-400 text-stone-950 shadow-md'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>ปฏิทินการลา</span>
              </button>

              <button
                onClick={() => { setActiveTab('reports'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-colors ${
                  activeTab === 'reports'
                    ? 'bg-amber-400 text-stone-950 shadow-md'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>สถิติและรายงาน</span>
              </button>

              <button
                onClick={() => { setActiveTab('history'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-colors ${
                  activeTab === 'history'
                    ? 'bg-amber-400 text-stone-950 shadow-md'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>ประวัติการลา</span>
              </button>
            </nav>

            {/* System Utilities */}
            <div className="pt-4 border-t border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider px-3 block">
                การจัดการและระบบ
              </span>

              {/* Requirement 18 & 64: ตั้งค่าระบบ */}
              {(currentUser.role === 'admin' || currentUser.role === 'commander') && (
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-stone-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>ตั้งค่าระบบ & เบอร์โทร</span>
                </button>
              )}

              {/* Requirement 41: วันหยุดราชการ */}
              <button
                onClick={() => setShowHolidaysModal(true)}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-stone-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>วันหยุดราชการ</span>
              </button>

              {/* Requirement 34: Audit Log */}
              {(currentUser.role === 'admin' || currentUser.role === 'commander') && (
                <button
                  onClick={() => setShowAuditModal(true)}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-stone-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>บันทึกการใช้งาน (Audit Log)</span>
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Footer with quick Switch Account & Logout */}
          <div className="p-4 bg-stone-950/80 border-t border-stone-800 text-[11px] text-stone-400 space-y-2.5">
            <div className="flex items-center justify-between">
              <span>ปีงบประมาณ:</span>
              <span className="font-mono font-bold text-amber-300">{stationConfig.currentFiscalYear}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>เบอร์สถานี:</span>
              <span className="font-mono text-stone-300">{stationConfig.phone}</span>
            </div>

            <div className="pt-2 border-t border-stone-800/80 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowLoginModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="py-1.5 px-2 bg-white/10 hover:bg-white/20 text-amber-200 rounded-lg text-center font-bold text-[11px] transition-colors"
              >
                สลับบัญชี
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="py-1.5 px-2 bg-rose-900/80 hover:bg-rose-800 text-white rounded-lg text-center font-bold text-[11px] transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>

        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          
          {/* Active View Router */}
          {activeTab === 'dashboard' && (
            <Dashboard
              allPersonnel={personnelList}
              leaveRequests={leaveRequests}
              stationConfig={stationConfig}
              currentUser={currentUser}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectRequest={(req) => setSelectedRequestForDetail(req)}
            />
          )}

          {activeTab === 'inbox' && (
            <ApprovalInbox
              leaveRequests={leaveRequests}
              currentUser={currentUser}
              stationConfig={stationConfig}
              onApprove={handleApproveLeave}
              onReject={handleRejectLeave}
              onCancel={handleCancelLeave}
            />
          )}

          {activeTab === 'personnel' && (
            <PersonnelManagement
              personnelList={personnelList}
              onAddPersonnel={handleAddPersonnel}
              onUpdatePersonnel={handleUpdatePersonnel}
              onDeletePersonnel={handleDeletePersonnel}
            />
          )}

          {activeTab === 'roster' && (
            <MonthlyRoster
              personnelList={personnelList}
              leaveRequests={leaveRequests}
              stationConfig={stationConfig}
            />
          )}

          {activeTab === 'calendar' && (
            <LeaveCalendar
              leaveRequests={leaveRequests}
              holidays={holidays}
              stationConfig={stationConfig}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsAnalytics
              allPersonnel={personnelList}
              leaveRequests={leaveRequests}
              stationConfig={stationConfig}
            />
          )}

          {activeTab === 'history' && (
            <LeaveHistory
              leaveRequests={leaveRequests}
              currentUser={currentUser}
              stationConfig={stationConfig}
              onCancelRequest={handleCancelLeave}
            />
          )}

        </main>

      </div>

      {/* Floating Action Button (FAB) for Quick Leave Submission on Mobile */}
      <div className="lg:hidden fixed bottom-5 right-5 z-20 no-print">
        <button
          onClick={() => setShowSubmissionModal(true)}
          className="p-4 bg-red-900 text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-amber-300 active:scale-95"
          title="ยื่นใบลาออนไลน์"
        >
          <FileEdit className="w-6 h-6" />
        </button>
      </div>

      {/* MODALS */}
      {/* 1. Leave Submission Modal */}
      {showSubmissionModal && (
        <LeaveSubmissionModal
          currentUser={currentUser}
          existingRequests={leaveRequests}
          stationConfig={stationConfig}
          holidays={holidays}
          onSubmit={handleCreateLeaveRequest}
          onClose={() => setShowSubmissionModal(false)}
        />
      )}

      {/* 2. Leave Detail Modal */}
      {selectedRequestForDetail && (
        <LeaveDetailModal
          request={selectedRequestForDetail}
          currentUser={currentUser}
          stationConfig={stationConfig}
          onClose={() => setSelectedRequestForDetail(null)}
          onApprove={handleApproveLeave}
          onReject={handleRejectLeave}
          onCancel={handleCancelLeave}
        />
      )}

      {/* 3. Settings Modal (Requirement 18) */}
      {showSettingsModal && (
        <SettingsModal
          stationConfig={stationConfig}
          allPersonnel={personnelList}
          onSaveConfig={(updated) => {
            setStationConfig(updated);
            addAuditLog('UPDATE', 'CONFIG', 'station', 'ปรับปรุงการตั้งค่าสถานีตำรวจและเบอร์โทรศัพท์');
          }}
          onBackup={handleBackup}
          onRestore={handleRestore}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* 4. First Login Change Password Modal (Requirement 30) */}
      {showFirstLoginModal && (
        <FirstLoginChangePasswordModal
          currentUser={currentUser}
          onUpdatePassword={handleFirstLoginPasswordChange}
          onClose={() => setShowFirstLoginModal(false)}
        />
      )}

      {/* 5. Audit Log Modal (Requirement 34) */}
      {showAuditModal && (
        <AuditLogModal
          logs={auditLogs}
          onClose={() => setShowAuditModal(false)}
        />
      )}

      {/* 6. Holidays Modal (Requirement 41) */}
      {showHolidaysModal && (
        <HolidaysModal
          holidays={holidays}
          onAddHoliday={(h) => {
            setHolidays(prev => [...prev, h]);
            addAuditLog('CREATE', 'CONFIG', h.id, `เพิ่มวันหยุดราชการ: ${h.name} (${h.date})`);
          }}
          onDeleteHoliday={(id) => {
            const h = holidays.find(item => item.id === id);
            setHolidays(prev => prev.filter(item => item.id !== id));
            addAuditLog('DELETE', 'CONFIG', id, `ลบวันหยุด: ${h?.name || ''}`);
          }}
          onClose={() => setShowHolidaysModal(false)}
        />
      )}

      {/* 7. Switch User / Login Modal */}
      {showLoginModal && (
        <LoginModal
          personnelList={personnelList}
          onLoginSuccess={handleLoginSuccess}
          onUpdatePersonnel={handleUpdatePersonnel}
          onClose={() => setShowLoginModal(false)}
        />
      )}

    </div>
  );
}
