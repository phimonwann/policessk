import React from 'react';
import { AuditLogItem } from '../types/leave';
import { ShieldCheck, X, FileText, CheckCircle2, User, Ban, RefreshCw } from 'lucide-react';

interface AuditLogModalProps {
  logs: AuditLogItem[];
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ logs, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-red-900/20">
        
        <div className="bg-gradient-to-r from-red-900 via-rose-950 to-red-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">บันทึกประวัติการใช้งานระบบ (System Audit Log)</h3>
              <p className="text-xs text-red-200">
                สถานีตำรวจภูธรศรีสงคราม • บันทึกการเพิ่ม แก้ไข ลบ อนุมัติ หรือยกเลิกข้อมูลทั้งหมด
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

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center p-8 text-stone-400">ยังไม่มีบันทึกประวัติการใช้งาน</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-3 text-xs">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    log.action === 'APPROVE' ? 'bg-emerald-100 text-emerald-800' :
                    log.action === 'REJECT' || log.action === 'DELETE' ? 'bg-rose-100 text-rose-800' :
                    log.action === 'CANCEL' ? 'bg-stone-200 text-stone-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {log.action === 'APPROVE' && <CheckCircle2 className="w-4 h-4" />}
                    {log.action === 'CANCEL' && <Ban className="w-4 h-4" />}
                    {log.action === 'LOGIN' && <User className="w-4 h-4" />}
                    {log.action === 'CREATE' && <FileText className="w-4 h-4" />}
                    {log.action === 'UPDATE' && <RefreshCw className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{log.userName}</span>
                      <span className="text-[11px] font-mono text-stone-400">{log.timestamp}</span>
                    </div>
                    <p className="text-stone-700 mt-0.5">{log.details}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-stone-500 font-mono">
                      <span>Action: {log.action}</span>
                      <span>Target: {log.targetType} ({log.targetId})</span>
                    </div>
                  </div>
                </div>
              ))
            )}
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
