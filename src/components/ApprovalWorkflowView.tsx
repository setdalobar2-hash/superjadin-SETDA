import React, { useState } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  Send,
  Bell,
  Clock,
  Copy,
  Check,
  Eye,
  UserCheck,
  MessageSquare,
} from 'lucide-react';
import { PerjadinRecord, ApprovalStage, UserRole, AppNotification } from '../types';
import {
  calcRecordGrandTotal,
  formatRupiah,
  formatTanggalIndo,
  ROLE_LABELS,
  STAGE_META,
} from '../utils/formatters';

interface ApprovalWorkflowViewProps {
  records: PerjadinRecord[];
  notifications: AppNotification[];
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onTransitionStage: (recordId: string, toStage: ApprovalStage, note: string) => void;
  onMarkNotificationRead: (notifId: string) => void;
  onMarkAllRead: () => void;
  onOpenPreview: (recordId: string) => void;
}

const STAGE_ORDER: ApprovalStage[] = [
  'DRAFT',
  'DIAJUKAN',
  'TERVERIFIKASI_UMUM',
  'DISETUJUI_BENDAHARA',
  'DISETUJUI_KPA',
];

export const ApprovalWorkflowView: React.FC<ApprovalWorkflowViewProps> = ({
  records,
  notifications,
  currentRole,
  onChangeRole,
  onTransitionStage,
  onMarkNotificationRead,
  onMarkAllRead,
  onOpenPreview,
}) => {
  const [stageFilter, setStageFilter] = useState<'ALL' | ApprovalStage>('ALL');
  const [noteByRecord, setNoteByRecord] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredRecords = records.filter((r) => (stageFilter === 'ALL' ? true : r.status === stageFilter));

  const buildWhatsappTemplate = (r: PerjadinRecord) => {
    const total = calcRecordGrandTotal(r);
    const meta = STAGE_META[r.status];
    return [
      `*NOTIFIKASI ADMINISTRASI PERJALANAN DINAS*`,
      `Bagian Umum Sekretariat Daerah Kab. Lombok Barat`,
      `----------------------------------------`,
      `Kode Arsip : ${r.kodeArsip}`,
      `No. BKU    : ${r.noBku}`,
      `Pelaksana  : ${r.pejabat.penerimaUangNama} (${r.pelaksana.length} orang)`,
      `Tujuan     : ${r.lokasiTujuan}`,
      `Tanggal    : ${formatTanggalIndo(r.tanggalMulai)} s.d. ${formatTanggalIndo(r.tanggalSelesai)}`,
      `Total Biaya: ${formatRupiah(total, true)}`,
      `Status Saat Ini: *${meta.label}*`,
      ``,
      `Mohon tindak lanjut pada aplikasi SIPERJADIN Setda Kab. Lombok Barat.`,
    ].join('\n');
  };

  const handleCopyMessage = (r: PerjadinRecord) => {
    const text = buildWhatsappTemplate(r);
    navigator.clipboard?.writeText(text);
    setCopiedId(r.id);
    setTimeout(() => setCopiedId((prev) => (prev === r.id ? null : prev)), 2500);
  };

  const canActOnStage = (stage: ApprovalStage): { canApprove: boolean; nextLabel?: string; nextStage?: ApprovalStage; canReject: boolean } => {
    if (stage === 'DRAFT' || stage === 'REVISI') {
      return {
        canApprove: currentRole === 'STAF_PENGAJU',
        nextLabel: 'Ajukan ke Verifikator Bagian Umum',
        nextStage: 'DIAJUKAN',
        canReject: false,
      };
    }
    if (stage === 'DIAJUKAN') {
      return {
        canApprove: currentRole === 'VERIFIKATOR_UMUM',
        nextLabel: 'Verifikasi Kelengkapan & Teruskan ke Bendahara',
        nextStage: 'TERVERIFIKASI_UMUM',
        canReject: currentRole === 'VERIFIKATOR_UMUM',
      };
    }
    if (stage === 'TERVERIFIKASI_UMUM') {
      return {
        canApprove: currentRole === 'BENDAHARA',
        nextLabel: 'Setujui Pencairan (Bendahara) → PA/KPA',
        nextStage: 'DISETUJUI_BENDAHARA',
        canReject: currentRole === 'BENDAHARA',
      };
    }
    if (stage === 'DISETUJUI_BENDAHARA') {
      return {
        canApprove: currentRole === 'PA_KPA',
        nextLabel: 'Sahkan & Setujui Final (PA/KPA)',
        nextStage: 'DISETUJUI_KPA',
        canReject: currentRole === 'PA_KPA',
      };
    }
    return { canApprove: false, canReject: false };
  };

  return (
    <div className="space-y-5">
      {/* Role Simulator & Stage Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Alur Persetujuan Dokumen & Notifikasi Otomatis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Setiap perpindahan tahapan persetujuan otomatis menerbitkan notifikasi ke pejabat penanggung jawab berikutnya dan mencatat riwayat audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-sky-700 shrink-0" />
          <span className="text-xs font-semibold text-slate-600">Peran Aktif:</span>
          <select
            value={currentRole}
            onChange={(e) => onChangeRole(e.target.value as UserRole)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-900 cursor-pointer"
          >
            {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role].label} ({ROLE_LABELS[role].officerName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stage Pipeline Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          onClick={() => setStageFilter('ALL')}
          className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
            stageFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] opacity-80">Semua Tahapan</div>
          <div className="text-lg font-bold tabular-nums mt-0.5">{records.length}</div>
        </button>

        {(['DRAFT', 'DIAJUKAN', 'TERVERIFIKASI_UMUM', 'DISETUJUI_BENDAHARA', 'DISETUJUI_KPA'] as ApprovalStage[]).map(
          (st) => {
            const count = records.filter((r) => r.status === st).length;
            const active = stageFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStageFilter(st)}
                className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                  active
                    ? 'bg-sky-700 text-white border-sky-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-[11px] opacity-80 truncate">{STAGE_META[st].shortLabel}</div>
                <div className="text-lg font-bold tabular-nums mt-0.5">{count}</div>
              </button>
            );
          }
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        {/* Left: Documents Workflow Cards */}
        <div className="xl:col-span-2 space-y-4">
          {filteredRecords.map((r) => {
            const grandTotal = calcRecordGrandTotal(r);
            const meta = STAGE_META[r.status];
            const actionState = canActOnStage(r.status);
            const activeIdx = STAGE_ORDER.indexOf(r.status);

            return (
              <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-900">{r.kodeArsip}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono text-slate-500">BKU: {r.noBku}</span>
                      <span className="text-slate-300">·</span>
                      <span className={`font-semibold ${meta.textClass}`}>{meta.label}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{r.uraianTugas}</h3>
                    <div className="text-xs text-slate-500 mt-1">
                      {r.pejabat.penerimaUangNama} ({r.pelaksana.length} pelaksana) · {r.lokasiTujuan} ·{' '}
                      {formatTanggalIndo(r.tanggalMulai)} s.d. {formatTanggalIndo(r.tanggalSelesai)}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-sky-700 tabular-nums">{formatRupiah(grandTotal, true)}</div>
                    <div className="text-[11px] text-slate-500">
                      {r.shsVersion === 'NEW_2026' ? 'NEW SHS 2026' : 'OLD SHS 2026'} · KOP {r.laporanSppd.kopType}
                    </div>
                  </div>
                </div>

                {/* Progress Bar Stepper */}
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {STAGE_ORDER.map((step, i) => {
                    const isDone = r.status !== 'REVISI' && activeIdx >= i;
                    const isCurrent = r.status === step;
                    return (
                      <div key={step} className="space-y-1">
                        <div
                          className={`h-1.5 rounded-sm ${
                            r.status === 'REVISI' && i === 0
                              ? 'bg-rose-500'
                              : isDone
                              ? 'bg-sky-700'
                              : 'bg-slate-200'
                          }`}
                        />
                        <div
                          className={`text-[10px] leading-tight truncate ${
                            isCurrent ? 'font-bold text-sky-800' : isDone ? 'text-slate-700' : 'text-slate-400'
                          }`}
                        >
                          {i + 1}. {STAGE_META[step].shortLabel}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2.5">
                  {(actionState.canApprove || actionState.canReject) && (
                    <input
                      type="text"
                      value={noteByRecord[r.id] || ''}
                      onChange={(e) => setNoteByRecord((prev) => ({ ...prev, [r.id]: e.target.value }))}
                      placeholder="Tambahkan catatan verifikasi / persetujuan / alasan revisi (opsional)..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-sky-600"
                    />
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {actionState.canApprove && actionState.nextStage ? (
                        <button
                          onClick={() => {
                            onTransitionStage(
                              r.id,
                              actionState.nextStage!,
                              noteByRecord[r.id] || `Disetujui oleh ${ROLE_LABELS[currentRole].officerName}`
                            );
                            setNoteByRecord((prev) => ({ ...prev, [r.id]: '' }));
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          {r.status === 'DRAFT' || r.status === 'REVISI' ? (
                            <Send className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          {actionState.nextLabel}
                        </button>
                      ) : r.status === 'DISETUJUI_KPA' ? (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Seluruh tahapan persetujuan selesai (Lunas / Siap Arsip)
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">
                          Menunggu tindakan: <span className="font-semibold">{ROLE_LABELS[meta.responsibleRole].label}</span>
                        </span>
                      )}

                      {actionState.canReject && (
                        <button
                          onClick={() => {
                            onTransitionStage(
                              r.id,
                              'REVISI',
                              noteByRecord[r.id] || 'Mohon lengkapi atau perbaiki rincian berkas SPPD.'
                            );
                            setNoteByRecord((prev) => ({ ...prev, [r.id]: '' }));
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Kembalikan Revisi
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyMessage(r)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer"
                        title="Salin format pesan notifikasi WhatsApp / Email"
                      >
                        {copiedId === r.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Salin Notif WA</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onOpenPreview(r.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-lg cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat Dokumen
                      </button>
                    </div>
                  </div>
                </div>

                {/* Audit History */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Riwayat Tahapan Persetujuan
                  </div>
                  <div className="space-y-1.5">
                    {r.history
                      .slice()
                      .reverse()
                      .map((h) => (
                        <div key={h.id} className="text-xs flex flex-wrap items-baseline justify-between gap-2 text-slate-600">
                          <div>
                            <span className="font-semibold text-slate-800">{STAGE_META[h.toStage].shortLabel}</span>
                            {' — '}
                            <span>{h.actorName}</span>
                            {h.note && <span className="text-slate-500"> · &ldquo;{h.note}&rdquo;</span>}
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">
                            {new Date(h.timestamp).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Automatic Notification Feed */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-700" />
              <h3 className="text-sm font-bold text-slate-900">Pusat Notifikasi Otomatis</h3>
            </div>
            {notifications.some((n) => !n.read) && (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] font-semibold text-sky-700 hover:underline cursor-pointer"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkNotificationRead(n.id)}
                className={`p-3 rounded-lg border text-xs transition-colors cursor-pointer ${
                  n.read ? 'bg-white border-slate-200 text-slate-600' : 'bg-sky-50/70 border-sky-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-900">{n.title}</span>
                  {!n.read && <span className="text-[10px] font-bold text-sky-700">BARU</span>}
                </div>
                <p className="text-[11.5px] leading-relaxed">{n.message}</p>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                  <span>
                    Target: {n.targetRole === 'ALL' ? 'Semua Pihak' : ROLE_LABELS[n.targetRole].label}
                  </span>
                  <span className="font-mono">{new Date(n.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">Belum ada notifikasi persetujuan.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
